const axios = require('axios');
const config = require('../config/env');

class DataJudService {
    constructor() {
        this.apiKey = config.datajud ? config.datajud.apiKey : process.env.DATAJUD_API_KEY;
        this.baseUrl = 'https://api-publica.datajud.cnj.jus.br';
    }

    /**
     * Extrai o tribunal do número CNJ do processo
     * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
     */
    extractTribunal(numeroProcesso) {
        const cleanNumber = numeroProcesso.replace(/\D/g, '');
        if (cleanNumber.length !== 20) {
            throw new Error('Número de processo inválido. Deve ter 20 dígitos.');
        }

        const justica = cleanNumber.substring(13, 14);
        const tribunal = cleanNumber.substring(14, 16);

        if (justica !== '5') {
            console.warn(`[DataJud] Consultando processo de justiça não trabalhista (J=${justica})`);
        }

        return { justica, tribunal };
    }

    getEndpoint(tribunalCode) {
        // Usa o endpoint direto do ElasticSearch
        const code = parseInt(tribunalCode, 10);
        return `${this.baseUrl}/api_publica_trt${code}/_search`;
    }

    async consultarProcesso(numeroProcesso) {
        if (!this.apiKey) {
            throw new Error('DATAJUD_API_KEY não configurada.');
        }

        try {
            const cleanNumber = numeroProcesso.replace(/\D/g, '');
            const { tribunal } = this.extractTribunal(cleanNumber);
            const url = this.getEndpoint(tribunal);

            const payload = {
                query: {
                    match: {
                        numeroProcesso: cleanNumber
                    }
                }
            };

            console.log(`[DataJud] Consultando ${cleanNumber} em ${url}`);

            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `APIKey ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const hits = response.data?.hits?.hits;

            if (hits && hits.length > 0) {
                // Pass cleanNumber as fallback if response doesn't have it
                return this.formatResponse(hits[0]._source, cleanNumber);
            }

            return null;

        } catch (error) {
            console.error(`[DataJud] Erro: ${error.message}`);
            if (error.response) {
                console.error('[DataJud] Response:', JSON.stringify(error.response.data));
            } else if (error.stack) {
                console.error('[DataJud] Stack:', error.stack);
            }
            throw new Error('Falha na consulta ao DataJud');
        }
    }

    formatResponse(data, originalNumber) {
        // Adjust for root-level fields (ES direct response structure)

        const numero = data.numeroProcesso || data.dadosBasicos?.numero || originalNumber;
        const classe = data.classe?.nome || data.dadosBasicos?.classeProcessual?.nome || '';
        const assunto = data.assuntos?.[0]?.nome || data.dadosBasicos?.assunto?.[0]?.nome || '';

        const rawDate = data.dataAjuizamento || data.dadosBasicos?.dataAjuizamento || '';
        let dataDistribuicao = rawDate;

        // Format date from YYYYMMDDHHMMSS to DD/MM/YYYY
        if (rawDate && rawDate.length >= 8) {
            const year = rawDate.substring(0, 4);
            const month = rawDate.substring(4, 6);
            const day = rawDate.substring(6, 8);
            dataDistribuicao = `${day}/${month}/${year}`;
        }

        const vara = data.orgaoJulgador?.nome || data.dadosBasicos?.orgaoJulgador?.nomeOrgao || '';

        // Tribunal extraction
        let tribunalCode = '??';
        if (numero) {
            try {
                tribunalCode = this.extractTribunal(numero).tribunal;
            } catch (e) {
                // Ignore extraction error on fallback
            }
        }

        // Polos (Partes) 
        const findParte = (polo) => {
            if (!data.polos) return '';
            const grupo = data.polos.find(p => p.polo === polo);
            return grupo?.partes?.[0]?.pessoa?.nome || '';
        };

        const autor = findParte('AT'); // Polo Ativo
        const reu = findParte('PA');   // Polo Passivo

        return {
            numero,
            classe,
            assunto,
            dataDistribuicao,
            vara,
            tribunal: `TRT${tribunalCode}`,
            autor,
            reu,
            raw: data
        };
    }
}

module.exports = new DataJudService();
