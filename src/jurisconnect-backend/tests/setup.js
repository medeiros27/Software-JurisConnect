// Setup global para testes
const { sequelize } = require('../src/models');

// Mock do logger para não poluir console durante testes
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
}));

// Configuração do banco de dados de teste
beforeAll(async () => {
    // Usar banco de teste
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'jurisconnect_test';

    try {
        await sequelize.authenticate();
        console.log('✓ Conexão com banco de teste estabelecida');
    } catch (error) {
        console.error('✗ Erro ao conectar ao banco de teste:', error);
    }
});

// Limpar dados entre testes
beforeEach(async () => {
    // Truncar todas as tabelas (exceto SequelizeMeta)
    const tables = Object.keys(sequelize.models);
    for (const table of tables) {
        await sequelize.models[table].destroy({ where: {}, force: true });
    }
});

// Fechar conexão após todos os testes
afterAll(async () => {
    await sequelize.close();
    console.log('✓ Conexão com banco de teste fechada');
});
