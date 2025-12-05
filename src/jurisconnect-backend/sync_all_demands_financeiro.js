const { Demanda, sequelize } = require('./src/models');
const demandaService = require('./src/services/demandaService');

async function syncAllDemands() {
    console.log('🚀 Iniciando sincronização de todas as demandas com o financeiro...');

    // const demandaService = new DemandaService(); // Already imported as instance
    let processed = 0;
    let created = 0;
    let errors = 0;

    try {
        // Buscar todas as demandas (incluindo as que já têm pagamentos, para garantir atualização)
        const demandas = await Demanda.findAll();
        console.log(`📊 Total de demandas encontradas: ${demandas.length}`);

        for (const demanda of demandas) {
            try {
                // O método _syncPagamentos verifica se já existe e cria/atualiza conforme necessário
                // Passamos um objeto vazio como extraData para usar os defaults (ou o que já está na demanda)
                await demandaService._syncPagamentos(demanda, {});

                processed++;
                if (processed % 10 === 0) {
                    process.stdout.write(`\r⏳ Processadas: ${processed}/${demandas.length}`);
                }
            } catch (err) {
                console.error(`\n❌ Erro na demanda ${demanda.id} (${demanda.numero}):`, err.message);
                errors++;
            }
        }

        console.log('\n\n✅ Sincronização concluída!');
        console.log(`Total processado: ${processed}`);
        console.log(`Erros: ${errors}`);

    } catch (error) {
        console.error('Erro fatal:', error);
    } finally {
        await sequelize.close();
    }
}

syncAllDemands();
