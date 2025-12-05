const AppError = require('../utils/AppError');

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            console.error('Validation Error Details:', JSON.stringify(errors, null, 2));

            throw new AppError('Erro de validação', 400, 'VALIDATION_ERROR', errors);
        }

        req.body = value;
        next();
    };
};

module.exports = validate;
