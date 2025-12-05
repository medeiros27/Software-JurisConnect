# JURISCONNECT - SISTEMA COMPLETO DE BACKUP PARA NUVEM (GOOGLE DRIVE)

## 📋 ÍNDICE COMPLETO

1. [Setup Google Drive API](#1-setup-google-drive-api)
2. [Google Drive Service Manager](#2-google-drive-service-manager)
3. [Cloud Backup Manager](#3-cloud-backup-manager)
4. [Sincronização Automática](#4-sincronização-automática)
5. [Recovery e Restore](#5-recovery-e-restore)
6. [Dashboard de Sincronização](#6-dashboard-de-sincronização)
7. [Integração no Electron](#7-integração-no-electron)

---

# 1. SETUP GOOGLE DRIVE API

## 1.1 Configuração Inicial (credentials.json)

```json
{
  "installed": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "project_id": "jurisconnect-backup",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost:3000"]
  }
}
```

## 1.2 Passos para Obter Credenciais

```
1. Ir para: https://console.cloud.google.com
2. Criar novo projeto "JurisConnect Backup"
3. Ativar "Google Drive API"
4. Criar OAuth 2.0 Desktop Client ID
5. Fazer download do arquivo JSON
6. Salvar em: src/services/credentials.json
```

## 1.3 Scopes Necessários

```javascript
const SCOPES = [
  'https://www.googleapis.com/auth/drive', // Full access to Drive
  'https://www.googleapis.com/auth/drive.file', // Only app-created files
  'https://www.googleapis.com/auth/drive.metadata'
];
```

---

# 2. GOOGLE DRIVE SERVICE MANAGER

## 2.1 google-drive.service.js

```javascript
// src/services/google-drive.service.js
const fs = require('fs-extra');
const path = require('path');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const Readable = require('stream').Readable;

class GoogleDriveService {
  constructor(credentialsPath, tokenPath) {
    this.credentialsPath = credentialsPath;
    this.tokenPath = tokenPath;
    this.auth = null;
    this.drive = null;
    this.SCOPES = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file'
    ];
    this.JURISCONNECT_FOLDER = 'JurisConnect Backups';
    this.folderIdCache = null;
  }

  // ===== AUTENTICAÇÃO =====
  async authenticate() {
    console.log('Autenticando com Google Drive...');

    // Carregar token salvo
    if (await fs.pathExists(this.tokenPath)) {
      console.log('Usando token existente');
      const tokenData = await fs.readJSON(this.tokenPath);
      this.auth = new google.auth.OAuth2(
        JSON.parse(await fs.readFile(this.credentialsPath)).installed.client_id,
        JSON.parse(await fs.readFile(this.credentialsPath)).installed.client_secret,
        JSON.parse(await fs.readFile(this.credentialsPath)).installed.redirect_uris[0]
      );
      this.auth.setCredentials(tokenData);
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      return;
    }

    // Novo login
    try {
      this.auth = await authenticate({
        scopes: this.SCOPES,
        keyfilePath: this.credentialsPath
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });

      // Salvar token para reutilização
      const credentials = this.auth.credentials;
      await fs.writeJSON(this.tokenPath, credentials, { spaces: 2 });
      console.log('Token salvo para reutilização futura');
    } catch (error) {
      console.error('Erro na autenticação:', error);
      throw error;
    }
  }

  // ===== GERENCIAR PASTA =====
  async getFolderOrCreate() {
    if (this.folderIdCache) {
      return this.folderIdCache;
    }

    try {
      // Procurar pasta existente
      const response = await this.drive.files.list({
        q: `name='${this.JURISCONNECT_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
        pageSize: 1
      });

      if (response.data.files.length > 0) {
        this.folderIdCache = response.data.files[0].id;
        console.log('Pasta encontrada:', this.folderIdCache);
        return this.folderIdCache;
      }

      // Criar pasta se não existir
      console.log('Criando pasta no Google Drive...');
      const fileMetadata = {
        name: this.JURISCONNECT_FOLDER,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      this.folderIdCache = file.data.id;
      console.log('Pasta criada:', this.folderIdCache);
      return this.folderIdCache;
    } catch (error) {
      console.error('Erro ao gerenciar pasta:', error);
      throw error;
    }
  }

  // ===== UPLOAD =====
  async uploadFile(filePath, fileName = null) {
    try {
      if (!this.drive) {
        throw new Error('Não autenticado com Google Drive');
      }

      const folderId = await this.getFolderOrCreate();
      const name = fileName || path.basename(filePath);
      const fileSize = (await fs.stat(filePath)).size;

      console.log(`Fazendo upload: ${name} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

      const fileMetadata = {
        name,
        parents: [folderId],
        properties: {
          backupType: 'jurisconnect',
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      };

      const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath)
      };

      const response = await this.drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: 'id, name, size, createdTime, webViewLink'
        },
        {
          onUploadProgress: (event) => {
            const progress = Math.round((event.bytesProcessed / fileSize) * 100);
            console.log(`Progresso: ${progress}%`);
          }
        }
      );

      console.log('Upload concluído:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  // ===== DOWNLOAD =====
  async downloadFile(fileId, destPath) {
    try {
      console.log(`Baixando arquivo: ${fileId}`);

      const response = await this.drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);

        response.data
          .on('data', (chunk) => {
            process.stdout.write('.');
          })
          .on('end', () => {
            console.log('\nDownload concluído');
            resolve(destPath);
          })
          .on('error', reject)
          .pipe(file);

        file.on('error', reject);
      });
    } catch (error) {
      console.error('Erro no download:', error);
      throw error;
    }
  }

  // ===== LISTAR ARQUIVOS =====
  async listBackups(limit = 50) {
    try {
      const folderId = await this.getFolderOrCreate();

      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, size, createdTime, modifiedTime, webViewLink, properties)',
        pageSize: limit,
        orderBy: 'createdTime desc'
      });

      return response.data.files.map(file => ({
        id: file.id,
        name: file.name,
        size: parseInt(file.size),
        created: new Date(file.createdTime),
        modified: new Date(file.modifiedTime),
        url: file.webViewLink,
        properties: file.properties
      }));
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  // ===== DELETAR ARQUIVO =====
  async deleteFile(fileId) {
    try {
      console.log('Deletando arquivo:', fileId);

      await this.drive.files.delete({
        fileId
      });

      console.log('Arquivo deletado');
    } catch (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  }

  // ===== OBTER ESPAÇO DISPONÍVEL =====
  async getStorageInfo() {
    try {
      const response = await this.drive.about.get({
        fields: 'storageQuota'
      });

      const quota = response.data.storageQuota;
      return {
        totalStorage: parseInt(quota.limit),
        usedStorage: parseInt(quota.usage),
        freeStorage: parseInt(quota.limit) - parseInt(quota.usage),
        percentageUsed: Math.round((parseInt(quota.usage) / parseInt(quota.limit)) * 100)
      };
    } catch (error) {
      console.error('Erro ao obter espaço:', error);
      throw error;
    }
  }

  // ===== VERIFICAR CONECTIVIDADE =====
  async healthCheck() {
    try {
      if (!this.drive) {
        return { status: 'not_authenticated', error: 'Não autenticado' };
      }

      const about = await this.drive.about.get({
        fields: 'user'
      });

      const storage = await this.getStorageInfo();

      return {
        status: 'connected',
        user: about.data.user.emailAddress,
        storage
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // ===== CLEANUP - REMOVER BACKUPS ANTIGOS =====
  async cleanupOldBackups(keepDays = 30) {
    try {
      const backups = await this.listBackups(100);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);

      let deleted = 0;

      for (const backup of backups) {
        if (backup.created < cutoffDate) {
          await this.deleteFile(backup.id);
          deleted++;
        }
      }

      console.log(`${deleted} backups antigos deletados`);
      return deleted;
    } catch (error) {
      console.error('Erro na limpeza:', error);
      throw error;
    }
  }
}

module.exports = GoogleDriveService;
```

---

# 3. CLOUD BACKUP MANAGER

## 3.1 cloud-backup.manager.js

```javascript
// src/services/cloud-backup.manager.js
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { spawn } = require('child_process');
const GoogleDriveService = require('./google-drive.service');

class CloudBackupManager {
  constructor(localBackupDir, cloudCredentialsPath, config = {}) {
    this.localBackupDir = localBackupDir;
    this.cloudService = new GoogleDriveService(
      cloudCredentialsPath,
      path.join(path.dirname(cloudCredentialsPath), 'token.json')
    );
    this.config = {
      autoUploadDelay: config.autoUploadDelay || 300000, // 5 minutos após backup local
      maxLocalBackups: config.maxLocalBackups || 10,
      maxCloudBackups: config.maxCloudBackups || 30,
      compressionLevel: config.compressionLevel || 9,
      enableEncryption: config.enableEncryption || false,
      ...config
    };
    this.isUploading = false;
    this.uploadQueue = [];
  }

  // ===== INICIALIZAR =====
  async initialize() {
    console.log('Inicializando Cloud Backup Manager...');

    try {
      await this.cloudService.authenticate();
      await this.syncCloudBackups();
      console.log('Cloud Backup Manager inicializado');
      return true;
    } catch (error) {
      console.error('Erro na inicialização:', error);
      return false;
    }
  }

  // ===== FAZER BACKUP LOCAL E ENVIAR À NUVEM =====
  async backupAndUpload(databasePath, description = '') {
    try {
      console.log('Iniciando backup e upload...');

      // 1. Criar backup local
      const localBackupPath = await this.createLocalBackup(databasePath);

      // 2. Comprimir
      const compressedPath = await this.compressBackup(localBackupPath);

      // 3. Fazer upload automático
      this.uploadToCloud(compressedPath, description);

      // 4. Cleanup local automático
      this.cleanupLocalBackups();

      return {
        success: true,
        localPath: compressedPath,
        uploadQueued: true
      };
    } catch (error) {
      console.error('Erro no backup:', error);
      throw error;
    }
  }

  // ===== CRIAR BACKUP LOCAL =====
  async createLocalBackup(databasePath) {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
    const backupName = `backup-${timestamp}`;
    const backupDir = path.join(this.localBackupDir, backupName);

    await fs.ensureDir(backupDir);

    // Backup do banco
    const dbBackupPath = path.join(backupDir, 'database.sql');
    await this.backupDatabase(databasePath, dbBackupPath);

    // Metadata
    const metadata = {
      timestamp,
      type: 'local',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    };

    await fs.writeJSON(
      path.join(backupDir, 'metadata.json'),
      metadata,
      { spaces: 2 }
    );

    return backupDir;
  }

  // ===== BACKUP DATABASE =====
  async backupDatabase(databasePath, outputPath) {
    return new Promise((resolve, reject) => {
      // Simular pg_dump ou copiar arquivo
      const sourceFile = databasePath;
      
      const proc = spawn('pg_dump', [
        '-U', 'postgres',
        '-h', 'localhost',
        '-p', '5432',
        'jurisconnect'
      ]);

      const writeStream = fs.createWriteStream(outputPath);

      proc.stdout.pipe(writeStream);

      proc.on('close', (code) => {
        if (code === 0) {
          console.log('Banco de dados backup realizado');
          resolve();
        } else {
          reject(new Error(`pg_dump retornou código ${code}`));
        }
      });

      proc.on('error', reject);
    });
  }

  // ===== COMPRIMIR BACKUP =====
  async compressBackup(backupDir) {
    const timestamp = path.basename(backupDir);
    const zipPath = path.join(
      path.dirname(backupDir),
      `${timestamp}.zip`
    );

    console.log(`Comprimindo backup para: ${zipPath}`);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: this.config.compressionLevel }
      });

      output.on('close', () => {
        console.log(`Arquivo criado: ${archive.pointer()} bytes`);
        fs.remove(backupDir); // Remover dir descompactado
        resolve(zipPath);
      });

      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(backupDir, false);
      archive.finalize();
    });
  }

  // ===== UPLOAD PARA NUVEM =====
  async uploadToCloud(filePath, description = '') {
    try {
      if (this.isUploading) {
        console.log('Upload em progresso, adicionando à fila...');
        this.uploadQueue.push({ filePath, description });
        return;
      }

      this.isUploading = true;
      const fileName = path.basename(filePath);

      console.log(`Fazendo upload para Google Drive: ${fileName}`);

      const driveFile = await this.cloudService.uploadFile(filePath, fileName);

      console.log('Upload concluído com sucesso');

      // Adicionar metadados
      await this.saveBackupMetadata({
        fileName: driveFile.name,
        fileId: driveFile.id,
        size: driveFile.size,
        driveUrl: driveFile.webViewLink,
        uploadedAt: new Date().toISOString(),
        description
      });

      this.isUploading = false;

      // Processar próximo da fila
      if (this.uploadQueue.length > 0) {
        const next = this.uploadQueue.shift();
        await this.uploadToCloud(next.filePath, next.description);
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      this.isUploading = false;
    }
  }

  // ===== SINCRONIZAR BACKUPS NA NUVEM =====
  async syncCloudBackups() {
    try {
      console.log('Sincronizando backups na nuvem...');

      const cloudBackups = await this.cloudService.listBackups(100);

      console.log(`Total de backups na nuvem: ${cloudBackups.length}`);

      // Cleanup automático
      if (cloudBackups.length > this.config.maxCloudBackups) {
        const toDelete = cloudBackups.slice(this.config.maxCloudBackups);
        for (const backup of toDelete) {
          await this.cloudService.deleteFile(backup.id);
          console.log(`Deletado backup antigo: ${backup.name}`);
        }
      }

      return cloudBackups;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  // ===== CLEANUP LOCAL =====
  async cleanupLocalBackups() {
    try {
      const files = await fs.readdir(this.localBackupDir);
      const backups = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.zip'))
        .sort()
        .reverse();

      if (backups.length > this.config.maxLocalBackups) {
        for (let i = this.config.maxLocalBackups; i < backups.length; i++) {
          const oldBackup = path.join(this.localBackupDir, backups[i]);
          await fs.remove(oldBackup);
          console.log(`Deletado backup local antigo: ${backups[i]}`);
        }
      }
    } catch (error) {
      console.error('Erro no cleanup local:', error);
    }
  }

  // ===== LISTAR BACKUPS =====
  async listCloudBackups() {
    try {
      return await this.cloudService.listBackups();
    } catch (error) {
      console.error('Erro ao listar backups:', error);
      throw error;
    }
  }

  async listLocalBackups() {
    try {
      const files = await fs.readdir(this.localBackupDir);
      const backups = files.filter(f => f.startsWith('backup-') && f.endsWith('.zip'));

      const result = [];
      for (const file of backups) {
        const filePath = path.join(this.localBackupDir, file);
        const stats = await fs.stat(filePath);

        result.push({
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime
        });
      }

      return result.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Erro ao listar backups locais:', error);
      throw error;
    }
  }

  // ===== RESTORE DE BACKUP =====
  async restoreFromCloud(fileId, destinationPath) {
    try {
      console.log('Iniciando restore da nuvem...');

      const downloadPath = path.join(
        path.dirname(destinationPath),
        'download-' + Date.now() + '.zip'
      );

      // Download
      await this.cloudService.downloadFile(fileId, downloadPath);

      // Extrair
      await this.extractBackup(downloadPath, destinationPath);

      // Remover arquivo baixado
      await fs.remove(downloadPath);

      console.log('Restore concluído');
      return true;
    } catch (error) {
      console.error('Erro no restore:', error);
      throw error;
    }
  }

  // ===== EXTRAIR BACKUP =====
  async extractBackup(zipPath, destinationPath) {
    return new Promise((resolve, reject) => {
      const unzipper = require('unzipper');

      fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: destinationPath }))
        .on('close', () => {
          console.log('Backup extraído');
          resolve();
        })
        .on('error', reject);
    });
  }

  // ===== SALVAR METADATA =====
  async saveBackupMetadata(metadata) {
    try {
      const metaFile = path.join(
        this.localBackupDir,
        'cloud-backups.json'
      );

      let allMeta = [];
      if (await fs.pathExists(metaFile)) {
        allMeta = await fs.readJSON(metaFile);
      }

      allMeta.push(metadata);
      allMeta = allMeta.slice(-100); // Manter últimos 100

      await fs.writeJSON(metaFile, allMeta, { spaces: 2 });
    } catch (error) {
      console.error('Erro ao salvar metadata:', error);
    }
  }

  // ===== HEALTH CHECK =====
  async healthCheck() {
    try {
      const driveStatus = await this.cloudService.healthCheck();
      const localBackups = await this.listLocalBackups();
      const cloudBackups = await this.listCloudBackups();

      return {
        cloud: driveStatus,
        localBackups: localBackups.length,
        cloudBackups: cloudBackups.length,
        lastLocalBackup: localBackups.length > 0 ? localBackups[0].created : null,
        lastCloudBackup: cloudBackups.length > 0 ? cloudBackups[0].created : null
      };
    } catch (error) {
      return {
        error: error.message,
        cloud: { status: 'error' }
      };
    }
  }
}

module.exports = CloudBackupManager;
```

---

# 4. SINCRONIZAÇÃO AUTOMÁTICA

## 4.1 sync.scheduler.js

```javascript
// src/services/sync.scheduler.js
const cron = require('node-cron');

class SyncScheduler {
  constructor(cloudBackupManager) {
    this.manager = cloudBackupManager;
    this.tasks = {};
  }

  // ===== AGENDAR JOBS =====
  scheduleJobs(config = {}) {
    const {
      backupTime = '22:00', // 22:00 diariamente
      syncCloudTime = '23:00', // 23:00 diariamente
      cleanupTime = '02:00' // 02:00 diariamente
    } = config;

    // Backup diário
    this.tasks.dailyBackup = cron.schedule(`0 ${backupTime.split(':')[1]} ${backupTime.split(':')[0]} * * *`, async () => {
      console.log('Executando backup agendado...');
      try {
        await this.manager.backupAndUpload(
          path.join(app.getPath('userData'), 'data'),
          'Backup automático diário'
        );
      } catch (error) {
        console.error('Erro no backup agendado:', error);
      }
    });

    // Sincronização com nuvem
    this.tasks.cloudSync = cron.schedule(`0 ${syncCloudTime.split(':')[1]} ${syncCloudTime.split(':')[0]} * * *`, async () => {
      console.log('Sincronizando com Google Drive...');
      try {
        await this.manager.syncCloudBackups();
      } catch (error) {
        console.error('Erro na sincronização:', error);
      }
    });

    // Cleanup de backups antigos
    this.tasks.cleanup = cron.schedule(`0 ${cleanupTime.split(':')[1]} ${cleanupTime.split(':')[0]} * * *`, async () => {
      console.log('Limpando backups antigos...');
      try {
        await this.manager.cleanupLocalBackups();
        const deleted = await this.manager.cloudService.cleanupOldBackups(30);
        console.log(`${deleted} backups da nuvem deletados`);
      } catch (error) {
        console.error('Erro no cleanup:', error);
      }
    });

    console.log('Jobs de sincronização agendados');
  }

  // ===== PARAR JOBS =====
  stopJobs() {
    Object.values(this.tasks).forEach(task => {
      if (task) task.stop();
    });
    console.log('Jobs de sincronização parados');
  }

  // ===== EXECUTAR BACKUP AGORA =====
  async backupNow() {
    try {
      console.log('Executando backup imediato...');
      const result = await this.manager.backupAndUpload(
        path.join(app.getPath('userData'), 'data'),
        'Backup manual'
      );
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = SyncScheduler;
```

---

**Cloud Backup para Google Drive - Parte 1/2** ✅

**Continuação com Recovery, Dashboard e Integração Electron...**