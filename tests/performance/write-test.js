import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Carregar dados de teste
const demandas = new SharedArray('demandas', function () {
    return JSON.parse(open('./data/demandas.json'));
});

// Teste de criação de demandas (operação de escrita)
export const options = {
    stages: [
        { duration: '1m', target: 10 },
        { duration: '3m', target: 30 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // Escrita pode ser mais lenta
        http_req_failed: ['rate<0.01'],
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

    // Criar demanda
    const demanda = demandas[Math.floor(Math.random() * demandas.length)];

    const createRes = http.post(
        `${API_URL}/demandas`,
        JSON.stringify(demanda),
        { headers }
    );

    const success = check(createRes, {
        'demanda criada': (r) => r.status === 201,
        'tem ID': (r) => r.json('data.id') !== undefined,
    });

    if (success) {
        const demandaId = createRes.json('data.id');

        // Atualizar demanda
        sleep(1);
        http.put(
            `${API_URL}/demandas/${demandaId}`,
            JSON.stringify({ status: 'em_andamento' }),
            { headers }
        );

        // Buscar demanda
        sleep(1);
        http.get(`${API_URL}/demandas/${demandaId}`, { headers });

        // Deletar demanda (cleanup)
        sleep(1);
        http.del(`${API_URL}/demandas/${demandaId}`, { headers });
    }

    sleep(2);
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
