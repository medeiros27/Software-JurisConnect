-- 08_maintenance.sql
-- Procedures de manutenção e otimização

-- Limpeza de logs de auditoria antigos
CREATE OR REPLACE PROCEDURE limpar_logs_auditoria(p_dias INTEGER DEFAULT 180)
LANGUAGE plpgsql AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM logs_auditoria
  WHERE timestamp < now() - (p_dias || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE 'Removidos % registros de auditoria com mais de % dias', v_deleted, p_dias;
END;
$$;

-- Reindexação de todas as tabelas
CREATE OR REPLACE PROCEDURE reindexar_tabelas()
LANGUAGE plpgsql AS $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname='public' 
  LOOP
    EXECUTE format('REINDEX TABLE %I;', r.tablename);
    RAISE NOTICE 'Reindexada tabela: %', r.tablename;
  END LOOP;
END;
$$;

-- Atualizar estatísticas de todas as tabelas
CREATE OR REPLACE PROCEDURE atualizar_estatisticas()
LANGUAGE plpgsql AS $$
BEGIN
  ANALYZE VERBOSE;
  RAISE NOTICE 'Estatísticas atualizadas para todas as tabelas';
END;
$$;

-- Vacuum completo (usar com cuidado, bloqueia tabelas)
CREATE OR REPLACE PROCEDURE vacuum_completo()
LANGUAGE plpgsql AS $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname='public' 
  LOOP
    EXECUTE format('VACUUM FULL ANALYZE %I;', r.tablename);
    RAISE NOTICE 'Vacuum completo em: %', r.tablename;
  END LOOP;
END;
$$;
