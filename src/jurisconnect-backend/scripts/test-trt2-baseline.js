const axios = require('axios');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) envVars[key.trim()] = val.trim();
});

const API_KEY = envVars['DATAJUD_API_KEY'];

async function testUrl(url, processo) {
    console.log(`Testing ${url}`);
    try {
        const response = await axios.post(url, {
            query: { match: { numeroProcesso: processo } }
        }, {
            headers: { 'Authorization': `APIKey ${API_KEY}`, 'Content-Type': 'application/json' }
        });
        console.log('✅ SUCESSO! Status:', response.status);
    } catch (error) {
        console.log(`❌ Error: ${error.response ? error.response.status : error.message}`);
    }
}

async function run() {
    // TRT2 Process
    const processo = '10005267220245020007';
    await testUrl('https://api-publica.datajud.cnj.jus.br/api_publica_trt2/api/v1/processos/pesquisar', processo);
    await testUrl('https://api-publica.datajud.cnj.jus.br/api_publica_trt02/api/v1/processos/pesquisar', processo);
}
run();
