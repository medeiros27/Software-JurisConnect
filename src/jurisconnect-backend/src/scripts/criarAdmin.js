const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Usuario, sequelize } = require('../models');

const criarUsuarioAdmin = async () => {
    try {
        console.log('Conectando ao banco de dados...');
        await sequelize.authenticate();

        // Verificar se já existe um admin
        const adminExistente = await Usuario.findOne({ where: { email: 'admin@jurisconnect.com' } });

        if (adminExistente) {
            console.log('✅ Usuário admin já existe!');
            console.log('Email: admin@jurisconnect.com');
            console.log('Senha: admin123');
            return;
        }

        // Criar novo usuário admin
        const admin = await Usuario.create({
            nome: 'Administrador',
            email: 'admin@jurisconnect.com',
            senha_hash: 'admin123', // Será hasheada automaticamente pelo hook do model
            role: 'admin'
        });

        console.log('✅ Usuário admin criado com sucesso!');
        console.log('Email: admin@jurisconnect.com');
        console.log('Senha: admin123');
        console.log('ID:', admin.id);

    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error.message);
    } finally {
        await sequelize.close();
    }
};

criarUsuarioAdmin();
