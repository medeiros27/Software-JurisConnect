# JURISCONNECT - BACKEND COMPLETO NODE.JS + EXPRESS + POSTGRESQL

## 📋 ÍNDICE

1. [Configuração e Setup](#1-configuração-e-setup)
2. [Database e Models](#2-database-e-models)
3. [Autenticação JWT](#3-autenticação-jwt)
4. [Controllers](#4-controllers)
5. [Routes](#5-routes)
6. [Middleware](#6-middleware)
7. [Services](#7-services)
8. [Utils](#8-utils)

---

# 1. CONFIGURAÇÃO E SETUP

## 1.1 package.json

```json
{
  "name": "jurisconnect-backend",
  "version": "1.0.0",
  "description": "Backend sistema gestão correspondentes jurídicos",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src --max-warnings=0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.35.2",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-async-errors": "^3.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "sequelize-cli": "^6.6.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0"
  }
}
```

## 1.2 .env.example

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jurisconnect
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=outra_chave_secreta_para_refresh
JWT_REFRESH_EXPIRES_IN=30d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3001

# Logs
LOG_LEVEL=debug
```

## 1.3 src/config/database.js

```javascript
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};
```

## 1.4 src/config/env.js

```javascript
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  apiVersion: process.env.API_VERSION || 'v1',
  
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX),
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
```

## 1.5 src/server.js

```javascript
require('express-async-errors');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const config = require('./config/env');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Rotas
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const correspondenteRoutes = require('./routes/correspondente.routes');
const demandaRoutes = require('./routes/demanda.routes');
const financeiroRoutes = require('./routes/financeiro.routes');
const agendaRoutes = require('./routes/agenda.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors(config.cors));
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/clientes`, clienteRoutes);
app.use(`${apiPrefix}/correspondentes`, correspondenteRoutes);
app.use(`${apiPrefix}/demandas`, demandaRoutes);
app.use(`${apiPrefix}/financeiro`, financeiroRoutes);
app.use(`${apiPrefix}/agenda`, agendaRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado na porta ${PORT}`);
  logger.info(`📝 Ambiente: ${config.env}`);
  logger.info(`🔗 API: http://localhost:${PORT}${apiPrefix}`);
});

module.exports = app;
```

---

# 2. DATABASE E MODELS

## 2.1 src/models/index.js

```javascript
const { Sequelize } = require('sequelize');
const config = require('../config/database');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool,
  }
);

const db = {};

// Importar models
db.Usuario = require('./Usuario')(sequelize);
db.Cliente = require('./Cliente')(sequelize);
db.Correspondente = require('./Correspondente')(sequelize);
db.Especialidade = require('./Especialidade')(sequelize);
db.Demanda = require('./Demanda')(sequelize);
db.Diligencia = require('./Diligencia')(sequelize);
db.Documento = require('./Documento')(sequelize);
db.Pagamento = require('./Pagamento')(sequelize);
db.Agenda = require('./Agenda')(sequelize);
db.Notificacao = require('./Notificacao')(sequelize);

// Executar associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

## 2.2 src/models/Usuario.js

```javascript
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: [3, 150],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    senha_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'gestor', 'operador'),
      defaultValue: 'operador',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ultimo_login: {
      type: DataTypes.DATE,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.senha_hash) {
          usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('senha_hash')) {
          usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, 10);
        }
      },
    },
  });

  // Métodos de instância
  Usuario.prototype.validarSenha = async function(senha) {
    return bcrypt.compare(senha, this.senha_hash);
  };

  Usuario.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.senha_hash;
    delete values.refresh_token;
    return values;
  };

  // Associations
  Usuario.associate = (models) => {
    Usuario.hasMany(models.Demanda, {
      foreignKey: 'criado_por',
      as: 'demandas_criadas',
    });
  };

  return Usuario;
};
```

## 2.3 src/models/Cliente.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cliente = sequelize.define('Cliente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_pessoa: {
      type: DataTypes.ENUM('fisica', 'juridica'),
      allowNull: false,
    },
    nome_fantasia: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razao_social: {
      type: DataTypes.STRING(255),
    },
    cpf_cnpj: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        isValidDocument(value) {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length !== 11 && cleaned.length !== 14) {
            throw new Error('CPF ou CNPJ inválido');
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    celular: {
      type: DataTypes.STRING(20),
    },
    endereco: {
      type: DataTypes.STRING(500),
    },
    cidade: {
      type: DataTypes.STRING(100),
    },
    estado: {
      type: DataTypes.CHAR(2),
    },
    cep: {
      type: DataTypes.STRING(10),
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'clientes',
    timestamps: true,
    underscored: true,
  });

  // Associations
  Cliente.associate = (models) => {
    Cliente.hasMany(models.Demanda, {
      foreignKey: 'cliente_id',
      as: 'demandas',
    });
  };

  return Cliente;
};
```

## 2.4 src/models/Correspondente.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Correspondente = sequelize.define('Correspondente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_fantasia: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    razao_social: {
      type: DataTypes.STRING(255),
    },
    cpf_cnpj: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    celular: {
      type: DataTypes.STRING(20),
    },
    estado_sediado: {
      type: DataTypes.CHAR(2),
      allowNull: false,
    },
    cidade_sediado: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    endereco_completo: {
      type: DataTypes.STRING(500),
    },
    cep: {
      type: DataTypes.STRING(10),
    },
    oab_numero: {
      type: DataTypes.STRING(20),
    },
    oab_estado: {
      type: DataTypes.CHAR(2),
    },
    classificacao: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 5,
      },
    },
    taxa_sucesso: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'correspondentes',
    timestamps: true,
    underscored: true,
  });

  // Associations
  Correspondente.associate = (models) => {
    Correspondente.hasMany(models.Demanda, {
      foreignKey: 'correspondente_id',
      as: 'demandas',
    });

    Correspondente.belongsToMany(models.Especialidade, {
      through: 'correspondente_especialidades',
      foreignKey: 'correspondente_id',
      as: 'especialidades',
    });
  };

  return Correspondente;
};
```

