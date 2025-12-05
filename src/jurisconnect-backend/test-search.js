const { Demanda, Cliente, Correspondente } = require('./src/models');
const { Op } = require('sequelize');

async function testSearch() {
    try {
        const search = 'bruno'; // Coloque o nome do cliente aqui

        const result = await Demanda.findAll({
            where: {
                [Op.or]: [
                    { numero: { [Op.iLike]: `%${search}%` } },
                    { titulo: { [Op.iLike]: `%${search}%` } },
                    { descricao: { [Op.iLike]: `%${search}%` } },
                    { cidade: { [Op.iLike]: `%${search}%` } },
                    { estado: { [Op.iLike]: `%${search}%` } },
                    { '$correspondente.nome_fantasia$': { [Op.iLike]: `%${search}%` } },
                    { '$correspondente.razao_social$': { [Op.iLike]: `%${search}%` } },
                    { '$cliente.nome_fantasia$': { [Op.iLike]: `%${search}%` } },
                    { '$cliente.razao_social$': { [Op.iLike]: `%${search}%` } },
                ]
            },
            include: [
                { association: 'cliente', attributes: ['id', 'nome_fantasia', 'razao_social'] },
                { association: 'correspondente', attributes: ['id', 'nome_fantasia', 'razao_social', 'celular', 'telefone'] },
            ],
            limit: 5
        });

        console.log(`\nEncontradas ${result.length} demandas:`);
        result.forEach(d => {
            console.log(`- Demanda ${d.numero}: Cliente = ${d.cliente?.nome_fantasia || 'N/A'}, Cidade = ${d.cidade || 'N/A'}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Erro ao testar busca:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testSearch();
