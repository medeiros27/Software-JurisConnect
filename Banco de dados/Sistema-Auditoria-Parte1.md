# JURISCONNECT - SISTEMA DE AUDITORIA COMPLETO

## 📋 ÍNDICE

1. [Estrutura de Tabelas de Auditoria](#1-estrutura-de-tabelas-de-auditoria)
2. [Triggers de Auditoria Detalhados](#2-triggers-de-auditoria-detalhados)
3. [Functions de Auditoria](#3-functions-de-auditoria)
4. [Views de Auditoria](#4-views-de-auditoria)
5. [Procedures de Relatório de Auditoria](#5-procedures-de-relatório-de-auditoria)
6. [Cleanup e Manutenção](#6-cleanup-e-manutenção)

---

# 1. ESTRUTURA DE TABELAS DE AUDITORIA

## 1.1 Schema e Tabelas Base

```sql
-- Criar schema de auditoria
CREATE SCHEMA IF NOT EXISTS auditoria;

-- Tabela principal de auditoria
CREATE TABLE auditoria.log_completo (
  id BIGSERIAL PRIMARY KEY,
  tabela VARCHAR(100) NOT NULL,
  registro_id INTEGER NOT NULL,
  operacao VARCHAR(10) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id INTEGER,
  usuario_nome VARCHAR(150),
  ip_origem VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  timestamp_original TIMESTAMP,
  dados_antigos JSONB,
  dados_novos JSONB,
  campos_alterados VARCHAR[],
  mudancas_detalhadas JSONB,
  motivo_alteracao TEXT,
  sessao_id VARCHAR(100),
  transaction_id BIGINT,
  duracao_ms INTEGER,
  erro_mensagem TEXT,
  ambiente VARCHAR(20) DEFAULT 'producao'
);

-- Índices de performance
CREATE INDEX idx_auditoria_tabela ON auditoria.log_completo(tabela);
CREATE INDEX idx_auditoria_operacao ON auditoria.log_completo(operacao);
CREATE INDEX idx_auditoria_timestamp ON auditoria.log_completo(timestamp DESC);
CREATE INDEX idx_auditoria_usuario_id ON auditoria.log_completo(usuario_id);
CREATE INDEX idx_auditoria_tabela_registro ON auditoria.log_completo(tabela, registro_id);
CREATE INDEX idx_auditoria_sessao ON auditoria.log_completo(sessao_id);

-- GIN index para JSONB
CREATE INDEX idx_auditoria_dados_antigos ON auditoria.log_completo USING gin(dados_antigos);
CREATE INDEX idx_auditoria_dados_novos ON auditoria.log_completo USING gin(dados_novos);

-- Tabela de auditoria de usuários (login/logout)
CREATE TABLE auditoria.log_usuarios (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  email VARCHAR(255),
  nome VARCHAR(150),
  acao VARCHAR(20) CHECK (acao IN ('login', 'logout', 'falha_login', 'alteracao_senha', 'reset_senha')),
  ip_origem VARCHAR(45),
  user_agent VARCHAR(500),
  success BOOLEAN DEFAULT TRUE,
  motivo_falha TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sessao_id VARCHAR(100),
  device_info VARCHAR(500)
);

CREATE INDEX idx_usuarios_timestamp ON auditoria.log_usuarios(timestamp DESC);
CREATE INDEX idx_usuarios_usuario_id ON auditoria.log_usuarios(usuario_id);
CREATE INDEX idx_usuarios_acao ON auditoria.log_usuarios(acao);

-- Tabela de auditoria de acesso a dados sensíveis
CREATE TABLE auditoria.log_acesso_sensivel (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  tabela VARCHAR(100) NOT NULL,
  coluna_sensivel VARCHAR(100),
  tipo_acesso VARCHAR(20) CHECK (tipo_acesso IN ('visualizacao', 'exportacao', 'download')),
  quantidade_registros INTEGER,
  ip_origem VARCHAR(45),
  sucesso BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT
);

CREATE INDEX idx_sensivel_usuario ON auditoria.log_acesso_sensivel(usuario_id);
CREATE INDEX idx_sensivel_timestamp ON auditoria.log_acesso_sensivel(timestamp DESC);

-- Tabela de ações de exclusão/soft delete
CREATE TABLE auditoria.log_exclusoes (
  id BIGSERIAL PRIMARY KEY,
  tabela VARCHAR(100) NOT NULL,
  registro_id INTEGER NOT NULL,
  usuario_id INTEGER REFERENCES usuarios(id),
  tipo_exclusao VARCHAR(20) CHECK (tipo_exclusao IN ('hard_delete', 'soft_delete', 'restore')),
  dados_completos JSONB,
  motivo TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  restaurado_em TIMESTAMP,
  restaurado_por INTEGER REFERENCES usuarios(id)
);

CREATE INDEX idx_exclusoes_tabela ON auditoria.log_exclusoes(tabela);
CREATE INDEX idx_exclusoes_timestamp ON auditoria.log_exclusoes(timestamp DESC);

-- Tabela de transações críticas
CREATE TABLE auditoria.log_transacoes_criticas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  tipo_transacao VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('iniciada', 'concluida', 'falha')),
  timestamp_inicio TIMESTAMP,
  timestamp_fim TIMESTAMP,
  duracao_ms INTEGER,
  resultado JSONB,
  erro TEXT,
  ip_origem VARCHAR(45)
);

CREATE INDEX idx_criticas_tipo ON auditoria.log_transacoes_criticas(tipo_transacao);
CREATE INDEX idx_criticas_timestamp ON auditoria.log_transacoes_criticas(timestamp_inicio DESC);

-- Tabela de auditoria de relatórios/exportações
CREATE TABLE auditoria.log_relatorios (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  tipo_relatorio VARCHAR(100) NOT NULL,
  formato_exportacao VARCHAR(20),
  quantidade_registros INTEGER,
  filtros_aplicados JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tamanho_arquivo BIGINT,
  arquivo_url VARCHAR(500),
  ip_origem VARCHAR(45)
);

CREATE INDEX idx_relatorios_usuario ON auditoria.log_relatorios(usuario_id);
CREATE INDEX idx_relatorios_timestamp ON auditoria.log_relatorios(timestamp DESC);

-- Tabela de mudanças de configuração
CREATE TABLE auditoria.log_configuracoes (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  chave_config VARCHAR(100) NOT NULL,
  valor_antigo TEXT,
  valor_novo TEXT,
  tipo_config VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo TEXT,
  ambiente VARCHAR(20)
);

CREATE INDEX idx_config_timestamp ON auditoria.log_configuracoes(timestamp DESC);
CREATE INDEX idx_config_chave ON auditoria.log_configuracoes(chave_config);
```

---

# 2. TRIGGERS DE AUDITORIA DETALHADOS

## 2.1 Trigger Function Principal

```sql
CREATE OR REPLACE FUNCTION auditoria.fn_auditar_alteracoes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_campos_alterados VARCHAR[];
  v_mudancas_detalhadas JSONB := '{}'::JSONB;
  v_usuario_id INTEGER;
  v_usuario_nome VARCHAR;
  v_ip_origem VARCHAR;
  v_user_agent VARCHAR;
  v_sessao_id VARCHAR;
  v_campos_json_antigos JSONB;
  v_campos_json_novos JSONB;
BEGIN
  -- Obter contexto da sessão
  BEGIN
    v_usuario_id := current_setting('app.usuario_id')::INTEGER;
    v_usuario_nome := current_setting('app.usuario_nome');
    v_ip_origem := current_setting('app.ip_origem');
    v_user_agent := current_setting('app.user_agent');
    v_sessao_id := current_setting('app.sessao_id');
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := NULL;
    v_usuario_nome := CURRENT_USER;
    v_ip_origem := '0.0.0.0';
    v_user_agent := 'desconhecido';
    v_sessao_id := 'sessao-' || uuid_generate_v4();
  END;

  IF TG_OP = 'INSERT' THEN
    v_campos_json_novos := ROW_TO_JSON(NEW);
    
    INSERT INTO auditoria.log_completo (
      tabela, registro_id, operacao, usuario_id, usuario_nome,
      ip_origem, user_agent, dados_novos, campos_alterados,
      sessao_id, timestamp_original
    )
    VALUES (
      TG_TABLE_NAME, NEW.id, 'INSERT', v_usuario_id, v_usuario_nome,
      v_ip_origem, v_user_agent, v_campos_json_novos, NULL,
      v_sessao_id, CURRENT_TIMESTAMP
    );

  ELSIF TG_OP = 'UPDATE' THEN
    v_campos_json_antigos := ROW_TO_JSON(OLD);
    v_campos_json_novos := ROW_TO_JSON(NEW);

    -- Identificar campos alterados
    SELECT ARRAY_AGG(key) INTO v_campos_alterados
    FROM (
      SELECT key
      FROM jsonb_each(v_campos_json_novos)
      WHERE value IS DISTINCT FROM v_campos_json_antigos -> key
    ) AS altered_fields;

    -- Construir mudanças detalhadas
    FOR key IN SELECT jsonb_object_keys(v_campos_json_novos)
    LOOP
      IF v_campos_json_novos ->> key IS DISTINCT FROM v_campos_json_antigos ->> key THEN
        v_mudancas_detalhadas := jsonb_set(
          v_mudancas_detalhadas,
          ARRAY[key],
          jsonb_build_object(
            'antigo', v_campos_json_antigos -> key,
            'novo', v_campos_json_novos -> key
          )
        );
      END IF;
    END LOOP;

    INSERT INTO auditoria.log_completo (
      tabela, registro_id, operacao, usuario_id, usuario_nome,
      ip_origem, user_agent, dados_antigos, dados_novos,
      campos_alterados, mudancas_detalhadas,
      sessao_id, timestamp_original
    )
    VALUES (
      TG_TABLE_NAME, NEW.id, 'UPDATE', v_usuario_id, v_usuario_nome,
      v_ip_origem, v_user_agent, v_campos_json_antigos, v_campos_json_novos,
      v_campos_alterados, v_mudancas_detalhadas,
      v_sessao_id, CURRENT_TIMESTAMP
    );

  ELSIF TG_OP = 'DELETE' THEN
    v_campos_json_antigos := ROW_TO_JSON(OLD);
    
    -- Registrar exclusão
    INSERT INTO auditoria.log_exclusoes (
      tabela, registro_id, usuario_id, tipo_exclusao, dados_completos
    )
    VALUES (
      TG_TABLE_NAME, OLD.id, v_usuario_id, 'hard_delete', v_campos_json_antigos
    );

    INSERT INTO auditoria.log_completo (
      tabela, registro_id, operacao, usuario_id, usuario_nome,
      ip_origem, user_agent, dados_antigos,
      sessao_id, timestamp_original
    )
    VALUES (
      TG_TABLE_NAME, OLD.id, 'DELETE', v_usuario_id, v_usuario_nome,
      v_ip_origem, v_user_agent, v_campos_json_antigos,
      v_sessao_id, CURRENT_TIMESTAMP
    );
  END IF;

  -- Retornar novo ou old conforme operação
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;

EXCEPTION WHEN OTHERS THEN
  -- Log de erro de auditoria
  INSERT INTO auditoria.log_completo (
    tabela, operacao, usuario_id, erro_mensagem, timestamp_original
  )
  VALUES (
    TG_TABLE_NAME, TG_OP, v_usuario_id, SQLERRM, CURRENT_TIMESTAMP
  );
  
  RAISE EXCEPTION 'Erro na auditoria: %', SQLERRM;
END;
$$;

-- Aplicar trigger em tabelas críticas
CREATE TRIGGER tr_auditoria_usuarios AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_alteracoes();

CREATE TRIGGER tr_auditoria_clientes AFTER INSERT OR UPDATE OR DELETE ON clientes
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_alteracoes();

CREATE TRIGGER tr_auditoria_demandas AFTER INSERT OR UPDATE OR DELETE ON demandas
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_alteracoes();

CREATE TRIGGER tr_auditoria_pagamentos AFTER INSERT OR UPDATE OR DELETE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_alteracoes();

CREATE TRIGGER tr_auditoria_correspondentes AFTER INSERT OR UPDATE OR DELETE ON correspondentes
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_alteracoes();

CREATE TRIGGER tr_auditoria_documentos AFTER INSERT OR UPDATE OR DELETE ON documentos
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_alteracoes();
```

## 2.2 Triggers Especializados

```sql
-- Trigger para soft delete
CREATE OR REPLACE FUNCTION auditoria.fn_auditar_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_usuario_id INTEGER;
BEGIN
  IF NEW.deletado_em IS NOT NULL AND OLD.deletado_em IS NULL THEN
    BEGIN
      v_usuario_id := current_setting('app.usuario_id')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      v_usuario_id := NULL;
    END;

    INSERT INTO auditoria.log_exclusoes (
      tabela, registro_id, usuario_id, tipo_exclusao, dados_completos
    )
    VALUES (
      TG_TABLE_NAME, NEW.id, v_usuario_id, 'soft_delete', ROW_TO_JSON(OLD)
    );
  ELSIF NEW.deletado_em IS NULL AND OLD.deletado_em IS NOT NULL THEN
    BEGIN
      v_usuario_id := current_setting('app.usuario_id')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      v_usuario_id := NULL;
    END;

    UPDATE auditoria.log_exclusoes
    SET restaurado_em = CURRENT_TIMESTAMP, restaurado_por = v_usuario_id
    WHERE tabela = TG_TABLE_NAME AND registro_id = NEW.id
    ORDER BY timestamp DESC LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_soft_delete_clientes AFTER UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_soft_delete();

CREATE TRIGGER tr_soft_delete_demandas AFTER UPDATE ON demandas
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_soft_delete();

CREATE TRIGGER tr_soft_delete_pagamentos AFTER UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_soft_delete();

-- Trigger para alterações de valores críticos
CREATE OR REPLACE FUNCTION auditoria.fn_auditar_valores_criticos()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_usuario_id INTEGER;
  v_usuario_nome VARCHAR;
  v_ip_origem VARCHAR;
BEGIN
  -- Detectar mudanças em campos críticos
  IF (TG_TABLE_NAME = 'pagamentos') THEN
    IF NEW.status IS DISTINCT FROM OLD.status OR 
       NEW.valor_final IS DISTINCT FROM OLD.valor_final THEN
      
      BEGIN
        v_usuario_id := current_setting('app.usuario_id')::INTEGER;
        v_usuario_nome := current_setting('app.usuario_nome');
        v_ip_origem := current_setting('app.ip_origem');
      EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
        v_usuario_nome := CURRENT_USER;
        v_ip_origem := '0.0.0.0';
      END;

      INSERT INTO auditoria.log_transacoes_criticas (
        usuario_id, tipo_transacao, descricao, valor, status,
        timestamp_inicio, resultado, ip_origem
      )
      VALUES (
        v_usuario_id,
        'MUDANCA_PAGAMENTO_CRITICA',
        'Alteração em pagamento: ' || NEW.numero_fatura,
        NEW.valor_final,
        'concluida',
        CURRENT_TIMESTAMP,
        jsonb_build_object(
          'id_pagamento', NEW.id,
          'status_antigo', OLD.status,
          'status_novo', NEW.status,
          'valor_antigo', OLD.valor_final,
          'valor_novo', NEW.valor_final
        ),
        v_ip_origem
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_valores_criticos_pagamentos AFTER UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION auditoria.fn_auditar_valores_criticos();
```

---

# 3. FUNCTIONS DE AUDITORIA

## 3.1 Functions Auxiliares

```sql
-- Function para registrar acesso a dados sensíveis
CREATE OR REPLACE FUNCTION auditoria.fn_registrar_acesso_sensivel(
  p_usuario_id INTEGER,
  p_tabela VARCHAR,
  p_coluna_sensivel VARCHAR,
  p_tipo_acesso VARCHAR,
  p_quantidade INTEGER,
  p_ip_origem VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO auditoria.log_acesso_sensivel (
    usuario_id, tabela, coluna_sensivel, tipo_acesso, 
    quantidade_registros, ip_origem, timestamp
  )
  VALUES (
    p_usuario_id, p_tabela, p_coluna_sensivel, p_tipo_acesso,
    p_quantidade, p_ip_origem, CURRENT_TIMESTAMP
  );
END;
$$;

-- Function para registrar login/logout
CREATE OR REPLACE FUNCTION auditoria.fn_registrar_login(
  p_usuario_id INTEGER,
  p_email VARCHAR,
  p_acao VARCHAR,
  p_ip_origem VARCHAR,
  p_user_agent VARCHAR,
  p_sucesso BOOLEAN,
  p_motivo_falha TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_usuario_nome VARCHAR;
BEGIN
  SELECT nome INTO v_usuario_nome FROM usuarios WHERE id = p_usuario_id;

  INSERT INTO auditoria.log_usuarios (
    usuario_id, email, nome, acao, ip_origem, user_agent,
    success, motivo_falha, timestamp
  )
  VALUES (
    p_usuario_id, p_email, v_usuario_nome, p_acao, p_ip_origem,
    p_user_agent, p_sucesso, p_motivo_falha, CURRENT_TIMESTAMP
  );
END;
$$;

-- Function para registrar exportação/relatório
CREATE OR REPLACE FUNCTION auditoria.fn_registrar_relatorio(
  p_usuario_id INTEGER,
  p_tipo_relatorio VARCHAR,
  p_formato VARCHAR,
  p_quantidade INTEGER,
  p_filtros JSONB,
  p_ip_origem VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO auditoria.log_relatorios (
    usuario_id, tipo_relatorio, formato_exportacao, quantidade_registros,
    filtros_aplicados, ip_origem, timestamp
  )
  VALUES (
    p_usuario_id, p_tipo_relatorio, p_formato, p_quantidade,
    p_filtros, p_ip_origem, CURRENT_TIMESTAMP
  );
END;
$$;

-- Function para configurar contexto de auditoria
CREATE OR REPLACE FUNCTION auditoria.fn_definir_contexto_auditoria(
  p_usuario_id INTEGER,
  p_usuario_nome VARCHAR,
  p_ip_origem VARCHAR,
  p_user_agent VARCHAR,
  p_sessao_id VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('app.usuario_id', p_usuario_id::TEXT, FALSE);
  PERFORM set_config('app.usuario_nome', COALESCE(p_usuario_nome, 'desconhecido'), FALSE);
  PERFORM set_config('app.ip_origem', COALESCE(p_ip_origem, '0.0.0.0'), FALSE);
  PERFORM set_config('app.user_agent', COALESCE(p_user_agent, 'desconhecido'), FALSE);
  PERFORM set_config('app.sessao_id', COALESCE(p_sessao_id, 'sessao-' || uuid_generate_v4()), FALSE);
END;
$$;
```

---

**Sistema de Auditoria - Parte 1/2** ✅

**Continuação com Views, Procedures de Relatório e Manutenção...**