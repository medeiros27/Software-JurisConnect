/**
 * Script para criar database e testar conexão
 */

require('dotenv').config();
const { Client } = require('pg');

async function setupDatabase() {
    // Conectar ao postgres padrão para criar o banco
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '1234',
        database: 'postgres', // Conecta ao postgres padrão primeiro
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao PostgreSQL!');

        // Verificar se o banco já existe
        const checkDb = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = 'software-jurisconnect'`
        );

        if (checkDb.rows.length === 0) {
            console.log('📦 Criando database software-jurisconnect...');
            await client.query('CREATE DATABASE "software-jurisconnect"');
            console.log('✅ Database criado com sucesso!');
        } else {
            console.log('ℹ️  Database software-jurisconnect já existe');
        }

        await client.end();

        // Testar conexão com o novo banco
        const testClient = new Client({
            host: 'localhost',
            port: 5432,
            user: 'postgres',
            password: '1234',
            database: 'software-jurisconnect',
        });

        await testClient.connect();
        console.log('✅ Conexão com software-jurisconnect OK!');

        const result = await testClient.query('SELECT NOW()');
        console.log('🕐 Hora do servidor:', result.rows[0].now);

        await testClient.end();

        console.log('\n🎉 Tudo pronto! Agora você pode rodar:');
        console.log('   npm run migrate');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    }
}

setupDatabase();
