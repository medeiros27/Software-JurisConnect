# JURISCONNECT - BACKEND NODE.JS PARTE 2

## 📋 CONTINUAÇÃO

5. [Routes](#5-routes)
6. [Middleware](#6-middleware)
7. [Services](#7-services)
8. [Utils](#8-utils)
9. [Migrations](#9-migrations)
10. [Seeds](#10-seeds)

---

# 5. ROUTES

## 5.1 src/routes/auth.routes.js

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema, refreshSchema } = require('../validators/auth.validator');

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

// POST /api/v1/auth/logout (requer autenticação)
router.post('/logout', verificarToken, authController.logout);

// GET /api/v1/auth/me (requer autenticação)
router.get('/me', verificarToken, authController.me);

module.exports = router;
```

## 5.2 src/routes/cliente.routes.js

```javascript
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarClienteSchema, atualizarClienteSchema } = require('../validators/cliente.validator');

// Todas as rotas requerem autenticação
router.use(verificarToken);

// GET /api/v1/clientes
router.get('/', clienteController.listar);

// GET /api/v1/clientes/:id
router.get('/:id', clienteController.obter);

// POST /api/v1/clientes (apenas admin e gestor)
router.post(
  '/',
  verificarRole('admin', 'gestor'),
  validate(criarClienteSchema),
  clienteController.criar
);

// PUT /api/v1/clientes/:id (apenas admin e gestor)
router.put(
  '/:id',
  verificarRole('admin', 'gestor'),
  validate(atualizarClienteSchema),
  clienteController.atualizar
);

// DELETE /api/v1/clientes/:id (apenas admin)
router.delete(
  '/:id',
  verificarRole('admin'),
  clienteController.deletar
);

module.exports = router;
```

## 5.3 src/routes/correspondente.routes.js

```javascript
const express = require('express');
const router = express.Router();
const correspondenteController = require('../controllers/correspondente.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  criarCorrespondenteSchema,
  atualizarCorrespondenteSchema,
} = require('../validators/correspondente.validator');

router.use(verificarToken);

router.get('/', correspondenteController.listar);
router.get('/:id', correspondenteController.obter);

router.post(
  '/',
  verificarRole('admin', 'gestor'),
  validate(criarCorrespondenteSchema),
  correspondenteController.criar
);

router.put(
  '/:id',
  verificarRole('admin', 'gestor'),
  validate(atualizarCorrespondenteSchema),
  correspondenteController.atualizar
);

router.delete(
  '/:id',
  verificarRole('admin'),
  correspondenteController.deletar
);

module.exports = router;
```

## 5.4 src/routes/demanda.routes.js

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
} = require('../validators/demanda.validator');

router.use(verificarToken);

// GET /api/v1/demandas
router.get('/', demandaController.listar);

// GET /api/v1/demandas/kanban
router.get('/kanban', demandaController.obterKanban);

// GET /api/v1/demandas/:id
router.get('/:id', demandaController.obter);

// POST /api/v1/demandas
router.post(
  '/',
  validate(criarDemandaSchema),
  demandaController.criar
);

// PUT /api/v1/demandas/:id
router.put(
  '/:id',
  validate(atualizarDemandaSchema),
  demandaController.atualizar
);

// PATCH /api/v1/demandas/:id/status
router.patch(
  '/:id/status',
  validate(atualizarStatusSchema),
  demandaController.atualizarStatus
);

// DELETE /api/v1/demandas/:id
router.delete(
  '/:id',
  verificarRole('admin', 'gestor'),
  demandaController.deletar
);

module.exports = router;
```

## 5.5 src/routes/financeiro.routes.js

```javascript
const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiro.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  criarPagamentoSchema,
  atualizarPagamentoSchema,
} = require('../validators/pagamento.validator');

router.use(verificarToken);

// GET /api/v1/financeiro/dashboard
router.get('/dashboard', financeiroController.obterDashboard);

// GET /api/v1/financeiro/pagamentos
router.get('/pagamentos', financeiroController.listarPagamentos);

// GET /api/v1/financeiro/pagamentos/:id
router.get('/pagamentos/:id', financeiroController.obterPagamento);

// POST /api/v1/financeiro/pagamentos
router.post(
  '/pagamentos',
  verificarRole('admin', 'gestor'),
  validate(criarPagamentoSchema),
  financeiroController.criarPagamento
);

// PUT /api/v1/financeiro/pagamentos/:id
router.put(
  '/pagamentos/:id',
  verificarRole('admin', 'gestor'),
  validate(atualizarPagamentoSchema),
  financeiroController.atualizarPagamento
);

// PATCH /api/v1/financeiro/pagamentos/:id/pagar
router.patch(
  '/pagamentos/:id/pagar',
  verificarRole('admin', 'gestor'),
  financeiroController.marcarComoPago
);

// GET /api/v1/financeiro/relatorios/fluxo-caixa
router.get(
  '/relatorios/fluxo-caixa',
  verificarRole('admin', 'gestor'),
  financeiroController.obterFluxoCaixa
);

module.exports = router;
```

## 5.6 src/routes/agenda.routes.js

```javascript
const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agenda.controller');
const { verificarToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  criarEventoSchema,
  atualizarEventoSchema,
} = require('../validators/agenda.validator');

router.use(verificarToken);

// GET /api/v1/agenda
router.get('/', agendaController.listar);

// GET /api/v1/agenda/mes/:ano/:mes
router.get('/mes/:ano/:mes', agendaController.obterPorMes);

// GET /api/v1/agenda/alertas
router.get('/alertas', agendaController.obterAlertas);

// GET /api/v1/agenda/:id
router.get('/:id', agendaController.obter);

// POST /api/v1/agenda
router.post('/', validate(criarEventoSchema), agendaController.criar);

// PUT /api/v1/agenda/:id
router.put('/:id', validate(atualizarEventoSchema), agendaController.atualizar);

// DELETE /api/v1/agenda/:id
router.delete('/:id', agendaController.deletar);

module.exports = router;
```

## 5.7 src/routes/dashboard.routes.js

```javascript
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// GET /api/v1/dashboard/kpis
router.get('/kpis', dashboardController.obterKPIs);

// GET /api/v1/dashboard/graficos
router.get('/graficos', dashboardController.obterGraficos);

module.exports = router;
```

---

# 6. MIDDLEWARE

## 6.1 src/middleware/validate.js

```javascript
const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new AppError('Erro de validação', 400, 'VALIDATION_ERROR', errors);
    }

    req.body = value;
    next();
  };
};

module.exports = validate;
```

## 6.2 src/middleware/errorHandler.js

```javascript
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log do erro
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new AppError('Erro de validação', 400, 'VALIDATION_ERROR', errors);
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    error = new AppError(
      `${field} já está em uso`,
      400,
      'UNIQUE_CONSTRAINT_ERROR'
    );
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new AppError(
      'Registro vinculado não existe',
      400,
      'FOREIGN_KEY_ERROR'
    );
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Token inválido', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expirado', 401, 'TOKEN_EXPIRED');
  }

  // Resposta padrão
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: error.code,
      errors: error.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

module.exports = errorHandler;
```

## 6.3 src/middleware/rateLimiter.js

```javascript
const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      message: 'Muitas requisições. Tente novamente mais tarde.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
```

---

# 7. SERVICES

## 7.1 src/controllers/financeiro.controller.js

```javascript
const { Pagamento, Demanda, Correspondente } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

class FinanceiroController {
  async obterDashboard(req, res) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Total a receber
    const totalReceber = await Pagamento.sum('valor', {
      where: {
        tipo: 'receber',
        status: 'pendente',
      },
    });

    // Total vencidos
    const totalVencido = await Pagamento.sum('valor', {
      where: {
        tipo: 'receber',
        status: 'vencido',
      },
    });

    // Receita mês
    const receitaMes = await Pagamento.sum('valor', {
      where: {
        tipo: 'receber',
        status: 'pago',
        data_pagamento: {
          [Op.gte]: new Date(anoAtual, mesAtual, 1),
          [Op.lt]: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
    });

    // Despesas mês
    const despesaMes = await Pagamento.sum('valor', {
      where: {
        tipo: 'pagar',
        status: 'pago',
        data_pagamento: {
          [Op.gte]: new Date(anoAtual, mesAtual, 1),
          [Op.lt]: new Date(anoAtual, mesAtual + 1, 1),
        },
      },
    });

    // Lucro líquido
    const lucroLiquido = (receitaMes || 0) - (despesaMes || 0);

    res.json({
      success: true,
      data: {
        total_receber: totalReceber || 0,
        total_vencido: totalVencido || 0,
        receita_mes: receitaMes || 0,
        despesa_mes: despesaMes || 0,
        lucro_liquido: lucroLiquido,
      },
    });
  }

  async listarPagamentos(req, res) {
    const {
      page = 1,
      limit = 20,
      tipo,
      status,
      inicio,
      fim,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (tipo) where.tipo = tipo;
    if (status) where.status = status;

    if (inicio && fim) {
      where.data_vencimento = {
        [Op.between]: [new Date(inicio), new Date(fim)],
      };
    }

    const { count, rows } = await Pagamento.findAndCountAll({
      where,
      include: [
        { association: 'demanda', attributes: ['id', 'numero', 'titulo'] },
        { association: 'correspondente', attributes: ['id', 'nome_fantasia'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['data_vencimento', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        pagamentos: rows,
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
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
}

module.exports = new FinanceiroController();
```

## 7.2 src/controllers/agenda.controller.js

```javascript
const { Agenda, Demanda } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class AgendaController {
  async criar(req, res) {
    const agenda = await Agenda.create({
      ...req.body,
      criado_por: req.usuarioId,
    });

    res.status(201).json({
      success: true,
      message: 'Evento criado com sucesso',
      data: agenda,
    });
  }

  async listar(req, res) {
    const { inicio, fim, tipo, demanda_id } = req.query;

    const where = {};

    if (tipo) where.tipo = tipo;
    if (demanda_id) where.demanda_id = demanda_id;

    if (inicio && fim) {
      where.data_evento = {
        [Op.between]: [new Date(inicio), new Date(fim)],
      };
    }

    const eventos = await Agenda.findAll({
      where,
      include: [
        { association: 'demanda', attributes: ['id', 'numero', 'titulo'] },
      ],
      order: [['data_evento', 'ASC'], ['hora_evento', 'ASC']],
    });

    res.json({
      success: true,
      data: eventos,
    });
  }

  async obterPorMes(req, res) {
    const { ano, mes } = req.params;

    const primeiroDia = new Date(ano, mes - 1, 1);
    const ultimoDia = new Date(ano, mes, 0);

    const eventos = await Agenda.findAll({
      where: {
        data_evento: {
          [Op.between]: [primeiroDia, ultimoDia],
        },
      },
      include: [
        { association: 'demanda', attributes: ['id', 'numero', 'titulo'] },
      ],
      order: [['data_evento', 'ASC'], ['hora_evento', 'ASC']],
    });

    res.json({
      success: true,
      data: eventos,
    });
  }

  async obterAlertas(req, res) {
    const hoje = new Date();
    const proximos7Dias = new Date();
    proximos7Dias.setDate(proximos7Dias.getDate() + 7);

    const alertas = await Agenda.findAll({
      where: {
        data_evento: {
          [Op.between]: [hoje, proximos7Dias],
        },
      },
      include: [
        { association: 'demanda', attributes: ['id', 'numero', 'titulo'] },
      ],
      order: [['data_evento', 'ASC'], ['hora_evento', 'ASC']],
    });

    res.json({
      success: true,
      data: alertas,
    });
  }

  async obter(req, res) {
    const { id } = req.params;

    const agenda = await Agenda.findByPk(id, {
      include: [{ association: 'demanda' }],
    });

    if (!agenda) {
      throw new AppError('Evento não encontrado', 404);
    }

    res.json({
      success: true,
      data: agenda,
    });
  }

  async atualizar(req, res) {
    const { id } = req.params;

    const agenda = await Agenda.findByPk(id);

    if (!agenda) {
      throw new AppError('Evento não encontrado', 404);
    }

    await agenda.update(req.body);

    res.json({
      success: true,
      message: 'Evento atualizado com sucesso',
      data: agenda,
    });
  }

  async deletar(req, res) {
    const { id } = req.params;

    const agenda = await Agenda.findByPk(id);

    if (!agenda) {
      throw new AppError('Evento não encontrado', 404);
    }

    await agenda.destroy();

    res.json({
      success: true,
      message: 'Evento excluído com sucesso',
    });
  }
}

module.exports = new AgendaController();
```

---

# 8. UTILS

## 8.1 src/utils/AppError.js

```javascript
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

## 8.2 src/utils/logger.js

```javascript
const winston = require('winston');
const config = require('../config/env');

const logger = winston.createLogger({
  level: config.log.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'jurisconnect-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
```

---

# 9. VALIDATORS

## 9.1 src/validators/auth.validator.js

```javascript
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório',
  }),
  senha: Joi.string().min(8).required().messages({
    'string.min': 'Senha deve ter no mínimo 8 caracteres',
    'any.required': 'Senha é obrigatória',
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token é obrigatório',
  }),
});

module.exports = { loginSchema, refreshSchema };
```

## 9.2 src/validators/cliente.validator.js

```javascript
const Joi = require('joi');

const criarClienteSchema = Joi.object({
  tipo_pessoa: Joi.string().valid('fisica', 'juridica').required(),
  nome_fantasia: Joi.string().min(3).max(255).required(),
  razao_social: Joi.string().max(255).allow(null),
  cpf_cnpj: Joi.string().required(),
  email: Joi.string().email().required(),
  telefone: Joi.string().required(),
  celular: Joi.string().allow(null),
  endereco: Joi.string().max(500).allow(null),
  cidade: Joi.string().max(100).allow(null),
  estado: Joi.string().length(2).allow(null),
  cep: Joi.string().max(10).allow(null),
  observacoes: Joi.string().allow(null),
  ativo: Joi.boolean().default(true),
});

const atualizarClienteSchema = criarClienteSchema.fork(
  ['tipo_pessoa', 'cpf_cnpj'],
  (schema) => schema.optional()
);

module.exports = { criarClienteSchema, atualizarClienteSchema };
```

## 9.3 src/validators/demanda.validator.js

```javascript
const Joi = require('joi');

const criarDemandaSchema = Joi.object({
  titulo: Joi.string().min(5).max(255).required(),
  descricao: Joi.string().allow(null),
  tipo_demanda: Joi.string()
    .valid('diligencia', 'audiencia', 'protocolo', 'intimacao', 'outro')
    .required(),
  prioridade: Joi.string().valid('baixa', 'media', 'alta', 'urgente').default('media'),
  data_prazo: Joi.date().allow(null),
  valor_estimado: Joi.number().min(0).default(0),
  cliente_id: Joi.number().integer().required(),
  correspondente_id: Joi.number().integer().allow(null),
  especialidade_id: Joi.number().integer().allow(null),
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
      'em_andamento',
      'aguardando_correspondente',
      'concluida',
      'cancelada'
    )
    .required(),
});

module.exports = {
  criarDemandaSchema,
  atualizarDemandaSchema,
  atualizarStatusSchema,
};
```

---

# 10. MIGRATIONS E SEEDS

## 10.1 Exemplo Migration - Criar Tabela Usuarios

```javascript
// database/migrations/20250101000001-criar-tabela-usuarios.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      senha_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'gestor', 'operador'),
        defaultValue: 'operador',
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      ultimo_login: {
        type: Sequelize.DATE,
      },
      refresh_token: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuarios');
  },
};
```

## 10.2 Exemplo Seed - Usuario Admin

```javascript
// database/seeders/20250101000001-usuario-admin.js
'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const senhaHash = await bcrypt.hash('Admin@123', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        nome: 'Administrador',
        email: 'admin@jurisconnect.com',
        senha_hash: senhaHash,
        role: 'admin',
        ativo: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@jurisconnect.com' });
  },
};
```

---

**Backend Node.js Completo - Parte 2/2** ✅

## Checklist Final

```
Setup:
├─ [x] package.json
├─ [x] .env
├─ [x] Database config
├─ [x] Server Express
└─ [x] Middleware segurança

Models:
├─ [x] Usuario
├─ [x] Cliente
├─ [x] Correspondente
├─ [x] Demanda
├─ [x] Pagamento
├─ [x] Agenda
└─ [x] Associations

Auth:
├─ [x] JWT middleware
├─ [x] Login/Logout
├─ [x] Refresh token
└─ [x] Role-based access

Controllers:
├─ [x] Auth
├─ [x] Cliente
├─ [x] Correspondente
├─ [x] Demanda
├─ [x] Financeiro
├─ [x] Agenda
└─ [x] Dashboard

Routes:
├─ [x] /auth
├─ [x] /clientes
├─ [x] /correspondentes
├─ [x] /demandas
├─ [x] /financeiro
├─ [x] /agenda
└─ [x] /dashboard

Middleware:
├─ [x] Auth verificação
├─ [x] Role verificação
├─ [x] Validação Joi
├─ [x] Error handler
└─ [x] Rate limiter

Utils:
├─ [x] AppError
├─ [x] Logger (Winston)
└─ [x] Validators

Pronto para Produção!
```