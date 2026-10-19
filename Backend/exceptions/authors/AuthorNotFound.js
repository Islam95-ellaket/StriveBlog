import httpError from '../index.js';

class AuthorNotFound extends httpError {
    constructor(
        message = 'Author not found',
        statusCode = 404,
        error = 'The requested author does not exist',
    ) {
        super(message, statusCode, error);
    }
}

export default AuthorNotFound;
