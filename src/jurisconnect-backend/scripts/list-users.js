const { Usuario, sequelize } = require('../src/models');

async function listUsers() {
    try {
        const users = await Usuario.findAll({
            attributes: ['id', 'nome', 'email', 'role']
        });
        console.log('Users found:', users.length);
        users.forEach(u => {
            console.log(`ID: ${u.id}, Name: ${u.nome}, Email: ${u.email}, Role: ${u.role}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

listUsers();
