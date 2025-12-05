const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');

class StorageService {
    constructor() {
        this.provider = process.env.STORAGE_PROVIDER || 'local'; // 'local' ou 's3'

        if (this.provider === 's3') {
            this.s3 = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                }
            });
            this.bucket = process.env.AWS_BUCKET_NAME;
        }
    }

    async upload(file) {
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        if (this.provider === 's3') {
            try {
                const command = new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: fileName,
                    Body: fs.createReadStream(file.path),
                    ContentType: file.mimetype
                });
                await this.s3.send(command);
                // Remove arquivo temporário local se foi salvo pelo multer
                if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);

                return { url: fileName, provider: 's3' };
            } catch (error) {
                logger.error(`[StorageService] S3 Upload Error: ${error.message}`);
                throw error;
            }
        } else {
            // Local storage logic is handled by multer mostly, but if we need to move files:
            // Assuming multer already saved to 'uploads/'
            return { url: file.filename, provider: 'local' };
        }
    }

    async delete(fileName) {
        if (this.provider === 's3') {
            try {
                const command = new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: fileName
                });
                await this.s3.send(command);
            } catch (error) {
                logger.error(`[StorageService] S3 Delete Error: ${error.message}`);
                throw error;
            }
        } else {
            const filePath = path.join(__dirname, '../../uploads', fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    async getUrl(fileName) {
        if (this.provider === 's3') {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: fileName
            });
            // URL assinada válida por 1 hora
            return getSignedUrl(this.s3, command, { expiresIn: 3600 });
        } else {
            // Retorna caminho relativo para API servir
            return `/api/v1/documentos/${fileName}/download`;
        }
    }
}

module.exports = new StorageService();
