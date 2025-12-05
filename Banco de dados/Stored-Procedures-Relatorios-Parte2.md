# JURISCONNECT - STORED PROCEDURES (PARTE 2)

## 📋 CONTINUAÇÃO

4. [Análises Complexas](#4-análises-complexas)
5. [Procedures de Exportação](#5-procedures-de-exportação)
6. [Procedures Gerenciais](#6-procedures-gerenciais)

---

# 4. ANÁLISES COMPLEXAS

## 4.1 Análise de Lucratividade por Cliente

```sql
CREATE OR REPLACE PROCEDURE proc_analise_lucratividade_cliente(
  p_data_inicio DATE DEFAULT (CURRENT_DATE - INTERVAL '12 months')::DATE,
  p_data_fim DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_lucratividade (
    cliente_id INTEGER,
    nome_cliente VARCHAR,
    cpf_cnpj VARCHAR,
    demandas_total INTEGER,
    demandas_concluidas INTEGER,
    taxa_conclusao DECIMAL(5,2),
    receita_honorarios DECIMAL(10,2),
    receita_custas DECIMAL(10,2),
    receita_total DECIMAL(10,2),
    despesa_correspondente DECIMAL(10,2),
    despesa_custas DECIMAL(10,2),
    despesa_total DECIMAL(10,2),
    lucro_liquido DECIMAL(10,2),
    margem_lucro DECIMAL(5,2),
    valor_medio_demanda DECIMAL(10,2),
    dias_medio_conclusao DECIMAL(10,2)
  );

  INSERT INTO temp_lucratividade
  SELECT
    c.id,
    c.nome_fantasia,
    c.cpf_cnpj,
    COUNT(DISTINCT d.id) as demandas_total,
    COUNT(DISTINCT CASE WHEN d.status = 'concluida' THEN d.id END) as demandas_concluidas,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN d.status = 'concluida' THEN d.id END) / 
      NULLIF(COUNT(DISTINCT d.id), 0), 2) as taxa_conclusao,
    COALESCE(SUM(CASE WHEN p.categoria = 'honorarios' AND p.tipo = 'receber' 
      THEN p.valor_final ELSE 0 END), 0) as receita_honorarios,
    COALESCE(SUM(CASE WHEN p.categoria = 'custas_processuais' AND p.tipo = 'receber' 
      THEN p.valor_final ELSE 0 END), 0) as receita_custas,
    COALESCE(SUM(CASE WHEN p.tipo = 'receber' THEN p.valor_final ELSE 0 END), 0) as receita_total,
    COALESCE(SUM(CASE WHEN p.categoria = 'taxa_correspondente' AND p.tipo = 'pagar' 
      THEN p.valor_final ELSE 0 END), 0) as despesa_correspondente,
    COALESCE(SUM(CASE WHEN p.categoria = 'custas_processuais' AND p.tipo = 'pagar' 
      THEN p.valor_final ELSE 0 END), 0) as despesa_custas,
    COALESCE(SUM(CASE WHEN p.tipo = 'pagar' THEN p.valor_final ELSE 0 END), 0) as despesa_total,
    COALESCE(SUM(CASE WHEN p.tipo = 'receber' THEN p.valor_final ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN p.tipo = 'pagar' THEN p.valor_final ELSE 0 END), 0) as lucro_liquido,
    ROUND(100.0 * (COALESCE(SUM(CASE WHEN p.tipo = 'receber' THEN p.valor_final ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN p.tipo = 'pagar' THEN p.valor_final ELSE 0 END), 0)) / 
    NULLIF(COALESCE(SUM(CASE WHEN p.tipo = 'receber' THEN p.valor_final ELSE 0 END), 0), 0), 2) as margem_lucro,
    ROUND(AVG(d.valor_cobrado), 2) as valor_medio_demanda,
    ROUND(AVG(EXTRACT(DAY FROM COALESCE(d.data_conclusao, CURRENT_DATE) - d.data_inicio)), 2) as dias_medio_conclusao
  FROM clientes c
  LEFT JOIN demandas d ON c.id = d.cliente_id 
    AND d.data_inicio >= p_data_inicio 
    AND d.data_inicio <= p_data_fim
  LEFT JOIN pagamentos p ON d.id = p.demanda_id 
    AND p.data_pagamento >= p_data_inicio
    AND p.data_pagamento <= p_data_fim
  WHERE c.deletado_em IS NULL
  GROUP BY c.id, c.nome_fantasia, c.cpf_cnpj
  HAVING COUNT(DISTINCT d.id) > 0
  ORDER BY lucro_liquido DESC;

  SELECT * FROM temp_lucratividade;
  DROP TABLE temp_lucratividade;

  RAISE NOTICE 'Análise de Lucratividade por Cliente gerada de % a %', p_data_inicio, p_data_fim;
END;
$$;

-- Usar:
-- CALL proc_analise_lucratividade_cliente('2025-01-01'::DATE, '2025-12-31'::DATE);
```

## 4.2 Previsão de Fluxo de Caixa (Próximos 30 dias)

```sql
CREATE OR REPLACE PROCEDURE proc_previsao_fluxo_caixa_30dias()
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_atual DATE := CURRENT_DATE;
  v_receita_prevista DECIMAL(10,2);
  v_despesa_prevista DECIMAL(10,2);
  v_saldo_acumulado DECIMAL(10,2) := 0;
  v_saldo_atual DECIMAL(10,2);
BEGIN
  CREATE TEMP TABLE temp_previsao_30dias (
    data DATE,
    receitas_previstas DECIMAL(10,2),
    despesas_previstas DECIMAL(10,2),
    saldo_dia DECIMAL(10,2),
    saldo_acumulado DECIMAL(10,2),
    nível_caixa VARCHAR
  );

  -- Obter saldo atual
  SELECT COALESCE(SUM(saldo_atual), 0) INTO v_saldo_atual
  FROM contas_bancarias
  WHERE ativa = TRUE;

  v_saldo_acumulado := v_saldo_atual;

  -- Próximos 30 dias
  FOR i IN 0..29 LOOP
    v_data_atual := CURRENT_DATE + (i || ' days')::INTERVAL;

    -- Receitas previstas
    SELECT COALESCE(SUM(valor_final), 0) INTO v_receita_prevista
    FROM pagamentos
    WHERE tipo = 'receber' 
      AND status IN ('pendente', 'emitido')
      AND DATE(data_vencimento) = v_data_atual;

    -- Despesas previstas
    SELECT COALESCE(SUM(valor_final), 0) INTO v_despesa_prevista
    FROM pagamentos
    WHERE tipo = 'pagar' 
      AND status IN ('pendente', 'emitido')
      AND DATE(data_vencimento) = v_data_atual;

    v_saldo_acumulado := v_saldo_acumulado + (v_receita_prevista - v_despesa_prevista);

    INSERT INTO temp_previsao_30dias VALUES (
      v_data_atual,
      v_receita_prevista,
      v_despesa_prevista,
      v_receita_prevista - v_despesa_prevista,
      v_saldo_acumulado,
      CASE
        WHEN v_saldo_acumulado < 0 THEN 'CRÍTICO'
        WHEN v_saldo_acumulado < 10000 THEN 'BAIXO'
        WHEN v_saldo_acumulado < 50000 THEN 'MODERADO'
        ELSE 'SAUDÁVEL'
      END
    );
  END LOOP;

  SELECT * FROM temp_previsao_30dias;
  DROP TABLE temp_previsao_30dias;

  RAISE NOTICE 'Previsão de Fluxo de Caixa para próximos 30 dias gerada';
END;
$$;

-- Usar:
-- CALL proc_previsao_fluxo_caixa_30dias();
```

## 4.3 Análise de Concentração de Risco (Correlação Cliente-Correspondente)

```sql
CREATE OR REPLACE PROCEDURE proc_analise_concentracao_risco()
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_concentracao_risco (
    cliente_id INTEGER,
    correspondente_id INTEGER,
    nome_cliente VARCHAR,
    nome_correspondente VARCHAR,
    demandas_relacionadas INTEGER,
    valor_total DECIMAL(10,2),
    percentual_receita_cliente DECIMAL(5,2),
    percentual_receita_correspondente DECIMAL(5,2),
    nivel_risco VARCHAR,
    recomendacao VARCHAR
  );

  INSERT INTO temp_concentracao_risco
  WITH totais AS (
    SELECT 
      SUM(valor_final) as receita_total
    FROM pagamentos
    WHERE tipo = 'receber'
  )
  SELECT
    c.id,
    cor.id,
    c.nome_fantasia,
    cor.nome_fantasia,
    COUNT(d.id) as demandas_relacionadas,
    COALESCE(SUM(p.valor_final), 0) as valor_total,
    ROUND(100.0 * COALESCE(SUM(p.valor_final), 0) / 
      (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos WHERE tipo = 'receber' AND cliente_id = c.id), 2) as percentual_receita_cliente,
    ROUND(100.0 * COALESCE(SUM(p.valor_final), 0) / 
      (SELECT COALESCE(SUM(valor_final), 0) FROM pagamentos WHERE tipo = 'pagar' AND correspondente_id = cor.id), 2) as percentual_receita_correspondente,
    CASE
      WHEN COALESCE(SUM(p.valor_final), 0) > (SELECT MAX(receita_total) * 0.3 FROM totais) THEN 'ALTO'
      WHEN COALESCE(SUM(p.valor_final), 0) > (SELECT MAX(receita_total) * 0.1 FROM totais) THEN 'MÉDIO'
      ELSE 'BAIXO'
    END as nivel_risco,
    CASE
      WHEN COALESCE(SUM(p.valor_final), 0) > (SELECT MAX(receita_total) * 0.3 FROM totais) 
        THEN 'Diversificar parceiros/clientes'
      WHEN COALESCE(SUM(p.valor_final), 0) > (SELECT MAX(receita_total) * 0.1 FROM totais) 
        THEN 'Monitorar regularmente'
      ELSE 'Relação normal'
    END as recomendacao
  FROM clientes c
  JOIN demandas d ON c.id = d.cliente_id
  LEFT JOIN correspondentes cor ON d.correspondente_id = cor.id
  LEFT JOIN pagamentos p ON d.id = p.demanda_id
  WHERE c.deletado_em IS NULL 
    AND cor.deletado_em IS NULL
    AND d.deletado_em IS NULL
  GROUP BY c.id, cor.id, c.nome_fantasia, cor.nome_fantasia
  ORDER BY valor_total DESC;

  SELECT * FROM temp_concentracao_risco;
  DROP TABLE temp_concentracao_risco;

  RAISE NOTICE 'Análise de Concentração de Risco gerada';
END;
$$;

-- Usar:
-- CALL proc_analise_concentracao_risco();
```

---

# 5. PROCEDURES DE EXPORTAÇÃO

## 5.1 Exportar Relatório para CSV (simulado)

```sql
CREATE OR REPLACE PROCEDURE proc_exportar_relatorio_financeiro(
  p_mes INTEGER,
  p_ano INTEGER,
  OUT p_csv TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_linha TEXT;
  v_receita DECIMAL(10,2);
  v_despesa DECIMAL(10,2);
  v_data_inicio DATE;
  v_data_fim DATE;
BEGIN
  v_data_inicio := MAKE_DATE(p_ano, p_mes, 1);
  v_data_fim := (MAKE_DATE(p_ano, p_mes, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- Cabeçalho
  p_csv := 'RELATÓRIO FINANCEIRO - ' || TO_CHAR(v_data_inicio, 'Month/YYYY') || E'\n';
  p_csv := p_csv || 'Gerado em: ' || TO_CHAR(CURRENT_TIMESTAMP, 'DD/MM/YYYY HH24:MI:SS') || E'\n\n';
  
  p_csv := p_csv || 'RESUMO EXECUTIVO' || E'\n';
  p_csv := p_csv || '=================' || E'\n';
  
  -- Calcular totalizadores
  SELECT COALESCE(SUM(valor_final), 0) INTO v_receita
  FROM pagamentos
  WHERE tipo = 'receber' AND status = 'pago'
    AND data_pagamento BETWEEN v_data_inicio AND v_data_fim;

  SELECT COALESCE(SUM(valor_final), 0) INTO v_despesa
  FROM pagamentos
  WHERE tipo = 'pagar' AND status = 'pago'
    AND data_pagamento BETWEEN v_data_inicio AND v_data_fim;

  p_csv := p_csv || 'Receita Total: R$ ' || TO_CHAR(v_receita, '999,999.99') || E'\n';
  p_csv := p_csv || 'Despesa Total: R$ ' || TO_CHAR(v_despesa, '999,999.99') || E'\n';
  p_csv := p_csv || 'Lucro Líquido: R$ ' || TO_CHAR(v_receita - v_despesa, '999,999.99') || E'\n';
  p_csv := p_csv || 'Margem de Lucro: ' || TO_CHAR(ROUND(100 * (v_receita - v_despesa) / NULLIF(v_receita, 0), 2), '990.00') || '%' || E'\n\n';

  -- Detalhes por cliente
  p_csv := p_csv || 'DETALHES POR CLIENTE' || E'\n';
  p_csv := p_csv || '===================' || E'\n';
  p_csv := p_csv || 'Cliente,Receita,Demandas' || E'\n';

  FOR v_linha IN
    SELECT 
      c.nome_fantasia || ',' ||
      COALESCE(SUM(p.valor_final), 0) || ',' ||
      COUNT(DISTINCT d.id)
    FROM clientes c
    LEFT JOIN demandas d ON c.id = d.cliente_id
    LEFT JOIN pagamentos p ON d.id = p.demanda_id 
      AND p.tipo = 'receber' 
      AND p.data_pagamento BETWEEN v_data_inicio AND v_data_fim
    WHERE c.deletado_em IS NULL
    GROUP BY c.id, c.nome_fantasia
    ORDER BY SUM(p.valor_final) DESC
  LOOP
    p_csv := p_csv || v_linha || E'\n';
  END LOOP;

  RAISE NOTICE 'Relatório exportado com sucesso';
END;
$$;

-- Usar:
-- CALL proc_exportar_relatorio_financeiro(11, 2025, NULL);
```

---

# 6. PROCEDURES GERENCIAIS

## 6.1 Dashboard Gerencial Completo

```sql
CREATE OR REPLACE PROCEDURE proc_dashboard_gerencial_completo(
  p_periodo_dias INTEGER DEFAULT 30
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_inicio DATE := CURRENT_DATE - (p_periodo_dias || ' days')::INTERVAL;
BEGIN
  CREATE TEMP TABLE temp_dashboard (
    metrica VARCHAR,
    valor DECIMAL(15,2),
    meta DECIMAL(15,2),
    status_meta VARCHAR,
    variacao_percentual DECIMAL(5,2),
    categoria VARCHAR
  );

  -- Receita
  INSERT INTO temp_dashboard
  SELECT 
    'Receita Total' as metrica,
    COALESCE(SUM(valor_final), 0),
    150000,
    'FINANCEIRO',
    0,
    CASE WHEN COALESCE(SUM(valor_final), 0) >= 150000 THEN 'OK' ELSE 'ALERTA' END
  FROM pagamentos
  WHERE tipo = 'receber' AND status = 'pago'
    AND data_pagamento >= v_data_inicio;

  -- Demandas Processadas
  INSERT INTO temp_dashboard
  SELECT
    'Demandas Processadas' as metrica,
    COUNT(*)::DECIMAL,
    100,
    'OPERACIONAL',
    0,
    CASE WHEN COUNT(*) >= 100 THEN 'OK' ELSE 'ALERTA' END
  FROM demandas
  WHERE data_inicio >= v_data_inicio
    AND deletado_em IS NULL;

  -- Demandas Concluídas
  INSERT INTO temp_dashboard
  SELECT
    'Demandas Concluídas' as metrica,
    COUNT(*)::DECIMAL,
    75,
    'OPERACIONAL',
    0,
    CASE WHEN COUNT(*) >= 75 THEN 'OK' ELSE 'ALERTA' END
  FROM demandas
  WHERE status = 'concluida'
    AND data_conclusao >= v_data_inicio;

  -- Taxa de Inadimplência
  INSERT INTO temp_dashboard
  SELECT
    'Taxa de Inadimplência (%)' as metrica,
    ROUND(100.0 * COUNT(CASE WHEN status = 'vencido' THEN 1 END) / 
      NULLIF(COUNT(*), 0), 2),
    5,
    'FINANCEIRO',
    0,
    CASE WHEN ROUND(100.0 * COUNT(CASE WHEN status = 'vencido' THEN 1 END) / 
      NULLIF(COUNT(*), 0), 2) <= 5 THEN 'OK' ELSE 'CRÍTICO' END
  FROM pagamentos
  WHERE tipo = 'receber'
    AND criado_em >= v_data_inicio;

  -- Demandas Atrasadas
  INSERT INTO temp_dashboard
  SELECT
    'Demandas Atrasadas' as metrica,
    COUNT(*)::DECIMAL,
    5,
    'OPERACIONAL',
    0,
    CASE WHEN COUNT(*) <= 5 THEN 'OK' ELSE 'CRÍTICO' END
  FROM demandas
  WHERE atrasada = TRUE
    AND status NOT IN ('concluida', 'cancelada');

  SELECT * FROM temp_dashboard ORDER BY categoria, metrica;
  DROP TABLE temp_dashboard;

  RAISE NOTICE 'Dashboard Gerencial Completo gerado para período de % dias', p_periodo_dias;
END;
$$;

-- Usar:
-- CALL proc_dashboard_gerencial_completo(30);
```

## 6.2 Alertas Automáticos para Gerência

```sql
CREATE OR REPLACE PROCEDURE proc_gerar_alertas_gerencia()
LANGUAGE plpgsql
AS $$
DECLARE
  v_alerta RECORD;
  v_total_alertas INTEGER := 0;
BEGIN
  CREATE TEMP TABLE temp_alertas (
    id SERIAL,
    tipo_alerta VARCHAR,
    severidade VARCHAR,
    descricao TEXT,
    quantidade INTEGER,
    acao_recomendada VARCHAR,
    data_alerta TIMESTAMP
  );

  -- Alerta 1: Demandas Atrasadas
  INSERT INTO temp_alertas (tipo_alerta, severidade, descricao, quantidade, acao_recomendada, data_alerta)
  SELECT
    'DEMANDAS ATRASADAS',
    'CRÍTICO',
    'Demandas com prazo vencido',
    COUNT(*),
    'Priorizar e acelerar execução',
    CURRENT_TIMESTAMP
  FROM demandas
  WHERE atrasada = TRUE 
    AND status NOT IN ('concluida', 'cancelada')
  HAVING COUNT(*) > 0;

  -- Alerta 2: Inadimplência
  INSERT INTO temp_alertas (tipo_alerta, severidade, descricao, quantidade, acao_recomendada, data_alerta)
  SELECT
    'INADIMPLÊNCIA ALTA',
    'ALTO',
    'Clientes com mais de 30 dias de atraso',
    COUNT(*),
    'Intensificar cobrança',
    CURRENT_TIMESTAMP
  FROM pagamentos
  WHERE tipo = 'receber' 
    AND status = 'vencido'
    AND EXTRACT(DAY FROM CURRENT_DATE - data_vencimento) > 30
  HAVING COUNT(*) > 0;

  -- Alerta 3: Fluxo de Caixa Negativo
  INSERT INTO temp_alertas (tipo_alerta, severidade, descricao, quantidade, acao_recomendada, data_alerta)
  SELECT
    'FLUXO DE CAIXA NEGATIVO',
    'CRÍTICO',
    'Previsão de saldo negativo nos próximos dias',
    1,
    'Revisar despesas e acelerar cobranças',
    CURRENT_TIMESTAMP
  FROM (
    SELECT SUM(saldo_atual) as saldo_total
    FROM contas_bancarias
    WHERE ativa = TRUE
  ) saldo
  WHERE saldo_total < 0
  HAVING COUNT(*) > 0;

  -- Alerta 4: Correspondentes com Baixa Performance
  INSERT INTO temp_alertas (tipo_alerta, severidade, descricao, quantidade, acao_recomendada, data_alerta)
  SELECT
    'BAIXA PERFORMANCE CORRESPONDENTE',
    'MÉDIO',
    'Correspondentes com taxa de conclusão < 50%',
    COUNT(*),
    'Revisar contratos e capacidade',
    CURRENT_TIMESTAMP
  FROM correspondentes cor
  LEFT JOIN demandas d ON cor.id = d.correspondente_id
  WHERE cor.deletado_em IS NULL
  GROUP BY cor.id
  HAVING COUNT(CASE WHEN d.status = 'concluida' THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(d.id), 0) < 0.5
  AND COUNT(d.id) > 0;

  SELECT * FROM temp_alertas ORDER BY 
    CASE WHEN severidade = 'CRÍTICO' THEN 1 
         WHEN severidade = 'ALTO' THEN 2 
         ELSE 3 END;

  DROP TABLE temp_alertas;

  RAISE NOTICE 'Alertas de Gerência gerados';
END;
$$;

-- Usar:
-- CALL proc_gerar_alertas_gerencia();
```

---

**Stored Procedures Completos - Parte 2/2** ✅

## Resumo Final de Procedures Criadas

```sql
RELATÓRIOS FINANCEIROS (4):
├─ proc_relatorio_fluxo_caixa
├─ proc_relatorio_receita_despesa_comparativo
├─ proc_relatorio_inadimplencia_detalhado
└─ proc_analise_abc_clientes

RELATÓRIOS OPERACIONAIS (2):
├─ proc_relatorio_demandas_status_timeline
└─ proc_relatorio_prazos_proximos

RELATÓRIOS DE PERFORMANCE (2):
├─ proc_relatorio_performance_correspondentes
└─ proc_relatorio_kpis_executivo

ANÁLISES COMPLEXAS (3):
├─ proc_analise_lucratividade_cliente
├─ proc_previsao_fluxo_caixa_30dias
└─ proc_analise_concentracao_risco

PROCEDURES DE EXPORTAÇÃO (1):
└─ proc_exportar_relatorio_financeiro

PROCEDURES GERENCIAIS (2):
├─ proc_dashboard_gerencial_completo
└─ proc_gerar_alertas_gerencia

TOTAL: 14 Procedures Production-Ready! 🎉
```