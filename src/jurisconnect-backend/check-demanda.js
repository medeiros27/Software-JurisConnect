/**
 * Script para procurar a demanda com variações do número
 */

require('dotenv').config();
const { Demanda, Cliente } = require('./src/models');
const { Op } = require('sequelize');

async function findDemanda() {
    try {
        console.log('🔍 Procurando demanda...\n');

        // Tentar várias variações do número
        const variacoes = [
            '2025-11-1385',
            '202511385',
            '2025111385',
            '%1385%'
        ];

        for (const num of variacoes) {
            const operator = num.includes('%') ? Op.like : Op.eq;
            const demandas = await Demanda.findAll({
                where: { numero: { [operator]: num } },
                include: [
                    { association: 'cliente', attributes: ['id', 'nome_fantasia', 'razao_social'] },
                ],
                limit: 5,
            });

            if (demandas.length > 0) {
                console.log(`✅ Encontradas ${demandas.length} demanda(s) com padrão "${num}":\n`);
                demandas.forEach(d => {
                    console.log('═'.repeat(60));
                    console.log(`ID: ${d.id}`);
                    console.log(`Número: ${d.numero}`);
                    console.log(`Título: ${d.titulo}`);
                    console.log(`Cliente ID: ${d.cliente_id}`);
                    console.log(`Cliente: ${d.cliente?.nome_fantasia || 'N/A'}`);
                    console.log(`Tipo: ${d.tipo_demanda}`);
                    console.log(`Status: ${d.status}`);
                    console.log('');
                });
                break;
            }
        }

        console.log('\n📊 Últimas 10 demandas criadas:');
        console.log('═'.repeat(60));
        const ultimas = await Demanda.findAll({
            include: [
                { association: 'cliente', attributes: ['id', 'nome_fantasia'] },
            ],
            order: [['created_at', 'DESC']],
            limit: 10,
        });

        ultimas.forEach(d => {
            console.log(`${d.numero} | ${d.titulo} | Cliente: ${d.cliente?.nome_fantasia || 'N/A'}`);
        });

        console.log('\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

findDemanda();
