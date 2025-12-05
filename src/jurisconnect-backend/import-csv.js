
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const { Cliente, Correspondente, Demanda, sequelize } = require('./src/models');

const CSV_FILE = path.join(__dirname, '../../backup/Planilha de Diligências - 2025.csv');

async function importCsv() {
    try {
        console.log(`Reading CSV: ${CSV_FILE}`);
        const content = fs.readFileSync(CSV_FILE, 'utf8'); // Assuming UTF-8, might need 'latin1'
        const lines = content.split(/\r?\n/);

        // Header is at line index 3 (4th line)
        const headerLine = lines[3];
        if (!headerLine) {
            console.error('Header line not found');
            return;
        }

        const headers = headerLine.split(';');
        console.log('Headers:', headers);

        const dataLines = lines.slice(4);
        console.log(`Total data lines: ${dataLines.length}`);

        let importedCount = 0;
        let skippedCount = 0;

        for (const line of dataLines) {
            if (!line.trim()) continue;

            const cols = line.split(';');
            // Map columns by index based on header inspection
            // Headers: ;SOLICITAÇÃO;Nº. DOC9;SOLICITANTE;TEL. ;TIPO DE DILIGÊNCIA;DATA DO ATO;COMARCA;CORRESPONDENTE;TEL. CORRESP.;VALOR;DATA PGTO;PAGO;STATUS; LUCRO
            // Indices (approx):
            // 0: empty
            // 1: SOLICITAÇÃO
            // 2: Nº. DOC9
            // 3: SOLICITANTE
            // 4: TEL.
            // 5: TIPO DE DILIGÊNCIA
            // 6: DATA DO ATO
            // 7: COMARCA
            // 8: CORRESPONDENTE
            // 9: TEL. CORRESP.
            // 10: VALOR
            // 11: DATA PGTO
            // 12: PAGO
            // 13: STATUS
            // 14: LUCRO

            // New Mapping based on row analysis:
            // 1: Data Solicitação
            // 3: Solicitante
            // 4: Tel Solicitante
            // 5: Tipo
            // 6: Descrição/Processo
            // 7: Data Agendamento
            // 8: Hora Agendamento
            // 9: Local (Detalhe)
            // 10: Comarca
            // 11: Valor
            // 12: ?
            // 13: Status
            // 14: Correspondente Name
            // 15: Correspondente Tel

            const dataSolicitacao = cols[1];
            const solicitanteName = cols[3];
            const solicitanteTel = cols[4];
            const tipoDiligencia = cols[5];
            const processoDesc = cols[6];
            const dataAtoStr = cols[7];
            const horaAtoStr = cols[8];
            const localDetalhe = cols[9];
            const comarca = cols[10];
            const valorStr = cols[11];
            const statusStr = cols[13];
            const correspondenteName = cols[14];
            const correspondenteTel = cols[15];

            if (!solicitanteName || !tipoDiligencia) {
                skippedCount++;
                continue;
            }

            // Parse Date and Time
            let dataAgendamento = null;
            if (dataAtoStr) {
                const parts = dataAtoStr.split('/');
                if (parts.length === 3) {
                    let dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    if (horaAtoStr && horaAtoStr.includes(':')) {
                        dateStr += `T${horaAtoStr}:00`;
                    } else {
                        dateStr += `T00:00:00`;
                    }
                    dataAgendamento = new Date(dateStr);
                }
            }

            // Filter by date (only after 27/11/2025)
            // Note: User said "only consider November and December tabs".
            // If dataAgendamento is valid, check it.
            if (dataAgendamento && dataAgendamento < new Date('2025-11-27')) {
                // console.log(`Skipping old date: ${dataAtoStr}`);
                skippedCount++;
                continue;
            } else if (!dataAgendamento) {
                console.log(`Skipping invalid date: ${dataAtoStr} (Raw: ${JSON.stringify(cols)})`);
                skippedCount++;
                continue;
            }

            // Parse Value
            let valorCausa = 0;
            if (valorStr) {
                const cleanVal = valorStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                valorCausa = parseFloat(cleanVal) || 0;
            }

            // Map Status
            let status = 'pendente';
            if (statusStr) {
                const s = statusStr.toUpperCase();
                if (s.includes('CUMPRIDO') || s.includes('OK')) status = 'concluida';
                else if (s.includes('CANCELADO')) status = 'cancelada';
            }

            console.log(`Processing: ${tipoDiligencia} - ${dataAtoStr} ${horaAtoStr} -> ${dataAgendamento.toISOString()}`);

            // Find/Create Cliente
            let cliente = await Cliente.findOne({ where: { nome_fantasia: solicitanteName } });
            if (!cliente) {
                cliente = await Cliente.create({
                    nome_fantasia: solicitanteName,
                    telefone: solicitanteTel,
                    tipo_pessoa: 'juridica'
                });
                console.log(`Created Cliente: ${solicitanteName}`);
            }

            // Find/Create Correspondente
            let correspondente = null;
            if (correspondenteName && correspondenteName.trim()) {
                correspondente = await Correspondente.findOne({ where: { nome_fantasia: correspondenteName } });
                if (!correspondente) {
                    correspondente = await Correspondente.create({
                        nome_fantasia: correspondenteName,
                        telefone: correspondenteTel,
                        tipo: 'advogado'
                    });
                    console.log(`Created Correspondente: ${correspondenteName}`);
                }
            }

            // Create Demanda
            const existing = await Demanda.findOne({
                where: {
                    cliente_id: cliente.id,
                    data_agendamento: dataAgendamento,
                    titulo: tipoDiligencia
                }
            });

            if (!existing) {
                await Demanda.create({
                    cliente_id: cliente.id,
                    correspondente_id: correspondente ? correspondente.id : null,
                    titulo: tipoDiligencia,
                    descricao: `Processo: ${processoDesc} - Local: ${localDetalhe} - Comarca: ${comarca}`,
                    data_agendamento: dataAgendamento,
                    valor_causa: valorCausa,
                    status: status,
                    local: comarca,
                    tipo_demanda: 'diligencia',
                    numero: `IMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
                });
                console.log(`Imported Demanda: ${tipoDiligencia} - ${dataAtoStr}`);
                importedCount++;
            } else {
                console.log(`Skipping duplicate: ${tipoDiligencia} - ${dataAtoStr}`);
                skippedCount++;
            }
        }

        console.log(`Import complete. Imported: ${importedCount}, Skipped: ${skippedCount}`);

    } catch (error) {
        console.error('Error importing CSV:', error);
    } finally {
        await sequelize.close();
    }
}

importCsv();
