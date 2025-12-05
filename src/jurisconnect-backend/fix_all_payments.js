
require('dotenv').config();
const demandaService = require('./src/services/demandaService');
const { Demanda, Pagamento, Cliente, Correspondente } = require('./src/models');
const { Op } = require('sequelize');

async function fixAll() {
    try {
        console.log('Starting Comprehensive Payment Fix...');

        const demands = await Demanda.findAll({
            include: [
                { model: Cliente, as: 'cliente', attributes: ['nome_fantasia'] },
                { model: Correspondente, as: 'correspondente', attributes: ['nome_fantasia'] }
            ]
        });

        let fixedCount = 0;

        for (const d of demands) {
            let needsSync = false;
            const cobrado = parseFloat(d.valor_cobrado || 0);
            const custo = parseFloat(d.valor_custo || 0);

            // Check Receivable
            if (cobrado > 0) {
                const rec = await Pagamento.findOne({ where: { demanda_id: d.id, tipo: 'receber' } });
                if (!rec) {
                    console.log(`[FIXING RECEIVABLE] Demanda ${d.numero} (ID: ${d.id})`);
                    needsSync = true;
                }
            }

            // Check Payable
            if (custo > 0 && d.correspondente_id) {
                const pag = await Pagamento.findOne({ where: { demanda_id: d.id, tipo: 'pagar' } });
                if (!pag) {
                    console.log(`[FIXING PAYABLE] Demanda ${d.numero} (ID: ${d.id})`);
                    needsSync = true;
                }
            }

            if (needsSync) {
                await demandaService._syncPagamentos(d);
                fixedCount++;
            }
        }

        console.log(`\n--- FIX SUMMARY ---`);
        console.log(`Total demands re-synced: ${fixedCount}`);
        console.log('All discrepancies should now be resolved.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

fixAll();
