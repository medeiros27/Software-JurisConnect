const clienteService = require('../services/clienteService');

class ClienteController {
    async criar(req, res, next) {
        try {
            const cliente = await clienteService.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Cliente criado com sucesso',
                data: cliente,
            });
        } catch (error) {
            next(error);
        }
    }

    async listar(req, res, next) {
        try {
            const result = await clienteService.list(req.query, req.query);
            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async obter(req, res, next) {
        try {
            const cliente = await clienteService.getById(req.params.id);
            res.json({
                success: true,
                data: cliente,
            });
        } catch (error) {
            next(error);
        }
    }

    async atualizar(req, res, next) {
        try {
            const cliente = await clienteService.update(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Cliente atualizado com sucesso',
                data: cliente,
            });
        } catch (error) {
            next(error);
        }
    }

    async deletar(req, res, next) {
        try {
            const result = await clienteService.delete(req.params.id);
            res.json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    async estatisticas(req, res, next) {
        try {
            const stats = await clienteService.getStatistics();
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClienteController();
