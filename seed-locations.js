require('dotenv').config({ path: './src/jurisconnect-backend/.env' });
const { Correspondente, sequelize } = require('./src/jurisconnect-backend/src/models');

const LOCATIONS = [
    { cidade: 'São Paulo', estado: 'SP' },
    { cidade: 'Rio de Janeiro', estado: 'RJ' },
    { cidade: 'Belo Horizonte', estado: 'MG' },
    { cidade: 'Curitiba', estado: 'PR' },
    { cidade: 'Porto Alegre', estado: 'RS' },
    { cidade: 'Salvador', estado: 'BA' },
    { cidade: 'Recife', estado: 'PE' },
    { cidade: 'Fortaleza', estado: 'CE' },
    { cidade: 'Brasília', estado: 'DF' },
    { cidade: 'Goiânia', estado: 'GO' },
    { cidade: 'Campinas', estado: 'SP' },
    { cidade: 'Santos', estado: 'SP' },
    { cidade: 'Niterói', estado: 'RJ' },
    { cidade: 'Guarulhos', estado: 'SP' },
    { cidade: 'São Bernardo do Campo', estado: 'SP' }
];

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado ao banco de dados.');

        const correspondentes = await Correspondente.findAll();
        console.log(`Encontrados ${correspondentes.length} correspondentes.`);

        let updatedCount = 0;
        for (const corr of correspondentes) {
            // Only update if missing location
            if (!corr.cidade_sediado || !corr.estado_sediado) {
                const randomLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

                await corr.update({
                    cidade_sediado: randomLoc.cidade,
                    estado_sediado: randomLoc.estado,
                    cidades_atendidas: `${randomLoc.cidade}, ${randomLoc.cidade} e Região`
                });
                updatedCount++;
            }
        }

        console.log(`Atualizados ${updatedCount} correspondentes com dados de localização.`);

    } catch (error) {
        console.error('Erro ao popular dados:', error);
    } finally {
        await sequelize.close();
    }
})();
