# JURISCONNECT - Guia de Implementação Prática

## 1. SETUP INICIAL DO PROJETO

### 1.1 Estrutura Base - package.json

```json
{
  "name": "jurisconnect",
  "version": "1.0.0",
  "description": "Sistema SaaS de gestão de correspondentes jurídicos",
  "main": "src/main/index.js",
  "homepage": "./",
  "scripts": {
    "start": "concurrently \"npm run backend\" \"npm run frontend\"",
    "dev": "concurrently \"npm run backend:dev\" \"npm run frontend:dev\"",
    "backend": "node src/backend/server.js",
    "backend:dev": "nodemon src/backend/server.js --env development",
    "frontend": "react-scripts start",
    "frontend:dev": "PORT=3001 BROWSER=none react-scripts start",
    "electron": "electron .",
    "electron:dev": "concurrently \"npm run backend:dev\" \"electron . --remote-debugging-port=9222\"",
    "build": "npm run build:frontend && npm run build:electron",
    "build:frontend": "react-scripts build",
    "build:electron": "electron-builder",
    "build:windows": "electron-builder --win --publish never",
    "build:mac": "electron-builder --mac --publish never",
    "build:linux": "electron-builder --linux --publish never",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src --max-warnings=0",
    "format": "prettier --write \"src/**/*.{js,jsx,json}\"",
    "db:migrate": "sequelize-cli db:migrate",
    "db:migrate:undo": "sequelize-cli db:migrate:undo:all",
    "db:seed": "sequelize-cli db:seed:all",
    "backup:now": "node src/backend/scripts/backup-cron.js",
    "restore:backup": "node src/backend/scripts/restore-backup.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "jwt-simple": "^0.5.6",
    "bcrypt": "^5.1.1",
    "joi": "^17.11.0",
    "axios": "^1.6.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-cron": "^3.0.3",
    "winston": "^3.11.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.4",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4",
    "nodemon": "^3.0.2",
    "concurrently": "^8.2.2",
    "jest": "^29.7.0",
    "sequelize-cli": "^6.6.1",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  },
  "build": {
    "appId": "com.jurisconnect.app",
    "productName": "JurisConnect",
    "directories": {
      "buildResources": "assets"
    },
    "files": [
      "build/**/*",
      "src/main/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": [
        "msi",
        "portable"
      ]
    },
    "msi": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## 2. CONFIGURAÇÃO INICIAL DE BANCO DE DADOS

### 2.1 .sequelizerc (Configuração Sequelize)

```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src/backend/config', 'database.js'),
  'models-path': path.resolve('src/backend/models'),
  'seeders-path': path.resolve('src/backend/database/seeders'),
  'migrations-path': path.resolve('src/backend/database/migrations'),
};
```

### 2.2 config/database.js

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
    },
    pool: {
      max: 5,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};
```

---

## 3. EXEMPLO DE MODELO (Sequelize)

### 3.1 models/Correspondente.js

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Correspondente extends Model {
    static associate(models) {
      Correspondente.hasMany(models.Demanda, {
        foreignKey: 'correspondente_id',
        as: 'demandas',
      });
      
      Correspondente.hasMany(models.Pagamento, {
        foreignKey: 'correspondente_id',
        as: 'pagamentos',
      });
      
      Correspondente.belongsToMany(models.Especialidade, {
        through: models.CorrespondenteEspecialidade,
        as: 'especialidades',
        foreignKey: 'correspondente_id',
      });
    }
    
    // Método para validar CPF/CNPJ
    static validarCpfCnpj(valor) {
      const apenasNumeros = valor.replace(/\D/g, '');
      return apenasNumeros.length === 11 || apenasNumeros.length === 14;
    }
  }
  
  Correspondente.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome_fantasia: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [3, 255],
        },
      },
      nome_juridico: {
        type: DataTypes.STRING(255),
      },
      cpf_cnpj: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
          customValidator(value) {
            if (!Correspondente.validarCpfCnpj(value)) {
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
      cnpj_validado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      inscricao_estadual: {
        type: DataTypes.STRING(50),
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      classificacao: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
      },
      taxa_sucesso: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.00,
      },
    },
    {
      sequelize,
      modelName: 'Correspondente',
      tableName: 'correspondentes',
      timestamps: true,
      underscored: true,
    }
  );
  
  return Correspondente;
};
```

---

## 4. EXEMPLO DE SERVIÇO (Business Logic)

### 4.1 services/CorrespondenteService.js

```javascript
const { Correspondente, Especialidade, CorrespondenteEspecialidade } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class CorrespondenteService {
  async criar(dados) {
    try {
      const correspondente = await Correspondente.create(dados);
      
      // Associar especialidades se fornecidas
      if (dados.especialidades && dados.especialidades.length > 0) {
        await this.associarEspecialidades(correspondente.id, dados.especialidades);
      }
      
      logger.info(`Correspondente criado: ${correspondente.id}`);
      return this.obterComDetalhes(correspondente.id);
    } catch (error) {
      logger.error('Erro ao criar correspondente:', error);
      throw error;
    }
  }
  
  async atualizar(id, dados) {
    try {
      const correspondente = await Correspondente.findByPk(id);
      
      if (!correspondente) {
        throw new NotFoundError('Correspondente não encontrado');
      }
      
      await correspondente.update(dados);
      
      if (dados.especialidades) {
        await CorrespondenteEspecialidade.destroy({
          where: { correspondente_id: id },
        });
        await this.associarEspecialidades(id, dados.especialidades);
      }
      
      logger.info(`Correspondente atualizado: ${id}`);
      return this.obterComDetalhes(id);
    } catch (error) {
      logger.error('Erro ao atualizar correspondente:', error);
      throw error;
    }
  }
  
  async associarEspecialidades(correspondente_id, especialidades) {
    const associacoes = especialidades.map(espec => ({
      correspondente_id,
      especialidade_id: espec.especialidade_id,
      nivel_experiencia: espec.nivel_experiencia,
      preco_minimo: espec.preco_minimo,
      preco_por_hora: espec.preco_por_hora,
    }));
    
    await CorrespondenteEspecialidade.bulkCreate(associacoes);
  }
  
  async obterComDetalhes(id) {
    const correspondente = await Correspondente.findByPk(id, {
      include: [
        {
          association: 'especialidades',
          through: { attributes: ['nivel_experiencia', 'preco_minimo', 'preco_por_hora'] },
        },
      ],
    });
    
    if (!correspondente) {
      throw new NotFoundError('Correspondente não encontrado');
    }
    
    return correspondente;
  }
  
  async listar(filtros = {}) {
    const { estado, ativo, pagina = 1, limite = 20 } = filtros;
    const offset = (pagina - 1) * limite;
    
    const where = {};
    if (estado) where.estado_sediado = estado;
    if (ativo !== undefined) where.ativo = ativo;
    
    const { count, rows } = await Correspondente.findAndCountAll({
      where,
      include: ['especialidades'],
      limit: limite,
      offset,
      order: [['nome_fantasia', 'ASC']],
    });
    
    return {
      total: count,
      pagina,
      limite,
      paginas: Math.ceil(count / limite),
      dados: rows,
    };
  }
}

