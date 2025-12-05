const Joi = require('joi');

const tiposDemanda = [
    'audiencia',
    'una_presencial',
    'instrucao_presencial',
    'inicial_presencial',
    'coleta_assinaturas',
    'conciliacao_presencial',
    'protocolo',
    'acompanhamento',
    'visitas_in_loco',
    'acompanhamento_pericia',
    'sustentacao_oral',
    'copias',
    'despacho',
    'certidao_cartorio',
    'andamento',
    'coleta',
    'atendimento_coleta_assinatura',
    'instrucao_virtual',
    'diligencia',
    'intimacao',
    'outro'
];

const criarDemandaSchema = Joi.object({
    titulo: Joi.string().min(3).max(255).required(),
    processo: Joi.string().allow(null, ''),
    descricao: Joi.string().allow(null, ''),
    tipo_demanda: Joi.string()
        .valid(...tiposDemanda)
        .required(),
    prioridade: Joi.string().valid('baixa', 'media', 'alta', 'urgente'),
    status: Joi.string().valid('rascunho', 'pendente', 'em_andamento', 'aguardando_correspondente', 'concluida', 'cancelada'),

    // Datas
    data_prazo: Joi.date().allow(null),
    data_agendamento: Joi.date().allow(null),
    data_inicio: Joi.date().allow(null),
    data_conclusao: Joi.date().allow(null),

    // Financeiro
    valor_estimado: Joi.number().min(0).allow(null),
    valor_cobrado: Joi.number().min(0).allow(null),
    valor_custo: Joi.number().min(0).allow(null),
    status_pagamento_cliente: Joi.string().valid('pendente', 'pago', 'atrasado', 'cancelado').allow(null),
    status_pagamento_correspondente: Joi.string().valid('pendente', 'pago', 'atrasado', 'cancelado').allow(null),

    // Localização
    cidade: Joi.string().allow(null, ''),
    estado: Joi.string().length(2).allow(null, ''),
    local: Joi.string().allow(null, ''),

    // Relacionamentos
    cliente_id: Joi.number().integer().required(),
    correspondente_id: Joi.number().integer().allow(null),
    especialidade_id: Joi.number().integer().allow(null),
    equipe: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            valor: Joi.number().allow(null, ''),
            status_pagamento: Joi.string().valid('pendente', 'pago', 'atrasado', 'cancelado').default('pendente')
        }).unknown(true) // Allow other fields if any
    ).allow(null),

    observacoes: Joi.string().allow(null, ''),
});

const atualizarDemandaSchema = criarDemandaSchema.fork(
    ['titulo', 'tipo_demanda', 'cliente_id'],
    (schema) => schema.optional()
);

const atualizarStatusSchema = Joi.object({
    status: Joi.string()
        .valid(
            'rascunho',
            'pendente',
            'em_andamento',
            'aguardando_correspondente',
            'concluida',
            'cancelada'
        )
        .required(),
});

module.exports = {
    criarDemandaSchema,
    atualizarDemandaSchema,
    atualizarStatusSchema,
};
