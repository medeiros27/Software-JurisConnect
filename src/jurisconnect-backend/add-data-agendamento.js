const { Sequelize } = require('sequelize');
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
        logging: console.log,
    }
);

async function addDataAgendamento() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco.');

        console.log('🔄 Adicionando coluna data_agendamento...');
        await sequelize.query(`
      ALTER TABLE demandas 
      ADD COLUMN IF NOT EXISTS data_agendamento TIMESTAMP WITH TIME ZONE;
    `);

        console.log('✅ Coluna adicionada com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
}

addDataAgendamento();
