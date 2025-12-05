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
    // Processo que retornou campos vazios
    const numeroProcesso = '00003859020255050491';
    const tribunalCode = '05'; // TRT5 (conforme numero)

    const url = `https://api-publica.datajud.cnj.jus.br/api_publica_trt${parseInt(tribunalCode)}/_search`;

    console.log(`Debug URL: ${url}`);

    try {
        const response = await axios.post(url, {
            query: {
                match: {
                    numeroProcesso: numeroProcesso
                }
            }
        }, {
            headers: {
                'Authorization': `APIKey ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.hits && response.data.hits.hits.length > 0) {
            console.log('--- RAW JSON OUTPUT START ---');
            console.log(JSON.stringify(response.data.hits.hits[0]._source, null, 2));
            console.log('--- RAW JSON OUTPUT END ---');
        } else {
            console.log('Nenhum resultado encontrado.');
        }

    } catch (error) {
        console.error('Erro:', error.message);
    }
}

run();