## 2.5 src/models/Demanda.js

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
      type: DataTypes.ENUM('diligencia', 'audiencia', 'protocolo', 'intimacao', 'outro'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'rascunho',
        'pendente',
        'em_andamento',
        'aguardando_correspondente',
        'concluida',
        'cancelada'
      ),
      defaultValue: 'rascunho',
    },
    prioridade: {
      type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
      defaultValue: 'media',
    },
    data_prazo: {
      type: DataTypes.DATE,
    },
    data_inicio: {
      type: DataTypes.DATE,
    },
    data_conclusao: {
      type: DataTypes.DATE,
    },
    valor_estimado: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    valor_cobrado: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id',
      },
    },
    correspondente_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'correspondentes',
        key: 'id',
      },
    },
    especialidade_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'especialidades',
        key: 'id',
      },
    },
    criado_por: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
  }, {
    tableName: 'demandas',
    timestamps: true,
    underscored: true,
  });

  // Associations
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
  };

  return Demanda;
};
```

## 2.6 src/models/Pagamento.js

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
    },
    tipo: {
      type: DataTypes.ENUM('receber', 'pagar'),
      allowNull: false,
    },
    valor: {
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
    status: {
      type: DataTypes.ENUM('pendente', 'pago', 'vencido', 'cancelado'),
      defaultValue: 'pendente',
    },
    forma_pagamento: {
      type: DataTypes.ENUM('dinheiro', 'pix', 'ted', 'boleto', 'cartao'),
    },
    observacoes: {
      type: DataTypes.TEXT,
    },
    demanda_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'demandas',
        key: 'id',
      },
    },
    correspondente_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'correspondentes',
        key: 'id',
      },
    },
  }, {
    tableName: 'pagamentos',
    timestamps: true,
    underscored: true,
  });

  // Associations
  Pagamento.associate = (models) => {
    Pagamento.belongsTo(models.Demanda, {
      foreignKey: 'demanda_id',
      as: 'demanda',
    });

    Pagamento.belongsTo(models.Correspondente, {
      foreignKey: 'correspondente_id',
      as: 'correspondente',
    });
  };

  return Pagamento;
};
```

