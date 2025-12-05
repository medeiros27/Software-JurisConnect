require('dotenv').config();
const { Sequelize, Op } = require('sequelize');
const dbConfig = require('./src/config/database').development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    dialect: 'postgres',
    logging: false
});

const Pagamento = require('./src/models/pagamento')(sequelize, Sequelize.DataTypes);
const Demanda = require('./src/models/demanda')(sequelize, Sequelize.DataTypes);

// Configurar associações se não estiverem definidas nos arquivos de modelo
if (!Pagamento.associations.demanda) {
    Pagamento.belongsTo(Demanda, { foreignKey: 'demanda_id', as: 'demanda' });
}

async function debugFinance() {
    try {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const inicio = new Date(anoAtual, mesAtual, 1);
        const fim = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59);

        console.log(`Investigando pagamentos entre ${inicio.toISOString()} e ${fim.toISOString()}`);

        const pagamentos = await Pagamento.findAll({
            where: {
                tipo: 'receber',
                status: 'pago',
                data_pagamento: { [Op.between]: [inicio, fim] },
                [Op.or]: [
                    { demanda_id: null },
                    { '$demanda.id$': { [Op.ne]: null } }
                ]
            },
            include: [{
                model: Demanda,
                as: 'demanda',
                required: false,
                where: { status: { [Op.ne]: 'cancelada' } }
            }],
            raw: true,
            nest: true
        });

        console.log(`Encontrados ${pagamentos.length} pagamentos.`);

        let total = 0;
        pagamentos.forEach(p => {
            console.log(`ID: ${p.id} | Valor: ${p.valor} | DemandaID: ${p.demanda_id} | DemandaStatus: ${p.demanda?.status || 'N/A'} | Desc: ${p.descricao}`);
            total += parseFloat(p.valor);
        });

        console.log(`Total calculado: ${total}`);

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await sequelize.close();
    }
}

debugFinance();
