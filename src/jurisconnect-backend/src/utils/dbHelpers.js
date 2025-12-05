const logger = require('./logger');
const { RETRY } = require('./constants');

/**
 * Database Helper Utilities
 * Query wrappers with retry logic and timeout handling
 */

/**
 * Execute query with retry logic
 * @param {Function} queryFn - Async function that executes the query
 * @param {object} options - Retry options
 * @returns {Promise} Query result
 */
async function executeWithRetry(queryFn, options = {}) {
    const {
        maxAttempts = RETRY.MAX_ATTEMPTS,
        initialDelay = RETRY.INITIAL_DELAY,
        maxDelay = RETRY.MAX_DELAY,
        backoffMultiplier = RETRY.BACKOFF_MULTIPLIER,
        onRetry = null,
    } = options;

    let lastError;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const result = await queryFn();

            if (attempt > 1) {
                logger.info(`Query succeeded on attempt ${attempt}`);
            }

            return result;
        } catch (error) {
            lastError = error;

            // Don't retry on certain errors
            if (isNonRetryableError(error)) {
                throw error;
            }

            if (attempt < maxAttempts) {
                logger.warn(`Query failed on attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms...`, {
                    error: error.message,
                });

                if (onRetry) {
                    onRetry(attempt, error);
                }

                await sleep(delay);
                delay = Math.min(delay * backoffMultiplier, maxDelay);
            }
        }
    }

    logger.error(`Query failed after ${maxAttempts} attempts`, {
        error: lastError.message,
    });

    throw lastError;
}

/**
 * Check if error should not be retried
 * @param {Error} error - Error object
 * @returns {boolean} Should not retry
 */
function isNonRetryableError(error) {
    // Don't retry on validation errors, not found, etc.
    const nonRetryableCodes = [
        'VALIDATION_ERROR',
        'RECORD_NOT_FOUND',
        'DUPLICATE_ENTRY',
        '23505', // Postgres unique violation
        '23503', // Postgres foreign key violation
    ];

    return nonRetryableCodes.some(code =>
        error.code === code || error.message.includes(code)
    );
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute query with timeout
 * @param {Function} queryFn - Async function that executes the query
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise} Query result
 */
async function executeWithTimeout(queryFn, timeoutMs = 30000) {
    return Promise.race([
        queryFn(),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
    ]);
}

/**
 * Batch process records
 * @param {Array} items - Items to process
 * @param {Function} processFn - Function to process each item
 * @param {number} batchSize - Size of each batch
 * @returns {Promise<Array>} Array of results
 */
async function batchProcess(items, processFn, batchSize = 100) {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(processFn));
        results.push(...batchResults);

        logger.debug(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`);
    }

    return results;
}

/**
 * Transaction wrapper with automatic rollback on error
 * @param {object} sequelize - Sequelize instance
 * @param {Function} transactionFn - Function to execute within transaction
 * @returns {Promise} Transaction result
 */
async function withTransaction(sequelize, transactionFn) {
    const t = await sequelize.transaction();

    try {
        const result = await transactionFn(t);
        await t.commit();
        return result;
    } catch (error) {
        await t.rollback();
        logger.error('Transaction rolled back', { error: error.message });
        throw error;
    }
}

module.exports = {
    executeWithRetry,
    executeWithTimeout,
    batchProcess,
    withTransaction,
    sleep,
};
