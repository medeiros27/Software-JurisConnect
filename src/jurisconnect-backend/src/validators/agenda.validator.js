const Joi = require('joi');

const criarEventoSchema = Joi.object({
    titulo: Joi.string().required(),
    data_evento: Joi.date().required(),
    // Add other fields as needed based on model
}).unknown(true);

const atualizarEventoSchema = Joi.object({
    titulo: Joi.string(),
    data_evento: Joi.date(),
    // Add other fields as needed based on model
}).unknown(true);

module.exports = {
    criarEventoSchema,
    atualizarEventoSchema,
};
