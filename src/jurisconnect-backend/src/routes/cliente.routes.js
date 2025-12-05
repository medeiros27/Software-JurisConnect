const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const { verificarToken, verificarRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { criarClienteSchema, atualizarClienteSchema } = require('../validators/cliente.validator');

// Todas as rotas requerem autenticação
router.use(verificarToken);

// GET /api/v1/clientes
router.get('/', clienteController.listar);

// GET /api/v1/clientes/estatisticas
router.get('/estatisticas', clienteController.estatisticas);

// GET /api/v1/clientes/:id
router.get('/:id', clienteController.obter);

// POST /api/v1/clientes (apenas admin e gestor)
router.post(
    '/',
    verificarRole('admin', 'gestor'),
    validate(criarClienteSchema),
    clienteController.criar
);

// PUT /api/v1/clientes/:id (apenas admin e gestor)
router.put(
    '/:id',
    verificarRole('admin', 'gestor'),
    validate(atualizarClienteSchema),
    clienteController.atualizar
);

// DELETE /api/v1/clientes/:id (apenas admin)
router.delete(
    '/:id',
    verificarRole('admin'),
    clienteController.deletar
);

module.exports = router;
