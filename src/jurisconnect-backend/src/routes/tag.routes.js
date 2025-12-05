const express = require('express');
const router = express.Router();
const { Tag } = require('../models');
const { verificarToken, verificarRole } = require('../middleware/auth');
const AppError = require('../utils/AppError');

router.use(verificarToken);

// GET /api/v1/tags
router.get('/', async (req, res, next) => {
    try {
        const tags = await Tag.findAll({
            where: { ativo: true },
            order: [['nome', 'ASC']],
        });
        res.json({
            success: true,
            data: tags,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/tags
router.post('/', verificarRole('admin', 'gestor'), async (req, res, next) => {
    try {
        const tag = await Tag.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Tag criada com sucesso',
            data: tag,
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/tags/:id
router.put('/:id', verificarRole('admin', 'gestor'), async (req, res, next) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            throw AppError.notFound('Tag');
        }
        await tag.update(req.body);
        res.json({
            success: true,
            message: 'Tag atualizada com sucesso',
            data: tag,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/tags/:id
router.delete('/:id', verificarRole('admin', 'gestor'), async (req, res, next) => {
    try {
        const tag = await Tag.findByPk(req.params.id);
        if (!tag) {
            throw AppError.notFound('Tag');
        }
        await tag.update({ ativo: false });
        res.json({
            success: true,
            message: 'Tag desativada com sucesso',
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
