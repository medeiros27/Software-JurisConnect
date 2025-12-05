
const { Sequelize } = require('sequelize');
const config = require('./src/config/database');
const env = 'development';
const dbConfig = config[env];

// Connect to 'postgres' db
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

async function checkPostgresDb() {
    try {
        // List tables
        const [tables] = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log('Tables raw result:', JSON.stringify(tables, null, 2));

        if (tables && tables.length > 0) {
            tables.forEach(t => console.log(`- ${t.table_name}`));

            // Check Demanda if exists
            const demandaTable = tables.find(t => t.table_name && t.table_name.toLowerCase().includes('demanda'));
            if (demandaTable) {
                const [results] = await sequelize.query(
                    `SELECT count(*) as count FROM "${demandaTable.table_name}"`
                );
                console.log(`Count in ${demandaTable.table_name}: ${results[0].count}`);
            }
        } else {
            console.log('No tables found.');
        }

    } catch (error) {
        console.error('Error checking postgres db:', error);
    } finally {
        await sequelize.close();
    }
}

checkPostgresDb();
