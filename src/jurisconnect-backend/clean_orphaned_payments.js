require('dotenv').config();
const { Sequelize, Op } = require('sequelize');
const dbConfig = require('./src/config/database').development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'postgres',
    logging: false
});

const Pagamento = require('./src/models/pagamento')(sequelize, Sequelize.DataTypes);

async function cleanOrphans() {
    try {
        console.log('Iniciando limpeza de pagamentos órfãos (demanda_id IS NULL)...');

        const result = await Pagamento.destroy({
            where: {
                demanda_id: null
            }
        });

        console.log(`Removidos ${result} pagamentos órfãos.`);

    } catch (error) {
        console.error('Erro ao limpar pagamentos:', error);
    } finally {
        await sequelize.close();
    }
}

cleanOrphans();
