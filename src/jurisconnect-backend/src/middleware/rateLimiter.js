const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Muitas requisições. Tente novamente mais tarde.',
            code: 'RATE_LIMIT_EXCEEDED',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
        xForwardedForHeader: false,
    },
});

module.exports = limiter;
