const axios = require('axios');

class CorrespondenteDinamicoService {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://solicitante.correspondentedinamico.com.br/api/v1',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        // Interceptor to add token dynamically
        this.api.interceptors.request.use((config) => {
            const token = process.env.CORRESPONDENTE_DINAMICO_TOKEN;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Search for cities in the external API
     * @param {string} query - Search term
     * @returns {Promise<Array>} List of cities
     */
    async searchCities(query) {
        try {
            const response = await this.api.get('/cities', {
                params: { search: query }
            });
            return response.data.data || [];
        } catch (error) {
            console.error('Error searching cities:', error.response?.data || error.message);
            throw new Error('Falha ao buscar cidades no Correspondente Dinâmico');
        }
    }

    /**
     * Create a demand in the external platform
     * @param {Object} demandData - Demand data
     * @returns {Promise<Object>} Created demand data
     */
    async createDemand(demandData) {
        try {
            const response = await this.api.post('/demands', demandData);
            return response.data;
        } catch (error) {
            console.error('Error creating external demand:', error.response?.data || error.message);
            throw new Error('Falha ao publicar demanda no Correspondente Dinâmico');
        }
    }

    /**
     * Get embedded link for demand management
     * @param {string} userExternalId - User ID in your system
     * @returns {Promise<string>} Embedded link
     */
    async getEmbeddedLink(userExternalId) {
        try {
            const response = await this.api.post(`/embedded/demand-manager/${userExternalId}`);
            return response.data.data.link;
        } catch (error) {
            console.error('Error getting embedded link:', error.response?.data || error.message);
            throw new Error('Falha ao gerar link do painel externo');
        }
    }
}

module.exports = new CorrespondenteDinamicoService();
