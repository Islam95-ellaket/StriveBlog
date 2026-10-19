import jwt from 'jsonwebtoken'
import Author from '../modules/Author.js';
import AuthorNotFound from '../exceptions/authors/AuthorNotFound.js';

export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "token is not a valid"
        })
    }

    const jwtToken = authHeader.split(' ')[1]
    jwt.verify(jwtToken, process.env.JWT_SECRET,
        async function (error, payload) {

            if (error) {
                return res.status(401).json({
                    message: "token is not a valid"
                })
            }

            try {
                const { id } = payload
                const author = await Author.findById(id)

                if (!author) {
                    throw new AuthorNotFound();
                }
                req.author = author

                next()

            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        })
}