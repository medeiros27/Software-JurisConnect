const { Demanda } = require('./src/models');

async function checkCounts() {
    try {
        const total = await Demanda.count();
        console.log('--- DATABASE COUNTS ---');
        console.log(`Total Demandas: ${total}`);
        console.log('-----------------------');

        // List first 5 to see structure
        const first5 = await Demanda.findAll({ limit: 5 });
        console.log('First 5 IDs:', first5.map(d => d.id));
        console.log('First 5 Statuses:', first5.map(d => d.status));

    } catch (error) {
        console.error('Error checking counts:', error);
    } finally {
        process.exit();
    }
}

checkCounts();