## 2.7 src/models/Agenda.js

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agenda = sequelize.define('Agenda', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
    },
    tipo: {
      type: DataTypes.ENUM('prazo', 'audiencia', 'reuniao', 'lembrete', 'outro'),
      allowNull: false,
    },
    data_evento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_evento: {
      type: DataTypes.TIME,
    },
    duracao_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    local: {
      type: DataTypes.STRING(500),
    },
    alerta_dias_antes: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    demanda_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'demandas',
        key: 'id',
      },
    },
    criado_por: {
      type: DataTypes.INTEGER,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
  }, {
    tableName: 'agenda',
    timestamps: true,
    underscored: true,
  });

  // Associations
  Agenda.associate = (models) => {
    Agenda.belongsTo(models.Demanda, {
      foreignKey: 'demanda_id',
      as: 'demanda',
    });

    Agenda.belongsTo(models.Usuario, {
      foreignKey: 'criado_por',
      as: 'criador',
    });
  };

  return Agenda;
};
```

---

# 3. AUTENTICAÇÃO JWT

## 3.1 src/middleware/auth.js

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { Usuario } = require('../models');
const AppError = require('../utils/AppError');

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('Token não fornecido', 401, 'TOKEN_AUSENTE');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      throw new AppError('Token mal formatado', 401, 'TOKEN_MALFORMATADO');
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      throw new AppError('Token mal formatado', 401, 'TOKEN_MALFORMATADO');
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    // Buscar usuário
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario) {
      throw new AppError('Usuário não encontrado', 401, 'USUARIO_NAO_ENCONTRADO');
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário inativo', 401, 'USUARIO_INATIVO');
    }

    // Adicionar usuário ao request
    req.usuario = usuario;
    req.usuarioId = usuario.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido', 401, 'TOKEN_INVALIDO'));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401, 'TOKEN_EXPIRADO'));
    }

    next(error);
  }
};

const verificarRole = (...rolesPermitidas) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new AppError('Usuário não autenticado', 401));
    }

    if (!rolesPermitidas.includes(req.usuario.role)) {
      return next(
        new AppError('Sem permissão para acessar este recurso', 403, 'SEM_PERMISSAO')
      );
    }

    next();
  };
};

module.exports = { verificarToken, verificarRole };
```

## 3.2 src/controllers/auth.controller.js

```javascript
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

class AuthController {
  async login(req, res) {
    const { email, senha } = req.body;

    // Buscar usuário
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      throw new AppError('Credenciais inválidas', 401, 'CREDENCIAIS_INVALIDAS');
    }

    if (!usuario.ativo) {
      throw new AppError('Usuário inativo', 401, 'USUARIO_INATIVO');
    }

    // Validar senha
    const senhaValida = await usuario.validarSenha(senha);

    if (!senhaValida) {
      throw new AppError('Credenciais inválidas', 401, 'CREDENCIAIS_INVALIDAS');
    }

    // Gerar tokens
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    // Salvar refresh token
    await usuario.update({
      refresh_token: refreshToken,
      ultimo_login: new Date(),
    });

    logger.info(`Login bem-sucedido: ${usuario.email}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        refreshToken,
        usuario: usuario.toJSON(),
      },
    });
  }

  async refresh(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token não fornecido', 401);
    }

    // Verificar token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Buscar usuário
    const usuario = await Usuario.findByPk(decoded.id);

    if (!usuario || usuario.refresh_token !== refreshToken) {
      throw new AppError('Refresh token inválido', 401);
    }

    // Gerar novo token
    const novoToken = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      success: true,
      data: {
        token: novoToken,
      },
    });
  }

  async logout(req, res) {
    const usuario = req.usuario;

    // Limpar refresh token
    await usuario.update({ refresh_token: null });

    logger.info(`Logout: ${usuario.email}`);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  }

  async me(req, res) {
    res.json({
      success: true,
      data: req.usuario.toJSON(),
    });
  }
}

