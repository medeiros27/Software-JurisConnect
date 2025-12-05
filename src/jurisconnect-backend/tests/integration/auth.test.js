const request = require('supertest');
const app = require('../../src/app'); // Assumindo que app é exportado separadamente do server
const { sequelize } = require('../../src/models');
const { generateTestToken, createTestUser } = require('../helpers');

describe('Auth Integration Tests', () => {
    let testUser;
    let authToken;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        // Criar usuário de teste
        const { Usuario } = sequelize.models;
        testUser = await createTestUser(Usuario, {
            email: 'auth@test.com',
            perfil: 'admin'
        });
        authToken = generateTestToken(testUser.id, testUser.perfil);
    });

    describe('POST /api/v1/auth/login', () => {
        it('deve fazer login com credenciais válidas', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'auth@test.com',
                    senha: 'senha123'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe('auth@test.com');
        });

        it('deve rejeitar login com senha incorreta', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'auth@test.com',
                    senha: 'senha_errada'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
        });

        it('deve rejeitar login com email inexistente', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'inexistente@test.com',
                    senha: 'senha123'
                });

            expect(response.status).toBe(401);
        });

        it('deve validar campos obrigatórios', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('deve retornar dados do usuário autenticado', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.user.id).toBe(testUser.id);
            expect(response.body.user.email).toBe(testUser.email);
        });

        it('deve rejeitar requisição sem token', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me');

            expect(response.status).toBe(401);
        });

        it('deve rejeitar token inválido', async () => {
            const response = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer token_invalido');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/v1/auth/refresh', () => {
        it('deve renovar token válido', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).not.toBe(authToken);
        });
    });
});
