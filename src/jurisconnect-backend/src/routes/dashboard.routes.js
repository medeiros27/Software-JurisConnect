const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// GET /api/v1/dashboard/kpis
router.get('/kpis', dashboardController.obterKPIs);

// GET /api/v1/dashboard/graficos
router.get('/graficos', dashboardController.obterGraficos);

// GET /api/v1/dashboard (Completo)
router.get('/', dashboardController.obterDashboardCompleto);

module.exports = router;
