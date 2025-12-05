const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');
const {
    generateTestToken,
    createTestUser,
    createTestCliente,
    createTestCorrespondente,
    createTestDemanda
} = require('../helpers');

describe('Demandas Integration Tests', () => {
    let authToken;
    let testCliente;
    let testCorrespondente;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        const { Usuario, Cliente, Correspondente } = sequelize.models;

        const user = await createTestUser(Usuario);
        authToken = generateTestToken(user.id, user.perfil);

        testCliente = await createTestCliente(Cliente);
        testCorrespondente = await createTestCorrespondente(Correspondente);
    });

    describe('POST /api/v1/demandas', () => {
        it('deve criar nova demanda com dados válidos', async () => {
            const novaDemanda = {
                cliente_id: testCliente.id,
                correspondente_id: testCorrespondente.id,
                titulo: 'Nova Demanda Teste',
                descricao: 'Descrição da demanda',
                tipo_demanda: 'judicial',
                status: 'pendente',
                prioridade: 'alta',
                data_abertura: new Date().toISOString()
            };

            const response = await request(app)
                .post('/api/v1/demandas')
                .set('Authorization', `Bearer ${authToken}`)
                .send(novaDemanda);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.titulo).toBe(novaDemanda.titulo);
        });

        it('deve validar campos obrigatórios', async () => {
            const response = await request(app)
                .post('/api/v1/demandas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
        });

        it('deve validar cliente_id existente', async () => {
            const response = await request(app)
                .post('/api/v1/demandas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    cliente_id: 99999,
                    correspondente_id: testCorrespondente.id,
                    titulo: 'Teste',
                    tipo_demanda: 'judicial',
                    status: 'pendente'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/demandas', () => {
        beforeEach(async () => {
            const { Demanda } = sequelize.models;
            // Criar algumas demandas de teste
            await createTestDemanda(Demanda, testCliente.id, testCorrespondente.id, {
                titulo: 'Demanda 1',
                status: 'pendente'
            });
            await createTestDemanda(Demanda, testCliente.id, testCorrespondente.id, {
                titulo: 'Demanda 2',
                status: 'em_andamento'
            });
        });

        it('deve listar todas as demandas', async () => {
            const response = await request(app)
                .get('/api/v1/demandas')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(2);
        });

        it('deve filtrar demandas por status', async () => {
            const response = await request(app)
                .get('/api/v1/demandas?status=pendente')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.every(d => d.status === 'pendente')).toBe(true);
        });

        it('deve paginar resultados', async () => {
            const response = await request(app)
                .get('/api/v1/demandas?page=1&limit=1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(1);
            expect(response.body).toHaveProperty('pagination');
        });
    });

    describe('PUT /api/v1/demandas/:id', () => {
        let demanda;

        beforeEach(async () => {
            const { Demanda } = sequelize.models;
            demanda = await createTestDemanda(
                Demanda,
                testCliente.id,
                testCorrespondente.id
            );
        });

        it('deve atualizar demanda existente', async () => {
            const updates = {
                titulo: 'Título Atualizado',
                status: 'em_andamento'
            };

            const response = await request(app)
                .put(`/api/v1/demandas/${demanda.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body.data.titulo).toBe(updates.titulo);
            expect(response.body.data.status).toBe(updates.status);
        });

        it('deve retornar 404 para demanda inexistente', async () => {
            const response = await request(app)
                .put('/api/v1/demandas/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ titulo: 'Teste' });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/v1/demandas/:id', () => {
        let demanda;

        beforeEach(async () => {
            const { Demanda } = sequelize.models;
            demanda = await createTestDemanda(
                Demanda,
                testCliente.id,
                testCorrespondente.id
            );
        });

        it('deve deletar demanda existente', async () => {
            const response = await request(app)
                .delete(`/api/v1/demandas/${demanda.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(204);

            // Verificar se foi deletado
            const checkResponse = await request(app)
                .get(`/api/v1/demandas/${demanda.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(checkResponse.status).toBe(404);
        });
    });
});
