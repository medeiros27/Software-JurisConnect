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

async function inspectIndex() {
    const url = 'https://api-publica.datajud.cnj.jus.br/api_publica_trt2/_search';
    console.log(`Inspecting ${url}`);

    try {
        const response = await axios.post(url, {
            size: 1,
            query: { match_all: {} }
        }, {
            headers: { 'Authorization': `APIKey ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        if (response.data.hits?.hits?.length > 0) {
            const sample = response.data.hits.hits[0]._source;
            console.log('✅ Index Sample Found:');
            console.log('NumeroProcesso:', sample.numeroProcesso);
            console.log('DadosBasicos.Numero:', sample.dadosBasicos?.numero);
        } else {
            console.log('⚠️ Index is empty or inaccessible.');
        }
    } catch (error) {
        console.log(`❌ Error: ${error.response ? error.response.status : error.message}`);
    }
}

inspectIndex();
