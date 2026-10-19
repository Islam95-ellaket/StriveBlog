import { body, validationResult } from 'express-validator';

const validateAuthorBody = [
    body('name')
        .notEmpty()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name field cannot be empty'),
    body('surname')
        .notEmpty()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage('Surname field cannot be empty'),
    body('email')
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('dob')
        .optional({ values: 'falsy' }) 
        .isDate()
        .withMessage('Please provide a valid date of birth'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Please provide a valid avatar URL'),
];

const validateAuthorUpdateBody = [
    body('name')
        .optional()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('surname')
        .optional()
        .isString()
        .isLength({ min: 2, max: 50 })
        .withMessage('Surname must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .optional()
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('dob')
        .optional({ values: 'falsy' })
        .isDate()
        .withMessage('Please provide a valid date of birth'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Please provide a valid avatar URL'),
];

const validateAuthor = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            statusCode: 400,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

const validateLoginBody = [
    body('email')
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .isString()
        .withMessage('Password is required'),
];

export { validateAuthorBody,  validateAuthorUpdateBody, validateAuthor, validateLoginBody };
