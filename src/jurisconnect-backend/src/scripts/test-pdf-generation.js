const PdfService = require('../services/PdfService');
const fs = require('fs');
const path = require('path');

async function testPdfGeneration() {
    try {
        console.log('Starting PDF generation test...');

        const outputDir = path.join(__dirname, '../../test-output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Test 1: Default Template
        console.log('Testing Default Template...');
        const defaultData = {
            title: 'Relatório de Teste',
            content: 'Este é um relatório de teste gerado automaticamente.'
        };
        const defaultPdf = await PdfService.generateReport(defaultData, 'default');
        fs.writeFileSync(path.join(outputDir, 'test-default.pdf'), defaultPdf);
        console.log('Default PDF generated successfully.');

        // Test 2: Financial Template
        console.log('Testing Financial Template...');
        const financialData = {
            title: 'Relatório Financeiro Mensal',
            items: [
                { date: '01/01/2024', description: 'Pagamento Cliente A', value: 1500.00 },
                { date: '05/01/2024', description: 'Despesa Operacional', value: -200.50 },
                { date: '10/01/2024', description: 'Pagamento Cliente B', value: 3000.00 },
                { date: '15/01/2024', description: 'Serviço Extra', value: 500.00 }
            ]
        };
        const financialPdf = await PdfService.generateReport(financialData, 'financial');
        fs.writeFileSync(path.join(outputDir, 'test-financial.pdf'), financialPdf);
        console.log('Financial PDF generated successfully.');

        console.log(`All PDFs saved to: ${outputDir}`);

    } catch (error) {
        console.error('Error during PDF generation test:', error);
    }
}

testPdfGeneration();