module.exports = new AuthController();
```

---

# 4. CONTROLLERS

## 4.1 src/controllers/cliente.controller.js

```javascript
const { Cliente, Demanda } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class ClienteController {
  async criar(req, res) {
    const cliente = await Cliente.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: cliente,
    });
  }

  async listar(req, res) {
    const {
      page = 1,
      limit = 20,
      tipo_pessoa,
      ativo,
      busca,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (tipo_pessoa) where.tipo_pessoa = tipo_pessoa;
    if (ativo !== undefined) where.ativo = ativo === 'true';

    if (busca) {
      where[Op.or] = [
        { nome_fantasia: { [Op.iLike]: `%${busca}%` } },
        { razao_social: { [Op.iLike]: `%${busca}%` } },
        { cpf_cnpj: { [Op.like]: `%${busca}%` } },
        { email: { [Op.iLike]: `%${busca}%` } },
      ];
    }

    const { count, rows } = await Cliente.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['nome_fantasia', 'ASC']],
    });

    res.json({
      success: true,
      data: {
        clientes: rows,
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  }

  async obter(req, res) {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          association: 'demandas',
          attributes: ['id', 'numero', 'titulo', 'status'],
        },
      ],
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    res.json({
      success: true,
      data: cliente,
    });
  }

  async atualizar(req, res) {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    await cliente.update(req.body);

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: cliente,
    });
  }

  async deletar(req, res) {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    // Verificar se tem demandas
    const demandas = await Demanda.count({ where: { cliente_id: id } });

    if (demandas > 0) {
      throw new AppError(
        'Cliente possui demandas vinculadas e não pode ser excluído',
        400
      );
    }

    await cliente.destroy();

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso',
    });
  }
}

module.exports = new ClienteController();
```

## 4.2 src/controllers/demanda.controller.js

```javascript
const { Demanda, Cliente, Correspondente, Especialidade } = require('../models');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class DemandaController {
  async criar(req, res) {
    const { cliente_id, correspondente_id, especialidade_id } = req.body;

    // Validar cliente
    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    // Gerar número único
    const count = await Demanda.count();
    const numero = `DEM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const demanda = await Demanda.create({
      ...req.body,
      numero,
      criado_por: req.usuarioId,
    });

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
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (prioridade) where.prioridade = prioridade;
    if (cliente_id) where.cliente_id = cliente_id;
    if (correspondente_id) where.correspondente_id = correspondente_id;
    if (tipo_demanda) where.tipo_demanda = tipo_demanda;

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
        { association: 'especialidade', attributes: ['id', 'nome'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        demandas: rows,
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
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
        { association: 'diligencias' },
        { association: 'documentos' },
        { association: 'pagamentos' },
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

  async atualizar(req, res) {
    const { id } = req.params;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    await demanda.update(req.body);

    res.json({
      success: true,
      message: 'Demanda atualizada com sucesso',
      data: demanda,
    });
  }

  async atualizarStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    await demanda.update({ status });

    // Se concluída, registrar data
    if (status === 'concluida') {
      await demanda.update({ data_conclusao: new Date() });
    }

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: demanda,
    });
  }

  async deletar(req, res) {
    const { id } = req.params;

    const demanda = await Demanda.findByPk(id);

    if (!demanda) {
      throw new AppError('Demanda não encontrada', 404);
    }

    await demanda.destroy();

    res.json({
      success: true,
      message: 'Demanda excluída com sucesso',
    });
  }

  // KPIs Dashboard
  async obterKanban(req, res) {
    const demandas = await Demanda.findAll({
      where: {
        status: {
          [Op.in]: [
            'pendente',
            'em_andamento',
            'aguardando_correspondente',
          ],
        },
      },
      include: [
        { association: 'cliente', attributes: ['id', 'nome_fantasia'] },
        { association: 'correspondente', attributes: ['id', 'nome_fantasia'] },
      ],
      order: [['prioridade', 'DESC'], ['data_prazo', 'ASC']],
    });

    // Agrupar por status
    const kanban = {
      pendente: [],
      em_andamento: [],
      aguardando_correspondente: [],
    };

    demandas.forEach((demanda) => {
      kanban[demanda.status].push(demanda);
    });

    res.json({
      success: true,
      data: kanban,
    });
  }
}

module.exports = new DemandaController();
```

## 4.3 src/controllers/dashboard.controller.js

```javascript
const { Demanda, Pagamento, Cliente, Correspondente } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

class DashboardController {
  async obterKPIs(req, res) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    // Total demandas ativas
    const demandasAtivas = await Demanda.count({
      where: {
        status: {
          [Op.in]: ['pendente', 'em_andamento', 'aguardando_correspondente'],
        },
      },
    });

    // Receita mês atual
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
        data_pagamento: { [Op.gte]: seismesesAtras },
      },
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('data_pagamento')), 'ASC']],
    });

    // Demandas por status
    const demandasPorStatus = await Demanda.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      ],
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
}

module.exports = new DashboardController();
```

---

**Continuação nos próximos arquivos: Routes, Middleware, Validações e Utils...**

---

**Backend Node.js Completo - Parte 1/2** ✅