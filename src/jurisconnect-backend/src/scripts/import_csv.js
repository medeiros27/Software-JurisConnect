const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Cliente, Correspondente, Demanda, sequelize } = require('../models');

const filePath = 'C:/Users/Bruno/Documents/Bruno/Software-JurisConnect/JurisConnect - Operações 2025.csv';

const cleanString = (str) => {
    if (!str) return null;
    const cleaned = String(str).trim();
    return cleaned === '' ? null : cleaned;
};

const parseCurrency = (str) => {
    if (!str) return 0;
    // Remove R$, spaces, dots, and replace comma with dot
    const cleaned = str.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
};

const parseDate = (str) => {
    if (!str) return null;
    // Format DD/MM/YYYY
    const parts = str.split('/');
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    return null;
};

const importCsv = async () => {
    const transaction = await sequelize.transaction();
    try {
        console.log('Iniciando importação CSV...');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`Lidas ${records.length} linhas do CSV.`);

        const clientesMap = new Map(); // Nome -> ID
        const correspondentesMap = new Map(); // Nome -> ID

        for (const row of records) {
            // 1. Processar Cliente
            const nomeCliente = cleanString(row['Cliente']);
            const telCliente = cleanString(row['Tel Cliente']);

            if (nomeCliente) {
                if (!clientesMap.has(nomeCliente)) {
                    let cliente = await Cliente.findOne({ where: { nome_fantasia: nomeCliente }, transaction });
                    if (!cliente) {
                        cliente = await Cliente.create({
                            nome_fantasia: nomeCliente,
                            telefone: telCliente,
                            tipo_pessoa: 'juridica', // Default
                            ativo: true
                        }, { transaction });
                        console.log(`Cliente criado: ${nomeCliente}`);
                    }
                    clientesMap.set(nomeCliente, cliente.id);
                }
            }

            // 2. Processar Correspondente
            const nomeCorrespondente = cleanString(row['Correspondente']);
            const telCorrespondente = cleanString(row['Tel Correspondente']);

            let correspondenteId = null;
            if (nomeCorrespondente && nomeCorrespondente !== 'Diligência Própria') {
                if (!correspondentesMap.has(nomeCorrespondente)) {
                    let correspondente = await Correspondente.findOne({ where: { nome_fantasia: nomeCorrespondente }, transaction });
                    if (!correspondente) {
                        correspondente = await Correspondente.create({
                            nome_fantasia: nomeCorrespondente,
                            telefone: telCorrespondente,
                            tipo: 'advogado', // Default
                            ativo: true
                        }, { transaction });
                        console.log(`Correspondente criado: ${nomeCorrespondente}`);
                    }
                    correspondentesMap.set(nomeCorrespondente, correspondente.id);
                }
                correspondenteId = correspondentesMap.get(nomeCorrespondente);
            }

            // 3. Processar Demanda
            const clienteId = clientesMap.get(nomeCliente);
            if (clienteId) {
                const demandaData = {
                    cliente_id: clienteId,
                    correspondente_id: correspondenteId,
                    data_solicitacao: parseDate(row['Data Solicitação']),
                    tipo_servico: cleanString(row['Tipo Diligência']),
                    numero_processo: cleanString(row['Processo']),
                    comarca: cleanString(row['Cidade/UF']),
                    data_prazo: parseDate(row['Data Agendada']),
                    hora_prazo: cleanString(row['Hora']),
                    local: cleanString(row['Local']),
                    valor_cliente: parseCurrency(row['Valor Cliente']),
                    valor_correspondente: parseCurrency(row['Custo Correspondente']),
                    status: cleanString(row['Status Diligência']) === 'Cumprida' ? 'concluido' : 'pendente',
                    descricao: `Local: ${row['Local'] || ''} - Obs: ${row['Processo'] || ''}`
                };

                // Check duplicate by process number and date (if process number exists)
                let exists = false;
                if (demandaData.numero_processo) {
                    const existing = await Demanda.findOne({
                        where: {
                            numero_processo: demandaData.numero_processo,
                            cliente_id: clienteId
                        },
                        transaction
                    });
                    if (existing) exists = true;
                }

                if (!exists) {
                    await Demanda.create(demandaData, { transaction });
                    // console.log(`Demanda criada para ${nomeCliente}`);
                }
            }
        }

        await transaction.commit();
        console.log('Importação CSV concluída com sucesso!');

    } catch (error) {
        await transaction.rollback();
        console.error('Erro na importação CSV:', error);
    } finally {
        await sequelize.close();
    }
};

importCsv();
