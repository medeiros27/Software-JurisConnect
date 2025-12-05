import http from 'k6/http';
import { check, sleep } from 'k6';

// Teste de spike - pico súbito de carga
export const options = {
    stages: [
        { duration: '10s', target: 10 },    // Carga normal
        { duration: '1m', target: 500 },    // Spike súbito!
        { duration: '3m', target: 500 },    // Manter spike
        { duration: '10s', target: 10 },    // Voltar ao normal
        { duration: '3m', target: 10 },     // Recuperação
        { duration: '10s', target: 0 },     // Ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% < 2s
        http_req_failed: ['rate<0.1'],     // < 10% de falhas
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

export default function () {
    // Simular usuário fazendo login e buscando dados
    const loginRes = http.post(
        `${API_URL}/auth/login`,
        JSON.stringify({
            email: 'admin@jurisconnect.com',
            senha: 'admin123',
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(loginRes, {
        'login ok': (r) => r.status === 200,
    });

    if (loginRes.status !== 200) {
        sleep(1);
        return;
    }

    const token = loginRes.json('token');
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // Buscar dashboard
    const dashRes = http.get(`${API_URL}/dashboard/kpis`, { headers });
    check(dashRes, { 'dashboard ok': (r) => r.status === 200 });

    sleep(0.5);
}
