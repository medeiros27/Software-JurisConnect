const { ERROR_CODES, HTTP_STATUS } = require('./constants');

/**
 * Custom Error Class
 * Enhanced with error codes, HTTP status, and context
 */
class AppError extends Error {
    constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = ERROR_CODES.INTERNAL_SERVER_ERROR, context = {}) {
        super(message);

        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.context = context;
        this.isOperational = true; // Distinguishes operational errors from programming errors

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            error: {
                message: this.message,
                code: this.code,
                statusCode: this.statusCode,
                ...(process.env.NODE_ENV === 'development' && { context: this.context }),
            },
        };
    }

    // Factory methods for common errors
    static badRequest(message, context = {}) {
        return new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.INVALID_INPUT, context);
    }

    static unauthorized(message = 'Não autorizado', context = {}) {
        return new AppError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_UNAUTHORIZED, context);
    }

    static forbidden(message = 'Acesso negado', context = {}) {
        return new AppError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTH_FORBIDDEN, context);
    }

    static notFound(resource = 'Recurso', context = {}) {
        return new AppError(`${resource} não encontrado`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.RECORD_NOT_FOUND, context);
    }

    static conflict(message, context = {}) {
        return new AppError(message, HTTP_STATUS.CONFLICT, ERROR_CODES.DUPLICATE_ENTRY, context);
    }

    static validation(message, context = {}) {
        return new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, context);
    }

    static database(message, originalError, context = {}) {
        return new AppError(
            message || 'Erro ao acessar banco de dados',
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.DB_QUERY_ERROR,
            { ...context, originalError: originalError?.message }
        );
    }

    static external(service, originalError, context = {}) {
        return new AppError(
            `Erro ao comunicar com serviço externo: ${service}`,
            HTTP_STATUS.SERVICE_UNAVAILABLE,
            ERROR_CODES.EXTERNAL_SERVICE_ERROR,
            { ...context, service, originalError: originalError?.message }
        );
    }
}

module.exports = AppError;
