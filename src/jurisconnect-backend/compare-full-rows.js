const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const CSV_FILE_PATH = path.join('C:', 'Users', 'Bruno', 'Documents', 'Bruno', 'Software-JurisConnect', 'backup', 'JurisConnect - Operações 2025.xlsx - Diligências.csv');

const excludedClients = [
    'Talita Coutinho Advogados',
    'Thiago Coriolano',
    'Raíssa - Concreserv',
    'Beatriz Aragão & Bernardo',
    'Diego Carrara Palandrani',
    'Igor Matheus',
    'Maria Juliana ABLaw',
    'Maria Paula - Ayres Monteiro',
    'Rodrigo Bezerra',
    'Leonardo - Advocacia Soller',
    'Sepulveda Advogados'
];

function analyze() {
    const fileContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const records = parse(fileContent, {
        columns: false,
        skip_empty_lines: true,
        from_line: 2
    });

    console.log('--- Comparing Full Rows (Nov 2025 Pendente) ---');

    let includedSample = null;
    let excludedSample = null;

    for (const row of records) {
        const dateStr = row[7];
        if (!dateStr || !dateStr.includes('/11/2025')) continue;
        const status = row[13] ? row[13].trim() : '';
        if (status !== 'Pendente') continue;

        const client = row[2] ? row[2].trim() : '';

        if (excludedClients.includes(client)) {
            if (!excludedSample) {
                excludedSample = row;
                console.log('EXCLUDED SAMPLE:', client);
                console.log(JSON.stringify(row, null, 2));
            }
        } else {
            if (!includedSample) {
                includedSample = row;
                console.log('INCLUDED SAMPLE:', client);
                console.log(JSON.stringify(row, null, 2));
            }
        }

        if (includedSample && excludedSample) break;
    }
}

analyze();
