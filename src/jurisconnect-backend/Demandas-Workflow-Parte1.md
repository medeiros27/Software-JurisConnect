# JURISCONNECT - SISTEMA DE DEMANDAS COM WORKFLOW AUTOMATIZADO

## 📋 ÍNDICE

1. [Models Estendidos](#1-models-estendidos)
2. [Controllers Workflow](#2-controllers-workflow)
3. [Services de Workflow](#3-services-de-workflow)
4. [Routes Completas](#4-routes-completas)
5. [Validators](#5-validators)
6. [Middleware Workflow](#6-middleware-workflow)
7. [Auditoria e Logs](#7-auditoria-e-logs)
8. [Notificações](#8-notificações)

---

# 1. MODELS ESTENDIDOS

## 1.1 src/models/Demanda.js (Versão Expandida)

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Demanda = sequelize.define('Demanda', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    tipo_demanda: {
      type: DataTypes.ENUM('diligencia', 'audiencia', 'protocolo', 'intimacao', 'parecer', 'outro'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'rascunho',
        'pendente',
        'em_analise',
        'em_andamento',
        'aguardando_correspondente',
        'aguardando_cliente',
        'concluida',
        'cancelada',
        'suspensa'
      ),
      defaultValue: 'rascunho',
      index: true,
    },
    sub_status: {
      type: DataTypes.STRING(100),
      comment: 'Status específico dentro de uma etapa (ex: aguardando_docs, aguardando_resposta)',
    },
    prioridade: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
      defaultValue: 'media',
      index: true,
    },
    
    // Datas
    data_prazo: {
      type: DataTypes.DATE,
    },
    data_prazo_revisao: {
      type: DataTypes.DATE,
      comment: 'Prazo para revisar documentos',
    },
    data_inicio: {
      type: DataTypes.DATE,
    },
    data_conclusao: {
      type: DataTypes.DATE,
    },
    data_cancelamento: {
      type: DataTypes.DATE,
    },

    // Valores
    valor_estimado: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    valor_cobrado: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    valor_pago: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    // Workflow
    etapa_atual: {
      type: DataTypes.STRING(50),
      comment: 'Qual etapa do workflow está agora',
    },
    etapa_anterior: {
      type: DataTypes.STRING(50),
      comment: 'Etapa anterior para auditoria',
    },
    progresso_percentual: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    motivo_cancelamento: {
      type: DataTypes.TEXT,
    },
    motivo_suspensao: {
      type: DataTypes.TEXT,
    },

    // Responsabilidades
    responsavel_atual_id: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
      comment: 'Quem está trabalhando na demanda agora',
    },
    responsavel_anterior_id: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },

    // Relacionamentos
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clientes', key: 'id' },
      index: true,
    },
    correspondente_id: {
      type: DataTypes.INTEGER,
      references: { model: 'correspondentes', key: 'id' },
    },
    especialidade_id: {
      type: DataTypes.INTEGER,
      references: { model: 'especialidades', key: 'id' },
    },
    criado_por: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },

    // Observações
    observacoes: {
      type: DataTypes.TEXT,
    },
    observacoes_privadas: {
      type: DataTypes.TEXT,
      comment: 'Visível apenas para equipe interna',
    },

    // Flags
    urgente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    atrasada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      index: true,
    },
    requer_assinatura: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    permitir_edicao_cliente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'demandas',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['cliente_id'] },
      { fields: ['correspondente_id'] },
      { fields: ['data_prazo'] },
      { fields: ['prioridade'] },
    ],
  });

  Demanda.associate = (models) => {
    Demanda.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente',
    });
    Demanda.belongsTo(models.Correspondente, {
      foreignKey: 'correspondente_id',
      as: 'correspondente',
    });
    Demanda.belongsTo(models.Especialidade, {
      foreignKey: 'especialidade_id',
      as: 'especialidade',
    });
    Demanda.belongsTo(models.Usuario, {
      foreignKey: 'criado_por',
      as: 'criador',
    });
    Demanda.belongsTo(models.Usuario, {
      foreignKey: 'responsavel_atual_id',
      as: 'responsavel_atual',
    });
    Demanda.hasMany(models.Diligencia, {
      foreignKey: 'demanda_id',
      as: 'diligencias',
    });
    Demanda.hasMany(models.Documento, {
      foreignKey: 'demanda_id',
      as: 'documentos',
    });
    Demanda.hasMany(models.Pagamento, {
      foreignKey: 'demanda_id',
      as: 'pagamentos',
    });
    Demanda.hasMany(models.HistoricoWorkflow, {
      foreignKey: 'demanda_id',
      as: 'historico_workflow',
    });
    Demanda.hasMany(models.Notificacao, {
      foreignKey: 'demanda_id',
      as: 'notificacoes',
    });
  };

  return Demanda;
};
```

## 1.2 src/models/HistoricoWorkflow.js (Auditoria)

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const HistoricoWorkflow = sequelize.define('HistoricoWorkflow', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    demanda_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'demandas', key: 'id' },
    },
    acao: {
      type: DataTypes.ENUM(
        'criacao',
        'mudanca_status',
        'mudanca_prioridade',
        'atribuicao',
        'transferencia',
        'cancelamento',
        'suspensao',
        'retomada',
        'conclusao',
        'adicionar_documento',
        'adicionar_comentario'
      ),
      allowNull: false,
    },
    status_anterior: {
      type: DataTypes.STRING(50),
    },
    status_novo: {
      type: DataTypes.STRING(50),
    },
    responsavel_anterior_id: {
      type: DataTypes.INTEGER,
    },
    responsavel_novo_id: {
      type: DataTypes.INTEGER,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    dados_mudados: {
      type: DataTypes.JSONB,
      comment: 'Dados completos da mudança em JSON',
    },
    ip_origem: {
      type: DataTypes.STRING(50),
    },
    user_agent: {
      type: DataTypes.STRING(500),
    },
  }, {
    tableName: 'historico_workflow',
    timestamps: true,
    underscored: true,
  });

  HistoricoWorkflow.associate = (models) => {
    HistoricoWorkflow.belongsTo(models.Demanda, {
      foreignKey: 'demanda_id',
    });
    HistoricoWorkflow.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
    });
  };

  return HistoricoWorkflow;
};
```

