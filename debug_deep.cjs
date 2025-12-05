require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, Pagamento, Cliente, Correspondente, sequelize } = require('./src/jurisconnect-backend/src/models');

async function debugDeep() {
    try {
        const targetNumeros = ['2025000003', '2025000004'];

        console.log('--- Deep Debug for 2025000003 & 2025000004 ---');

        for (const numero of targetNumeros) {
            const demanda = await Demanda.findOne({
                where: { numero },
                include: [
                    { association: 'cliente' },
                    { association: 'correspondente' },
                    { association: 'pagamentos' }
                ],
                paranoid: false // Include soft deleted to check everything
            });

            if (!demanda) {
                console.log(`❌ Demanda ${numero} NOT FOUND in DB.`);
                continue;
            }

            console.log(`\n🔍 Demanda ${numero} (ID: ${demanda.id})`);
            console.log(`   - DeletedAt: ${demanda.deletedAt}`);
            console.log(`   - Cliente ID: ${demanda.cliente_id}`);
            console.log(`   - Cliente Found: ${demanda.cliente ? 'YES' : 'NO'} (${demanda.cliente?.nome_fantasia})`);
            console.log(`   - Correspondente ID: ${demanda.correspondente_id}`);
            console.log(`   - Correspondente Found: ${demanda.correspondente ? 'YES' : 'NO'} (${demanda.correspondente?.nome_fantasia})`);
            console.log(`   - Valor Cobrado: ${demanda.valor_cobrado}`);
            console.log(`   - Valor Custo: ${demanda.valor_custo}`);

            console.log('   - Pagamentos Linked:');
            if (demanda.pagamentos.length === 0) {
                console.log('     ⚠️ NONE');
            } else {
                demanda.pagamentos.forEach(p => {
                    console.log(`     - [${p.tipo}] Status: ${p.status} | Valor: ${p.valor} | DeletedAt: ${p.deletedAt}`);
                });
            }

            // Check if there are orphaned payments (soft deleted or not linked correctly)
            const orphaned = await Pagamento.findAll({
                where: { demanda_id: demanda.id },
                paranoid: false
            });

            if (orphaned.length > demanda.pagamentos.length) {
                console.log('   ⚠️ Found ORPHANED/DELETED payments in DB:');
                orphaned.forEach(p => {
                    if (!demanda.pagamentos.find(dp => dp.id === p.id)) {
                        console.log(`     - [${p.tipo}] Status: ${p.status} | Valor: ${p.valor} | DeletedAt: ${p.deletedAt} (ID: ${p.id})`);
                    }
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugDeep();
