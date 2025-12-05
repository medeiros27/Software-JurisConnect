const BaseService = require('./base.service');
const AppError = require('../utils/AppError');

class DataJudService extends BaseService {
    constructor() {
        // API Pública do DataJud (CNJ) requer chave de API
        super('DataJud', 'https://api-publica.datajud.cnj.jus.br/api_publica_tjnc/v1');
        this.apiKey = process.env.DATAJUD_API_KEY;
    }

    async consultarProcesso(numeroProcesso) {
        if (!this.apiKey) {
            throw new AppError('DataJud API Key não configurada', 500);
        }

        try {
            const response = await this.client.post('/processos/numero', {
                numeroProcesso: numeroProcesso
            }, {
                headers: { 'API-Key': this.apiKey }
            });

            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new AppError('Processo não encontrado no DataJud', 404);
            }
            throw new AppError('Erro ao consultar DataJud', 502);
        }
    }
}

module.exports = new DataJudService();
