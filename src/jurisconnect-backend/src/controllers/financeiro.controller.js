const { Pagamento, Demanda, Correspondente } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

class FinanceiroController {
    async obterDashboard(req, res) {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const inicioMes = new Date(anoAtual, mesAtual, 1);
        const fimMes = new Date(anoAtual, mesAtual + 1, 1);

        // --- RESUMO ---
        // Total a receber (Demandas não concluídas/canceladas)
        const totalReceber = await Demanda.sum('valor_cobrado', {
            where: {
                status: { [Op.notIn]: ['concluida', 'cancelada'] }
            }
        });

        // Receita mês
        const receitaMes = await Demanda.sum('valor_cobrado', {
            where: {
                status: 'concluida',
                [Op.or]: [
                    { data_conclusao: { [Op.between]: [inicioMes, fimMes] } },
                    {
                        data_conclusao: null,
                        updated_at: { [Op.between]: [inicioMes, fimMes] }
                    }
                ]
            }
        });

        // Despesas mês
        const despesaMes = await Demanda.sum('valor_custo', {
            where: {
                status: 'concluida',
                [Op.or]: [
                    { data_conclusao: { [Op.between]: [inicioMes, fimMes] } },
                    {
                        data_conclusao: null,
                        updated_at: { [Op.between]: [inicioMes, fimMes] }
                    }
                ]
            }
        });

        const saldoMes = (receitaMes || 0) - (despesaMes || 0);

        // --- GRÁFICOS ---

        // Fluxo de Caixa (Últimos 6 meses)
        const fluxoCaixa = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(anoAtual, mesAtual - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            const monthName = start.toLocaleString('pt-BR', { month: 'short' });

            const rec = await Demanda.sum('valor_cobrado', {
                where: {
                    status: 'concluida',
                    [Op.or]: [
                        { data_conclusao: { [Op.between]: [start, end] } },
                        {
                            data_conclusao: null,
                            updated_at: { [Op.between]: [start, end] }
                        }
                    ]
                }
            });

            const desp = await Demanda.sum('valor_custo', {
                where: {
                    status: 'concluida',
                    [Op.or]: [
                        { data_conclusao: { [Op.between]: [start, end] } },
                        {
                            data_conclusao: null,
                            updated_at: { [Op.between]: [start, end] }
                        }
                    ]
                }
            });

            fluxoCaixa.push({
                name: monthName,
                receita: rec || 0,
                despesa: desp || 0
            });
        }

        // Distribuição por Status
        const statusCounts = await Demanda.count({
            group: ['status'],
            attributes: ['status']
        });

        const statusDistrib = statusCounts.map(s => ({
            status: s.status.replace('_', ' ').toUpperCase(),
            count: s.count
        }));

        res.json({
            success: true,
            data: {
                resumo: {
                    receitas_mes: receitaMes || 0,
                    despesas_mes: despesaMes || 0,
                    saldo_mes: saldoMes,
                    a_receber: totalReceber || 0,
                },
                graficos: {
                    fluxo_caixa: fluxoCaixa,
                    status_distrib: statusDistrib
                }
            },
        });
    }

