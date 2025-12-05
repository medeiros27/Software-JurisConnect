const { Pagamento, Demanda, sequelize } = require('../src/models');
const pagamentoController = require('../src/controllers/pagamento.controller');

// Mock req and res
const req = {
    query: { ano: 2025 }
};

const res = {
    json: (data) => {
        console.log('✅ API Response received');
        console.log('Status:', data.status);
        if (data.data) {
            console.log('Keys in data:', Object.keys(data.data));
            if (data.data.totals) {
                console.log('Totals structure:', JSON.stringify(data.data.totals, null, 2));
            } else {
                console.error('❌ Missing totals in data');
            }
        } else {
            console.error('❌ Missing data in response');
        }
    },
    status: (code) => {
        console.log('Status Code:', code);
        return {
            json: (data) => console.log('Error Response:', data)
        };
    }
};

async function test() {
    try {
        await pagamentoController.dashboard(req, res);
    } catch (error) {
        console.error('❌ Test Error:', error);
    } finally {
        await sequelize.close();
    }
}

test();
