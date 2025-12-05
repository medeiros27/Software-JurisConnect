require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, sequelize } = require('./src/jurisconnect-backend/src/models');
const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');
const publicoController = require('./src/jurisconnect-backend/src/controllers/publico.controller');

// Mock req/res for controller test
const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    return res;
};

(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const { Cliente, Correspondente, Usuario } = require('./src/jurisconnect-backend/src/models');
        const cliente = await Cliente.findOne();
        const correspondente = await Correspondente.findOne();
        const usuario = await Usuario.findOne();

        if (!cliente) throw new Error('No clients found');
        if (!usuario) throw new Error('No users found');

        // 1. Create Demand
        console.log('Creating demand...');
        const demanda = await demandaService.create({
            titulo: 'Teste Portal Correspondente',
            tipo_demanda: 'diligencia',
            cidade: 'Test City',
            estado: 'TS',
            valor_cobrado: 100,
            valor_custo: 50,
            cliente_id: cliente.id,
            correspondente_id: correspondente ? correspondente.id : null
        }, usuario.id);

        if (!demanda.access_token) {
            throw new Error('FAIL: Access token not generated.');
        }
        console.log('PASS: Demand created with token:', demanda.access_token);

        // 2. Test Public API (Controller)
        console.log('Testing Public API...');
        const req = { params: { token: demanda.access_token } };
        const res = mockRes();

        await publicoController.obterPorToken(req, res);

        if (!res.data || !res.data.success || res.data.data.id !== demanda.id) {
            console.log('Response:', res.data);
            throw new Error('FAIL: Public API did not return correct data.');
        }
        console.log('PASS: Public API returned demand data.');

        // 3. Test Revocation
        console.log('Testing Revocation...');
        const oldToken = demanda.access_token;
        const result = await demandaService.revokeAccess(demanda.id, 1);

        if (result.access_token === oldToken) {
            throw new Error('FAIL: Token was not changed.');
        }
        console.log('PASS: Token revoked. New token:', result.access_token);

        // 4. Verify Old Token is Invalid
        console.log('Verifying old token invalidation...');
        const reqOld = { params: { token: oldToken } };
        const resOld = mockRes();
        await publicoController.obterPorToken(reqOld, resOld);

        if (resOld.statusCode !== 404) {
            throw new Error('FAIL: Old token still works (expected 404).');
        }
        console.log('PASS: Old token is invalid.');

        // Cleanup
        await demanda.destroy({ force: true });
        console.log('Cleanup done.');

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await sequelize.close();
    }
})();
