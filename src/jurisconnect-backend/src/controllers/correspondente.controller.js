const correspondenteService = require('../services/correspondenteService');
const logger = require('../utils/logger');

class CorrespondenteController {
    async criar(req, res) {
        const correspondente = await correspondenteService.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Correspondente criado com sucesso',
            data: correspondente,
        });
    }

    async listar(req, res) {
        const { page, limit, tipo, estado_sediado, cidade_sediado, ativo, busca } = req.query;

        const result = await correspondenteService.list(
            { tipo, estado_sediado, cidade_sediado, ativo, search: busca },
            { page, limit }
        );

        res.json({
            success: true,
            data: result,
        });
    }

    async obter(req, res) {
        const { id } = req.params;
        const correspondente = await correspondenteService.getById(id);

        res.json({
            success: true,
            data: correspondente,
        });
    }

    async atualizar(req, res) {
        const { id } = req.params;
        const correspondente = await correspondenteService.update(id, req.body);

        res.json({
            success: true,
            message: 'Correspondente atualizado com sucesso',
            data: correspondente,
        });
    }

    async deletar(req, res) {
        const { id } = req.params;
        const result = await correspondenteService.delete(id);

        res.json({
            success: true,
            message: result.message,
        });
    }

    async toggleAtivo(req, res) {
        const { id } = req.params;
        const correspondente = await correspondenteService.toggleAtivo(id);

        res.json({
            success: true,
            message: `Correspondente ${correspondente.ativo ? 'ativado' : 'desativado'} com sucesso`,
            data: correspondente,
        });
    }

    async estatisticas(req, res) {
        const stats = await correspondenteService.getStatistics();

        res.json({
            success: true,
            data: stats,
        });
    }

    async demandas(req, res) {
        const { id } = req.params;
        const result = await correspondenteService.getDemandsByCorrespondente(id);

        res.json({
            success: true,
            data: result,
        });
    }

    async sugestoes(req, res) {
        const { cidade, estado } = req.query;

        if (!cidade || !estado) {
            return res.status(400).json({
                success: false,
                message: 'Cidade e estado são obrigatórios para busca de sugestões'
            });
        }

        try {
            // Logic handled directly here or delegated to service. 
            // Delegating to service is cleaner but for speed/simplicity I'll add logic here or create a service method.
            // Let's create a service method for it.
            const sugestoes = await correspondenteService.findSuggestions(cidade, estado);

            res.json({
                success: true,
                data: sugestoes
            });
        } catch (error) {
            logger.logError(error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar sugestões de correspondentes'
            });
        }
    }
}

module.exports = new CorrespondenteController();
