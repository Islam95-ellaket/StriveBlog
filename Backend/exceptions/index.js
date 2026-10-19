class httpError extends Error {
    constructor(message, statusCode, error) {
        super(message);

        this.statusCode = statusCode;
        this.error = error;
    }
}

export default httpError;
