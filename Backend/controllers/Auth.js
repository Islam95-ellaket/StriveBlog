import Author from '../modules/Author.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

export async function login(req, res) {

    try {
        const { email, password } = req.body

        const author = await Author.findOne({
            email
        })
        .select('+password')

        if (!author || !author.password) {
            return res.status(401).json({
                message: "wrong credentials"
            })
        }

        const result = await bcrypt.compare(password, author.password)

        if (!result) {
            return res.status(401).json({ message: "wrong credentials" })
        }

        const token = jwt.sign({
            id: author._id
        },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIREIN             // 24h solo in fase di sviluppo puoi lo imposteremo a 30min
            }
        );
        res.status(200).json({
            token
        })

    } catch (e) {
        res.status(500).json({ message: "server error" })
    }
}

export async function me(req, res) {
    res.status(200).json(req.author)

}

export async function register(req, res) {
    try {
        const { name, surname, email, password, dob, avatar } = req.body;

        const existing = await Author.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const author = new Author({ name, surname, email, password, dob, avatar });
        const savedAuthor = await author.save();

        const authorSafe =savedAuthor.toObject();
        delete authorSafe.password;

        res.status(201).json(authorSafe);
    } catch (e) {
        console.error('ERRORE register:', e);
        res.status(500).json({ message: 'server error' });
    }
}