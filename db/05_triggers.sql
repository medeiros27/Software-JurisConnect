-- 05_triggers.sql
-- Triggers para auditoria automática

-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION fn_auditar()
RETURNS TRIGGER AS $$
DECLARE v_user UUID;
BEGIN
  BEGIN
    SELECT current_setting('app.current_user_id')::UUID INTO v_user;
  EXCEPTION WHEN others THEN 
    v_user := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO logs_auditoria (tabela, operacao, registro_id,
                               dados_depois, usuario_id,
                               ip_address, user_agent)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id,
            to_jsonb(NEW), v_user,
            inet_client_addr(),
            current_setting('app.user_agent','t'));
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO logs_auditoria (tabela, operacao, registro_id,
                               dados_antes, dados_depois,
                               usuario_id, ip_address, user_agent)
    VALUES (TG_TABLE_NAME, TG_OP, NEW.id,
            to_jsonb(OLD), to_jsonb(NEW),
            v_user, inet_client_addr(),
            current_setting('app.user_agent','t'));
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO logs_auditoria (tabela, operacao, registro_id,
                               dados_antes, usuario_id,
                               ip_address, user_agent)
    VALUES (TG_TABLE_NAME, TG_OP, OLD.id,
            to_jsonb(OLD), v_user,
            inet_client_addr(),
            current_setting('app.user_agent','t'));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers a todas as tabelas de negócio
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname='public' 
      AND tablename NOT IN ('logs_auditoria')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_auditar_%I ON %I;
      CREATE TRIGGER trg_auditar_%I
      AFTER INSERT OR UPDATE OR DELETE ON %I
      FOR EACH ROW EXECUTE FUNCTION fn_auditar();',
      r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END $$;
