require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, Pagamento, sequelize } = require('./src/jurisconnect-backend/src/models');
const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');

async function checkAndSync007() {
    try {
        console.log('--- Checking Demanda 2025000007 ---');
        const demanda = await Demanda.findOne({
            where: { numero: '2025000007' },
            include: [{ association: 'correspondente' }]
        });

        if (!demanda) {
            console.log('❌ Demanda not found.');
            return;
        }

        console.log(`Correspondente ID: ${demanda.correspondente_id}`);
        console.log(`Correspondente Nome: ${demanda.correspondente?.nome_fantasia || 'N/A'}`);
        console.log(`Valor Custo: ${demanda.valor_custo}`);

        if (demanda.correspondente_id) {
            console.log('✅ Correspondent found. Forcing sync...');
            await demandaService._syncPagamentos(demanda);
            console.log('Sync executed.');
        } else {
            console.log('❌ Still no correspondent linked. Cannot generate expense.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkAndSync007();
