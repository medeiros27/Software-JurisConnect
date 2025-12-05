const Joi = require('joi');

const criarClienteSchema = Joi.object({
    tipo_pessoa: Joi.string().valid('fisica', 'juridica').required(),
    nome_fantasia: Joi.string().min(3).max(255).required(),
    razao_social: Joi.string().max(255).allow(null, ''),
    cpf_cnpj: Joi.string().allow(null, ''),
    inscricao_estadual: Joi.string().max(50).allow(null, ''),
    inscricao_municipal: Joi.string().max(50).allow(null, ''),
    responsavel_legal: Joi.string().max(255).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    email_financeiro: Joi.string().email().allow(null, ''),
    telefone: Joi.string().allow(null, ''),
    celular: Joi.string().allow(null, ''),
    endereco: Joi.string().max(500).allow(null, ''),
    cidade: Joi.string().max(100).allow(null, ''),
    estado: Joi.string().length(2).allow(null, ''),
    cep: Joi.string().max(10).allow(null, ''),
    observacoes: Joi.string().allow(null, ''),
    ativo: Joi.boolean().default(true),
});

const atualizarClienteSchema = criarClienteSchema.fork(
    ['tipo_pessoa', 'cpf_cnpj'],
    (schema) => schema.optional()
);

module.exports = { criarClienteSchema, atualizarClienteSchema };
