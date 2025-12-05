const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../JurisConnect - Operações 2025.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Abas encontradas:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 0) {
            console.log(`\n--- Aba: ${sheetName} ---`);
            console.log('Cabeçalho:', data[0]);
            console.log('Primeira linha de dados:', data[1]);
        }
    });
} catch (error) {
    console.error('Erro ao ler arquivo:', error.message);
}
