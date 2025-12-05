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

async function run() {
    const processo = '00126490720255030165';
    // Testing TRT03 (2 digits)
    const url = 'https://api-publica.datajud.cnj.jus.br/api_publica_trt03/api/v1/processos/pesquisar';

    console.log(`Testing ${url}`);
    try {
        const response = await axios.post(url, {
            query: { match: { numeroProcesso: processo } }
        }, {
            headers: { 'Authorization': `APIKey ${API_KEY}`, 'Content-Type': 'application/json' }
        });
        console.log('✅ Status:', response.status);
    } catch (error) {
        console.log(`❌ Error: ${error.response ? error.response.status : error.message}`);
        if (error.response) console.log(JSON.stringify(error.response.data));
    }
}
run();
