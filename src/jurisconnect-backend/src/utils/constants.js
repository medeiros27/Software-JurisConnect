/**
 * Application Constants
 * Centralized location for all application constants
 */

module.exports = {
    // Demanda Status
    DEMANDA_STATUS: {
        RASCUNHO: 'rascunho',
        PENDENTE: 'pendente',
        EM_ANDAMENTO: 'em_andamento',
        AGUARDANDO_CORRESPONDENTE: 'aguardando_correspondente',
        CONCLUIDA: 'concluida',
        CANCELADA: 'cancelada',
    },

    // Demanda Prioridade
    PRIORIDADE: {
        BAIXA: 'baixa',
        MEDIA: 'media',
        ALTA: 'alta',
        URGENTE: 'urgente',
    },

    // Demanda Tipo
    TIPO_DEMANDA: {
        DILIGENCIA: 'diligencia',
        AUDIENCIA: 'audiencia',
        PROTOCOLO: 'protocolo',
        INTIMACAO: 'intimacao',
        OUTRO: 'outro',
    },

    // Pagamento Status
    PAGAMENTO_STATUS: {
        PENDENTE: 'pendente',
        PAGO: 'pago',
        VENCIDO: 'vencido',
        CANCELADO: 'cancelado',
    },

    // Pagamento Tipo
    PAGAMENTO_TIPO: {
        RECEBER: 'receber',
        PAGAR: 'pagar',
    },

    // User Roles
    USER_ROLES: {
        ADMIN: 'admin',
        GESTOR: 'gestor',
        OPERADOR: 'operador',
    },

    // Error Codes
    ERROR_CODES: {
        // Authentication
        AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
        AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
        AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
        AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
        AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',

        // Validation
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        INVALID_INPUT: 'INVALID_INPUT',

        // Database
        DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
        DB_QUERY_ERROR: 'DB_QUERY_ERROR',
        RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
        DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

        // Business Logic
        BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
        INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

        // External Services
        EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
        SUPABASE_ERROR: 'SUPABASE_ERROR',

        // Generic
        INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
        NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
    },

    // HTTP Status Codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        INTERNAL_SERVER_ERROR: 500,
        SERVICE_UNAVAILABLE: 503,
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
    },

    // Date Formats
    DATE_FORMATS: {
        ISO: 'YYYY-MM-DD',
        BR: 'DD/MM/YYYY',
        DATETIME_BR: 'DD/MM/YYYY HH:mm:ss',
    },

    // Currency
    CURRENCY: {
        SYMBOL: 'R$',
        CODE: 'BRL',
        LOCALE: 'pt-BR',
    },

    // Validation Limits
    LIMITS: {
        MAX_PHONE_LENGTH: 255,
        MAX_EMAIL_LENGTH: 255,
        MAX_NAME_LENGTH: 255,
        MAX_DESCRIPTION_LENGTH: 5000,
        MIN_PASSWORD_LENGTH: 6,
    },

    // Retry Configuration
    RETRY: {
        MAX_ATTEMPTS: 3,
        INITIAL_DELAY: 1000, // ms
        MAX_DELAY: 10000, // ms
        BACKOFF_MULTIPLIER: 2,
    },

    // File Upload
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_MIME_TYPES: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
    },
};