## 1.3 src/models/Diligencia.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Diligencia = sequelize.define('Diligencia', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    demanda_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'demandas', key: 'id' },
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM('pendente', 'em_andamento', 'concluida', 'cancelada'),
      defaultValue: 'pendente',
    },
    prioridade: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
      defaultValue: 'media',
    },
    data_vencimento: {
      type: DataTypes.DATE,
    },
    data_conclusao: {
      type: DataTypes.DATE,
    },
    atribuido_para_id: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },
    criado_por: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },
  }, {
    tableName: 'diligencias',
    timestamps: true,
    underscored: true,
  });

  Diligencia.associate = (models) => {
    Diligencia.belongsTo(models.Demanda, {
      foreignKey: 'demanda_id',
      as: 'demanda',
    });
  };

  return Diligencia;
};
```

## 1.4 src/models/Documento.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Documento = sequelize.define('Documento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    demanda_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'demandas', key: 'id' },
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('contrato', 'intimacao', 'parecer', 'decisao', 'outro'),
      defaultValue: 'outro',
    },
    url_arquivo: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    tamanho_bytes: {
      type: DataTypes.BIGINT,
    },
    mime_type: {
      type: DataTypes.STRING(100),
    },
    hash_arquivo: {
      type: DataTypes.STRING(100),
      comment: 'SHA-256 para integridade',
    },
    requer_assinatura: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    assinado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    data_assinatura: {
      type: DataTypes.DATE,
    },
    assinado_por_id: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },
    enviado_por_id: {
      type: DataTypes.INTEGER,
      references: { model: 'usuarios', key: 'id' },
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'documentos',
    timestamps: true,
    underscored: true,
  });

  Documento.associate = (models) => {
    Documento.belongsTo(models.Demanda, {
      foreignKey: 'demanda_id',
      as: 'demanda',
    });
  };

  return Documento;
};
```

