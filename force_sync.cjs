require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda } = require('./src/jurisconnect-backend/src/models');
const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');

async function forceSync() {
    try {
        const demandas = await Demanda.findAll();
        console.log(`Syncing ${demandas.length} demands...`);

        for (const d of demandas) {
            try {
                await demandaService._syncPagamentos(d);
                console.log(`[OK] Synced Demand ID: ${d.id}`);
            } catch (err) {
                console.error(`[ERROR] Failed to sync Demand ID: ${d.id}`, err.message);
            }
        }
        console.log('Sync complete.');
    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

forceSync();
