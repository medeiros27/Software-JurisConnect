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

console.log('Testando DataJud com API Key:', API_KEY ? 'Encontrada' : 'NÃO ENCONTRADA');

async function testUrl(url, processo) {
    console.log(`\n--- Testando ${url} ---`);
    console.log(`Processo: ${processo}`);

    try {
        const response = await axios.post(url, {
            query: {
                match: {
                    numeroProcesso: processo
                }
            }
        }, {
            headers: {
                'Authorization': `APIKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ SUCESSO! Status:', response.status);
        console.log('Items:', response.data.length);
        if (response.data.length > 0) {
            console.log('Dado encontrado:', response.data[0].dadosBasicos.classeProcessual.nome);
        }

    } catch (error) {
        console.error('❌ ERRO:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Msg:', JSON.stringify(error.response.data));
        } else {
            console.error(error.message);
        }
    }
}

async function run() {
    const processo = '00126490720255030165'; // TRT3

    // Variations
    // TRT3 muitas vezes é chato. Vamos tentar com e sem zero.
    // E vamos tentar também outro processo se esse falhar, mas o erro 400 indica url errada geralmente.

    await testUrl('https://api-publica.datajud.cnj.jus.br/api_publica_trt3/api/v1/processos/pesquisar', processo);
    await testUrl('https://api-publica.datajud.cnj.jus.br/api_publica_trt03/api/v1/processos/pesquisar', processo);
}

run();
