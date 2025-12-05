const { Correspondente, Demanda, sequelize } = require('../models');
const { executeWithRetry } = require('../utils/dbHelpers');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { validateRequiredFields, isValidEmail, isValidCPF, isValidCNPJ } = require('../utils/validators');
const { Op } = require('sequelize');

class CorrespondenteService {
  async list(filters = {}, pagination = {}) {
    const { tipo, estado_sediado, cidade_sediado, ativo, search } = filters;
    const { page = 1, limit = 20, sortBy = 'nome_fantasia', sortOrder = 'ASC' } = pagination;
    const offset = (page - 1) * limit;
    const where = {};

    if (tipo && tipo !== '') where.tipo = tipo;
    if (estado_sediado && estado_sediado !== '') where.estado_sediado = estado_sediado;
    if (cidade_sediado && cidade_sediado !== '') where.cidade_sediado = { [Op.iLike]: `%${cidade_sediado}%` };
    if (ativo !== undefined && ativo !== '' && ativo !== null) {
      where.ativo = ativo === 'true' || ativo === true;
    }
    if (search && search !== '') {
      where[Op.or] = [
        { nome_fantasia: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { cpf_cnpj: { [Op.iLike]: `%${search}%` } },
        { oab_numero: { [Op.iLike]: `%${search}%` } },
        { cidades_atendidas: { [Op.iLike]: `%${search}%` } }
      ];
    }

    try {
      const { count, rows } = await executeWithRetry(() =>
        Correspondente.findAndCountAll({
          where,
          attributes: {
            include: [
              [sequelize.literal('(SELECT COUNT(*) FROM "demandas" WHERE "demandas"."correspondente_id" = "Correspondente"."id" AND "demandas"."deleted_at" IS NULL)'), 'demandas_count']
            ]
          },
          limit: parseInt(limit),
          offset,
          order: [[sortBy, sortOrder]]
        })
      );
      return {
        correspondentes: rows,
        pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit), limit: parseInt(limit) }
      };
    } catch (error) {
      logger.error('Error in CorrespondenteService.list', { error: error.message, filters, pagination });
      throw AppError.database('Erro ao listar correspondentes', error);
    }
  }

  async getById(id) {
    if (!id) throw AppError.badRequest('ID e obrigatorio');
    try {
      const correspondente = await executeWithRetry(() =>
        Correspondente.findByPk(id, {
          include: [{ association: 'demandas', attributes: ['id', 'numero', 'titulo', 'status', 'data_prazo', 'valor_estimado'], limit: 10, order: [['created_at', 'DESC']] }]
        })
      );
      if (!correspondente) throw AppError.notFound('Correspondente');
      return correspondente;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error in CorrespondenteService.getById', { error: error.message, id });
      throw AppError.database('Erro ao buscar correspondente', error);
    }
  }

  async create(data) {
    // Sanitize empty strings to null
    if (data.email === '') data.email = null;
    if (data.cpf_cnpj === '') data.cpf_cnpj = null;
    if (data.oab_numero === '') data.oab_numero = null;
    if (data.oab_estado === '') data.oab_estado = null;

    const validation = validateRequiredFields(data, ['nome_fantasia']);
    if (!validation.isValid) throw AppError.validation(`Campos obrigatorios faltando: ${validation.missing.join(', ')}`);
    if (data.email && !isValidEmail(data.email)) throw AppError.validation('Email invalido');
    if (data.cpf_cnpj) {
      const cleaned = data.cpf_cnpj.replace(/\D/g, '');
      if (cleaned.length === 11 && !isValidCPF(data.cpf_cnpj)) throw AppError.validation('CPF invalido');
      else if (cleaned.length === 14 && !isValidCNPJ(data.cpf_cnpj)) throw AppError.validation('CNPJ invalido');
    }
    if (data.tipo === 'advogado') {
      // Relaxed validation to allow registration without OAB initially
      // if (!data.oab_numero) throw AppError.validation('Numero da OAB e obrigatorio para advogados');
      // if (!data.oab_estado) throw AppError.validation('Estado da OAB e obrigatorio para advogados');
    }
    try {
      const correspondente = await executeWithRetry(() => Correspondente.create({ ...data, ativo: data.ativo !== undefined ? data.ativo : true }));
      logger.info(`Correspondente created: ${correspondente.nome_fantasia}`, { id: correspondente.id });
      return correspondente;
    } catch (error) {
      logger.error('Error in CorrespondenteService.create', { error: error.message });
      if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Email ou CPF/CNPJ ja cadastrado');
      throw AppError.database('Erro ao criar correspondente', error);
    }
  }

  async update(id, data) {
    // Sanitize empty strings to null
    if (data.email === '') data.email = null;
    if (data.cpf_cnpj === '') data.cpf_cnpj = null;
    if (data.oab_numero === '') data.oab_numero = null;
    if (data.oab_estado === '') data.oab_estado = null;

    const correspondente = await this.getById(id);
    if (data.email && data.email !== correspondente.email && !isValidEmail(data.email)) throw AppError.validation('Email invalido');
    const tipoFinal = data.tipo || correspondente.tipo;
    if (tipoFinal === 'advogado') {
      const oabNumero = data.oab_numero !== undefined ? data.oab_numero : correspondente.oab_numero;
      const oabEstado = data.oab_estado !== undefined ? data.oab_estado : correspondente.oab_estado;
      // Relaxed validation
      // if (!oabNumero) throw AppError.validation('Numero da OAB e obrigatorio para advogados');
      // if (!oabEstado) throw AppError.validation('Estado da OAB e obrigatorio para advogados');
    }
    try {
      await executeWithRetry(() => correspondente.update(data));
      logger.info(`Correspondente updated: ${correspondente.nome_fantasia}`, { id });
      return await this.getById(id);
    } catch (error) {
      logger.error('Error in CorrespondenteService.update', { error: error.message, id });
      if (error.name === 'SequelizeUniqueConstraintError') throw AppError.conflict('Email ou CPF/CNPJ ja cadastrado');
      throw AppError.database('Erro ao atualizar correspondente', error);
    }
  }

  async delete(id) {
    const correspondente = await this.getById(id);
    const demandCount = await Demanda.count({ where: { correspondente_id: id } });
    if (demandCount > 0) throw AppError.badRequest(`Correspondente possui ${demandCount} demanda(s) vinculada(s) e nao pode ser excluido`);
    try {
      await executeWithRetry(() => correspondente.destroy());
      logger.info(`Correspondente deleted: ${correspondente.nome_fantasia}`, { id });
      return { message: 'Correspondente excluido com sucesso' };
    } catch (error) {
      logger.error('Error in CorrespondenteService.delete', { error: error.message, id });
      throw AppError.database('Erro ao deletar correspondente', error);
    }
  }

  async toggleAtivo(id) {
    const correspondente = await this.getById(id);
    try {
      await executeWithRetry(() => correspondente.update({ ativo: !correspondente.ativo }));
      logger.info(`Correspondente status changed: ${correspondente.nome_fantasia}`, { id, ativo: !correspondente.ativo });
      return correspondente;
    } catch (error) {
      logger.error('Error in CorrespondenteService.toggleAtivo', { error: error.message, id });
      throw AppError.database('Erro ao alterar status', error);
    }
  }

  async getStatistics() {
    try {
      const [total, ativos, inativos, advogados, prepostos, demandasAbertas] = await Promise.all([
        Correspondente.count({ where: { ativo: true } }),
        Correspondente.count({ where: { ativo: true } }),
        Correspondente.count({ where: { ativo: false } }),
        Correspondente.count({ where: { tipo: 'advogado', ativo: true } }),
        Correspondente.count({ where: { tipo: 'preposto', ativo: true } }),
        Demanda.count({ where: { correspondente_id: { [Op.not]: null }, status: { [Op.notIn]: ['concluida', 'cancelada'] } } })
      ]);
      const topCorrespondentes = await Demanda.findAll({
        attributes: ['correspondente_id', [Demanda.sequelize.fn('COUNT', Demanda.sequelize.col('Demanda.id')), 'total_demandas']],
        where: { correspondente_id: { [Op.not]: null } },
        group: ['correspondente_id', 'correspondente.id'],
        order: [[Demanda.sequelize.fn('COUNT', Demanda.sequelize.col('Demanda.id')), 'DESC']],
        limit: 5,
        include: [{ association: 'correspondente', attributes: ['nome_fantasia'] }]
      });
      return { total, ativos, inativos, advogados, prepostos, demandas_abertas: demandasAbertas, top_correspondentes: topCorrespondentes };
    } catch (error) {
      logger.error('Error in CorrespondenteService.getStatistics', { error: error.message });
      throw AppError.database('Erro ao calcular estatisticas', error);
    }
  }

  async getDemandsByCorrespondente(id) {
    const correspondente = await this.getById(id);
    try {
      const demandas = await executeWithRetry(() =>
        Demanda.findAll({ where: { correspondente_id: id }, include: [{ association: 'cliente', attributes: ['nome_fantasia'] }], order: [['created_at', 'DESC']] })
      );
      return { correspondente: { id: correspondente.id, nome_fantasia: correspondente.nome_fantasia }, demandas, total: demandas.length };
    } catch (error) {
      logger.error('Error in CorrespondenteService.getDemandsByCorrespondente', { error: error.message, id });
      throw AppError.database('Erro ao buscar demandas', error);
    }
  }

  async findSuggestions(cidade, estado) {
    try {
      const suggestions = await executeWithRetry(() =>
        Correspondente.findAll({
          where: {
            [Op.and]: [
              { ativo: true },
              {
                [Op.or]: [
                  {
                    [Op.and]: [
                      { cidade_sediado: { [Op.iLike]: cidade } },
                      { estado_sediado: { [Op.iLike]: estado } }
                    ]
                  },
                  { cidades_atendidas: { [Op.iLike]: `%${cidade}%` } }
                ]
              }
            ]
          },
          order: [['classificacao', 'DESC']],
          limit: 5,
          attributes: ['id', 'nome_fantasia', 'cidade_sediado', 'estado_sediado', 'classificacao', 'celular', 'telefone']
        })
      );
      return suggestions;
    } catch (error) {
      logger.error('Error in CorrespondenteService.findSuggestions', { error: error.message, cidade, estado });
      throw AppError.database('Erro ao buscar sugestões', error);
    }
  }
}

module.exports = new CorrespondenteService();
