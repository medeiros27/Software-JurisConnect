const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'OPTIONS',
    headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);

    if (res.headers['access-control-allow-origin'] === 'http://localhost:5173') {
        console.log('✅ PASS: CORS Header present and correct.');
    } else {
        console.log('❌ FAIL: CORS Header missing or incorrect.');
    }
});

req.on('error', (e) => {
    console.error(`❌ ERROR: Could not connect to server: ${e.message}`);
    console.log('Make sure the server is running on port 3001!');
});

req.end();
