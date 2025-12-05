const { Cliente, Correspondente, Demanda, sequelize } = require('../models');

const verify = async () => {
    try {
        await sequelize.authenticate();
        const clientesCount = await Cliente.count();
        const correspondentesCount = await Correspondente.count();
        const demandasCount = await Demanda.count();

        console.log('--- Resumo da Importação ---');
        console.log(`Clientes: ${clientesCount}`);
        console.log(`Correspondentes: ${correspondentesCount}`);
        console.log(`Demandas: ${demandasCount}`);
    } catch (error) {
        console.error('Erro ao verificar:', error);
    } finally {
        await sequelize.close();
    }
};

verify();
