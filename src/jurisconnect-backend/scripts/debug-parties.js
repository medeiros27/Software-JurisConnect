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
const URL = 'https://api-publica.datajud.cnj.jus.br/api_publica_trt2/_search';
const PROCESSO = '10018891120245020402';

async function run() {
    try {
        const response = await axios.post(URL, {
            query: { match: { numeroProcesso: PROCESSO } }
        }, {
            headers: { 'Authorization': `APIKey ${API_KEY}`, 'Content-Type': 'application/json' }
        });

        if (response.data.hits?.hits?.length > 0) {
            console.log('--- RAW JSON OUTPUT START ---');
            console.log(JSON.stringify(response.data.hits.hits[0]._source, null, 2));
            console.log('--- RAW JSON OUTPUT END ---');
        } else {
            console.log('Nenhum resultado found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}
run();
