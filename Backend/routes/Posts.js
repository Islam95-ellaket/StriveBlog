import express from 'express';
import uploadImg from '../middlewares/cloudinary.js';
import {
    getAllPosts,
    createPosts,
    getPostById,
    upDatePost,
    deletePost,
    uploadCover,
} from './../controllers/Posts.js';
import {
    getCommentsByPostId,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
} from '../controllers/Comments.js';
import {
    validatePostBody,
    validatePostUpdateBody,
    validatePost,
} from '../middlewares/posts/validatePostBody.js';

const PostRouter = express.Router();

//rotte per i post

PostRouter.patch('/:postId/cover', uploadImg.single('cover'), uploadCover);
PostRouter.get('/', getAllPosts);
PostRouter.post('/', [validatePostBody, validatePost], createPosts);
PostRouter.get('/:postId', getPostById);
PostRouter.put('/:postId', [validatePostUpdateBody, validatePost] ,upDatePost);
PostRouter.delete('/:postId', deletePost);

//rotte per i commenti

PostRouter.get('/:postId/comments', getCommentsByPostId);
PostRouter.get('/:postId/comments/:commentId', getCommentById);
PostRouter.post('/:postId/comments', createComment);
PostRouter.put('/:postId/comments/:commentId', updateComment);
PostRouter.delete('/:postId/comments/:commentId', deleteComment);

export default PostRouter;
