const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const config = require('./src/config/database.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false,
    }
);

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado ao banco de dados.');

        // 1. Criar Usuário Admin
        const senhaHash = await bcrypt.hash('admin123', 10);
        await sequelize.query(`
      INSERT INTO usuarios (nome, email, senha_hash, role, ativo, created_at, updated_at)
      VALUES ('Administrador', 'admin@jurisconnect.com.br', '${senhaHash}', 'admin', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `);

        const [admin] = await sequelize.query(`SELECT id FROM usuarios WHERE email = 'admin@jurisconnect.com.br'`);
        console.log('✅ Usuário admin verificado/criado (admin@jurisconnect.com.br / admin123)');

        // 2. Criar Especialidades
        await sequelize.query(`
      INSERT INTO especialidades (nome, descricao, created_at, updated_at) VALUES
      ('Civil', 'Direito Civil e Processual Civil', NOW(), NOW()),
      ('Trabalhista', 'Direito do Trabalho', NOW(), NOW()),
      ('Tributário', 'Direito Tributário', NOW(), NOW()),
      ('Penal', 'Direito Penal', NOW(), NOW()),
      ('Empresarial', 'Direito Empresarial', NOW(), NOW())
      ON CONFLICT (nome) DO NOTHING;
    `);
        console.log('✅ Especialidades criadas');

        // 3. Criar Tags
        await sequelize.query(`
      INSERT INTO tags (nome, cor, icone, descricao, created_at, updated_at) VALUES
      ('Urgente', '#EF4444', '🔥', 'Demandas que requerem atenção imediata', NOW(), NOW()),
      ('Importante', '#F59E0B', '⭐', 'Demandas de alta relevância', NOW(), NOW()),
      ('Revisão', '#8B5CF6', '👀', 'Necessita revisão de um superior', NOW(), NOW()),
      ('Aguardando Cliente', '#3B82F6', '👤', 'Esperando documentos ou resposta do cliente', NOW(), NOW()),
      ('Monitoramento', '#10B981', '📡', 'Acompanhamento constante necessário', NOW(), NOW())
      ON CONFLICT (nome) DO NOTHING;
    `);
        console.log('✅ Tags criadas');

        // 4. Criar Clientes de Teste
        await sequelize.query(`
      INSERT INTO clientes (
        tipo_pessoa, nome_fantasia, razao_social, cpf_cnpj, 
        email, telefone, cidade, estado, created_at, updated_at
      ) VALUES
      ('juridica', 'Tech Solutions', 'Tech Solutions Ltda', '12345678000199', 
       'contato@techsolutions.com', '11999999999', 'São Paulo', 'SP', NOW(), NOW()),
      ('fisica', 'João da Silva', NULL, '12345678900', 
       'joao@email.com', '11988888888', 'Rio de Janeiro', 'RJ', NOW(), NOW())
      ON CONFLICT (cpf_cnpj) DO NOTHING;
    `);

        // Buscar IDs dos clientes
        const [clientes] = await sequelize.query(`SELECT id FROM clientes ORDER BY id`);
        console.log('✅ Clientes de teste criados');

        // 5. Criar Correspondentes de Teste
        await sequelize.query(`
      INSERT INTO correspondentes (
        tipo, nome_fantasia, email, telefone, cidade_sediado, estado_sediado, 
        oab_numero, oab_estado, created_at, updated_at
      ) VALUES
      ('advogado', 'Dr. Carlos Mendes', 'carlos@adv.com', '11977777777', 
       'Campinas', 'SP', '123456', 'SP', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
        console.log('✅ Correspondentes de teste criados');

        // 6. Criar Demandas de Teste
        if (clientes.length >= 2 && admin[0]) {
            await sequelize.query(`
        INSERT INTO demandas (
          numero, titulo, descricao, tipo_demanda, status, prioridade,
          data_prazo, valor_estimado, cliente_id, criado_por, created_at, updated_at
        ) VALUES
        ('2025-01-001', 'Ação de Cobrança - Tech Solutions', 'Cobrança de duplicatas vencidas', 
         'diligencia', 'pendente', 'alta', NOW() + INTERVAL '15 days', 5000.00, 
         ${clientes[0].id}, ${admin[0].id}, NOW(), NOW()),
        ('2025-01-002', 'Audiência Trabalhista - João', 'Audiência de instrução', 
         'audiencia', 'pendente', 'media', NOW() + INTERVAL '30 days', 1500.00, 
         ${clientes[1].id}, ${admin[0].id}, NOW(), NOW())
        ON CONFLICT (numero) DO NOTHING;
      `);
            console.log('✅ Demandas de teste criadas');
        }

        console.log('\n🎉 Seed concluído com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao rodar seed:', error);
        process.exit(1);
    }
}

seed();
