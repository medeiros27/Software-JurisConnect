
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxfrypmoauqksvoixtop.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZnJ5cG1vYXVxa3N2b2l4dG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzQxNzcsImV4cCI6MjA3OTY1MDE3N30.EplP2KGFby_dROXU7g5APKTnYNCvNPIuOOhsC9Ki8WI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAtivo() {
    try {
        console.log('Checking Supabase ativo distribution...');

        let allData = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const from = page * pageSize;
            const to = from + pageSize - 1;

            const { data: chunk, error: errChunk } = await supabase
                .from('demandas')
                .select('ativo')
                .range(from, to);

            if (errChunk) throw errChunk;

            if (chunk.length > 0) {
                allData = allData.concat(chunk);
                if (chunk.length < pageSize) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        const ativoCounts = {};
        allData.forEach(d => {
            const key = d.ativo === undefined ? 'undefined' : String(d.ativo);
            ativoCounts[key] = (ativoCounts[key] || 0) + 1;
        });

        console.log('Ativo Counts in Supabase:', ativoCounts);
        console.log('Total:', allData.length);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAtivo();
