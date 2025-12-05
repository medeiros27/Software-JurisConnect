import { toast } from 'react-hot-toast';

/**
 * Frontend Error Handler
 * Centralized error handling for API calls
 */

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error) {
    // String error
    if (typeof error === 'string') return error;

    // API error response
    if (error.response?.data?.error?.message) {
        return error.response.data.error.message;
    }

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // Network error
    if (error.message === 'Network Error') {
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
        return 'Tempo de requisição esgotado. Tente novamente.';
    }

    // Default
    return error.message || 'Ocorreu um erro inesperado';
}

/**
 * Handle error and show toast notification
 */
export function handleError(error, customMessage = null) {
    const message = customMessage || getErrorMessage(error);

    // Log to console in development
    if (import.meta.env.DEV) {
        console.error('Error:', error);
    }

    // Show toast
    toast.error(message);

    return message;
}

/**
 * Handle success and show toast notification
 */
export function handleSuccess(message = 'Operação realizada com sucesso!') {
    toast.success(message);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
    // Don't retry on client errors (4xx), except 408 (timeout) and 429 (rate limit)
    const status = error.response?.status;

    if (status >= 400 && status < 500) {
        return status === 408 || status === 429;
    }

    // Retry on server errors (5xx) and network errors
    if (status >= 500 || error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        return true;
    }

    return false;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry if not retryable
            if (!isRetryableError(error)) {
                throw error;
            }

            // Don't retry if last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = baseDelay * Math.pow(2, attempt - 1);

            // Show retry toast
            toast.loading(`Tentativa ${attempt}/${maxRetries}... Aguarde ${delay / 1000}s`, {
                duration: delay,
            });

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}
