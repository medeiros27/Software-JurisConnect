const cron = require('node-cron');
const { Op } = require('sequelize');
const { Demanda, Correspondente } = require('../models');
const whatsappService = require('../services/whatsapp.service');
const logger = require('../utils/logger');

const initReminderJob = () => {
    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        logger.info('[ReminderJob] Iniciando verificação de demandas próximas...');

        try {
            const now = new Date();

            // Window: 1h 25m to 1h 35m from now (targeting 1h 30m)
            const startTime = new Date(now.getTime() + 85 * 60000); // +85 min
            const endTime = new Date(now.getTime() + 95 * 60000);   // +95 min

            const demandas = await Demanda.findAll({
                where: {
                    status: {
                        [Op.in]: ['pendente', 'em_andamento', 'aguardando_correspondente']
                    },
                    data_agendamento: {
                        [Op.between]: [startTime, endTime]
                    },
                    correspondente_id: {
                        [Op.not]: null
                    }
                },
                include: [
                    {
                        model: Correspondente,
                        as: 'correspondente',
                        attributes: ['id', 'nome_fantasia', 'celular', 'telefone']
                    }
                ]
            });

            logger.info(`[ReminderJob] Encontradas ${demandas.length} demandas para notificar.`);

            for (const demanda of demandas) {
                const correspondente = demanda.correspondente;

                // Prefer 'celular', fallback to 'telefone'
                let phone = correspondente.celular || correspondente.telefone;

                if (phone) {
                    // Basic cleaning: remove non-digits
                    phone = phone.replace(/\D/g, '');

                    // Add country code if missing (assuming BR +55)
                    if (phone.length <= 11) {
                        phone = `55${phone}`;
                    }

                    const message = `Prezado(a) ${correspondente.nome_fantasia},

Este é um lembrete automático referente à demanda *${demanda.titulo}* (Ref: ${demanda.numero}).

O compromisso está agendado para hoje às *${new Date(demanda.data_agendamento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}*.

Por favor, confirme se está tudo pronto para a realização da diligência.

Atenciosamente,
Equipe JurisConnect`;

                    await whatsappService.sendTextMessage(phone, message);
                    logger.info(`[ReminderJob] Notificação enviada para ${correspondente.nome_fantasia} (Demanda ${demanda.id})`);
                } else {
                    logger.warn(`[ReminderJob] Correspondente ${correspondente.id} sem telefone cadastrado.`);
                }
            }

        } catch (error) {
            logger.error(`[ReminderJob] Erro ao executar job: ${error.message}`);
        }
    });

    logger.info('[ReminderJob] Job de lembretes inicializado (*/10 * * * *)');
};

module.exports = { initReminderJob };