---

# 2. CONTROLLERS WORKFLOW

## 2.1 src/controllers/demanda.controller.js (Expandido)

```javascript
const { Demanda, Cliente, Correspondente, HistoricoWorkflow, Usuario, Diligencia, Documento } = require('../models');
const AppError = require('../utils/AppError');
const WorkflowService = require('../services/workflow.service');
const NotificationService = require('../services/notification.service');
const { Op } = require('sequelize');

class DemandaController {
  async criar(req, res) {
    const { titulo, descricao, tipo_demanda, cliente_id, especialidade_id, prioridade = 'media' } = req.body;

    // Gerar número único
    const count = await Demanda.count();
    const numero = `DEM-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const demanda = await Demanda.create({
      numero,
      titulo,
      descricao,
      tipo_demanda,
      cliente_id,
      especialidade_id,
      prioridade,
      status: 'rascunho',
      etapa_atual: 'criacao',
      criado_por: req.usuarioId,
      responsavel_atual_id: req.usuarioId,
    });

    // Registrar no histórico
    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'criacao',
      usuario_id: req.usuarioId,
      status_novo: 'rascunho',
      descricao: `Demanda criada: ${titulo}`,
    });

    // Notificar
    await NotificationService.notificarCriacao(demanda);

    res.status(201).json({
      success: true,
      message: 'Demanda criada com sucesso',
      data: demanda,
    });
  }

  async listar(req, res) {
    const {
      page = 1,
      limit = 20,
      status,
      prioridade,
      cliente_id,
      correspondente_id,
      tipo_demanda,
      busca,
      atrasada,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (cliente_id) where.cliente_id = cliente_id;
    if (correspondente_id) where.correspondente_id = correspondente_id;
    if (tipo_demanda) where.tipo_demanda = tipo_demanda;
    if (atrasada === 'true') where.atrasada = true;

    if (busca) {
      where[Op.or] = [
        { numero: { [Op.iLike]: `%${busca}%` } },
        { titulo: { [Op.iLike]: `%${busca}%` } },
      ];
    }

    const { count, rows } = await Demanda.findAndCountAll({
      where,
      include: [
        { association: 'cliente', attributes: ['id', 'nome_fantasia'] },
        { association: 'correspondente', attributes: ['id', 'nome_fantasia'] },
        { association: 'responsavel_atual', attributes: ['id', 'nome', 'email'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['prioridade', 'DESC'], ['data_prazo', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        demandas: rows,
        paginacao: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit),
        },
      },
    });
  }

  async obter(req, res) {
    const { id } = req.params;

    const demanda = await Demanda.findByPk(id, {
      include: [
        { association: 'cliente' },
        { association: 'correspondente' },
        { association: 'especialidade' },
        { association: 'criador', attributes: ['id', 'nome', 'email'] },
        { association: 'responsavel_atual', attributes: ['id', 'nome', 'email'] },
        {
          association: 'historico_workflow',
          attributes: ['id', 'acao', 'status_anterior', 'status_novo', 'created_at'],
          limit: 10,
          order: [['created_at', 'DESC']],
        },
        {
          association: 'diligencias',
          attributes: ['id', 'titulo', 'status', 'data_vencimento'],
        },
        {
          association: 'documentos',
          attributes: ['id', 'nome', 'tipo', 'url_arquivo', 'assinado'],
        },
        {
          association: 'pagamentos',
          attributes: ['id', 'numero_fatura', 'valor', 'status'],
        },
      ],
    });

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    res.json({
      success: true,
      data: demanda,
    });
  }

  // WORKFLOW: Kanban
  async obterKanban(req, res) {
    const demandas = await Demanda.findAll({
      where: {
        status: {
          [Op.in]: [
            'pendente',
            'em_analise',
            'em_andamento',
            'aguardando_correspondente',
            'aguardando_cliente',
          ],
        },
      },
      include: [
        { association: 'cliente', attributes: ['id', 'nome_fantasia'] },
        { association: 'correspondente', attributes: ['id', 'nome_fantasia'] },
        { association: 'responsavel_atual', attributes: ['id', 'nome'] },
      ],
      order: [['prioridade', 'DESC'], ['data_prazo', 'ASC']],
    });

    // Agrupar por status
    const kanban = {
      pendente: [],
      em_analise: [],
      em_andamento: [],
      aguardando_correspondente: [],
      aguardando_cliente: [],
    };

    demandas.forEach((demanda) => {
      if (kanban[demanda.status]) {
        kanban[demanda.status].push(demanda);
      }
    });

    res.json({
      success: true,
      data: kanban,
    });
  }

  // WORKFLOW: Atualizar Status
  async atualizarStatus(req, res) {
    const { id } = req.params;
    const { status, motivo, observacoes } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    // Validar transição de status (regras de negócio)
    const transicaoValida = WorkflowService.validarTransicao(demanda.status, status);

    if (!transicaoValida) {
      throw new AppError(
        `Não é permitido ir de ${demanda.status} para ${status}`,
        400,
        'TRANSICAO_INVALIDA'
      );
    }

    const status_anterior = demanda.status;

    // Atualizar demanda
    await demanda.update({
      status,
      status_anterior,
      etapa_anterior: demanda.etapa_atual,
      etapa_atual: status,
      ...(status === 'concluida' && { data_conclusao: new Date(), progresso_percentual: 100 }),
      ...(status === 'cancelada' && { data_cancelamento: new Date(), motivo_cancelamento: motivo }),
      ...(status === 'suspensa' && { motivo_suspensao: motivo }),
    });

    // Registrar no histórico
    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'mudanca_status',
      status_anterior,
      status_novo: status,
      usuario_id: req.usuarioId,
      descricao: observacoes || `Status alterado de ${status_anterior} para ${status}`,
      dados_mudados: { status_anterior, status_novo: status },
      ip_origem: req.ip,
      user_agent: req.get('user-agent'),
    });

    // Notificar stakeholders
    await NotificationService.notificarMudancaStatus(demanda, status_anterior, status);

    res.json({
      success: true,
      message: `Status atualizado para ${status}`,
      data: demanda,
    });
  }

  // WORKFLOW: Transferir Responsabilidade
  async transferirResponsavel(req, res) {
    const { id } = req.params;
    const { novo_responsavel_id, motivo, notificar } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    // Verificar se novo responsável existe
    const novoResponsavel = await Usuario.findByPk(novo_responsavel_id);

    if (!novoResponsavel) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const responsavel_anterior_id = demanda.responsavel_atual_id;

    // Atualizar demanda
    await demanda.update({
      responsavel_anterior_id,
      responsavel_atual_id: novo_responsavel_id,
    });

    // Registrar no histórico
    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'transferencia',
      responsavel_anterior_id,
      responsavel_novo_id: novo_responsavel_id,
      usuario_id: req.usuarioId,
      descricao: motivo || `Demanda transferida para ${novoResponsavel.nome}`,
      dados_mudados: {
        de: responsavel_anterior_id,
        para: novo_responsavel_id,
      },
    });

    // Notificar se solicitado
    if (notificar) {
      await NotificationService.notificarTransferencia(demanda, novoResponsavel);
    }

    res.json({
      success: true,
      message: 'Responsável atualizado com sucesso',
      data: demanda,
    });
  }

  // WORKFLOW: Aprovar Etapa
  async aprovarEtapa(req, res) {
    const { id } = req.params;
    const { observacoes } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    // Validar se pode ser aprovada
    if (!['em_analise', 'aguardando_cliente'].includes(demanda.status)) {
      throw new AppError('Demanda não está em estado aprovável', 400);
    }

    // Próximo status após aprovação
    const proximoStatus = demanda.status === 'em_analise' ? 'em_andamento' : 'concluida';

    await demanda.update({
      status: proximoStatus,
      etapa_anterior: demanda.etapa_atual,
      etapa_atual: proximoStatus,
      progresso_percentual: proximoStatus === 'concluida' ? 100 : 66,
    });

    // Registrar no histórico
    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'mudanca_status',
      status_anterior: demanda.status,
      status_novo: proximoStatus,
      usuario_id: req.usuarioId,
      descricao: `Etapa aprovada. ${observacoes || ''}`,
    });

    res.json({
      success: true,
      message: 'Etapa aprovada com sucesso',
      data: demanda,
    });
  }

  // WORKFLOW: Reprovar Etapa
  async reprovarEtapa(req, res) {
    const { id } = req.params;
    const { motivo, observacoes } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    // Voltar para análise
    const statusAnterior = demanda.status;

    await demanda.update({
      status: 'em_analise',
      etapa_anterior: demanda.etapa_atual,
      etapa_atual: 'em_analise',
      progresso_percentual: 33,
    });

    // Registrar no histórico
    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'mudanca_status',
      status_anterior: statusAnterior,
      status_novo: 'em_analise',
      usuario_id: req.usuarioId,
      descricao: `Etapa reprovada. Motivo: ${motivo}. ${observacoes || ''}`,
      dados_mudados: { motivo },
    });

    // Notificar stakeholders
    await NotificationService.notificarReprovacao(demanda, motivo);

    res.json({
      success: true,
      message: 'Etapa reprovada. Demanda retornou para análise',
      data: demanda,
    });
  }

  // WORKFLOW: Suspender
  async suspender(req, res) {
    const { id } = req.params;
    const { motivo } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    const statusAnterior = demanda.status;

    await demanda.update({
      status: 'suspensa',
      motivo_suspensao: motivo,
    });

    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'suspensao',
      status_anterior: statusAnterior,
      status_novo: 'suspensa',
      usuario_id: req.usuarioId,
      descricao: `Demanda suspensa: ${motivo}`,
    });

    res.json({
      success: true,
      message: 'Demanda suspensa com sucesso',
      data: demanda,
    });
  }

  // WORKFLOW: Retomar
  async retomar(req, res) {
    const { id } = req.params;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    if (demanda.status !== 'suspensa') {
      throw new AppError('Apenas demandas suspensas podem ser retomadas', 400);
    }

    await demanda.update({
      status: 'em_andamento',
      motivo_suspensao: null,
    });

    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'retomada',
      status_anterior: 'suspensa',
      status_novo: 'em_andamento',
      usuario_id: req.usuarioId,
      descricao: 'Demanda retomada',
    });

    res.json({
      success: true,
      message: 'Demanda retomada com sucesso',
      data: demanda,
    });
  }

  // WORKFLOW: Adicionar Diligência
  async adicionarDiligencia(req, res) {
    const { id } = req.params;
    const { titulo, descricao, data_vencimento, prioridade, atribuido_para_id } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    const diligencia = await Diligencia.create({
      demanda_id: demanda.id,
      titulo,
      descricao,
      data_vencimento,
      prioridade,
      atribuido_para_id,
      criado_por: req.usuarioId,
    });

    // Notificar responsável
    if (atribuido_para_id) {
      await NotificationService.notificarNovaDiligencia(diligencia);
    }

    res.status(201).json({
      success: true,
      message: 'Diligência adicionada com sucesso',
      data: diligencia,
    });
  }

  // WORKFLOW: Concluir Diligência
  async concluirDiligencia(req, res) {
    const { demanda_id, diligencia_id } = req.params;

    const diligencia = await Diligencia.findByPk(diligencia_id);

    if (!diligencia) {
      throw new AppError('Diligência não encontrada', 404);
    }

    if (diligencia.demanda_id !== parseInt(demanda_id)) {
      throw new AppError('Diligência não pertence a esta demanda', 400);
    }

    await diligencia.update({
      status: 'concluida',
      data_conclusao: new Date(),
    });

    res.json({
      success: true,
      message: 'Diligência concluída com sucesso',
      data: diligencia,
    });
  }

  // WORKFLOW: Atualizar Progresso
  async atualizarProgresso(req, res) {
    const { id } = req.params;
    const { progresso_percentual, observacoes } = req.body;

    if (progresso_percentual < 0 || progresso_percentual > 100) {
      throw new AppError('Progresso deve estar entre 0 e 100', 400);
    }

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    await demanda.update({
      progresso_percentual,
    });

    await HistoricoWorkflow.create({
      demanda_id: demanda.id,
      acao: 'mudanca_status',
      usuario_id: req.usuarioId,
      descricao: `Progresso atualizado para ${progresso_percentual}%. ${observacoes || ''}`,
    });

    res.json({
      success: true,
      message: 'Progresso atualizado com sucesso',
      data: demanda,
    });
  }

  // Buscar demandas atrasadas
  async obterAtrasadas(req, res) {
    const demandas = await Demanda.findAll({
      where: {
        data_prazo: { [Op.lt]: new Date() },
        status: { [Op.ne]: ['concluida', 'cancelada'] },
        atrasada: false,
      },
      include: [
        { association: 'cliente', attributes: ['nome_fantasia'] },
        { association: 'responsavel_atual', attributes: ['nome', 'email'] },
      ],
      order: [['data_prazo', 'ASC']],
    });

    // Marcar como atrasadas
    await Promise.all(
      demandas.map((d) => d.update({ atrasada: true }))
    );

    res.json({
      success: true,
      data: {
        demandas,
        total: demandas.length,
      },
    });
  }

  // Dashboard KPIs
  async obterKPIs(req, res) {
    const hoje = new Date();
    const semanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

    const ativas = await Demanda.count({
      where: {
        status: {
          [Op.in]: ['pendente', 'em_analise', 'em_andamento'],
        },
      },
    });

    const concluidas_semana = await Demanda.count({
      where: {
        status: 'concluida',
        data_conclusao: { [Op.gte]: semanaAtras },
      },
    });

    const atrasadas = await Demanda.count({
      where: {
        atrasada: true,
        status: { [Op.ne]: 'concluida' },
      },
    });

    const media_dias_conclusao = await Demanda.findAll({
      attributes: [
        [sequelize.literal('AVG(EXTRACT(DAY FROM (data_conclusao - data_inicio)))'), 'media_dias'],
      ],
      where: {
        status: 'concluida',
        data_conclusao: { [Op.gte]: semanaAtras },
      },
    });

    res.json({
      success: true,
      data: {
        demandas_ativas: ativas,
        demandas_concluidas_semana: concluidas_semana,
        demandas_atrasadas: atrasadas,
        media_dias_conclusao: media_dias_conclusao[0]?.media_dias || 0,
      },
    });
  }
}

