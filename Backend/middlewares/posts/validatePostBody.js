import { body, validationResult } from 'express-validator';

const validatePostBody = [
    body('category').notEmpty().isString().withMessage('Category is required'),
    body('title')
        .notEmpty()
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title must be between 2 and 100 characters'),
    body('cover').optional().isURL().withMessage('Please provide a valid URL'),
    body('content')
        .notEmpty()
        .isString()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    body('readTime.value')
        .optional()
        .isNumeric()
        .withMessage('Read time value must be a number'),
];

const validatePostUpdateBody = [
    body('category')
        .optional()
        .notEmpty()
        .isString()
        .withMessage('Category is required'),
    body('title')
        .optional()
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title must be between 2 and 100 characters'),
    body('cover')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),
    body('content')
        .optional()
        .isString()
        .isLength({ min: 1 })
        .withMessage('Content is required'),
    body('readTime.value')
        .optional()
        .isNumeric()
        .withMessage('Read time value must be a number'),
];

const validatePost = (req, res, next) => {
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

export { validatePostBody, validatePostUpdateBody, validatePost };
