const BaseService = require('./base.service');
const AppError = require('../utils/AppError');

class ViaCepService extends BaseService {
    constructor() {
        super('ViaCEP', 'https://viacep.com.br/ws/');
    }

    async consultarCep(cep) {
        try {
            const cleanCep = cep.replace(/\D/g, '');
            if (cleanCep.length !== 8) {
                throw new AppError('CEP inválido', 400);
            }

            const response = await this.client.get(`${cleanCep}/json/`);

            if (response.data.erro) {
                throw new AppError('CEP não encontrado', 404);
            }

            return {
                cep: response.data.cep,
                logradouro: response.data.logradouro,
                complemento: response.data.complemento,
                bairro: response.data.bairro,
                localidade: response.data.localidade,
                uf: response.data.uf,
                ibge: response.data.ibge
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Erro ao consultar CEP', 502);
        }
    }
}

module.exports = new ViaCepService();
