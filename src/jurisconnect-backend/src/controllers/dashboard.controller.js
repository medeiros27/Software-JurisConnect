const { Demanda, Pagamento, Cliente, Correspondente } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

class DashboardController {
    constructor() {
        this.obterKPIs = this.obterKPIs.bind(this);
        this.obterGraficos = this.obterGraficos.bind(this);
        this.obterDashboardCompleto = this.obterDashboardCompleto.bind(this);
        this._getAgendamentosProximos = this._getAgendamentosProximos.bind(this);
        this._getHistoricoFinanceiro = this._getHistoricoFinanceiro.bind(this);
    }

    async obterKPIs(req, res) {
        const hoje = new Date();
        // Default to 2025 if current year is 2024 (migration context), otherwise use current year or query param
        const anoParam = req.query.ano ? parseInt(req.query.ano) : null;
        const anoAtual = anoParam || (hoje.getFullYear() === 2024 ? 2025 : hoje.getFullYear());

        // If year is 2025 and we are in 2024, default month to November (or current month if in 2025)
        // Actually, for KPIs "Current Month", if we are in 2024 viewing 2025, what is "Current Month"?
        // Let's assume January 2025 if we are in 2024, or just use the current month index but for 2025.
        // Better: Allow month param.
        const mesParam = req.query.mes ? parseInt(req.query.mes) - 1 : null;
        const mesAtual = mesParam !== null ? mesParam : (anoAtual === 2025 && hoje.getFullYear() === 2024 ? 0 : hoje.getMonth());

        // Total demandas ativas
        const demandasAtivas = await Demanda.count({
            where: {
                status: {
                    [Op.in]: ['pendente', 'em_andamento', 'aguardando_correspondente'],
                },
            },
        });

        // Receita mês atual (Validando se a demanda existe ou se é pagamento avulso)
        const receitaMes = await Pagamento.sum('valor', {
            where: {
                tipo: 'receber',
                status: 'pago',
                data_pagamento: {
                    [Op.gte]: new Date(anoAtual, mesAtual, 1),
                    [Op.lt]: new Date(anoAtual, mesAtual + 1, 1),
                },
                [Op.or]: [
                    { demanda_id: null },
                    { '$demanda.id$': { [Op.ne]: null } }
                ]
            },
            include: [{
                model: Demanda,
                as: 'demanda',
                required: false,
                attributes: []
            }]
        });

        // Total clientes ativos
        const totalClientes = await Cliente.count({ where: { ativo: true } });

        // Total correspondentes ativos
        const totalCorrespondentes = await Correspondente.count({
            where: { ativo: true },
        });

        // Taxa cumprimento prazos
        const demandas30Dias = await Demanda.count({
            where: {
                status: 'concluida',
                data_conclusao: {
                    [Op.gte]: new Date(hoje.setDate(hoje.getDate() - 30)),
                },
            },
        });

        const demandasNoPrazo = await Demanda.count({
            where: {
                status: 'concluida',
                data_conclusao: {
                    [Op.gte]: new Date(hoje.setDate(hoje.getDate() - 30)),
                    [Op.lte]: sequelize.col('data_prazo'),
                },
            },
        });

        const taxaCumprimento = demandas30Dias > 0
            ? ((demandasNoPrazo / demandas30Dias) * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            data: {
                demandas_ativas: demandasAtivas,
                receita_mes: receitaMes || 0,
                total_clientes: totalClientes,
                total_correspondentes: totalCorrespondentes,
                taxa_cumprimento: parseFloat(taxaCumprimento),
            },
        });
    }

    async obterGraficos(req, res) {
        // Receita últimos 6 meses
        const seismesesAtras = new Date();
        seismesesAtras.setMonth(seismesesAtras.getMonth() - 6);

        const receitaMensal = await Pagamento.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento')), 'mes'],
                [sequelize.fn('SUM', sequelize.col('valor')), 'total'],
            ],
            where: {
                tipo: 'receber',
                status: 'pago',
                data_pagamento: { [Op.gte]: seismesesAtras }
            },
            include: [{
                model: Demanda,
                as: 'demanda',
                required: true, // EXIGE demanda válida
                attributes: [],
                where: { status: { [Op.ne]: 'cancelada' } }
            }],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento')), 'ASC']],
        });

        // Demandas por status
        const demandasPorStatus = await Demanda.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            ],
            where: { status: { [Op.ne]: 'cancelada' } },
            group: ['status'],
        });

        res.json({
            success: true,
            data: {
                receita_mensal: receitaMensal,
                demandas_por_status: demandasPorStatus,
            },
        });
    }

    async obterDashboardCompleto(req, res) {
        const { periodo } = req.query;
        const hoje = new Date();
        let inicio, fim;

        if (periodo === 'hoje') {
            inicio = new Date();
            inicio.setHours(0, 0, 0, 0);
            fim = new Date();
            fim.setHours(23, 59, 59, 999);
        } else if (periodo === '7dias') {
            fim = new Date();
            inicio = new Date();
            inicio.setDate(fim.getDate() - 7);
        } else if (periodo === 'ano') {
            const anoAtual = hoje.getFullYear();
            inicio = new Date(anoAtual, 0, 1);
            fim = new Date(anoAtual, 11, 31, 23, 59, 59);
        } else {
            // Padrão: Mês atual
            // Padrão: Mês atual
            const anoParam = req.query.ano ? parseInt(req.query.ano) : null;
            const anoAtual = anoParam || (hoje.getFullYear() === 2024 ? 2025 : hoje.getFullYear());

            const mesParam = req.query.mes ? parseInt(req.query.mes) - 1 : null;
            const mesAtual = mesParam !== null ? mesParam : (anoAtual === 2025 && hoje.getFullYear() === 2024 ? 0 : hoje.getMonth());

            inicio = new Date(anoAtual, mesAtual, 1);
            fim = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59); // Último dia do mês
        }

        // --- KPIs Financeiros (Baseado em Pagamentos Realizados - Cash Basis) ---

        // Receita Realizada (Pagamentos Recebidos)
        const receitaRealizada = await Pagamento.sum('valor', {
            where: {
                tipo: 'receber',
                status: 'pago',
                data_pagamento: { [Op.between]: [inicio, fim] }
            },
            include: [{
                model: Demanda,
                as: 'demanda',
                required: true, // EXIGE demanda válida
                attributes: [],
                where: { status: { [Op.ne]: 'cancelada' } }
            }]
        }) || 0;

        // Despesa Realizada (Pagamentos Efetuados)
        const despesaRealizada = await Pagamento.sum('valor', {
            where: {
                tipo: 'pagar',
                status: 'pago',
                data_pagamento: { [Op.between]: [inicio, fim] }
            },
            include: [{
                model: Demanda,
                as: 'demanda',
                required: true, // EXIGE demanda válida
                attributes: [],
                where: { status: { [Op.ne]: 'cancelada' } }
            }]
        }) || 0;

        // Custo com Correspondentes (Pagamentos para Correspondentes)
        const custoCorrespondentes = await Pagamento.sum('valor', {
            where: {
                tipo: 'pagar',
                status: 'pago',
                correspondente_id: { [Op.ne]: null }, // Tem correspondente
                data_pagamento: { [Op.between]: [inicio, fim] }
            },
            include: [{ // Também filtrar por demanda válida para consistência
                model: Demanda,
                as: 'demanda',
                required: true,
                attributes: [],
                where: { status: { [Op.ne]: 'cancelada' } }
            }]
        }) || 0;

        // --- KPIs Previstos (Baseado em Demandas Criadas/Agendadas no Período) ---
        // Receita Prevista (Soma do valor_cobrado das demandas do período)
        const receitaPrevista = await Demanda.sum('valor_cobrado', {
            where: {
                status: { [Op.ne]: 'cancelada' },
                [Op.or]: [
                    { created_at: { [Op.between]: [inicio, fim] } },
                    { data_agendamento: { [Op.between]: [inicio, fim] } }
                ]
            }
        }) || 0;

        // Custo Previsto (Soma do valor_custo das demandas do período)
        const custoPrevisto = await Demanda.sum('valor_custo', {
            where: {
                status: { [Op.ne]: 'cancelada' },
                [Op.or]: [
                    { created_at: { [Op.between]: [inicio, fim] } },
                    { data_agendamento: { [Op.between]: [inicio, fim] } }
                ]
            }
        }) || 0;

        // Lucro Previsto
        const lucroPrevisto = receitaPrevista - custoPrevisto;

        // Lucro Líquido
        const lucroLiquido = receitaRealizada - despesaRealizada;

        // Margem de Lucro
        const margemLucro = receitaRealizada > 0
            ? ((lucroLiquido / receitaRealizada) * 100).toFixed(1)
            : 0;

        // --- KPIs Operacionais ---

        // Demandas Concluídas no Período (para Ticket Médio)
        const demandasConcluidas = await Demanda.count({
            where: {
                status: 'concluida',
                data_conclusao: { [Op.between]: [inicio, fim] }
            }
        });

        // Ticket Médio (Receita / Demandas Concluídas)
        // Se não houver concluídas, usa Receita / 1 para não dividir por zero (ou 0 se receita 0)
        const ticketMedio = demandasConcluidas > 0
            ? receitaRealizada / demandasConcluidas
            : (receitaRealizada > 0 ? receitaRealizada : 0);

        // Prazos Críticos (Vencendo em 48h)
        const dataLimiteCritica = new Date();
        dataLimiteCritica.setHours(dataLimiteCritica.getHours() + 48);

        const prazosCriticosCount = await Demanda.count({
            where: {
                status: { [Op.notIn]: ['concluida', 'cancelada'] },
                data_prazo: {
                    [Op.gte]: new Date(),
                    [Op.lte]: dataLimiteCritica
                }
            }
        });

        const prazosCriticosLista = await Demanda.findAll({
            where: {
                status: { [Op.notIn]: ['concluida', 'cancelada'] },
                data_prazo: {
                    [Op.gte]: new Date(),
                    [Op.lte]: dataLimiteCritica
                }
            },
            limit: 5,
            order: [['data_prazo', 'ASC']],
            attributes: ['id', 'titulo', 'numero', 'data_prazo'],
            include: [{ association: 'cliente', attributes: ['nome_fantasia'] }]
        });

        // Próximos Recebimentos (Cash Flow - 7 dias)
        const dataLimiteRecebimento = new Date();
        dataLimiteRecebimento.setDate(dataLimiteRecebimento.getDate() + 7);

        const proximosRecebimentos = await Pagamento.sum('valor', {
            where: {
                tipo: 'receber',
                status: 'pendente',
                data_vencimento: {
                    [Op.gte]: new Date(),
                    [Op.lte]: dataLimiteRecebimento
                },
                [Op.or]: [
                    { demanda_id: null },
                    { '$demanda.id$': { [Op.ne]: null } }
                ]
            },
            include: [{
                model: Demanda,
                as: 'demanda',
                required: false,
                attributes: [],
                where: { status: { [Op.ne]: 'cancelada' } }
            }]
        }) || 0;

        // --- Dados para Gráficos e Listas ---

        // Gráficos - Demandas por Status
        const demandasPorStatusRaw = await Demanda.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
            ],
            where: { status: { [Op.ne]: 'cancelada' } },
            group: ['status'],
        });

        const demandasPorStatus = {};
        demandasPorStatusRaw.forEach(item => {
            demandasPorStatus[item.status] = parseInt(item.get('total'));
        });

        // Demandas Recentes
        const demandasRecentes = await Demanda.findAll({
            where: {
                updated_at: { [Op.between]: [inicio, fim] },
                status: { [Op.ne]: 'cancelada' }
            },
            limit: 5,
            order: [['updated_at', 'DESC']],
            include: [
                { association: 'cliente', attributes: ['nome_fantasia'] }
            ]
        });

        const demandasRecentesFormatadas = demandasRecentes.map(d => ({
            id: d.id,
            titulo: d.titulo,
            numero: d.numero,
            status: d.status,
            cliente_nome: d.cliente?.nome_fantasia
        }));

        // Dados adicionais
        const agendamentosProximos = await this._getAgendamentosProximos(inicio, fim, periodo);
        const historicoFinanceiro = await this._getHistoricoFinanceiro(periodo);

        res.json({
            success: true,
            data: {
                // Novos KPIs
                lucro_liquido: parseFloat(lucroLiquido),
                custo_correspondentes: parseFloat(custoCorrespondentes),
                ticket_medio: parseFloat(ticketMedio),
                margem_lucro: parseFloat(margemLucro),

                // KPIs Previstos
                receita_prevista: parseFloat(receitaPrevista),
                custo_previsto: parseFloat(custoPrevisto),
                lucro_previsto: parseFloat(lucroPrevisto),

                // Alertas
                prazos_criticos_count: prazosCriticosCount,
                prazos_criticos_lista: prazosCriticosLista,
                proximos_recebimentos: parseFloat(proximosRecebimentos),

                // Legado/Outros
                receita_mes: parseFloat(receitaRealizada),
                demandas_ativas: await Demanda.count({ where: { status: { [Op.in]: ['pendente', 'em_andamento'] } } }),

                demandas_por_status: demandasPorStatus,
                demandas_recentes: demandasRecentesFormatadas,
                agendamentos_proximos: agendamentosProximos,
                historico_financeiro: historicoFinanceiro
            },
        });
    }

    async _getAgendamentosProximos(inicio, fim, periodo) {
        // "Próximos Eventos" should always be from NOW onwards
        const agendaInicio = new Date();

        const agendamentos = await Demanda.findAll({
            where: {
                data_agendamento: { [Op.gte]: agendaInicio },
                status: { [Op.notIn]: ['concluida', 'cancelada'] }
            },
            order: [['data_agendamento', 'ASC']],
            limit: 10,
            include: [{ association: 'cliente', attributes: ['nome_fantasia'] }]
        });

        return agendamentos.map(d => ({
            id: d.id,
            titulo: d.titulo,
            data: d.data_agendamento,
            cliente: d.cliente?.nome_fantasia
        }));
    }

    async _getHistoricoFinanceiro(periodo) {
        const pontos = [];
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();

        if (periodo === 'ano') {
            // 12 meses do ano atual
            for (let i = 0; i < 12; i++) {
                const inicio = new Date(anoAtual, i, 1);
                const fim = new Date(anoAtual, i + 1, 0, 23, 59, 59);
                pontos.push({
                    inicio,
                    fim,
                    label: inicio.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
                });
            }
        } else if (periodo === 'mes') {
            // Dias do mês atual
            const mesAtual = hoje.getMonth();
            const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();

            for (let i = 1; i <= ultimoDia; i++) {
                const inicio = new Date(anoAtual, mesAtual, i, 0, 0, 0);
                const fim = new Date(anoAtual, mesAtual, i, 23, 59, 59);
                pontos.push({
                    inicio,
                    fim,
                    label: `${i}`.padStart(2, '0')
                });
            }
        } else if (periodo === '7dias') {
            // Últimos 7 dias
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const inicio = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
                const fim = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
                pontos.push({
                    inicio,
                    fim,
                    label: inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                });
            }
        } else {
            // Hoje (apenas 1 ponto)
            const inicio = new Date();
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date();
            fim.setHours(23, 59, 59, 999);
            pontos.push({
                inicio,
                fim,
                label: 'Hoje'
            });
        }

        const dados = [];
        for (const ponto of pontos) {
            // PERFORMANCE BASEADA EM DEMANDAS (data_agendamento)

            // Faturado (Receita Total)
            const faturado = await Demanda.sum('valor_cobrado', {
                where: {
                    status: { [Op.ne]: 'cancelada' },
                    data_agendamento: {
                        [Op.between]: [ponto.inicio, ponto.fim],
                        [Op.ne]: null
                    }
                }
            }) || 0;

            // Custo (Despesa Total)
            const custo = await Demanda.sum('valor_custo', {
                where: {
                    status: { [Op.ne]: 'cancelada' },
                    data_agendamento: {
                        [Op.between]: [ponto.inicio, ponto.fim],
                        [Op.ne]: null
                    }
                }
            }) || 0;

            dados.push({
                mes: ponto.label,
                receita: parseFloat(faturado),
                despesa: parseFloat(custo),
                lucro: parseFloat(faturado - custo)
            });
        }
        return dados;
    }
}

module.exports = new DashboardController();
