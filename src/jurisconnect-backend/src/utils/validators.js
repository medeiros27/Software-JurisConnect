const { LIMITS } = require('./constants');

/**
 * Input Validation Utilities
 * Reusable validators for common input types
 */

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= LIMITS.MAX_EMAIL_LENGTH;
}

/**
 * Validate phone number (Brazilian format)
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;

    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * Validate CPF
 * @param {string} cpf - CPF number
 * @returns {boolean} Is valid
 */
function isValidCPF(cpf) {
    if (!cpf || typeof cpf !== 'string') return false;

    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
        return false;
    }

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned.charAt(9)) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (parseInt(cleaned.charAt(10)) !== digit) return false;

    return true;
}

/**
 * Validate CNPJ
 * @param {string} cnpj - CNPJ number
 * @returns {boolean} Is valid
 */
function isValidCNPJ(cnpj) {
    if (!cnpj || typeof cnpj !== 'string') return false;

    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
        return false;
    }

    // Validate check digits
    let length = cleaned.length - 2;
    let numbers = cleaned.substring(0, length);
    const digits = cleaned.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cleaned.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validatePassword(password) {
    const errors = [];

    if (!password || typeof password !== 'string') {
        return { isValid: false, errors: ['Senha é obrigatória'] };
    }

    if (password.length < LIMITS.MIN_PASSWORD_LENGTH) {
        errors.push(`Senha deve ter pelo menos ${LIMITS.MIN_PASSWORD_LENGTH} caracteres`);
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Validate date string (ISO or BR format)
 * @param {string} dateStr - Date string
 * @returns {boolean} Is valid
 */
function isValidDate(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return false;

    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate URL
 * @param {string} url - URL string
 * @returns {boolean} Is valid
 */
function isValidURL(url) {
    if (!url || typeof url !== 'string') return false;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate required fields in object
 * @param {object} obj - Object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} { isValid: boolean, missing: string[] }
 */
function validateRequiredFields(obj, requiredFields) {
    if (!obj || typeof obj !== 'object') {
        return { isValid: false, missing: requiredFields };
    }

    const missing = requiredFields.filter(field => {
        const value = obj[field];
        return value === undefined || value === null || value === '';
    });

    return {
        isValid: missing.length === 0,
        missing,
    };
}

/**
 * Sanitize string input
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';

    return str
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/[<>]/g, ''); // Remove angle brackets
}

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {array} allowedValues - Array of allowed values
 * @returns {boolean} Is valid
 */
function isValidEnum(value, allowedValues) {
    return allowedValues.includes(value);
}

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidCPF,
    isValidCNPJ,
    validatePassword,
    isValidDate,
    isValidURL,
    validateRequiredFields,
    sanitizeString,
    isValidEnum,
    isValidDocument,
};

/**
 * Validate CPF or CNPJ
 * @param {string} doc - Document number
 * @returns {boolean} Is valid
 */
function isValidDocument(doc) {
    if (!doc) return false;
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) return isValidCPF(cleaned);
    if (cleaned.length === 14) return isValidCNPJ(cleaned);
    return false;
}
