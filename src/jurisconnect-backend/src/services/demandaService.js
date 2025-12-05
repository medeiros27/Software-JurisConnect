const { Demanda, Cliente, Correspondente, Especialidade, Andamento, Tag, Documento, Pagamento, Diligencia, sequelize } = require('../models');
const { randomUUID } = require('crypto');
const { executeWithRetry } = require('../utils/dbHelpers');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { HTTP_STATUS, DEMANDA_STATUS } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Demanda Service
 * Business logic for demand management
 */
class DemandaService {
    /**
     * List demands with filtering and pagination
     */
    async list(filters = {}, pagination = {}) {
        const {
            status,
            prioridade,
            tipo_demanda,
            cliente_id,
            correspondente_id,
            data_inicio,
            data_fim,
            search,
        } = filters;

        const {
            page = 1,
            limit = 20,

            sortBy = 'data_agendamento',
            sortOrder = 'DESC',
        } = pagination;

        const offset = (page - 1) * limit;
        const where = {};

        // Build where conditions
        if (status) where.status = status;
        if (prioridade) where.prioridade = prioridade;
        if (tipo_demanda) where.tipo_demanda = tipo_demanda;
        if (cliente_id) where.cliente_id = cliente_id;
        if (correspondente_id) where.correspondente_id = correspondente_id;

        if (data_inicio && data_fim) {
            // Parse YYYY-MM-DD manually to construct Date in Local Time (not UTC)
            const [startYear, startMonth, startDay] = data_inicio.split('-').map(Number);
            const [endYear, endMonth, endDay] = data_fim.split('-').map(Number);

            const startDate = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);

            // End date should be the *next day* at 00:00:00 to cover the full 'data_fim' day
            const endDate = new Date(endYear, endMonth - 1, endDay, 0, 0, 0, 0);
            endDate.setDate(endDate.getDate() + 1);

            where.data_agendamento = {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            };
        }


        if (search) {
            console.log('[DemandaService.list] Search term:', search);
            where[Op.or] = [
                { numero: { [Op.iLike]: `%${search}%` } },
                { titulo: { [Op.iLike]: `%${search}%` } },
                { descricao: { [Op.iLike]: `%${search}%` } },
                { cidade: { [Op.iLike]: `%${search}%` } },
                { estado: { [Op.iLike]: `%${search}%` } },
                { '$correspondente.nome_fantasia$': { [Op.iLike]: `%${search}%` } },
                { '$correspondente.razao_social$': { [Op.iLike]: `%${search}%` } },
                { '$cliente.nome_fantasia$': { [Op.iLike]: `%${search}%` } },
                { '$cliente.razao_social$': { [Op.iLike]: `%${search}%` } },
            ];
        }


