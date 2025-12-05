/**
 * Script para sincronizar os novos modelos Andamento, Tag e DemandaTag
 * Execute com: node sync-new-models.js
 */

require('dotenv').config();
const { sequelize, Andamento, Tag, DemandaTag } = require('./src/models');

async function syncModels() {
    try {
        console.log('🔄 Iniciando sincronização dos novos modelos...\n');

        // Sincroniza apenas as novas tabelas
        await Andamento.sync({ alter: true });
        console.log('✅ Tabela "andamentos" sincronizada');

        await Tag.sync({ alter: true });
        console.log('✅ Tabela "tags" sincronizada');

        await DemandaTag.sync({ alter: true });
        console.log('✅ Tabela "demanda_tags" sincronizada');

        // Inserir tags padrão
        const tagsExistentes = await Tag.count();
        if (tagsExistentes === 0) {
            console.log('\n📝 Inserindo tags padrão...');
            await Tag.bulkCreate([
                {
                    nome: 'Urgente',
                    cor: '#EF4444',
                    icone: '🔥',
                    descricao: 'Demanda urgente que requer atenção imediata',
                    ativo: true,
                },
                {
                    nome: 'Importante',
                    cor: '#F59E0B',
                    icone: '⭐',
                    descricao: 'Demanda importante',
                    ativo: true,
                },
                {
                    nome: 'Monitoramento',
                    cor: '#3B82F6',
                    icone: '👁️',
                    descricao: 'Demanda em monitoramento',
                    ativo: true,
                },
                {
                    nome: 'Aguardando Cliente',
                    cor: '#8B5CF6',
                    icone: '⏳',
                    descricao: 'Aguardando resposta ou ação do cliente',
                    ativo: true,
                },
                {
                    nome: 'Revisão',
                    cor: '#EC4899',
                    icone: '✏️',
                    descricao: 'Demanda em revisão',
                    ativo: true,
                },
            ]);
            console.log('✅ Tags padrão inseridas com sucesso');
        } else {
            console.log('\n⏭️  Tags já existem, pulando inserção');
        }

        console.log('\n🎉 Sincronização concluída com sucesso!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        process.exit(1);
    }
}

syncModels();
