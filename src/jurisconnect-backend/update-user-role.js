const { Usuario } = require('./src/models');

async function updateUserRole() {
    try {
        const user = await Usuario.findByPk(8);
        if (user) {
            await user.update({ role: 'admin' });
            console.log(`User ID 8 updated to role: 'admin'`);
        } else {
            console.log('User ID 8 not found.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

updateUserRole();
