const { Demanda, sequelize } = require('../src/models');

async function inspectByNumero() {
    console.log('🔍 Inspecting demands by Numero...');

    try {
        const numeros = [
            'DIL-1764810478008-29',
            'DIL-1764810478008-61'
        ];

        for (const num of numeros) {
            const demanda = await Demanda.findOne({
                where: { numero: num }
            });

            if (demanda) {
                console.log(`\n✅ Found Demanda with Numero "${num}":`);
                console.log(`   ID: ${demanda.id}`);
                console.log(`   Processo: '${demanda.processo}'`);
                console.log(`   Descricao: "${demanda.descricao}"`);
            } else {
                console.log(`\n❌ Demanda with Numero "${num}" NOT FOUND.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

inspectByNumero();
