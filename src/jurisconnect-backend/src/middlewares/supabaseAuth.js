const { createClient } = require('@supabase/supabase-js');
const { Usuario } = require('../models');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const supabaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Supabase Auth Error:', error);
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        // Find local user
        let localUser = await Usuario.findOne({ where: { supabase_uuid: user.id } });

        if (!localUser) {
            // Try to link by email
            localUser = await Usuario.findOne({ where: { email: user.email } });

            if (localUser) {
                // Link the accounts
                localUser.supabase_uuid = user.id;
                await localUser.save();
            } else {
                return res.status(403).json({ error: 'Usuário não encontrado no sistema local' });
            }
        }

        req.user = localUser;
        req.usuario = localUser; // For compatibility with existing controllers
        req.supabaseUser = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        return res.status(500).json({ error: 'Erro interno de autenticação' });
    }
};

module.exports = supabaseAuth;
