import http from 'k6/http';
import { check, sleep } from 'k6';

// Teste de soak (resistência) - carga constante por período prolongado
export const options = {
    stages: [
        { duration: '5m', target: 50 },    // Ramp-up
        { duration: '2h', target: 50 },    // Manter por 2 horas
        { duration: '5m', target: 0 },     // Ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
        // Verificar vazamento de memória
        'http_req_duration{type:api}': ['p(99)<1000'],
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

    // Simular uso normal do sistema
    http.get(`${API_URL}/dashboard/kpis`, { headers });
    sleep(2);

    http.get(`${API_URL}/demandas?page=1&limit=10`, { headers });
    sleep(3);

    http.get(`${API_URL}/clientes?page=1&limit=10`, { headers });
    sleep(2);

    http.get(`${API_URL}/health`, { headers });
    sleep(5);
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
