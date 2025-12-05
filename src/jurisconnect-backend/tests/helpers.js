// Helpers para testes
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Gera token JWT para testes
 */
function generateTestToken(userId = 1, perfil = 'admin') {
    return jwt.sign(
        { id: userId, perfil },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
    );
}

/**
 * Cria usuário de teste
 */
async function createTestUser(Usuario, overrides = {}) {
    const defaultUser = {
        nome: 'Usuário Teste',
        email: 'teste@jurisconnect.com',
        senha: await bcrypt.hash('senha123', 10),
        perfil: 'admin',
        ativo: true,
        ...overrides
    };

    return await Usuario.create(defaultUser);
}

/**
 * Cria cliente de teste
 */
async function createTestCliente(Cliente, overrides = {}) {
    const defaultCliente = {
        tipo: 'PJ',
        nome_fantasia: 'Empresa Teste LTDA',
        razao_social: 'Empresa Teste LTDA',
        cnpj: '12.345.678/0001-99',
        email: 'contato@empresateste.com',
        telefone: '(11) 98765-4321',
        ...overrides
    };

    return await Cliente.create(defaultCliente);
}

/**
 * Cria correspondente de teste
 */
async function createTestCorrespondente(Correspondente, overrides = {}) {
    const defaultCorrespondente = {
        nome_fantasia: 'Advogado Teste',
        razao_social: 'Advogado Teste OAB',
        oab: '123456',
        email: 'advogado@teste.com',
        telefone: '(11) 91234-5678',
        ativo: true,
        ...overrides
    };

    return await Correspondente.create(defaultCorrespondente);
}

/**
 * Cria demanda de teste
 */
async function createTestDemanda(Demanda, clienteId, correspondenteId, overrides = {}) {
    const defaultDemanda = {
        cliente_id: clienteId,
        correspondente_id: correspondenteId,
        titulo: 'Demanda Teste',
        descricao: 'Descrição da demanda de teste',
        tipo_demanda: 'judicial',
        status: 'pendente',
        prioridade: 'media',
        data_abertura: new Date(),
        ...overrides
    };

    return await Demanda.create(defaultDemanda);
}

/**
 * Mock de request do Express
 */
function mockRequest(overrides = {}) {
    return {
        body: {},
        params: {},
        query: {},
        headers: {},
        userId: 1,
        userPerfil: 'admin',
        ...overrides
    };
}

/**
 * Mock de response do Express
 */
function mockResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.set = jest.fn().mockReturnValue(res);
    return res;
}

module.exports = {
    generateTestToken,
    createTestUser,
    createTestCliente,
    createTestCorrespondente,
    createTestDemanda,
    mockRequest,
    mockResponse
};
