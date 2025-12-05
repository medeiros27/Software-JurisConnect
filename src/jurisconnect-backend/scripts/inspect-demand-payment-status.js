const { Demanda } = require('../src/models');

async function inspectDemandPaymentStatus() {
    try {
        const demandaId = process.argv[2] || 5766; // Default or from command line

        const demanda = await Demanda.findByPk(demandaId);

        if (!demanda) {
            console.log(`Demanda ${demandaId} não encontrada`);
            return;
        }

        console.log('--- Demand Payment Status ---');
        console.log(JSON.stringify({
            id: demanda.id,
            numero: demanda.numero,
            valor_cobrado: demanda.valor_cobrado,
            valor_custo: demanda.valor_custo,
            status_pagamento_cliente: demanda.status_pagamento_cliente,
            status_pagamento_correspondente: demanda.status_pagamento_correspondente,
            updated_at: demanda.updatedAt
        }, null, 2));

    } catch (error) {
        console.error('Error inspecting demand:', error);
    }
}

inspectDemandPaymentStatus();
