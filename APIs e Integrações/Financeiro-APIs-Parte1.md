# JURISCONNECT - MÓDULO FINANCEIRO COMPLETO COM RELATÓRIOS COMPLEXOS

## 📋 ÍNDICE

1. [Models Financeiros](#1-models-financeiros)
2. [Controllers Financeiros](#2-controllers-financeiros)
3. [Services de Cálculos](#3-services-de-cálculos)
4. [Relatórios Avançados](#4-relatórios-avançados)
5. [Routes Financeiras](#5-routes-financeiras)
6. [Validators Financeiros](#6-validators-financeiros)
7. [Dashboard Financeiro](#7-dashboard-financeiro)
8. [Integrações Bancárias](#8-integrações-bancárias)

---

# 1. MODELS FINANCEIROS

## 1.1 src/models/Pagamento.js (Expandido)

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pagamento = sequelize.define('Pagamento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_fatura: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      index: true,
    },
    numero_recibo: {
      type: DataTypes.STRING(50),
      unique: true,
    },
    tipo: {
      type: DataTypes.ENUM('receber', 'pagar'),
      allowNull: false,
      index: true,
    },
    categoria: {
      type: DataTypes.ENUM(
        'honorarios',
        'custas_processuais',
        'taxa_correspondente',
        'despesa_operacional',
        'salario',
        'aluguel',
        'internet',
        'outro'
      ),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    valor_original: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    valor_desconto: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    valor_juros: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    valor_multa: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    valor_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    percentual_desconto: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    data_vencimento: {
      type: DataTypes.DATE,
      allowNull: false,
      index: true,
    },
    data_pagamento: {
      type: DataTypes.DATE,
    },
    data_compensacao: {
      type: DataTypes.DATE,
      comment: 'Data de compensação no banco',
    },
    dias_atraso: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        'rascunho',
        'emitido',
        'pendente',
        'pago',
        'pago_parcial',
        'vencido',
        'cancelado',
        'devolvido'
      ),
      defaultValue: 'rascunho',
      index: true,
    },
    forma_pagamento: {
      type: DataTypes.ENUM(
        'dinheiro',
        'pix',
        'ted',
        'boleto',
        'cartao_credito',
        'cartao_debito',
        'transferencia_bancaria',
        'cheque',
        'outro'
      ),
    },
    numero_cheque: {
      type: DataTypes.STRING(20),
    },
    banco_cheque: {
      type: DataTypes.STRING(100),
    },
    comprovante_url: {
      type: DataTypes.STRING(500),
      comment: 'URL do comprovante (PDF, imagem)',
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
    referencia_externa: {
      type: DataTypes.STRING(100),
      comment: 'ID externo do sistema de origem',
    },

    // Relacionamentos
    demanda_id: {
      type: DataTypes.INTEGER,
      references: { model: 'demandas', key: 'id' },
      index: true,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      references: { model: 'clientes', key: 'id' },
      index: true,
    },
    correspondente_id: {
      type: DataTypes.INTEGER,
      references: { model: 'correspondentes', key: 'id' },
      index: true,
    },
    usuario_criado: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },
    usuario_pagador: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },

    // Auditoria
    tentativas_cobranca: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ultima_tentativa_cobranca: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'pagamentos',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tipo', 'status'] },
      { fields: ['data_vencimento', 'status'] },
      { fields: ['cliente_id', 'tipo'] },
      { fields: ['correspondente_id', 'tipo'] },
    ],
  });

  Pagamento.associate = (models) => {
    Pagamento.belongsTo(models.Demanda, {
      foreignKey: 'demanda_id',
      as: 'demanda',
    });
    Pagamento.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente',
    });
    Pagamento.belongsTo(models.Correspondente, {
      foreignKey: 'correspondente_id',
      as: 'correspondente',
    });
    Pagamento.hasMany(models.PagamentoParcela, {
      foreignKey: 'pagamento_id',
      as: 'parcelas',
    });
    Pagamento.hasMany(models.HistoricoPagamento, {
      foreignKey: 'pagamento_id',
      as: 'historico',
    });
  };

  return Pagamento;
};
```

## 1.2 src/models/PagamentoParcela.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PagamentoParcela = sequelize.define('PagamentoParcela', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pagamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'pagamentos', key: 'id' },
    },
    numero_parcela: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_parcelas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valor_parcela: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    data_vencimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    data_pagamento: {
      type: DataTypes.DATE,
    },
    valor_pago: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pendente', 'pago', 'vencido', 'cancelado'),
      defaultValue: 'pendente',
    },
  }, {
    tableName: 'pagamento_parcelas',
    timestamps: true,
    underscored: true,
  });

  return PagamentoParcela;
};
```

