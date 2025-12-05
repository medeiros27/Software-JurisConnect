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

async function migrateEnumToString() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco.');

        // 1. Alterar coluna para VARCHAR
        console.log('🔄 Alterando coluna tipo_demanda para VARCHAR...');
        await sequelize.query(`
      ALTER TABLE demandas 
      ALTER COLUMN tipo_demanda TYPE VARCHAR(255) 
      USING tipo_demanda::text;
    `);

        // 2. Dropar o tipo ENUM antigo (opcional, mas bom para limpeza)
        console.log('🗑️ Removendo tipo ENUM antigo...');
        await sequelize.query(`DROP TYPE IF EXISTS "enum_demandas_tipo_demanda";`);

        console.log('✅ Migração concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        process.exit(1);
    }
}

migrateEnumToString();
