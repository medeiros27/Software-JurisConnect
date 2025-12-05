const { Demanda, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function migrateCNJ() {
    console.log('🚀 Starting CNJ Process Number Migration (Robust Mode)...');

    try {
        const demandas = await Demanda.findAll({
            where: {
                descricao: {
                    [Op.not]: null
                }
            }
        });

        console.log(`📊 Found ${demandas.length} demands to check.`);

        let updatedCount = 0;
        // Flexible regex to catch variations (dots, dashes, spaces)
        // Groups: 1=Number, 2=Check, 3=Year, 4=Justice, 5=Tribunal, 6=Unit
        const cnjRegex = /(\d{7})[-.\s]?(\d{2})[-.\s]?(\d{4})[-.\s]?(\d)[-.\s]?(\d{2})[-.\s]?(\d{4})/;

        for (const demanda of demandas) {
            const match = demanda.descricao.match(cnjRegex);

            if (match) {
                // Normalize to standard format: NNNNNNN-DD.AAAA.J.TR.OOOO
                const processo = `${match[1]}-${match[2]}.${match[3]}.${match[4]}.${match[5]}.${match[6]}`;

                // Only update if processo is currently empty or different
                if (demanda.processo !== processo) {
                    await demanda.update({ processo });
                    console.log(`✅ Updated Demanda #${demanda.id}: Processo ${processo} extracted (from "${match[0]}").`);
                    updatedCount++;
                }
            }
        }

        console.log('--- Migration Complete ---');
        console.log(`✨ Total demands processed: ${demandas.length}`);
        console.log(`📝 Total demands updated: ${updatedCount}`);

    } catch (error) {
        console.error('❌ Migration Error:', error);
    } finally {
        await sequelize.close();
    }
}

migrateCNJ();