module.exports = new DemandaController();
```

---

# 3. SERVICES DE WORKFLOW

## 3.1 src/services/workflow.service.js

```javascript
const { Demanda } = require('../models');

class WorkflowService {
  // Definir transições de estado válidas
  static transicoes = {
    rascunho: ['pendente', 'cancelada'],
    pendente: ['em_analise', 'cancelada'],
    em_analise: ['em_andamento', 'aguardando_cliente', 'cancelada'],
    em_andamento: ['aguardando_correspondente', 'aguardando_cliente', 'concluida', 'suspensa', 'cancelada'],
    aguardando_correspondente: ['em_andamento', 'concluida', 'suspensa'],
    aguardando_cliente: ['em_andamento', 'concluida', 'suspensa'],
    concluida: [],
    cancelada: ['pendente'], // permitir retomada
    suspensa: ['em_andamento', 'cancelada'],
  };

  // Validar transição
  static validarTransicao(statusAtual, statusNovo) {
    if (!this.transicoes[statusAtual]) {
      return false;
    }
    return this.transicoes[statusAtual].includes(statusNovo);
  }

  // Determinar etapas automáticas
  static obterEtapasAutomaticas(tipo_demanda) {
    const etapas = {
      diligencia: ['criacao', 'analise', 'execucao', 'conclusao'],
      audiencia: ['criacao', 'preparacao', 'dia_julgamento', 'resultado'],
      protocolo: ['criacao', 'preparacao', 'protocolo', 'rastreamento'],
      intimacao: ['criacao', 'analise', 'notificacao', 'retorno'],
      parecer: ['criacao', 'pesquisa', 'redacao', 'conclusao'],
    };
    return etapas[tipo_demanda] || ['criacao', 'em_andamento', 'conclusao'];
  }

