const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integration.controller');
const { verificarToken } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(verificarToken);

router.post('/test/whatsapp', integrationController.testWhatsapp);
router.post('/test/google-calendar', integrationController.testGoogleCalendar);
router.post('/test/s3', integrationController.testS3);
router.get('/test/viacep', integrationController.testViaCep);
router.get('/test/receita', integrationController.testReceita);

module.exports = router;
