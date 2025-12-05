const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class SimpleBackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../../backups');

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async performBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `backup-${timestamp}.sql`;
        const filePath = path.join(this.backupDir, filename);

        try {
            await this.dumpDatabase(filePath);

            const stats = fs.statSync(filePath);

            logger.info(`[SimpleBackupService] Backup ${filename} concluído com sucesso.`);
            return { success: true, file: filename, size: stats.size };
        } catch (error) {
            logger.error(`[SimpleBackupService] Falha no backup: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async dumpDatabase(outputPath) {
        const { Client } = require('pg');

        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'software-jurisconnect'
        });

        try {
            await client.connect();
            logger.info('[SimpleBackupService] Connected to database');

            // Get all tables
            const tablesResult = await client.query(`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY tablename
            `);

            let sqlDump = `-- JurisConnect Database Backup\n`;
            sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
            sqlDump += `-- Database: ${process.env.DB_NAME}\n\n`;
            sqlDump += `SET client_encoding = 'UTF8';\n\n`;

            // Export each table's data
            for (const row of tablesResult.rows) {
                const tableName = row.tablename;
                logger.info(`[SimpleBackupService] Backing up table: ${tableName}`);

                sqlDump += `\n-- Table: ${tableName}\n`;
                sqlDump += `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;\n`;

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

                    logger.info(`[SimpleBackupService] ${dataResult.rows.length} rows from ${tableName}`);
                }
            }

            // Write to file
            fs.writeFileSync(outputPath, sqlDump, 'utf8');
            logger.info(`[SimpleBackupService] Backup saved: ${outputPath}`);

            await client.end();
        } catch (error) {
            try { await client.end(); } catch (e) { }
            throw new Error(`Database dump failed: ${error.message}`);
        }
    }
}

module.exports = new SimpleBackupService();
