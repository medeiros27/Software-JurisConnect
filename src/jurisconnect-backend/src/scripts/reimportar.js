const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Usuario, sequelize } = require('../models');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const reimportarDados = async () => {
    try {
        console.log('========================================');
        console.log('🔄 REIMPORTAÇÃO COMPLETA DE DADOS');
        console.log('========================================\n');

        // 1. Executar importação do CSV
        console.log('📊 Passo 1: Importando dados do CSV...');
        const { stdout: importStdout, stderr: importStderr } = await execPromise('node src/scripts/importCsv.js');
        console.log(importStdout);
        if (importStderr) console.error(importStderr);

        // 2. Recriar usuário admin
        console.log('\n👤 Passo 2: Recriando usuário administrador...');
        await sequelize.authenticate();

        const adminExistente = await Usuario.findOne({ where: { email: 'admin@jurisconnect.com' } });

        if (!adminExistente) {
            const admin = await Usuario.create({
                nome: 'Administrador',
                email: 'admin@jurisconnect.com',
                senha_hash: 'admin123',
                role: 'admin'
            });
            console.log('✅ Usuário admin criado!');
            console.log('   Email: admin@jurisconnect.com');
            console.log('   Senha: admin123');
            console.log('   ID:', admin.id);
        } else {
            console.log('✅ Usuário admin já existe!');
        }

        console.log('\n========================================');
        console.log('✅ REIMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('========================================');

    } catch (error) {
        console.error('\n❌ Erro na reimportação:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
    }
};

reimportarDados();
