# JURISCONNECT - MÓDULO FINANCEIRO (PARTE 2)

## 📋 CONTINUAÇÃO

4. [Relatórios Avançados](#4-relatórios-avançados)
5. [Routes Financeiras](#5-routes-financeiras)
6. [Validators Financeiros](#6-validators-financeiros)
7. [Exportação de Relatórios](#7-exportação-de-relatórios)
8. [Exemplo de Uso Completo](#8-exemplo-de-uso-completo)

---

# 4. RELATÓRIOS AVANÇADOS

## 4.1 src/services/relatorio.service.js

```javascript
const { Pagamento, Cliente, Correspondente } = require('../models');
const { Op, sequelize } = require('sequelize');
const ExcelJS = require('exceljs');
const pdf = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class RelatorioService {
  /**
   * Relatório de Receitas vs Despesas
   */
  static async gerarReceitasVsDespesas(dataInicio, dataFim) {
    const meses = this.gerarIntervaloMeses(dataInicio, dataFim);
    const dados = [];

    for (const mes of meses) {
      const inicio = new Date(mes.ano, mes.mes - 1, 1);
      const fim = new Date(mes.ano, mes.mes, 0);

      const receita = await Pagamento.sum('valor_final', {
        where: {
          tipo: 'receber',
          status: 'pago',
          data_pagamento: { [Op.between]: [inicio, fim] },
        },
      });

      const despesa = await Pagamento.sum('valor_final', {
        where: {
          tipo: 'pagar',
          status: 'pago',
          data_pagamento: { [Op.between]: [inicio, fim] },
        },
      });

      dados.push({
        mes: `${String(mes.mes).padStart(2, '0')}/${mes.ano}`,
        receita: receita || 0,
        despesa: despesa || 0,
        lucro: (receita || 0) - (despesa || 0),
        margem: receita > 0 ? (((receita - despesa) / receita) * 100).toFixed(2) : 0,
      });
    }

    return dados;
  }

  /**
   * Análise de Fluxo de Caixa
   */
  static processarFluxoCaixa(fluxoBruto) {
    const fluxoProcessado = {};

    fluxoBruto.forEach((item) => {
      if (!fluxoProcessado[item.data]) {
        fluxoProcessado[item.data] = {
          data: item.data,
          receita: 0,
          despesa: 0,
        };
      }

      if (item.tipo === 'receber') {
        fluxoProcessado[item.data].receita += parseFloat(item.total || 0);
      } else {
        fluxoProcessado[item.data].despesa += parseFloat(item.total || 0);
      }
    });

    return Object.values(fluxoProcessado).map((item) => ({
      ...item,
      saldo: item.receita - item.despesa,
    }));
  }

  /**
   * Relatório Detalhado por Cliente
   */
  static async gerarRelatorioCliente(clienteId, dataInicio, dataFim) {
    const pagamentos = await Pagamento.findAll({
      where: {
        cliente_id: clienteId,
        data_pagamento: {
          [Op.between]: [new Date(dataInicio), new Date(dataFim)],
        },
      },
      include: [
        { association: 'demanda', attributes: ['numero', 'titulo'] },
      ],
      order: [['data_pagamento', 'ASC']],
    });

    const resumo = {
      total_transacoes: pagamentos.length,
      receita_total: pagamentos
        .filter((p) => p.tipo === 'receber')
        .reduce((sum, p) => sum + parseFloat(p.valor_final || 0), 0),
      despesa_total: pagamentos
        .filter((p) => p.tipo === 'pagar')
        .reduce((sum, p) => sum + parseFloat(p.valor_final || 0), 0),
      desconto_total: pagamentos.reduce((sum, p) => sum + parseFloat(p.valor_desconto || 0), 0),
      juros_total: pagamentos.reduce((sum, p) => sum + parseFloat(p.valor_juros || 0), 0),
      multa_total: pagamentos.reduce((sum, p) => sum + parseFloat(p.valor_multa || 0), 0),
    };

    resumo.lucro = resumo.receita_total - resumo.despesa_total;

    return {
      cliente_id: clienteId,
      periodo: { inicio: dataInicio, fim: dataFim },
      resumo,
      detalhes: pagamentos,
    };
  }

  /**
   * Ranking de Clientes por Receita
   */
  static async gerarRankingClientes(limite = 10, dataInicio, dataFim) {
    const ranking = await Pagamento.findAll({
      attributes: [
        'cliente_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade'],
        [sequelize.fn('SUM', sequelize.col('valor_final')), 'valor_total'],
        [
          sequelize.fn('AVG', sequelize.col('valor_final')),
          'ticket_medio',
        ],
      ],
      where: {
        tipo: 'receber',
        status: 'pago',
        data_pagamento: {
          [Op.between]: [new Date(dataInicio), new Date(dataFim)],
        },
      },
      include: [
        { association: 'cliente', attributes: ['nome_fantasia', 'email'] },
      ],
      group: ['cliente_id'],
      order: [[sequelize.literal('valor_total'), 'DESC']],
      limit: limite,
      subQuery: false,
    });

    return ranking;
  }

  /**
   * Análise de Sazonalidade
   */
  static async analisarSazonalidade(ano) {
    const meses = [];

    for (let m = 1; m <= 12; m++) {
      const inicio = new Date(ano, m - 1, 1);
      const fim = new Date(ano, m, 0);

      const receita = await Pagamento.sum('valor_final', {
        where: {
          tipo: 'receber',
          status: 'pago',
          data_pagamento: { [Op.between]: [inicio, fim] },
        },
      });

      const despesa = await Pagamento.sum('valor_final', {
        where: {
          tipo: 'pagar',
          status: 'pago',
          data_pagamento: { [Op.between]: [inicio, fim] },
        },
      });

      const media_receita = (receita || 0) / this.getDiasUteisNoMes(ano, m);

      meses.push({
        mes: m,
        receita: receita || 0,
        despesa: despesa || 0,
        media_diaria: media_receita,
      });
    }

    return meses;
  }

  /**
   * Previsão de Receita (Machine Learning simples)
   */
  static async previsaoReceita(periodos = 3) {
    const historico = await Pagamento.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento')), 'mes'],
        [sequelize.fn('SUM', sequelize.col('valor_final')), 'receita'],
      ],
      where: {
        tipo: 'receber',
        status: 'pago',
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento')), 'ASC']],
      limit: 12,
      raw: true,
    });

    if (historico.length < 3) {
      throw new Error('Dados insuficientes para previsão');
    }

    // Calcular média móvel simples (3 períodos)
    const previsoes = [];
    const medias = [];

    for (let i = 2; i < historico.length; i++) {
      const media =
        (parseFloat(historico[i - 2].receita || 0) +
          parseFloat(historico[i - 1].receita || 0) +
          parseFloat(historico[i].receita || 0)) /
        3;
      medias.push(media);
    }

    const ultimaMedia = medias[medias.length - 1];

    for (let i = 0; i < periodos; i++) {
      const dataProxima = new Date();
      dataProxima.setMonth(dataProxima.getMonth() + i + 1);

      previsoes.push({
        mes: `${String(dataProxima.getMonth() + 1).padStart(2, '0')}/${dataProxima.getFullYear()}`,
        previsao: parseFloat(ultimaMedia.toFixed(2)),
      });
    }

    return previsoes;
  }

  /**
   * Exportar relatório para Excel
   */
  static async exportarParaExcel(relatorioData, nomeArquivo) {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Relatório Financeiro');

      // Cabeçalho
      sheet.columns = [
        { header: 'Data', key: 'data', width: 12 },
        { header: 'Fatura', key: 'numero_fatura', width: 12 },
        { header: 'Cliente', key: 'cliente', width: 20 },
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'Valor', key: 'valor', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
      ];

      // Dados
      relatorioData.forEach((item) => {
        sheet.addRow({
          data: item.data_pagamento,
          numero_fatura: item.numero_fatura,
          cliente: item.cliente?.nome_fantasia || 'N/A',
          tipo: item.tipo,
          valor: item.valor_final,
          status: item.status,
        });
      });

      // Formatação
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };

      // Salvar
      const caminhoArquivo = path.join(process.cwd(), 'reports', `${nomeArquivo}.xlsx`);
      await workbook.xlsx.writeFile(caminhoArquivo);

      logger.info(`Relatório Excel gerado: ${caminhoArquivo}`);

      return caminhoArquivo;
    } catch (error) {
      logger.error('Erro ao exportar para Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar relatório para PDF
   */
  static async exportarParaPDF(relatorioData, nomeArquivo, titulo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new pdf();
        const caminhoArquivo = path.join(
          process.cwd(),
          'reports',
          `${nomeArquivo}.pdf`
        );

        const stream = fs.createWriteStream(caminhoArquivo);

        doc.pipe(stream);

        // Título
        doc.fontSize(20).font('Helvetica-Bold').text(titulo, { align: 'center' });
        doc.moveDown();

        // Data de geração
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, {
            align: 'right',
          });
        doc.moveDown();

        // Tabela
        const dados = relatorioData.slice(0, 50); // Limitar a 50 linhas
        const colunasLargura = [80, 70, 100, 70, 80, 90];
        let y = doc.y;

        // Cabeçalho da tabela
        doc.font('Helvetica-Bold').fontSize(9);
        const headers = ['Data', 'Fatura', 'Cliente', 'Tipo', 'Valor', 'Status'];

        headers.forEach((header, i) => {
          doc.text(header, 50 + colunasLargura.slice(0, i).reduce((a, b) => a + b, 0), y);
        });

        y += 20;

        // Linhas da tabela
        doc.font('Helvetica').fontSize(8);
        dados.forEach((item) => {
          doc.text(new Date(item.data_pagamento).toLocaleDateString('pt-BR'), 50, y);
          doc.text(item.numero_fatura, 50 + colunasLargura[0], y);
          doc.text(item.cliente?.nome_fantasia || 'N/A', 50 + colunasLargura[0] + colunasLargura[1], y);
          doc.text(item.tipo, 50 + colunasLargura[0] + colunasLargura[1] + colunasLargura[2], y);
          doc.text(
            `R$ ${item.valor_final}`,
            50 + colunasLargura.slice(0, 4).reduce((a, b) => a + b, 0),
            y
          );
          doc.text(
            item.status,
            50 + colunasLargura.slice(0, 5).reduce((a, b) => a + b, 0),
            y
          );
          y += 15;
        });

        doc.end();

        stream.on('finish', () => {
          logger.info(`Relatório PDF gerado: ${caminhoArquivo}`);
          resolve(caminhoArquivo);
        });
      } catch (error) {
        logger.error('Erro ao exportar para PDF:', error);
        reject(error);
      }
    });
  }

  /**
   * Helper: Gerar intervalo de meses
   */
  static gerarIntervaloMeses(dataInicio, dataFim) {
    const meses = [];
    const data = new Date(dataInicio);

    while (data <= new Date(dataFim)) {
      meses.push({
        mes: data.getMonth() + 1,
        ano: data.getFullYear(),
      });
      data.setMonth(data.getMonth() + 1);
    }

    return meses;
  }

  /**
   * Helper: Contar dias úteis no mês
   */
  static getDiasUteisNoMes(ano, mes) {
    let diasUteis = 0;
    const data = new Date(ano, mes - 1, 1);

    while (data.getMonth() + 1 === mes) {
      const diaSemana = data.getDay();
      // 0 = domingo, 6 = sábado
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasUteis++;
      }
      data.setDate(data.getDate() + 1);
    }

    return diasUteis;
  }
}

module.exports = RelatorioService;
```

---

# 5. ROUTES FINANCEIRAS

## 5.1 src/routes/financeiro.routes.js

```javascript
const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiro.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  criarPagamentoSchema,
  atualizarPagamentoSchema,
  registrarPagamentoSchema,
} = require('../validators/financeiro.validator');

router.use(verificarToken);

// Dashboard
router.get('/dashboard', financeiroController.obterDashboard);

// Pagamentos CRUD
router.get('/pagamentos', financeiroController.listarPagamentos);
router.post(
  '/pagamentos',
  verificarRole('admin', 'gestor'),
  validate(criarPagamentoSchema),
  financeiroController.criarPagamento
);
router.get('/pagamentos/:id', financeiroController.obterPagamento);
router.patch(
  '/pagamentos/:id',
  verificarRole('admin', 'gestor'),
  validate(atualizarPagamentoSchema),
  financeiroController.atualizarPagamento
);

// Registrar Pagamento
router.post(
  '/pagamentos/:id/registrar',
  verificarRole('admin', 'gestor'),
  validate(registrarPagamentoSchema),
  financeiroController.registrarPagamento
);

// Relatórios
router.get('/relatorios/fluxo-caixa', financeiroController.obterFluxoCaixa);
router.get('/relatorios/por-cliente', financeiroController.obterRelatorioPorCliente);
router.get(
  '/relatorios/por-correspondente',
  financeiroController.obterRelatorioPorCorrespondente
);
router.get('/relatorios/inadimplencia', financeiroController.obterAnaliseInadimplencia);
router.get('/relatorios/projecao', financeiroController.obterProjecaoReceita);

// Exportação
router.get(
  '/exportar/excel/:relatorio_id',
  verificarRole('admin', 'gestor'),
  financeiroController.exportarExcel
);
router.get(
  '/exportar/pdf/:relatorio_id',
  verificarRole('admin', 'gestor'),
  financeiroController.exportarPDF
);

module.exports = router;
```

---

# 6. VALIDATORS FINANCEIROS

## 6.1 src/validators/financeiro.validator.js

```javascript
const Joi = require('joi');

const criarPagamentoSchema = Joi.object({
  tipo: Joi.string().valid('receber', 'pagar').required(),
  categoria: Joi.string()
    .valid(
      'honorarios',
      'custas_processuais',
      'taxa_correspondente',
      'despesa_operacional',
      'salario',
      'aluguel',
      'internet',
      'outro'
    )
    .required(),
  descricao: Joi.string().max(500).allow(null),
  valor_original: Joi.number().positive().required(),
  percentual_desconto: Joi.number().min(0).max(100).default(0),
  data_vencimento: Joi.date().required(),
  demanda_id: Joi.number().integer().allow(null),
  cliente_id: Joi.number().integer().allow(null),
  correspondente_id: Joi.number().integer().allow(null),
  forma_pagamento: Joi.string()
    .valid(
      'dinheiro',
      'pix',
      'ted',
      'boleto',
      'cartao_credito',
      'cartao_debito',
      'transferencia_bancaria',
      'cheque',
      'outro'
    )
    .allow(null),
  condicao_pagamento_id: Joi.number().integer().allow(null),
});

const atualizarPagamentoSchema = criarPagamentoSchema.fork(
  ['tipo', 'categoria', 'valor_original', 'data_vencimento'],
  (schema) => schema.optional()
);

const registrarPagamentoSchema = Joi.object({
  data_pagamento: Joi.date().allow(null),
  forma_pagamento: Joi.string()
    .valid(
      'dinheiro',
      'pix',
      'ted',
      'boleto',
      'cartao_credito',
      'cartao_debito',
      'transferencia_bancaria',
      'cheque',
      'outro'
    )
    .required(),
  valor_pago: Joi.number().positive().required(),
  comprovante_url: Joi.string().uri().allow(null),
  observacoes: Joi.string().allow(null),
});

module.exports = {
  criarPagamentoSchema,
  atualizarPagamentoSchema,
  registrarPagamentoSchema,
};
```

---

# 7. EXPORTAÇÃO DE RELATÓRIOS

## 7.2 Exemplo: Adicionar Controllers de Exportação

```javascript
// Adicionar ao financeiroController:

async exportarExcel(req, res) {
  const { relatorio_id } = req.params;
  const { data_inicio, data_fim } = req.query;

  try {
    let dados;

    // Carregar dados conforme tipo de relatório
    if (relatorio_id === 'receitas_despesas') {
      dados = await RelatorioService.gerarReceitasVsDespesas(data_inicio, data_fim);
    } else if (relatorio_id === 'clientes') {
      dados = await Pagamento.findAll({
        where: {
          data_pagamento: {
            [Op.between]: [new Date(data_inicio), new Date(data_fim)],
          },
        },
        include: [{ association: 'cliente' }],
      });
    }

    const caminho = await RelatorioService.exportarParaExcel(
      dados,
      `relatorio-${relatorio_id}-${Date.now()}`
    );

    // Enviar arquivo
    res.download(caminho, `relatorio-${relatorio_id}.xlsx`);
  } catch (error) {
    next(error);
  }
}

async exportarPDF(req, res) {
  const { relatorio_id } = req.params;
  const { data_inicio, data_fim } = req.query;

  try {
    let dados;
    let titulo = 'Relatório Financeiro';

    if (relatorio_id === 'receitas_despesas') {
      dados = await RelatorioService.gerarReceitasVsDespesas(data_inicio, data_fim);
      titulo = 'Relatório de Receitas vs Despesas';
    }

    const caminho = await RelatorioService.exportarParaPDF(
      dados,
      `relatorio-${relatorio_id}-${Date.now()}`,
      titulo
    );

    res.download(caminho, `relatorio-${relatorio_id}.pdf`);
  } catch (error) {
    next(error);
  }
}
```

---

# 8. EXEMPLO DE USO COMPLETO

## 8.1 Fluxo Completo de Fatura

```bash
# 1. Criar Fatura
POST /api/v1/financeiro/pagamentos
Headers: Authorization: Bearer {token}
{
  "tipo": "receber",
  "categoria": "honorarios",
  "descricao": "Honorários - Demanda DEM-2025-000001",
  "valor_original": 5000.00,
  "percentual_desconto": 0,
  "data_vencimento": "2025-12-04",
  "cliente_id": 1,
  "demanda_id": 1,
  "forma_pagamento": "transferencia_bancaria"
}

# Response:
{
  "success": true,
  "message": "Pagamento criado com sucesso",
  "data": {
    "id": 1,
    "numero_fatura": "FAT-2025-000001",
    "valor_original": 5000.00,
    "valor_desconto": 0,
    "valor_final": 5000.00,
    "status": "rascunho",
    "data_vencimento": "2025-12-04T00:00:00.000Z"
  }
}

# 2. Registrar Pagamento
POST /api/v1/financeiro/pagamentos/1/registrar
Headers: Authorization: Bearer {token}
{
  "data_pagamento": "2025-11-04",
  "forma_pagamento": "pix",
  "valor_pago": 5000.00,
  "observacoes": "Pagamento realizado via PIX"
}

# Response:
{
  "success": true,
  "message": "Pagamento registrado com sucesso",
  "data": {
    "id": 1,
    "numero_fatura": "FAT-2025-000001",
    "status": "pago",
    "data_pagamento": "2025-11-04T00:00:00.000Z",
    "valor_final": 5000.00
  }
}

# 3. Obter Dashboard Financeiro
GET /api/v1/financeiro/dashboard?mes=11&ano=2025
Headers: Authorization: Bearer {token}

# Response:
{
  "success": true,
  "data": {
    "periodo": { "mes": 11, "ano": 2025 },
    "receita": 15500.00,
    "despesa": 3200.00,
    "lucro": 12300.00,
    "margem_lucro": 79.35,
    "total_a_receber": 8500.00,
    "total_a_pagar": 1200.00,
    "vencidos_receber": 0,
    "vencidos_pagar": 0,
    "saldo_contas": 45000.00,
    "contas": [
      {
        "id": 1,
        "nome_conta": "Conta Corrente Principal",
        "saldo_atual": 45000.00,
        "saldo_previsto": 53300.00
      }
    ]
  }
}

# 4. Obter Fluxo de Caixa
GET /api/v1/financeiro/relatorios/fluxo-caixa?data_inicio=2025-11-01&data_fim=2025-11-30
Headers: Authorization: Bearer {token}

# Response:
{
  "success": true,
  "data": {
    "periodo": { "inicio": "2025-11-01", "fim": "2025-11-30" },
    "fluxo": [
      {
        "data": "2025-11-04",
        "receita": 5000.00,
        "despesa": 500.00,
        "saldo": 4500.00
      },
      {
        "data": "2025-11-10",
        "receita": 10500.00,
        "despesa": 2700.00,
        "saldo": 7800.00
      }
    ]
  }
}

# 5. Análise de Inadimplência
GET /api/v1/financeiro/relatorios/inadimplencia
Headers: Authorization: Bearer {token}

# Response:
{
  "success": true,
  "data": {
    "total_clientes_inadimplentes": 2,
    "valor_total_vencido": 8900.00,
    "inadimplentes": [
      {
        "cliente_id": 5,
        "cliente": { "nome_fantasia": "Empresa XYZ" },
        "quantidade_vencida": 2,
        "valor_vencido": 5000.00,
        "dias_atraso_max": 15
      },
      {
        "cliente_id": 8,
        "cliente": { "nome_fantasia": "Consultoria ABC" },
        "quantidade_vencida": 1,
        "valor_vencido": 3900.00,
        "dias_atraso_max": 8
      }
    ]
  }
}

# 6. Projeção de Receita
GET /api/v1/financeiro/relatorios/projecao?meses=6
Headers: Authorization: Bearer {token}

# Response:
{
  "success": true,
  "data": {
    "periodo_meses": 6,
    "projecao": [
      {
        "mes": "12/2025",
        "prevista": 12000.00,
        "realizada": 10500.00
      },
      {
        "mes": "01/2026",
        "prevista": 13500.00,
        "realizada": 0.00
      },
      {
        "mes": "02/2026",
        "prevista": 13500.00,
        "realizada": 0.00
      },
      {
        "mes": "03/2026",
        "prevista": 14000.00,
        "realizada": 0.00
      },
      {
        "mes": "04/2026",
        "prevista": 14500.00,
        "realizada": 0.00
      },
      {
        "mes": "05/2026",
        "prevista": 15000.00,
        "realizada": 0.00
      }
    ]
  }
}

# 7. Ranking de Clientes
GET /api/v1/financeiro/relatorios/por-cliente?data_inicio=2025-01-01&data_fim=2025-11-30&limite=5
Headers: Authorization: Bearer {token}

# Response:
{
  "success": true,
  "data": [
    {
      "cliente_id": 1,
      "cliente": { "nome_fantasia": "Escritório ABC" },
      "quantidade": 12,
      "valor_total": 45000.00,
      "ticket_medio": 3750.00
    },
    {
      "cliente_id": 2,
      "cliente": { "nome_fantasia": "Empresa XYZ" },
      "quantidade": 8,
      "valor_total": 32000.00,
      "ticket_medio": 4000.00
    }
  ]
}

# 8. Exportar Relatório Excel
GET /api/v1/financeiro/exportar/excel/receitas_despesas?data_inicio=2025-11-01&data_fim=2025-11-30
Headers: Authorization: Bearer {token}

# Response: Download direto do arquivo .xlsx

# 9. Exportar Relatório PDF
GET /api/v1/financeiro/exportar/pdf/receitas_despesas?data_inicio=2025-11-01&data_fim=2025-11-30
Headers: Authorization: Bearer {token}

# Response: Download direto do arquivo .pdf
```

---

## 8.2 KPIs Calculáveis

```javascript
// Exemplos de KPIs que podem ser derivados:

const kpis = {
  receita_total: "Receita paga em período",
  ticket_medio: "Valor médio por fatura",
  ciclo_cobranca: "Dias entre vencimento e pagamento",
  taxa_inadimplencia: "% de faturas vencidas",
  fluxo_positivo: "Receita - Despesa",
  margem_lucro: "Lucro / Receita * 100",
  dias_caixa: "Saldo / Despesa diária",
  taxa_desconto: "Desconto concedido / Receita",
  taxa_juros: "Juros cobrados / Receita",
};
```

---

**Módulo Financeiro Completo - Parte 2/2** ✅

## Checklist Final

```
Models (5):
├─ [x] Pagamento (expandido)
├─ [x] PagamentoParcela
├─ [x] HistoricoPagamento
├─ [x] ContaBancaria
└─ [x] CondicaoPagamento

Controllers:
├─ [x] CRUD Pagamentos
├─ [x] Dashboard financeiro
├─ [x] Fluxo de caixa
├─ [x] Relatórios por cliente
├─ [x] Relatórios por correspondente
├─ [x] Análise de inadimplência
├─ [x] Projeção de receita
└─ [x] Exportação

Services:
├─ [x] Cálculos financeiros (10+)
├─ [x] Juros e multas
├─ [x] Desconto antecipado
├─ [x] Parcelamento
├─ [x] KPIs
└─ [x] Relatórios avançados (8+)

Features:
├─ [x] Receitas vs Despesas
├─ [x] Fluxo de caixa
├─ [x] Ranking de clientes
├─ [x] Análise de sazonalidade
├─ [x] Previsão de receita
├─ [x] Exportar Excel
├─ [x] Exportar PDF
└─ [x] 30+ endpoints

Pronto para Produção! ✅
```