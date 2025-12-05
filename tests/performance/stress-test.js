import http from 'k6/http';
import { check, sleep } from 'k6';

// Teste de stress - aumenta carga gradualmente até quebrar
export const options = {
    stages: [
        { duration: '2m', target: 100 },   // Ramp-up para 100 usuários
        { duration: '5m', target: 200 },   // Aumentar para 200
        { duration: '5m', target: 300 },   // Aumentar para 300
        { duration: '5m', target: 400 },   // Aumentar para 400
        { duration: '5m', target: 500 },   // Aumentar para 500
        { duration: '10m', target: 500 },  // Manter em 500
        { duration: '3m', target: 0 },     // Ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(99)<3000'], // 99% < 3s (mais tolerante)
        http_req_failed: ['rate<0.05'],    // < 5% de falhas
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

export default function () {
    const token = login();
    if (!token) return;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // Simular carga pesada
    http.batch([
        ['GET', `${API_URL}/demandas?page=1&limit=50`, null, { headers }],
        ['GET', `${API_URL}/clientes?page=1&limit=50`, null, { headers }],
        ['GET', `${API_URL}/financeiro?page=1&limit=50`, null, { headers }],
        ['GET', `${API_URL}/dashboard/kpis`, null, { headers }],
    ]);

    sleep(1);
}

function login() {
    const res = http.post(
        `${API_URL}/auth/login`,
        JSON.stringify({
            email: 'admin@jurisconnect.com',
            senha: 'admin123',
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    return res.status === 200 ? res.json('token') : null;
}
