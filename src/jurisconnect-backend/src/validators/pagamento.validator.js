const Joi = require('joi');

const criarPagamentoSchema = Joi.object({
    valor: Joi.number().required(),
    tipo: Joi.string().valid('receber', 'pagar').required(),
    data_vencimento: Joi.date().required(),
    // Add other fields as needed based on model
}).unknown(true);

const atualizarPagamentoSchema = Joi.object({
    valor: Joi.number(),
    tipo: Joi.string().valid('receber', 'pagar'),
    // Add other fields as needed based on model
}).unknown(true);

module.exports = {
    criarPagamentoSchema,
    atualizarPagamentoSchema,
};
