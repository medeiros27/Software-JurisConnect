require('dotenv').config({ path: '../.env' });
const dataJudService = require('../src/services/dataJudService');

async function test() {
    console.log('Testando integração DataJud...');

    // Processo publico de exemplo (TRT2) ou TRT1
    // Ajuste conforme necessário para um caso real válido
    const processoExemplo = '1000526-72.2024.5.02.0007'; // Exemplo TRT2
    // Obs: Se este não existir, o teste retornará null, mas sem erro.

    try {
        console.log(`Consultando ${processoExemplo}...`);
        const resultado = await dataJudService.consultarProcesso(processoExemplo);
        console.log('Resultado:', JSON.stringify(resultado, null, 2));
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

test();
