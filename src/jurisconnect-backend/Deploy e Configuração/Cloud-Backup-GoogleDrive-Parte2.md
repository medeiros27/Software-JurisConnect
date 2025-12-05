# CLOUD BACKUP GOOGLE DRIVE (PARTE 2)

## 📋 CONTINUAÇÃO

5. [Recovery e Restore Automático](#5-recovery-e-restore-automático)
6. [Dashboard de Sincronização](#6-dashboard-de-sincronização)
7. [Integração no Electron](#7-integração-no-electron)
8. [Guia do Usuário e Setup](#8-guia-do-usuário-e-setup)

---

# 5. RECOVERY E RESTORE AUTOMÁTICO

## 5.1 recovery.manager.js

```javascript
// src/services/recovery.manager.js
const fs = require('fs-extra');
const path = require('path');

class RecoveryManager {
  constructor(cloudBackupManager, databaseManager) {
    this.cloudBackupManager = cloudBackupManager;
    this.db = databaseManager;
    this.recoveryLog = [];
  }

  // ===== LISTAR DISPONÍVEIS =====
  async getAvailableRecoveryPoints() {
    try {
      const localBackups = await this.cloudBackupManager.listLocalBackups();
      const cloudBackups = await this.cloudBackupManager.listCloudBackups();

      const points = [];

      // Backups locais
      for (const backup of localBackups) {
        points.push({
          id: backup.name,
          source: 'local',
          name: backup.name,
          date: backup.created,
          size: backup.size,
          path: backup.path,
          available: true
        });
      }

      // Backups na nuvem
      for (const backup of cloudBackups) {
        points.push({
          id: backup.id,
          source: 'cloud',
          name: backup.name,
          date: backup.created,
          size: backup.size,
          available: true
        });
      }

      return points.sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Erro ao obter pontos de recuperação:', error);
      throw error;
    }
  }

  // ===== RESTORE AUTOMÁTICO COM VALIDAÇÃO =====
  async restoreWithValidation(backupId, source = 'cloud') {
    try {
      console.log(`Iniciando restore de: ${backupId} (${source})`);

      // 1. Criar ponto de restauração (backup do estado atual)
      console.log('Criando ponto de restauração de segurança...');
      const safetyBackup = await this.cloudBackupManager.createLocalBackup(
        path.join(this.db.dataPath, 'data')
      );

      try {
        // 2. Fazer restore
        if (source === 'cloud') {
          const tempDir = path.join(this.db.dataPath, 'restore-temp');
          await fs.ensureDir(tempDir);

          await this.cloudBackupManager.restoreFromCloud(backupId, tempDir);

          // Restaurar banco
          const dbBackupPath = path.join(tempDir, 'backup-*', 'database.sql');
          const dbFiles = await fs.glob(dbBackupPath);

          if (dbFiles.length > 0) {
            await this.db.restoreFromSQL(dbFiles[0]);
          }

          await fs.remove(tempDir);
        } else {
          // Restore local
          const tempDir = path.join(this.db.dataPath, 'restore-temp');
          await fs.ensureDir(tempDir);

          // Extrair zip
          const unzipper = require('unzipper');
          await new Promise((resolve, reject) => {
            fs.createReadStream(backupId)
              .pipe(unzipper.Extract({ path: tempDir }))
              .on('close', resolve)
              .on('error', reject);
          });

          // Restaurar banco
          const dbBackupPath = path.join(tempDir, 'database.sql');
          if (await fs.pathExists(dbBackupPath)) {
            await this.db.restoreFromSQL(dbBackupPath);
          }

          await fs.remove(tempDir);
        }

        // 3. Validar restore
        console.log('Validando dados restaurados...');
        const validation = await this.validateRestore();

        if (!validation.success) {
          throw new Error('Validação falhou: ' + validation.error);
        }

        // 4. Registrar sucesso
        this.logRecovery({
          timestamp: new Date(),
          source,
          backupId,
          status: 'success',
          message: 'Restore concluído com sucesso'
        });

        return { success: true, validation };
      } catch (error) {
        // ROLLBACK: restaurar ponto de segurança
        console.error('Erro no restore, fazendo rollback...');

        try {
          const safetyDbPath = path.join(
            safetyBackup,
            'database.sql'
          );

          if (await fs.pathExists(safetyDbPath)) {
            await this.db.restoreFromSQL(safetyDbPath);
          }

          this.logRecovery({
            timestamp: new Date(),
            source,
            backupId,
            status: 'rolled_back',
            message: 'Restore falhou, dados restaurados para estado anterior'
          });

          throw new Error('Restore falhou, dados restaurados para estado anterior');
        } catch (rollbackError) {
          this.logRecovery({
            timestamp: new Date(),
            source,
            backupId,
            status: 'critical_failure',
            message: 'Falha crítica: rollback também falhou'
          });

          throw new Error('CRÍTICO: Falha em restore e rollback: ' + rollbackError.message);
        }
      }
    } catch (error) {
      console.error('Erro na recuperação:', error);
      throw error;
    }
  }

  // ===== VALIDAR DADOS RESTAURADOS =====
  async validateRestore() {
    try {
      // Testes básicos
      const checks = {
        dbConnected: false,
        tablesExist: false,
        dataIntegrity: false
      };

      try {
        // Verificar conexão
        const client = await this.db.pool.connect();
        checks.dbConnected = true;

        // Verificar tabelas
        const result = await client.query(`
          SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);

        checks.tablesExist = result.rows[0].count > 0;

        // Verificar integridade de dados
        const dataCheck = await client.query(`
          SELECT COUNT(*) as registros FROM demandas
        `);

        checks.dataIntegrity = dataCheck.rows[0].registros > 0;

        client.release();
      } catch (error) {
        return {
          success: false,
          error: error.message,
          checks
        };
      }

      const allPassed = Object.values(checks).every(v => v === true);

      return {
        success: allPassed,
        checks
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== REGISTRAR RECUPERAÇÃO =====
  logRecovery(entry) {
    this.recoveryLog.push(entry);

    // Salvar log
    const logFile = path.join(
      this.db.dataPath,
      'recovery-log.json'
    );

    fs.writeJSONSync(logFile, this.recoveryLog, { spaces: 2 });
  }

  // ===== OBTER HISTÓRICO =====
  getRecoveryHistory() {
    return this.recoveryLog;
  }
}

module.exports = RecoveryManager;
```

---

# 6. DASHBOARD DE SINCRONIZAÇÃO

## 6.1 Renderer Component (HTML/JS)

```html
<!-- src/renderer/cloud-backup.html -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backup na Nuvem - JurisConnect</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header h1 {
      color: #333;
      margin-bottom: 10px;
    }

    .header p {
      color: #666;
      font-size: 14px;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .status-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .status-card h3 {
      color: #333;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .status-value {
      font-size: 28px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 5px;
    }

    .status-detail {
      font-size: 12px;
      color: #999;
    }

    .status-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
      margin-top: 5px;
    }

    .status-indicator.online {
      background: #4caf50;
    }

    .status-indicator.offline {
      background: #f44336;
    }

    .status-indicator.syncing {
      background: #ff9800;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .actions {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #0066cc;
      color: white;
    }

    .btn-primary:hover {
      background: #0052a3;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .section h2 {
      color: #333;
      font-size: 16px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }

    .backup-list {
      list-style: none;
    }

    .backup-item {
      padding: 12px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .backup-item:hover {
      background: #f9f9f9;
    }

    .backup-info h4 {
      color: #333;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .backup-info p {
      color: #999;
      font-size: 12px;
    }

    .backup-actions {
      display: flex;
      gap: 10px;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-restore {
      background: #4caf50;
      color: white;
    }

    .btn-delete {
      background: #f44336;
      color: white;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: #f0f0f0;
      border-radius: 2px;
      margin-top: 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #0066cc;
      transition: width 0.3s;
    }

    .alert {
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: none;
    }

    .alert.show {
      display: block;
    }

    .alert-success {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }

    .alert-error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
    }

    .alert-info {
      background: #e3f2fd;
      color: #1565c0;
      border: 1px solid #90caf9;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #0066cc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .settings {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
    }

    .setting-group {
      margin-bottom: 15px;
    }

    .setting-group label {
      display: block;
      color: #333;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .setting-group input[type="checkbox"] {
      margin-right: 8px;
    }

    .setting-group select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ Backup na Nuvem</h1>
      <p>Sincronização automática com Google Drive</p>
    </div>

    <div class="alert" id="alert"></div>

    <!-- STATUS CARDS -->
    <div class="status-grid">
      <div class="status-card">
        <h3>Status da Nuvem</h3>
        <div id="cloudStatus" class="status-value">-</div>
        <div>
          <span class="status-indicator offline" id="statusIndicator"></span>
          <span id="statusText">Desconectado</span>
        </div>
      </div>

      <div class="status-card">
        <h3>Espaço em Uso</h3>
        <div class="status-value" id="storageUsed">-</div>
        <div class="status-detail" id="storageDetail"></div>
        <div class="progress-bar">
          <div class="progress-fill" id="storageBar" style="width: 0%"></div>
        </div>
      </div>

      <div class="status-card">
        <h3>Último Backup</h3>
        <div class="status-value" id="lastBackup">-</div>
        <div class="status-detail" id="lastBackupDetail"></div>
      </div>

      <div class="status-card">
        <h3>Backups na Nuvem</h3>
        <div class="status-value" id="cloudBackupCount">-</div>
        <div class="status-detail">Máximo: 30 backups</div>
      </div>
    </div>

    <!-- AÇÕES -->
    <div class="actions">
      <button class="btn btn-primary" id="btnBackupNow">
        💾 Fazer Backup Agora
      </button>
      <button class="btn btn-secondary" id="btnRefresh">
        🔄 Atualizar Status
      </button>
      <button class="btn btn-secondary" id="btnSettings">
        ⚙️ Configurações
      </button>
    </div>

    <!-- BACKUPS NA NUVEM -->
    <div class="section">
      <h2>Backups na Nuvem</h2>
      <ul class="backup-list" id="cloudBackupList">
        <li style="color: #999; text-align: center; padding: 20px;">
          <span class="spinner"></span> Carregando...
        </li>
      </ul>
    </div>

    <!-- BACKUPS LOCAIS -->
    <div class="section">
      <h2>Backups Locais</h2>
      <ul class="backup-list" id="localBackupList">
        <li style="color: #999; text-align: center; padding: 20px;">
          <span class="spinner"></span> Carregando...
        </li>
      </ul>
    </div>

    <!-- CONFIGURAÇÕES -->
    <div class="section" id="settingsSection" style="display: none;">
      <h2>Configurações de Backup</h2>
      <div class="settings">
        <div class="setting-group">
          <label>
            <input type="checkbox" id="autoBackup" checked>
            Backup Automático Diário
          </label>
        </div>

        <div class="setting-group">
          <label for="backupTime">Horário do Backup:</label>
          <select id="backupTime">
            <option value="22:00">22:00 (10 PM)</option>
            <option value="23:00">23:00 (11 PM)</option>
            <option value="02:00">02:00 (2 AM)</option>
            <option value="03:00">03:00 (3 AM)</option>
          </select>
        </div>

        <div class="setting-group">
          <label for="maxLocalBackups">Máximo de Backups Locais:</label>
          <select id="maxLocalBackups">
            <option value="5">5</option>
            <option value="10" selected>10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </div>

        <div class="setting-group">
          <label for="maxCloudBackups">Máximo de Backups na Nuvem:</label>
          <select id="maxCloudBackups">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30" selected">30</option>
            <option value="50">50</option>
          </select>
        </div>

        <button class="btn btn-primary" id="btnSaveSettings">
          Salvar Configurações
        </button>
      </div>
    </div>
  </div>

  <script>
    // Implementação do dashboard
    let backupManager = null;

    // Inicializar
    async function init() {
      try {
        backupManager = await window.electron.initCloudBackup();
        await refreshStatus();
      } catch (error) {
        showAlert('Erro ao inicializar', 'error');
      }
    }

    // Atualizar status
    async function refreshStatus() {
      try {
        const health = await window.electron.getBackupHealth();

        // Cloud status
        if (health.cloud.status === 'connected') {
          document.getElementById('cloudStatus').textContent = '🟢 Online';
          document.getElementById('statusIndicator').className = 'status-indicator online';
          document.getElementById('statusText').textContent = 'Conectado';

          // Storage
          const storage = health.cloud.storage;
          const percentage = storage.percentageUsed;
          document.getElementById('storageUsed').textContent = 
            formatBytes(storage.usedStorage);
          document.getElementById('storageDetail').textContent = 
            `${percentage}% de ${formatBytes(storage.totalStorage)}`;
          document.getElementById('storageBar').style.width = percentage + '%';
        } else {
          document.getElementById('cloudStatus').textContent = '🔴 Offline';
          document.getElementById('statusIndicator').className = 'status-indicator offline';
          document.getElementById('statusText').textContent = 'Desconectado';
        }

        // Último backup
        if (health.lastCloudBackup) {
          document.getElementById('lastBackup').textContent = 
            formatDate(health.lastCloudBackup);
          document.getElementById('lastBackupDetail').textContent = 
            'Backup na nuvem';
        }

        // Contagem de backups
        document.getElementById('cloudBackupCount').textContent = 
          health.cloudBackups;

        // Listar backups
        await loadBackups();
      } catch (error) {
        showAlert('Erro ao atualizar status: ' + error.message, 'error');
      }
    }

    // Carregar backups
    async function loadBackups() {
      try {
        const cloudBackups = await window.electron.listCloudBackups();
        const localBackups = await window.electron.listLocalBackups();

        renderCloudBackups(cloudBackups);
        renderLocalBackups(localBackups);
      } catch (error) {
        showAlert('Erro ao carregar backups', 'error');
      }
    }

    // Renderizar backups na nuvem
    function renderCloudBackups(backups) {
      const list = document.getElementById('cloudBackupList');
      list.innerHTML = '';

      if (backups.length === 0) {
        list.innerHTML = '<li style="color: #999; text-align: center; padding: 20px;">Nenhum backup na nuvem</li>';
        return;
      }

      backups.forEach(backup => {
        const item = document.createElement('li');
        item.className = 'backup-item';
        item.innerHTML = `
          <div class="backup-info">
            <h4>☁️ ${backup.name}</h4>
            <p>Criado: ${formatDate(backup.created)}</p>
            <p>Tamanho: ${formatBytes(backup.size)}</p>
          </div>
          <div class="backup-actions">
            <button class="btn-sm btn-restore" onclick="restoreBackup('${backup.id}', 'cloud')">
              Restaurar
            </button>
            <button class="btn-sm btn-delete" onclick="deleteBackup('${backup.id}')">
              Deletar
            </button>
          </div>
        `;
        list.appendChild(item);
      });
    }

    // Renderizar backups locais
    function renderLocalBackups(backups) {
      const list = document.getElementById('localBackupList');
      list.innerHTML = '';

      if (backups.length === 0) {
        list.innerHTML = '<li style="color: #999; text-align: center; padding: 20px;">Nenhum backup local</li>';
        return;
      }

      backups.forEach(backup => {
        const item = document.createElement('li');
        item.className = 'backup-item';
        item.innerHTML = `
          <div class="backup-info">
            <h4>💾 ${backup.name}</h4>
            <p>Criado: ${formatDate(backup.created)}</p>
            <p>Tamanho: ${formatBytes(backup.size)}</p>
          </div>
          <div class="backup-actions">
            <button class="btn-sm btn-restore" onclick="restoreBackup('${backup.path}', 'local')">
              Restaurar
            </button>
          </div>
        `;
        list.appendChild(item);
      });
    }

    // Fazer backup agora
    async function backupNow() {
      try {
        document.getElementById('btnBackupNow').disabled = true;
        showAlert('Iniciando backup...', 'info');

        const result = await window.electron.backupNow();

        if (result.success) {
          showAlert('Backup criado com sucesso!', 'success');
          await refreshStatus();
        } else {
          showAlert('Erro ao fazer backup: ' + result.error, 'error');
        }
      } catch (error) {
        showAlert('Erro: ' + error.message, 'error');
      } finally {
        document.getElementById('btnBackupNow').disabled = false;
      }
    }

    // Restaurar backup
    async function restoreBackup(id, source) {
      if (!confirm('Deseja restaurar este backup? Os dados atuais serão substituídos.')) {
        return;
      }

      try {
        showAlert('Restaurando backup...', 'info');

        const result = await window.electron.restoreBackup(id, source);

        if (result.success) {
          showAlert('Backup restaurado com sucesso!', 'success');
          setTimeout(() => window.location.reload(), 2000);
        } else {
          showAlert('Erro ao restaurar: ' + result.error, 'error');
        }
      } catch (error) {
        showAlert('Erro: ' + error.message, 'error');
      }
    }

    // Deletar backup
    async function deleteBackup(id) {
      if (!confirm('Deletar este backup permanentemente?')) {
        return;
      }

      try {
        await window.electron.deleteCloudBackup(id);
        showAlert('Backup deletado', 'success');
        await refreshStatus();
      } catch (error) {
        showAlert('Erro: ' + error.message, 'error');
      }
    }

    // Mostrar alerta
    function showAlert(message, type) {
      const alert = document.getElementById('alert');
      alert.textContent = message;
      alert.className = `alert show alert-${type}`;

      setTimeout(() => {
        alert.classList.remove('show');
      }, 5000);
    }

    // Formatadores
    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    function formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Event listeners
    document.getElementById('btnBackupNow').addEventListener('click', backupNow);
    document.getElementById('btnRefresh').addEventListener('click', refreshStatus);
    document.getElementById('btnSettings').addEventListener('click', () => {
      const section = document.getElementById('settingsSection');
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });

    // Inicializar ao carregar
    init();
  </script>
</body>
</html>
```

---

# 7. INTEGRAÇÃO NO ELECTRON

## 7.1 main.js - Adições

```javascript
// Adicionar ao src/main.js existente

const CloudBackupManager = require('./services/cloud-backup.manager');
const SyncScheduler = require('./services/sync.scheduler');
const RecoveryManager = require('./services/recovery.manager');

let cloudBackupManager;
let syncScheduler;
let recoveryManager;

// Na função createWindow(), após inicializar apiServer:
async function initializeCloudBackup() {
  try {
    const credentialsPath = path.join(__dirname, '../src/services/credentials.json');
    const backupDir = path.join(app.getPath('userData'), 'backups');

    cloudBackupManager = new CloudBackupManager(
      backupDir,
      credentialsPath,
      {
        autoUploadDelay: 300000,
        maxLocalBackups: 10,
        maxCloudBackups: 30
      }
    );

    const initialized = await cloudBackupManager.initialize();

    if (initialized) {
      // Agend jobs
      syncScheduler = new SyncScheduler(cloudBackupManager);
      syncScheduler.scheduleJobs({
        backupTime: '22:00',
        syncCloudTime: '23:00',
        cleanupTime: '02:00'
      });

      // Recovery manager
      recoveryManager = new RecoveryManager(cloudBackupManager, dbManager);

      console.log('Cloud backup inicializado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao inicializar cloud backup:', error);
  }
}

// IPC handlers
ipcMain.handle('init-cloud-backup', initializeCloudBackup);

ipcMain.handle('backup-now', async () => {
  try {
    const result = await syncScheduler.backupNow();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-cloud-backups', async () => {
  try {
    return await cloudBackupManager.listCloudBackups();
  } catch (error) {
    return [];
  }
});

ipcMain.handle('list-local-backups', async () => {
  try {
    return await cloudBackupManager.listLocalBackups();
  } catch (error) {
    return [];
  }
});

ipcMain.handle('get-backup-health', async () => {
  try {
    return await cloudBackupManager.healthCheck();
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('restore-backup', async (event, fileId, source) => {
  try {
    const tempDir = path.join(app.getPath('userData'), 'restore');
    return await recoveryManager.restoreWithValidation(fileId, source);
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-cloud-backup', async (event, fileId) => {
  try {
    await cloudBackupManager.cloudService.deleteFile(fileId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Parar jobs ao fechar
app.on('before-quit', () => {
  if (syncScheduler) {
    syncScheduler.stopJobs();
  }
});
```

---

# 8. GUIA DO USUÁRIO E SETUP

## 8.1 Setup Inicial (README)

```markdown
# Configurar Backup Automático na Nuvem

## Requisitos

- Conta Google (Gmail)
- Conexão com internet
- 1GB espaço disponível no Google Drive

## Configuração Passo-a-Passo

### 1. Preparar Google Drive API

1. Acesse: https://console.cloud.google.com
2. Crie novo projeto: "JurisConnect Backup"
3. Ative "Google Drive API"
4. Crie credenciais OAuth 2.0 (Desktop)
5. Baixe o arquivo JSON

### 2. Configurar JurisConnect

1. Abra JurisConnect
2. Menu: **Banco de Dados** > **Backup na Nuvem**
3. Clique em "Autenticar com Google"
4. Será aberta página de login (autorizar acesso)
5. Copy/paste o código
6. Clique em "Conectar"

### 3. Configurar Backup Automático

1. Menu: **Banco de Dados** > **Backup na Nuvem**
2. Clique em "⚙️ Configurações"
3. Ative "Backup Automático Diário"
4. Escolha horário (padrão: 22:00)
5. Clique em "Salvar Configurações"

## Usar Backup na Nuvem

### Fazer Backup Manual

1. Menu: **Banco de Dados** > **Backup na Nuvem**
2. Clique em "💾 Fazer Backup Agora"
3. Aguarde conclusão

### Ver Status

- Espaço em uso no Google Drive
- Último backup realizado
- Quantidade de backups
- Data de cada backup

### Restaurar Dados

1. Menu: **Banco de Dados** > **Backup na Nuvem**
2. Encontre o backup desejado
3. Clique em "Restaurar"
4. Confirme: "Deseja restaurar?"
5. Aguarde restauração
6. Aplicação será reiniciada

## Segurança

✅ Todos os backups são compactados (ZIP)
✅ Dados no Google Drive são criptografados
✅ Token Google é armazenado localmente
✅ Validação automática antes de restore
✅ Rollback automático em caso de erro

## Troubleshooting

**"Erro de autenticação"**
- Verifique conexão internet
- Faça login novamente
- Limpe cache do navegador

**"Google Drive cheio"**
- Limpe arquivos antigos
- Aumente limite de backups na nuvem
- Considere plano premium Google One

**"Restauração falhou"**
- O backup anterior é preservado
- Tente novo restore
- Contate suporte se persistir

## FAQ

**P: Com que frequência faz backup?**
R: Diariamente no horário configurado (padrão 22:00)

**P: Quantos backups são mantidos?**
R: Máximo 30 na nuvem, 10 localmente (configurável)

**P: Posso restaurar de outro computador?**
R: Sim, basta fazer login com mesma conta Google

**P: Quanto espaço ocupam os backups?**
R: Aproximadamente 100-500MB por backup (compactado)
```

---

**Cloud Backup Google Drive - Completo! 🎉**