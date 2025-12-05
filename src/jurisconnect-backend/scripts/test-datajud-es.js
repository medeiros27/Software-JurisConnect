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
    // Hypothesis: Use direct ElasticSearch endpoint
    const url = 'https://api-publica.datajud.cnj.jus.br/api_publica_trt3/_search';

    console.log(`Testing ${url}`);

    const payload = {
        query: {
            match: {
                numeroProcesso: processo
            }
        }
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Authorization': `APIKey ${API_KEY}`, 'Content-Type': 'application/json' }
        });
        console.log('✅ SUCESSO! Status:', response.status);
        console.log('Hits:', response.data.hits.total.value);
        if (response.data.hits.hits.length > 0) {
            console.log('Source:', response.data.hits.hits[0]._source.dadosBasicos.numero);
        }
    } catch (error) {
        console.log(`❌ Error: ${error.response ? error.response.status : error.message}`);
        if (error.response) console.log(JSON.stringify(error.response.data));
    }
}
run();
