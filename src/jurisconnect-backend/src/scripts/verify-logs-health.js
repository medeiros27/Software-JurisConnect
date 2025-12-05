const logger = require('../utils/logger');
const HealthController = require('../controllers/HealthController');
const fs = require('fs');
const path = require('path');

async function verify() {
    console.log('--- Verifying Logger ---');
    logger.info('Test info log');
    logger.error('Test error log');

    // Give some time for async file writes
    await new Promise(resolve => setTimeout(resolve, 1000));

    const logDir = path.join(__dirname, '../../logs');
    if (fs.existsSync(logDir)) {
        const files = fs.readdirSync(logDir);
        console.log('Log files found:', files);
        if (files.some(f => f.includes('combined')) && files.some(f => f.includes('error'))) {
            console.log('✅ Log rotation files created.');
        } else {
            console.error('❌ Log files missing.');
        }
    } else {
        console.error('❌ Log directory not found.');
    }

    console.log('\n--- Verifying Health Controller ---');
    const req = {};
    const res = {
        status: (code) => {
            console.log(`Response Status: ${code}`);
            return res;
        },
        json: (data) => {
            console.log('Response Data:', JSON.stringify(data, null, 2));
            return res;
        }
    };

    try {
        await HealthController.check(req, res);
        console.log('✅ Health check executed (DB status might be DOWN if no connection, but controller works).');
    } catch (error) {
        console.error('❌ Health check failed unexpectedly:', error);
    }
}

verify();