module.exports = new CorrespondenteService();
```

---

## 5. EXEMPLO DE CONTROLLER

### 5.1 controllers/CorrespondenteController.js

```javascript
const CorrespondenteService = require('../services/CorrespondenteService');
const { validarCorrespondente } = require('../utils/validators');
const logger = require('../utils/logger');

class CorrespondenteController {
  async criar(req, res, next) {
    try {
      const { error, value } = validarCorrespondente(req.body);
      
      if (error) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Dados inválidos',
          erro: error.details[0].message,
        });
      }
      
      const correspondente = await CorrespondenteService.criar(value);
      
      return res.status(201).json({
        sucesso: true,
        mensagem: 'Correspondente criado com sucesso',
        dados: correspondente,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async listar(req, res, next) {
    try {
      const filtros = {
        estado: req.query.estado,
        ativo: req.query.ativo === 'true',
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 20,
      };
      
      const resultado = await CorrespondenteService.listar(filtros);
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Correspondentes listados com sucesso',
        dados: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async obter(req, res, next) {
    try {
      const { id } = req.params;
      const correspondente = await CorrespondenteService.obterComDetalhes(id);
      
      return res.status(200).json({
        sucesso: true,
        dados: correspondente,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const correspondente = await CorrespondenteService.atualizar(id, req.body);
      
      return res.status(200).json({
        sucesso: true,
        mensagem: 'Correspondente atualizado com sucesso',
        dados: correspondente,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CorrespontenteController();
```

---

## 6. EXEMPLO DE ROTA

### 6.1 routes/correspondentes.js

```javascript
const express = require('express');
const router = express.Router();
const CorrespondenteController = require('../controllers/CorrespondenteController');
const { verificarAuth } = require('../middleware/auth');

// Todas as rotas de correspondentes requerem autenticação
router.use(verificarAuth);

// GET /api/v1/correspondentes
router.get('/', CorrespondenteController.listar);

// GET /api/v1/correspondentes/:id
router.get('/:id', CorrespondenteController.obter);

// POST /api/v1/correspondentes
router.post('/', CorrespondenteController.criar);

// PUT /api/v1/correspondentes/:id
router.put('/:id', CorrespondenteController.atualizar);

// DELETE /api/v1/correspondentes/:id
router.delete('/:id', CorrespondenteController.deletar);

module.exports = router;
```

---

## 7. MIDDLEWARE DE AUTENTICAÇÃO

### 7.1 middleware/auth.js

```javascript
const jwt = require('jwt-simple');
const logger = require('../utils/logger');

const verificarAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token não fornecido',
      codigo: 'TOKEN_AUSENTE',
    });
  }
  
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    
    // Verificar expiração
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token expirado',
        codigo: 'TOKEN_EXPIRADO',
      });
    }
    
    // Adicionar dados do usuário ao request
    req.usuario = decoded;
    next();
  } catch (error) {
    logger.error('Erro ao verificar token:', error);
    return res.status(401).json({
      sucesso: false,
      mensagem: 'Token inválido',
      codigo: 'TOKEN_INVALIDO',
    });
  }
};

const verificarRole = (rolesPermitidas) => {
  return (req, res, next) => {
    if (!rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado',
        codigo: 'ACESSO_NEGADO',
      });
    }
    next();
  };
};

