# JURISCONNECT - OTIMIZAÇÃO E MANUTENÇÃO AUTOMÁTICA

## 📋 ÍNDICE

1. [Scripts de Análise de Performance](#1-scripts-de-análise-de-performance)
2. [Procedures de Otimização](#2-procedures-de-otimização)
3. [Manutenção Automática com pg_cron](#3-manutenção-automática-com-pg_cron)
4. [Monitoramento e Health Check](#4-monitoramento-e-health-check)
5. [Troubleshooting e Diagnóstico](#5-troubleshooting-e-diagnóstico)
6. [Backup e Restore Automático](#6-backup-e-restore-automático)

---

# 1. SCRIPTS DE ANÁLISE DE PERFORMANCE

## 1.1 Análise de Índices e Tables

```sql
-- SCRIPT: Identificar Índices Não Utilizados
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho_indice
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- SCRIPT: Identificar Tabelas Grandes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as tamanho_total,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as tamanho_tabela,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - 
                  pg_relation_size(schemaname || '.' || tablename)) as tamanho_indices,
  n_live_tup as registros_vivos,
  n_dead_tup as registros_mortos,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as percentual_dead
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- SCRIPT: Análise de Espaço em Disco
SELECT
  schemaname,
  COUNT(*) as qtd_tabelas,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname || '.' || tablename))) as tamanho_total,
  pg_size_pretty(AVG(pg_total_relation_size(schemaname || '.' || tablename))) as tamanho_medio
FROM pg_stat_user_tables
GROUP BY schemaname
ORDER BY SUM(pg_total_relation_size(schemaname || '.' || tablename)) DESC;

-- SCRIPT: Análise de Cache Hit Ratio
SELECT
  sum(heap_blks_read) as leituras_disco,
  sum(heap_blks_hit) as leituras_cache,
  sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- SCRIPT: Sequências e Autoincrementos Próximos do Limite
SELECT
  schemaname,
  sequencename,
  last_value,
  max_value,
  ROUND(100.0 * last_value / max_value, 2) as percentual_uso
FROM pg_sequences
WHERE last_value > (max_value * 0.8)
ORDER BY percentual_uso DESC;

-- SCRIPT: Conexões Ativas e Bloqueadas
SELECT
  pid,
  usename,
  application_name,
  state,
  query_start,
  state_change,
  query
FROM pg_stat_activity
WHERE state != 'idle'
  AND datname = 'jurisconnect'
ORDER BY query_start ASC;

-- SCRIPT: Locks Bloqueando Outras Queries
SELECT
  blocked_locks.pid AS blocked_pid,
  blocked_activity.usename AS blocked_user,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.usename AS blocking_user,
  blocked_activity.query AS blocked_statement,
  blocking_activity.query AS blocking_statement,
  blocked_activity.application_name AS blocked_application,
  blocking_activity.application_name AS blocking_application
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
WHERE NOT blocked_locks.granted;

-- SCRIPT: Queries Lentas
SELECT
  query,
  calls,
  total_time,
  mean_time,
  ROUND(mean_time::NUMERIC, 2) as tempo_medio_ms,
  max_time,
  rows,
  100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) as cache_hit_ratio
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 20;

-- SCRIPT: Tabelas Precisando VACUUM
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as percentual_mortos,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
  OR (ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) > 20)
ORDER BY n_dead_tup DESC;

-- SCRIPT: Análise de Fragmentação de Índices
SELECT
  schemaname,
  tablename,
  indexname,
  idx_blks_read,
  idx_blks_hit,
  ROUND(100.0 * idx_blks_hit / NULLIF(idx_blks_hit + idx_blks_read, 0), 2) as cache_hit_ratio,
  pg_size_pretty(pg_relation_size(indexrelid)) as tamanho
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

# 2. PROCEDURES DE OTIMIZAÇÃO

## 2.1 Procedure de Otimização Completa

```sql
CREATE OR REPLACE PROCEDURE proc_otimizar_banco_completo(
  p_verbose BOOLEAN DEFAULT TRUE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_inicio TIMESTAMP;
  v_duracao INTEGER;
  v_tabela RECORD;
BEGIN
  v_inicio := CURRENT_TIMESTAMP;

  IF p_verbose THEN
    RAISE NOTICE '=== INICIANDO OTIMIZAÇÃO COMPLETA DO BANCO ===';
    RAISE NOTICE 'Data/Hora: %', TO_CHAR(CURRENT_TIMESTAMP, 'DD/MM/YYYY HH24:MI:SS');
  END IF;

  -- 1. VACUUM ANALYZE
  IF p_verbose THEN RAISE NOTICE '[1/6] Executando VACUUM ANALYZE...'; END IF;
  VACUUM ANALYZE;

  -- 2. REINDEX DATABASE
  IF p_verbose THEN RAISE NOTICE '[2/6] Reindexando banco...'; END IF;
  REINDEX DATABASE jurisconnect;

  -- 3. CLUSTER (reorganizar tabelas pelos índices primários)
  IF p_verbose THEN RAISE NOTICE '[3/6] Clusterizando tabelas...'; END IF;
  FOR v_tabela IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  LOOP
    BEGIN
      EXECUTE 'CLUSTER ' || v_tabela.tablename;
      IF p_verbose THEN RAISE NOTICE '  ✓ Clusterizado: %', v_tabela.tablename; END IF;
    EXCEPTION WHEN OTHERS THEN
      IF p_verbose THEN RAISE NOTICE '  ✗ Erro em cluster %: %', v_tabela.tablename, SQLERRM; END IF;
    END;
  END LOOP;

  -- 4. ANALYZE VERBOSE
  IF p_verbose THEN RAISE NOTICE '[4/6] Atualizando estatísticas...'; END IF;
  ANALYZE VERBOSE;

  -- 5. REFRESH MATERIALIZED VIEWS (se existirem)
  IF p_verbose THEN RAISE NOTICE '[5/6] Atualizando views materializadas...'; END IF;
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY pg_stat_statements;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '  Sem views materializadas para atualizar';
  END;

  -- 6. VACUUM FULL (removção agressiva de blocos vazios)
  IF p_verbose THEN RAISE NOTICE '[6/6] Executando VACUUM FULL...'; END IF;
  VACUUM FULL;

  v_duracao := EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_inicio))::INTEGER;

  IF p_verbose THEN
    RAISE NOTICE '=== OTIMIZAÇÃO CONCLUÍDA COM SUCESSO ===';
    RAISE NOTICE 'Duração: % segundos (% minutos)', v_duracao, ROUND(v_duracao::DECIMAL / 60, 2);
    RAISE NOTICE 'Espaço total ocupado: %', pg_size_pretty(pg_database_size('jurisconnect'));
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Erro durante otimização: %', SQLERRM;
END;
$$;

-- Usar:
-- CALL proc_otimizar_banco_completo(TRUE);
```

## 2.2 Procedure de Limpeza de Índices Não Utilizados

```sql
CREATE OR REPLACE PROCEDURE proc_limpar_indices_nao_utilizados(
  p_executar BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_indice RECORD;
  v_count INTEGER := 0;
  v_tamanho_total BIGINT := 0;
BEGIN
  RAISE NOTICE 'Identificando índices não utilizados...';

  FOR v_indice IN
    SELECT
      schemaname,
      tablename,
      indexname,
      pg_relation_size(indexrelid) as tamanho
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
      AND indexrelname NOT LIKE 'pg_%'
      AND indexrelname NOT IN (
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE constraint_type IN ('PRIMARY KEY', 'UNIQUE')
      )
    ORDER BY pg_relation_size(indexrelid) DESC
  LOOP
    v_count := v_count + 1;
    v_tamanho_total := v_tamanho_total + v_indice.tamanho;

    RAISE NOTICE '  [%] %: % (%.2f MB)',
      v_count,
      v_indice.indexname,
      v_indice.tablename,
      v_indice.tamanho / 1024.0 / 1024.0;

    IF p_executar THEN
      EXECUTE 'DROP INDEX IF EXISTS ' || v_indice.schemaname || '.' || v_indice.indexname;
      RAISE NOTICE '    ✓ Deletado';
    END IF;
  END LOOP;

  IF v_count = 0 THEN
    RAISE NOTICE 'Nenhum índice não utilizado encontrado.';
  ELSE
    RAISE NOTICE 'Total: % índices não utilizados';
    RAISE NOTICE 'Espaço economizado: %.2f MB', v_tamanho_total / 1024.0 / 1024.0;
    IF NOT p_executar THEN
      RAISE NOTICE 'Execute com p_executar=TRUE para deletar os índices.';
    END IF;
  END IF;
END;
$$;

-- Usar:
-- CALL proc_limpar_indices_nao_utilizados(FALSE); -- Apenas análise
-- CALL proc_limpar_indices_nao_utilizados(TRUE);  -- Deletar
```

## 2.3 Procedure de Compactação de Tabelas

```sql
CREATE OR REPLACE PROCEDURE proc_compactar_tabelas(
  p_percentual_threshold INTEGER DEFAULT 30
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tabela RECORD;
  v_percentual_mortos DECIMAL;
  v_compactadas INTEGER := 0;
BEGIN
  RAISE NOTICE 'Iniciando compactação de tabelas (threshold: %% mortos)...', p_percentual_threshold;

  FOR v_tabela IN
    SELECT
      schemaname,
      tablename,
      n_dead_tup,
      n_live_tup,
      ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as percentual_mortos
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
  LOOP
    IF v_tabela.percentual_mortos > p_percentual_threshold THEN
      v_compactadas := v_compactadas + 1;

      RAISE NOTICE '[%] Compactando %: %.2f%% mortos (%d registros)',
        v_compactadas,
        v_tabela.tablename,
        v_tabela.percentual_mortos,
        v_tabela.n_dead_tup;

      -- VACUUM FULL sem lock excessivo
      EXECUTE 'VACUUM FULL ANALYZE ' || v_tabela.schemaname || '.' || v_tabela.tablename;

      RAISE NOTICE '  ✓ Concluído';
    END IF;
  END LOOP;

  IF v_compactadas = 0 THEN
    RAISE NOTICE 'Nenhuma tabela precisa compactação.';
  ELSE
    RAISE NOTICE 'Total de tabelas compactadas: %', v_compactadas;
  END IF;
END;
$$;

-- Usar:
-- CALL proc_compactar_tabelas(30);
```

---

# 3. MANUTENÇÃO AUTOMÁTICA COM pg_cron

## 3.1 Agendamento de Manutenção

```sql
-- Criar extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. VACUUM diário (02:00 AM)
SELECT cron.schedule('vacuum-diario', '0 2 * * *', 'VACUUM ANALYZE;');

-- 2. REINDEX semanal (domingo 03:00 AM)
SELECT cron.schedule('reindex-semanal', '0 3 * * 0', 'REINDEX DATABASE jurisconnect;');

-- 3. Compactação mensal (1º do mês 04:00 AM)
SELECT cron.schedule(
  'compactacao-mensal',
  '0 4 1 * *',
  'CALL proc_compactar_tabelas(25);'
);

-- 4. Limpeza de logs antigos (05:00 AM diariamente)
SELECT cron.schedule(
  'limpeza-logs-diaria',
  '0 5 * * *',
  'DELETE FROM auditoria.log_usuarios WHERE DATE(timestamp) < CURRENT_DATE - INTERVAL ''90 days'';
  DELETE FROM auditoria.log_acesso_sensivel WHERE DATE(timestamp) < CURRENT_DATE - INTERVAL ''180 days'';'
);

-- 5. Arquivamento de auditoria (primeiro dia do mês 06:00 AM)
SELECT cron.schedule(
  'arquivo-auditoria-mensal',
  '0 6 1 * *',
  'CALL auditoria.proc_arquivar_logs_antigos(365);'
);

-- 6. Atualização de estatísticas (a cada 6 horas)
SELECT cron.schedule(
  'analyze-cada-6h',
  '0 */6 * * *',
  'ANALYZE;'
);

-- 7. Verificação de autovacuum (a cada 12 horas)
SELECT cron.schedule(
  'autovacuum-check',
  '0 */12 * * *',
  'CALL proc_relatorio_vacuum_status();'
);

-- 8. Health check (a cada 1 hora)
SELECT cron.schedule(
  'health-check-horario',
  '0 * * * *',
  'CALL proc_health_check_database();'
);

-- 9. Backup incremental (diariamente 01:00 AM)
SELECT cron.schedule(
  'backup-diario',
  '0 1 * * *',
  'CALL proc_backup_incremental(''/backups/'');'
);

-- 10. Relatório de performance (segunda-feira 07:00 AM)
SELECT cron.schedule(
  'relatorio-performance',
  '0 7 * * 1',
  'CALL proc_relatorio_performance_semanal();'
);

-- Listar todos os jobs agendados
SELECT jobname, schedule, command FROM cron.job;

-- Deletar um job
SELECT cron.unschedule('vacuum-diario');
```

---

# 4. MONITORAMENTO E HEALTH CHECK

## 4.1 Health Check Automático

```sql
CREATE OR REPLACE PROCEDURE proc_health_check_database()
LANGUAGE plpgsql
AS $$
DECLARE
  v_resultado RECORD;
  v_alertas INTEGER := 0;
BEGIN
  CREATE TEMP TABLE temp_health_check (
    verificacao VARCHAR,
    status VARCHAR,
    valor VARCHAR,
    alerta BOOLEAN
  );

  -- 1. Tamanho do banco
  INSERT INTO temp_health_check
  SELECT
    'Tamanho do Banco',
    'OK',
    pg_size_pretty(pg_database_size('jurisconnect')),
    FALSE;

  -- 2. Conexões ativas
  INSERT INTO temp_health_check
  SELECT
    'Conexões Ativas',
    CASE WHEN COUNT(*) > 50 THEN 'ALERTA' ELSE 'OK' END,
    COUNT(*) || ' conexões',
    COUNT(*) > 50
  FROM pg_stat_activity
  WHERE datname = 'jurisconnect';

  -- 3. Locks bloqueando
  INSERT INTO temp_health_check
  SELECT
    'Locks Bloqueando',
    CASE WHEN COUNT(*) > 0 THEN 'CRÍTICO' ELSE 'OK' END,
    COUNT(*) || ' locks',
    COUNT(*) > 0
  FROM pg_stat_activity
  WHERE wait_event_type IS NOT NULL
    AND datname = 'jurisconnect';

  -- 4. Queries lentas
  INSERT INTO temp_health_check
  SELECT
    'Queries Lentas (>5s)',
    CASE WHEN COUNT(*) > 0 THEN 'ALERTA' ELSE 'OK' END,
    COUNT(*) || ' queries',
    COUNT(*) > 0
  FROM pg_stat_activity
  WHERE EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - query_start)) > 5
    AND datname = 'jurisconnect';

  -- 5. Cache hit ratio
  INSERT INTO temp_health_check
  SELECT
    'Cache Hit Ratio',
    CASE WHEN ratio < 0.99 THEN 'ALERTA' ELSE 'OK' END,
    ROUND((ratio * 100)::NUMERIC, 2) || '%',
    ratio < 0.99
  FROM (
    SELECT
      SUM(heap_blks_hit) / (SUM(heap_blks_hit) + SUM(heap_blks_read))::DECIMAL as ratio
    FROM pg_statio_user_tables
  ) cache_stats;

  -- 6. Replicação status (se aplicável)
  INSERT INTO temp_health_check
  SELECT
    'Replicação',
    'OK',
    'Não configurada',
    FALSE
  WHERE NOT EXISTS (SELECT 1 FROM pg_stat_replication);

  -- 7. Transaction ID wraparound
  INSERT INTO temp_health_check
  SELECT
    'Transaction ID Wraparound',
    CASE WHEN age < 10000000 THEN 'OK' ELSE 'ALERTA' END,
    age || ' transactions',
    age > 100000000
  FROM (
    SELECT EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - stats_reset))::INTEGER as age
    FROM pg_stat_database
    WHERE datname = 'jurisconnect'
  ) xid_age;

  -- Contar alertas
  SELECT COUNT(*) INTO v_alertas FROM temp_health_check WHERE alerta = TRUE;

  -- Exibir resultado
  SELECT * FROM temp_health_check;

  IF v_alertas > 0 THEN
    RAISE WARNING 'Health Check encontrou % alertas', v_alertas;
  ELSE
    RAISE NOTICE 'Health Check: Tudo OK';
  END IF;

  DROP TABLE temp_health_check;
END;
$$;

-- Usar:
-- CALL proc_health_check_database();
```

## 4.2 Monitoramento Contínuo

```sql
CREATE OR REPLACE FUNCTION fn_monitorar_performance()
RETURNS TABLE (
  metrica VARCHAR,
  valor NUMERIC,
  unidade VARCHAR,
  alerta BOOLEAN
) AS $$
SELECT
  'Tamanho do Banco',
  pg_database_size('jurisconnect') / (1024*1024*1024)::NUMERIC,
  'GB',
  pg_database_size('jurisconnect') / (1024*1024*1024)::NUMERIC > 50

UNION ALL

SELECT
  'Conexões Ativas',
  COUNT(*)::NUMERIC,
  'conexões',
  COUNT(*) > 50
FROM pg_stat_activity
WHERE datname = 'jurisconnect'

UNION ALL

SELECT
  'Registros Mortos (%)',
  ROUND(100.0 * SUM(n_dead_tup) / NULLIF(SUM(n_live_tup), 0), 2)::NUMERIC,
  '%',
  ROUND(100.0 * SUM(n_dead_tup) / NULLIF(SUM(n_live_tup), 0), 2) > 20
FROM pg_stat_user_tables

UNION ALL

SELECT
  'Cache Hit Ratio',
  ROUND((SUM(heap_blks_hit) / (SUM(heap_blks_hit) + SUM(heap_blks_read))::DECIMAL) * 100, 2)::NUMERIC,
  '%',
  ROUND((SUM(heap_blks_hit) / (SUM(heap_blks_hit) + SUM(heap_blks_read))::DECIMAL) * 100, 2) < 99
FROM pg_statio_user_tables
$$ LANGUAGE SQL;

-- Usar:
-- SELECT * FROM fn_monitorar_performance();
```

---

**Performance e Manutenção - Parte 1/2** ✅

**Continuação com Troubleshooting, Backup e Ferramentas Avançadas...**