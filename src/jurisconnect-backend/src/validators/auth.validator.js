const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email inválido',
        'any.required': 'Email é obrigatório',
    }),
    senha: Joi.string().min(8).required().messages({
        'string.min': 'Senha deve ter no mínimo 8 caracteres',
        'any.required': 'Senha é obrigatória',
    }),
});

const refreshSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token é obrigatório',
    }),
});

module.exports = { loginSchema, refreshSchema };
