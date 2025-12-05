const Joi = require('joi');

const criarCorrespondenteSchema = Joi.object({
    tipo: Joi.string().valid('advogado', 'preposto').default('advogado'),
    nome_fantasia: Joi.string().required(),
    email: Joi.string().email().allow(null, ''),
    telefone: Joi.string().allow(null, ''),
    celular: Joi.string().allow(null, ''),
    cpf_cnpj: Joi.string().allow(null, ''),
    estado_sediado: Joi.string().allow(null, ''),
    cidade_sediado: Joi.string().allow(null, ''),
    endereco_completo: Joi.string().allow(null, ''),
    cep: Joi.string().allow(null, ''),
    oab_numero: Joi.string().allow(null, ''),
    oab_estado: Joi.string().allow(null, ''),
    cidades_atendidas: Joi.string().allow(null, ''),
    ativo: Joi.boolean().default(true),
});

const atualizarCorrespondenteSchema = criarCorrespondenteSchema.fork(
    ['nome_fantasia', 'email'],
    (schema) => schema.optional()
);

module.exports = {
    criarCorrespondenteSchema,
    atualizarCorrespondenteSchema,
};
