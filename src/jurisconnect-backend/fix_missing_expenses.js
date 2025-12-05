
require('dotenv').config();
const demandaService = require('./src/services/demandaService');
const { Demanda, Pagamento, Correspondente } = require('./src/models');
const { Op } = require('sequelize');

async function fix() {
    try {
        console.log('Starting Fix for Missing Expenses...');

        // Find all demands with cost > 0 and a correspondent
        const demands = await Demanda.findAll({
            where: {
                valor_custo: { [Op.gt]: 0 },
                correspondente_id: { [Op.ne]: null }
            },
            include: [
                { model: Correspondente, as: 'correspondente', attributes: ['id', 'nome_fantasia'] }
            ]
        });

        console.log(`Found ${demands.length} potential candidates.`);

        let fixedCount = 0;

        for (const demanda of demands) {
            // Check if expense exists
            const expense = await Pagamento.findOne({
                where: {
                    demanda_id: demanda.id,
                    tipo: 'pagar'
                }
            });

            if (!expense) {
                console.log(`Fixing Demanda: ${demanda.numero} (ID: ${demanda.id}) - Missing Expense for ${demanda.correspondente.nome_fantasia}`);

                // Force Sync
                await demandaService._syncPagamentos(demanda);
                fixedCount++;
            }
        }

        console.log(`\n--- SUMMARY ---`);
        console.log(`Total fixed: ${fixedCount}`);
        console.log('Done.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

fix();