  // Calcular tempo estimado por tipo
  static obterTempoEstimado(tipo_demanda) {
    const tempos = {
      diligencia: 7,
      audiencia: 30,
      protocolo: 5,
      intimacao: 10,
      parecer: 14,
    };
    return tempos[tipo_demanda] || 7;
  }

  // Escalação automática por prioridade
  static obterMultiplicadorPrazo(prioridade) {
    const multiplicadores = {
      baixa: 1.0,
      media: 0.8,
      alta: 0.5,
      urgente: 0.25,
    };
    return multiplicadores[prioridade];
  }
}

module.exports = WorkflowService;
```

## 3.2 src/services/notification.service.js

```javascript
const { Notificacao, Usuario } = require('../models');
const logger = require('../utils/logger');

class NotificationService {
  async notificarCriacao(demanda) {
    try {
      const notificacao = await Notificacao.create({
        demanda_id: demanda.id,
        tipo: 'demanda_criada',
        titulo: `Nova demanda: ${demanda.titulo}`,
        descricao: `A demanda ${demanda.numero} foi criada`,
        usuario_id: demanda.responsavel_atual_id,
        lida: false,
      });

      logger.info(`Notificação criada: ${notificacao.id}`);
    } catch (error) {
      logger.error('Erro ao notificar criação:', error);
    }
  }

