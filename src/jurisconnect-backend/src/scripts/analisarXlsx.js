const XLSX = require('xlsx');
const path = require('path');

// Ler arquivo XLSX
const filePath = path.resolve(__dirname, '../../JurisConnect - Operações 2025.xlsx');
const workbook = XLSX.readFile(filePath);

// Pegar a primeira planilha
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Converter para JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total de registros:', data.length);
console.log('\n=== Primeiros 3 registros ===');
console.log(JSON.stringify(data.slice(0, 3), null, 2));

console.log('\n=== Colunas disponíveis ===');
if (data.length > 0) {
    console.log(Object.keys(data[0]));
}

// Analisar clientes únicos
const clientesUnicos = new Set();
data.forEach(row => {
    if (row['Cliente']) {
        clientesUnicos.add(row['Cliente']);
    }
});

console.log('\n=== Análise de Clientes ===');
console.log('Total de clientes únicos:', clientesUnicos.size);
console.log('Primeiros 10 clientes:');
Array.from(clientesUnicos).slice(0, 10).forEach(cliente => {
    console.log(`  - ${cliente}`);
});
