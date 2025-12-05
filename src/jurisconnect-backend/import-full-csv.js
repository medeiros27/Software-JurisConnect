
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Demanda, Cliente, Correspondente, sequelize } = require('./src/models');

const CSV_PATH = path.join('..', '..', 'backup', 'Planilha de Diligências - 2025.csv');

async function importFullCSV() {
    try {
        console.log(`Reading CSV from ${CSV_PATH}...`);
        const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');

        const records = parse(fileContent, {
            columns: false,
            delimiter: ';',
            from_line: 4,
            relax_column_count: true,
            trim: true
        });

        console.log(`Found ${records.length} records.`);

        let importedCount = 0;
        let errorCount = 0;
        const timestamp = Date.now();

        for (const [index, row] of records.entries()) {
            if (!row[0] && !row[1]) continue;

            try {
                const clienteName = row[1];
                const clienteTel = row[2];
                const tipo = row[3];
                const desc1 = row[4];
                const dateStr = row[5];
                const timeStr = row[6];
                const desc2 = row[7];
                const cityState = row[8];
                const receitaStr = row[9];
                const correspName = row[11];
                const correspTel = row[12];
                const despesaStr = row[13];
                const statusRaw = row[15];

                // 1. Generate Protocol
                const numero = `DIL-${timestamp}-${index}`;

                // 2. Merge Description
                const descricao = `${desc1 || ''} ${desc2 || ''}`.trim();

                // 3. Parse Date/Time
                let dataAgendamento = null;
                if (dateStr) {
                    const [day, month, year] = dateStr.split('/');
                    let hour = '00';
                    let min = '00';
                    if (timeStr) {
                        [hour, min] = timeStr.split(':');
                    }
                    if (day && month && year) {
                        dataAgendamento = new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
                    }
                }

                // 4. Parse Values
                const parseMoney = (str) => {
                    if (!str) return 0;
                    return parseFloat(str.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
                };
                const valorCobrado = parseMoney(receitaStr);
                const valorCusto = parseMoney(despesaStr);

                // 5. Parse Location
                let cidade = null;
                let estado = null;
                if (cityState) {
                    const parts = cityState.split('-');
                    if (parts.length > 1) {
                        estado = parts.pop().trim();
                        cidade = parts.join('-').trim();
                    } else {
                        cidade = cityState.trim();
                    }
                }

                // 6. Map Status
                let status = 'pendente';
                if (statusRaw && statusRaw.toUpperCase().includes('CUMPRIDO')) {
                    status = 'concluida';
                }

                // 7. Find/Create Cliente
                let clienteId = null;
                if (clienteName) {
                    const [cliente] = await Cliente.findOrCreate({
                        where: { nome_fantasia: clienteName },
                        defaults: {
                            nome_fantasia: clienteName,
                            telefone: clienteTel,
                            tipo_pessoa: 'juridica'
                        }
                    });
                    clienteId = cliente.id;
                }

                // 8. Find/Create Correspondente
                let correspondenteId = null;
                if (correspName) {
                    const [corresp] = await Correspondente.findOrCreate({
                        where: { nome_fantasia: correspName },
                        defaults: {
                            nome_fantasia: correspName,
                            telefone: correspTel,
                            tipo: 'advogado'
                        }
                    });
                    correspondenteId = corresp.id;
                }

                // 9. Insert Demanda
                await Demanda.create({
                    numero,
                    titulo: tipo || 'Diligência',
                    descricao: descricao || 'Sem descrição',
                    tipo_demanda: tipo || 'diligencia',
                    status,
                    prioridade: 'media',
                    data_prazo: dataAgendamento,
                    data_agendamento: dataAgendamento,
                    valor_cobrado: valorCobrado,
                    valor_custo: valorCusto,
                    valor_estimado: valorCobrado,
                    cidade,
                    estado,
                    cliente_id: clienteId,
                    correspondente_id: correspondenteId
                });

                importedCount++;

                if (importedCount % 100 === 0) {
                    console.log(`Imported ${importedCount} records...`);
                }
            } catch (err) {
                console.error(`Failed to import record ${index}:`, err.message);
                errorCount++;
            }
        }

        console.log(`Import finished. Success: ${importedCount}, Errors: ${errorCount}`);

    } catch (error) {
        console.error('Fatal error importing CSV:', error);
    } finally {
        await sequelize.close();
    }
}

importFullCSV();
