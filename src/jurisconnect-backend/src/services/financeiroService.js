const { Demanda } = require('../models');
const { executeWithRetry } = require('../utils/dbHelpers');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { DEMANDA_STATUS } = require('../utils/constants');
const { Op } = require('sequelize');

/**
 * Financeiro Service
 * Business logic for financial calculations and reporting
 */
class FinanceiroService {
    /**
     * Get dashboard financial metrics
     */
    async getDashboardMetrics() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const inicioMes = new Date(anoAtual, mesAtual, 1);
        const fimMes = new Date(anoAtual, mesAtual + 1, 1);

        try {
            // Total a receber (demandas abertas)
            const totalReceber = await executeWithRetry(() =>
                Demanda.sum('valor_cobrado', {
                    where: {
                        status: { [Op.notIn]: [DEMANDA_STATUS.CONCLUIDA, DEMANDA_STATUS.CANCELADA] },
                    },
                })
            );

            // Receita do mês
            const receitaMes = await executeWithRetry(() =>
                Demanda.sum('valor_cobrado', {
                    where: {
                        status: DEMANDA_STATUS.CONCLUIDA,
                        [Op.or]: [
                            { data_conclusao: { [Op.between]: [inicioMes, fimMes] } },
                            {
                                data_conclusao: null,
                                updated_at: { [Op.between]: [inicioMes, fimMes] },
                            },
                        ],
                    },
                })
            );

            // Despesas do mês
            const despesaMes = await executeWithRetry(() =>
                Demanda.sum('valor_custo', {
                    where: {
                        status: DEMANDA_STATUS.CONCLUIDA,
                        [Op.or]: [
                            { data_conclusao: { [Op.between]: [inicioMes, fimMes] } },
                            {
                                data_conclusao: null,
                                updated_at: { [Op.between]: [inicioMes, fimMes] },
                            },
                        ],
                    },
                })
            );

            // Receitas pendentes
            const receitasPendentes = totalReceber;

            // Despesas pendentes  
            const despesasPendentes = await executeWithRetry(() =>
                Demanda.sum('valor_custo', {
                    where: {
                        status: { [Op.notIn]: [DEMANDA_STATUS.CONCLUIDA, DEMANDA_STATUS.CANCELADA] },
                    },
                })
            );

            return {
                receita_mes: (receitaMes || 0) * 100, // Convert to cents
                despesa_mes: (despesaMes || 0) * 100,
                saldo_mes: ((receitaMes || 0) - (despesaMes || 0)) * 100,
                a_receber: (totalReceber || 0) * 100,
                receitas_pendentes: (receitasPendentes || 0) * 100,
                despesas_pendentes: (despesasPendentes || 0) * 100,
            };
        } catch (error) {
            logger.logError(error, { method: 'FinanceiroService.getDashboardMetrics' });
            throw AppError.database('Erro ao calcular métricas financeiras', error);
        }
    }

    /**
     * Get cash flow chart data (last 6 months)
     */
    async getCashFlowChart() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const fluxoCaixa = [];

        try {
            for (let i = 5; i >= 0; i--) {
                const d = new Date(anoAtual, mesAtual - i, 1);
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
                const monthName = start.toLocaleString('pt-BR', { month: 'short' });

                const receita = await executeWithRetry(() =>
                    Demanda.sum('valor_cobrado', {
                        where: {
                            status: DEMANDA_STATUS.CONCLUIDA,
                            [Op.or]: [
                                { data_conclusao: { [Op.between]: [start, end] } },
                                {
                                    data_conclusao: null,
                                    updated_at: { [Op.between]: [start, end] },
                                },
                            ],
                        },
                    })
                );

                const despesa = await executeWithRetry(() =>
                    Demanda.sum('valor_custo', {
                        where: {
                            status: DEMANDA_STATUS.CONCLUIDA,
                            [Op.or]: [
                                { data_conclusao: { [Op.between]: [start, end] } },
                                {
                                    data_conclusao: null,
                                    updated_at: { [Op.between]: [start, end] },
                                },
                            ],
                        },
                    })
                );

                fluxoCaixa.push({
                    name: monthName,
                    receita: receita || 0,
                    despesa: despesa || 0,
                });
            }

            return fluxoCaixa;
        } catch (error) {
            logger.logError(error, { method: 'FinanceiroService.getCashFlowChart' });
            throw AppError.database('Erro ao gerar gráfico de fluxo de caixa', error);
        }
    }

    /**
     * Get status distribution for pie chart
     */
    async getStatusDistribution() {
        try {
            const statusCounts = await executeWithRetry(() =>
                Demanda.count({
                    group: ['status'],
                    attributes: ['status'],
                })
            );

            return statusCounts.map((s) => ({
                status: s.status.replace('_', ' ').toUpperCase(),
                count: s.count,
            }));
        } catch (error) {
            logger.logError(error, { method: 'FinanceiroService.getStatusDistribution' });
            throw AppError.database('Erro ao calcular distribuição por status', error);
        }
    }

    /**
     * Generate transaction list from demands
     */
    async getTransactionList(limit = 50) {
        try {
            const demandas = await executeWithRetry(() =>
                Demanda.findAll({
                    limit: parseInt(limit),
                    order: [['updated_at', 'DESC']],
                    include: [{ association: 'cliente', attributes: ['nome_fantasia'] }],
                })
            );

            const transacoes = [];

            demandas.forEach((d) => {
                // Add revenue transaction if valor_cobrado > 0
                if (d.valor_cobrado > 0) {
                    transacoes.push({
                        id: `rec-${d.id}`,
                        descricao: `Receita: ${d.titulo}`,
                        valor: d.valor_cobrado,
                        tipo: 'receber',
                        status: d.status === DEMANDA_STATUS.CONCLUIDA ? 'pago' : 'pendente',
                        data_vencimento: d.data_prazo,
                        data_pagamento:
                            d.status === DEMANDA_STATUS.CONCLUIDA
                                ? d.data_conclusao || d.updatedAt
                                : null,
                        categoria: 'Honorários',
                        cliente_nome: d.cliente?.nome_fantasia,
                    });
                }

                // Add expense transaction if valor_custo > 0
                if (d.valor_custo > 0) {
                    transacoes.push({
                        id: `desp-${d.id}`,
                        descricao: `Despesa: ${d.titulo}`,
                        valor: d.valor_custo,
                        tipo: 'pagar',
                        status: d.status === DEMANDA_STATUS.CONCLUIDA ? 'pago' : 'pendente',
                        data_vencimento: d.data_prazo,
                        data_pagamento:
                            d.status === DEMANDA_STATUS.CONCLUIDA
                                ? d.data_conclusao || d.updatedAt
                                : null,
                        categoria: 'Custos Operacionais',
                        cliente_nome: d.cliente?.nome_fantasia,
                    });
                }
            });

            return transacoes;
        } catch (error) {
            logger.logError(error, { method: 'FinanceiroService.getTransactionList', limit });
            throw AppError.database('Erro ao gerar lista de transações', error);
        }
    }

    /**
     * Calculate profit margin
     */
    calculateProfitMargin(receita, despesa) {
        if (!receita || receita === 0) return 0;
        return (((receita - despesa) / receita) * 100).toFixed(2);
    }

    /**
     * Calculate ROI
     */
    calculateROI(receita, despesa) {
        if (!despesa || despesa === 0) return 0;
        return (((receita - despesa) / despesa) * 100).toFixed(2);
    }
}

module.exports = new FinanceiroService();
