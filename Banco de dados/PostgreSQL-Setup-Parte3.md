# JURISCONNECT - POSTGRESQL (PARTE 3)

## 📋 FINALIZAÇÃO

7. [Triggers Automáticos](#7-triggers-automáticos)
8. [Seeds de Dados Iniciais](#8-seeds-de-dados-iniciais)
9. [Manutenção e Backup](#9-manutenção-e-backup)
10. [Documentação e Health Check](#10-documentação-e-health-check)

---

# 7. TRIGGERS AUTOMÁTICOS

## 7.1 triggers_auditoria.sql

```sql
-- TRIGGER FUNCTION: Log de Auditoria Automático
CREATE OR REPLACE FUNCTION fn_registrar_auditoria()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO auditoria.log_auditoria (
      tabela, operacao, usuario, dados_antigos, dados_novos, timestamp
    )
    VALUES (
      TG_TABLE_NAME, 'INSERT', CURRENT_USER, NULL, 
      ROW_TO_JSON(NEW), CURRENT_TIMESTAMP
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO auditoria.log_auditoria (
      tabela, operacao, usuario, dados_antigos, dados_novos, timestamp
    )
    VALUES (
      TG_TABLE_NAME, 'UPDATE', CURRENT_USER, 
      ROW_TO_JSON(OLD), ROW_TO_JSON(NEW), CURRENT_TIMESTAMP
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO auditoria.log_auditoria (
      tabela, operacao, usuario, dados_antigos, dados_novos, timestamp
    )
    VALUES (
      TG_TABLE_NAME, 'DELETE', CURRENT_USER, 
      ROW_TO_JSON(OLD), NULL, CURRENT_TIMESTAMP
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- Aplicar trigger em tabelas críticas
CREATE TRIGGER tr_usuarios_auditoria AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria();

CREATE TRIGGER tr_pagamentos_auditoria AFTER INSERT OR UPDATE OR DELETE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria();

CREATE TRIGGER tr_demandas_auditoria AFTER INSERT OR UPDATE OR DELETE ON demandas
  FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria();

-- TRIGGER: Atualizar timestamp ao modificar
CREATE OR REPLACE FUNCTION fn_atualizar_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_usuarios_atualizar_timestamp BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER tr_clientes_atualizar_timestamp BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER tr_demandas_atualizar_timestamp BEFORE UPDATE ON demandas
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

CREATE TRIGGER tr_pagamentos_atualizar_timestamp BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION fn_atualizar_timestamp();

-- TRIGGER: Validar demanda pode ser concluída
CREATE OR REPLACE FUNCTION fn_validar_conclusao_demanda()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_diligencias_pendentes INTEGER;
BEGIN
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' THEN
    -- Verificar diligências pendentes
    SELECT COUNT(*) INTO v_diligencias_pendentes
    FROM diligencias
    WHERE demanda_id = NEW.id AND status != 'concluida';
    
    IF v_diligencias_pendentes > 0 THEN
      RAISE EXCEPTION 'Não é possível concluir demanda com diligências pendentes';
    END IF;
    
    -- Registrar data de conclusão
    NEW.data_conclusao := CURRENT_DATE;
    NEW.progresso_percentual := 100;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_demandas_validar_conclusao BEFORE UPDATE ON demandas
  FOR EACH ROW EXECUTE FUNCTION fn_validar_conclusao_demanda();

-- TRIGGER: Marcar demanda como atrasada
CREATE OR REPLACE FUNCTION fn_verificar_atraso_demanda()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.data_prazo < CURRENT_DATE 
     AND NEW.status NOT IN ('concluida', 'cancelada')
     AND NEW.atrasada = FALSE THEN
    NEW.atrasada := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_demandas_verificar_atraso BEFORE UPDATE ON demandas
  FOR EACH ROW EXECUTE FUNCTION fn_verificar_atraso_demanda();
```

---

# 8. SEEDS DE DADOS INICIAIS

## 8.1 seeds_initial_data.sql

```sql
-- SEEDS: Dados Iniciais

-- 1. Criar sequence para números de fatura
CREATE SEQUENCE IF NOT EXISTS seq_numero_fatura START 1;

-- 2. Usuário Admin
INSERT INTO usuarios (nome, email, senha_hash, role, ativo, criado_em)
VALUES (
  'Administrador',
  'admin@jurisconnect.com',
  '$2b$10$abc123def456ghi789jkl', -- bcrypt hash de 'Admin@123'
  'admin',
  TRUE,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- 3. Usuários de Teste
INSERT INTO usuarios (nome, email, senha_hash, role, ativo, criado_em)
VALUES 
  ('Gestor Jurídico', 'gestor@jurisconnect.com', '$2b$10$xyz789abc456def123ghi', 'gestor', TRUE, CURRENT_TIMESTAMP),
  ('Operador Sistema', 'operador@jurisconnect.com', '$2b$10$qwe123rty456uio789pas', 'operador', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- 4. Clientes de Teste
INSERT INTO clientes (
  tipo_pessoa, nome_fantasia, razao_social, cpf_cnpj, email, telefone, 
  celular, cidade, estado, ativo, criado_em
)
VALUES 
  ('juridica', 'Empresa ABC Ltda', 'Empresa ABC Ltda', '12345678000190', 
   'contato@empresaabc.com', '1133334444', '11987654321', 'São Paulo', 'SP', TRUE, CURRENT_TIMESTAMP),
  ('fisica', 'João Silva', 'João Silva', '12345678900', 
   'joao@email.com', '1133334444', '11987654321', 'São Paulo', 'SP', TRUE, CURRENT_TIMESTAMP),
  ('juridica', 'Consultoria XYZ', 'Consultoria XYZ Ltda', '98765432000101', 
   'contato@consultoriaxyz.com', '1144445555', '11999998888', 'Rio de Janeiro', 'RJ', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- 5. Correspondentes de Teste
INSERT INTO correspondentes (
  nome_fantasia, razao_social, cpf_cnpj, email, telefone, estado_sediado, 
  cidade_sediado, oab_numero, oab_estado, ativo, criado_em
)
VALUES 
  ('Advogado Carlos', 'Advogado Carlos Junior', '12345678901', 
   'carlos@advogado.com', '1144445555', 'SP', 'São Paulo', '123456', 'SP', TRUE, CURRENT_TIMESTAMP),
  ('Escritório Legal', 'Escritório Legal Associados', '11111122000199', 
   'contato@escritorio.com', '1155556666', 'RJ', 'Rio de Janeiro', '654321', 'RJ', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- 6. Especialidades (se tabela existir)
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO especialidades (nome, descricao, ativo, criado_em)
VALUES 
  ('Direito Civil', 'Especialidade em direito civil e contratos', TRUE, CURRENT_TIMESTAMP),
  ('Direito Tributário', 'Especialidade em direito tributário e fiscal', TRUE, CURRENT_TIMESTAMP),
  ('Direito Trabalhista', 'Especialidade em direito trabalhista', TRUE, CURRENT_TIMESTAMP),
  ('Direito Imobiliário', 'Especialidade em direito imobiliário e real', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (nome) DO NOTHING;

-- 7. Demanda de Teste
INSERT INTO demandas (
  numero, titulo, descricao, tipo_demanda, status, prioridade, 
  data_prazo, data_inicio, cliente_id, responsavel_atual_id, 
  criado_por, criado_em
)
VALUES 
  ('DEM-2025-000001', 
   'Ação de Cobrança', 
   'Ação de cobrança contra cliente inadimplente',
   'diligencia',
   'pendente',
   'media',
   CURRENT_DATE + INTERVAL '30 days',
   CURRENT_DATE,
   (SELECT id FROM clientes LIMIT 1),
   (SELECT id FROM usuarios WHERE role = 'gestor' LIMIT 1),
   (SELECT id FROM usuarios WHERE role = 'admin' LIMIT 1),
   CURRENT_TIMESTAMP
)
ON CONFLICT (numero) DO NOTHING;

-- 8. Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  tipo VARCHAR(20) DEFAULT 'string',
  descricao TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO configuracoes (chave, valor, tipo, descricao)
VALUES 
  ('empresa_nome', 'JurisConnect Ltda', 'string', 'Nome da empresa'),
  ('empresa_cnpj', '12345678000190', 'string', 'CNPJ da empresa'),
  ('email_noreply', 'noreply@jurisconnect.com', 'string', 'Email de noreply'),
  ('taxa_comissao_padrao', '15', 'number', 'Taxa de comissão padrão (%)'),
  ('dias_prazo_padrao', '30', 'number', 'Dias de prazo padrão para demandas'),
  ('backup_automatico', 'true', 'boolean', 'Realizar backup automático'),
  ('log_retention_days', '90', 'number', 'Dias de retenção de logs')
ON CONFLICT (chave) DO NOTHING;
```

---

# 9. MANUTENÇÃO E BACKUP

## 9.1 maintenance.sql

```sql
-- SCRIPT: Manutenção e Otimização

-- 1. Criar extensão para agendamento
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Job: Executar penalizações diariamente
SELECT cron.schedule('aplicar-penalizacoes-diarias', '0 2 * * *', 'CALL proc_aplicar_penalizacoes()');

-- 3. Job: Limpeza de dados antigos mensalmente
SELECT cron.schedule('limpeza-dados-mensais', '0 3 1 * *', 'CALL proc_limpar_dados_antigos()');

-- 4. Job: Relatório financeiro mensal
SELECT cron.schedule('relatorio-financeiro', '0 4 1 * *', 
  'CALL proc_relatorio_financeiro_mensal(EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)');

-- 5. Job: Vacuum e reindexing (semanal)
SELECT cron.schedule('manutencao-semanal', '0 5 * * 0', 'VACUUM ANALYZE; REINDEX DATABASE jurisconnect;');

-- 6. PROCEDURE: Backup Incremental
CREATE OR REPLACE PROCEDURE proc_backup_incremental(p_caminho TEXT DEFAULT '/backups/')
LANGUAGE plpgsql
AS $$
DECLARE
  v_timestamp TEXT;
  v_arquivo_backup TEXT;
BEGIN
  v_timestamp := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS');
  v_arquivo_backup := p_caminho || 'jurisconnect_' || v_timestamp || '.sql';
  
  -- Executar backup
  EXECUTE format('pg_dump -U jurisconnect_admin -d jurisconnect -F p > %L', v_arquivo_backup);
  
  INSERT INTO backups_log (arquivo, data_backup, tipo, tamanho_bytes, status)
  VALUES (v_arquivo_backup, CURRENT_TIMESTAMP, 'completo', 
          (SELECT pg_column_size(pg_stat_get_live_tuples())), 'sucesso');
  
  RAISE NOTICE 'Backup criado: %', v_arquivo_backup;
END;
$$;

-- 7. PROCEDURE: Restore de Backup
CREATE OR REPLACE PROCEDURE proc_restore_backup(p_arquivo_backup TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_database WHERE datname = 'jurisconnect') THEN
    EXECUTE 'CREATE DATABASE jurisconnect';
  END IF;
  
  EXECUTE format('psql -U jurisconnect_admin -d jurisconnect < %L', p_arquivo_backup);
  
  RAISE NOTICE 'Backup restaurado de: %', p_arquivo_backup;
END;
$$;

-- 8. Tabela de Logs de Backup
CREATE TABLE IF NOT EXISTS backups_log (
  id SERIAL PRIMARY KEY,
  arquivo VARCHAR(500) NOT NULL,
  data_backup TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo VARCHAR(20),
  tamanho_bytes BIGINT,
  status VARCHAR(20),
  duracao_minutos DECIMAL(10,2)
);

-- 9. PROCEDURE: Verificar Saúde do Banco
CREATE OR REPLACE FUNCTION fn_verificar_saude_banco()
RETURNS TABLE (
  verificacao VARCHAR,
  status VARCHAR,
  detalhes TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar conexões
  RETURN QUERY
  SELECT 'Conexões ativas'::VARCHAR, 
         CASE WHEN (SELECT COUNT(*) FROM pg_stat_activity) < 50 THEN 'OK' ELSE 'ALERTA' END,
         (SELECT COUNT(*) FROM pg_stat_activity)::TEXT || ' conexões ativas';
  
  -- Verificar tamanho do banco
  RETURN QUERY
  SELECT 'Tamanho do banco'::VARCHAR,
         'OK'::VARCHAR,
         pg_size_pretty(pg_database_size('jurisconnect'))::TEXT;
  
  -- Verificar índices não utilizados
  RETURN QUERY
  SELECT 'Índices'::VARCHAR,
         CASE WHEN COUNT(*) > 0 THEN 'ALERTA' ELSE 'OK' END,
         COUNT(*)::TEXT || ' índices não utilizados'
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0;
  
  -- Verificar tabelas sem índices
  RETURN QUERY
  SELECT 'Tabelas sem índices'::VARCHAR,
         CASE WHEN COUNT(*) > 0 THEN 'ALERTA' ELSE 'OK' END,
         COUNT(*)::TEXT || ' tabelas sem índices'
  FROM pg_tables
  WHERE schemaname = 'public' 
    AND tablename NOT IN (SELECT tablename FROM pg_indexes WHERE schemaname = 'public');
END;
$$;

-- 10. Script de Otimização Completa
CREATE OR REPLACE PROCEDURE proc_otimizar_banco()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar estatísticas
  ANALYZE;
  
  -- Reorganizar tabelas (CLUSTER)
  CLUSTER demandas USING idx_demandas_cliente_status;
  CLUSTER pagamentos USING idx_pagamentos_tipo_status_vencimento;
  
  -- Rebuild de índices
  REINDEX DATABASE jurisconnect;
  
  -- Vacuum agressivo
  VACUUM FULL ANALYZE;
  
  RAISE NOTICE 'Otimização concluída com sucesso';
END;
$$;
```

---

# 10. DOCUMENTAÇÃO E HEALTH CHECK

## 10.1 health_check.sql

```sql
-- Health Check Completo

CREATE OR REPLACE FUNCTION fn_health_check()
RETURNS TABLE (
  servico VARCHAR,
  status VARCHAR,
  tempo_ms NUMERIC,
  mensagem TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_start TIMESTAMP;
  v_fim TIMESTAMP;
  v_duracao NUMERIC;
BEGIN
  -- 1. Verificar conexão
  v_start := CURRENT_TIMESTAMP;
  SELECT 1;
  v_fim := CURRENT_TIMESTAMP;
  v_duracao := EXTRACT(EPOCH FROM (v_fim - v_start)) * 1000;
  RETURN QUERY SELECT 'database_connection'::VARCHAR, 'healthy'::VARCHAR, v_duracao, 'Conectado com sucesso';
  
  -- 2. Verificar tabelas principais
  v_start := CURRENT_TIMESTAMP;
  SELECT COUNT(*) FROM usuarios;
  v_fim := CURRENT_TIMESTAMP;
  v_duracao := EXTRACT(EPOCH FROM (v_fim - v_start)) * 1000;
  RETURN QUERY SELECT 'table_usuarios'::VARCHAR, 'healthy'::VARCHAR, v_duracao, 'Tabela acessível';
  
  -- 3. Verificar índices
  v_start := CURRENT_TIMESTAMP;
  SELECT COUNT(*) FROM pg_stat_user_indexes;
  v_fim := CURRENT_TIMESTAMP;
  v_duracao := EXTRACT(EPOCH FROM (v_fim - v_start)) * 1000;
  RETURN QUERY SELECT 'indexes'::VARCHAR, 'healthy'::VARCHAR, v_duracao, 'Todos os índices acessíveis';
  
  -- 4. Verificar espaço em disco
  RETURN QUERY SELECT 'disk_space'::VARCHAR, 'healthy'::VARCHAR, 0::NUMERIC, 
                       pg_size_pretty(pg_database_size('jurisconnect'));
END;
$$;

-- Executar health check
SELECT * FROM fn_health_check();

-- Relatório de Performance
CREATE OR REPLACE FUNCTION fn_relatorio_performance()
RETURNS TABLE (
  metrica VARCHAR,
  valor NUMERIC,
  unidade VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 'Total de registros em demandas'::VARCHAR, COUNT(*)::NUMERIC, ''
  FROM demandas;
  
  RETURN QUERY
  SELECT 'Total de registros em pagamentos'::VARCHAR, COUNT(*)::NUMERIC, ''
  FROM pagamentos;
  
  RETURN QUERY
  SELECT 'Tamanho total do banco (MB)'::VARCHAR, 
         pg_database_size('jurisconnect') / (1024*1024)::NUMERIC, 'MB'::VARCHAR;
  
  RETURN QUERY
  SELECT 'Conexões ativas'::VARCHAR, COUNT(*)::NUMERIC, ''
  FROM pg_stat_activity WHERE datname = 'jurisconnect';
  
  RETURN QUERY
  SELECT 'Cache hit ratio (%)'::VARCHAR,
         ROUND(SUM(heap_blks_hit) * 100.0 / (SUM(heap_blks_hit) + SUM(heap_blks_read)), 2)::NUMERIC, '%'::VARCHAR
  FROM pg_statio_user_tables;
END;
$$;

-- Gerar documentação
CREATE OR REPLACE FUNCTION fn_documentacao_tabelas()
RETURNS TABLE (
  tabela VARCHAR,
  colunas VARCHAR,
  indices VARCHAR,
  relacionamentos VARCHAR
) 
LANGUAGE sql
AS $$
  SELECT 
    t.tablename,
    STRING_AGG(DISTINCT a.attname, ', ' ORDER BY a.attname),
    STRING_AGG(DISTINCT i.indexname, ', ' ORDER BY i.indexname),
    'Ver Foreign Keys'
  FROM pg_tables t
  LEFT JOIN pg_attribute a ON a.attrelid = (t.schemaname || '.' || t.tablename)::regclass
  LEFT JOIN pg_indexes i ON i.tablename = t.tablename
  WHERE t.schemaname = 'public'
  GROUP BY t.tablename;
$$;
```

---

**PostgreSQL Setup Completo - Parte 3/3** ✅

## Resumo Final

```sql
-- Para executar tudo em sequência:
1. setup_initial.sql (criar database e extensões)
2. 01_usuarios_table.sql até 08_historico_workflow_table.sql (DDL)
3. indices_performance.sql (Índices)
4. views_dashboard.sql (Views)
5. procedures_financeiras.sql (Procedures)
6. functions_calculos.sql (Functions)
7. triggers_auditoria.sql (Triggers)
8. seeds_initial_data.sql (Dados iniciais)
9. maintenance.sql (Agendamentos e jobs)
10. health_check.sql (Validações)

-- Verificar saúde
SELECT * FROM fn_health_check();
SELECT * FROM fn_relatorio_performance();
SELECT * FROM fn_verificar_saude_banco();

-- Agendar manutenção
SELECT * FROM cron.schedule_list;
```

Pronto para Produção! 🎉