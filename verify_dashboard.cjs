require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Pagamento, sequelize, Sequelize } = require('./src/jurisconnect-backend/src/models');
const Op = Sequelize.Op;

async function verifyDashboardLogic() {
    try {
        const anoAtual = new Date().getFullYear();
        const startOfYear = new Date(anoAtual, 0, 1);
        const endOfYear = new Date(anoAtual, 11, 31, 23, 59, 59);

        console.log(`Fetching payments for ${anoAtual}...`);

        const pagamentos = await Pagamento.findAll({
            where: {
                data_vencimento: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            },
            raw: true
        });

        // Simulate Controller Logic
        const balanco = Array.from({ length: 12 }, (_, i) => ({
            mes_index: i,
            faturado: 0,
            custo: 0,
            lucro: 0,
            recebera: 0,
            pagara: 0,
            recebido: 0,
            pago: 0
        }));

        pagamentos.forEach(p => {
            const mesIndex = new Date(p.data_vencimento).getMonth();
            const valor = parseFloat(p.valor);
            const isPago = p.status === 'pago';

            if (p.tipo === 'receber') {
                balanco[mesIndex].faturado += valor; // Adds to Faturado regardless of status
                if (isPago) balanco[mesIndex].recebido += valor;
                else balanco[mesIndex].recebera += valor;
            } else if (p.tipo === 'pagar') {
                balanco[mesIndex].custo += valor; // Adds to Custo regardless of status
                if (isPago) balanco[mesIndex].pago += valor;
                else balanco[mesIndex].pagara += valor;
            }
        });

        // Calculate Profit
        balanco.forEach(b => {
            b.lucro = b.faturado - b.custo;
        });

        // Check a specific month (e.g., current month or next month)
        const checkMonth = 0; // January (or any month with data)
        // Let's find a month with data
        const monthWithData = balanco.find(b => b.faturado > 0 || b.custo > 0);

        if (monthWithData) {
            console.log(`\n--- Verification for Month Index ${monthWithData.mes_index} ---`);
            console.log(`Faturado (Total): ${monthWithData.faturado}`);
            console.log(`Custo (Total): ${monthWithData.custo}`);
            console.log(`Lucro (Faturado - Custo): ${monthWithData.lucro}`);
            console.log(`Recebido (Paid): ${monthWithData.recebido}`);
            console.log(`Receberá (Pending): ${monthWithData.recebera}`);

            const isLucroCorrect = Math.abs(monthWithData.lucro - (monthWithData.faturado - monthWithData.custo)) < 0.01;
            console.log(`\n✅ Logic Check: Lucro equals Faturado - Custo? ${isLucroCorrect ? 'YES' : 'NO'}`);

            if (monthWithData.recebera > 0 && monthWithData.lucro > monthWithData.recebido) {
                console.log('✅ Confirmation: Lucro includes pending amounts (Competence Regime).');
            } else if (monthWithData.recebera > 0) {
                console.log('ℹ️ Note: Lucro might be less than or equal to received, checking values...');
            }
        } else {
            console.log('⚠️ No data found for this year to verify.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

verifyDashboardLogic();
