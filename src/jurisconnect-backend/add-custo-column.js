require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./src/config/database.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: console.log
});

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const query = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'demandas' AND column_name = 'valor_custo') THEN
          ALTER TABLE demandas ADD COLUMN valor_custo DECIMAL(10, 2) DEFAULT 0;
          RAISE NOTICE 'Column valor_custo added';
        ELSE
          RAISE NOTICE 'Column valor_custo already exists';
        END IF;
      END
      $$;
    `;

        await sequelize.query(query);
        console.log('Migration script executed successfully.');

    } catch (error) {
        console.error('Unable to connect to the database or execute query:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
