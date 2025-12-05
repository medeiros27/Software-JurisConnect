require('dotenv').config({ path: './src/jurisconnect-backend/.env' }); // Load env vars
const { Demanda, Pagamento, Cliente, sequelize } = require('./src/jurisconnect-backend/src/models');
const demandaService = require('./src/jurisconnect-backend/src/services/demandaService');

async function verifySync() {
    try {
        console.log('--- Starting Financial Sync Verification ---');

        // 1. Setup: Ensure we have a client
        let cliente = await Cliente.findOne();
        if (!cliente) {
            cliente = await Cliente.create({
                nome_fantasia: 'Cliente Teste Sync',
                email: 'teste@sync.com',
                cpf_cnpj: '12345678901'
            });
        }

        // 2. Create Demanda with value
        console.log('\n1. Creating Demanda with value 1000.00...');
        const demandaData = {
            titulo: 'Demanda Teste Sync',
            tipo_demanda: 'Civil',
            cliente_id: cliente.id,
            valor_cobrado: 1000.00,
            valor_custo: 200.00,
            status: 'pendente'
        };

        const demanda = await demandaService.create(demandaData, 1); // Assuming user ID 1 exists
        console.log(`Demanda created: ${demanda.numero} (ID: ${demanda.id})`);

        // 3. Verify Payment Creation
        const pagamentoReceber = await Pagamento.findOne({ where: { demanda_id: demanda.id, tipo: 'receber' } });
        const pagamentoPagar = await Pagamento.findOne({ where: { demanda_id: demanda.id, tipo: 'pagar' } });

        if (pagamentoReceber && parseFloat(pagamentoReceber.valor) === 1000.00) {
            console.log('✅ SUCCESS: Receivable payment created correctly.');
        } else {
            console.error('❌ FAILURE: Receivable payment missing or incorrect.', pagamentoReceber?.dataValues);
        }

        if (pagamentoPagar && parseFloat(pagamentoPagar.valor) === 200.00) {
            console.log('✅ SUCCESS: Payable payment created correctly.');
        } else {
            console.error('❌ FAILURE: Payable payment missing or incorrect.', pagamentoPagar?.dataValues);
        }

        // 4. Update Demanda Value
        console.log('\n2. Updating Demanda value to 1500.00...');
        await demandaService.update(demanda.id, { valor_cobrado: 1500.00 }, 1);

        const pagamentoAtualizado = await Pagamento.findOne({ where: { demanda_id: demanda.id, tipo: 'receber' } });
        if (pagamentoAtualizado && parseFloat(pagamentoAtualizado.valor) === 1500.00) {
            console.log('✅ SUCCESS: Payment value updated correctly.');
        } else {
            console.error('❌ FAILURE: Payment value did not update.', pagamentoAtualizado?.dataValues);
        }

        // 5. Cleanup
        console.log('\n3. Cleaning up...');
        await demandaService.delete(demanda.id, 1);
        const pagamentoDeletado = await Pagamento.findOne({ where: { demanda_id: demanda.id } });

        if (!pagamentoDeletado) {
            console.log('✅ SUCCESS: Payments deleted after Demanda deletion.');
        } else {
            console.log('⚠️ NOTE: Payments might be soft-deleted or kept. Status:', pagamentoDeletado.deletedAt ? 'Soft Deleted' : 'Active');
        }

        console.log('\n--- Verification Completed ---');

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await sequelize.close();
    }
}

verifySync();
