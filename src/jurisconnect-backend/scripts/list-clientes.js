const { Cliente, sequelize } = require('../src/models');

async function listClientes() {
    try {
        const clientes = await Cliente.findAll({
            attributes: ['id', 'nome_fantasia', 'razao_social']
        });
        console.log('Clientes found:', clientes.length);
        clientes.forEach(c => {
            console.log(`ID: ${c.id}, Name: ${c.nome_fantasia || c.razao_social}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listClientes();
