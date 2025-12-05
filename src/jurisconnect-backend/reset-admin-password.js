const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const config = require('./src/config/database.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false,
    }
);

async function resetPassword() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco.');

        const email = 'admin@jurisconnect.com';
        const novaSenha = 'admin123';

        // Gerar novo hash
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Verificar se usuário existe
        const [usuarios] = await sequelize.query(`SELECT * FROM usuarios WHERE email = '${email}'`);

        if (usuarios.length === 0) {
            console.log('❌ Usuário admin não encontrado! Criando agora...');
            await sequelize.query(`
        INSERT INTO usuarios (nome, email, senha_hash, role, ativo, created_at, updated_at)
        VALUES ('Administrador', '${email}', '${senhaHash}', 'admin', true, NOW(), NOW())
      `);
            console.log('✅ Usuário admin criado com sucesso!');
        } else {
            console.log('🔄 Usuário encontrado. Atualizando senha...');
            await sequelize.query(`
        UPDATE usuarios 
        SET senha_hash = '${senhaHash}', ativo = true 
        WHERE email = '${email}'
      `);
            console.log('✅ Senha atualizada com sucesso!');
        }

        // Testar comparação
        const [userAtualizado] = await sequelize.query(`SELECT senha_hash FROM usuarios WHERE email = '${email}'`);
        const match = await bcrypt.compare(novaSenha, userAtualizado[0].senha_hash);

        if (match) {
            console.log('✅ Teste de senha: OK (Hash bate com a senha)');
        } else {
            console.error('❌ Teste de senha: FALHOU');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

resetPassword();
