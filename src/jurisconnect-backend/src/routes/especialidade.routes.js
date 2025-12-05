const express = require('express');
const router = express.Router();
const especialidadeController = require('../controllers/especialidade.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware.verificarToken);

router.get('/', especialidadeController.listar);
router.post('/', especialidadeController.criar);

module.exports = router;
