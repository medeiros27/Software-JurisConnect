const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamento.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    criarPagamentoSchema,
    atualizarPagamentoSchema,
} = require('../validators/pagamento.validator');

router.use(verificarToken);

// GET /api/v1/financeiro/dashboard
router.get('/dashboard', pagamentoController.dashboard);

// GET /api/v1/financeiro/pagamentos
router.get('/pagamentos', pagamentoController.index);

// GET /api/v1/financeiro/pagamentos/:id/recibo
router.get('/pagamentos/:id/recibo', pagamentoController.downloadRecibo);

// POST /api/v1/financeiro/pagamentos/recibo
router.post('/pagamentos/recibo', pagamentoController.gerarRecibo);

// GET /api/v1/financeiro/dre
router.get('/dre', pagamentoController.relatorioDRE);

// GET /api/v1/financeiro/ranking
router.get('/ranking', pagamentoController.relatorioRanking);

// GET /api/v1/financeiro/exportar
router.get('/exportar', pagamentoController.exportarRelatorio);

// POST /api/v1/financeiro/sync (Backfill)
router.post('/sync', verificarRole('admin', 'gestor'), pagamentoController.syncLegacy);

// GET /api/v1/financeiro/pagamentos/:id
router.get('/pagamentos/:id', pagamentoController.index); // TODO: Implement show method if needed specifically

// POST /api/v1/financeiro/pagamentos
router.post(
    '/pagamentos',
    verificarRole('admin', 'gestor'),
    validate(criarPagamentoSchema),
    pagamentoController.store
);

// PUT /api/v1/financeiro/pagamentos/:id
router.put(
    '/pagamentos/:id',
    verificarRole('admin', 'gestor'),
    validate(atualizarPagamentoSchema),
    pagamentoController.update
);

// PATCH /api/v1/financeiro/pagamentos/:id/status
router.patch(
    '/pagamentos/:id/status',
    verificarRole('admin', 'gestor'),
    pagamentoController.updateStatus
);

// POST /api/v1/financeiro/pagamentos/bulk/update
router.post(
    '/pagamentos/bulk/update',
    verificarRole('admin', 'gestor'),
    pagamentoController.bulkUpdate
);

// DELETE /api/v1/financeiro/pagamentos/:id
router.delete(
    '/pagamentos/:id',
    verificarRole('admin', 'gestor'),
    pagamentoController.delete
);

module.exports = router;
