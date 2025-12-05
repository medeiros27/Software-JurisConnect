
const { Demanda, Cliente, Correspondente, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function executeCleanup() {
    const transaction = await sequelize.transaction();
    try {
        console.log('Starting Cleanup...');

        // Helper function to cleanup a model (Cliente or Correspondente)
        const cleanupModel = async (Model, foreignKey, modelName) => {
            console.log(`\nProcessing ${modelName}...`);

            // 1. Remove Orphans (No Demanda)
            // We can't easily use NOT IN with Sequelize without raw query or careful include
            // Let's fetch all, find orphans, and delete.
            const allRecords = await Model.findAll({
                include: [{ model: Demanda, as: 'demandas', attributes: ['id'] }],
                transaction
            });

            const orphans = allRecords.filter(r => r.demandas.length === 0);
            const orphanIds = orphans.map(r => r.id);

            if (orphanIds.length > 0) {
                console.log(`Deleting ${orphanIds.length} orphan ${modelName}s...`);
                await Model.destroy({
                    where: { id: orphanIds },
                    transaction
                });
            } else {
                console.log(`No orphan ${modelName}s found.`);
            }

            // 2. Merge Duplicates
            // Group by name
            const groups = {};
            allRecords.forEach(r => {
                // Skip if it was just deleted (orphan)
                if (orphanIds.includes(r.id)) return;

                const name = (r.nome_fantasia || r.razao_social || 'UNKNOWN').trim().toUpperCase();
                if (!groups[name]) groups[name] = [];
                groups[name].push(r);
            });

            let mergedCount = 0;
            let deletedCount = 0;

            for (const name in groups) {
                const group = groups[name];
                if (group.length > 1) {
                    // Sort by number of demands (descending), then ID (ascending)
                    // We want to keep the one with the most data or the oldest one
                    group.sort((a, b) => b.demandas.length - a.demandas.length || a.id - b.id);

                    const master = group[0];
                    const duplicates = group.slice(1);
                    const duplicateIds = duplicates.map(d => d.id);

                    // Re-associate Demands
                    await Demanda.update(
                        { [foreignKey]: master.id },
                        {
                            where: { [foreignKey]: duplicateIds },
                            transaction
                        }
                    );

                    // Delete Duplicates
                    await Model.destroy({
                        where: { id: duplicateIds },
                        transaction
                    });

                    mergedCount++;
                    deletedCount += duplicateIds.length;
                    console.log(`Merged "${name}": Kept ID ${master.id}, Deleted IDs ${duplicateIds.join(', ')}`);
                }
            }
            console.log(`Merged ${mergedCount} groups, deleted ${deletedCount} duplicate ${modelName}s.`);
        };

        await cleanupModel(Cliente, 'cliente_id', 'Cliente');
        await cleanupModel(Correspondente, 'correspondente_id', 'Correspondente');

        await transaction.commit();
        console.log('\nCleanup Completed Successfully.');

    } catch (error) {
        await transaction.rollback();
        console.error('Error executing cleanup:', error);
    } finally {
        await sequelize.close();
    }
}

executeCleanup();
