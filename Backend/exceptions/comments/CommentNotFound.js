import httpError from '../index.js';

class CommentNotFound extends httpError {
    constructor(
        message = 'Comment not found',
        statusCode = 404,
        error = 'The requested comment does not exist',
    ) {
        super(message, statusCode, error);
    }
}

export default CommentNotFound;
