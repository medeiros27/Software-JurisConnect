
const { Demanda, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function removeSupabaseData() {
    try {
        console.log('Removing Supabase Data (IDs <= 2000)...');

        const count = await Demanda.destroy({
            where: {
                id: {
                    [Op.lte]: 2000
                }
            },
            force: true // Hard delete to be sure
        });

        console.log(`Deleted ${count} Supabase records.`);

        const remaining = await Demanda.count();
        console.log(`Remaining Local records: ${remaining}`);

    } catch (error) {
        console.error('Error removing data:', error);
    } finally {
        await sequelize.close();
    }
}

removeSupabaseData();