module.exports = { verificarAuth, verificarRole };
```

---

## 8. INICIALIZAÇÃO DO SERVIDOR

### 8.1 backend/server.js

```javascript
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const BackupService = require('./services/BackupService');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor iniciado na porta ${PORT}`);
});

// Iniciar agendador de backup
BackupService.agendar();

// Tratamento de sinais
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});

module.exports = server;
```

### 8.2 backend/app.js

```javascript
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Importar rotas
const authRoutes = require('./routes/auth');
const correspondenteRoutes = require('./routes/correspondentes');
const clienteRoutes = require('./routes/clientes');
const demandaRoutes = require('./routes/demandas');
const diligenciaRoutes = require('./routes/diligencias');
const pagamentoRoutes = require('./routes/pagamentos');
const agendaRoutes = require('./routes/agenda');
const relatorioRoutes = require('./routes/relatorios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/correspondentes', correspondenteRoutes);
app.use('/api/v1/clientes', clienteRoutes);
app.use('/api/v1/demandas', demandaRoutes);
app.use('/api/v1/diligencias', diligenciaRoutes);
app.use('/api/v1/pagamentos', pagamentoRoutes);
app.use('/api/v1/agenda', agendaRoutes);
app.use('/api/v1/relatorios', relatorioRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler
app.use(errorHandler);

module.exports = app;
```

---

## 9. ELECTRON MAIN PROCESS

### 9.1 main/index.js

```javascript
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3001'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
require('./ipc-handlers');
```

### 9.2 main/preload.js

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcApi', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, func),
  once: (channel, func) => ipcRenderer.once(channel, func),
  off: (channel, func) => ipcRenderer.off(channel, func),
});
```

---

## 10. SCRIPT DE RESTAURAÇÃO DE BACKUP

### 10.1 scripts/restore-backup.js

```bash
#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const backupDir = path.join(__dirname, '../database/backups');
const arquivos = fs.readdirSync(backupDir).filter(f => f.endsWith('.tar'));

console.log('\n📦 JURISCONNECT - Restauração de Backup\n');
console.log('Backups disponíveis:\n');

arquivos.forEach((arquivo, index) => {
  const stats = fs.statSync(path.join(backupDir, arquivo));
  console.log(`${index + 1}. ${arquivo} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
});

rl.question('\nSelecione o número do backup a restaurar: ', (resposta) => {
  const indice = parseInt(resposta) - 1;
  
  if (indice < 0 || indice >= arquivos.length) {
    console.error('❌ Opção inválida');
    process.exit(1);
  }
  
  const arquivoRestore = arquivos[indice];
  const caminhoRestore = path.join(backupDir, arquivoRestore);
  
  rl.question(
    `\n⚠️  ATENÇÃO: Isso apagará todos os dados atuais e restaurará ${arquivoRestore}. Tem certeza? (sim/não): `,
    (confirmacao) => {
      if (confirmacao.toLowerCase() !== 'sim') {
        console.log('Operação cancelada');
        process.exit(0);
      }
      
      console.log('\n⏳ Restaurando backup...\n');
      
      const restore = spawn('pg_restore', [
        '-cC',
        '-U', process.env.DB_USER,
        '-h', process.env.DB_HOST,
        '-p', process.env.DB_PORT,
        '-d', process.env.DB_NAME,
        caminhoRestore,
      ], {
        env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD },
        stdio: 'inherit',
      });
      
      restore.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Backup restaurado com sucesso!');
        } else {
          console.error(`\n❌ Erro na restauração (código: ${code})`);
        }
        process.exit(code);
      });
      
      rl.close();
    }
  );
});
```

---

## 11. CHECKLIST DE DESENVOLVIMENTO

### Frontend
- [ ] Setup React com React Router
- [ ] Context API para autenticação
- [ ] Componentes base (Header, Sidebar, Footer)
- [ ] Pages: Dashboard, Correspondentes, Clientes, Demandas, etc
- [ ] Forms com validação
- [ ] Tabelas com paginação
- [ ] Modais e notificações Toast
- [ ] Integração com API
- [ ] Tratamento de erros

### Backend
- [ ] Setup Express + Sequelize
- [ ] Models de todas as entidades
- [ ] Migrations do banco
- [ ] Controllers e Services
- [ ] Routes com validações
- [ ] Autenticação JWT
- [ ] Middleware de erros
- [ ] Logging
- [ ] Testes unitários

### Integrações
- [ ] WhatsApp (Zenvia/Twilio)
- [ ] Google Calendar
- [ ] APIs jurídicas (Judit)
- [ ] Backup automático
- [ ] Email (opcional)

### Desktop
- [ ] Electron setup
- [ ] IPC handlers
- [ ] Instaladores (Windows, Mac, Linux)
- [ ] Auto-update
- [ ] System tray

---

**Versão: 1.0 - Pronta para Implementação Completa**