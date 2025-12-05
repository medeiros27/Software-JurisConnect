const axios = require('axios');
const axiosRetry = require('axios-retry').default || require('axios-retry');
const logger = require('../utils/logger');

class BaseService {
    constructor(serviceName, baseURL, timeout = 5000) {
        this.serviceName = serviceName;
        this.client = axios.create({
            baseURL,
            timeout
        });

        // Configurar Retry Logic
        axiosRetry(this.client, {
            retries: 3,
            retryDelay: axiosRetry.exponentialDelay,
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
            },
            onRetry: (retryCount, error, requestConfig) => {
                logger.warn(`[${this.serviceName}] Tentativa ${retryCount} falhou: ${error.message}`);
            }
        });

        // Interceptors para Logging
        this.client.interceptors.request.use(config => {
            logger.debug(`[${this.serviceName}] Request: ${config.method.toUpperCase()} ${config.url}`);
            return config;
        });

        this.client.interceptors.response.use(
            response => response,
            error => {
                logger.error(`[${this.serviceName}] Erro: ${error.message}`, {
                    status: error.response?.status,
                    data: error.response?.data
                });
                return Promise.reject(error);
            }
        );
    }
}

module.exports = BaseService;
