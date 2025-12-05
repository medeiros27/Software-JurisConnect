const { Sequelize } = require('sequelize');
const config = require('./src/config/database.js');
const { Demanda, Pagamento, Cliente, Correspondente, Usuario } = require('./src/models');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false,
    }
);

async function seedFinancialData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco.');

        // Garantir que temos cliente e usuário
        const cliente = await Cliente.findOne() || await Cliente.create({
            nome_fantasia: 'Cliente Teste Financeiro',
            razao_social: 'Cliente Teste Ltda',
            cnpj: '00000000000199',
            email: 'financeiro@teste.com'
        });

        const usuario = await Usuario.findOne();

        // 1. Gerar dados históricos (últimos 6 meses)
        console.log('🔄 Gerando histórico financeiro...');
        for (let i = 0; i < 6; i++) {
            const dataBase = new Date();
            dataBase.setMonth(dataBase.getMonth() - i);

            // Receita (Pagamentos)
            const numPagamentos = Math.floor(Math.random() * 5) + 2;
            for (let j = 0; j < numPagamentos; j++) {
                await Pagamento.create({
                    demanda_id: null,
                    valor: (Math.random() * 2000) + 500,
                    data_pagamento: dataBase,
                    status: 'pago',
                    tipo: 'receber',
                    descricao: `Honorários Mês ${i + 1} - Pag ${j + 1}`,
                    numero_fatura: `FAT-${i}-${j}-${Date.now()}`,
                    data_vencimento: dataBase
                });
            }

            // Despesa (Demandas Concluídas com Custo)
            const numDemandas = Math.floor(Math.random() * 5) + 3;
            for (let k = 0; k < numDemandas; k++) {
                await Demanda.create({
                    titulo: `Diligência Histórica ${i}-${k}`,
                    numero: `HIST-${i}-${k}-${Date.now()}`,
                    tipo_demanda: 'diligencia',
                    status: 'concluida',
                    prioridade: 'media',
                    data_conclusao: dataBase,
                    valor_custo: (Math.random() * 300) + 50,
                    valor_cobrado: (Math.random() * 800) + 400,
                    cliente_id: cliente.id,
                    criado_por: usuario ? usuario.id : null
                });
            }
        }

        // 2. Gerar Agendamentos Futuros
        console.log('🔄 Gerando agendamentos futuros...');
        const tipos = ['audiencia', 'diligencia', 'protocolo'];
        for (let i = 0; i < 5; i++) {
            const dataFutura = new Date();
            dataFutura.setDate(dataFutura.getDate() + i + 1); // Próximos dias
            dataFutura.setHours(9 + i, 0, 0); // 9:00, 10:00...

            await Demanda.create({
                titulo: `Compromisso Futuro ${i + 1}`,
                numero: `FUT-${i}-${Date.now()}`,
                tipo_demanda: tipos[i % 3],
                status: 'pendente',
                prioridade: 'alta',
                data_agendamento: dataFutura,
                cliente_id: cliente.id,
                criado_por: usuario ? usuario.id : null,
                cidade: 'São Paulo',
                estado: 'SP'
            });
        }

        console.log('✅ Dados financeiros e de agendamento gerados com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro no seed:', error);
        process.exit(1);
    }
}

seedFinancialData();
