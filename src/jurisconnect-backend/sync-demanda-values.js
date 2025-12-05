const { Demanda, Pagamento, sequelize } = require('./src/models');

async function syncValues() {
    try {
        console.log('Syncing Demanda values from Pagamentos...');

        const demandas = await Demanda.findAll({
            include: [{ model: Pagamento, as: 'pagamentos' }]
        });

        let updatedCount = 0;

        for (const demanda of demandas) {
            let valorCobrado = 0;
            let valorCusto = 0;

            if (demanda.pagamentos && demanda.pagamentos.length > 0) {
                demanda.pagamentos.forEach(p => {
                    const val = parseFloat(p.valor);
                    if (p.tipo === 'receber') {
                        valorCobrado += val;
                    } else if (p.tipo === 'pagar') {
                        valorCusto += val;
                    }
                });
            }

            // Update if values differ
            if (parseFloat(demanda.valor_cobrado) !== valorCobrado || parseFloat(demanda.valor_custo) !== valorCusto) {
                demanda.valor_cobrado = valorCobrado;
                demanda.valor_custo = valorCusto;
                // Also update valor_estimado to match cobrado for consistency if it's 0
                if (parseFloat(demanda.valor_estimado) === 0) {
                    demanda.valor_estimado = valorCobrado;
                }

                await demanda.save();
                updatedCount++;
            }
        }

        console.log(`Sync complete. Updated ${updatedCount} demands.`);

    } catch (error) {
        console.error('Error syncing values:', error);
    } finally {
        await sequelize.close();
    }
}

syncValues();
