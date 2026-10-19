import express from 'express';
import {
    getAllAuthors,
    createAuthors,
    getAuthorById,
    upDateAuthor,
    deleteAuthor,
    patchAuthor,
    uploadAvatar,
} from './../controllers/Authors.js';
import { getPostsByAuthor } from '../controllers/Posts.js';
import uploadImg from '../middlewares/cloudinary.js';
import {
    validateAuthorBody,
    validateAuthorUpdateBody,
    validateAuthor,
} from '../middlewares/authors/validateAuthorBody.js';

const AuthorRouter = express.Router();

AuthorRouter.patch('/:authorId/avatar', uploadImg.single('avatar'), uploadAvatar);
AuthorRouter.get('/', getAllAuthors);
AuthorRouter.post('/', [validateAuthorBody, validateAuthor], createAuthors);
AuthorRouter.get('/:authorId', getAuthorById);
AuthorRouter.put('/:authorId', [validateAuthorUpdateBody, validateAuthor] ,upDateAuthor);
AuthorRouter.patch('/:authorId',[validateAuthorUpdateBody, validateAuthor] ,patchAuthor);
AuthorRouter.delete('/:authorId', deleteAuthor);
AuthorRouter.get('/:authorId/blogPosts', getPostsByAuthor);

export default AuthorRouter;
