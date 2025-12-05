
const { Sequelize } = require('sequelize');
const config = require('./src/config/database');
const env = 'development';
const dbConfig = config[env];

// Connect to 'postgres' default db to list other dbs
const sequelize = new Sequelize(
    'postgres',
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
    }
);

async function listDatabases() {
    try {
        const [results] = await sequelize.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        console.log('Databases found:');
        results.forEach(r => console.log(`- ${r.datname}`));
    } catch (error) {
        console.error('Error listing databases:', error);
    } finally {
        await sequelize.close();
    }
}

listDatabases();
