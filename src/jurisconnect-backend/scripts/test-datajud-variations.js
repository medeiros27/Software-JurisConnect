const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ler .env manualmente
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) envVars[key.trim()] = val.trim();
});

const API_KEY = envVars['DATAJUD_API_KEY'];

async function testUrl(url, processo) {
    console.log(`\nTesting: ${url}`);
    try {
        const response = await axios.post(url, {
            query: { match: { numeroProcesso: processo } }
        }, {
            headers: {
                'Authorization': `APIKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ SUCESSO! Status:', response.status);
        console.log('Items:', response.data.length);
    } catch (error) {
        console.log(`❌ FALHA (${error.response ? error.response.status : error.message})`);
        if (error.response && error.response.status !== 404) {
            console.log('Msg:', JSON.stringify(error.response.data));
        }
    }
}

async function run() {
    const processo = '01002235920205010061'; // TRT1

    // Variations
    await testUrl('https://api-publica.datajud.cnj.jus.br/api_publica_trt1/api/v1/processos/pesquisar', processo);
    await testUrl('https://api-publica.datajud.cnj.jus.br/api_publica_trt01/api/v1/processos/pesquisar', processo);
    await testUrl('https://api-publica.datajud.cnj.jus.br/api-publica-trt1/api/v1/processos/pesquisar', processo);
}

run();
