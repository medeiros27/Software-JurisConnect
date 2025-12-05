require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, Pagamento, sequelize } = require('./src/jurisconnect-backend/src/models');

async function restorePayments() {
    try {
        const targetNumeros = ['2025000003', '2025000004'];
        console.log('--- Restoring Payments ---');

        for (const numero of targetNumeros) {
            const demanda = await Demanda.findOne({ where: { numero } });
            if (!demanda) continue;

            const payments = await Pagamento.findAll({
                where: { demanda_id: demanda.id },
                paranoid: false
            });

            for (const p of payments) {
                if (p.deletedAt) {
                    console.log(`Restoring payment ${p.id} for Demanda ${numero}...`);
                    await p.restore();
                } else {
                    console.log(`Payment ${p.id} for Demanda ${numero} is active.`);
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

restorePayments();
