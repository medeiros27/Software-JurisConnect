import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas customizadas
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiCallsCounter = new Counter('api_calls');

// Configuração do teste de carga
export const options = {
    stages: [
        { duration: '1m', target: 10 },   // Warm-up: 10 usuários
        { duration: '3m', target: 50 },   // Ramp-up: 50 usuários
        { duration: '5m', target: 100 },  // Carga normal: 100 usuários
        { duration: '3m', target: 150 },  // Pico: 150 usuários
        { duration: '2m', target: 50 },   // Ramp-down: 50 usuários
        { duration: '1m', target: 0 },    // Cool-down
    ],
    thresholds: {
        // 95% das requisições devem ser < 500ms
        http_req_duration: ['p(95)<500'],
        // 99% das requisições devem ser < 1000ms
        'http_req_duration{type:api}': ['p(99)<1000'],
        // Taxa de erro deve ser < 1%
        errors: ['rate<0.01'],
        // Taxa de sucesso no login > 99%
        'checks{endpoint:login}': ['rate>0.99'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

// Dados de teste
const testUsers = [
    { email: 'admin@jurisconnect.com', senha: 'admin123' },
    { email: 'operador@jurisconnect.com', senha: 'operador123' },
    { email: 'cliente@jurisconnect.com', senha: 'cliente123' },
];

/**
 * Função auxiliar para fazer login
 */
function login(user) {
    const loginRes = http.post(
        `${API_URL}/auth/login`,
        JSON.stringify(user),
        {
            headers: { 'Content-Type': 'application/json' },
            tags: { endpoint: 'login' },
        }
    );

    const loginSuccess = check(loginRes, {
        'login status 200': (r) => r.status === 200,
        'login tem token': (r) => r.json('token') !== undefined,
    }, { endpoint: 'login' });

    errorRate.add(!loginSuccess);
    loginDuration.add(loginRes.timings.duration);

    return loginSuccess ? loginRes.json('token') : null;
}

/**
 * Cenário principal de teste
 */
export default function () {
    // 1. Login
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const token = login(user);

    if (!token) {
        sleep(1);
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    // 2. Buscar dashboard (KPIs)
    const dashboardRes = http.get(`${API_URL}/dashboard/kpis`, {
        headers,
        tags: { endpoint: 'dashboard', type: 'api' },
    });

    check(dashboardRes, {
        'dashboard status 200': (r) => r.status === 200,
        'dashboard response time < 300ms': (r) => r.timings.duration < 300,
    });

    apiCallsCounter.add(1);
    sleep(1);

    // 3. Listar demandas
    const demandasRes = http.get(`${API_URL}/demandas?page=1&limit=20`, {
        headers,
        tags: { endpoint: 'demandas', type: 'api' },
    });

    check(demandasRes, {
        'demandas status 200': (r) => r.status === 200,
        'demandas tem array': (r) => Array.isArray(r.json('data')),
    });

    apiCallsCounter.add(1);
    sleep(2);

    // 4. Listar clientes
    const clientesRes = http.get(`${API_URL}/clientes?page=1&limit=20`, {
        headers,
        tags: { endpoint: 'clientes', type: 'api' },
    });

    check(clientesRes, {
        'clientes status 200': (r) => r.status === 200,
    });

    apiCallsCounter.add(1);
    sleep(1);

    // 5. Buscar financeiro
    const financeiroRes = http.get(`${API_URL}/financeiro?page=1&limit=20`, {
        headers,
        tags: { endpoint: 'financeiro', type: 'api' },
    });

    check(financeiroRes, {
        'financeiro status 200': (r) => r.status === 200,
    });

    apiCallsCounter.add(1);
    sleep(2);

    // 6. Health check
    const healthRes = http.get(`${API_URL}/health`, {
        tags: { endpoint: 'health', type: 'api' },
    });

    check(healthRes, {
        'health status 200': (r) => r.status === 200,
        'health UP': (r) => r.json('status') === 'UP',
    });

    apiCallsCounter.add(1);
    sleep(1);
}

/**
 * Função executada ao final do teste
 */
export function handleSummary(data) {
    return {
        'summary.json': JSON.stringify(data),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';
    const enableColors = options.enableColors || false;

    let summary = `
${indent}Resumo do Teste de Carga
${indent}========================

${indent}Duração total: ${data.state.testRunDurationMs / 1000}s
${indent}VUs máximos: ${data.metrics.vus_max.values.max}

${indent}Requisições HTTP:
${indent}  Total: ${data.metrics.http_reqs.values.count}
${indent}  Taxa: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s
${indent}  Duração média: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms

${indent}Taxa de erro: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%
${indent}Checks passaram: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%
`;

    return summary;
}
