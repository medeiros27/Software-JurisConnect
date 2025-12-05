
require('dotenv').config();
const { Demanda, Pagamento, Cliente, Correspondente } = require('./src/models');
const { Op } = require('sequelize');

async function analyze() {
    try {
        console.log('Analyzing ALL demands with cost > 0...');

        const demandsWithCost = await Demanda.findAll({
            where: {
                valor_custo: { [Op.gt]: 0 }
            },
            include: [
                { model: Correspondente, as: 'correspondente', attributes: ['id', 'nome_fantasia'] }
            ]
        });

        console.log(`Total demands found: ${demandsWithCost.length}`);

        for (const demanda of demandsWithCost) {
            const activeExpense = await Pagamento.findOne({
                where: {
                    demanda_id: demanda.id,
                    tipo: 'pagar'
                }
            });

            const hasCorresp = !!demanda.correspondente_id;
            const hasExpense = !!activeExpense;

            console.log(`[DEMANDA ${demanda.numero}] ID: ${demanda.id}`);
            console.log(`   - Cost: ${demanda.valor_custo}`);
            console.log(`   - Corresp ID: ${demanda.correspondente_id} (${hasCorresp ? 'YES' : 'NO'})`);
            console.log(`   - Expense Found: ${hasExpense ? 'YES' : 'NO'}`);

            if (hasCorresp && !hasExpense) {
                console.log('   >>> PROBLEM: Has Correspondent but NO Expense!');
            }
            console.log('-----------------------------------');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

analyze();
