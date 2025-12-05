const dataJudService = require('../services/dataJudService');
const logger = require('../utils/logger');

class ProcessoController {
    async consultar(req, res) {
        const { numero } = req.params;

        if (!numero) {
            return res.status(400).json({
                success: false,
                message: 'Número do processo é obrigatório'
            });
        }

        try {
            const data = await dataJudService.consultarProcesso(numero);

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'Processo não encontrado na base do DataJud'
                });
            }

            return res.status(200).json({
                success: true,
                data
            });

        } catch (error) {
            logger.error(`Erro no controller de processo: ${error.message}`);

            // Retornar 500 mas com mensagem amigável
            return res.status(500).json({
                success: false,
                message: 'Erro ao consultar serviço externo',
                error: error.message
            });
        }
    }
}

module.exports = new ProcessoController();
