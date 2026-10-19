import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import Author from "../modules/Author.js"
import jwt from 'jsonwebtoken'

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let author = await Author.findOne({
                googleId: profile.id
            })

            if (!author) {
                author = new Author({
                    name: profile.name?.givenName || "Utente",
                    surname: profile.name?.familyName || "Google",
                    email: profile.emails[0].value, 
                    googleId: profile.id
                })

                await author.save()
            }
            const token = jwt.sign({
                id: author._id
            }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIREIN
            })

            done(null, {
                token
            })

        } catch (e) {
            done(e)
        }
    }
)

export default googleStrategy