  async notificarMudancaStatus(demanda, statusAnterior, statusNovo) {
    try {
      await Notificacao.create({
        demanda_id: demanda.id,
        tipo: 'mudanca_status',
        titulo: `Status alterado: ${demanda.numero}`,
        descricao: `Status de ${statusAnterior} para ${statusNovo}`,
        usuario_id: demanda.responsavel_atual_id,
      });
    } catch (error) {
      logger.error('Erro ao notificar mudança de status:', error);
    }
  }

  async notificarTransferencia(demanda, novoResponsavel) {
    try {
      await Notificacao.create({
        demanda_id: demanda.id,
        tipo: 'transferencia',
        titulo: `Demanda transferida: ${demanda.numero}`,
        descricao: `${demanda.numero} foi transferida para você`,
        usuario_id: novoResponsavel.id,
      });
    } catch (error) {
      logger.error('Erro ao notificar transferência:', error);
    }
  }

  async notificarReprovacao(demanda, motivo) {
    try {
      await Notificacao.create({
        demanda_id: demanda.id,
        tipo: 'reprovacao',
        titulo: `Demanda reprovada: ${demanda.numero}`,
        descricao: `Motivo: ${motivo}`,
        usuario_id: demanda.responsavel_atual_id,
      });
    } catch (error) {
      logger.error('Erro ao notificar reprovação:', error);
    }
  }

