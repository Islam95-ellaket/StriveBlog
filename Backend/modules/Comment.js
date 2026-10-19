import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            minlength: 1,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
    },
    {
        timestamps: true,
        strict: true,
    },
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
