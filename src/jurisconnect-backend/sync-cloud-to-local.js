
const { createClient } = require('@supabase/supabase-js');
const { Cliente, Correspondente, Demanda, sequelize } = require('./src/models');

// Hardcoded Supabase Credentials (from frontend env)
const supabaseUrl = 'https://yxfrypmoauqksvoixtop.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZnJ5cG1vYXVxa3N2b2l4dG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzQxNzcsImV4cCI6MjA3OTY1MDE3N30.EplP2KGFby_dROXU7g5APKTnYNCvNPIuOOhsC9Ki8WI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCloudToLocal() {
    try {
        console.log('Starting Cloud to Local Sync...');

        // 1. Sync Clientes
        console.log('Fetching Clientes from Supabase...');
        const { data: clientes, error: errClientes } = await supabase.from('clientes').select('*');
        if (errClientes) throw errClientes;
        console.log(`Found ${clientes.length} Clientes.`);

        for (const c of clientes) {
            await Cliente.upsert({
                id: c.id,
                nome_fantasia: c.nome_fantasia,
                razao_social: c.razao_social,
                cpf_cnpj: c.cpf_cnpj,
                tipo_pessoa: c.tipo_pessoa,
                email: c.email,
                telefone: c.telefone,
                endereco: c.endereco,
                cidade: c.cidade,
                estado: c.estado,
                ativo: c.ativo,
                created_at: c.created_at,
                updated_at: c.updated_at
            });
        }
        console.log('Clientes synced.');

        // 2. Sync Correspondentes
        console.log('Fetching Correspondentes from Supabase...');
        const { data: correspondentes, error: errCorresp } = await supabase.from('correspondentes').select('*');
        if (errCorresp) throw errCorresp;
        console.log(`Found ${correspondentes.length} Correspondentes.`);

        for (const c of correspondentes) {
            await Correspondente.upsert({
                id: c.id,
                nome_fantasia: c.nome_fantasia,
                tipo: c.tipo,
                email: c.email,
                telefone: c.telefone,
                cidade_sediado: c.cidade_sediado,
                estado_sediado: c.estado_sediado,
                ativo: c.ativo,
                created_at: c.created_at,
                updated_at: c.updated_at
            });
        }
        console.log('Correspondentes synced.');

        // 3. Sync Demandas
        console.log('Fetching Demandas from Supabase...');

        let allDemandas = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const from = page * pageSize;
            const to = from + pageSize - 1;
            console.log(`Fetching range ${from}-${to}...`);

            const { data: chunk, error: errChunk } = await supabase
                .from('demandas')
                .select('*')
                .range(from, to);

            if (errChunk) throw errChunk;

            if (chunk.length > 0) {
                allDemandas = allDemandas.concat(chunk);
                if (chunk.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        console.log(`Found ${allDemandas.length} Demandas total.`);

        for (const d of allDemandas) {
            const dataAgendamento = d.data_agendamento || d.data_prazo;

            await Demanda.upsert({
                id: d.id,
                numero: d.numero,
                titulo: d.titulo,
                descricao: d.descricao,
                tipo_demanda: d.tipo_demanda,
                status: d.status,
                prioridade: d.prioridade,
                data_prazo: d.data_prazo,
                data_agendamento: dataAgendamento,
                data_inicio: d.data_inicio,
                data_conclusao: d.data_conclusao,
                valor_estimado: d.valor_estimado,
                valor_cobrado: d.valor_cobrado,
                valor_custo: d.valor_custo,
                cidade: d.cidade,
                estado: d.estado,
                observacoes: d.observacoes,
                cliente_id: d.cliente_id,
                correspondente_id: d.correspondente_id,
                criado_por: d.criado_por,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
                deletedAt: null // Restore if soft-deleted
            });
        }
        console.log('Demandas synced.');

    } catch (error) {
        console.error('Error syncing:', error);
    } finally {
        await sequelize.close();
    }
}

syncCloudToLocal();