  async notificarNovaDiligencia(diligencia) {
    try {
      await Notificacao.create({
        demanda_id: diligencia.demanda_id,
        tipo: 'nova_diligencia',
        titulo: `Nova diligência: ${diligencia.titulo}`,
        usuario_id: diligencia.atribuido_para_id,
      });
    } catch (error) {
      logger.error('Erro ao notificar nova diligência:', error);
    }
  }
}

module.exports = new NotificationService();
```

---

# 4. ROUTES COMPLETAS

## 4.1 src/routes/demanda.routes.js (Expandido)

```javascript
const express = require('express');
const router = express.Router();
const demandaController = require('../controllers/demanda.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  criarDemandaSchema,
  atualizarDemandaSchema,
  atualizarStatusSchema,
  transferirSchema,
  adicionarDiligenciaSchema,
  atualizarProgressoSchema,
} = require('../validators/demanda.validator');

router.use(verificarToken);

// CRUD Básico
router.get('/', demandaController.listar);
router.post('/', validate(criarDemandaSchema), demandaController.criar);
router.get('/:id', demandaController.obter);
router.put('/:id', validate(atualizarDemandaSchema), demandaController.atualizar);
router.delete('/:id', verificarRole('admin', 'gestor'), demandaController.deletar);

// Workflow
router.get('/kanban', demandaController.obterKanban);
router.patch('/:id/status', validate(atualizarStatusSchema), demandaController.atualizarStatus);
router.post('/:id/transferir', validate(transferirSchema), demandaController.transferirResponsavel);
router.post('/:id/aprovar', demandaController.aprovarEtapa);
router.post('/:id/reprovar', demandaController.reprovarEtapa);
router.post('/:id/suspender', demandaController.suspender);
router.post('/:id/retomar', demandaController.retomar);

