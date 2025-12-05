const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });
const { parse } = require('csv-parse/sync');
const { sequelize, Cliente, Correspondente, Demanda, Pagamento, Agenda } = require('../models');

const CSV_FILE_PATH = path.resolve(__dirname, '../../../../JurisConnect - Operações 2025.csv');

// Helper to parse currency string to float
const parseCurrency = (str) => {
    if (!str) return 0;
    const cleanStr = str.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleanStr) || 0;
};

// Helper to parse date DD/MM/YYYY to Date object
const parseDate = (str) => {
    if (!str) return null;
    const [day, month, year] = str.split('/');
    if (!day || !month || !year) return null;
    return new Date(`${year}-${month}-${day}`);
};

// Helper to parse date DD/MM/YYYY HH:mm:ss or similar
const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const date = parseDate(dateStr);
    if (!date) return null;

    if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        if (hours) date.setHours(parseInt(hours));
        if (minutes) date.setMinutes(parseInt(minutes));
    }

    return date;
};

// Helper to generate valid email from name
const gerarEmail = (nome) => {
    const emailSafe = nome
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '.') // Substitui espaços por pontos
        .substring(0, 50); // Limita tamanho
    return `${emailSafe}@placeholder.com`;
};

const importData = async () => {
    try {
        console.log('Iniciando importação...');

        await sequelize.authenticate();
        console.log('Conexão com banco de dados estabelecida.');

        console.log('\n⚠️  ATENÇÃO: Limpando banco de dados antes da importação...');
        await sequelize.sync({ force: true });
        console.log('✅ Banco de dados limpo e tabelas recriadas.\n');

        const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        console.log(`Encontrados ${records.length} registros no CSV.\n`);

        let clientesCount = 0;
        let correspondentesCount = 0;
        let demandasCount = 0;

        for (const record of records) {
            // 1. Process Cliente
            const clienteNome = record['Cliente'] || 'Cliente Desconhecido';
            const clienteTel = record['Tel Cliente'] ? String(record['Tel Cliente']) : 'SEM_TELEFONE';

            let [cliente, clienteCriado] = await Cliente.findOrCreate({
                where: {
                    nome_fantasia: clienteNome,
                    telefone: clienteTel
                },
                defaults: {
                    tipo_pessoa: 'fisica',
                    email: gerarEmail(clienteNome),
                    cpf_cnpj: null,
                }
            });

            if (clienteCriado) clientesCount++;

            // 2. Process Correspondente
            let correspondente = null;
            const correspNome = record['Correspondente'];

            if (correspNome && correspNome !== 'Diligência Própria') {
                const correspTel = record['Tel Correspondente'] ? String(record['Tel Correspondente']) : 'SEM_TELEFONE';

                let correspCriado;
                [correspondente, correspCriado] = await Correspondente.findOrCreate({
                    where: {
                        nome_fantasia: correspNome,
                        telefone: correspTel
                    },
                    defaults: {
                        email: gerarEmail(correspNome),
                        cpf_cnpj: null,
                        cidade_sediado: null,
                        estado_sediado: null,
                    }
                });

                if (correspCriado) correspondentesCount++;
            }

            // 3. Process Demanda
            const dataSolicitacao = parseDate(record['Data Solicitação']);
            const dataAgendada = parseDate(record['Data Agendada']);
            const horaAgendada = record['Hora'];
            const dataPrazo = parseDateTime(record['Data Agendada'], record['Hora']);

            let cidade = null;
            let estado = null;
            if (record['Cidade/UF']) {
                const parts = record['Cidade/UF'].split(/[-/]/);
                if (parts.length >= 1) cidade = parts[0].trim();
                if (parts.length >= 2) estado = parts[1].trim().substring(0, 2).toUpperCase();
            }

            let status = 'pendente';
            const statusDil = record['Status Diligência']?.toLowerCase();
            if (statusDil === 'cumprida' || statusDil === 'cumprido') status = 'concluida';
            else if (statusDil === 'solicitada') status = 'pendente';
            else if (statusDil === 'cancelada') status = 'cancelada';

            let tipo = 'outro';
            const tipoDil = record['Tipo Diligência']?.toLowerCase();
            if (tipoDil?.includes('audiência') || tipoDil?.includes('audiencia')) tipo = 'audiencia';
            else if (tipoDil?.includes('protocolo')) tipo = 'protocolo';
            else if (tipoDil?.includes('diligência') || tipoDil?.includes('diligencia')) tipo = 'diligencia';
            else if (tipoDil?.includes('intimação') || tipoDil?.includes('intimacao')) tipo = 'intimacao';

            const demandaData = {
                numero: `IMP-${record['ID']}`,
                titulo: `${record['Tipo Diligência']} - ${record['Processo'] || 'Sem Processo'}`,
                descricao: `Processo: ${record['Processo']}\nLocal: ${record['Local']}\nDetalhes: ${record['Tipo Diligência']}`,
                tipo_demanda: tipo,
                status: status,
                prioridade: 'media',
                data_inicio: dataSolicitacao,
                data_prazo: dataPrazo,
                data_conclusao: status === 'concluida' ? dataPrazo : null,
                valor_cobrado: parseCurrency(record['Valor Cliente']),
                valor_estimado: parseCurrency(record['Custo Correspondente']),
                cidade: cidade,
                estado: estado,
                cliente_id: cliente.id,
                correspondente_id: correspondente ? correspondente.id : null,
                observacoes: `Importado do CSV. ID Original: ${record['ID']}. Status Pag Cliente: ${record['Status Pag Cliente']}`,
            };

            let demanda = await Demanda.findOne({ where: { numero: demandaData.numero } });
            if (!demanda) {
                demanda = await Demanda.create(demandaData);
                demandasCount++;

                if (demandaData.valor_cobrado > 0) {
                    await Pagamento.create({
                        numero_fatura: `FAT-REC-${demanda.id}`,
                        tipo: 'receber',
                        valor: demandaData.valor_cobrado,
                        data_vencimento: dataPrazo || new Date(),
                        status: record['Status Pag Cliente'] === 'Cumprido' ? 'pago' : 'pendente',
                        data_pagamento: parseDate(record['Data Pag Cliente']),
                        demanda_id: demanda.id,
                        observacoes: 'Receita gerada automaticamente na importação',
                    });
                }

                if (demandaData.valor_estimado > 0 && correspondente) {
                    await Pagamento.create({
                        numero_fatura: `FAT-PAG-${demanda.id}`,
                        tipo: 'pagar',
                        valor: demandaData.valor_estimado,
                        data_vencimento: dataPrazo || new Date(),
                        status: record['Pago ao Corresp'] === 'SIM' ? 'pago' : 'pendente',
                        demanda_id: demanda.id,
                        correspondente_id: correspondente.id,
                        observacoes: 'Despesa gerada automaticamente na importação',
                    });
                }

                if (dataPrazo) {
                    await Agenda.create({
                        titulo: demandaData.titulo,
                        descricao: demandaData.descricao,
                        tipo: tipo === 'audiencia' ? 'audiencia' : 'prazo',
                        data_evento: dataPrazo,
                        hora_evento: horaAgendada || '00:00',
                        demanda_id: demanda.id,
                    });
                }
            }
        }

        console.log('\n========================================');
        console.log('✅ Importação concluída com sucesso!');
        console.log('========================================');
        console.log(`📊 Clientes criados: ${clientesCount}`);
        console.log(`📊 Correspondentes criados: ${correspondentesCount}`);
        console.log(`📊 Demandas importadas: ${demandasCount}`);
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Erro na importação:', error);
    } finally {
        await sequelize.close();
    }
};

importData();
