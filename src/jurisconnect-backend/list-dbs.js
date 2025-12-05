const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('postgres', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

async function listDatabases() {
    try {
        const [results, metadata] = await sequelize.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
        console.log('--- AVAILABLE DATABASES ---');
        results.forEach(db => {
            console.log(db.datname);
        });
        console.log('---------------------------');
    } catch (error) {
        console.error('Error listing databases:', error);
    } finally {
        await sequelize.close();
    }
}

listDatabases();
