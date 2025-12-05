
const { Demanda, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function restoreLocalData() {
    try {
        console.log('Restoring Local Data...');

        // 1. Hard Delete currently active records (The Supabase ones we just imported)
        // We identify them by being active (deleted_at IS NULL).
        // WARNING: This assumes ALL active records are the wrong ones.
        // Since we did a "Clean Local DB" step which deleted EVERYTHING, 
        // and then synced Supabase, this assumption holds.

        console.log('Deleting active (Supabase) records...');
        const deletedCount = await Demanda.destroy({
            where: {
                deleted_at: null
            },
            force: true // Hard delete
        });
        console.log(`Hard deleted ${deletedCount} active records.`);

        // 2. Restore records deleted in the last 2 hours
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        console.log(`Restoring records deleted after ${twoHoursAgo.toISOString()}...`);

        const restoreCount = await Demanda.restore({
            where: {
                deleted_at: {
                    [Op.gt]: twoHoursAgo
                },
                numero: {
                    [Op.notLike]: 'IMP-%' // Do not restore the CSV imports
                }
            }
        });

        console.log(`Restored ${restoreCount} local records.`);

    } catch (error) {
        console.error('Error restoring data:', error);
    } finally {
        await sequelize.close();
    }
}

restoreLocalData();
