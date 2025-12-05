const express = require('express');
const router = express.Router();
const controller = require('../controllers/correspondente.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    criarCorrespondenteSchema,
    atualizarCorrespondenteSchema,
} = require('../validators/correspondente.validator');

router.use(verificarToken);

// GET /api/v1/correspondentes/sugestoes
router.get('/sugestoes', controller.sugestoes);

// GET /api/v1/correspondentes/estatisticas
router.get('/estatisticas', controller.estatisticas);

// GET /api/v1/correspondentes
router.get('/', controller.listar);

// GET /api/v1/correspondentes/:id
router.get('/:id', controller.obter);

// GET /api/v1/correspondentes/:id/demandas
router.get('/:id/demandas', controller.demandas);

// POST /api/v1/correspondentes
router.post(
    '/',
    verificarRole('admin', 'gestor'),
    validate(criarCorrespondenteSchema),
    controller.criar
);

// PUT /api/v1/correspondentes/:id
router.put(
    '/:id',
    verificarRole('admin', 'gestor'),
    validate(atualizarCorrespondenteSchema),
    controller.atualizar
);

// PATCH /api/v1/correspondentes/:id/toggle-ativo
router.patch(
    '/:id/toggle-ativo',
    verificarRole('admin', 'gestor'),
    controller.toggleAtivo
);

// DELETE /api/v1/correspondentes/:id
router.delete('/:id', verificarRole('admin'), controller.deletar);

module.exports = router;
