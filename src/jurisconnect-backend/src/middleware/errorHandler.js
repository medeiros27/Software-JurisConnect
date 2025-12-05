const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { HTTP_STATUS, ERROR_CODES } = require('../utils/constants');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log do erro (properly serialize)
    logger.error(err.message, {
        stack: err.stack,
        path: req.path,
        method: req.method,
        name: err.name,
        code: err.code,
    });

    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));
        error = new AppError('Erro de validação', 400, 'VALIDATION_ERROR', errors);
    }

    // Sequelize Unique Constraint Error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0].path;
        error = new AppError(
            `${field} já está em uso`,
            400,
            'UNIQUE_CONSTRAINT_ERROR'
        );
    }

    // Sequelize Foreign Key Constraint Error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        error = new AppError(
            'Registro vinculado não existe',
            400,
            'FOREIGN_KEY_ERROR'
        );
    }

    // Database Connection Error
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
        error = new AppError(
            'Erro de conexão com o banco de dados. Verifique se o PostgreSQL está rodando.',
            503,
            'DATABASE_CONNECTION_ERROR'
        );
    }

    // Database Authentication Error
    if (err.name === 'SequelizeAccessDeniedError') {
        error = new AppError(
            'Erro de autenticação no banco de dados. Verifique as credenciais.',
            503,
            'DATABASE_AUTH_ERROR'
        );
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Token inválido', 401, 'INVALID_TOKEN');
    }

    if (err.name === 'TokenExpiredError') {
        error = new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
    }

    // Resposta padrão
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Erro interno do servidor';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: error.code,
            errors: error.errors,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
    });
};

module.exports = errorHandler;
