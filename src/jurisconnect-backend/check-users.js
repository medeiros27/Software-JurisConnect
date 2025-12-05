const { Usuario } = require('./src/models');

async function listUsers() {
    try {
        const users = await Usuario.findAll({
            attributes: ['id', 'nome', 'email', 'role']
        });
        console.log('--- LOCAL USERS ---');
        for (const u of users) {
            console.log(`USER: ${u.id} - ${u.nome} (${u.email}) - Role: ${u.role}`);
        }
        console.log('-------------------');
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        process.exit();
    }
}

listUsers();
