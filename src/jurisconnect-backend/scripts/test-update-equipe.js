const jwt = require('jsonwebtoken');
const axios = require('axios');

async function testUpdateEquipe() {
    try {
        // 1. Generate Token
        console.log('Generating token...');
        const token = jwt.sign({ id: 9, role: 'admin' }, 'jurisconnect_secret_key_2024_very_secure', { expiresIn: '1h' });
        console.log('Got token:', token);

        // 2. Update Demanda
        const url = 'http://localhost:3001/api/v1/demandas/5766';
        const payload = {
            titulo: "Instrução - Presencial",
            tipo_demanda: "diligencia",
            cliente_id: 760,
            equipe: [
                {
                    id: 2047,
                    valor: 100.00,
                    status_pagamento: 'pago'
                }
            ]
        };

        console.log('Sending PUT request to', url);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        const response = await axios.put(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testUpdateEquipe();
