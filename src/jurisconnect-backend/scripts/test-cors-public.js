const https = require('https');

const options = {
    hostname: 'api.jurisconnect.com.br',
    port: 443,
    path: '/api/v1/auth/login',
    method: 'OPTIONS',
    headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);

    if (res.headers['access-control-allow-origin'] === 'http://localhost:5173') {
        console.log('✅ PASS: Cloudflare returned CORS Header.');
    } else {
        console.log('❌ FAIL: Cloudflare response missing CORS Header.');
    }
});

req.on('error', (e) => {
    console.error(`❌ ERROR: Could not connect to Cloudflare: ${e.message}`);
});

req.end();
