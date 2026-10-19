import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const authorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
        },
        surname: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            minlength: 8,
            select: false,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        dob: {
            type: Date,
            required: false,
            default: null,
        },
        avatar: {
            type: String,
            required: false,
        },
        posts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Post',
            },
        ],
    },
    {
        timestamps: true,
        strict: true,
    },
);

authorSchema.pre('save', async function () {

    if (!this.password || !this.isModified('password')) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

    } catch (e) {
        console.error(e)
    }
})

const Author = mongoose.model('Author', authorSchema);
export default Author;
