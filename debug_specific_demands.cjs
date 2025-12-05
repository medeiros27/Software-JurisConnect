require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, Pagamento, Cliente, Correspondente, sequelize } = require('./src/jurisconnect-backend/src/models');

async function inspectDemands() {
    try {
        const demandNumbers = ['2025000003', '2025000004', '2025000007'];

        console.log('--- Inspecting Demands ---');

        for (const numero of demandNumbers) {
            const demanda = await Demanda.findOne({
                where: { numero },
                include: [
                    { association: 'cliente' },
                    { association: 'correspondente' },
                    { association: 'pagamentos' }
                ]
            });

            if (!demanda) {
                console.log(`❌ Demanda ${numero} not found.`);
                continue;
            }

            console.log(`\n📋 Demanda ${numero} (ID: ${demanda.id})`);
            console.log(`   - Status: ${demanda.status}`);
            console.log(`   - Valor Cobrado (Receita): ${demanda.valor_cobrado}`);
            console.log(`   - Valor Custo (Despesa): ${demanda.valor_custo}`);
            console.log(`   - Cliente: ${demanda.cliente?.nome_fantasia || 'N/A'}`);
            console.log(`   - Correspondente: ${demanda.correspondente?.nome_fantasia || 'N/A'} (ID: ${demanda.correspondente_id})`);

            console.log('   - Pagamentos:');
            if (demanda.pagamentos.length === 0) {
                console.log('     ⚠️ No payments found.');
            } else {
                demanda.pagamentos.forEach(p => {
                    console.log(`     - [${p.tipo.toUpperCase()}] ${p.status} | Valor: ${p.valor} | ID: ${p.id}`);
                });
            }
        }

    } catch (error) {
        console.error('Error inspecting demands:', error);
    } finally {
        await sequelize.close();
    }
}

inspectDemands();
