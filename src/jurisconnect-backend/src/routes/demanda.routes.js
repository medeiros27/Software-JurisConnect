const express = require('express');
const router = express.Router();
const demandaController = require('../controllers/demanda.controller');
const documentoController = require('../controllers/documento.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    criarDemandaSchema,
    atualizarDemandaSchema,
    atualizarStatusSchema,
} = require('../validators/demanda.validator');

router.use(verificarToken);

// GET /api/v1/demandas
router.get('/', demandaController.listar);

// GET /api/v1/demandas/estatisticas
router.get('/estatisticas', demandaController.estatisticas);

// GET /api/v1/demandas/kanban
router.get('/kanban', demandaController.obterKanban);

// GET /api/v1/demandas/export/csv
router.get('/export/csv', demandaController.exportarCSV);

// GET /api/v1/demandas/external-cities
router.get('/external-cities', demandaController.getExternalCities);

// GET /api/v1/demandas/:id
router.get('/:id', demandaController.obter);

// POST /api/v1/demandas/:id/arquivos
router.post('/:id/arquivos', documentoController.uploadMiddleware, demandaController.uploadArquivo);

// POST /api/v1/demandas
router.post(
    '/',
    validate(criarDemandaSchema),
    demandaController.criar
);

// PUT /api/v1/demandas/:id
router.put(
    '/:id',
    validate(atualizarDemandaSchema),
    demandaController.atualizar
);

// PATCH /api/v1/demandas/:id/status
router.patch(
    '/:id/status',
    validate(atualizarStatusSchema),
    demandaController.atualizarStatus
);

// POST /api/v1/demandas/:id/n8n-action
router.post(
    '/:id/n8n-action',
    demandaController.n8nAction
);

// POST /api/v1/demandas/:id/publish
router.post(
    '/:id/publish',
    demandaController.publishDemand
);

// POST /api/v1/demandas/:id/revoke-token
router.post(
    '/:id/revoke-token',
    verificarRole('admin', 'gestor'),
    demandaController.revokeToken
);

// POST /api/v1/demandas/:id/andamentos
router.post(
    '/:id/andamentos',
    demandaController.adicionarAndamento
);

// GET /api/v1/demandas/:id/andamentos
router.get(
    '/:id/andamentos',
    demandaController.listarAndamentos
);

// POST /api/v1/demandas/:id/tags
router.post(
    '/:id/tags',
    demandaController.adicionarTags
);

// DELETE /api/v1/demandas/:id/tags
router.delete(
    '/:id/tags',
    demandaController.removerTags
);

// POST /api/v1/demandas/bulk/update
router.post(
    '/bulk/update',
    demandaController.atualizarEmLote
);

// POST /api/v1/demandas/bulk/delete
router.post(
    '/bulk/delete',
    verificarRole('admin', 'gestor'),
    demandaController.deletarEmLote
);

// POST /api/v1/demandas/:id/enviar-contrato
router.post(
    '/:id/enviar-contrato',
    demandaController.enviarContrato
);

// DELETE /api/v1/demandas/:id
router.delete(
    '/:id',
    verificarRole('admin', 'gestor'),
    demandaController.deletar
);

module.exports = router;