## 1.3 src/models/HistoricoPagamento.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistoricoPagamento = sequelize.define('HistoricoPagamento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pagamento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'pagamentos', key: 'id' },
    },
    tipo_operacao: {
      type: DataTypes.ENUM(
        'criacao',
        'emissao',
        'pagamento',
        'pagamento_parcial',
        'desconto',
        'juros',
        'multa',
        'cancelamento',
        'devolucao',
        'reemissao'
      ),
      allowNull: false,
    },
    valor_operacao: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    saldo_anterior: {
      type: DataTypes.DECIMAL(10, 2),
    },
    saldo_novo: {
      type: DataTypes.DECIMAL(10, 2),
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'historico_pagamento',
    timestamps: true,
    underscored: true,
  });

  return HistoricoPagamento;
};
```

## 1.4 src/models/ContaBancaria.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ContaBancaria = sequelize.define('ContaBancaria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_conta: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_conta: {
      type: DataTypes.ENUM('corrente', 'poupanca', 'investimento'),
      defaultValue: 'corrente',
    },
    banco_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    banco_codigo: {
      type: DataTypes.STRING(10),
    },
    agencia: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    numero_conta: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    digito_verificador: {
      type: DataTypes.STRING(5),
    },
    saldo_atual: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    saldo_previsto: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Saldo considerando receitas/despesas futuras',
    },
    data_saldo: {
      type: DataTypes.DATE,
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    chave_pix: {
      type: DataTypes.STRING(255),
      comment: 'Chave PIX da conta',
    },
    titular_nome: {
      type: DataTypes.STRING(255),
    },
    titular_cpf_cnpj: {
      type: DataTypes.STRING(20),
    },
  }, {
    tableName: 'contas_bancarias',
    timestamps: true,
    underscored: true,
  });

  return ContaBancaria;
};
```

## 1.5 src/models/CondicaoPagamento.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CondicaoPagamento = sequelize.define('CondicaoPagamento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    tipo: {
      type: DataTypes.ENUM('a_vista', 'parcelado', 'flexivel'),
      allowValue: false,
    },
    dias_vencimento: {
      type: DataTypes.INTEGER,
      comment: 'Dias após emissão',
    },
    numero_parcelas: {
      type: DataTypes.INTEGER,
      comment: 'Número de parcelas (se parcelado)',
    },
    dias_entre_parcelas: {
      type: DataTypes.INTEGER,
      comment: 'Dias entre cada parcela',
    },
    percentual_juros: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Juros mensal (% ao mês)',
    },
    percentual_desconto_antecipado: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Desconto se pago antes do vencimento',
    },
    percentual_multa_atraso: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Multa por atraso (%)',
    },
    ativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'condicoes_pagamento',
    timestamps: true,
    underscored: true,
  });

  return CondicaoPagamento;
};
```

---

# 2. CONTROLLERS FINANCEIROS

## 2.1 src/controllers/financeiro.controller.js

```javascript
const {
  Pagamento,
  PagamentoParcela,
  HistoricoPagamento,
  ContaBancaria,
  Demanda,
  Cliente,
  Correspondente,
} = require('../models');
const FinanceiroService = require('../services/financeiro.service');
const RelatorioService = require('../services/relatorio.service');
const AppError = require('../utils/AppError');
const { Op, sequelize } = require('sequelize');

