const { Cliente, Demanda, sequelize } = require('../models');
const { executeWithRetry } = require('../utils/dbHelpers');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { validateRequiredFields, isValidEmail, isValidCPF, isValidCNPJ } = require('../utils/validators');
const { Op } = require('sequelize');

class ClienteService {
    async list(filters = {}, pagination = {}) {
        const { tipo_pessoa, ativo, busca } = filters;
        const { page = 1, limit = 20, sortBy = 'nome_fantasia', sortOrder = 'ASC' } = pagination;
        const offset = (page - 1) * limit;
        const where = {};

        if (tipo_pessoa && tipo_pessoa !== '') where.tipo_pessoa = tipo_pessoa;
        if (ativo !== undefined && ativo !== '' && ativo !== null) {
            where.ativo = ativo === 'true' || ativo === true;
        }

        if (busca && busca !== '') {
            where[Op.or] = [
                { nome_fantasia: { [Op.iLike]: `%${busca}%` } },
                { razao_social: { [Op.iLike]: `%${busca}%` } },
                { cpf_cnpj: { [Op.like]: `%${busca}%` } },
                { email: { [Op.iLike]: `%${busca}%` } },
            ];
        }

        try {
            const { count, rows } = await executeWithRetry(() =>
                Cliente.findAndCountAll({
                    where,
                    limit: parseInt(limit),
                    offset,
                    order: [[sortBy, sortOrder]],
                    attributes: {
                        include: [
                            [
                                sequelize.literal(`(
                                    SELECT COUNT(*)::int
                                    FROM "demandas" AS "demanda"
                                    WHERE
                                        "demanda"."cliente_id" = "Cliente"."id"
                                        AND "demanda"."status" NOT IN ('concluida', 'cancelada')
                                        AND "demanda"."deleted_at" IS NULL
                                )`),
                                'demandas_abertas'
                            ]
                        ]
                    }
                })
            );
            return {
                clientes: rows,
                pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit), limit: parseInt(limit) }
            };
        } catch (error) {
            logger.error('Error in ClienteService.list', { error: error.message, filters, pagination });
            throw AppError.database('Erro ao listar clientes', error);
        }
    }

    async getById(id) {
        if (!id) throw AppError.badRequest('ID é obrigatório');
        try {
            const cliente = await executeWithRetry(() =>
                Cliente.findByPk(id, {
                    include: [{
                        association: 'demandas',
                        attributes: ['id', 'numero', 'titulo', 'status'],
                        limit: 10,
                        order: [['created_at', 'DESC']]
                    }]
                })
            );
            if (!cliente) throw AppError.notFound('Cliente');
            return cliente;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('Error in ClienteService.getById', { error: error.message, id });
            throw AppError.database('Erro ao buscar cliente', error);
        }
    }

    async create(data) {
        // Sanitize empty strings to null for optional email fields
        if (data.email === '') data.email = null;
        if (data.email_financeiro === '') data.email_financeiro = null;
        if (data.cpf_cnpj === '') data.cpf_cnpj = null;

        const validation = validateRequiredFields(data, ['nome_fantasia']);
        if (!validation.isValid) throw AppError.validation(`Campos obrigatórios faltando: ${validation.missing.join(', ')}`);

        if (data.email && !isValidEmail(data.email)) throw AppError.validation('Email inválido');

        if (data.cpf_cnpj) {
            const cleaned = data.cpf_cnpj.replace(/\D/g, '');
            if (cleaned.length === 11 && !isValidCPF(data.cpf_cnpj)) throw AppError.validation('CPF inválido');
            else if (cleaned.length === 14 && !isValidCNPJ(data.cpf_cnpj)) throw AppError.validation('CNPJ inválido');

            // Check for duplicates
            const existing = await Cliente.findOne({ where: { cpf_cnpj: data.cpf_cnpj } });
            if (existing) {
                if (!existing.ativo) {
                    // Reactivate soft-deleted client
                    await executeWithRetry(() => existing.update({ ...data, ativo: true }));
                    logger.info(`Cliente reactivated: ${existing.nome_fantasia}`, { id: existing.id });
                    return existing;
                }
                throw AppError.conflict('CPF/CNPJ já cadastrado');
            }
        }

        try {
            const cliente = await executeWithRetry(() => Cliente.create({ ...data, ativo: data.ativo !== undefined ? data.ativo : true }));
            logger.info(`Cliente created: ${cliente.nome_fantasia}`, { id: cliente.id });
            return cliente;
        } catch (error) {
            logger.error('Error in ClienteService.create', { error: error.message });
            if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Email ou CPF/CNPJ já cadastrado');
            throw AppError.database('Erro ao criar cliente', error);
        }
    }

    async update(id, data) {
        // Sanitize empty strings to null for optional email fields
        if (data.email === '') data.email = null;
        if (data.email_financeiro === '') data.email_financeiro = null;
        if (data.cpf_cnpj === '') data.cpf_cnpj = null;

        const cliente = await this.getById(id);

        if (data.email && data.email !== cliente.email && !isValidEmail(data.email)) throw AppError.validation('Email inválido');

        if (data.cpf_cnpj && data.cpf_cnpj !== cliente.cpf_cnpj) {
            const cleaned = data.cpf_cnpj.replace(/\D/g, '');
            if (cleaned.length === 11 && !isValidCPF(data.cpf_cnpj)) throw AppError.validation('CPF inválido');
            else if (cleaned.length === 14 && !isValidCNPJ(data.cpf_cnpj)) throw AppError.validation('CNPJ inválido');

            const existing = await Cliente.findOne({ where: { cpf_cnpj: data.cpf_cnpj } });
            if (existing) throw AppError.conflict('CPF/CNPJ já cadastrado');
        }

        try {
            await executeWithRetry(() => cliente.update(data));
            logger.info(`Cliente updated: ${cliente.nome_fantasia}`, { id });
            return await this.getById(id);
        } catch (error) {
            logger.error('Error in ClienteService.update', { error: error.message, id });
            if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Email ou CPF/CNPJ já cadastrado');
            throw AppError.database('Erro ao atualizar cliente', error);
        }
    }

    async delete(id) {
        const cliente = await this.getById(id);
        const demandCount = await Demanda.count({ where: { cliente_id: id } });

        if (demandCount > 0) {
            try {
                await executeWithRetry(() => cliente.update({ ativo: false }));
                logger.info(`Cliente deactivated (soft delete): ${cliente.nome_fantasia}`, { id });
                return { message: 'Cliente desativado com sucesso (possuía demandas vinculadas)' };
            } catch (error) {
                logger.error('Error in ClienteService.delete (soft)', { error: error.message, id });
                throw AppError.database('Erro ao desativar cliente', error);
            }
        }

        try {
            await executeWithRetry(() => cliente.destroy());
            logger.info(`Cliente deleted: ${cliente.nome_fantasia}`, { id });
            return { message: 'Cliente excluído com sucesso' };
        } catch (error) {
            logger.error('Error in ClienteService.delete', { error: error.message, id });
            throw AppError.database('Erro ao deletar cliente', error);
        }
    }

    async getStatistics() {
        try {
            const [total, ativos, inativos, pessoaFisica, pessoaJuridica, demandasAbertas] = await Promise.all([
                Cliente.count({ where: { ativo: true } }),
                Cliente.count({ where: { ativo: true } }),
                Cliente.count({ where: { ativo: false } }),
                Cliente.count({ where: { tipo_pessoa: 'fisica', ativo: true } }),
                Cliente.count({ where: { tipo_pessoa: 'juridica', ativo: true } }),
                Demanda.count({ where: { cliente_id: { [Op.not]: null }, status: { [Op.notIn]: ['concluida', 'cancelada'] } } })
            ]);

            return {
                total,
                ativos,
                inativos,
                pessoa_fisica: pessoaFisica,
                pessoa_juridica: pessoaJuridica,
                demandas_abertas: demandasAbertas
            };
        } catch (error) {
            logger.error('Error in ClienteService.getStatistics', { error: error.message });
            throw AppError.database('Erro ao calcular estatísticas', error);
        }
    }
}

module.exports = new ClienteService();
