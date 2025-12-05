require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Demanda, Pagamento } = require('./src/jurisconnect-backend/src/models');

async function debug() {
    try {
        const demandas = await Demanda.findAll({
            include: ['cliente', 'correspondente']
        });

        console.log(`Total Demandas: ${demandas.length}`);
        let missingPayments = 0;

        for (const d of demandas) {
            const pagamentos = await Pagamento.findAll({ where: { demanda_id: d.id } });

            const shouldHaveReceita = parseFloat(d.valor_cobrado) > 0;
            const shouldHaveDespesa = parseFloat(d.valor_custo) > 0 && d.correspondente_id;

            const hasReceita = pagamentos.some(p => p.tipo === 'receber');
            const hasDespesa = pagamentos.some(p => p.tipo === 'pagar');

            if ((shouldHaveReceita && !hasReceita) || (shouldHaveDespesa && !hasDespesa)) {
                console.log(`[ISSUE] Demanda ID: ${d.id}, Titulo: ${d.titulo}`);
                console.log(`   Valor Cobrado: ${d.valor_cobrado}, Tem Receita? ${hasReceita}`);
                console.log(`   Valor Custo: ${d.valor_custo}, Correspondente: ${d.correspondente_id}, Tem Despesa? ${hasDespesa}`);
                missingPayments++;
            } else {
                // console.log(`[OK] Demanda ID: ${d.id}`);
            }
        }
        console.log(`Total Demandas com problemas: ${missingPayments}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