class FinanceiroController {
  // CRUD Básico de Pagamentos
  async criarPagamento(req, res) {
    const {
      tipo,
      categoria,
      descricao,
      valor_original,
      percentual_desconto,
      data_vencimento,
      demanda_id,
      cliente_id,
      correspondente_id,
      forma_pagamento,
      condicao_pagamento_id,
    } = req.body;

    // Calcular valores
    const calculo = FinanceiroService.calcularValorFinal(
      valor_original,
      percentual_desconto
    );

    // Gerar número da fatura
    const count = await Pagamento.count();
    const numero_fatura = `FAT-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const pagamento = await Pagamento.create({
      numero_fatura,
      tipo,
      categoria,
      descricao,
      valor_original,
      valor_desconto: calculo.desconto,
      percentual_desconto,
      valor_final: calculo.valorFinal,
      data_vencimento,
      demanda_id,
      cliente_id,
      correspondente_id,
      forma_pagamento,
      status: 'rascunho',
      usuario_criado: req.usuarioId,
    });

    // Se tem condição de pagamento com parcelamento
    if (condicao_pagamento_id) {
      const condicao = await sequelize.models.CondicaoPagamento.findByPk(
        condicao_pagamento_id
      );

      if (condicao && condicao.numero_parcelas > 1) {
        await FinanceiroService.criarParcelas(
          pagamento.id,
          condicao,
          calculo.valorFinal
        );
      }
    }

    // Registrar no histórico
    await HistoricoPagamento.create({
      pagamento_id: pagamento.id,
      tipo_operacao: 'criacao',
      valor_operacao: calculo.valorFinal,
      usuario_id: req.usuarioId,
      observacoes: 'Pagamento criado',
    });

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso',
      data: pagamento,
    });
  }

  async listarPagamentos(req, res) {
    const {
      page = 1,
      limit = 20,
      tipo,
      status,
      categoria,
      cliente_id,
      correspondente_id,
      data_inicio,
      data_fim,
      vencidos,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (categoria) where.categoria = categoria;
    if (cliente_id) where.cliente_id = cliente_id;
    if (correspondente_id) where.correspondente_id = correspondente_id;

    if (data_inicio && data_fim) {
      where.data_vencimento = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)],
      };
    }

    if (vencidos === 'true') {
      where[Op.and] = [
        { data_vencimento: { [Op.lt]: new Date() } },
        { status: { [Op.in]: ['pendente', 'vencido'] } },
      ];
    }

    const { count, rows } = await Pagamento.findAndCountAll({
      where,
      include: [
        { association: 'cliente', attributes: ['id', 'nome_fantasia'] },
        { association: 'correspondente', attributes: ['id', 'nome_fantasia'] },
        { association: 'demanda', attributes: ['id', 'numero', 'titulo'] },
        { association: 'parcelas', attributes: ['numero_parcela', 'valor_parcela', 'status'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['data_vencimento', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        pagamentos: rows,
        paginacao: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  }

  async obterPagamento(req, res) {
    const { id } = req.params;

    const pagamento = await Pagamento.findByPk(id, {
      include: [
        { association: 'cliente' },
        { association: 'correspondente' },
        { association: 'demanda' },
        { association: 'parcelas' },
        {
          association: 'historico',
          attributes: ['id', 'tipo_operacao', 'valor_operacao', 'created_at'],
        },
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

  async registrarPagamento(req, res) {
    const { id } = req.params;
    const {
      data_pagamento,
      forma_pagamento,
      valor_pago,
      comprovante_url,
      observacoes,
    } = req.body;

    const pagamento = await Pagamento.findByPk(id);

    if (!pagamento) {
      throw new AppError('Pagamento não encontrado', 404);
    }

    if (pagamento.status === 'pago') {
      throw new AppError('Pagamento já foi registrado', 400);
    }

    const valor_a_pagar = pagamento.valor_final;
    const eh_pagamento_parcial = valor_pago < valor_a_pagar;

    // Atualizar pagamento
    await pagamento.update({
      data_pagamento: data_pagamento || new Date(),
      forma_pagamento,
      comprovante_url,
      status: eh_pagamento_parcial ? 'pago_parcial' : 'pago',
      usuario_pagador: req.usuarioId,
    });

    // Registrar no histórico
    await HistoricoPagamento.create({
      pagamento_id: pagamento.id,
      tipo_operacao: eh_pagamento_parcial ? 'pagamento_parcial' : 'pagamento',
      valor_operacao: valor_pago,
      saldo_anterior: valor_a_pagar,
      saldo_novo: valor_a_pagar - valor_pago,
      usuario_id: req.usuarioId,
      observacoes: observacoes || 'Pagamento registrado',
    });

    // Se tem parcelamento, atualizar parcelas
    if (pagamento.parcelas && pagamento.parcelas.length > 0) {
      await PagamentoParcela.update(
        { status: 'pago', data_pagamento: new Date() },
        { where: { pagamento_id: id, status: 'pendente' }, limit: 1 }
      );
    }

    res.json({
      success: true,
      message: 'Pagamento registrado com sucesso',
      data: pagamento,
    });
  }

  // Dashboard Financeiro
  async obterDashboard(req, res) {
    const { mes, ano, tipo } = req.query;

    const currentMonth = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const currentYear = ano ? parseInt(ano) : new Date().getFullYear();

    const dataInicio = new Date(currentYear, currentMonth - 1, 1);
    const dataFim = new Date(currentYear, currentMonth, 0);

    // Receita
    const receita = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'receber',
        status: 'pago',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] },
      },
    });

    // Despesa
    const despesa = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'pagar',
        status: 'pago',
        data_pagamento: { [Op.between]: [dataInicio, dataFim] },
      },
    });

    // Total a receber
    const totalReceber = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'receber',
        status: { [Op.in]: ['pendente', 'vencido'] },
      },
    });

    // Total a pagar
    const totalPagar = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'pagar',
        status: { [Op.in]: ['pendente', 'vencido'] },
      },
    });

    // Vencidos
    const vencidosReceber = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'receber',
        status: 'vencido',
      },
    });

    const vencidosPagar = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'pagar',
        status: 'vencido',
      },
    });

    // Lucratividade
    const lucro = (receita || 0) - (despesa || 0);
    const margem = receita > 0 ? ((lucro / receita) * 100).toFixed(2) : 0;

    // Saldo em contas
    const contas = await ContaBancaria.findAll({
      where: { ativa: true },
      attributes: ['id', 'nome_conta', 'saldo_atual', 'saldo_previsto'],
    });

    const saldoTotal = contas.reduce((sum, c) => sum + parseFloat(c.saldo_atual || 0), 0);

    res.json({
      success: true,
      data: {
        periodo: { mes: currentMonth, ano: currentYear },
        receita: receita || 0,
        despesa: despesa || 0,
        lucro,
        margem_lucro: parseFloat(margem),
        total_a_receber: totalReceber || 0,
        total_a_pagar: totalPagar || 0,
        vencidos_receber: vencidosReceber || 0,
        vencidos_pagar: vencidosPagar || 0,
        saldo_contas: saldoTotal,
        contas,
      },
    });
  }

  // Fluxo de Caixa
  async obterFluxoCaixa(req, res) {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      throw new AppError('data_inicio e data_fim são obrigatórios', 400);
    }

    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);

    const fluxo = await Pagamento.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('data_vencimento')), 'data'],
        'tipo',
        [sequelize.fn('SUM', sequelize.col('valor_final')), 'total'],
      ],
      where: {
        data_vencimento: { [Op.between]: [inicio, fim] },
        status: { [Op.in]: ['pendente', 'pago', 'vencido'] },
      },
      group: [sequelize.fn('DATE', sequelize.col('data_vencimento')), 'tipo'],
      order: [[sequelize.fn('DATE', sequelize.col('data_vencimento')), 'ASC']],
      raw: true,
    });

    // Processar para formato de gráfico
    const processado = RelatorioService.processarFluxoCaixa(fluxo);

    res.json({
      success: true,
      data: {
        periodo: { inicio: data_inicio, fim: data_fim },
        fluxo: processado,
      },
    });
  }

  // Relatório por Cliente
  async obterRelatorioPorCliente(req, res) {
    const { data_inicio, data_fim, cliente_id } = req.query;

    const where = {};
    if (data_inicio && data_fim) {
      where.data_pagamento = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)],
      };
    }
    if (cliente_id) where.cliente_id = cliente_id;

    const relatorio = await Pagamento.findAll({
      attributes: [
        'cliente_id',
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade'],
        [sequelize.fn('SUM', sequelize.col('valor_final')), 'total'],
      ],
      where: { ...where, status: 'pago' },
      include: [{ association: 'cliente', attributes: ['nome_fantasia'] }],
      group: ['cliente_id', 'tipo'],
      order: [[sequelize.literal('total'), 'DESC']],
    });

    res.json({
      success: true,
      data: relatorio,
    });
  }

  // Relatório por Correspondente
  async obterRelatorioPorCorrespondente(req, res) {
    const { data_inicio, data_fim } = req.query;

    const where = {};
    if (data_inicio && data_fim) {
      where.data_pagamento = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)],
      };
    }

    const relatorio = await Pagamento.findAll({
      attributes: [
        'correspondente_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade'],
        [sequelize.fn('SUM', sequelize.col('valor_final')), 'total_pago'],
        [
          sequelize.fn(
            'SUM',
            sequelize.where(
              sequelize.col('valor_desconto'),
              Op.gt,
              0
            )
          ),
          'total_desconto',
        ],
      ],
      where: { ...where, tipo: 'pagar', status: 'pago' },
      include: [{ association: 'correspondente', attributes: ['nome_fantasia'] }],
      group: ['correspondente_id'],
      order: [[sequelize.literal('total_pago'), 'DESC']],
    });

    res.json({
      success: true,
      data: relatorio,
    });
  }

  // Análise de Inadimplência
  async obterAnaliseInadimplencia(req, res) {
    const inadimplentes = await Pagamento.findAll({
      where: {
        tipo: 'receber',
        status: 'vencido',
        data_vencimento: { [Op.lt]: new Date() },
      },
      attributes: [
        'cliente_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade_vencida'],
        [sequelize.fn('SUM', sequelize.col('valor_final')), 'valor_vencido'],
        [sequelize.fn('MAX', sequelize.col('dias_atraso')), 'dias_atraso_max'],
      ],
      include: [{ association: 'cliente', attributes: ['nome_fantasia', 'email'] }],
      group: ['cliente_id'],
      order: [[sequelize.literal('valor_vencido'), 'DESC']],
      having: sequelize.where(
        sequelize.fn('SUM', sequelize.col('valor_final')),
        Op.gt,
        0
      ),
    });

    res.json({
      success: true,
      data: {
        total_clientes_inadimplentes: inadimplentes.length,
        valor_total_vencido: inadimplentes.reduce((sum, c) => sum + parseFloat(c.valor_vencido || 0), 0),
        inadimplentes,
      },
    });
  }

  // Projeção de Receita
  async obterProjecaoReceita(req, res) {
    const { meses = 6 } = req.query;

    const projecao = [];

    for (let i = 0; i < meses; i++) {
      const dataAtual = new Date();
      dataAtual.setMonth(dataAtual.getMonth() + i);

      const inicio = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
      const fim = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

      const receitaPrevista = await Pagamento.sum('valor_final', {
        where: {
          tipo: 'receber',
          status: { [Op.in]: ['pendente', 'pago'] },
          data_vencimento: { [Op.between]: [inicio, fim] },
        },
      });

      const receitaRealizada = await Pagamento.sum('valor_final', {
        where: {
          tipo: 'receber',
          status: 'pago',
          data_pagamento: { [Op.between]: [inicio, fim] },
        },
      });

      projecao.push({
        mes: `${String(dataAtual.getMonth() + 1).padStart(2, '0')}/${dataAtual.getFullYear()}`,
        prevista: receitaPrevista || 0,
        realizada: receitaRealizada || 0,
      });
    }

    res.json({
      success: true,
      data: {
        periodo_meses: meses,
        projecao,
      },
    });
  }
}

module.exports = new FinanceiroController();
```

---

# 3. SERVICES DE CÁLCULOS

## 3.1 src/services/financeiro.service.js

```javascript
const { PagamentoParcela, HistoricoPagamento } = require('../models');
const logger = require('../utils/logger');

class FinanceiroService {
  /**
   * Calcular valor final com desconto
   */
  static calcularValorFinal(valorOriginal, percentualDesconto = 0) {
    const desconto = (valorOriginal * percentualDesconto) / 100;
    const valorFinal = valorOriginal - desconto;

    return {
      valorOriginal,
      desconto,
      percentualDesconto,
      valorFinal: parseFloat(valorFinal.toFixed(2)),
    };
  }

  /**
   * Calcular juros por atraso
   */
  static calcularJuros(valorOriginal, percentualJuros, diasAtraso) {
    if (diasAtraso <= 0) return 0;

    // Juros simples: (Valor × Taxa × Tempo) / 100
    const juros = (valorOriginal * (percentualJuros / 100) * (diasAtraso / 30));

    return parseFloat(juros.toFixed(2));
  }

  /**
   * Calcular multa por atraso
   */
  static calcularMulta(valorOriginal, percentualMulta, diasAtraso) {
    if (diasAtraso <= 0) return 0;

    // Multa em percentual do valor
    const multa = (valorOriginal * percentualMulta) / 100;

    return parseFloat(multa.toFixed(2));
  }

  /**
   * Calcular desconto por pagamento antecipado
   */
  static calcularDescontoAntecipado(valorOriginal, percentualDesconto, diasAntecipacao) {
    if (diasAntecipacao <= 0) return 0;

    const desconto = (valorOriginal * percentualDesconto) / 100;

    return parseFloat(desconto.toFixed(2));
  }

  /**
   * Criar parcelas de um pagamento
   */
  static async criarParcelas(pagamentoId, condicao, valorTotal) {
    try {
      const valorParcula = valorTotal / condicao.numero_parcelas;

      const parcelas = [];

      for (let i = 1; i <= condicao.numero_parcelas; i++) {
        const dataParcela = new Date();
        dataParcela.setDate(
          dataParcela.getDate() + (condicao.dias_entre_parcelas * i)
        );

        parcelas.push({
          pagamento_id: pagamentoId,
          numero_parcela: i,
          total_parcelas: condicao.numero_parcelas,
          valor_parcela: parseFloat(valorParcula.toFixed(2)),
          data_vencimento: dataParcela,
          status: 'pendente',
        });
      }

      await PagamentoParcela.bulkCreate(parcelas);
      logger.info(`Parcelas criadas: ${condicao.numero_parcelas} para pagamento ${pagamentoId}`);

      return parcelas;
    } catch (error) {
      logger.error('Erro ao criar parcelas:', error);
      throw error;
    }
  }

  /**
   * Calcular idade da cobrança
   */
  static calcularIdadeCobranca(dataVencimento) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);

    const diferenca = hoje - vencimento;
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

    return Math.max(0, dias);
  }

  /**
   * Calcular saldo previsto da conta
   */
  static async calcularSaldoPrevisto(contaId) {
    const { Pagamento } = require('../models');
    const { Op } = require('sequelize');

    // Receitas futuras
    const receitasFuturas = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'receber',
        status: { [Op.in]: ['pendente', 'emitido'] },
        data_vencimento: { [Op.gte]: new Date() },
      },
    });

    // Despesas futuras
    const despesasFuturas = await Pagamento.sum('valor_final', {
      where: {
        tipo: 'pagar',
        status: { [Op.in]: ['pendente', 'emitido'] },
        data_vencimento: { [Op.gte]: new Date() },
      },
    });

    return {
      receitas_futuras: receitasFuturas || 0,
      despesas_futuras: despesasFuturas || 0,
      saldo_previsto: (receitasFuturas || 0) - (despesasFuturas || 0),
    };
  }

  /**
   * Aplicar multa e juros automáticos
   */
  static async aplicarPenalizacoes(pagamentoId) {
    const { Pagamento } = require('../models');

    const pagamento = await Pagamento.findByPk(pagamentoId);

    if (!pagamento || pagamento.status === 'pago') {
      return null;
    }

    const diasAtraso = this.calcularIdadeCobranca(pagamento.data_vencimento);

    if (diasAtraso > 0) {
      const juros = this.calcularJuros(pagamento.valor_final, 1, diasAtraso); // 1% ao mês
      const multa = this.calcularMulta(pagamento.valor_final, 2, diasAtraso); // 2% multa

      await pagamento.update({
        valor_juros: juros,
        valor_multa: multa,
        dias_atraso: diasAtraso,
      });

      // Registrar no histórico
      await HistoricoPagamento.create({
        pagamento_id: pagamentoId,
        tipo_operacao: 'juros',
        valor_operacao: juros + multa,
        usuario_id: 1, // Sistema
        observacoes: `Juros (${juros}) + Multa (${multa}) por ${diasAtraso} dias de atraso`,
      });

      return { juros, multa, dias_atraso: diasAtraso };
    }

    return null;
  }

  /**
   * Calcular KPI: Ticket Médio
   */
  static async calcularTicketMedio(tipo = 'receber') {
    const { Pagamento } = require('../models');

    const resultado = await Pagamento.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('valor_final')), 'ticket_medio'],
      ],
      where: { tipo, status: 'pago' },
      raw: true,
    });

    return parseFloat(resultado?.ticket_medio || 0).toFixed(2);
  }

  /**
   * Calcular KPI: Ciclo de Cobrança
   */
  static async calcularCicloCobranca() {
    const { Pagamento } = require('../models');
    const { Op } = require('sequelize');

    const ciclos = await Pagamento.findAll({
      attributes: [
        [
          require('sequelize').sequelize.literal(
            "DATE_PART('day', data_pagamento::timestamp - data_vencimento::timestamp)"
          ),
          'dias_ciclo',
        ],
      ],
      where: {
        tipo: 'receber',
        status: 'pago',
        data_pagamento: { [Op.not]: null },
      },
      raw: true,
    });

    const media = ciclos.length > 0
      ? ciclos.reduce((sum, c) => sum + parseFloat(c.dias_ciclo || 0), 0) / ciclos.length
      : 0;

    return parseFloat(media.toFixed(2));
  }

  /**
   * Calcular Taxa de Inadimplência
   */
  static async calcularTaxaInadimplencia() {
    const { Pagamento } = require('../models');

    const totalVencidos = await Pagamento.count({
      where: { tipo: 'receber', status: 'vencido' },
    });

    const totalRecebimentos = await Pagamento.count({
      where: { tipo: 'receber', status: { [Op.in]: ['pago', 'vencido'] } },
    });

    const taxa = totalRecebimentos > 0
      ? ((totalVencidos / totalRecebimentos) * 100).toFixed(2)
      : 0;

    return parseFloat(taxa);
  }
}

module.exports = FinanceiroService;
```

---

**Módulo Financeiro Completo - Parte 1/2** ✅

**Continuação com Relatórios Avançados, Routes e Dashboard nos próximos arquivos...**