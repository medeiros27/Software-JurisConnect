const express = require('express');
const router = express.Router();
const processoController = require('../controllers/processoController');
const { verificarToken } = require('../middleware/auth'); // Opcional: proteger rota

// Rota pública ou protegida? 
// Idealmente protegida pois consome quota de API (se houvesse) e expõe dado
router.get('/consulta/:numero', verificarToken, (req, res) => processoController.consultar(req, res));

module.exports = router;
