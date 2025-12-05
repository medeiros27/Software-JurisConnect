const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Documento } = require('../models');
const logger = require('../utils/logger');

class CronService {
    constructor() {
        this.jobs = [];
    }

    init() {
        logger.info('Initializing Cron Service...');

        // Schedule cleanup job to run daily at 03:00 AM
        // Cron format: Minute Hour Day Month DayOfWeek
        this.schedule('0 3 * * *', this.cleanupOldFiles.bind(this), 'Cleanup Old Files');

        logger.info('Cron Service initialized.');
    }

    schedule(cronExpression, task, name) {
        if (!cron.validate(cronExpression)) {
            logger.error(`Invalid cron expression for job ${name}: ${cronExpression}`);
            return;
        }

        const job = cron.schedule(cronExpression, async () => {
            logger.info(`Starting cron job: ${name}`);
            try {
                await task();
                logger.info(`Completed cron job: ${name}`);
            } catch (error) {
                logger.logError(error, { job: name });
            }
        });

        this.jobs.push({ name, job });
        logger.info(`Scheduled job: ${name} [${cronExpression}]`);
    }

    async cleanupOldFiles() {
        const retentionDays = 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        logger.info(`Starting file cleanup for documents older than ${retentionDays} days (created before ${cutoffDate.toISOString()})`);

        try {
            // Find documents to delete
            const documentsToDelete = await Documento.findAll({
                where: {
                    created_at: {
                        [Op.lt]: cutoffDate
                    }
                }
            });

            if (documentsToDelete.length === 0) {
                logger.info('No old documents found to delete.');
                return;
            }

            logger.info(`Found ${documentsToDelete.length} documents to delete.`);

            let deletedCount = 0;
            let errorCount = 0;

            for (const doc of documentsToDelete) {
                try {
                    // 1. Delete physical file
                    // Handle both absolute paths (old) and relative URLs (new)
                    let filePath;
                    if (doc.url.startsWith('/uploads')) {
                        // Relative URL: /uploads/filename
                        const filename = path.basename(doc.url);
                        filePath = path.join(__dirname, '../../uploads', filename);
                    } else {
                        // Assume absolute path or filename only (legacy)
                        // If it's just a filename, assume it's in uploads
                        if (!path.isAbsolute(doc.url)) {
                            filePath = path.join(__dirname, '../../uploads', doc.url);
                        } else {
                            filePath = doc.url;
                        }
                    }

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        logger.info(`Deleted file: ${filePath}`);
                    } else {
                        logger.warn(`File not found on disk: ${filePath} (Document ID: ${doc.id})`);
                    }

                    // 2. Delete DB record (Soft delete if paranoid is true, which it is)
                    // We use destroy() which will set deletedAt.
                    // If we wanted to hard delete, we'd pass { force: true }
                    // Given "excluir para não sobrecarregar", hard delete might be preferred for DB size,
                    // but soft delete is safer. Let's stick to soft delete for now as the main "overload" is usually disk space.
                    await doc.destroy();
                    deletedCount++;

                } catch (err) {
                    logger.error(`Error deleting document ${doc.id}: ${err.message}`);
                    errorCount++;
                }
            }

            logger.info(`Cleanup finished. Deleted: ${deletedCount}, Errors: ${errorCount}`);

        } catch (error) {
            logger.logError(error, { method: 'cleanupOldFiles' });
            throw error;
        }
    }
}

module.exports = new CronService();
