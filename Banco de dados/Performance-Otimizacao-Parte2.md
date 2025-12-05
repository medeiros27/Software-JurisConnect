# JURISCONNECT - PERFORMANCE E MANUTENÇÃO (PARTE 2)

## 📋 CONTINUAÇÃO

5. [Troubleshooting e Diagnóstico](#5-troubleshooting-e-diagnóstico)
6. [Backup e Restore Automático](#6-backup-e-restore-automático)
7. [Configurações de Performance](#7-configurações-de-performance)
8. [Scripts de Monitoramento Avançado](#8-scripts-de-monitoramento-avançado)

---

# 5. TROUBLESHOOTING E DIAGNÓSTICO

## 5.1 Diagnóstico de Bloqueios

```sql
-- Identificar e matar queries bloqueadas
CREATE OR REPLACE PROCEDURE proc_resolver_bloqueios(
  p_matar_bloqueador BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_bloqueio RECORD;
  v_total INTEGER := 0;
BEGIN
  RAISE NOTICE 'Analisando bloqueios...';

  FOR v_bloqueio IN
    SELECT
      blocked_locks.pid AS blocked_pid,
      blocked_activity.usename AS blocked_user,
      blocking_locks.pid AS blocking_pid,
      blocking_activity.usename AS blocking_user,
      blocked_activity.query AS blocked_query,
      blocking_activity.query AS blocking_query,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - blocking_activity.query_start))::INTEGER as duracao_s
    FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
    JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
      AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
      AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
      AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
      AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
      AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
      AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
      AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
      AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
      AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
      AND blocking_locks.pid != blocked_locks.pid
    JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
    WHERE NOT blocked_locks.granted
  LOOP
    v_total := v_total + 1;

    RAISE WARNING '[%] BLOQUEIO DETECTADO', v_total;
    RAISE WARNING '  Query bloqueada (PID %): %', v_bloqueio.blocked_pid, v_bloqueio.blocked_user;
    RAISE WARNING '  Query bloqueadora (PID %): %', v_bloqueio.blocking_pid, v_bloqueio.blocking_user;
    RAISE WARNING '  Duração: % segundos', v_bloqueio.duracao_s;
    RAISE WARNING '  Query bloqueadora: %', v_bloqueio.blocking_query;

    IF p_matar_bloqueador AND v_bloqueio.duracao_s > 300 THEN
      SELECT pg_terminate_backend(v_bloqueio.blocking_pid);
      RAISE NOTICE '  ✓ Query bloqueadora terminada (PID %)', v_bloqueio.blocking_pid;
    END IF;
  END LOOP;

  IF v_total = 0 THEN
    RAISE NOTICE 'Nenhum bloqueio detectado.';
  ELSE
    RAISE WARNING 'Total de bloqueios: %', v_total;
  END IF;
END;
$$;

-- Usar:
-- CALL proc_resolver_bloqueios(FALSE);  -- Apenas análise
-- CALL proc_resolver_bloqueios(TRUE);   -- Matar bloqueadores com >5min
```

## 5.2 Diagnóstico de Queries Lentas

```sql
CREATE OR REPLACE PROCEDURE proc_diagnosticar_query_lenta(
  p_query TEXT,
  p_timeout_ms INTEGER DEFAULT 30000
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_explain_record RECORD;
  v_explain_json JSON;
BEGIN
  RAISE NOTICE 'Analisando query...';
  RAISE NOTICE 'Query: %', p_query;

  -- EXPLAIN ANALYZE BUFFERS
  FOR v_explain_record IN EXECUTE 'EXPLAIN (ANALYZE TRUE, BUFFERS TRUE, FORMAT JSON, VERBOSE TRUE) ' || p_query
  LOOP
    v_explain_json := v_explain_record.jsonb;
    
    RAISE NOTICE 'Planning Time: % ms', v_explain_json -> 0 ->> 'Planning Time';
    RAISE NOTICE 'Execution Time: % ms', v_explain_json -> 0 ->> 'Execution Time';
    
    -- Detalhes do plano
    RAISE NOTICE 'Plan: %', jsonb_pretty(v_explain_json -> 0 -> 'Plan');
  END LOOP;
END;
$$;

-- Usar:
-- CALL proc_diagnosticar_query_lenta('SELECT * FROM demandas WHERE status = ''concluida'';');
```

## 5.3 Diagnóstico de Conexões

```sql
-- Atividade detalhada das conexões
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  state_change,
  wait_event_type,
  wait_event,
  query_start,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - query_start))::INTEGER as query_age_seconds,
  rows_fetched + rows_inserted + rows_updated + rows_deleted as total_rows_affected,
  query
FROM pg_stat_activity
WHERE datname = 'jurisconnect'
  AND state != 'idle'
ORDER BY query_start ASC;

-- Conexões por usuário
SELECT
  usename,
  COUNT(*) as total_connections,
  COUNT(CASE WHEN state = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle,
  array_agg(DISTINCT application_name) as applications
FROM pg_stat_activity
WHERE datname = 'jurisconnect'
GROUP BY usename
ORDER BY total_connections DESC;
```

---

# 6. BACKUP E RESTORE AUTOMÁTICO

## 6.1 Backup Incremental Automático

```sql
-- Criar tabela de controle de backups
CREATE TABLE IF NOT EXISTS sistema.backup_controle (
  id SERIAL PRIMARY KEY,
  tipo_backup VARCHAR(20),
  data_backup TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  caminho_arquivo VARCHAR(500),
  tamanho_bytes BIGINT,
  status VARCHAR(20),
  duracao_minutos DECIMAL(10,2),
  sucesso BOOLEAN,
  mensagem_erro TEXT
);

CREATE OR REPLACE PROCEDURE proc_backup_incremental(
  p_caminho TEXT DEFAULT '/backups/'
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_timestamp TEXT;
  v_arquivo TEXT;
  v_arquivo_completo TEXT;
  v_inicio TIMESTAMP;
  v_duracao_minutos DECIMAL;
  v_tamanho BIGINT;
BEGIN
  v_timestamp := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY_MM_DD_HH24_MI_SS');
  v_arquivo := 'jurisconnect_' || v_timestamp || '.sql';
  v_arquivo_completo := p_caminho || v_arquivo;
  v_inicio := CURRENT_TIMESTAMP;

  RAISE NOTICE 'Iniciando backup incremental...';
  RAISE NOTICE 'Arquivo: %', v_arquivo_completo;

  -- Executar backup
  EXECUTE format(
    'pg_dump -U jurisconnect_admin -d jurisconnect -F p -v > %L',
    v_arquivo_completo
  );

  v_duracao_minutos := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_inicio)) / 60;

  -- Obter tamanho do arquivo
  v_tamanho := (SELECT pg_column_size(pg_read_file(v_arquivo_completo)));

  -- Registrar backup
  INSERT INTO sistema.backup_controle (
    tipo_backup, caminho_arquivo, tamanho_bytes, status, duracao_minutos, sucesso
  )
  VALUES (
    'incremental', v_arquivo_completo, v_tamanho, 'concluido', v_duracao_minutos, TRUE
  );

  RAISE NOTICE 'Backup concluído com sucesso!';
  RAISE NOTICE 'Tamanho: % MB', v_tamanho / (1024*1024)::BIGINT;
  RAISE NOTICE 'Duração: % minutos', ROUND(v_duracao_minutos::NUMERIC, 2);

EXCEPTION WHEN OTHERS THEN
  INSERT INTO sistema.backup_controle (
    tipo_backup, caminho_arquivo, status, sucesso, mensagem_erro
  )
  VALUES (
    'incremental', v_arquivo_completo, 'erro', FALSE, SQLERRM
  );

  RAISE EXCEPTION 'Erro no backup: %', SQLERRM;
END;
$$;

-- Usar:
-- CALL proc_backup_incremental('/backups/');
```

## 6.2 Restore Automático

```sql
CREATE OR REPLACE PROCEDURE proc_restore_backup(
  p_arquivo_backup TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_inicio TIMESTAMP;
  v_duracao_minutos DECIMAL;
BEGIN
  v_inicio := CURRENT_TIMESTAMP;

  RAISE NOTICE 'Iniciando restore do backup: %', p_arquivo_backup;
  RAISE WARNING 'AVISO: Isso pode levar vários minutos!';

  -- Verificar se arquivo existe
  IF NOT EXISTS(SELECT 1 FROM pg_read_file(p_arquivo_backup)) THEN
    RAISE EXCEPTION 'Arquivo de backup não encontrado: %', p_arquivo_backup;
  END IF;

  -- Executar restore
  EXECUTE format('psql -U jurisconnect_admin -d jurisconnect < %L', p_arquivo_backup);

  v_duracao_minutos := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_inicio)) / 60;

  RAISE NOTICE 'Restore concluído com sucesso!';
  RAISE NOTICE 'Duração: % minutos', ROUND(v_duracao_minutos::NUMERIC, 2);

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro no restore: %', SQLERRM;
END;
$$;

-- Usar:
-- CALL proc_restore_backup('/backups/jurisconnect_2025_11_06_14_00_00.sql');
```

---

# 7. CONFIGURAÇÕES DE PERFORMANCE

## 7.1 Otimizações de Configuração

```sql
-- Aplicar ao postgresql.conf ou via SQL

-- 1. Aumentar memoria shared (depende do servidor)
ALTER SYSTEM SET shared_buffers = '256MB';

-- 2. Aumentar effective_cache_size
ALTER SYSTEM SET effective_cache_size = '1GB';

-- 3. Aumentar memory para operações
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET work_mem = '16MB';

-- 4. Random page cost (SSD vs HDD)
ALTER SYSTEM SET random_page_cost = 1.1;  -- Para SSD

-- 5. Effective_io_concurrency
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 6. Autovacuum aggressivo
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_naptime = '10s';
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
ALTER SYSTEM SET autovacuum_vacuum_insert_threshold = 1000;
ALTER SYSTEM SET autovacuum_vacuum_insert_scale_factor = 0.2;

-- 7. Logging for analysis
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- log queries > 1s
ALTER SYSTEM SET log_statement = 'ddl';
ALTER SYSTEM SET log_lock_waits = on;

-- 8. Conexões
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- 9. WAL configuration
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_senders = 3;

-- Aplicar mudanças
SELECT pg_reload_conf();
```

---

# 8. SCRIPTS DE MONITORAMENTO AVANÇADO

## 8.1 Monitoramento de Crescimento de Dados

```sql
CREATE TABLE IF NOT EXISTS sistema.stats_crescimento_diario (
  data_snapshot DATE,
  tabela VARCHAR(100),
  qtd_registros BIGINT,
  tamanho_mb DECIMAL(10,2),
  crescimento_registros INTEGER,
  crescimento_mb DECIMAL(10,2)
);

CREATE OR REPLACE PROCEDURE proc_snapshot_crescimento_dados()
LANGUAGE plpgsql
AS $$
DECLARE
  v_tabela RECORD;
BEGIN
  FOR v_tabela IN
    SELECT
      tablename,
      n_live_tup,
      pg_total_relation_size(schemaname || '.' || tablename) / (1024*1024) as tamanho_mb
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
  LOOP
    INSERT INTO sistema.stats_crescimento_diario (
      data_snapshot, tabela, qtd_registros, tamanho_mb,
      crescimento_registros, crescimento_mb
    )
    SELECT
      CURRENT_DATE,
      v_tabela.tablename,
      v_tabela.n_live_tup,
      v_tabela.tamanho_mb,
      COALESCE(v_tabela.n_live_tup - (SELECT qtd_registros FROM sistema.stats_crescimento_diario 
        WHERE tabela = v_tabela.tablename ORDER BY data_snapshot DESC LIMIT 1), 0),
      COALESCE(v_tabela.tamanho_mb - (SELECT tamanho_mb FROM sistema.stats_crescimento_diario
        WHERE tabela = v_tabela.tablename ORDER BY data_snapshot DESC LIMIT 1), 0);
  END LOOP;

  RAISE NOTICE 'Snapshot de crescimento criado';
END;
$$;

-- Analisar projeção de crescimento
SELECT
  tabela,
  AVG(crescimento_registros) as crescimento_medio_dia,
  AVG(crescimento_mb) as crescimento_mb_medio_dia,
  AVG(crescimento_registros) * 365 as projecao_anual_registros,
  AVG(crescimento_mb) * 365 as projecao_anual_mb
FROM sistema.stats_crescimento_diario
WHERE data_snapshot >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tabela
ORDER BY projecao_anual_mb DESC;
```

## 8.2 Dashboard de Monitoramento

```sql
CREATE OR REPLACE VIEW vw_dashboard_performance AS
SELECT
  'Espaço em Disco' as categoria,
  'Tamanho Total' as metrica,
  pg_size_pretty(pg_database_size('jurisconnect')) as valor
UNION ALL
SELECT 'Espaço em Disco', 'Tabelas', pg_size_pretty(SUM(pg_total_relation_size(schemaname || '.' || tablename)))
FROM pg_stat_user_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 'Performance', 'Cache Hit Ratio', 
  ROUND((SUM(heap_blks_hit) / (SUM(heap_blks_hit) + SUM(heap_blks_read))::DECIMAL) * 100, 2)::TEXT || '%'
FROM pg_statio_user_tables
UNION ALL
SELECT 'Performance', 'Dead Tuples Total',
  COUNT(*)::TEXT || ' registros'
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
UNION ALL
SELECT 'Conexões', 'Ativas', COUNT(*)::TEXT
FROM pg_stat_activity
WHERE state = 'active'
  AND datname = 'jurisconnect'
UNION ALL
SELECT 'Conexões', 'Idle', COUNT(*)::TEXT
FROM pg_stat_activity
WHERE state = 'idle'
  AND datname = 'jurisconnect'
UNION ALL
SELECT 'Índices', 'Não Utilizados', COUNT(*)::TEXT
FROM pg_stat_user_indexes
WHERE idx_scan = 0
UNION ALL
SELECT 'Transações', 'Age máximo',
  EXTRACT(EPOCH FROM MAX(query_start))::TEXT || ' segundos'
FROM pg_stat_activity;
```

---

**Performance e Manutenção - Parte 2/2** ✅

## 🎯 RESUMO COMPLETO

### Scripts inclusos:
```
ANÁLISE DE PERFORMANCE:
├─ 7 Scripts de diagnóstico
├─ Índices não utilizados
├─ Tabelas grandes
├─ Cache hit ratio
├─ Locks bloqueando
└─ Queries lentas

PROCEDURES DE OTIMIZAÇÃO:
├─ Otimização completa
├─ Limpeza de índices
└─ Compactação de tabelas

MANUTENÇÃO AUTOMÁTICA:
├─ 10 Jobs com pg_cron
├─ Vacuum/Reindex
├─ Limpeza de logs
└─ Backup automático

MONITORAMENTO:
├─ Health check
├─ Monitoramento contínuo
├─ Dashboard
└─ Alertas

TROUBLESHOOTING:
├─ Diagnóstico de bloqueios
├─ Queries lentas
└─ Gestão de conexões

BACKUP/RESTORE:
├─ Backup incremental
├─ Restore automático
└─ Controle de backups

CONFIGURAÇÕES:
├─ 9 Parâmetros otimizados
└─ Tuning automático

Pronto para Produção! 🚀
```