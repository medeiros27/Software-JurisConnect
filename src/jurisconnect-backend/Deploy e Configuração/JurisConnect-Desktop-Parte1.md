# JURISCONNECT - DESKTOP APPLICATION FOR WINDOWS

## 📋 ÍNDICE COMPLETO

1. [Estrutura do Projeto](#1-estrutura-do-projeto)
2. [Configuração do Electron](#2-configuração-do-electron)
3. [Setup PostgreSQL Portable](#3-setup-postgresql-portable)
4. [Installer NSIS Profissional](#4-installer-nsis-profissional)
5. [Sistema de Backup Automático](#5-sistema-de-backup-automático)
6. [Guia de Instalação do Usuário](#6-guia-de-instalação-do-usuário)
7. [Scripts Utilitários](#7-scripts-utilitários)

---

# 1. ESTRUTURA DO PROJETO

## 1.1 Estrutura de Diretórios

```
jurisconnect-desktop/
├── src/
│   ├── main.js                    # Electron main process
│   ├── preload.js                # Preload script (IPC)
│   ├── renderer/                 # Frontend HTML/CSS/JS
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── services/                 # Backend services
│       ├── api-server.js
│       └── database-manager.js
├── backend/                       # Node.js backend
│   ├── server.js
│   ├── package.json
│   └── ...
├── resources/
│   ├── icons/
│   │   ├── icon.ico             # Windows icon
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-64.png
│   │   └── icon-256.png
│   ├── postgres/                # PostgreSQL portable
│   │   └── ...
│   └── scripts/
│       ├── init-db.sql
│       ├── backup-db.bat
│       └── restore-db.bat
├── installer/
│   ├── jurisconnect.nsi         # NSIS installer script
│   ├── banner.bmp
│   ├── welcome.txt
│   └── license.txt
├── dist/                         # Arquivos compilados
├── package.json                  # Electron + npm
├── electron-builder.json         # Config Electron Builder
└── README.md

# package.json principal
{
  "name": "jurisconnect",
  "version": "1.0.0",
  "description": "Sistema de Gestão Jurídica",
  "main": "src/main.js",
  "homepage": "./",
  "scripts": {
    "dev": "electron .",
    "start": "electron .",
    "build": "electron-builder",
    "build-installer": "electron-builder --win nsis",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "dependencies": {
    "electron-squirrel-startup": "^1.1.1",
    "electron-auto-updater": "^0.1.0",
    "node-sql-parser": "^4.2.0"
  },
  "devDependencies": {
    "electron": "^latest",
    "electron-builder": "^latest",
    "electron-icon-builder": "^latest"
  }
}
```

---

# 2. CONFIGURAÇÃO DO ELECTRON

## 2.1 main.js - Electron Main Process

```javascript
// src/main.js
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const DatabaseManager = require('./services/database-manager');
const APIServer = require('./services/api-server');

let mainWindow;
let dbManager;
let apiServer;

// Configurações
const APP_NAME = 'JurisConnect';
const APP_VERSION = '1.0.0';
const USER_DATA_PATH = path.join(app.getPath('userData'), 'data');
const BACKUP_PATH = path.join(app.getPath('userData'), 'backups');

// ===== CRIAR JANELA PRINCIPAL =====
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../resources/icons/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  // Carregar app
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Abrir DevTools em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Menu nativo
  createMenu();
}

// ===== CRIAR MENU NATIVO =====
function createMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        {
          label: 'Sair',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Refazer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Banco de Dados',
      submenu: [
        {
          label: 'Fazer Backup',
          click: async () => {
            const result = await dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Backup',
              message: 'Iniciando backup do banco de dados...',
              buttons: ['OK']
            });

            try {
              await dbManager.backup(BACKUP_PATH);
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Sucesso',
                message: 'Backup realizado com sucesso!'
              });
            } catch (error) {
              dialog.showErrorBox('Erro', 'Falha ao fazer backup: ' + error.message);
            }
          }
        },
        {
          label: 'Restaurar Backup',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Selecionar Arquivo de Backup',
              defaultPath: BACKUP_PATH,
              filters: [{ name: 'Backups', extensions: ['sql', 'sql.gz'] }],
              properties: ['openFile']
            });

            if (!result.canceled) {
              try {
                await dbManager.restore(result.filePaths[0]);
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Sucesso',
                  message: 'Backup restaurado com sucesso!'
                });
              } catch (error) {
                dialog.showErrorBox('Erro', 'Falha ao restaurar: ' + error.message);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Status do Banco',
          click: async () => {
            const status = await dbManager.getStatus();
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Status do Banco',
              message: JSON.stringify(status, null, 2)
            });
          }
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Sobre',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Sobre JurisConnect',
              message: `JurisConnect v${APP_VERSION}`,
              detail: 'Sistema de Gestão Jurídica\n\nTodos os direitos reservados'
            });
          }
        }
      ]
    }
  ];

  // Adicionar DevTools no desenvolvimento
  if (isDev) {
    template.push({
      label: 'DevTools',
      submenu: [
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ===== EVENTOS DO APP =====
app.on('ready', async () => {
  try {
    // Inicializar banco de dados
    dbManager = new DatabaseManager(USER_DATA_PATH);
    await dbManager.initialize();

    // Iniciar servidor API
    apiServer = new APIServer();
    apiServer.start(3001);

    // Criar janela
    createWindow();

    // Configurar auto-update
    setupAutoUpdate();
  } catch (error) {
    console.error('Erro ao inicializar:', error);
    dialog.showErrorBox('Erro', 'Falha ao inicializar aplicação: ' + error.message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Encerrar servidor API
  if (apiServer) {
    apiServer.stop();
  }

  // Encerrar banco de dados
  if (dbManager) {
    dbManager.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ===== AUTO UPDATE =====
function setupAutoUpdate() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Atualização Disponível',
      message: 'Uma atualização foi baixada e será instalada ao reiniciar',
      buttons: ['Reiniciar Agora', 'Depois']
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// ===== IPC HANDLERS =====
ipcMain.handle('get-app-info', () => ({
  name: APP_NAME,
  version: APP_VERSION,
  userDataPath: USER_DATA_PATH
}));

ipcMain.handle('backup-database', async () => {
  try {
    const backupPath = await dbManager.backup(BACKUP_PATH);
    return { success: true, path: backupPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-database-status', async () => {
  try {
    return await dbManager.getStatus();
  } catch (error) {
    return { error: error.message };
  }
});

// Handle para win32 Squirrel
if (require('electron-squirrel-startup')) {
  app.quit();
}
```

## 2.2 preload.js - IPC Seguro

```javascript
// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // App info
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // Database
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: (path) => ipcRenderer.invoke('restore-database', path),
  getDatabaseStatus: () => ipcRenderer.invoke('get-database-status'),

  // Events
  onDatabaseStatusChange: (callback) => {
    ipcRenderer.on('database-status-changed', (event, status) => {
      callback(status);
    });
  },

  // File dialog
  openFileDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options)
});
```

## 2.3 electron-builder.json

```json
{
  "appId": "com.jurisconnect.desktop",
  "productName": "JurisConnect",
  "directories": {
    "output": "dist",
    "buildResources": "resources"
  },
  "files": [
    "src/**/*",
    "build/**/*",
    "package.json",
    "resources/**/*"
  ],
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": [
          "x64"
        ]
      },
      {
        "target": "portable",
        "arch": [
          "x64"
        ]
      }
    ],
    "certificateFile": null,
    "certificatePassword": null,
    "signingHashAlgorithms": [
      "sha256"
    ],
    "sign": null,
    "artifactName": "${productName}-Setup-${version}.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "JurisConnect",
    "installerIcon": "resources/icons/icon.ico",
    "uninstallerIcon": "resources/icons/icon.ico",
    "installerHeaderIcon": "resources/icons/icon.ico",
    "installerSidebar": "resources/installer/banner.bmp",
    "uninstallerSidebar": "resources/installer/banner.bmp",
    "license": "resources/installer/license.txt"
  },
  "portable": {
    "artifactName": "${productName}-Portable-${version}.${ext}"
  },
  "publish": {
    "provider": "github",
    "owner": "seu-usuario",
    "repo": "jurisconnect-desktop",
    "releaseType": "release"
  }
}
```

---

# 3. SETUP POSTGRESQL PORTABLE

## 3.1 database-manager.js

```javascript
// src/services/database-manager.js
const fs = require('fs-extra');
const path = require('path');
const { spawn, exec } = require('child_process');
const pg = require('pg');

class DatabaseManager {
  constructor(dataPath) {
    this.dataPath = dataPath;
    this.postgresPath = path.join(dataPath, 'postgres');
    this.dataDir = path.join(this.postgresPath, 'data');
    this.backupDir = path.join(dataPath, 'backups');
    this.pool = null;
    this.pgProcess = null;
  }

  async initialize() {
    console.log('Inicializando banco de dados...');

    // Criar diretórios
    await fs.ensureDir(this.dataDir);
    await fs.ensureDir(this.backupDir);

    // Extrair PostgreSQL portable (se não existir)
    if (!fs.existsSync(path.join(this.postgresPath, 'bin'))) {
      await this.extractPostgres();
    }

    // Inicializar banco (se não existir)
    if (!fs.existsSync(path.join(this.dataDir, 'PG_VERSION'))) {
      await this.initdb();
    }

    // Iniciar servidor PostgreSQL
    await this.startServer();

    // Conectar
    await this.connect();

    // Criar banco de dados se não existir
    await this.createDatabase();

    console.log('Banco de dados inicializado com sucesso');
  }

  async extractPostgres() {
    console.log('Extraindo PostgreSQL...');

    // Assumindo que PostgreSQL está em resources/postgres
    const sourceDir = path.join(__dirname, '../../resources/postgres');
    const destDir = this.postgresPath;

    await fs.copy(sourceDir, destDir, {
      overwrite: false
    });

    console.log('PostgreSQL extraído');
  }

  async initdb() {
    console.log('Inicializando cluster de dados...');

    return new Promise((resolve, reject) => {
      const initdb = path.join(this.postgresPath, 'bin', 'initdb.exe');
      const args = ['-D', this.dataDir, '--locale', 'pt_BR.UTF-8'];

      const proc = spawn(initdb, args);

      proc.stderr.on('data', (data) => {
        console.log(`initdb: ${data}`);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          console.log('Cluster inicializado');
          resolve();
        } else {
          reject(new Error(`initdb retornou código ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }

  async startServer() {
    console.log('Iniciando servidor PostgreSQL...');

    const postgres = path.join(this.postgresPath, 'bin', 'postgres.exe');

    return new Promise((resolve, reject) => {
      this.pgProcess = spawn(postgres, [
        '-D', this.dataDir,
        '-p', '5432',
        '-F'
      ]);

      this.pgProcess.stderr.on('data', (data) => {
        const output = data.toString();
        console.log(`PostgreSQL: ${output}`);

        if (output.includes('database system is ready to accept')) {
          resolve();
        }
      });

      this.pgProcess.on('error', reject);
    });
  }

  async connect() {
    const maxRetries = 10;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        this.pool = new pg.Pool({
          user: 'postgres',
          password: 'postgres',
          host: 'localhost',
          port: 5432,
          database: 'postgres'
        });

        // Teste de conexão
        const client = await this.pool.connect();
        client.release();

        console.log('Conectado ao PostgreSQL');
        return;
      } catch (error) {
        retries++;
        console.log(`Tentativa ${retries}/${maxRetries} falhou, aguardando...`);
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    throw new Error('Não foi possível conectar ao PostgreSQL');
  }

  async createDatabase() {
    try {
      const client = await this.pool.connect();

      // Verificar se banco existe
      const result = await client.query(
        "SELECT 1 FROM pg_database WHERE datname = 'jurisconnect'"
      );

      if (result.rows.length === 0) {
        console.log('Criando banco de dados jurisconnect...');

        await client.query('CREATE DATABASE jurisconnect');

        // Executar scripts de inicialização
        const initScript = path.join(__dirname, '../../resources/scripts/init-db.sql');
        const sql = fs.readFileSync(initScript, 'utf8');

        await client.query(sql);

        console.log('Banco de dados criado');
      }

      client.release();
    } catch (error) {
      console.error('Erro ao criar banco:', error);
      throw error;
    }
  }

  async backup(backupDir) {
    console.log('Iniciando backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.sql.gz`);

    const pgdump = path.join(this.postgresPath, 'bin', 'pg_dump.exe');

    return new Promise((resolve, reject) => {
      const proc = spawn(pgdump, [
        '-U', 'postgres',
        '-h', 'localhost',
        '-p', '5432',
        'jurisconnect'
      ]);

      const gzip = require('child_process').spawn('gzip');
      const writeStream = fs.createWriteStream(backupFile);

      proc.stdout.pipe(gzip.stdin);
      gzip.stdout.pipe(writeStream);

      gzip.on('close', (code) => {
        if (code === 0) {
          console.log('Backup concluído: ' + backupFile);
          resolve(backupFile);
        } else {
          reject(new Error('Falha ao comprimir backup'));
        }
      });

      proc.on('error', reject);
      gzip.on('error', reject);
    });
  }

  async restore(backupFile) {
    console.log('Iniciando restore...');

    const psql = path.join(this.postgresPath, 'bin', 'psql.exe');

    return new Promise((resolve, reject) => {
      const cmd = `gunzip -c "${backupFile}" | "${psql}" -U postgres -h localhost -p 5432 -d jurisconnect`;

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          console.log('Restore concluído');
          resolve();
        }
      });
    });
  }

  async getStatus() {
    try {
      const client = await this.pool.connect();

      const result = await client.query(`
        SELECT
          (SELECT count(*) FROM pg_stat_user_tables) as tabelas,
          (SELECT sum(n_live_tup) FROM pg_stat_user_tables) as registros,
          pg_database_size('jurisconnect') / (1024*1024) as tamanho_mb,
          NOW() as timestamp
      `);

      client.release();

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao obter status:', error);
      return { error: error.message };
    }
  }

  async close() {
    console.log('Encerrando banco de dados...');

    if (this.pool) {
      await this.pool.end();
    }

    if (this.pgProcess) {
      this.pgProcess.kill();
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

module.exports = DatabaseManager;
```

---

**JurisConnect Desktop - Parte 1/2** ✅

**Continuação com Installer NSIS, Backup e Documentação Completa...**