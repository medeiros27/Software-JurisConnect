const { Demanda, sequelize } = require('../src/models');
const { Op } = require('sequelize');

async function debugCNJ() {
    console.log('🔍 Starting CNJ Migration Debug...');

    try {
        // Find demands where processo is NULL but descricao is not NULL
        const demandas = await Demanda.findAll({
            where: {
                processo: null,
                descricao: {
                    [Op.not]: null,
                    [Op.ne]: ''
                }
            },
            attributes: ['id', 'descricao']
        });

        console.log(`📊 Checking ${demandas.length} demands with empty 'processo'...`);

        let potentialMatches = 0;
        // Broader regex to catch variations (e.g. missing dots, extra spaces, or just the number sequence)
        // Standard: NNNNNNN-DD.AAAA.J.TR.OOOO
        // Loose: 7 digits, separator, 2 digits, separator, 4 digits...
        const looseRegex = /(\d{7})[-.\s]?(\d{2})[-.\s]?(\d{4})[-.\s]?(\d)[-.\s]?(\d{2})[-.\s]?(\d{4})/;

        for (const demanda of demandas) {
            const match = demanda.descricao.match(looseRegex);

            if (match) {
                console.log(`⚠️  Potential match found in Demanda #${demanda.id}:`);
                console.log(`   Desc: "${demanda.descricao}"`);
                console.log(`   Match: "${match[0]}"`);
                potentialMatches++;
            }
        }

        console.log('--- Debug Complete ---');
        console.log(`Found ${potentialMatches} potential matches that were missed.`);

    } catch (error) {
        console.error('❌ Debug Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugCNJ();
