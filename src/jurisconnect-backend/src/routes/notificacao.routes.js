const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacao.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// GET /api/v1/notificacoes
router.get('/', notificacaoController.index);

// PATCH /api/v1/notificacoes/:id/lida
router.patch('/:id/lida', notificacaoController.marcarComoLida);

// PATCH /api/v1/notificacoes/marcar-todas-lidas
router.patch('/marcar-todas-lidas', notificacaoController.marcarTodasComoLidas);

module.exports = router;
