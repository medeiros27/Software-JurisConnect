const { Pagamento } = require('../src/models');

async function inspectLatestPagamentos() {
    try {
        const pagamentos = await Pagamento.findAll({
            limit: 1,
            order: [['created_at', 'DESC']],
            include: ['correspondente', 'demanda']
        });

        console.log('--- Latest 5 Pagamentos ---');
        pagamentos.forEach(p => {
            console.log(JSON.stringify({
                id: p.id,
                numero_fatura: p.numero_fatura,
                valor: p.valor,
                tipo: p.tipo,
                status: p.status,
                demanda_id: p.demanda_id,
                correspondente_id: p.correspondente_id,
                correspondente_nome: p.correspondente ? p.correspondente.nome_fantasia : 'N/A',
                data_vencimento: p.data_vencimento,
                created_at: p.created_at
            }, null, 2));
        });

    } catch (error) {
        console.error('Error inspecting pagamentos:', error);
    }
}

inspectLatestPagamentos();
