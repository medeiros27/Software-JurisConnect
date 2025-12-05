
const { Sequelize } = require('sequelize');
const config = require('./src/config/database');
const env = 'development';
const dbConfig = config[env];

// Connect to 'jurisconnect' db
const sequelize = new Sequelize(
    'jurisconnect',
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: false
    }
);

async function checkJurisconnectDb() {
    try {
        // List tables
        const [tables] = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
        console.log('Tables raw result:', JSON.stringify(tables, null, 2));
        if (tables && tables.length > 0) {
            tables.forEach(t => console.log(`- ${t.table_name}`));
        }

        // Try to query Demanda or Demandas if exists
        const demandaTable = tables.find(t => t.table_name.toLowerCase().includes('demanda'));
        if (demandaTable) {
            const tableName = demandaTable.table_name;
            console.log(`Checking table: ${tableName}`);
            const [results] = await sequelize.query(
                `SELECT count(*) as count FROM "${tableName}"`
            );
            console.log(`Total count in ${tableName}: ${results[0].count}`);

            // Check for recent items if column exists
            try {
                const [recent] = await sequelize.query(
                    `SELECT * FROM "${tableName}" LIMIT 1`
                );
                if (recent.length > 0) {
                    const cols = Object.keys(recent[0]);
                    const dateCol = cols.find(c => c.includes('data') || c.includes('created'));
                    if (dateCol) {
                        const [items] = await sequelize.query(
                            `SELECT * FROM "${tableName}" ORDER BY "${dateCol}" DESC LIMIT 5`
                        );
                        console.log(`Latest items in ${tableName} (by ${dateCol}):`);
                        items.forEach(i => console.log(JSON.stringify(i)));
                    }
                }
            } catch (e) {
                console.log('Error checking recent items:', e.message);
            }
        }

    } catch (error) {
        console.error('Error checking jurisconnect db:', error);
    } finally {
        await sequelize.close();
    }
}

checkJurisconnectDb();
