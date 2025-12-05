const cron = require('node-cron');
const { Demanda, Notificacao, Usuario } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const checkDeadlines = async () => {
    logger.info('Iniciando verificação de prazos...');
    try {
        const now = new Date();
        const next48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const demandas = await Demanda.findAll({
            where: {
                data_prazo: {
                    [Op.between]: [now, next48h],
                },
                status: {
                    [Op.notIn]: ['concluida', 'cancelada'],
                },
            },
            include: [
                { model: Usuario, as: 'criador' } // To know who to notify
            ]
        });

        let notificationsCreated = 0;

        for (const demanda of demandas) {
            // Check if notification already exists for this demand today to avoid duplicates
            // (Optional optimization, but good practice)

            const userId = demanda.criado_por;
            if (!userId) continue; // Skip if no user associated

            const titulo = `Prazo Próximo: ${demanda.titulo}`;
            const mensagem = `A demanda #${demanda.numero} vence em breve (${new Date(demanda.data_prazo).toLocaleDateString()}). Verifique o status.`;

            // Check for duplicate notification today
            const existing = await Notificacao.findOne({
                where: {
                    usuario_id: userId,
                    titulo: titulo,
                    created_at: {
                        [Op.gte]: new Date(now.setHours(0, 0, 0, 0))
                    }
                }
            });

            if (!existing) {
                await Notificacao.create({
                    usuario_id: userId,
                    titulo: titulo,
                    mensagem: mensagem,
                    lida: false
                });
                notificationsCreated++;
            }
        }

        logger.info(`Verificação de prazos concluída. ${notificationsCreated} notificações criadas.`);

    } catch (error) {
        logger.error('Erro ao verificar prazos:', error);
    }
};

// Schedule task to run every day at 08:00 AM
const initDeadlineJob = () => {
    // 0 8 * * * = At 08:00
    cron.schedule('0 8 * * *', checkDeadlines, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    logger.info('Job de lembrete de prazos agendado para 08:00 AM.');
};

module.exports = { initDeadlineJob, checkDeadlines };
