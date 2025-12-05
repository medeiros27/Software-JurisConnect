const { Pagamento, Demanda, Correspondente, sequelize } = require('../models');
const { Op } = require('sequelize');

module.exports = {
    async index(req, res) {
        try {
            const {
                page = 1,
                limit = 50,
                data_inicio,
                data_fim,
                status,
                tipo,
                cliente_id,
                correspondente_id,
                sortBy = 'data_agendamento',
                sortOrder = 'DESC'
            } = req.query;

            // 1. Fetch ALL Demandas (with associations)
            const demandas = await Demanda.findAll({
                include: [
                    { association: 'cliente' },
                    { association: 'correspondente' }
                ],
                where: {
                    status: { [Op.ne]: 'cancelada' }
                }
            });

            // 2. Fetch ALL Unlinked Pagamentos
            const pagamentosAvulsos = await Pagamento.findAll({
                where: {
                    demanda_id: null
                },
                include: [
                    { association: 'correspondente' }
                ]
            });

            // 3. Normalize and Aggregate Data
            let items = [];

            // Process Demandas -> Virtual Payments
            demandas.forEach(d => {
                // Robust date fallback to ensure item is not filtered out
                const dataRef = d.data_agendamento || d.createdAt || d.created_at || d.updatedAt || new Date();

                // Receita (Cliente)
                if (parseFloat(d.valor_cobrado) > 0) {
                    items.push({
                        id: `demanda_${d.id}_receita`,
                        original_id: d.id,
                        source: 'demanda',
                        tipo: 'receber',
                        numero_fatura: `DEM-${d.numero}`,
                        descricao: d.titulo || `Demanda ${d.numero}`,
                        valor: parseFloat(d.valor_cobrado),
                        data_vencimento: dataRef,
                        data_agendamento: dataRef,
                        status: d.status_pagamento_cliente || 'pendente',
                        cliente: d.cliente,
                        correspondente: null,
                        observacoes: d.descricao,
                        demanda: d // Include full demand object for UI
                    });
                }

                // Despesa (Correspondente)
                if (d.correspondente_id && parseFloat(d.valor_custo) > 0) {
                    items.push({
                        id: `demanda_${d.id}_despesa`,
                        original_id: d.id,
                        source: 'demanda',
                        tipo: 'pagar',
                        numero_fatura: `DEM-${d.numero}`,
                        descricao: d.titulo || `Demanda ${d.numero}`,
                        valor: parseFloat(d.valor_custo),
                        data_vencimento: dataRef,
                        data_agendamento: dataRef,
                        status: d.status_pagamento_correspondente || 'pendente',
                        cliente: null,
                        correspondente: d.correspondente,
                        observacoes: d.descricao,
                        demanda: d
                    });
                }
            });

            // Process Pagamentos Avulsos
            pagamentosAvulsos.forEach(p => {
                items.push({
                    id: `pagamento_${p.id}`,
                    original_id: p.id,
                    source: 'pagamento',
                    tipo: p.tipo,
                    numero_fatura: p.numero_fatura,
                    descricao: p.observacoes || 'Pagamento Avulso',
                    valor: parseFloat(p.valor),
                    data_vencimento: p.data_vencimento,
                    data_agendamento: p.data_vencimento, // Fallback for sorting
                    status: p.status,
                    cliente: null,
                    correspondente: p.correspondente,
                    observacoes: p.observacoes,
                    demanda: null
                });
            });

            // 4. Apply Filters (In-Memory)
            if (data_inicio && data_fim) {
                const start = new Date(data_inicio);
                const end = new Date(data_fim);
                end.setHours(23, 59, 59, 999);

                items = items.filter(i => {
                    const date = i.data_vencimento ? new Date(i.data_vencimento) : null;
                    return date && date >= start && date <= end;
                });
            }

            if (status) {
                items = items.filter(i => i.status === status);
            }

            if (tipo) {
                items = items.filter(i => i.tipo === tipo);
            }

            if (cliente_id) {
                items = items.filter(i => i.cliente && i.cliente.id == cliente_id);
            }

            if (correspondente_id) {
                items = items.filter(i => i.correspondente && i.correspondente.id == correspondente_id);
            }

            if (req.query.search) {
                const search = req.query.search.toLowerCase();
                items = items.filter(i =>
                    (i.numero_fatura && i.numero_fatura.toLowerCase().includes(search)) ||
                    (i.descricao && i.descricao.toLowerCase().includes(search)) ||
                    (i.cliente && i.cliente.nome_fantasia && i.cliente.nome_fantasia.toLowerCase().includes(search)) ||
                    (i.correspondente && i.correspondente.nome_fantasia && i.correspondente.nome_fantasia.toLowerCase().includes(search))
                );
            }

            // 5. Sorting
            items.sort((a, b) => {
                let valA, valB;

                if (sortBy === 'data_agendamento' || sortBy === 'data_vencimento') {
                    valA = new Date(a[sortBy] || 0);
                    valB = new Date(b[sortBy] || 0);
                } else {
                    valA = a[sortBy];
                    valB = b[sortBy];
                }

                if (sortOrder === 'ASC') {
                    return valA > valB ? 1 : -1;
                } else {
                    return valA < valB ? 1 : -1;
                }
            });

            // 6. Pagination
            const total = items.length;
            const totalValue = items.reduce((acc, curr) => acc + curr.valor, 0);

            const startIndex = (parseInt(page) - 1) * parseInt(limit);
            const endIndex = startIndex + parseInt(limit);
            const paginatedItems = items.slice(startIndex, endIndex);

            return res.json({
                status: 'success',
                data: paginatedItems,
                meta: {
                    total,
                    totalValue,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Erro ao listar pagamentos:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async store(req, res) {
        try {
            const pagamento = await Pagamento.create(req.body);
            return res.status(201).json({ status: 'success', data: pagamento });
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;

            if (id.startsWith('demanda_')) {
                // Handle Virtual Payment Update (Demanda)
                const parts = id.split('_'); // ['demanda', '123', 'receita']
                const demandaId = parts[1];
                const type = parts[2]; // 'receita' or 'despesa'

                const demanda = await Demanda.findByPk(demandaId);
                if (!demanda) return res.status(404).json({ status: 'error', message: 'Demanda não encontrada' });

                const updateData = {};
                // Map fields from request to Demanda fields
                // Usually only status is updated here, but we can map others if needed
                if (req.body.status) {
                    if (type === 'receita') {
                        updateData.status_pagamento_cliente = req.body.status;
                    } else {
                        updateData.status_pagamento_correspondente = req.body.status;
                    }
                }

                // If other fields need updating (like values), map them here
                // For now, focusing on status which is the primary use case for this endpoint in the UI

                await demanda.update(updateData);
                return res.json({ status: 'success', data: demanda });

            } else {
                // Handle Real Payment Update
                const realId = id.startsWith('pagamento_') ? id.split('_')[1] : id;
                const pagamento = await Pagamento.findByPk(realId);
                if (!pagamento) return res.status(404).json({ status: 'error', message: 'Pagamento não encontrado' });
                await pagamento.update(req.body);
                return res.json({ status: 'success', data: pagamento });
            }
        } catch (error) {
            console.error('Erro ao atualizar pagamento:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            let updatedItem;

            if (id.startsWith('demanda_')) {
                // Handle Virtual Payment Update
                const parts = id.split('_'); // ['demanda', '123', 'receita']
                const demandaId = parts[1];
                const type = parts[2]; // 'receita' or 'despesa'

                const demanda = await Demanda.findByPk(demandaId);
                if (!demanda) return res.status(404).json({ status: 'error', message: 'Demanda não encontrada' });

                const updateData = {};
                if (type === 'receita') {
                    updateData.status_pagamento_cliente = status;
                } else {
                    updateData.status_pagamento_correspondente = status;
                }

                await demanda.update(updateData);
                updatedItem = demanda;

            } else {
                // Handle Real Payment Update (legacy or new)
                const realId = id.startsWith('pagamento_') ? id.split('_')[1] : id;
                const pagamento = await Pagamento.findByPk(realId);

                if (pagamento) {
                    await pagamento.update({ status });
                    updatedItem = pagamento;
                } else {
                    return res.status(404).json({ status: 'error', message: 'Pagamento não encontrado' });
                }
            }

            return res.json({ status: 'success', data: updatedItem });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async dashboard(req, res) {
        try {
            const { ano } = req.query;
            const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();
            const startOfYear = new Date(anoAtual, 0, 1);
            const endOfYear = new Date(anoAtual, 11, 31, 23, 59, 59);

            // Fetch all relevant Demandas for the year
            const demandas = await Demanda.findAll({
                where: {
                    status: { [Op.ne]: 'cancelada' },
                    data_agendamento: {
                        [Op.between]: [startOfYear, endOfYear]
                    }
                },
                attributes: ['id', 'valor_cobrado', 'valor_custo', 'data_agendamento', 'status_pagamento_cliente', 'status_pagamento_correspondente']
            });

            // Fetch all relevant Pagamentos (Avulsos) for the year
            // We fetch if either data_pagamento OR data_vencimento is in the year
            const pagamentos = await Pagamento.findAll({
                where: {
                    demanda_id: null,
                    [Op.or]: [
                        { data_pagamento: { [Op.between]: [startOfYear, endOfYear] } },
                        { data_vencimento: { [Op.between]: [startOfYear, endOfYear] } }
                    ]
                },
                attributes: ['id', 'valor', 'tipo', 'status', 'data_pagamento', 'data_vencimento']
            });

            // Initialize 12 months structure
            const meses = Array.from({ length: 12 }, (_, i) => {
                const date = new Date(anoAtual, i, 1);
                return {
                    mes: date.toLocaleString('pt-BR', { month: 'long' }).toUpperCase(),
                    mes_index: i,
                    inicio: new Date(anoAtual, i, 1),
                    fim: new Date(anoAtual, i + 1, 0, 23, 59, 59)
                };
            });

            const performance = [];
            const cashFlow = [];
            const balanco = [];

            const totalPerformance = { faturado: 0, custo: 0, lucro: 0 };
            const totalCashFlow = { recebido: 0, pago: 0, saldo: 0 };
            const totalBalanco = { faturado: 0, custo: 0, lucro: 0, recebera: 0, pagara: 0, recebido: 0, pago: 0 };

            for (const m of meses) {
                // --- 1. PERFORMANCE (Demandas only) ---
                // Filter demandas scheduled in this month
                const demandasMes = demandas.filter(d =>
                    d.data_agendamento && new Date(d.data_agendamento) >= m.inicio && new Date(d.data_agendamento) <= m.fim
                );

                const faturado = demandasMes.reduce((acc, d) => acc + parseFloat(d.valor_cobrado || 0), 0);
                const custo = demandasMes.reduce((acc, d) => acc + parseFloat(d.valor_custo || 0), 0);
                const lucro = faturado - custo;

                performance.push({
                    mes: m.mes,
                    faturado,
                    custo,
                    lucro
                });

                totalPerformance.faturado += faturado;
                totalPerformance.custo += custo;
                totalPerformance.lucro += lucro;

                // --- 2. CASH FLOW (Realized) ---
                // Demandas: Paid in this month (using data_agendamento as proxy for payment date if paid)
                // Pagamentos: Paid in this month (using data_pagamento)

                let recebido = 0;
                let pago = 0;

                // From Demandas
                demandasMes.forEach(d => {
                    if (d.status_pagamento_cliente === 'pago') {
                        recebido += parseFloat(d.valor_cobrado || 0);
                    }
                    if (d.status_pagamento_correspondente === 'pago') {
                        pago += parseFloat(d.valor_custo || 0);
                    }
                });

                // From Pagamentos
                const pagamentosPagosMes = pagamentos.filter(p =>
                    p.status === 'pago' &&
                    p.data_pagamento &&
                    new Date(p.data_pagamento) >= m.inicio &&
                    new Date(p.data_pagamento) <= m.fim
                );

                pagamentosPagosMes.forEach(p => {
                    if (p.tipo === 'receber') recebido += parseFloat(p.valor || 0);
                    if (p.tipo === 'pagar') pago += parseFloat(p.valor || 0);
                });

                const saldo = recebido - pago;

                cashFlow.push({
                    mes: m.mes,
                    recebido,
                    pago,
                    saldo
                });

                totalCashFlow.recebido += recebido;
                totalCashFlow.pago += pago;
                totalCashFlow.saldo += saldo;

                // --- 3. BALANCO (Accrual/Competence) ---
                // Demandas: Scheduled in this month
                // Pagamentos: Due in this month (data_vencimento)

                let balancoFaturado = faturado; // From performance
                let balancoCusto = custo;       // From performance
                let balancoRecebido = 0;
                let balancoRecebera = 0;
                let balancoPago = 0;
                let balancoPagara = 0;

                // From Demandas (already filtered as demandasMes)
                demandasMes.forEach(d => {
                    // Receitas
                    const valReceita = parseFloat(d.valor_cobrado || 0);
                    if (d.status_pagamento_cliente === 'pago') {
                        balancoRecebido += valReceita;
                    } else {
                        balancoRecebera += valReceita;
                    }

                    // Despesas
                    const valDespesa = parseFloat(d.valor_custo || 0);
                    if (d.status_pagamento_correspondente === 'pago') {
                        balancoPago += valDespesa;
                    } else {
                        balancoPagara += valDespesa;
                    }
                });

                // From Pagamentos (Avulsos) - Filter by Vencimento
                const pagamentosVencimentoMes = pagamentos.filter(p =>
                    p.data_vencimento &&
                    new Date(p.data_vencimento) >= m.inicio &&
                    new Date(p.data_vencimento) <= m.fim
                );

                pagamentosVencimentoMes.forEach(p => {
                    const val = parseFloat(p.valor || 0);
                    if (p.tipo === 'receber') {
                        balancoFaturado += val;
                        if (p.status === 'pago') balancoRecebido += val;
                        else balancoRecebera += val;
                    } else if (p.tipo === 'pagar') {
                        balancoCusto += val;
                        if (p.status === 'pago') balancoPago += val;
                        else balancoPagara += val;
                    }
                });

                const balancoLucro = balancoFaturado - balancoCusto;

                balanco.push({
                    mes: m.mes,
                    faturado: balancoFaturado,
                    custo: balancoCusto,
                    lucro: balancoLucro,
                    recebera: balancoRecebera,
                    pagara: balancoPagara,
                    recebido: balancoRecebido,
                    pago: balancoPago
                });

                totalBalanco.faturado += balancoFaturado;
                totalBalanco.custo += balancoCusto;
                totalBalanco.lucro += balancoLucro;
                totalBalanco.recebera += balancoRecebera;
                totalBalanco.pagara += balancoPagara;
                totalBalanco.recebido += balancoRecebido;
                totalBalanco.pago += balancoPago;
            }

            return res.json({
                status: 'success',
                data: {
                    performance,
                    cashFlow,
                    balanco,
                    totals: {
                        performance: totalPerformance,
                        cashFlow: totalCashFlow,
                        balanco: totalBalanco
                    }
                }
            });

        } catch (error) {
            console.error('Erro ao gerar dashboard financeiro:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async bulkUpdate(req, res) {
        try {
            const { ids, status } = req.body;

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ status: 'error', message: 'IDs inválidos' });
            }

            const updateData = { status };
            if (status === 'pago') {
                updateData.data_pagamento = new Date();
            } else {
                updateData.data_pagamento = null;
            }

            // Separate real IDs (integers) from virtual IDs (strings starting with 'demanda_')
            const realIds = [];
            const virtualIds = [];

            ids.forEach(id => {
                if (typeof id === 'string' && id.startsWith('demanda_')) {
                    virtualIds.push(id);
                } else {
                    realIds.push(id);
                }
            });

            // 1. Update Real Payments
            if (realIds.length > 0) {
                await Pagamento.update(updateData, {
                    where: {
                        id: { [Op.in]: realIds }
                    }
                });

                // Sync back to Demandas for real payments
                const updatedPayments = await Pagamento.findAll({
                    where: { id: { [Op.in]: realIds }, demanda_id: { [Op.ne]: null } }
                });

                for (const pagamento of updatedPayments) {
                    const demanda = await Demanda.findByPk(pagamento.demanda_id);
                    if (demanda) {
                        const demandaUpdate = {};
                        if (pagamento.tipo === 'receber') {
                            demandaUpdate.status_pagamento_cliente = status;
                        } else if (pagamento.tipo === 'pagar') {
                            demandaUpdate.status_pagamento_correspondente = status;
                        }
                        await demanda.update(demandaUpdate);
                    }
                }
            }

            // 2. Update Virtual Payments (Demandas)
            if (virtualIds.length > 0) {
                for (const vid of virtualIds) {
                    // Format: demanda_{id}_{type}
                    const parts = vid.split('_');
                    if (parts.length === 3) {
                        const demandaId = parts[1];
                        const type = parts[2]; // 'receita' or 'despesa' (mapped to 'receber'/'pagar' logic)

                        const demanda = await Demanda.findByPk(demandaId);
                        if (demanda) {
                            const demandaUpdate = {};
                            // Map 'receita' -> 'receber' context (status_pagamento_cliente)
                            // Map 'despesa' -> 'pagar' context (status_pagamento_correspondente)
                            if (type === 'receita') {
                                demandaUpdate.status_pagamento_cliente = status;
                            } else if (type === 'despesa') {
                                demandaUpdate.status_pagamento_correspondente = status;
                            }
                            await demanda.update(demandaUpdate);
                        }
                    }
                }
            }

            return res.json({
                status: 'success',
                message: 'Pagamentos atualizados com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar pagamentos em lote:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const realId = id.startsWith('pagamento_') ? id.split('_')[1] : id;
            const pagamento = await Pagamento.findByPk(realId);

            if (!pagamento) {
                return res.status(404).json({ status: 'error', message: 'Pagamento não encontrado' });
            }

            await pagamento.destroy();
            return res.json({ status: 'success', message: 'Pagamento removido com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar pagamento:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async relatorioDRE(req, res) {
        try {
            const { ano } = req.query;
            const anoRef = ano || new Date().getFullYear();

            const pagamentos = await Pagamento.findAll({
                where: {
                    status: 'pago',
                    data_pagamento: {
                        [Op.between]: [`${anoRef}-01-01`, `${anoRef}-12-31`]
                    }
                },
                attributes: [
                    [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM data_pagamento')), 'mes'],
                    'tipo',
                    [sequelize.fn('SUM', sequelize.col('valor')), 'total']
                ],
                group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM data_pagamento')), 'tipo'],
                order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM data_pagamento')), 'ASC']]
            });

            const dre = Array.from({ length: 12 }, (_, i) => ({
                mes: i + 1,
                receita_bruta: 0,
                despesas: 0,
                resultado: 0
            }));

            pagamentos.forEach(p => {
                const mesIndex = parseInt(p.getDataValue('mes')) - 1;
                const valor = parseFloat(p.getDataValue('total'));
                if (p.tipo === 'receber') dre[mesIndex].receita_bruta += valor;
                if (p.tipo === 'pagar') dre[mesIndex].despesas += valor;
            });

            dre.forEach(d => d.resultado = d.receita_bruta - d.despesas);

            return res.json({ status: 'success', data: dre });
        } catch (error) {
            console.error('Erro ao gerar DRE:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async relatorioRanking(req, res) {
        try {
            const { tipo, data_inicio, data_fim } = req.query;
            const where = { status: 'pago' };

            if (data_inicio && data_fim) {
                where.data_pagamento = { [Op.between]: [data_inicio, data_fim] };
            }

            if (tipo === 'clientes') {
                const ranking = await Pagamento.findAll({
                    where: { ...where, tipo: 'receber', demanda_id: { [Op.not]: null } },
                    include: [{
                        model: Demanda, as: 'demanda',
                        include: [{ model: require('../models').Cliente, as: 'cliente', attributes: ['nome_fantasia'] }]
                    }],
                    attributes: [
                        [sequelize.col('demanda.cliente.nome_fantasia'), 'nome'],
                        [sequelize.fn('SUM', sequelize.col('valor')), 'total']
                    ],
                    group: ['demanda.cliente.id', 'demanda.cliente.nome_fantasia'],
                    order: [[sequelize.fn('SUM', sequelize.col('valor')), 'DESC']],
                    limit: 10
                });
                return res.json({ status: 'success', data: ranking });
            } else {
                const ranking = await Pagamento.findAll({
                    where: { ...where, tipo: 'pagar', correspondente_id: { [Op.not]: null } },
                    include: [{ model: Correspondente, as: 'correspondente', attributes: ['nome_fantasia'] }],
                    attributes: [
                        [sequelize.col('correspondente.nome_fantasia'), 'nome'],
                        [sequelize.fn('SUM', sequelize.col('valor')), 'total']
                    ],
                    group: ['correspondente.id', 'correspondente.nome_fantasia'],
                    order: [[sequelize.fn('SUM', sequelize.col('valor')), 'DESC']],
                    limit: 10
                });
                return res.json({ status: 'success', data: ranking });
            }
        } catch (error) {
            console.error('Erro ao gerar ranking:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async exportarRelatorio(req, res) {
        try {
            const { Parser } = require('json2csv');
            const pagamentos = await Pagamento.findAll({
                include: [
                    { model: Demanda, as: 'demanda', attributes: ['titulo'] },
                    { model: Correspondente, as: 'correspondente', attributes: ['nome_fantasia'] }
                ],
                raw: true
            });

            const fields = ['id', 'tipo', 'valor', 'data_vencimento', 'data_pagamento', 'status', 'demanda.titulo', 'correspondente.nome_fantasia'];
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(pagamentos);

            res.header('Content-Type', 'text/csv');
            res.attachment('relatorio_financeiro.csv');
            return res.send(csv);
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async downloadRecibo(req, res) {
        try {
            const { id } = req.params;
            let pagamento;

            if (id.startsWith('demanda_')) {
                // Virtual Payment
                const parts = id.split('_');
                const demandaId = parts[1];
                const type = parts[2]; // 'receita' or 'despesa'

                const demanda = await Demanda.findByPk(demandaId, {
                    include: ['cliente', 'correspondente']
                });

                if (!demanda) throw AppError.notFound('Demanda não encontrada');

                pagamento = {
                    id: id,
                    numero_fatura: `DEM-${demanda.numero}-${type === 'receita' ? 'REC' : 'PAG'}`,
                    tipo: type === 'receita' ? 'receber' : 'pagar',
                    valor: type === 'receita' ? demanda.valor_cobrado : demanda.valor_custo,
                    data_vencimento: demanda.data_agendamento,
                    data_pagamento: type === 'receita' ?
                        (demanda.status_pagamento_cliente === 'pago' ? new Date() : null) :
                        (demanda.status_pagamento_correspondente === 'pago' ? new Date() : null),
                    status: type === 'receita' ? demanda.status_pagamento_cliente : demanda.status_pagamento_correspondente,
                    demanda: demanda,
                    cliente: demanda.cliente,
                    correspondente: demanda.correspondente,
                    observacoes: demanda.descricao
                };

            } else {
                // Real Payment (legacy or new)
                const realId = id.startsWith('pagamento_') ? id.split('_')[1] : id;
                pagamento = await Pagamento.findByPk(realId, {
                    include: [
                        { association: 'demanda' },
                        { association: 'correspondente' },
                        { association: 'demanda', include: [{ association: 'cliente' }] }
                    ],
                });
            }

            if (!pagamento) {
                return res.status(404).json({ status: 'error', message: 'Pagamento não encontrado' });
            }

            if (pagamento.status !== 'pago') {
                return res.status(400).json({ status: 'error', message: 'Apenas pagamentos efetuados podem gerar recibo' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=recibo-${pagamento.id}.pdf`);

            const pdfService = require('../services/pdfService');

            const data = {
                valor: pagamento.valor,
                data_pagamento: pagamento.data_pagamento || new Date(),
                pagador: pagamento.tipo === 'receber' ? (pagamento.demanda?.cliente?.nome_fantasia || 'Cliente') : 'JURISCONNECT',
                recebedor: pagamento.tipo === 'pagar' ? (pagamento.correspondente?.nome_fantasia || 'Correspondente') : 'JURISCONNECT',
                cpf_cnpj: pagamento.tipo === 'pagar' ? pagamento.correspondente?.cpf_cnpj : null,
                referente_a: pagamento.demanda ? `Demanda #${pagamento.demanda?.numero || ''} - ${pagamento.demanda?.titulo || ''}` : 'Serviços prestados',
                observacoes: pagamento.observacoes
            };

            pdfService.generateReceipt(data, res);
        } catch (error) {
            console.error('Erro ao gerar recibo:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async gerarRecibo(req, res) {
        try {
            const data = req.body;

            // Basic validation
            if (!data.valor || !data.pagador) {
                return res.status(400).json({ status: 'error', message: 'Dados incompletos para geração do recibo' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=recibo-customizado.pdf`);

            const pdfService = require('../services/pdfService');
            pdfService.generateReceipt(data, res);
        } catch (error) {
            console.error('Erro ao gerar recibo customizado:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async syncLegacy(req, res) {
        try {
            const demandaService = require('../services/demandaService');
            const demandas = await Demanda.findAll();
            let count = 0;

            for (const demanda of demandas) {
                await demandaService._syncPagamentos(demanda);
                count++;
            }

            return res.json({ status: 'success', message: `${count} demandas sincronizadas com sucesso.` });
        } catch (error) {
            console.error('Erro ao sincronizar:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    }
};
