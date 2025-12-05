const XLSX = require('xlsx');
const path = require('path');
const { Cliente, Correspondente, Demanda, sequelize } = require('../models');

const filePath = path.join(__dirname, '../../JurisConnect - Operações 2025.xlsx');

const formatDate = (excelDate) => {
    if (!excelDate) return null;
    // Excel date to JS date
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date;
};

const cleanString = (str) => {
    if (!str) return '';
    return String(str).trim();
};

const importData = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com banco de dados estabelecida.');

        const workbook = XLSX.readFile(filePath);

        // 1. Importar Clientes
        const clientesSheet = workbook.Sheets['🏢 Clientes'];
        const clientesData = XLSX.utils.sheet_to_json(clientesSheet);

        console.log(`Encontrados ${clientesData.length} clientes para importar.`);

        const clientesMap = new Map(); // Map Nome -> ID

        for (const row of clientesData) {
            const nome = cleanString(row['Nome Cliente']);
            if (!nome) continue;

            const clienteData = {
                nome_fantasia: nome,
                telefone: cleanString(row['Telefone']),
                email: cleanString(row['Email']) || null, // Fix: null if empty
                tipo_pessoa: row['Tipo'] === 'Escritório' ? 'juridica' : 'fisica',
                ativo: row['Status'] === 'Ativo',
            };

            // Verificar se já existe
            let cliente = await Cliente.findOne({ where: { nome_fantasia: nome } });

            if (!cliente) {
                try {
                    cliente = await Cliente.create(clienteData);
                    console.log(`Cliente criado: ${nome}`);
                } catch (err) {
                    console.error(`Erro ao criar cliente ${nome}:`, err.message);
                    continue;
                }
            } else {
                console.log(`Cliente já existe: ${nome}`);
            }
            clientesMap.set(nome, cliente.id);
        }

        // 2. Importar Correspondentes
        const correspondentesSheet = workbook.Sheets['👥 Correspondentes'];
        const correspondentesData = XLSX.utils.sheet_to_json(correspondentesSheet);

        console.log(`Encontrados ${correspondentesData.length} correspondentes para importar.`);

        const correspondentesMap = new Map(); // Map Nome -> ID

        for (const row of correspondentesData) {
            const nome = cleanString(row['Nome Correspondente']);
            if (!nome) continue;

            const correspondenteData = {
                nome_fantasia: nome,
                telefone: cleanString(row['Telefone']),
                email: cleanString(row['Email']) || null, // Fix: null if empty
                cpf_cnpj: cleanString(row['CPF/CNPJ']),
                cidade_sediado: cleanString(row['Cidade/UF']),
                cidades_atendidas: cleanString(row['Cidades Atendidas']),
                ativo: row['Status'] === 'Ativo',
                tipo: 'advogado'
            };

            let correspondente = await Correspondente.findOne({ where: { nome_fantasia: nome } });

            if (!correspondente) {
                try {
                    correspondente = await Correspondente.create(correspondenteData);
                    console.log(`Correspondente criado: ${nome}`);
                } catch (err) {
                    console.error(`Erro ao criar correspondente ${nome}:`, err.message);
                    continue;
                }
            } else {
                console.log(`Correspondente já existe: ${nome}`);
            }
            correspondentesMap.set(nome, correspondente.id);
        }

        // 3. Importar Demandas (Diligências)
        const demandasSheet = workbook.Sheets['📋 Diligências'];
        const demandasData = XLSX.utils.sheet_to_json(demandasSheet);

        console.log(`Encontradas ${demandasData.length} demandas para importar.`);

        for (const row of demandasData) {
            const clienteNome = cleanString(row['Cliente']);
            const correspondenteNome = cleanString(row['Correspondente']);

            const clienteId = clientesMap.get(clienteNome);
            const correspondenteId = correspondentesMap.get(correspondenteNome);

            if (!clienteId) {
                // console.warn(`Cliente não encontrado para demanda: ${clienteNome}`);
                continue;
            }

            const demandaData = {
                cliente_id: clienteId,
                correspondente_id: correspondenteId || null,
                data_solicitacao: formatDate(row['Data Solicitação']),
                tipo_servico: cleanString(row['Tipo Diligência']),
                numero_processo: cleanString(row['Processo']),
                comarca: cleanString(row['Cidade/UF']),
                data_prazo: formatDate(row['Data Agendada']),
                status: row['Status Diligência'] || 'pendente',
                valor_cliente: row['Valor Cliente'] || 0,
                valor_correspondente: row['Custo Correspondente'] || 0,
                descricao: `Local: ${row['Local'] || ''} - Hora: ${row['Hora'] || ''}`,
            };

            const exists = await Demanda.findOne({
                where: {
                    numero_processo: demandaData.numero_processo,
                    cliente_id: clienteId
                }
            });

            if (!exists) {
                try {
                    await Demanda.create(demandaData);
                    console.log(`Demanda criada: ${demandaData.tipo_servico} - ${demandaData.numero_processo}`);
                } catch (err) {
                    console.error(`Erro ao criar demanda ${demandaData.numero_processo}:`, err.message);
                }
            } else {
                console.log(`Demanda já existe: ${demandaData.numero_processo}`);
            }
        }

        console.log('Importação concluída com sucesso!');

    } catch (error) {
        console.error('Erro na importação:', error);
    } finally {
        await sequelize.close();
    }
};

importData();
