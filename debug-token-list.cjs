require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { sequelize } = require('./src/jurisconnect-backend/src/models');
const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const result = await demandaService.list({ limit: 5 });
        const demandas = result.demandas;

        if (demandas.length === 0) {
            console.log('Nenhuma demanda encontrada.');
        } else {
            console.log(`Encontradas ${demandas.length} demandas.`);
            demandas.forEach(d => {
                console.log(`ID: ${d.id}, Token: ${d.access_token}`);
            });
        }

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await sequelize.close();
    }
})();
