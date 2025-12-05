const XLSX = require('xlsx');
const { Sequelize } = require('sequelize');
const { Cliente, Correspondente, Demanda, Usuario } = require('./src/models');

function excelDateToJSDate(serial) {
    if (!serial || isNaN(serial)) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
}

async function importExcel() {
    try {
        console.log('Starting Excel import...');

        const filePath = 'c:\\Users\\Bruno\\Documents\\Bruno\\Software-JurisConnect\\Planilha de Diligências - 2025.xlsx';
        const workbook = XLSX.readFile(filePath);

        // Get Admin User
        const admin = await Usuario.findOne({ where: { email: 'admin@jurisconnect.com' } });
        if (!admin) throw new Error('Admin user not found. Run create-admin.js first.');

        let clientesCount = 0;
        let correspondentesCount = 0;
        let demandasCount = 0;

        const months = [
            'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
            'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
        ];

        for (const month of months) {
            if (!workbook.SheetNames.includes(month)) continue;

            console.log(`Processing sheet: ${month}`);
            const sheet = workbook.Sheets[month];
            // Read raw values to handle dates manually if needed, or rely on library
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 2, defval: null });

            for (const row of rows) {
                // Mapping based on inspection:
                // 1: Data Solicitação
                // 3: Cliente
                // 4: Tel Cliente
                // 5: Tipo Diligência
                // 6: Processo
                // 7: Data Agendada
                // 8: Local
                // 9: Correspondente
                // 10: Tel Correspondente
                // 11: Valor Cobrado
                // 12: Valor Custo
                // 14: Status

                const dataSolicitacao = row[1];
                const nomeCliente = row[3];
                const telCliente = row[4];
                const tipoDiligencia = row[5];
                const processo = row[6];
                const dataAgendada = row[7];
                const local = row[8];
                const nomeCorrespondente = row[9];
                const telCorrespondente = row[10];
                const valorCobradoRaw = row[11];
                const valorCustoRaw = row[12];
                const statusRaw = row[14];

                if (!nomeCliente && !tipoDiligencia) continue;

                // 1. Find or Create Cliente
                let cliente = null;
                if (nomeCliente) {
                    try {
                        [cliente] = await Cliente.findOrCreate({
                            where: { nome_fantasia: String(nomeCliente).trim() },
                            defaults: {
                                tipo_pessoa: 'fisica',
                                telefone: telCliente ? String(telCliente) : null,
                                email: 'nao_informado@email.com',
                                ativo: true
                            }
                        });
                        clientesCount++;
                    } catch (e) {
                        // console.error(`Error creating client ${nomeCliente}:`, e.message);
                    }
                }

                // 2. Find or Create Correspondente
                let correspondente = null;
                if (nomeCorrespondente && nomeCorrespondente !== '-') {
                    try {
                        [correspondente] = await Correspondente.findOrCreate({
                            where: { nome_fantasia: String(nomeCorrespondente).trim() },
                            defaults: {
                                tipo: 'preposto',
                                telefone: telCorrespondente ? String(telCorrespondente) : null,
                                email: 'nao_informado@email.com',
                                ativo: true,
                                cidades_atendidas: local ? String(local) : ''
                            }
                        });
                        correspondentesCount++;
                    } catch (e) {
                        // console.error(`Error creating correspondente ${nomeCorrespondente}:`, e.message);
                    }
                }

                // 3. Create Demanda
                if (cliente) {
                    try {
                        // Parse Local
                        let cidade = null;
                        let estado = null;
                        if (local) {
                            const parts = String(local).split('-');
                            if (parts.length > 1) {
                                cidade = parts[0].trim();
                                estado = parts[1].trim();
                            } else {
                                cidade = local;
                            }
                        }

                        // Map Status
                        let status = 'pendente';
                        if (statusRaw) {
                            const s = String(statusRaw).toLowerCase();
                            if (s.includes('ok') || s.includes('realizada') || s.includes('cumprida') || s.includes('concluida')) status = 'concluida';
                            else if (s.includes('cancelada')) status = 'cancelada';
                        }

                        // Parse Values
                        const parseVal = (v) => {
                            if (typeof v === 'number') return v;
                            if (!v) return 0;
                            return parseFloat(String(v).replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
                        };

                        const valorCobrado = parseVal(valorCobradoRaw);
                        const valorCusto = parseVal(valorCustoRaw);

                        // Parse Dates
                        const dSolicitacao = typeof dataSolicitacao === 'number' ? excelDateToJSDate(dataSolicitacao) : new Date();
                        const dAgendada = typeof dataAgendada === 'number' ? excelDateToJSDate(dataAgendada) : new Date();

                        await Demanda.create({
                            numero: processo ? String(processo) : `DEM-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
                            titulo: `${tipoDiligencia || 'Diligência'} - ${nomeCliente}`,
                            descricao: `Processo: ${processo || 'N/A'}. Local: ${local || 'N/A'}`,
                            tipo_demanda: 'diligencia',
                            status: status,
                            data_inicio: dSolicitacao,
                            data_prazo: dAgendada,
                            valor_cobrado: isNaN(valorCobrado) ? 0 : valorCobrado,
                            valor_custo: isNaN(valorCusto) ? 0 : valorCusto,
                            cliente_id: cliente.id,
                            correspondente_id: correspondente ? correspondente.id : null,
                            criado_por: admin.id,
                            cidade: cidade,
                            estado: estado
                        });
                        demandasCount++;
                    } catch (e) {
                        console.error(`Error creating demanda for ${nomeCliente}:`, e.message);
                    }
                }
            }
        }

        console.log('Import completed successfully!');
        console.log(`Clientes processed: ${clientesCount}`);
        console.log(`Correspondentes processed: ${correspondentesCount}`);
        console.log(`Demandas created: ${demandasCount}`);

    } catch (error) {
        console.error('Error importing Excel:', error);
    }
}

importExcel();
