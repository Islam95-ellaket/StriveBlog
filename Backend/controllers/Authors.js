import Author from './../modules/Author.js';
import sendGrid from '@sendgrid/mail';
import AuthorNotFound from '../exceptions/authors/AuthorNotFound.js';
import bcrypt from 'bcrypt';

//LEGGI TUTTI GLI AUTORI
export const getAllAuthors = async (req, res, next) => {
    try {
        const authors = await Author.find().populate(
            'posts',
            'category title content',
        );

        res.status(200).json(authors);
    } catch (error) {
        console.error('ERRORE getAllAuthors:', error);
        next(error);
    }
};
//CREA UN AUTORE
export const createAuthors = async (req, res, next) => {
    const { name, surname, email, password, dob, avatar } = req.body;

    try {

        const author = new Author({
            name,
            surname,
            email,
            password,
            dob,
            avatar
        });
        const saveAuthor = await author.save();
        sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: saveAuthor.email,
            from: 'ellaket.islam95@gmail.com',
            subject: 'Benvenuto su StriveBlog',
            text: 'Ti sei registrato',
            html: `
        <h1>Benvenuto su StriveBlog</h1>
        <p>Ti sei registrato con successo</p>
    `,
        };

        const [response] = await sendGrid.send(msg);
        console.log('status', response.statusCode);

        const authorSafe = saveAuthor.toObject();
        delete authorSafe.password;

        res.status(201).json(authorSafe);

    } catch (error) {
        console.error('ERRORE createAuthors:', error);
        next(error);
    }
};
//LEGGI UN AUTORE
export const getAuthorById = async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const author = await Author.findById(authorId);
        if (!author) {
            throw new AuthorNotFound();
        }

        res.status(200).json(author);
    } catch (error) {
        console.error('ERRORE getAuthorById:', error);
        next(error);
    }
};
// MODIFICA UN AUTORE
export const upDateAuthor = async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const { name, surname, email, dob, avatar } = req.body;

        const authorUpDate = await Author.findByIdAndUpdate(
            authorId,
            { name, surname, email, dob, avatar },
            { returnDocument: 'after', runValidators: true },
        );
        if (!authorUpDate) {
            throw new AuthorNotFound();
        }

        res.status(200).json(authorUpDate);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};
// ELIMINA UN AUTORE
export const deleteAuthor = async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const authorDelete = await Author.findByIdAndDelete(authorId);

        if (!authorDelete) {
            throw new AuthorNotFound();
        }

        res.status(200).json(authorDelete);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

// MODIFICA PARZIALMENTE UN AUTORE
export const patchAuthor = async (req, res, next) => {
    try {
        const { authorId } = req.params;
        const { name, surname, email, dob, avatar, password } = req.body;

        const update = { name, surname, email, dob, avatar };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(password, salt);
        }

        const author = await Author.findByIdAndUpdate(authorId, update, {
            new: true,
            runValidators: true,
        });

        if (!author) {
            throw new AuthorNotFound();
        }

        res.status(200).json(author);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

// CARICA AVATAR AUTORE
export const uploadAvatar = async (req, res, next) => {
    try {
        const { authorId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                message: 'file non caricato',
            });
        }

        const author = await Author.findByIdAndUpdate(
            authorId,
            { avatar: req.file.path },
            { returnDocument: 'after' },
        );

        if (!author) {
            throw new AuthorNotFound();
        }

        res.status(200).json({
            status: 'success',
            message: 'file caricato con successo',
            author,
        });
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};
