const { Documento, Demanda, Usuario } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

// Configuração do Multer com Segurança
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Sanitizar nome do arquivo
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, uniqueSuffix + '-' + sanitizedName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Tipo de arquivo não permitido. Apenas PDF, DOCX e Imagens.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

module.exports = {
    uploadMiddleware: upload.single('file'),

    async index(req, res) {
        const { demanda_id } = req.query;
        const where = {};
        if (demanda_id) where.demanda_id = demanda_id;

        const documentos = await Documento.findAll({
            where,
            include: [
                { model: Demanda, as: 'demanda', attributes: ['titulo'] },
                { model: Usuario, as: 'criador', attributes: ['nome'] }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.json({ status: 'success', data: documentos });
    },

    async store(req, res) {
        if (!req.file) {
            throw new AppError('Nenhum arquivo enviado', 400);
        }

        const { demanda_id, tipo } = req.body;

        const documento = await Documento.create({
            nome: req.file.originalname,
            tipo: tipo || req.file.mimetype,
            url: `/uploads/${req.file.filename}`, // Relative URL
            tamanho: req.file.size,
            mime_type: req.file.mimetype,
            demanda_id: demanda_id || null,
            criado_por: req.usuarioId // Assumindo que o middleware de auth popula req.usuarioId
        });

        return res.status(201).json({ status: 'success', data: documento });
    },

    async download(req, res) {
        const { id } = req.params;
        const documento = await Documento.findByPk(id);

        if (!documento) {
            throw new AppError('Documento não encontrado', 404);
        }

        // Extract filename from URL (handles both old "filename" and new "/uploads/filename" formats)
        const filename = path.basename(documento.url);
        const filePath = path.join(__dirname, '../../uploads', filename);

        if (!fs.existsSync(filePath)) {
            throw new AppError('Arquivo físico não encontrado', 404);
        }

        return res.download(filePath, documento.nome);
    },

    async delete(req, res) {
        const { id } = req.params;
        const documento = await Documento.findByPk(id);

        if (!documento) {
            throw new AppError('Documento não encontrado', 404);
        }

        // Verificação de Permissão (Apenas Admin ou Criador)
        // Assumindo req.usuarioRole e req.usuarioId do middleware
        if (req.usuarioRole !== 'admin' && documento.criado_por !== req.usuarioId) {
            throw new AppError('Você não tem permissão para excluir este arquivo', 403);
        }

        // Remover arquivo físico
        const filePath = path.join(__dirname, '../../uploads', documento.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await documento.destroy();
        return res.json({ status: 'success', message: 'Documento removido com sucesso' });
    }
};
