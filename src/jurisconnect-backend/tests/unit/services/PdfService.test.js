const PdfService = require('../../src/services/PdfService');

describe('PdfService', () => {
    describe('generateReport', () => {
        it('deve gerar PDF com template default', async () => {
            const data = {
                title: 'Relatório Teste',
                content: 'Conteúdo do relatório'
            };

            const pdfBuffer = await PdfService.generateReport(data, 'default');

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
            // Verificar header PDF
            expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
        });

        it('deve gerar PDF com template financial', async () => {
            const data = {
                title: 'Relatório Financeiro',
                items: [
                    { descricao: 'Item 1', valor: 100.00 },
                    { descricao: 'Item 2', valor: 200.00 }
                ],
                total: 300.00
            };

            const pdfBuffer = await PdfService.generateReport(data, 'financial');

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });

        it('deve gerar PDF com template operational', async () => {
            const data = {
                title: 'Relatório Operacional',
                sections: [
                    { title: 'Seção 1', content: 'Conteúdo 1' },
                    { title: 'Seção 2', content: 'Conteúdo 2' }
                ]
            };

            const pdfBuffer = await PdfService.generateReport(data, 'operational');

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });

        it('deve lançar erro quando dados são inválidos', async () => {
            await expect(
                PdfService.generateReport(null, 'default')
            ).rejects.toThrow();
        });

        it('deve usar template default quando template não especificado', async () => {
            const data = { title: 'Teste' };
            const pdfBuffer = await PdfService.generateReport(data);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
        });
    });
});
