const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');

// Todas as rotas exigem autenticação e permissão de admin
router.use(verificarToken);
router.use(verificarRole('admin'));

// Criar backup manual
router.post('/create', backupController.createBackup);

// Listar backups
router.get('/list', backupController.listBackups);

// Download de backup
router.get('/download/:filename', backupController.downloadBackup);

// Deletar backup
router.delete('/:filename', backupController.deleteBackup);

// Obter configurações
router.get('/config', backupController.getConfig);

module.exports = router;
