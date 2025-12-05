
const { Demanda, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function revertImport() {
    try {
        console.log('Reverting CSV import...');
        const result = await Demanda.destroy({
            where: {
                numero: {
                    [Op.like]: 'IMP-%'
                }
            }
        });
        console.log(`Deleted ${result} records.`);
    } catch (error) {
        console.error('Error reverting import:', error);
    } finally {
        await sequelize.close();
    }
}

revertImport();
