
const { Demanda, Cliente, Correspondente, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function analyzeCleanup() {
    try {
        console.log('Analyzing Cleanup...');

        // 1. Analyze Clientes
        const clientes = await Cliente.findAll({
            include: [{ model: Demanda, as: 'demandas', attributes: ['id'] }]
        });

        const clienteOrphans = clientes.filter(c => c.demandas.length === 0);
        console.log(`Total Clientes: ${clientes.length}`);
        console.log(`Orphan Clientes (No Demanda): ${clienteOrphans.length}`);

        // Check duplicates by name
        const clienteNames = {};
        let clienteDuplicates = 0;
        clientes.forEach(c => {
            const name = c.nome_fantasia || c.razao_social || 'UNKNOWN';
            if (clienteNames[name]) clienteDuplicates++;
            else clienteNames[name] = true;
        });
        console.log(`Potential Duplicate Clientes (by Name): ${clienteDuplicates}`);


        // 2. Analyze Correspondentes
        const correspondentes = await Correspondente.findAll({
            include: [{ model: Demanda, as: 'demandas', attributes: ['id'] }]
        });

        const correspOrphans = correspondentes.filter(c => c.demandas.length === 0);
        console.log(`Total Correspondentes: ${correspondentes.length}`);
        console.log(`Orphan Correspondentes (No Demanda): ${correspOrphans.length}`);

        // Check duplicates by name
        const correspNames = {};
        let correspDuplicates = 0;
        correspondentes.forEach(c => {
            const name = c.nome_fantasia || c.razao_social || 'UNKNOWN';
            if (correspNames[name]) correspDuplicates++;
            else correspNames[name] = true;
        });
        console.log(`Potential Duplicate Correspondentes (by Name): ${correspDuplicates}`);

    } catch (error) {
        console.error('Error analyzing:', error);
    } finally {
        await sequelize.close();
    }
}

analyzeCleanup();
