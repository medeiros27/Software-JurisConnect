
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yxfrypmoauqksvoixtop.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZnJ5cG1vYXVxa3N2b2l4dG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzQxNzcsImV4cCI6MjA3OTY1MDE3N30.EplP2KGFby_dROXU7g5APKTnYNCvNPIuOOhsC9Ki8WI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
    try {
        console.log('Checking Supabase connection...');
        const { count, error } = await supabase.from('demandas').select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error querying Supabase:', error);
        } else {
            console.log('Total Demandas in Supabase:', count);
        }

        // Try getting one item to see columns
        const { data: sample, error: sampleError } = await supabase
            .from('demandas')
            .select('*')
            .limit(1);

        if (sampleError) {
            console.error('Error querying sample:', sampleError);
        } else if (sample.length > 0) {
            console.log('Sample item columns:', Object.keys(sample[0]));
            console.log('Sample item:', JSON.stringify(sample[0], null, 2));
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkSupabase();
