const { Especialidade } = require('../models');
const AppError = require('../utils/AppError');

class EspecialidadeController {
    async listar(req, res) {
        const especialidades = await Especialidade.findAll({
            where: { ativo: true },
            order: [['nome', 'ASC']],
        });

        res.json({
            success: true,
            data: especialidades,
        });
    }

    async criar(req, res) {
        const especialidade = await Especialidade.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Especialidade criada com sucesso',
            data: especialidade,
        });
    }
}

module.exports = new EspecialidadeController();
