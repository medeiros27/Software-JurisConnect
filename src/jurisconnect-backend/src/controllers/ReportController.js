const PdfService = require('../services/PdfService');

class ReportController {
    async generatePdf(req, res) {
        try {
            const { template, data, title } = req.body;

            // Basic validation
            if (!data) {
                return res.status(400).json({ error: 'Data is required' });
            }

            const reportData = {
                title: title || 'Relatório',
                ...data
            };

            const pdfBuffer = await PdfService.generateReport(reportData, template);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=report-${Date.now()}.pdf`,
                'Content-Length': pdfBuffer.length
            });

            res.send(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).json({ error: 'Failed to generate PDF report' });
        }
    }
}

module.exports = new ReportController();
