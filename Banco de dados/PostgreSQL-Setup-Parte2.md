# JURISCONNECT - POSTGRESQL (PARTE 2)

## 📋 CONTINUAÇÃO

3. [Índices Otimizados](#3-índices-otimizados)
4. [Views Frequentes](#4-views-frequentes)
5. [Stored Procedures](#5-stored-procedures)
6. [Functions PL/pgSQL](#6-functions-plpgsql)

---

# 3. ÍNDICES OTIMIZADOS

## 3.1 indices_performance.sql

```sql
-- Índices para melhor performance geral

-- Partial indexes (apenas registros não deletados)
CREATE INDEX idx_usuarios_ativo_nao_deletado ON usuarios(ativo) 
  WHERE deletado_em IS NULL;

CREATE INDEX idx_clientes_ativo_nao_deletado ON clientes(ativo) 
  WHERE deletado_em IS NULL;

CREATE INDEX idx_demandas_nao_deletada ON demandas(status, data_prazo) 
  WHERE deletado_em IS NULL;

-- Composite indexes para queries comuns
CREATE INDEX idx_demandas_cliente_status ON demandas(cliente_id, status) 
  WHERE deletado_em IS NULL;

CREATE INDEX idx_pagamentos_tipo_status_vencimento ON pagamentos(tipo, status, data_vencimento) 
  WHERE deletado_em IS NULL;

CREATE INDEX idx_pagamentos_cliente_tipo ON pagamentos(cliente_id, tipo, status) 
  WHERE deletado_em IS NULL;

CREATE INDEX idx_documentos_demanda_versao ON documentos(demanda_id, versao DESC);

CREATE INDEX idx_agenda_data_tipo ON agenda(data_evento, tipo) 
  WHERE deletado_em IS NULL;

-- BRIN indexes para grandes tabelas com dados sequenciais
CREATE INDEX idx_historico_criado_em_brin ON historico_workflow(criado_em) 
  USING BRIN;

-- Hash indexes para igualdade
CREATE INDEX idx_usuarios_email_hash ON usuarios USING hash(email);

-- GIN indexes para arrays e JSON
CREATE INDEX idx_documentos_tipo_gin ON documentos(tipo);

-- Analisar estatísticas
ANALYZE usuarios;
ANALYZE clientes;
ANALYZE correspondentes;
ANALYZE demandas;
ANALYZE pagamentos;
ANALYZE documentos;
ANALYZE agenda;
ANALYZE historico_workflow;
```

---

# 4. VIEWS FREQUENTES

## 4.1 views_dashboard.sql

```sql
-- VIEW: Dashboard Financeiro
CREATE OR REPLACE VIEW vw_dashboard_financeiro AS
SELECT 
  CURRENT_DATE as data_relatorio,
  (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos 
   WHERE tipo = 'receber' AND status = 'pago' 
   AND DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)) as receita_mes,
  (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos 
   WHERE tipo = 'pagar' AND status = 'pago'
   AND DATE_TRUNC('month', data_pagamento) = DATE_TRUNC('month', CURRENT_DATE)) as despesa_mes,
  (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos 
   WHERE tipo = 'receber' AND status IN ('pendente', 'vencido')) as total_receber,
  (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos 
   WHERE tipo = 'pagar' AND status IN ('pendente', 'vencido')) as total_pagar,
  (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos 
   WHERE tipo = 'receber' AND status = 'vencido') as vencidos_receber,
  (SELECT COUNT(*) FROM demandas 
   WHERE status IN ('pendente', 'em_andamento') AND deletado_em IS NULL) as demandas_ativas;

-- VIEW: Demandas por Status
CREATE OR REPLACE VIEW vw_demandas_por_status AS
SELECT 
  status,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN prioridade = 'urgente' THEN 1 END) as urgentes,
  COUNT(CASE WHEN atrasada THEN 1 END) as atrasadas,
  AVG(EXTRACT(DAY FROM CURRENT_DATE - data_prazo)) as dias_medio_prazo
FROM demandas
WHERE deletado_em IS NULL
GROUP BY status
ORDER BY quantidade DESC;

-- VIEW: Clientes Devedores
CREATE OR REPLACE VIEW vw_clientes_devedores AS
SELECT 
  c.id,
  c.nome_fantasia,
  c.cpf_cnpj,
  c.email,
  c.telefone,
  COUNT(p.id) as quantidade_faturas_vencidas,
  COALESCE(SUM(p.valor_final), 0) as valor_total_vencido,
  MAX(p.data_vencimento) as ultima_fatura_vencida,
  EXTRACT(DAY FROM CURRENT_DATE - MAX(p.data_vencimento)) as dias_atraso_max
FROM clientes c
LEFT JOIN pagamentos p ON c.id = p.cliente_id 
  AND p.tipo = 'receber' 
  AND p.status = 'vencido'
WHERE c.deletado_em IS NULL
GROUP BY c.id, c.nome_fantasia, c.cpf_cnpj, c.email, c.telefone
HAVING COUNT(p.id) > 0
ORDER BY valor_total_vencido DESC;

-- VIEW: Performance de Correspondentes
CREATE OR REPLACE VIEW vw_correspondentes_performance AS
SELECT 
  cor.id,
  cor.nome_fantasia,
  COUNT(d.id) as total_demandas,
  COUNT(CASE WHEN d.status = 'concluida' THEN 1 END) as demandas_concluidas,
  ROUND(100.0 * COUNT(CASE WHEN d.status = 'concluida' THEN 1 END) / COUNT(d.id), 2) as taxa_conclusao,
  ROUND(AVG(EXTRACT(DAY FROM d.data_conclusao - d.data_inicio)), 2) as dias_medio_conclusao,
  COUNT(CASE WHEN d.atrasada THEN 1 END) as demandas_atrasadas
FROM correspondentes cor
LEFT JOIN demandas d ON cor.id = d.correspondente_id AND d.deletado_em IS NULL
WHERE cor.deletado_em IS NULL
GROUP BY cor.id, cor.nome_fantasia
ORDER BY taxa_conclusao DESC;

-- VIEW: Agenda Próximos Prazos
CREATE OR REPLACE VIEW vw_proximos_prazos AS
SELECT 
  d.id,
  d.numero,
  d.titulo,
  d.data_prazo,
  d.status,
  d.prioridade,
  c.nome_fantasia as cliente,
  u.nome as responsavel,
  EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) as dias_restantes
FROM demandas d
JOIN clientes c ON d.cliente_id = c.id
LEFT JOIN usuarios u ON d.responsavel_atual_id = u.id
WHERE d.deletado_em IS NULL 
  AND d.status NOT IN ('concluida', 'cancelada')
  AND d.data_prazo IS NOT NULL
  AND d.data_prazo <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY d.data_prazo ASC, d.prioridade DESC;

-- VIEW: Fluxo de Caixa Mensal
CREATE OR REPLACE VIEW vw_fluxo_caixa_mensal AS
SELECT 
  DATE_TRUNC('month', COALESCE(data_pagamento, data_vencimento))::DATE as mes,
  tipo,
  status,
  COUNT(*) as quantidade,
  COALESCE(SUM(valor_final), 0) as total
FROM pagamentos
WHERE deletado_em IS NULL
GROUP BY DATE_TRUNC('month', COALESCE(data_pagamento, data_vencimento)), tipo, status
ORDER BY mes DESC, tipo;

-- VIEW: Auditoria Recente
CREATE OR REPLACE VIEW vw_auditoria_recente AS
SELECT 
  h.id,
  h.demanda_id,
  d.numero as numero_demanda,
  h.acao,
  h.usuario_id,
  u.nome as usuario,
  h.descricao,
  h.criado_em,
  h.ip_origem
FROM historico_workflow h
JOIN demandas d ON h.demanda_id = d.id
JOIN usuarios u ON h.usuario_id = u.id
ORDER BY h.criado_em DESC
LIMIT 100;
```

---

# 5. STORED PROCEDURES

## 5.1 procedures_financeiras.sql

```sql
-- PROCEDURE: Processar Penalizações Automáticas
CREATE OR REPLACE PROCEDURE proc_aplicar_penalizacoes()
LANGUAGE plpgsql
AS $$
DECLARE
  v_pagamento RECORD;
  v_juros DECIMAL(10,2);
  v_multa DECIMAL(10,2);
  v_dias_atraso INTEGER;
BEGIN
  -- Loop em pagamentos vencidos
  FOR v_pagamento IN 
    SELECT id, valor_final, data_vencimento 
    FROM pagamentos
    WHERE status IN ('pendente', 'vencido')
      AND data_vencimento < CURRENT_DATE
      AND deletado_em IS NULL
  LOOP
    v_dias_atraso := EXTRACT(DAY FROM CURRENT_DATE - v_pagamento.data_vencimento)::INTEGER;
    
    -- Calcular juros (1% ao mês)
    v_juros := (v_pagamento.valor_final * 0.01 * (v_dias_atraso::DECIMAL / 30));
    
    -- Calcular multa (2% fixa)
    v_multa := (v_pagamento.valor_final * 0.02);
    
    -- Atualizar registro
    UPDATE pagamentos
    SET 
      valor_juros = v_juros,
      valor_multa = v_multa,
      dias_atraso = v_dias_atraso,
      valor_final = valor_original - valor_desconto + v_juros + v_multa,
      status = 'vencido',
      atualizado_em = CURRENT_TIMESTAMP
    WHERE id = v_pagamento.id;
  END LOOP;
  
  RAISE NOTICE 'Penalizações aplicadas com sucesso';
END;
$$;

-- PROCEDURE: Gerar Relatório Mensal Financeiro
CREATE OR REPLACE PROCEDURE proc_relatorio_financeiro_mensal(
  p_mes INTEGER,
  p_ano INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_inicio DATE;
  v_data_fim DATE;
  v_receita DECIMAL(10,2);
  v_despesa DECIMAL(10,2);
BEGIN
  v_data_inicio := MAKE_DATE(p_ano, p_mes, 1);
  v_data_fim := (MAKE_DATE(p_ano, p_mes, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  SELECT COALESCE(SUM(valor_final), 0) INTO v_receita
  FROM pagamentos
  WHERE tipo = 'receber' AND status = 'pago'
    AND data_pagamento BETWEEN v_data_inicio AND v_data_fim;
    
  SELECT COALESCE(SUM(valor_final), 0) INTO v_despesa
  FROM pagamentos
  WHERE tipo = 'pagar' AND status = 'pago'
    AND data_pagamento BETWEEN v_data_inicio AND v_data_fim;
    
  -- Inserir ou atualizar relatório
  INSERT INTO relatorios_financeiros (mes, ano, receita, despesa, lucro, criado_em)
  VALUES (p_mes, p_ano, v_receita, v_despesa, (v_receita - v_despesa), CURRENT_TIMESTAMP)
  ON CONFLICT (mes, ano) DO UPDATE
  SET receita = v_receita, despesa = v_despesa, lucro = (v_receita - v_despesa);
  
  RAISE NOTICE 'Relatório gerado: Receita: %, Despesa: %, Lucro: %', 
               v_receita, v_despesa, (v_receita - v_despesa);
END;
$$;

-- PROCEDURE: Limpar Cache Antigo
CREATE OR REPLACE PROCEDURE proc_limpar_dados_antigos()
LANGUAGE plpgsql
AS $$
BEGIN
  -- Deletar notificações com mais de 30 dias
  DELETE FROM notificacoes
  WHERE criado_em < CURRENT_DATE - INTERVAL '30 days';
  
  -- Marcar demandas canceladas antiga como deletadas (soft delete)
  UPDATE demandas
  SET deletado_em = CURRENT_TIMESTAMP
  WHERE status = 'cancelada' 
    AND data_cancelamento < CURRENT_DATE - INTERVAL '90 days'
    AND deletado_em IS NULL;
    
  -- Otimizar índices
  REINDEX DATABASE jurisconnect;
  
  -- Vacuum
  VACUUM ANALYZE;
  
  RAISE NOTICE 'Limpeza de dados concluída';
END;
$$;
```

---

# 6. FUNCTIONS PLPGSQL

## 6.1 functions_calculos.sql

```sql
-- FUNCTION: Calcular Dias Úteis Restantes
CREATE OR REPLACE FUNCTION fn_dias_uteis_ate_prazo(p_data_prazo DATE)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_dias_uteis INTEGER := 0;
  v_data_atual DATE := CURRENT_DATE;
  v_data_verif DATE;
BEGIN
  IF p_data_prazo <= v_data_atual THEN
    RETURN 0;
  END IF;
  
  v_data_verif := v_data_atual;
  WHILE v_data_verif < p_data_prazo LOOP
    IF EXTRACT(DOW FROM v_data_verif) NOT IN (0, 6) THEN
      v_dias_uteis := v_dias_uteis + 1;
    END IF;
    v_data_verif := v_data_verif + INTERVAL '1 day';
  END LOOP;
  
  RETURN v_dias_uteis;
END;
$$;

-- FUNCTION: Calcular Idade da Demanda
CREATE OR REPLACE FUNCTION fn_idade_demanda_dias(p_demanda_id INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT EXTRACT(DAY FROM CURRENT_DATE - d.data_inicio)::INTEGER
  FROM demandas d
  WHERE d.id = p_demanda_id;
$$;

-- FUNCTION: Formatar Valor Monetário
CREATE OR REPLACE FUNCTION fn_formatar_moeda(p_valor DECIMAL)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT TO_CHAR(p_valor, 'L9G999D99', 'NLS_CURRENCY=R$');
$$;

-- FUNCTION: Buscar Clientes por Full Text Search
CREATE OR REPLACE FUNCTION fn_buscar_clientes(p_termo TEXT)
RETURNS TABLE (
  id INTEGER,
  nome_fantasia VARCHAR,
  cpf_cnpj VARCHAR,
  email VARCHAR,
  relevancia REAL
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.nome_fantasia,
    c.cpf_cnpj,
    c.email,
    ts_rank(to_tsvector('portuguese', c.nome_fantasia || ' ' || COALESCE(c.razao_social, '')), 
            plainto_tsquery('portuguese', p_termo)) as relevancia
  FROM clientes c
  WHERE to_tsvector('portuguese', c.nome_fantasia || ' ' || COALESCE(c.razao_social, '')) @@ 
        plainto_tsquery('portuguese', p_termo)
    AND c.deletado_em IS NULL
  ORDER BY relevancia DESC;
$$;

-- FUNCTION: Gerar Próximo Número de Fatura
CREATE OR REPLACE FUNCTION fn_proximo_numero_fatura()
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_numero VARCHAR;
BEGIN
  v_numero := 'FAT-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
              LPAD(NEXTVAL('seq_numero_fatura')::TEXT, 6, '0');
  RETURN v_numero;
END;
$$;

-- FUNCTION: Atualizar Status Demanda com Log
CREATE OR REPLACE FUNCTION fn_atualizar_status_demanda(
  p_demanda_id INTEGER,
  p_novo_status VARCHAR,
  p_usuario_id INTEGER,
  p_descricao TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_status_anterior VARCHAR;
BEGIN
  -- Obter status atual
  SELECT status INTO v_status_anterior
  FROM demandas
  WHERE id = p_demanda_id;
  
  -- Atualizar demanda
  UPDATE demandas
  SET 
    status = p_novo_status,
    status_anterior = v_status_anterior,
    atualizado_em = CURRENT_TIMESTAMP
  WHERE id = p_demanda_id;
  
  -- Registrar no histórico
  INSERT INTO historico_workflow (
    demanda_id, acao, status_anterior, status_novo, 
    usuario_id, descricao, criado_em
  )
  VALUES (
    p_demanda_id, 'mudanca_status', v_status_anterior, p_novo_status,
    p_usuario_id, COALESCE(p_descricao, 'Status alterado via API'),
    CURRENT_TIMESTAMP
  );
  
  RETURN TRUE;
END;
$$;
```

---

**PostgreSQL Setup - Parte 2/4** ✅

**Continuação com Triggers, Seeds e Manutenção no próximo arquivo...**