import httpError from '../index.js';

class PostNotFound extends httpError {
    constructor(
        message = 'Post not found',
        statusCode = 404,
        error = 'The requested post does not exist',
    ) {
        super(message, statusCode, error);
    }
}

export default PostNotFound;