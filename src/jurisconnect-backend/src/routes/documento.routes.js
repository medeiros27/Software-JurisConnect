const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documento.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// GET /api/v1/documentos
router.get('/', documentoController.index);

// POST /api/v1/documentos (Upload)
router.post('/', documentoController.uploadMiddleware, documentoController.store);

// GET /api/v1/documentos/:id/download
router.get('/:id/download', documentoController.download);

// DELETE /api/v1/documentos/:id
router.delete('/:id', documentoController.delete);

module.exports = router;
