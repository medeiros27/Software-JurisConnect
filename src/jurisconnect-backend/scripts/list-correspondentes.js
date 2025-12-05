const { Correspondente, sequelize } = require('../src/models');

async function listCorrespondentes() {
    try {
        const correspondents = await Correspondente.findAll({
            attributes: ['id', 'nome_fantasia']
        });
        console.log('Correspondents found:', correspondents.length);
        correspondents.forEach(c => {
            console.log(`ID: ${c.id}, Name: ${c.nome_fantasia}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listCorrespondentes();
