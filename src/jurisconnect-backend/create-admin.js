const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Usuario } = require('./src/models');
const bcrypt = require('bcrypt');

async function createAdmin() {
    try {
        // Delete existing admin if any
        await Usuario.destroy({ where: { email: 'admin@jurisconnect.com' } });

        // Create new admin with PLAIN password (model hook will hash it)
        await Usuario.create({
            nome: 'Admin',
            email: 'admin@jurisconnect.com',
            senha_hash: 'admin123', // Model hook will hash this!
            role: 'admin',
            ativo: true
        });
        console.log('Admin user recreated: admin@jurisconnect.com / admin123');
    } catch (error) {
        console.error('Error creating admin:', error);
    }
}

createAdmin();
