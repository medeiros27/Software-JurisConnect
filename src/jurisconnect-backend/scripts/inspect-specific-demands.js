const { Demanda, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function inspect() {
    console.log('🔍 Inspecting specific demands...');

    try {
        const searchTerms = [
            '0001462-59.2025.5.09.0965',
            '0001412-45.2025.5.09.0088'
        ];

        for (const term of searchTerms) {
            const demandas = await Demanda.findAll({
                where: {
                    descricao: {
                        [Op.like]: `%${term}%`
                    }
                }
            });

            console.log(`\nResults for "${term}":`);
            if (demandas.length === 0) {
                console.log('❌ No demands found matching this string exactly.');
                // Try searching for parts of it to see if there are hidden chars
                const part = term.substring(0, 10);
                console.log(`   Trying partial search for "${part}"...`);
                const partials = await Demanda.findAll({
                    where: {
                        descricao: {
                            [Op.like]: `%${part}%`
                        }
                    }
                });
                partials.forEach(d => {
                    console.log(`   Found ID #${d.id}:`);
                    console.log(`   Processo field: '${d.processo}'`);
                    console.log(`   Descricao raw: ${JSON.stringify(d.descricao)}`);
                });
            } else {
                demandas.forEach(d => {
                    console.log(`✅ Found ID #${d.id}:`);
                    console.log(`   Processo field: '${d.processo}'`);
                    console.log(`   Descricao raw: ${JSON.stringify(d.descricao)}`);

                    // Test regex against it
                    const cnjRegex = /(\d{7})[-.\s]?(\d{2})[-.\s]?(\d{4})[-.\s]?(\d)[-.\s]?(\d{2})[-.\s]?(\d{4})/;
                    const match = d.descricao.match(cnjRegex);
                    console.log(`   Regex match result: ${match ? 'MATCHED: ' + match[0] : 'NO MATCH'}`);
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

inspect();