    async listarPagamentos(req, res) {
        const { limit = 50 } = req.query;

        // Fetch latest demands to simulate transactions
        const demandas = await Demanda.findAll({
            limit: parseInt(limit),
            order: [['updated_at', 'DESC']],
            include: [{ association: 'cliente', attributes: ['nome_fantasia'] }]
        });

        // Map demands to transaction structure
        const transacoes = [];
        demandas.forEach(d => {
            if (d.valor_cobrado > 0) {
                transacoes.push({
                    id: `rec-${d.id}`,
                    descricao: `Receita: ${d.titulo}`,
                    valor: d.valor_cobrado,
                    tipo: 'receber',
                    status: d.status === 'concluida' ? 'pago' : 'pendente',
                    data_vencimento: d.data_prazo,
                    data_pagamento: d.status === 'concluida' ? (d.data_conclusao || d.updatedAt) : null,
                    categoria: 'Honorários',
                    cliente_nome: d.cliente?.nome_fantasia
                });
            }
            if (d.valor_custo > 0) {
                transacoes.push({
                    id: `desp-${d.id}`,
                    descricao: `Despesa: ${d.titulo}`,
                    valor: d.valor_custo,
                    tipo: 'pagar',
                    status: d.status === 'concluida' ? 'pago' : 'pendente',
                    data_vencimento: d.data_prazo,
                    data_pagamento: d.status === 'concluida' ? (d.data_conclusao || d.updatedAt) : null,
                    categoria: 'Custos Operacionais',
                    cliente_nome: d.cliente?.nome_fantasia
                });
            }
        });

        res.json({
            success: true,
            data: transacoes
        });
    }

    async obterPagamento(req, res) {
        const { id } = req.params;

        const pagamento = await Pagamento.findByPk(id, {
            include: [
                { association: 'demanda' },
                { association: 'correspondente' },
            ],
        });

        if (!pagamento) {
            throw new AppError('Pagamento não encontrado', 404);
        }

        res.json({
            success: true,
            data: pagamento,
        });
    }

    async criarPagamento(req, res) {
        // Gerar número único
        const count = await Pagamento.count();
        const numero_fatura = `FAT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        const pagamento = await Pagamento.create({
            ...req.body,
            numero_fatura,
        });

        res.status(201).json({
            success: true,
            message: 'Pagamento criado com sucesso',
            data: pagamento,
        });
    }

    async atualizarPagamento(req, res) {
        const { id } = req.params;

        const pagamento = await Pagamento.findByPk(id);

        if (!pagamento) {
            throw new AppError('Pagamento não encontrado', 404);
        }

        await pagamento.update(req.body);

        res.json({
            success: true,
            message: 'Pagamento atualizado com sucesso',
            data: pagamento,
        });
    }

    async marcarComoPago(req, res) {
        const { id } = req.params;
        const { data_pagamento, forma_pagamento } = req.body;

        const pagamento = await Pagamento.findByPk(id);

        if (!pagamento) {
            throw new AppError('Pagamento não encontrado', 404);
        }

        await pagamento.update({
            status: 'pago',
            data_pagamento: data_pagamento || new Date(),
            forma_pagamento,
        });

        res.json({
            success: true,
            message: 'Pagamento marcado como pago',
            data: pagamento,
        });
    }

    async obterFluxoCaixa(req, res) {
        const { inicio, fim } = req.query;

        const where = {};

        if (inicio && fim) {
            where.data_vencimento = {
                [Op.between]: [new Date(inicio), new Date(fim)],
            };
        }

        const pagamentos = await Pagamento.findAll({
            where,
            attributes: [
                'tipo',
                'status',
                [sequelize.fn('DATE', sequelize.col('data_vencimento')), 'data'],
                [sequelize.fn('SUM', sequelize.col('valor')), 'total'],
            ],
            group: ['tipo', 'status', sequelize.fn('DATE', sequelize.col('data_vencimento'))],
            order: [[sequelize.fn('DATE', sequelize.col('data_vencimento')), 'ASC']],
        });

        res.json({
            success: true,
            data: pagamentos,
        });
    }
    async downloadRecibo(req, res) {
        const { id } = req.params;

        const pagamento = await Pagamento.findByPk(id, {
            include: [
                { association: 'demanda' },
                { association: 'correspondente' },
            ],
        });

        if (!pagamento) {
            throw new AppError('Pagamento não encontrado', 404);
        }

        if (pagamento.status !== 'pago') {
            throw new AppError('Apenas pagamentos efetuados podem gerar recibo', 400);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=recibo-${pagamento.id}.pdf`);

        const pdfService = require('../services/pdfService');
        pdfService.generateReceipt(pagamento, res);
    }
}

module.exports = new FinanceiroController();
