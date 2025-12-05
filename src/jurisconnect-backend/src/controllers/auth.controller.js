
const { Usuario } = require('../models');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Supabase removido/opcional
// const supabase = require('../config/supabase');

class AuthController {
    async login(req, res) {
        const { email, senha } = req.body;

        // 1. Buscar usuário local
        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            throw new AppError('Credenciais inválidas', 401, 'CREDENCIAIS_INVALIDAS');
        }

        if (!usuario.ativo) {
            throw new AppError('Usuário inativo', 401, 'USUARIO_INATIVO');
        }

        // 2. Validar senha (bcrypt)
        // O método validarSenha já existe no model Usuario, mas vamos garantir aqui
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            throw new AppError('Credenciais inválidas', 401, 'CREDENCIAIS_INVALIDAS');
        }

        // 3. Gerar Tokens JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, role: usuario.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        const refreshToken = jwt.sign(
            { id: usuario.id },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiresIn }
        );

        // 4. Atualizar ultimo login e refresh token no banco
        await usuario.update({
            ultimo_login: new Date(),
            refresh_token: refreshToken
        });

        logger.info(`Login bem-sucedido (Local): ${usuario.email}`);

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: {
                token: token,
                refreshToken: refreshToken,
                usuario: usuario.toJSON(),
            },
        });
    }

    async refresh(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError('Refresh token não fornecido', 401);
        }

        try {
            // Verificar token
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

            // Buscar usuário
            const usuario = await Usuario.findByPk(decoded.id);

            if (!usuario || usuario.refresh_token !== refreshToken) {
                throw new AppError('Refresh token inválido', 401);
            }

            // Gerar novo token
            const novoToken = jwt.sign(
                { id: usuario.id, email: usuario.email, role: usuario.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            res.json({
                success: true,
                data: {
                    token: novoToken,
                },
            });
        } catch (err) {
            throw new AppError('Refresh token inválido ou expirado', 401);
        }
    }

    async logout(req, res) {
        const usuario = req.usuario;

        if (usuario) {
            // Limpar refresh token
            await usuario.update({ refresh_token: null });
            logger.info(`Logout: ${usuario.email}`);
        }

        res.json({
            success: true,
            message: 'Logout realizado com sucesso',
        });
    }

    async me(req, res) {
        res.json({
            success: true,
            data: req.usuario.toJSON(),
        });
    }
}

module.exports = new AuthController();
