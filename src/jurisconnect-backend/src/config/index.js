const configValidator = require('./validator');

/**
 * Centralized Configuration
 * Validates and exports all application configuration
 */

// Run validation on module load
configValidator.validate();

// Export validated configuration with additional structure for compatibility
const validatedConfig = configValidator.getConfig();

module.exports = {
    ...validatedConfig,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
    port: validatedConfig.app.port || 3001,
};
