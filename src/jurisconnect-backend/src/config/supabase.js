const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.warn('⚠️ Erro ao inicializar Supabase Client:', error.message);
    }
} else {
    console.warn('⚠️ Supabase URL or Key missing. Supabase integration disabled.');
    // Mock seguro para evitar crashes se alguém tentar acessar
    supabase = {
        auth: {
            signInWithPassword: async () => ({ error: { message: 'Supabase disabled' } }),
            getUser: async () => ({ error: { message: 'Supabase disabled' } }),
        },
        from: () => ({
            select: () => ({ data: [], error: null }),
            insert: () => ({ data: [], error: null }),
            update: () => ({ data: [], error: null }),
            delete: () => ({ data: [], error: null }),
        })
    };
}

module.exports = supabase;
