const axios = require('axios');

async function testAPI() {
    try {
        // Primeiro, fazer login
        console.log('1. Fazendo login...');
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@jurisconnect.com',
            senha: 'admin123'
        });

        const token = loginRes.data.data.accessToken;
        console.log('✓ Login realizado com sucesso');

        // Agora testar a busca
        console.log('\n2. Testando busca por "Bruno Magalhães"...');
        const searchRes = await axios.get('http://localhost:3001/api/v1/demandas', {
            params: {
                search: 'Bruno Magalhães',
                page: 1,
                limit: 20
            },
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✓ Requisição bem-sucedida!');
        console.log('  Total de demandas encontradas:', searchRes.data.data.demandas?.length || 0);
        console.log('  Total no banco:', searchRes.data.data.pagination?.total || 0);

        if (searchRes.data.data.demandas && searchRes.data.data.demandas.length > 0) {
            console.log('\n  Primeiras 3 demandas:');
            searchRes.data.data.demandas.slice(0, 3).forEach(d => {
                console.log(`  - ${d.numero}: Cliente = ${d.cliente?.nome_fantasia || 'N/A'}`);
            });
        } else {
            console.log('\n  ❌ API retornou 0 demandas!');
        }

    } catch (error) {
        if (error.response) {
            console.error('❌ Erro HTTP:', error.response.status);
            console.error('   Mensagem:', error.response.data);
        } else {
            console.error('❌ Erro:', error.message);
        }
    }
}

testAPI();
