/**
 * Script para Restaurar Backup do Banco de Dados
 * 
 * USO:
 * node restore-backup.js <nome-do-arquivo-backup.sql>
 * 
 * EXEMPLO:
 * node restore-backup.js backup-2025-12-03T22-41-30.sql
 * 
 * ATENÇÃO:
 * - Este script IRÁ SOBRESCREVER todos os dados atuais!
 * - Certifique-se de fazer um backup antes de restaurar
 * - Use apenas em caso de emergência ou migração
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function restoreBackup(backupFilename) {
    // Verificar se o arquivo existe
    const backupPath = path.join(__dirname, 'backups', backupFilename);

    if (!fs.existsSync(backupPath)) {
        console.error(`❌ Arquivo de backup não encontrado: ${backupPath}`);
        console.log(`\n📁 Backups disponíveis em: ${path.join(__dirname, 'backups')}`);
        process.exit(1);
    }

    console.log('⚠️  ATENÇÃO: Este script irá SOBRESCREVER todos os dados do banco!');
    console.log(`📄 Arquivo: ${backupFilename}`);
    console.log(`💾 Banco: ${process.env.DB_NAME}`);
    console.log('');
    console.log('⏳ Aguardando 5 segundos... (Ctrl+C para cancelar)');

    await new Promise(resolve => setTimeout(resolve, 5000));

    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'software-jurisconnect'
    });

    try {
        console.log('\n🔌 Conectando ao banco de dados...');
        await client.connect();
        console.log('✅ Conectado!\n');

        // Ler arquivo de backup
        console.log('📖 Lendo arquivo de backup...');
        const sqlContent = fs.readFileSync(backupPath, 'utf8');

        // Dividir em comandos SQL individuais
        const sqlCommands = sqlContent
            .split('\n')
            .filter(line => line.trim() && !line.trim().startsWith('--'))
            .join('\n')
            .split(';')
            .filter(cmd => cmd.trim());

        console.log(`📝 Encontrados ${sqlCommands.length} comandos SQL\n`);

        // Executar cada comando
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < sqlCommands.length; i++) {
            const cmd = sqlCommands[i].trim();
            if (!cmd) continue;

            try {
                await client.query(cmd);
                successCount++;

                // Mostrar progresso a cada 100 comandos
                if ((i + 1) % 100 === 0) {
                    console.log(`⏳ Processados ${i + 1}/${sqlCommands.length} comandos...`);
                }
            } catch (error) {
                errorCount++;
                console.error(`❌ Erro no comando ${i + 1}:`);
                console.error(`   ${cmd.substring(0, 100)}...`);
                console.error(`   ${error.message}\n`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 RESULTADO DA RESTAURAÇÃO');
        console.log('='.repeat(60));
        console.log(`✅ Comandos executados com sucesso: ${successCount}`);
        console.log(`❌ Comandos com erro: ${errorCount}`);
        console.log(`📄 Total de comandos: ${sqlCommands.length}`);
        console.log('='.repeat(60));

        if (errorCount === 0) {
            console.log('\n🎉 Backup restaurado com SUCESSO!');
        } else {
            console.log('\n⚠️  Backup restaurado com ALGUNS ERROS');
            console.log('   Revise os erros acima para mais detalhes');
        }

        await client.end();
    } catch (error) {
        console.error('\n❌ ERRO FATAL:', error.message);
        await client.end();
        process.exit(1);
    }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('❌ Uso: node restore-backup.js <nome-do-arquivo-backup.sql>');
    console.log('\n📁 Backups disponíveis:');

    const backupsDir = path.join(__dirname, 'backups');
    if (fs.existsSync(backupsDir)) {
        const files = fs.readdirSync(backupsDir)
            .filter(f => f.endsWith('.sql'))
            .sort()
            .reverse();

        if (files.length === 0) {
            console.log('   (nenhum backup encontrado)');
        } else {
            files.forEach((file, i) => {
                const stats = fs.statSync(path.join(backupsDir, file));
                const size = (stats.size / 1024).toFixed(2);
                console.log(`   ${i + 1}. ${file} (${size} KB)`);
            });
        }
    }
    process.exit(1);
}

const backupFilename = args[0];
restoreBackup(backupFilename);
