require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, Pagamento, sequelize } = require('./src/jurisconnect-backend/src/models');
const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');

async function forceSyncAll() {
    try {
        console.log('--- Starting Force Sync for ALL Demandas ---');

        const demandas = await Demanda.findAll();
        console.log(`Found ${demandas.length} demands to process.`);

        let syncedCount = 0;
        let errorCount = 0;

        for (const demanda of demandas) {
            try {
                // console.log(`Syncing Demanda ${demanda.numero}...`);
                await demandaService._syncPagamentos(demanda);
                syncedCount++;
            } catch (err) {
                console.error(`Error syncing Demanda ${demanda.numero}:`, err.message);
                errorCount++;
            }
        }

        console.log('\n--- Sync Completed ---');
        console.log(`✅ Successfully synced: ${syncedCount}`);
        console.log(`❌ Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal error during sync:', error);
    } finally {
        await sequelize.close();
    }
}

forceSyncAll();
