const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

class EmailService {
    constructor() {
        this.transporter = null;
        this.init();
    }

    init() {
        // Configuração flexível: SMTP genérico, AWS SES, SendGrid, etc.
        if (process.env.SMTP_HOST) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            logger.warn('[EmailService] SMTP não configurado. Emails serão logados no console.');
        }
    }

    async sendMail({ to, subject, html, text }) {
        if (!this.transporter) {
            logger.info(`[EmailService] Mock Send: To=${to}, Subject=${subject}`);
            return { messageId: 'mock-id' };
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"JurisConnect" <noreply@jurisconnect.com.br>',
                to,
                subject,
                text,
                html
            });
            logger.info(`[EmailService] Email enviado: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error(`[EmailService] Falha ao enviar: ${error.message}`);
            throw new AppError('Falha no envio de email', 500);
        }
    }

    async sendContractEmail(demanda) {
        const { contractEmailTemplate } = require('../templates/contractEmail.template');

        if (!demanda.correspondente) {
            throw new AppError('Demanda não possui correspondente associado', 400);
        }

        if (!demanda.correspondente.email) {
            throw new AppError('Correspondente não possui email cadastrado', 400);
        }

        const html = contractEmailTemplate(demanda);
        const subject = `📋 Formalização de Contrato - Protocolo ${demanda.numero}`;

        return await this.sendMail({
            to: demanda.correspondente.email,
            subject,
            html,
            text: `Diligência: ${demanda.tipo_demanda} - ${demanda.cidade}/${demanda.estado}`
        });
    }
}

module.exports = new EmailService();

