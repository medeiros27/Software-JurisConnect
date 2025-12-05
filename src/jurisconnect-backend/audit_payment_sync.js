
require('dotenv').config();
const { Demanda, Pagamento, Cliente, Correspondente } = require('./src/models');
const { Op } = require('sequelize');

async function audit() {
    try {
        console.log('Starting Comprehensive Payment Audit...');

        const demands = await Demanda.findAll({
            include: [
                { model: Cliente, as: 'cliente', attributes: ['nome_fantasia'] },
                { model: Correspondente, as: 'correspondente', attributes: ['nome_fantasia'] }
            ]
        });

        console.log(`Auditing ${demands.length} demands...`);

        let missingReceivables = 0;
        let missingPayables = 0;
        let payablesMissingCorresp = 0;

        for (const d of demands) {
            const cobrado = parseFloat(d.valor_cobrado || 0);
            const custo = parseFloat(d.valor_custo || 0);

            // Check Receivable
            if (cobrado > 0) {
                const rec = await Pagamento.findOne({ where: { demanda_id: d.id, tipo: 'receber' } });
                if (!rec) {
                    console.log(`[MISSING RECEIVABLE] Demanda ${d.numero} (ID: ${d.id}) - Valor: ${cobrado}`);
                    missingReceivables++;
                }
            }

            // Check Payable
            if (custo > 0) {
                const pag = await Pagamento.findOne({ where: { demanda_id: d.id, tipo: 'pagar' } });

                if (!pag) {
                    if (d.correspondente_id) {
                        console.log(`[MISSING PAYABLE] Demanda ${d.numero} (ID: ${d.id}) - Valor: ${custo} - Corresp: ${d.correspondente.nome_fantasia}`);
                        missingPayables++;
                    } else {
                        console.log(`[PAYABLE PENDING CORRESP] Demanda ${d.numero} (ID: ${d.id}) - Valor: ${custo} - NO CORRESPONDENT`);
                        payablesMissingCorresp++;
                    }
                }
            }
        }

        console.log('\n--- AUDIT SUMMARY ---');
        console.log(`Missing Receivables: ${missingReceivables}`);
        console.log(`Missing Payables (with Corresp): ${missingPayables}`);
        console.log(`Payables waiting for Corresp: ${payablesMissingCorresp}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

audit();
