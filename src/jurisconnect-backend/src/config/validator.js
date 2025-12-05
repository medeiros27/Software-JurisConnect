const logger = require('../utils/logger');

/**
 * Environment Configuration Validator
 * Validates all required environment variables on startup
 * FAILS FAST if critical variables are missing
 */

const REQUIRED_VARS = {
    // Database
    DB_HOST: { type: 'string', critical: true },
    DB_PORT: { type: 'number', critical: true },
    DB_NAME: { type: 'string', critical: true },
    DB_USER: { type: 'string', critical: true },
    DB_PASSWORD: { type: 'string', critical: true },

    // Supabase (Removed)
    // SUPABASE_URL: { type: 'url', critical: true },
    // SUPABASE_ANON_KEY: { type: 'string', critical: true },
    // SUPABASE_SERVICE_ROLE_KEY: { type: 'string', critical: true },

    // Application
    NODE_ENV: { type: 'enum', values: ['development', 'production', 'test'], critical: true },
    PORT: { type: 'number', critical: false, default: 3001 },
    JWT_SECRET: { type: 'string', critical: true },
    CORS_ORIGIN: { type: 'string', critical: false, default: 'http://localhost:5173' },

    // External Services (optional)
    AWS_ACCESS_KEY_ID: { type: 'string', critical: false },
    AWS_SECRET_ACCESS_KEY: { type: 'string', critical: false },
    AWS_REGION: { type: 'string', critical: false },

    // DataJud API
    DATAJUD_API_KEY: { type: 'string', critical: false },
};

class ConfigValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }

    validate() {
        logger.info('🔍 Validating environment configuration...');

        for (const [key, config] of Object.entries(REQUIRED_VARS)) {
            const value = process.env[key];

            // Check if missing
            if (!value || value.trim() === '') {
                if (config.critical) {
                    this.errors.push(`Missing critical environment variable: ${key}`);
                } else if (config.default) {
                    process.env[key] = config.default.toString();
                    this.warnings.push(`Using default value for ${key}: ${config.default}`);
                } else {
                    this.warnings.push(`Optional environment variable not set: ${key}`);
                }
                continue;
            }

            // Type validation
            if (!this.validateType(key, value, config)) {
                if (config.critical) {
                    this.errors.push(`Invalid type for ${key}. Expected ${config.type}, got: ${value}`);
                } else {
                    this.warnings.push(`Invalid type for ${key}. Expected ${config.type}, got: ${value}`);
                }
            }
        }

        // Report results
        if (this.warnings.length > 0) {
            this.warnings.forEach(warning => logger.warn(`⚠️  ${warning}`));
        }

        if (this.errors.length > 0) {
            logger.error('❌ Environment validation FAILED:');
            this.errors.forEach(error => logger.error(`   - ${error}`));
            logger.error('\n💡 Check your .env file and ensure all required variables are set.');
            process.exit(1); // FAIL FAST
        }

        logger.info('✅ Environment validation passed');
        return true;
    }

    validateType(key, value, config) {
        switch (config.type) {
            case 'string':
                return typeof value === 'string' && value.length > 0;

            case 'number':
                return !isNaN(parseInt(value));

            case 'url':
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }

            case 'enum':
                return config.values.includes(value);

            default:
                return true;
        }
    }

    getConfig() {
        return {
            // Database
            database: {
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                name: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            },

            // Supabase
            supabase: {
                url: process.env.SUPABASE_URL,
                anonKey: process.env.SUPABASE_ANON_KEY,
                serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            },

            // Application
            app: {
                env: process.env.NODE_ENV,
                port: parseInt(process.env.PORT),
                jwtSecret: process.env.JWT_SECRET,
            },

            // AWS (optional)
            aws: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION || 'us-east-1',
            },

            // DataJud
            datajud: {
                apiKey: process.env.DATAJUD_API_KEY,
            },
        };
    }
}

module.exports = new ConfigValidator();
