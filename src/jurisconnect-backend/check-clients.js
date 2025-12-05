const { Demanda, Cliente } = require('./src/models');

async function checkClients() {
    try {
        // Buscar todos os clientes que contêm "Bruno"
        const clientes = await Cliente.findAll({
            where: {
                nome_fantasia: {
                    [require('sequelize').Op.iLike]: '%bruno%'
                }
            },
            limit: 10
        });

        console.log(`\nClientes encontrados com 'bruno' no nome: ${clientes.length}`);
        clientes.forEach(c => {
            console.log(`- ID: ${c.id}, Nome: ${c.nome_fantasia}`);
        });

        // Agora verificar quantas demandas existem para esses clientes
        if (clientes.length > 0) {
            const clienteIds = clientes.map(c => c.id);
            const demandas = await Demanda.count({
                where: {
                    cliente_id: {
                        [require('sequelize').Op.in]: clienteIds
                    }
                }
            });
            console.log(`\nTotal de demandas desses clientes: ${demandas}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Erro:', error.message);
        process.exit(1);
    }
}

checkClients();
