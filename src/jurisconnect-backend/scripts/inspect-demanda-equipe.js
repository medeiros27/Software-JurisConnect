const { Demanda, Correspondente, sequelize } = require('../src/models');

async function inspectDemanda(id) {
    try {
        console.log(`Inspecting Demanda ${id}...`);
        const demanda = await Demanda.findByPk(id, {
            include: [
                {
                    association: 'equipe',
                    through: {
                        attributes: ['valor', 'status_pagamento']
                    }
                }
            ]
        });

        if (!demanda) {
            console.log('Demanda not found.');
            return;
        }

        console.log('Demanda found:', demanda.titulo);
        if (demanda.equipe && demanda.equipe.length > 0) {
            console.log('Equipe members:', demanda.equipe.length);
            demanda.equipe.forEach(m => {
                const junction = m.demanda_correspondentes || m.DemandaCorrespondentes;
                console.log(`- Member ID: ${m.id}, Name: ${m.nome_fantasia}`);
                console.log(`  Junction Data:`, JSON.stringify(junction, null, 2));
            });
        } else {
            console.log('No team members found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

inspectDemanda(5766);
