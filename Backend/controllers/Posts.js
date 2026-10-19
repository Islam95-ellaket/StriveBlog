import mongoose from 'mongoose';
import Post from './../modules/Post.js';
import Author from '../modules/Author.js';
import PostNotFound from '../exceptions/posts/PostsNotFound.js';
import AuthorNotFound from '../exceptions/authors/AuthorNotFound.js';

//LEGGI TUTTI I POST
export const getAllPosts = async (req, res, next) => {
    try {
        const { title } = req.query;
        let query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        const posts = await Post.find(query)
            .populate('author', 'name surname avatar')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name avatar',
                },
            });

        res.status(200).json(posts);
    } catch (error) {
        console.error('ERRORE:', error);
        next(error);
    }
};
//
export const getPostsByAuthor = async (req, res, next) => {
    try {
        const { authorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(authorId)) {
            throw new PostNotFound();
        }

        const author = await Author.findById(authorId);

        if (!author) {
            throw new AuthorNotFound();
        }

        const posts = await Post.find({ author: authorId }).populate(
            'author',
            'name avatar',
        );

        res.status(200).json(posts);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

export const createPosts = async (req, res, next) => {
    try {
        const { category, title, cover, readTime, content } = req.body;

        const post = new Post({
            category,
            title,
            cover,
            readTime,
            author: req.author,
            content,
        });

        const savePost = await post.save();

        await Author.findByIdAndUpdate(savePost.author, {
            $push: {
                posts: savePost._id,
            },
        });

        res.status(201).json(savePost);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

export const getPostById = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostNotFound();
        }

        const post = await Post.findById(postId)
            .populate('author', 'name surname email avatar')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name avatar',
                },
            });

        if (!post) {
            throw new PostNotFound();
        }
        res.status(200).json(post);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

export const upDatePost = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { category, title, cover, readTime, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostNotFound();
        }
        const PostUpDate = await Post.findByIdAndUpdate(
            postId,
            { category, title, cover, readTime, content },
            { returnDocument: 'after', runValidators: true },
        );
        if (!PostUpDate) {
            throw new PostNotFound();
        }
        res.status(200).json(PostUpDate);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            throw new PostNotFound();
        }
        const postDelete = await Post.findByIdAndDelete(postId);

        if (!postDelete) {
            throw new PostNotFound();
        }

        await Author.findByIdAndUpdate(postDelete.author, {
            $pull: {
                posts: postDelete._id,
            },
        });

        res.status(200).json(postDelete);
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};

export const uploadCover = async (req, res, next) => {
    try {
        const { postId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                message: 'file non caricato',
            });
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            { cover: req.file.path },
            { returnDocument: 'after' },
        );

        if (!post) {
            throw new PostNotFound();
        }

        res.status(200).json({
            status: 'success',
            message: 'file caricato con successo',
            post,
        });
    } catch (error) {
        console.log('ERRORE:', error);
        next(error);
    }
};
