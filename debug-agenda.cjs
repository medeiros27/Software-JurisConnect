const { sequelize, Agenda, Demanda, Cliente, Correspondente } = require('./src/jurisconnect-backend/src/models');
const { Op } = require('sequelize');

async function testAgenda() {
    try {
        console.log('Autenticando banco de dados...');
        await sequelize.authenticate();
        console.log('Conexão estabelecida.');

        const start = '2025-01-01';
        const end = '2025-12-31';

        console.log('Buscando Demandas...');
        const demandas = await Demanda.findAll({
            where: {
                data_prazo: {
                    [Op.between]: [start, end]
                }
            },
            include: [
                { model: Cliente, as: 'cliente', attributes: ['nome_fantasia'] },
                { model: Correspondente, as: 'correspondente', attributes: ['nome_fantasia'] }
            ]
        });
        console.log(`Demandas encontradas: ${demandas.length}`);

        console.log('Buscando Agenda...');
        const eventosAgenda = await Agenda.findAll({
            where: {
                data_evento: {
                    [Op.between]: [start, end]
                }
            },
            include: [
                { model: Demanda, as: 'demanda', attributes: ['titulo', 'numero'] }
            ]
        });
        console.log(`Eventos Agenda encontrados: ${eventosAgenda.length}`);

    } catch (error) {
        console.error('ERRO DETALHADO:', error);
    } finally {
        await sequelize.close();
    }
}

testAgenda();
