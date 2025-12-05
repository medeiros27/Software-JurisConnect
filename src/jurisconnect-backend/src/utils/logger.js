const winston = require('winston');
const path = require('path');

/**
 * Structured Logger using Winston
 * Replaces console.log with proper logging levels and formatting
 */

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add stack trace for errors
    if (stack) {
        msg += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    defaultMeta: { service: 'jurisconnect-backend' },
    transports: [
        // Console output
        new winston.transports.Console({
            format: combine(
                colorize(),
                logFormat
            )
        }),

        // File output - errors
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),

        // File output - combined
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Development-specific logging
if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            printf(({ level, message, timestamp }) => {
                return `${timestamp} ${level}: ${message}`;
            })
        )
    }));
}

// Helper methods for common logging patterns
logger.logRequest = (req, res, duration) => {
    const { method, url, ip } = req;
    const { statusCode } = res;

    const level = statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${method} ${url}`, {
        statusCode,
        duration: `${duration}ms`,
        ip,
        userAgent: req.get('User-Agent'),
    });
};

logger.logError = (error, context = {}) => {
    logger.error(error.message, {
        ...context,
        stack: error.stack,
        code: error.code,
    });
};

logger.logDbQuery = (query, duration) => {
    if (process.env.LOG_QUERIES === 'true') {
        logger.debug(`DB Query [${duration}ms]: ${query}`);
    }
};

module.exports = logger;
