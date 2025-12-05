const { Demanda, Agenda, Cliente, Correspondente, Usuario } = require('../models');
const { Op } = require('sequelize');
const googleCalendarService = require('../services/google-calendar.service');

module.exports = {
    // Lista eventos para o calendário (Demandas + Eventos da Agenda)
    async listar(req, res) {
        try {
            const { start, end } = req.query;

            const whereDemandas = {};
            const whereAgenda = {};

            if (start && end) {
                // Filtro para Demandas (Prazos)
                whereDemandas.data_prazo = {
                    [Op.between]: [start, end]
                };

                // Filtro para Agenda (Eventos)
                whereAgenda.data_evento = {
                    [Op.between]: [start, end]
                };
            }

            // 1. Buscar Prazos de Demandas
            const demandas = await Demanda.findAll({
                where: whereDemandas,
                include: [
                    { model: Cliente, as: 'cliente', attributes: ['nome_fantasia'] },
                    { model: Correspondente, as: 'correspondente', attributes: ['nome_fantasia'] }
                ]
            });

            // 2. Buscar Eventos da Agenda
            const eventosAgenda = await Agenda.findAll({
                where: whereAgenda,
                include: [
                    { model: Demanda, as: 'demanda', attributes: ['titulo', 'numero'] }
                ]
            });

            // Formatar Demandas
            const formattedDemandas = demandas.map(d => ({
                id: `demanda_${d.id}`,
                original_id: d.id,
                source: 'demanda',
                title: `⚖️ ${d.titulo} (${d.cliente?.nome_fantasia || 'Sem cliente'})`,
                start: d.data_prazo,
                end: d.data_prazo,
                allDay: true,
                type: 'prazo', // Cor específica para prazos
                status: d.status,
                resource: d,
                editable: false // Prazos editam na demanda
            }));

            // Formatar Eventos da Agenda
            const formattedAgenda = eventosAgenda.map(e => {
                // Combinar data e hora se existir
                let start = new Date(e.data_evento);
                let end = new Date(e.data_evento);
                let allDay = true;

                if (e.hora_evento) {
                    const [hours, minutes] = e.hora_evento.split(':');
                    start.setHours(parseInt(hours), parseInt(minutes));

                    // Calcular fim baseado na duração
                    end = new Date(start.getTime() + (e.duracao_minutos || 60) * 60000);
                    allDay = false;
                }

                return {
                    id: `agenda_${e.id}`,
                    original_id: e.id,
                    source: 'agenda',
                    title: `${getEmojiByType(e.tipo)} ${e.titulo}`,
                    start: start,
                    end: end,
                    allDay: allDay,
                    type: e.tipo,
                    resource: e,
                    editable: true
                };
            });

            let eventos = [...formattedDemandas, ...formattedAgenda];

            // 3. Google Calendar (Opcional)
            const usuario = await Usuario.findByPk(req.usuarioId);
            if (usuario && usuario.google_access_token) {
                try {
                    const googleEvents = await googleCalendarService.listEvents(
                        { access_token: usuario.google_access_token, refresh_token: usuario.google_refresh_token },
                        new Date(start),
                        new Date(end)
                    );

                    const formattedGoogleEvents = googleEvents.map(e => ({
                        id: `google_${e.id}`,
                        title: `📅 ${e.summary}`,
                        start: e.start.dateTime || e.start.date,
                        end: e.end.dateTime || e.end.date,
                        allDay: !e.start.dateTime,
                        type: 'google',
                        source: 'google',
                        editable: false
                    }));

                    eventos = [...eventos, ...formattedGoogleEvents];
                } catch (err) {
                    console.error('Erro ao buscar eventos do Google:', err);
                }
            }

            return res.json({ status: 'success', data: eventos });

        } catch (error) {
            console.error('Erro ao listar agenda:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async obterAlertas(req, res) {
        try {
            const hoje = new Date();
            const proximaSemana = new Date();
            proximaSemana.setDate(hoje.getDate() + 7);

            // Alertas de Demandas (Prazos)
            const alertasDemandas = await Demanda.findAll({
                where: {
                    data_prazo: { [Op.between]: [hoje, proximaSemana] },
                    status: { [Op.notIn]: ['concluida', 'cancelada'] }
                },
                include: [{ model: Cliente, as: 'cliente', attributes: ['nome_fantasia'] }],
                order: [['data_prazo', 'ASC']],
                limit: 5
            });

            // Alertas de Agenda (Reuniões/Audiências próximas)
            const alertasAgenda = await Agenda.findAll({
                where: {
                    data_evento: { [Op.between]: [hoje, proximaSemana] }
                },
                order: [['data_evento', 'ASC']],
                limit: 5
            });

            return res.json({
                status: 'success',
                data: {
                    demandas: alertasDemandas,
                    agenda: alertasAgenda
                }
            });

        } catch (error) {
            console.error('Erro ao obter alertas:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async criar(req, res) {
        try {
            const evento = await Agenda.create({
                ...req.body,
                criado_por: req.usuarioId
            });
            return res.status(201).json({ status: 'success', data: evento });
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            return res.status(500).json({ status: 'error', message: 'Erro ao criar evento' });
        }
    },

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const evento = await Agenda.findByPk(id);

            if (!evento) {
                return res.status(404).json({ status: 'error', message: 'Evento não encontrado' });
            }

            await evento.update(req.body);
            return res.json({ status: 'success', data: evento });
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            return res.status(500).json({ status: 'error', message: 'Erro ao atualizar evento' });
        }
    },

    async deletar(req, res) {
        try {
            const { id } = req.params;
            const evento = await Agenda.findByPk(id);

            if (!evento) {
                return res.status(404).json({ status: 'error', message: 'Evento não encontrado' });
            }

            await evento.destroy();
            return res.json({ status: 'success', message: 'Evento excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            return res.status(500).json({ status: 'error', message: 'Erro ao deletar evento' });
        }
    },

    async obter(req, res) {
        try {
            const { id } = req.params;
            const evento = await Agenda.findByPk(id);
            if (!evento) return res.status(404).json({ message: 'Evento não encontrado' });
            return res.json({ status: 'success', data: evento });
        } catch (error) {
            return res.status(500).json({ message: 'Erro interno' });
        }
    },

    // Google Auth methods remain the same...
    async googleAuth(req, res) {
        const url = googleCalendarService.generateAuthUrl();
        return res.json({ status: 'success', url });
    },

    async googleCallback(req, res) {
        const { code } = req.body;
        try {
            const tokens = await googleCalendarService.getTokens(code);
            await Usuario.update(
                { google_access_token: tokens.access_token, google_refresh_token: tokens.refresh_token },
                { where: { id: req.usuarioId } }
            );
            return res.json({ status: 'success', message: 'Conectado ao Google Calendar!' });
        } catch (error) {
            console.error('Erro no callback do Google:', error);
            return res.status(500).json({ status: 'error', message: 'Falha na autenticação com Google' });
        }
    },

    // Stub para manter compatibilidade
    async obterPorMes(req, res) { return res.json({ status: 'success', data: [] }); },
};

function getEmojiByType(tipo) {
    switch (tipo) {
        case 'audiencia': return '⚖️';
        case 'reuniao': return '👥';
        case 'lembrete': return '⏰';
        case 'prazo': return '📅';
        default: return '📌';
    }
}
