const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agenda.controller');
const { verificarToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    criarEventoSchema,
    atualizarEventoSchema,
} = require('../validators/agenda.validator');

router.use(verificarToken);

// GET /api/v1/agenda
router.get('/', agendaController.listar);

// GET /api/v1/agenda/mes/:ano/:mes
router.get('/mes/:ano/:mes', agendaController.obterPorMes);

// GET /api/v1/agenda/alertas
router.get('/alertas', agendaController.obterAlertas);

// GET /api/v1/agenda/:id
router.get('/:id', agendaController.obter);

// POST /api/v1/agenda
router.post('/', validate(criarEventoSchema), agendaController.criar);

// PUT /api/v1/agenda/:id
router.put('/:id', validate(atualizarEventoSchema), agendaController.atualizar);

// DELETE /api/v1/agenda/:id
router.delete('/:id', agendaController.deletar);

// POST /api/v1/agenda/google-auth
router.post('/google-auth', agendaController.googleAuth);

// POST /api/v1/agenda/google-callback
router.post('/google-callback', agendaController.googleCallback);

module.exports = router;
