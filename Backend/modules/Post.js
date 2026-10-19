import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        cover: {
            type: String,
            required: false,
        },
        readTime: {
            value: {
                type: Number,
                required: false,
                default: 0,
            },
            unit: {
                type: String,
                required: false,
                default: 'minutes',
            },
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
                default: [],
            },
        ],
    },
    {
        timestamps: true,
        strict: true,
    },
);
const Post = mongoose.model('Post', blogPostSchema);
export default Post;
