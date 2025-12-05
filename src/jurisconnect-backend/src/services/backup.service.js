const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const archiver = require('archiver');
const cron = require('node-cron');
const logger = require('../utils/logger');
const storageService = require('./storage.service');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../backups');
        this.uploadsDir = path.join(__dirname, '../../uploads');

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    init() {
        // Agendar para todo dia às 03:00 AM
        cron.schedule('0 3 * * *', () => {
            logger.info('[BackupService] Iniciando backup automático...');
            this.performBackup();
        });
        logger.info('[BackupService] Agendamento de backup iniciado (03:00 AM)');
    }

    async performBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.zip`;
        const filePath = path.join(this.backupDir, filename);
        const dumpPath = path.join(this.backupDir, `dump-${timestamp}.sql`);

        try {
            // 1. Dump do Banco de Dados
            await this.dumpDatabase(dumpPath);

            // 2. Criar Arquivo Zip
            await this.createZip(filePath, dumpPath);

            // 3. Upload para S3 (se configurado)
            if (process.env.STORAGE_PROVIDER === 's3') {
                await this.uploadToCloud(filePath, filename);
            }

            // 4. Limpeza (Rotação e Arquivos Temporários)
            if (fs.existsSync(dumpPath)) fs.unlinkSync(dumpPath);
            this.rotateBackups();

            logger.info(`[BackupService] Backup ${filename} concluído com sucesso.`);
            return { success: true, file: filename };
        } catch (error) {
            logger.error(`[BackupService] Falha no backup: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    findPgDump() {
        const path = require('path');
        const fs = require('fs');

        // Try local postgres first
        const localPath = path.join(__dirname, '..', '..', '..', '..', 'postgres', 'bin', 'pg_dump.exe');
        if (fs.existsSync(localPath)) {
            logger.info(`[BackupService] Found local pg_dump at: ${localPath}`);
            return localPath;
        }

        // Try common Windows PostgreSQL installations
        const commonPaths = [
            'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
        ];

        for (const p of commonPaths) {
            if (fs.existsSync(p)) {
                logger.info(`[BackupService] Found pg_dump at: ${p}`);
                return p;
            }
        }

        // Fallback to PATH
        logger.warn('[BackupService] pg_dump not found in known locations, using PATH');
        return 'pg_dump';
    }

    async dumpDatabase(outputPath) {
        const { Client } = require('pg');
        const fs = require('fs');

        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'software-jurisconnect'
        });

        try {
            await client.connect();
            logger.info('[BackupService] Connected to database for backup');

            // Get all tables
            const tablesResult = await client.query(`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            `);

            let sqlDump = `-- JurisConnect Database Backup
-- Generated: ${new Date().toISOString()}
-- Database: ${process.env.DB_NAME}

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

`;

            // Export each table
            for (const row of tablesResult.rows) {
                const tableName = row.tablename;
                logger.info(`[BackupService] Backing up table: ${tableName}`);

                // Get table structure
                const createTableResult = await client.query(`
                    SELECT 
                        'CREATE TABLE IF NOT EXISTS ' || quote_ident(tablename) || ' (' ||
                        string_agg(
                            quote_ident(attname) || ' ' || 
                            format_type(atttypid, atttypmod) ||
                            CASE WHEN attnotnull THEN ' NOT NULL' ELSE '' END,
                            ', '
                        ) || ');'
                    FROM pg_attribute
                    JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
                    WHERE relname = $1
                      AND attnum > 0
                      AND NOT attisdropped
                    GROUP BY tablename
                `, [tableName]);

                if (createTableResult.rows.length > 0) {
                    sqlDump += `\n-- Table: ${tableName}\n`;
                    sqlDump += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
                    sqlDump += createTableResult.rows[0]['?column?'] + '\n';
                }

                // Get table data
                const dataResult = await client.query(`SELECT * FROM "${tableName}"`);

                if (dataResult.rows.length > 0) {
                    const columns = Object.keys(dataResult.rows[0]);
                    const columnNames = columns.map(c => `"${c}"`).join(', ');

                    for (const dataRow of dataResult.rows) {
                        const values = columns.map(col => {
                            const val = dataRow[col];
                            if (val === null) return 'NULL';
                            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                            if (typeof val === 'number') return val;
                            if (val instanceof Date) return `'${val.toISOString()}'`;
                            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                            return `'${String(val).replace(/'/g, "''")}'`;
                        }).join(', ');

                        sqlDump += `INSERT INTO "${tableName}" (${columnNames}) VALUES (${values});\n`;
                    }
                }
            }

            // Write to file
            fs.writeFileSync(outputPath, sqlDump, 'utf8');
            logger.info(`[BackupService] SQL dump written to: ${outputPath}`);

            await client.end();
        } catch (error) {
            await client.end();
            throw new Error(`Database dump failed: ${error.message}`);
        }
    }

    createZip(zipPath, sqlDumpPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => resolve());
            archive.on('error', (err) => reject(err));

            archive.pipe(output);

            // Adicionar Dump SQL
            archive.file(sqlDumpPath, { name: 'database.sql' });

            // Adicionar Pasta de Uploads
            if (fs.existsSync(this.uploadsDir)) {
                archive.directory(this.uploadsDir, 'uploads');
            }

            archive.finalize();
        });
    }

    async uploadToCloud(filePath, filename) {
        try {
            // Simula um objeto de arquivo para o StorageService
            const fileObj = {
                path: filePath,
                originalname: filename,
                mimetype: 'application/zip'
            };

            // Usa o método existente, que já lida com S3
            // Nota: O StorageService atual espera deletar o arquivo local se for S3, 
            // mas aqui queremos manter o backup local também (ou deletar na rotação).
            // Vamos usar o método upload mas garantir que ele não apague nosso arquivo local imediatamente se não quisermos,
            // mas o StorageService atual apaga. Tudo bem, o backup local é redundância, se for pro S3 ok.
            // Mas para garantir a rotação local, talvez seja melhor não usar o StorageService.upload diretamente se ele apaga.
            // Verificando StorageService: "if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);"
            // Sim, ele apaga. Vamos fazer uma cópia temporária para o upload então.

            const tempUploadPath = filePath + '.uploading';
            fs.copyFileSync(filePath, tempUploadPath);
            fileObj.path = tempUploadPath;

            await storageService.upload(fileObj);
            logger.info('[BackupService] Upload para S3 realizado.');
        } catch (error) {
            logger.error(`[BackupService] Erro no upload S3: ${error.message}`);
            // Não falha o backup inteiro se o S3 falhar
        }
    }

    rotateBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('backup-') && f.endsWith('.zip'))
                .map(f => ({
                    name: f,
                    time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time); // Mais recentes primeiro

            // Manter apenas os últimos 7
            const toDelete = files.slice(7);

            toDelete.forEach(file => {
                fs.unlinkSync(path.join(this.backupDir, file.name));
                logger.info(`[BackupService] Backup antigo removido: ${file.name}`);
            });
        } catch (error) {
            logger.error(`[BackupService] Erro na rotação de backups: ${error.message}`);
        }
    }
}

module.exports = new BackupService();
