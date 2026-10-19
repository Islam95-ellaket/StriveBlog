import mongoose from 'mongoose';
import Comment from '../modules/Comment.js';
import Post from '../modules/Post.js';
import Author from '../modules/Author.js';
import PostsNotFound from '../exceptions/posts/PostsNotFound.js';
import CommentNotFound from '../exceptions/comments/CommentNotFound.js';

//LEGGI I COMMENTI DI UN POST
export const getCommentsByPostId = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostsNotFound();
        }

        const post = await Post.findById(postId);

        if (!post) {
            throw new PostsNotFound();
        }

        const comments = await Comment.find({ post: postId }).populate(
            'author',
            'name avatar',
        );

        res.status(200).json(comments);
    } catch (error) {
        console.error('ERRORE:', error);
        next(error);
    }
};

//CREA UN COMMENTO
export const createComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostsNotFound();
        }

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        if (!req.author) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const post = await Post.findById(postId);

        if (!post) {
            throw new PostsNotFound();
        }

        const comment = new Comment({
            content,
            author: req.author._id,
            post: postId,
        });

        const saveComment = await comment.save();

        await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: saveComment._id,
            },
        });

        await saveComment.populate('author', 'name avatar');

        res.status(201).json(saveComment);
    } catch (error) {
        console.error('ERRORE:', error);
        next(error);
    }
};

//ELIMINA UN COMMENTO
export const deleteComment = async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostsNotFound();
        }

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            throw new CommentNotFound();
        }

        const commentDelete = await Comment.findByIdAndDelete(commentId);

        if (!commentDelete) {
            throw new CommentNotFound();
        }

        await Post.findByIdAndUpdate(postId, {
            $pull: {
                comments: commentId,
            },
        });

        res.status(200).json(commentDelete);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

//LEGGI UN COMMENTO SPECIFICO DI UN POST
export const getCommentById = async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;

        if ( !mongoose.Types.ObjectId.isValid(postId) ) {
            throw new PostsNotFound();
        }

        if ( !mongoose.Types.ObjectId.isValid(commentId) ) {
            throw new CommentNotFound();
        }

        const post = await Post.findById(postId);

        if (!post) {
            throw new PostsNotFound();
        }

        const comment = await Comment.findOne({
            _id: commentId,
            post: postId,
        }).populate('author', 'name avatar');

        if (!comment) {
            throw new CommentNotFound();
        }

        res.status(200).json(comment);
    } catch (error) {
        console.error('ERRORE:', error);
        next(error);
    }
};

//MODIFICA UN COMMENTO
export const updateComment = async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostsNotFound();
        }

        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            throw new CommentNotFound();
        }

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await Comment.findOneAndUpdate(
            { _id: commentId, post: postId },
            { content },
            { new: true, runValidators: true },
        ).populate('author', 'name avatar');

        if (!comment) {
            throw new CommentNotFound();
        }

        res.status(200).json(comment);
    } catch (error) {
        console.error('ERRORE:', error);
        next(error);
    }
};