        try {
            const { count, rows } = await executeWithRetry(() =>
                Demanda.findAndCountAll({
                    where,
                    include: [
                        { association: 'cliente', attributes: ['id', 'nome_fantasia', 'razao_social'] },
                        { association: 'correspondente', attributes: ['id', 'nome_fantasia', 'razao_social', 'email', 'celular', 'telefone'] },
                        { association: 'especialidade', attributes: ['id', 'nome'] },
                    ],
                    limit: parseInt(limit),
                    offset,
                    order: [[sortBy, sortOrder]],
                })
            );

            return {
                demandas: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit),
                },
            };
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.list', filters, pagination });
            throw AppError.database('Erro ao listar demandas', error);
        }
    }

    /**
     * Get single demand by ID
     */
    async getById(id) {
        if (!id) {
            throw AppError.badRequest('ID é obrigatório');
        }

        try {
            const demanda = await executeWithRetry(() =>
                Demanda.findByPk(id, {
                    include: [
                        { association: 'cliente' },
                        { association: 'correspondente' },
                        { association: 'especialidade' },
                        { association: 'criador', attributes: ['id', 'nome', 'email'] },
                        { association: 'diligencias' },
                        { association: 'documentos' },
                        { association: 'pagamentos' },
                        {
                            association: 'andamentos',
                            include: [{ association: 'criador', attributes: ['id', 'nome', 'email'] }],
                            order: [['created_at', 'DESC']],
                        },
                        { association: 'tags' },
                        {
                            association: 'equipe',
                            through: {
                                attributes: ['valor', 'status_pagamento']
                            }
                        },
                    ],
                })
            );

            if (!demanda) {
                throw AppError.notFound('Demanda');
            }

            return demanda;
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.logError(error, { method: 'DemandaService.getById', id });
            throw AppError.database('Erro ao buscar demanda', error);
        }
    }

    /**
     * Generate sequential demand number (YYYY.NNNN)
     */
    async generateNumero() {
        const year = new Date().getFullYear();
        const lastDemanda = await Demanda.findOne({
            where: {
                numero: {
                    [Op.like]: `${year}.%`
                }
            },
            order: [['numero', 'DESC']],
            paranoid: false // Include deleted ones to avoid duplicates
        });

        let sequence = 1;
        if (lastDemanda && lastDemanda.numero) {
            const parts = lastDemanda.numero.split('.');
            if (parts.length === 2) {
                sequence = parseInt(parts[1], 10) + 1;
            }
        }

        return `${year}.${String(sequence).padStart(4, '0')}`;
    }

    /**
     * Create new demand
     */
    async create(data, userId) {
        try {
            // Generate demand number
            const numero = await this.generateNumero();

            const demanda = await executeWithRetry(() =>
                Demanda.create({
                    ...data,
                    numero,
                    access_token: randomUUID(),
                    criado_por: userId,
                    status: data.status || DEMANDA_STATUS.PENDENTE,
                })
            );

            logger.info(`Demanda created: ${numero}`, { id: demanda.id, userId });

            // Sync team if provided
            if (data.equipe && Array.isArray(data.equipe)) {
                console.log('CREATING EQUIPE:', JSON.stringify(data.equipe));
                for (const member of data.equipe) {
                    const memberId = typeof member === 'object' ? member.id : member;
                    const valor = typeof member === 'object' ? member.valor : 0;
                    const status = typeof member === 'object' ? member.status_pagamento : 'pendente';

                    console.log(`Adding member ${memberId} with valor ${valor} and status ${status}`);
                    await demanda.addEquipe(memberId, {
                        through: { valor, status_pagamento: status }
                    });
                }
            }

            // Sync payments automatically (now includes team)
            await this._syncPagamentos(demanda, data);

            return await this.getById(demanda.id);
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.create', data });
            throw AppError.database('Erro ao criar demanda', error);
        }
    }

    /**
     * Update demand
     */
    async update(id, data, userId) {
        console.log(`[DemandaService] Update called for ID ${id}. Data keys:`, Object.keys(data));
        console.log('[DemandaService] Payload Processo:', data.processo);
        if (data.equipe) console.log('[DemandaService] Equipe payload:', JSON.stringify(data.equipe));

        const demanda = await this.getById(id);

        // Sanitização de datas vazias para evitar erro "Invalid date"
        ['data_prazo', 'data_agendamento', 'data_inicio', 'data_conclusao'].forEach(field => {
            if (data[field] === '') data[field] = null;
        });

        try {
            await executeWithRetry(() => demanda.update(data));

            // Reload demand to get updated values for payment sync
            const updatedDemanda = await this.getById(id);
            await this._syncPagamentos(updatedDemanda, data);

            // Sync team if provided
            if (data.equipe && Array.isArray(data.equipe)) {
                console.log('UPDATING EQUIPE:', JSON.stringify(data.equipe));
                // Remove existing team first to ensure clean state or handle updates carefully
                // For simplicity, we can setEquipe with new data
                // But setEquipe with through attributes for multiple items is tricky in some sequelize versions
                // Let's manually manage it
                await demanda.setEquipe([]); // Clear current team
                console.log('Equipe cleared.');

                for (const member of data.equipe) {
                    const memberId = typeof member === 'object' ? member.id : member;
                    const valor = typeof member === 'object' ? member.valor : 0;
                    const status = typeof member === 'object' ? member.status_pagamento : 'pendente';

                    console.log(`Adding member ${memberId} with valor ${valor} and status ${status}`);
                    await demanda.addEquipe(memberId, {
                        through: { valor, status_pagamento: status }
                    });
                }
            }

            // Reload demand to get updated values for payment sync (including new team)
            const finalDemanda = await this.getById(id);
            await this._syncPagamentos(finalDemanda, data);

            logger.info(`Demanda updated: ${demanda.numero}`, { id, userId });

            // Return updated demand with new team
            return finalDemanda;
        } catch (error) {
            console.error('ORIGINAL ERROR IN UPDATE:', error);
            logger.logError(error, { method: 'DemandaService.update', id, data });
            throw AppError.database('Erro ao atualizar demanda', error);
        }
    }

    /**
     * Revoke access token (generate new one)
     */
    async revokeAccess(id, userId) {
        const demanda = await this.getById(id);

        try {
            const newToken = randomUUID();
            await executeWithRetry(() => demanda.update({ access_token: newToken }));

            logger.info(`Access token revoked for demanda: ${demanda.numero}`, { id, userId });

            return { access_token: newToken };
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.revokeAccess', id });
            throw AppError.database('Erro ao revogar acesso', error);
        }
    }

    /**
     * Get demand statistics
     */
    async getStatistics() {
        try {
            const total = await Demanda.count();
            const porStatus = await Demanda.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['status'],
                raw: true
            });

            const stats = {
                total,
                porStatus: porStatus.reduce((acc, curr) => {
                    acc[curr.status] = parseInt(curr.count);
                    return acc;
                }, {})
            };

            return stats;
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.getStatistics' });
            throw AppError.database('Erro ao buscar estatísticas', error);
        }
    }

    /**
     * Bulk update demands
     */
    async bulkUpdate(ids, updateData, userId) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw AppError.badRequest('IDs inválidos para atualização em lote');
        }

        try {
            const result = await executeWithRetry(() =>
                Demanda.update(updateData, {
                    where: {
                        id: {
                            [Op.in]: ids
                        }
                    }
                })
            );

            // Sync payments for each updated demand if necessary
            // This might be expensive for large batches, but ensures consistency
            if (updateData.status_pagamento_cliente || updateData.status_pagamento_correspondente || updateData.valor_cobrado || updateData.valor_custo) {
                const updatedDemandas = await Demanda.findAll({
                    where: { id: { [Op.in]: ids } }
                });
                for (const demanda of updatedDemandas) {
                    await this._syncPagamentos(demanda, updateData);
                }
            }

            logger.info(`Demandas atualizadas em lote: ${ids.length}`, { ids, userId, updateData });
            return { count: result[0] };
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.bulkUpdate', ids, updateData });
            throw AppError.database('Erro ao atualizar demandas em lote', error);
        }
    }

    /**
     * Bulk delete demands
     */
    async bulkDelete(ids, userId) {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw AppError.badRequest('IDs inválidos para exclusão em lote');
        }

        try {
            const result = await executeWithRetry(() =>
                Demanda.destroy({
                    where: {
                        id: {
                            [Op.in]: ids
                        }
                    }
                })
            );

            logger.info(`Demandas excluídas em lote: ${ids.length}`, { ids, userId });
            return { count: result };
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.bulkDelete', ids });
            throw AppError.database('Erro ao excluir demandas em lote', error);
        }
    }

    // ... (rest of the file until _syncPagamentos)

    /**
     * Add document to demand
     */
    async addDocumento(demandaId, file, userId) {
        const demanda = await this.getById(demandaId);

        try {
            const documento = await executeWithRetry(() =>
                Documento.create({
                    demanda_id: demanda.id,
                    nome: file.originalname,
                    tipo: file.mimetype,
                    url: `/uploads/${file.filename}`,
                    tamanho: file.size,
                    criado_por: userId,
                    publico: false
                })
            );

            logger.info(`Documento adicionado à demanda ${demanda.numero}`, { documentoId: documento.id, userId });
            return documento;
        } catch (error) {
            logger.logError(error, { method: 'DemandaService.addDocumento', demandaId, userId });
            throw AppError.database('Erro ao adicionar documento', error);
        }
    }

    /**
     * Sync payments based on demand values
     */
    async _syncPagamentos(demanda, extraData = {}) {
        try {
            // Se a demanda foi cancelada, cancelar todos os pagamentos pendentes
            if (demanda.status === DEMANDA_STATUS.CANCELADA || demanda.status === 'cancelada') {
                logger.info(`Cancelando pagamentos da demanda ${demanda.numero} devido ao cancelamento da demanda`);

                await Pagamento.update(
                    { status: 'cancelado' },
                    {
                        where: {
                            demanda_id: demanda.id,
                            status: { [Op.ne]: 'pago' } // Não cancela o que já foi pago
                        }
                    }
                );
                return;
            }

            const valorCobrado = parseFloat(demanda.valor_cobrado) || 0;
            const valorCusto = parseFloat(demanda.valor_custo) || 0;

            // --- RECEITA (Cliente) ---
            const receitaExistente = await Pagamento.findOne({
                where: {
                    demanda_id: demanda.id,
                    tipo: 'receber'
                }
            });

            if (valorCobrado > 0) {
                // Use data_agendamento as due date, or today if not set
                const dataVencimento = demanda.data_agendamento ? new Date(demanda.data_agendamento) : new Date();

                const statusReceita = extraData.status_pagamento_cliente || 'pendente';
                const dataPagamentoReceita = statusReceita === 'pago' ? new Date() : null;

                if (receitaExistente) {
                    // Update only if value changed and not paid
                    const updateData = {};
                    if (receitaExistente.status !== 'pago' && parseFloat(receitaExistente.valor) !== valorCobrado) {
                        updateData.valor = valorCobrado;
                    }

                    // Always sync due date with schedule date
                    const existingDueDate = new Date(receitaExistente.data_vencimento).toISOString().split('T')[0];
                    const newDueDate = dataVencimento.toISOString().split('T')[0];
                    if (existingDueDate !== newDueDate) {
                        updateData.data_vencimento = dataVencimento;
                    }

                    // Explicit status update from frontend
                    if (extraData.status_pagamento_cliente && extraData.status_pagamento_cliente !== receitaExistente.status) {
                        updateData.status = extraData.status_pagamento_cliente;
                        if (updateData.status === 'pago') updateData.data_pagamento = new Date();
                        else if (updateData.status === 'pendente') updateData.data_pagamento = null;
                    }
                    // Reactivate if it was canceled and demand is active
                    else if (receitaExistente.status === 'cancelado') {
                        updateData.status = 'pendente';
                    }

                    if (Object.keys(updateData).length > 0) {
                        await receitaExistente.update(updateData);
                    }
                } else {
                    await Pagamento.create({
                        demanda_id: demanda.id,
                        tipo: 'receber',
                        valor: valorCobrado,
                        data_vencimento: dataVencimento,
                        numero_fatura: `DEM-${demanda.numero}-REC`,
                        status: statusReceita,
                        data_pagamento: dataPagamentoReceita,
                        observacoes: `Gerado automaticamente pela Demanda ${demanda.numero}`
                    });
                }
            } else if (receitaExistente && receitaExistente.status !== 'pago') {
                // If value became 0 and not paid, remove it
                logger.info(`Removendo receita zerada/não paga da demanda ${demanda.numero}`, { id: receitaExistente.id });
                await receitaExistente.destroy();
            }

            // --- DESPESA (Correspondente) ---
            const despesaExistente = await Pagamento.findOne({
                where: {
                    demanda_id: demanda.id,
                    tipo: 'pagar'
                }
            });

            if (valorCusto > 0 && demanda.correspondente_id) {
                // Use data_agendamento as due date, or today if not set
                const dataVencimento = demanda.data_agendamento ? new Date(demanda.data_agendamento) : new Date();

                const statusDespesa = extraData.status_pagamento_correspondente || 'pendente';
                const dataPagamentoDespesa = statusDespesa === 'pago' ? new Date() : null;

                if (despesaExistente) {
                    const updateData = {};

                    // Update if value OR correspondent changed (and not paid)
                    if (despesaExistente.status !== 'pago' &&
                        (parseFloat(despesaExistente.valor) !== valorCusto || despesaExistente.correspondente_id !== demanda.correspondente_id)) {
                        updateData.valor = valorCusto;
                        updateData.correspondente_id = demanda.correspondente_id;
                    }

                    // Always sync due date with schedule date
                    const existingDueDate = new Date(despesaExistente.data_vencimento).toISOString().split('T')[0];
                    const newDueDate = dataVencimento.toISOString().split('T')[0];
                    if (existingDueDate !== newDueDate) {
                        updateData.data_vencimento = dataVencimento;
                    }

                    // Explicit status update from frontend
                    if (extraData.status_pagamento_correspondente && extraData.status_pagamento_correspondente !== despesaExistente.status) {
                        updateData.status = extraData.status_pagamento_correspondente;
                        if (updateData.status === 'pago') updateData.data_pagamento = new Date();
                        else if (updateData.status === 'pendente') updateData.data_pagamento = null;
                    }
                    else if (despesaExistente.status === 'cancelado') {
                        updateData.status = 'pendente';
                    }

                    if (Object.keys(updateData).length > 0) {
                        await despesaExistente.update(updateData);
                    }
                } else {
                    await Pagamento.create({
                        demanda_id: demanda.id,
                        correspondente_id: demanda.correspondente_id,
                        tipo: 'pagar',
                        valor: valorCusto,
                        data_vencimento: dataVencimento,
                        numero_fatura: `DEM-${demanda.numero}-PAG`,
                        status: statusDespesa,
                        data_pagamento: dataPagamentoDespesa,
                        observacoes: `Gerado automaticamente pela Demanda ${demanda.numero}`
                    });
                }
            } else if (despesaExistente && despesaExistente.status !== 'pago') {
                // If value became 0 or correspondent removed, and not paid, remove it
                logger.info(`Removendo despesa zerada/não paga da demanda ${demanda.numero}`, { id: despesaExistente.id });
                await despesaExistente.destroy();
            }

            // --- EQUIPE (Membros Adicionais) ---
            if (demanda.equipe && Array.isArray(demanda.equipe)) {
                const currentMemberIds = demanda.equipe.map(m => m.id);

                // 1. Sync current members
                for (const member of demanda.equipe) {
                    const junction = member.demanda_correspondentes || member.DemandaCorrespondentes || member.DemandaCorrespondente || {};
                    const valorMember = parseFloat(junction.valor) || 0;
                    const statusMember = junction.status_pagamento || 'pendente';
                    const memberId = member.id;
                    const faturaMember = `DEM-${demanda.numero}-PAG-${memberId}`;

                    if (valorMember > 0) {
                        const pagamentoMember = await Pagamento.findOne({
                            where: {
                                numero_fatura: faturaMember
                            },
                            paranoid: false // Include soft-deleted payments
                        });

                        const dataVencimento = demanda.data_agendamento ? new Date(demanda.data_agendamento) : new Date();
                        const dataPagamentoMember = statusMember === 'pago' ? new Date() : null;

                        if (pagamentoMember) {
                            console.log(`[Sync] Found payment ${faturaMember}. Status: ${pagamentoMember.status}, Valor: ${pagamentoMember.valor}, DeletedAt: ${pagamentoMember.deletedAt}`);

                            // If it was soft-deleted, restore it
                            if (pagamentoMember.deletedAt) {
                                console.log(`[Sync] Restoring soft-deleted payment ${faturaMember}`);
                                await pagamentoMember.restore();
                            }

                            const updateData = {};
                            if (pagamentoMember.status !== 'pago' && parseFloat(pagamentoMember.valor) !== valorMember) {
                                console.log(`[Sync] Updating valor from ${pagamentoMember.valor} to ${valorMember}`);
                                updateData.valor = valorMember;
                            }
                            if (statusMember && statusMember !== pagamentoMember.status) {
                                console.log(`[Sync] Updating status from ${pagamentoMember.status} to ${statusMember}`);
                                updateData.status = statusMember;
                                if (updateData.status === 'pago') updateData.data_pagamento = new Date();
                                else if (updateData.status === 'pendente') updateData.data_pagamento = null;
                            }
                            // Sync due date
                            const existingDueDate = new Date(pagamentoMember.data_vencimento).toISOString().split('T')[0];
                            const newDueDate = dataVencimento.toISOString().split('T')[0];
                            if (existingDueDate !== newDueDate) {
                                updateData.data_vencimento = dataVencimento;
                            }
                            // Reactivate
                            if (pagamentoMember.status === 'cancelado') {
                                updateData.status = 'pendente';
                            }

                            if (Object.keys(updateData).length > 0) {
                                await pagamentoMember.update(updateData);
                            }
                        } else {
                            await Pagamento.create({
                                demanda_id: demanda.id,
                                correspondente_id: memberId,
                                tipo: 'pagar',
                                valor: valorMember,
                                data_vencimento: dataVencimento,
                                numero_fatura: faturaMember,
                                status: statusMember,
                                data_pagamento: dataPagamentoMember,
                                observacoes: `Pagamento de equipe (Membro) - Demanda ${demanda.numero}`
                            });
                        }
                    }
                }

                // 2. Remove payments for removed members (or zeroed values)
                // Find all team payments for this demand
                const teamPayments = await Pagamento.findAll({
                    where: {
                        demanda_id: demanda.id,
                        tipo: 'pagar',
                        numero_fatura: {
                            [Op.like]: `DEM-${demanda.numero}-PAG-%`
                        }
                    }
                });

                for (const payment of teamPayments) {
                    // Extract member ID from fatura: DEM-XXXX.XXXX-PAG-ID
                    const parts = payment.numero_fatura.split('-PAG-');
                    if (parts.length === 2) {
                        const pMemberId = parseInt(parts[1], 10);

                        // Check if member is still in team AND has value > 0
                        const memberInTeam = demanda.equipe.find(m => m.id === pMemberId);
                        const junction = memberInTeam ? (memberInTeam.demanda_correspondentes || memberInTeam.DemandaCorrespondentes || memberInTeam.DemandaCorrespondente || {}) : {};
                        const valorInTeam = parseFloat(junction.valor) || 0;

                        if ((!memberInTeam || valorInTeam <= 0) && payment.status !== 'pago') {
                            logger.info(`Removendo pagamento de equipe obsoleto: ${payment.numero_fatura}`);
                            await payment.destroy();
                        }
                    }
                }
            }

        } catch (error) {
            logger.logError(error, { method: 'DemandaService._syncPagamentos', demandaId: demanda.id });
            // Don't throw here to avoid blocking demand creation/update
        }
    }
}

module.exports = new DemandaService();
