const BaseService = require('./base.service');
const logger = require('../utils/logger');

class WhatsAppService extends BaseService {
    constructor() {
        // Exemplo usando Meta Cloud API
        super('WhatsApp', 'https://graph.facebook.com/v17.0/');
        this.phoneNumberId = process.env.WHATSAPP_PHONE_ID;
        this.accessToken = process.env.WHATSAPP_TOKEN;
    }

    async sendTemplateMessage(to, templateName, components = []) {
        if (!this.accessToken) {
            logger.warn('[WhatsAppService] Token não configurado. Mensagem não enviada.');
            return;
        }

        try {
            await this.client.post(`${this.phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                to: to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'pt_BR' },
                    components: components
                }
            }, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
            logger.info(`[WhatsAppService] Template ${templateName} enviado para ${to}`);
        } catch (error) {
            logger.error(`[WhatsAppService] Falha no envio: ${error.message}`);
            // Não lança erro para não travar o fluxo principal
        }
    }

    async sendTextMessage(to, text) {
        if (!this.accessToken) return;

        try {
            await this.client.post(`${this.phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: text }
            }, {
                headers: { Authorization: `Bearer ${this.accessToken}` }
            });
        } catch (error) {
            logger.error(`[WhatsAppService] Falha no envio de texto: ${error.message}`);
        }
    }
}

module.exports = new WhatsAppService();
