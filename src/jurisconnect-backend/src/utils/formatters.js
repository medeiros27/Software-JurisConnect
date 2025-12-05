const { CURRENCY, DATE_FORMATS } = require('./constants');

/**
 * Formatting Utilities
 * Reusable formatters for currency, dates, and other data
 */

/**
 * Format currency value
 * @param {number} value - Value in reais (BRL)
 * @param {boolean} includeSymbol - Include currency symbol
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, includeSymbol = true) {
    if (value === null || value === undefined || isNaN(value)) {
        return includeSymbol ? `${CURRENCY.SYMBOL} 0,00` : '0,00';
    }

    const formatted = new Intl.NumberFormat(CURRENCY.LOCALE, {
        style: 'currency',
        currency: CURRENCY.CODE,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

    return includeSymbol ? formatted : formatted.replace(CURRENCY.SYMBOL, '').trim();
}

/**
 * Parse currency string to number
 * @param {string} str - Currency string (e.g., "R$ 1.234,56" or "1.234,56")
 * @returns {number} Value in reais
 */
function parseCurrency(str) {
    if (!str) return 0;

    // Remove currency symbol and spaces
    const cleaned = str.replace(/[R$\s]/g, '');

    // Replace period with empty (thousands separator) and comma with period (decimal)
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');

    return parseFloat(normalized) || 0;
}

/**
 * Format phone number (Brazilian format)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
function formatPhone(phone) {
    if (!phone) return '';

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 11) {
        // Mobile: (XX) XXXXX-XXXX
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        // Landline: (XX) XXXX-XXXX
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return phone;
}

/**
 * Format CPF
 * @param {string} cpf - CPF number
 * @returns {string} Formatted CPF
 */
function formatCPF(cpf) {
    if (!cpf) return '';

    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return cpf;

    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Format CNPJ
 * @param {string} cnpj - CNPJ number
 * @returns {string} Formatted CNPJ
 */
function formatCNPJ(cnpj) {
    if (!cnpj) return '';

    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length !== 14) return cnpj;

    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Format date to Brazilian format
 * @param {Date|string} date - Date object or ISO string
 * @param {boolean} includeTime - Include time in formatting
 * @returns {string} Formatted date
 */
function formatDate(date, includeTime = false) {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const options = includeTime
        ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' };

    return new Intl.DateTimeFormat(CURRENCY.LOCALE, options).format(d);
}

/**
 * Parse date from Brazilian format to ISO
 * @param {string} dateStr - Date in DD/MM/YYYY format
 * @returns {string} ISO date string
 */
function parseDate(dateStr) {
    if (!dateStr) return null;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Get relative time (e.g., "há 2 dias")
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 7) {
        return formatDate(d);
    } else if (diffDay > 0) {
        return `há ${diffDay} dia${diffDay > 1 ? 's' : ''}`;
    } else if (diffHour > 0) {
        return `há ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
    } else if (diffMin > 0) {
        return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
    } else {
        return 'agora mesmo';
    }
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str || '';
    return str.substring(0, maxLength) + '...';
}

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
function sanitizeFilename(filename) {
    if (!filename) return 'file';

    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

module.exports = {
    formatCurrency,
    parseCurrency,
    formatPhone,
    formatCPF,
    formatCNPJ,
    formatDate,
    parseDate,
    getRelativeTime,
    truncate,
    sanitizeFilename,
};
