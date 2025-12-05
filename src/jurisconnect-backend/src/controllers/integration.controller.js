const whatsappService = require('../services/whatsapp.service');
const googleCalendarService = require('../services/google-calendar.service');
const storageService = require('../services/storage.service');
const viaCepService = require('../services/viacep.service');
const receitaFederalService = require('../services/receita-federal.service');
const AppError = require('../utils/AppError');

class IntegrationController {
    async testWhatsapp(req, res) {
        const { phoneId, token, to } = req.body;

        // Se não passar credenciais, tenta usar as do env
        if (phoneId) whatsappService.phoneNumberId = phoneId;
        if (token) whatsappService.accessToken = token;

        try {
            // Tenta enviar uma mensagem de teste (ou apenas validar credenciais se houver endpoint para isso)
            // A Graph API não tem um endpoint simples de "check token" sem fazer uma chamada real,
            // mas podemos tentar enviar mensagem para o próprio número se fornecido, ou assumir sucesso se não der erro de auth

            if (!to) {
                return res.json({ success: true, message: 'Credenciais salvas (não testadas sem destinatário)' });
            }

            await whatsappService.sendTextMessage(to, 'Teste de integração JurisConnect');
            res.json({ success: true, message: 'Mensagem de teste enviada com sucesso!' });
        } catch (error) {
            throw new AppError(`Erro na integração WhatsApp: ${error.message}`, 400);
        }
    }

    async testGoogleCalendar(req, res) {
        // Google Calendar requer OAuth, então o teste aqui é verificar se as credenciais geram uma URL válida
        // ou se já temos tokens salvos, tentar listar eventos.

        try {
            const url = googleCalendarService.generateAuthUrl();
            if (url) {
                res.json({ success: true, message: 'Configuração OAuth válida. URL de autorização gerada.', authUrl: url });
            } else {
                throw new Error('Falha ao gerar URL de autenticação');
            }
        } catch (error) {
            throw new AppError(`Erro na integração Google Calendar: ${error.message}`, 400);
        }
    }

    async testS3(req, res) {
        const { region, accessKeyId, secretAccessKey, bucket } = req.body;

        // Configura temporariamente o serviço com as novas credenciais para teste
        const originalS3 = storageService.s3;
        const originalBucket = storageService.bucket;
        const originalProvider = storageService.provider;

        try {
            // Re-instancia o S3 com as credenciais fornecidas
            const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
            const s3 = new S3Client({
                region,
                credentials: { accessKeyId, secretAccessKey }
            });

            const command = new ListBucketsCommand({});
            const response = await s3.send(command);

            const bucketExists = response.Buckets.some(b => b.Name === bucket);

            if (!bucketExists) {
                throw new Error(`Bucket '${bucket}' não encontrado na conta.`);
            }

            res.json({ success: true, message: 'Conexão S3 estabelecida e bucket encontrado!' });
        } catch (error) {
            throw new AppError(`Erro na integração S3: ${error.message}`, 400);
        } finally {
            // Restaura (embora em uma requisição real isso não persistiria globalmente sem salvar em DB/Env)
            // O ideal seria o service aceitar credenciais no método, mas para teste rápido isso serve
        }
    }

    async testViaCep(req, res) {
        try {
            const resultado = await viaCepService.consultarCep('01001000'); // Praça da Sé
            res.json({ success: true, message: 'Conexão ViaCEP ativa!', data: resultado });
        } catch (error) {
            throw new AppError(`Erro na integração ViaCEP: ${error.message}`, 502);
        }
    }

    async testReceita(req, res) {
        try {
            const resultado = await receitaFederalService.consultarCNPJ('00000000000191'); // Banco do Brasil
            res.json({ success: true, message: 'Conexão Receita Federal (BrasilAPI) ativa!', data: resultado });
        } catch (error) {
            throw new AppError(`Erro na integração Receita Federal: ${error.message}`, 502);
        }
    }
}

module.exports = new IntegrationController();