// Diligências
router.post('/:id/diligencias', validate(adicionarDiligenciaSchema), demandaController.adicionarDiligencia);
router.patch('/:id/diligencias/:diligencia_id/concluir', demandaController.concluirDiligencia);

// Progresso
router.patch('/:id/progresso', validate(atualizarProgressoSchema), demandaController.atualizarProgresso);

// Relatórios
router.get('/atrasadas', demandaController.obterAtrasadas);
router.get('/dashboard/kpis', demandaController.obterKPIs);

module.exports = router;
```

---

# 5. VALIDATORS

## 5.1 src/validators/demanda.validator.js (Expandido)

```javascript
const Joi = require('joi');

const criarDemandaSchema = Joi.object({
  titulo: Joi.string().min(5).max(255).required(),
  descricao: Joi.string().allow(null),
  tipo_demanda: Joi.string()
    .valid('diligencia', 'audiencia', 'protocolo', 'intimacao', 'parecer', 'outro')
    .required(),
  cliente_id: Joi.number().integer().required(),
  correspondente_id: Joi.number().integer().allow(null),
  especialidade_id: Joi.number().integer().allow(null),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'urgente').default('media'),
  data_prazo: Joi.date().allow(null),
  observacoes: Joi.string().allow(null),
});

const atualizarDemandaSchema = criarDemandaSchema.fork(
  ['titulo', 'tipo_demanda', 'cliente_id'],
  (schema) => schema.optional()
);

const atualizarStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      'rascunho',
      'pendente',
      'em_analise',
      'em_andamento',
      'aguardando_correspondente',
      'aguardando_cliente',
      'concluida',
      'cancelada',
      'suspensa'
    )
    .required(),
  motivo: Joi.string().allow(null),
  observacoes: Joi.string().allow(null),
});

const transferirSchema = Joi.object({
  novo_responsavel_id: Joi.number().integer().required(),
  motivo: Joi.string().allow(null),
  notificar: Joi.boolean().default(true),
});

const adicionarDiligenciaSchema = Joi.object({
  titulo: Joi.string().min(5).max(255).required(),
  descricao: Joi.string().allow(null),
  data_vencimento: Joi.date().allow(null),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'urgente').default('media'),
  atribuido_para_id: Joi.number().integer().allow(null),
});

const atualizarProgressoSchema = Joi.object({
  progresso_percentual: Joi.number().integer().min(0).max(100).required(),
  observacoes: Joi.string().allow(null),
});

module.exports = {
  criarDemandaSchema,
  atualizarDemandaSchema,
  atualizarStatusSchema,
  transferirSchema,
  adicionarDiligenciaSchema,
  atualizarProgressoSchema,
};
```

---

**Sistema de Demandas com Workflow - Parte 1** ✅

**Continuação com Middleware, Auditoria e Notificações no próximo arquivo...**