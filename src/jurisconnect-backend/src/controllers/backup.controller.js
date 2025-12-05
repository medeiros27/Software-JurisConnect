const backupService = require('../services/simple-backup.service');
const path = require('path');
const fs = require('fs');

class BackupController {
    // Criar backup manual
    async createBackup(req, res) {
        try {
            const result = await backupService.performBackup();

            if (result.success) {
                res.json({
                    success: true,
                    message: 'Backup criado com sucesso',
                    data: result
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: result.error || 'Falha ao criar backup'
                });
            }
        } catch (error) {
            console.error('Create backup error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao criar backup'
            });
        }
    }

    // Listar backups disponíveis
    async listBackups(req, res) {
        try {
            const backupDir = path.join(__dirname, '../../backups');

            if (!fs.existsSync(backupDir)) {
                return res.json({ success: true, data: [] });
            }

            const files = fs.readdirSync(backupDir)
                .filter(f => f.startsWith('backup-') && f.endsWith('.sql'))
                .map(filename => {
                    const filepath = path.join(backupDir, filename);
                    const stats = fs.statSync(filepath);
                    return {
                        filename,
                        size: stats.size,
                        created: stats.birthtime,
                        modified: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created);

            res.json({
                success: true,
                data: files
            });
        } catch (error) {
            console.error('List backups error:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao listar backups'
            });
        }
    }

    // Download de backup
    async downloadBackup(req, res) {
        try {
            const { filename } = req.params;

            // Validação de segurança
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome de arquivo inválido'
                });
            }

            const backupDir = path.join(__dirname, '../../backups');
            const filepath = path.join(backupDir, filename);

            if (!fs.existsSync(filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Arquivo não encontrado'
                });
            }

            res.download(filepath, filename);
        } catch (error) {
            console.error('Download backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao fazer download do backup'
            });
        }
    }

    // Deletar backup
    async deleteBackup(req, res) {
        try {
            const { filename } = req.params;

            // Validação de segurança
            if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome de arquivo inválido'
                });
            }

            const backupDir = path.join(__dirname, '../../backups');
            const filepath = path.join(backupDir, filename);

            if (!fs.existsSync(filepath)) {
                return res.status(404).json({
                    success: false,
                    message: 'Arquivo não encontrado'
                });
            }

            fs.unlinkSync(filepath);

            res.json({
                success: true,
                message: 'Backup deletado com sucesso'
            });
        } catch (error) {
            console.error('Delete backup error:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao deletar backup'
            });
        }
    }

    // Obter configurações de backup
    async getConfig(req, res) {
        try {
            // Por ora, retornar configurações padrão
            // Futuramente, pode ser salvo em um arquivo de configuração ou banco
            const config = {
                auto_enabled: true,
                schedule: '0 3 * * *', // 3 AM diariamente
                retention_count: 7,
                upload_to_cloud: process.env.STORAGE_PROVIDER === 's3'
            };

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            console.error('Get config error:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao obter configurações'
            });
        }
    }
}

module.exports = new BackupController();
