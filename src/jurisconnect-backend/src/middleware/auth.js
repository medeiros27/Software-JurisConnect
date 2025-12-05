const { Usuario } = require('../models');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const verificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError('Token não fornecido', 401, 'TOKEN_AUSENTE');
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            throw new AppError('Token mal formatado', 401, 'TOKEN_MALFORMATADO');
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            throw new AppError('Token mal formatado', 401, 'TOKEN_MALFORMATADO');
        }

        // Validar Token JWT Localmente
        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (err) {
            throw new AppError('Token inválido ou expirado', 401, 'TOKEN_INVALIDO');
        }

        // Buscar usuário local
        const localUser = await Usuario.findByPk(decoded.id);

        if (!localUser) {
            throw new AppError('Usuário não encontrado no sistema local', 403, 'USUARIO_NAO_ENCONTRADO');
        }

        if (!localUser.ativo) {
            throw new AppError('Usuário inativo', 401, 'USUARIO_INATIVO');
        }

        req.usuario = localUser;
        req.usuarioId = localUser.id;

        next();
    } catch (error) {
        next(error);
    }
};

const verificarRole = (...rolesPermitidas) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return next(new AppError('Usuário não autenticado', 401));
        }

        if (!rolesPermitidas.includes(req.usuario.role)) {
            return next(
                new AppError('Sem permissão para acessar este recurso', 403, 'SEM_PERMISSAO')
            );
        }

        next();
    };
};

module.exports = { verificarToken, verificarRole };
