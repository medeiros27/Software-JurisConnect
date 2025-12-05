const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');

// Route to generate PDF report
// POST /api/reports/generate
router.post('/generate', ReportController.generatePdf);

module.exports = router;
