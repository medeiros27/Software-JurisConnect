const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PdfService {
    generateReceipt(data, res) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Pipe to response
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('JURISCONNECT', { align: 'center' });
        doc.fontSize(10).text('Gestão de Correspondentes Jurídicos', { align: 'center' });
        doc.moveDown();
        doc.moveDown();

        // Title
        doc.fontSize(24).text('RECIBO DE PAGAMENTO', { align: 'center', underline: true });
        doc.moveDown();
        doc.moveDown();

        // Content
        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valor);
        const dataPagamento = new Date(data.data_pagamento).toLocaleDateString('pt-BR');

        doc.fontSize(14).text(`Recebemos de ${data.pagador} a quantia de ${valorFormatado}`, { align: 'justify' });
        doc.moveDown();

        if (data.recebedor) {
            doc.text(`Pago a: ${data.recebedor}`, { align: 'left' });
        }

        if (data.cpf_cnpj) {
            doc.text(`CNPJ/CPF: ${data.cpf_cnpj}`, { align: 'left' });
        }

        doc.moveDown();
        doc.text(`Referente a: ${data.referente_a}`, { align: 'justify' });

        if (data.observacoes) {
            doc.moveDown();
            doc.fontSize(12).text(`Observações: ${data.observacoes}`, { align: 'left' });
        }

        doc.moveDown();
        doc.fontSize(14).text(`Data do Pagamento: ${dataPagamento}`, { align: 'left' });
        doc.moveDown();
        doc.moveDown();
        doc.moveDown();

        // Signature
        doc.moveTo(50, 600).lineTo(550, 600).stroke();
        doc.fontSize(12).text('Assinatura', 50, 610, { align: 'center' }); // Generic signature label
        doc.text('JURISCONNECT', 50, 625, { align: 'center' }); // Assuming JurisConnect is always the issuer for Client receipts, or vice versa. 
        // Wait, for "Receitas" (Clients paying us), WE (JurisConnect) sign it.
        // For "Despesas" (We paying Correspondents), the CORRESPONDENT signs it (technically we generate a receipt FOR THEM to sign, or we generate a voucher).
        // The previous implementation was for "Despesas" (We paying Correspondent).
        // "Recebemos de JurisConnect... Pago a Correspondent". This implies the Correspondent received it.

        // For "Receitas" (Client paying us):
        // "Recebemos de [Cliente]... Pago a JurisConnect".

        // Let's make it generic based on "recebedor" field.

        doc.fontSize(10).text('Gerado automaticamente por JurisConnect', 50, 750, { align: 'center', color: 'grey' });

        doc.end();
    }
}

module.exports = new PdfService();
