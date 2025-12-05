const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('jurisconnect', process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

const Demanda = sequelize.define('Demanda', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    // Don't define other columns to avoid mapping errors, just count
}, { tableName: 'demandas', timestamps: false, underscored: true });

async function checkDemands() {
    try {
        const count = await Demanda.count();
        // Raw query for latest date to avoid model mapping issues
        const [results] = await sequelize.query('SELECT created_at FROM demandas ORDER BY created_at DESC LIMIT 1');

        console.log('--- DEMANDS IN JURISCONNECT DB ---');
        console.log(`Total Count: ${count}`);
        if (results && results.length > 0) {
            console.log(`Latest Created At: ${results[0].created_at}`);
        }
        console.log('----------------------------------');
    } catch (error) {
        console.error('Error checking demands:', error);
    } finally {
        await sequelize.close();
    }
}

checkDemands();
