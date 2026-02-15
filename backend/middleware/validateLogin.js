const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required'
        })
});

const validateLogin = (req, res, next) => {
    const {
        error
    } = loginSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

module.exports = validateLogin;