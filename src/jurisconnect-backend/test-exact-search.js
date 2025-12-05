const { Demanda, Cliente, Correspondente } = require('./src/models');
const { Op } = require('sequelize');

async function testExactSearch() {
    try {
        const search = 'Bruno Magalhães'; // Exatamente como você digitou

        console.log(`\nTestando busca por: "${search}"`);

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
                { association: 'correspondente', attributes: ['id', 'nome_fantasia', 'razao_social'] },
            ],
            limit: 10
        });

        console.log(`\nEncontradas ${result.length} demandas\n`);

        if (result.length > 0) {
            result.forEach(d => {
                console.log(`- ${d.numero}: Cliente = "${d.cliente?.nome_fantasia || 'N/A'}", Cidade = ${d.cidade || 'N/A'}`);
            });
        } else {
            console.log('Nenhuma demanda encontrada com essa busca.');
            console.log('\nVamos testar sem acento:');

            const searchSemAcento = 'Bruno Magalhaes';
            const result2 = await Demanda.findAll({
                where: {
                    [Op.or]: [
                        { '$cliente.nome_fantasia$': { [Op.iLike]: `%${searchSemAcento}%` } },
                    ]
                },
                include: [
                    { association: 'cliente', attributes: ['id', 'nome_fantasia'] },
                ],
                limit: 5
            });

            console.log(`\nCom "${searchSemAcento}": ${result2.length} demandas`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Erro:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testExactSearch();
