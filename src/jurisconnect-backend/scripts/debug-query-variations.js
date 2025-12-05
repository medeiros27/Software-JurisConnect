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
// Known existing process from previous match_all debug
const PROCESSO = '10018891120245020402';

async function testQuery(name, queryBody) {
    console.log(`Testing Query: ${name}`);
    // console.log(JSON.stringify(queryBody, null, 2));
    try {
        const response = await axios.post(URL, { query: queryBody }, {
            headers: { 'Authorization': `APIKey ${API_KEY}`, 'Content-Type': 'application/json' }
        });
        const hits = response.data.hits?.total?.value || 0;
        console.log(`Hits: ${hits}`);
        if (hits > 0) {
            console.log('✅ SUCCESS!');
            // Log the source to see structure again if needed
            // console.log(response.data.hits.hits[0]._source);
        } else {
            console.log('❌ Failed');
        }
        console.log('---');
    } catch (error) {
        console.log(`❌ Error: ${error.response ? error.response.status : error.message}`);
        console.log('---');
    }
}

async function run() {
    // Variation 1: Existing logic
    await testQuery('match numeroProcesso', { match: { numeroProcesso: PROCESSO } });

    // Variation 2: term (exact)
    await testQuery('term numeroProcesso', { term: { numeroProcesso: PROCESSO } });

    // Variation 3: term keyword
    await testQuery('term numeroProcesso.keyword', { term: { "numeroProcesso.keyword": PROCESSO } });

    // Variation 4: match_phrase
    await testQuery('match_phrase numeroProcesso', { match_phrase: { numeroProcesso: PROCESSO } });

    // Variation 5: query_string (lucene syntax)
    await testQuery('query_string', { query_string: { query: `numeroProcesso:${PROCESSO}` } });

    // Variation 6: nested dadosBasicos (unlikely given previous debug but verifying)
    await testQuery('match dadosBasicos.numero', { match: { "dadosBasicos.numero": PROCESSO } });
}

run();
