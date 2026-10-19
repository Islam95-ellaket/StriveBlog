import mongoose from 'mongoose';
import httpError from '../../exceptions/index.js';

const errorHandler = (error, req, res, next) => {
    if (error instanceof httpError) {
        return res.status(error.statusCode).json({
            statusCode: error.statusCode,
            message: error.message,
            error: error.error,
        });
    }

    if (error instanceof mongoose.Error.CastError) {
        return res.status(400).json({
            statusCode: 400,
            message: 'Invalid ID or malformed request',
            error: error.message,
        });
    }

    if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
            statusCode: 400,
            message:
                'Mongoose Error: one or more passed or required props failed the validation',
            error: error.message,
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            statusCode: 409,
            message: 'Mongoose Error: conflict found with another document',
            error: error.errmsg,
        });
    }

    res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error',
        error: 'An error has occurred, please try again later or contact the administrator',
    });
};

export default errorHandler;
