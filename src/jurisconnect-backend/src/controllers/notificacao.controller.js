const { Notificacao, Usuario } = require('../models');

module.exports = {
    async index(req, res) {
        try {
            const notificacoes = await Notificacao.findAll({
                where: { usuario_id: req.userId },
                order: [['created_at', 'DESC']],
                limit: 50
            });

            return res.json({ status: 'success', data: notificacoes });
        } catch (error) {
            console.error('Erro ao listar notificações:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async marcarComoLida(req, res) {
        try {
            const { id } = req.params;
            const notificacao = await Notificacao.findOne({
                where: { id, usuario_id: req.userId }
            });

            if (!notificacao) {
                return res.status(404).json({ status: 'error', message: 'Notificação não encontrada' });
            }

            await notificacao.update({ lida: true });

            return res.json({ status: 'success', message: 'Notificação marcada como lida' });
        } catch (error) {
            console.error('Erro ao atualizar notificação:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    },

    async marcarTodasComoLidas(req, res) {
        try {
            await Notificacao.update(
                { lida: true },
                { where: { usuario_id: req.userId, lida: false } }
            );

            return res.json({ status: 'success', message: 'Todas as notificações marcadas como lidas' });
        } catch (error) {
            console.error('Erro ao atualizar notificações:', error);
            return res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
        }
    }
};
