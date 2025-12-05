const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sequelize } = require('./src/models');

async function reset() {
    try {
        console.log('Forcing database sync (DROP + CREATE)...');
        await sequelize.sync({ force: true });
        console.log('Database synced successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing database:', error);
        process.exit(1);
    }
}

reset();
