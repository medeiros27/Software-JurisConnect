require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Sequelize } = require('./src/jurisconnect-backend/node_modules/sequelize');
const config = require('./src/jurisconnect-backend/src/config/database.js');
const { Demanda, Pagamento } = require('./src/jurisconnect-backend/src/models');

async function verify() {
    try {
        const demandas = await Demanda.findAll();
        console.log(`Total Demandas: ${demandas.length}`);

        const pagamentos = await Pagamento.findAll();
        console.log(`Total Pagamentos: ${pagamentos.length}`);

        const demandasComValor = demandas.filter(d => parseFloat(d.valor_cobrado) > 0);
        console.log(`Demandas com valor_cobrado > 0: ${demandasComValor.length}`);

        if (pagamentos.length === 0 && demandasComValor.length > 0) {
            console.log("ALERT: Pagamentos table is empty but there are demands with value!");

            // Try to sync one manually to see if it works
            console.log("Attempting to sync first demand...");
            const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');
            await demandaService._syncPagamentos(demandasComValor[0]);

            const newPagamentos = await Pagamento.findAll();
            console.log(`Total Pagamentos after manual sync: ${newPagamentos.length}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

verify();
