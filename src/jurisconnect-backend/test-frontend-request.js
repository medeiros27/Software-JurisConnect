const axios = require('axios');

async function testFrontendRequest() {
    try {
        console.log('Simulando requisição do frontend...\n');

        const response = await axios.get('http://localhost:5000/api/demandas', {
            params: {
                search: 'Bruno Magalhães',
                page: 1,
                limit: 20
            },
            headers: {
                'Authorization': 'Bearer seu-token-aqui' // Você pode precisar adicionar um token válido
            }
        });

        console.log('Status:', response.status);
        console.log('Total de demandas:', response.data.data.demandas?.length || 0);
        console.log('Total no banco:', response.data.data.pagination?.total || 0);

        if (response.data.data.demandas && response.data.data.demandas.length > 0) {
            console.log('\nPrimeiras 3 demandas:');
            response.data.data.demandas.slice(0, 3).forEach(d => {
                console.log(`- ${d.numero}: Cliente = ${d.cliente?.nome_fantasia || 'N/A'}`);
            });
        } else {
            console.log('\nNenhuma demanda encontrada!');
        }

    } catch (error) {
        if (error.response) {
            console.error('Erro HTTP:', error.response.status);
            console.error('Mensagem:', error.response.data);
        } else {
            console.error('Erro:', error.message);
        }
    }
}

testFrontendRequest();
