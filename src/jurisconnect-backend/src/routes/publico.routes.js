const express = require('express');
const router = express.Router();
const publicoController = require('../controllers/publico.controller');
const documentoController = require('../controllers/documento.controller');

// GET /api/v1/publico/demanda/:token
router.get('/demanda/:token', publicoController.obterPorToken);

// POST /api/v1/publico/demanda/:token/arquivos
router.post('/demanda/:token/arquivos', documentoController.uploadMiddleware, publicoController.uploadArquivo);

module.exports = router;
