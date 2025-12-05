
const { Demanda, sequelize } = require('./src/models');

async function cleanLocalDb() {
    try {
        console.log('Cleaning Local Database...');

        // Delete all Demandas
        // Using truncate might fail due to FKs if other tables reference Demandas (e.g. Diligencias, Documentos).
        // But Demanda is usually the parent.
        // Let's use destroy with truncate option if possible, or just destroy all.
        // Destroy all is safer for hooks/cascades.

        const count = await Demanda.count();
        console.log(`Deleting ${count} Demandas...`);

        await Demanda.destroy({
            where: {},
            truncate: false // Use DELETE FROM
        });

        console.log('All Demandas deleted.');

    } catch (error) {
        console.error('Error cleaning DB:', error);
    } finally {
        await sequelize.close();
    }
}

cleanLocalDb();
