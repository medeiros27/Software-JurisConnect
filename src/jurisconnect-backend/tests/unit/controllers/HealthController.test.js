const HealthController = require('../../src/controllers/HealthController');
const { mockRequest, mockResponse } = require('../helpers');

describe('HealthController', () => {
    describe('check', () => {
        it('deve retornar status UP quando sistema está saudável', async () => {
            const req = mockRequest();
            const res = mockResponse();

            await HealthController.check(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'UP',
                    timestamp: expect.any(String),
                    services: expect.objectContaining({
                        database: expect.objectContaining({
                            status: 'UP'
                        })
                    })
                })
            );
        });
    });

    describe('checkDetailed', () => {
        it('deve retornar informações detalhadas do sistema', async () => {
            const req = mockRequest();
            const res = mockResponse();

            await HealthController.checkDetailed(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'UP',
                    services: expect.any(Object),
                    system: expect.objectContaining({
                        uptime: expect.any(Number),
                        memory: expect.any(Object),
                        cpu: expect.any(Object)
                    })
                })
            );
        });

        it('deve incluir métricas de memória', async () => {
            const req = mockRequest();
            const res = mockResponse();

            await HealthController.checkDetailed(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.system.memory).toHaveProperty('total');
            expect(response.system.memory).toHaveProperty('free');
            expect(response.system.memory).toHaveProperty('used');
            expect(response.system.memory).toHaveProperty('percentUsed');
        });
    });
});
