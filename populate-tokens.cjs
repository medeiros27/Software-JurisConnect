require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, sequelize, Sequelize } = require('./src/jurisconnect-backend/src/models');
const { randomUUID } = require('crypto');
const { Op } = Sequelize;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados.');

        // Find demands without access_token
        const demandasSemToken = await Demanda.findAll({
            where: {
                access_token: { [Op.is]: null }
            }
        });

        console.log(`Encontradas ${demandasSemToken.length} demandas sem token.`);

        let updatedCount = 0;
        for (const demanda of demandasSemToken) {
            await demanda.update({ access_token: randomUUID() });
            updatedCount++;
            if (updatedCount % 100 === 0) process.stdout.write('.');
        }

        console.log(`\nSucesso! ${updatedCount} demandas atualizadas com novos tokens.`);

    } catch (error) {
        console.error('Erro ao atualizar tokens:', error);
    } finally {
        await sequelize.close();
    }
})();
