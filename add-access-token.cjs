require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { sequelize } = require('./src/jurisconnect-backend/src/models');

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados.');

        const queryInterface = sequelize.getQueryInterface();

        // Check if column exists
        const tableInfo = await queryInterface.describeTable('demandas');
        if (tableInfo.access_token) {
            console.log('Coluna access_token já existe.');
        } else {
            console.log('Adicionando coluna access_token...');
            await queryInterface.addColumn('demandas', 'access_token', {
                type: sequelize.Sequelize.STRING,
                allowNull: true,
                unique: true
            });
            console.log('Coluna adicionada com sucesso.');
        }

    } catch (error) {
        console.error('Erro na migração:', error);
    } finally {
        await sequelize.close();
    }
})();
