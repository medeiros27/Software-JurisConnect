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

async function createAltAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco.');

        const email = 'admin@jurisconnect.com'; // SEM .BR
        const senha = 'admin123';
        const senhaHash = await bcrypt.hash(senha, 10);

        // Verificar se usuário existe
        const [usuarios] = await sequelize.query(`SELECT * FROM usuarios WHERE email = '${email}'`);

        if (usuarios.length === 0) {
            console.log(`📦 Criando usuário ${email}...`);
            await sequelize.query(`
        INSERT INTO usuarios (nome, email, senha_hash, role, ativo, created_at, updated_at)
        VALUES ('Administrador', '${email}', '${senhaHash}', 'admin', true, NOW(), NOW())
      `);
            console.log('✅ Usuário criado com sucesso!');
        } else {
            console.log(`🔄 Usuário ${email} já existe. Atualizando senha...`);
            await sequelize.query(`
        UPDATE usuarios 
        SET senha_hash = '${senhaHash}', ativo = true 
        WHERE email = '${email}'
      `);
            console.log('✅ Senha atualizada!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

createAltAdmin();
