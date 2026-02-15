const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password cannot exceed 30 characters'
        }),
    role: Joi.string()
        .valid('customer', 'seller', 'admin')
        .default('seller')
        .messages({
            'any.only': 'Invalid role selected'
        })
});

const validateRegister = (req, res, next) => {
    const {
        error
    } = registerSchema.validate(req.body, {
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

module.exports = validateRegister;