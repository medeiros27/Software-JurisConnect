import http from 'k6/http';
import { check, sleep } from 'k6';

// Teste de breakpoint - encontrar o ponto de quebra do sistema
export const options = {
    executor: 'ramping-arrival-rate',
    startRate: 50,
    timeUnit: '1s',
    preAllocatedVUs: 500,
    maxVUs: 1000,
    stages: [
        { duration: '2m', target: 50 },    // 50 req/s
        { duration: '5m', target: 100 },   // 100 req/s
        { duration: '5m', target: 200 },   // 200 req/s
        { duration: '5m', target: 300 },   // 300 req/s
        { duration: '5m', target: 400 },   // 400 req/s
        { duration: '5m', target: 500 },   // 500 req/s
    ],
    thresholds: {
        http_req_failed: ['rate<0.5'], // Permitir até 50% de falhas
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

export default function () {
    const endpoints = [
        `${API_URL}/health`,
        `${API_URL}/dashboard/kpis`,
        `${API_URL}/demandas?page=1&limit=10`,
        `${API_URL}/clientes?page=1&limit=10`,
    ];

    // Escolher endpoint aleatório
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

    const res = http.get(endpoint);

    check(res, {
        'status 200': (r) => r.status === 200,
        'response time < 5s': (r) => r.timings.duration < 5000,
    });
}
