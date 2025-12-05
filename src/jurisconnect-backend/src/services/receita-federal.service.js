const BaseService = require('./base.service');
const AppError = require('../utils/AppError');

class ReceitaFederalService extends BaseService {
    constructor() {
        super('ReceitaFederal', 'https://brasilapi.com.br/api/cnpj/v1/');
    }

    async consultarCNPJ(cnpj) {
        try {
            const cleanCnpj = cnpj.replace(/\D/g, '');
            if (cleanCnpj.length !== 14) {
                throw new AppError('CNPJ inválido', 400);
            }

            const response = await this.client.get(`${cleanCnpj}`);

            return {
                cnpj: response.data.cnpj,
                razao_social: response.data.razao_social,
                nome_fantasia: response.data.nome_fantasia,
                situacao_cadastral: response.data.descricao_situacao_cadastral,
                data_inicio_atividade: response.data.data_inicio_atividade,
                endereco: {
                    logradouro: response.data.logradouro,
                    numero: response.data.numero,
                    complemento: response.data.complemento,
                    bairro: response.data.bairro,
                    municipio: response.data.municipio,
                    uf: response.data.uf,
                    cep: response.data.cep
                }
            };
        } catch (error) {
            if (error.response?.status === 404) {
                throw new AppError('CNPJ não encontrado', 404);
            }
            throw new AppError('Erro ao consultar CNPJ', 502);
        }
    }
}

module.exports = new ReceitaFederalService();
