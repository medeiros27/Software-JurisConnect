# JURISCONNECT - STORED PROCEDURES PARA RELATÓRIOS

## 📋 ÍNDICE

1. [Relatórios Financeiros](#1-relatórios-financeiros)
2. [Relatórios Operacionais](#2-relatórios-operacionais)
3. [Relatórios de Performance](#3-relatórios-de-performance)
4. [Análises Complexas](#4-análises-complexas)
5. [Procedures de Exportação](#5-procedures-de-exportação)
6. [Procedures Gerenciais](#6-procedures-gerenciais)

---

# 1. RELATÓRIOS FINANCEIROS

## 1.1 Relatório de Fluxo de Caixa Completo

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_fluxo_caixa(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_por_dia BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_atual DATE := p_data_inicio;
  v_saldo_anterior DECIMAL(10,2) := 0;
  v_receita_dia DECIMAL(10,2);
  v_despesa_dia DECIMAL(10,2);
  v_saldo_dia DECIMAL(10,2);
BEGIN
  -- Criar tabela temporária para resultados
  CREATE TEMP TABLE temp_fluxo_caixa (
    data_evento DATE,
    receita DECIMAL(10,2),
    despesa DECIMAL(10,2),
    saldo DECIMAL(10,2),
    saldo_acumulado DECIMAL(10,2)
  );

  -- Loop por cada dia
  WHILE v_data_atual <= p_data_fim LOOP
    -- Calcular receitas do dia
    SELECT COALESCE(SUM(valor_final), 0) INTO v_receita_dia
    FROM pagamentos
    WHERE tipo = 'receber' 
      AND status = 'pago'
      AND DATE(data_pagamento) = v_data_atual;

    -- Calcular despesas do dia
    SELECT COALESCE(SUM(valor_final), 0) INTO v_despesa_dia
    FROM pagamentos
    WHERE tipo = 'pagar' 
      AND status = 'pago'
      AND DATE(data_pagamento) = v_data_atual;

    v_saldo_dia := v_receita_dia - v_despesa_dia;
    v_saldo_anterior := v_saldo_anterior + v_saldo_dia;

    -- Inserir resultado
    INSERT INTO temp_fluxo_caixa VALUES (
      v_data_atual,
      v_receita_dia,
      v_despesa_dia,
      v_saldo_dia,
      v_saldo_anterior
    );

    v_data_atual := v_data_atual + INTERVAL '1 day';
  END LOOP;

  -- Retornar resultados
  SELECT * FROM temp_fluxo_caixa
  ORDER BY data_evento;

  -- Cleanup
  DROP TABLE temp_fluxo_caixa;
  
  RAISE NOTICE 'Relatório de Fluxo de Caixa gerado: % a %', p_data_inicio, p_data_fim;
END;
$$;

-- Usar:
-- CALL proc_relatorio_fluxo_caixa('2025-01-01'::DATE, '2025-01-31'::DATE);
```

## 1.2 Relatório de Receitas vs Despesas (Comparativo Mensal)

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_receita_despesa_comparativo(
  p_ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mes INTEGER := 1;
  v_receita DECIMAL(10,2);
  v_despesa DECIMAL(10,2);
  v_lucro DECIMAL(10,2);
  v_margem DECIMAL(5,2);
BEGIN
  CREATE TEMP TABLE temp_resultado_mensal (
    mes INTEGER,
    mes_nome VARCHAR,
    receita DECIMAL(10,2),
    despesa DECIMAL(10,2),
    lucro DECIMAL(10,2),
    margem_lucro DECIMAL(5,2),
    taxa_crescimento DECIMAL(5,2)
  );

  DECLARE
    v_receita_mes_anterior DECIMAL(10,2) := 0;
    v_taxa_crescimento DECIMAL(5,2);
  BEGIN
    WHILE v_mes <= 12 LOOP
      -- Receitas
      SELECT COALESCE(SUM(valor_final), 0) INTO v_receita
      FROM pagamentos
      WHERE tipo = 'receber' 
        AND status = 'pago'
        AND EXTRACT(YEAR FROM data_pagamento) = p_ano
        AND EXTRACT(MONTH FROM data_pagamento) = v_mes;

      -- Despesas
      SELECT COALESCE(SUM(valor_final), 0) INTO v_despesa
      FROM pagamentos
      WHERE tipo = 'pagar' 
        AND status = 'pago'
        AND EXTRACT(YEAR FROM data_pagamento) = p_ano
        AND EXTRACT(MONTH FROM data_pagamento) = v_mes;

      v_lucro := v_receita - v_despesa;
      v_margem := CASE 
        WHEN v_receita > 0 THEN ROUND((v_lucro / v_receita) * 100, 2)
        ELSE 0 
      END;

      -- Calcular taxa de crescimento
      v_taxa_crescimento := CASE
        WHEN v_receita_mes_anterior > 0 THEN ROUND(((v_receita - v_receita_mes_anterior) / v_receita_mes_anterior) * 100, 2)
        ELSE 0
      END;

      INSERT INTO temp_resultado_mensal VALUES (
        v_mes,
        TO_CHAR(MAKE_DATE(p_ano, v_mes, 1), 'TMMonth'),
        v_receita,
        v_despesa,
        v_lucro,
        v_margem,
        v_taxa_crescimento
      );

      v_receita_mes_anterior := v_receita;
      v_mes := v_mes + 1;
    END LOOP;
  END;

  SELECT * FROM temp_resultado_mensal ORDER BY mes;
  DROP TABLE temp_resultado_mensal;

  RAISE NOTICE 'Relatório Comparativo de Receita/Despesa gerado para %', p_ano;
END;
$$;

-- Usar:
-- CALL proc_relatorio_receita_despesa_comparativo(2025);
```

## 1.3 Análise de Inadimplência e Cobrança

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_inadimplencia_detalhado()
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_inadimplencia (
    cliente_id INTEGER,
    nome_cliente VARCHAR,
    cpf_cnpj VARCHAR,
    telefone VARCHAR,
    email VARCHAR,
    quantidade_faturas_vencidas INTEGER,
    valor_total_vencido DECIMAL(10,2),
    maior_atraso_dias INTEGER,
    menor_atraso_dias INTEGER,
    media_atraso_dias DECIMAL(10,2),
    categoria_risco VARCHAR,
    tentativas_cobranca INTEGER,
    data_ultima_tentativa TIMESTAMP
  );

  INSERT INTO temp_inadimplencia
  SELECT
    c.id,
    c.nome_fantasia,
    c.cpf_cnpj,
    c.telefone,
    c.email,
    COUNT(p.id) as quantidade_faturas_vencidas,
    COALESCE(SUM(p.valor_final), 0) as valor_total_vencido,
    MAX(EXTRACT(DAY FROM CURRENT_DATE - p.data_vencimento))::INTEGER as maior_atraso_dias,
    MIN(EXTRACT(DAY FROM CURRENT_DATE - p.data_vencimento))::INTEGER as menor_atraso_dias,
    ROUND(AVG(EXTRACT(DAY FROM CURRENT_DATE - p.data_vencimento)), 2) as media_atraso_dias,
    CASE
      WHEN SUM(p.valor_final) > 50000 THEN 'CRÍTICO'
      WHEN SUM(p.valor_final) > 20000 THEN 'ALTO'
      WHEN SUM(p.valor_final) > 5000 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END as categoria_risco,
    p.tentativas_cobranca,
    p.ultima_tentativa_cobranca
  FROM clientes c
  LEFT JOIN pagamentos p ON c.id = p.cliente_id 
    AND p.tipo = 'receber' 
    AND p.status = 'vencido'
  WHERE c.deletado_em IS NULL
  GROUP BY c.id, c.nome_fantasia, c.cpf_cnpj, c.telefone, c.email, 
           p.tentativas_cobranca, p.ultima_tentativa_cobranca
  HAVING COUNT(p.id) > 0
  ORDER BY valor_total_vencido DESC;

  SELECT * FROM temp_inadimplencia;
  DROP TABLE temp_inadimplencia;

  RAISE NOTICE 'Relatório de Inadimplência Detalhado gerado';
END;
$$;

-- Usar:
-- CALL proc_relatorio_inadimplencia_detalhado();
```

## 1.4 Análise ABC de Clientes (Curva ABC)

```sql
CREATE OR REPLACE PROCEDURE proc_analise_abc_clientes(
  p_ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_receita DECIMAL(10,2);
  v_acumulado DECIMAL(10,2) := 0;
BEGIN
  -- Calcular total
  SELECT COALESCE(SUM(valor_final), 0) INTO v_total_receita
  FROM pagamentos
  WHERE tipo = 'receber' 
    AND status = 'pago'
    AND EXTRACT(YEAR FROM data_pagamento) = p_ano;

  CREATE TEMP TABLE temp_abc (
    cliente_id INTEGER,
    nome_cliente VARCHAR,
    valor_total DECIMAL(10,2),
    percentual_receita DECIMAL(5,2),
    percentual_acumulado DECIMAL(5,2),
    classificacao VARCHAR,
    posicao_ranking INTEGER
  );

  INSERT INTO temp_abc
  WITH ranking AS (
    SELECT
      c.id,
      c.nome_fantasia,
      COALESCE(SUM(p.valor_final), 0) as valor_total,
      ROW_NUMBER() OVER (ORDER BY SUM(p.valor_final) DESC) as posicao
    FROM clientes c
    LEFT JOIN pagamentos p ON c.id = p.cliente_id 
      AND p.tipo = 'receber' 
      AND p.status = 'pago'
      AND EXTRACT(YEAR FROM p.data_pagamento) = p_ano
    WHERE c.deletado_em IS NULL
    GROUP BY c.id, c.nome_fantasia
  )
  SELECT
    r.id,
    r.nome_fantasia,
    r.valor_total,
    ROUND((r.valor_total / v_total_receita) * 100, 2),
    SUM(r.valor_total) OVER (ORDER BY r.valor_total DESC),
    'A', -- Será atualizado
    r.posicao
  FROM ranking r;

  -- Atualizar classificações ABC
  UPDATE temp_abc
  SET percentual_acumulado = (
    SELECT SUM(t2.valor_total) / v_total_receita * 100
    FROM temp_abc t2
    WHERE t2.posicao_ranking <= temp_abc.posicao_ranking
  );

  UPDATE temp_abc
  SET classificacao = CASE
    WHEN percentual_acumulado <= 80 THEN 'A'
    WHEN percentual_acumulado <= 95 THEN 'B'
    ELSE 'C'
  END;

  SELECT * FROM temp_abc ORDER BY posicao_ranking;
  DROP TABLE temp_abc;

  RAISE NOTICE 'Análise ABC de Clientes gerada para %', p_ano;
END;
$$;

-- Usar:
-- CALL proc_analise_abc_clientes(2025);
```

---

# 2. RELATÓRIOS OPERACIONAIS

## 2.1 Relatório de Demandas por Status e Timeline

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_demandas_status_timeline()
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_demandas_status (
    status VARCHAR,
    total INTEGER,
    urgentes INTEGER,
    atrasadas INTEGER,
    idade_media_dias DECIMAL(10,2),
    valor_total DECIMAL(10,2),
    prazo_medio_dias DECIMAL(10,2),
    clientes_unicos INTEGER,
    correspondentes_unicos INTEGER
  );

  INSERT INTO temp_demandas_status
  SELECT
    d.status,
    COUNT(d.id) as total,
    COUNT(CASE WHEN d.urgente THEN 1 END) as urgentes,
    COUNT(CASE WHEN d.atrasada THEN 1 END) as atrasadas,
    ROUND(AVG(EXTRACT(DAY FROM CURRENT_DATE - d.data_inicio)), 2) as idade_media_dias,
    COALESCE(SUM(d.valor_estimado), 0) as valor_total,
    ROUND(AVG(EXTRACT(DAY FROM d.data_prazo - d.data_inicio)), 2) as prazo_medio_dias,
    COUNT(DISTINCT d.cliente_id) as clientes_unicos,
    COUNT(DISTINCT d.correspondente_id) as correspondentes_unicos
  FROM demandas d
  WHERE d.deletado_em IS NULL
  GROUP BY d.status
  ORDER BY total DESC;

  SELECT * FROM temp_demandas_status;
  DROP TABLE temp_demandas_status;

  RAISE NOTICE 'Relatório de Demandas por Status gerado';
END;
$$;

-- Usar:
-- CALL proc_relatorio_demandas_status_timeline();
```

## 2.2 Relatório de Prazos Próximos e Alertas

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_prazos_proximos(
  p_dias_alerta INTEGER DEFAULT 30
)
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_prazos (
    demanda_id INTEGER,
    numero_demanda VARCHAR,
    titulo VARCHAR,
    cliente VARCHAR,
    responsavel VARCHAR,
    data_prazo DATE,
    dias_restantes INTEGER,
    prioridade VARCHAR,
    status VARCHAR,
    tipo_alerta VARCHAR,
    acao_sugerida VARCHAR
  );

  INSERT INTO temp_prazos
  SELECT
    d.id,
    d.numero,
    d.titulo,
    c.nome_fantasia,
    u.nome,
    d.data_prazo,
    EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE)::INTEGER as dias_restantes,
    d.prioridade,
    d.status,
    CASE
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= 0 THEN 'VENCIDO'
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= 3 THEN 'CRÍTICO'
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= 7 THEN 'ALERTA'
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= p_dias_alerta THEN 'ATENÇÃO'
      ELSE 'NORMAL'
    END as tipo_alerta,
    CASE
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= 0 THEN 'Contatar cliente urgentemente'
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= 3 THEN 'Priorizar conclusão'
      WHEN EXTRACT(DAY FROM d.data_prazo - CURRENT_DATE) <= 7 THEN 'Acelerar execução'
      ELSE 'Monitorar regularmente'
    END as acao_sugerida
  FROM demandas d
  JOIN clientes c ON d.cliente_id = c.id
  LEFT JOIN usuarios u ON d.responsavel_atual_id = u.id
  WHERE d.deletado_em IS NULL
    AND d.status NOT IN ('concluida', 'cancelada')
    AND d.data_prazo IS NOT NULL
    AND d.data_prazo <= CURRENT_DATE + (p_dias_alerta || ' days')::INTERVAL
  ORDER BY d.data_prazo ASC, d.prioridade DESC;

  SELECT * FROM temp_prazos;
  DROP TABLE temp_prazos;

  RAISE NOTICE 'Relatório de Prazos Próximos gerado (próximos % dias)', p_dias_alerta;
END;
$$;

-- Usar:
-- CALL proc_relatorio_prazos_proximos(30);
```

---

# 3. RELATÓRIOS DE PERFORMANCE

## 3.1 Performance de Correspondentes (KPIs Detalhados)

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_performance_correspondentes(
  p_data_inicio DATE DEFAULT (CURRENT_DATE - INTERVAL '90 days')::DATE,
  p_data_fim DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_perf_correspondentes (
    correspondente_id INTEGER,
    nome VARCHAR,
    total_demandas INTEGER,
    demandas_concluidas INTEGER,
    taxa_conclusao DECIMAL(5,2),
    dias_medio_conclusao DECIMAL(10,2),
    dias_maximo_conclusao INTEGER,
    demandas_atrasadas INTEGER,
    taxa_atraso DECIMAL(5,2),
    valor_processado DECIMAL(10,2),
    receita_gerada DECIMAL(10,2),
    comissoes_pagas DECIMAL(10,2),
    margem_lucro DECIMAL(10,2),
    rating DECIMAL(3,2),
    status_saude VARCHAR
  );

  INSERT INTO temp_perf_correspondentes
  SELECT
    cor.id,
    cor.nome_fantasia,
    COUNT(d.id) as total_demandas,
    COUNT(CASE WHEN d.status = 'concluida' THEN 1 END) as demandas_concluidas,
    ROUND(100.0 * COUNT(CASE WHEN d.status = 'concluida' THEN 1 END) / NULLIF(COUNT(d.id), 0), 2) as taxa_conclusao,
    ROUND(AVG(EXTRACT(DAY FROM COALESCE(d.data_conclusao, CURRENT_DATE) - d.data_inicio)), 2) as dias_medio_conclusao,
    MAX(EXTRACT(DAY FROM COALESCE(d.data_conclusao, CURRENT_DATE) - d.data_inicio))::INTEGER as dias_maximo_conclusao,
    COUNT(CASE WHEN d.atrasada THEN 1 END) as demandas_atrasadas,
    ROUND(100.0 * COUNT(CASE WHEN d.atrasada THEN 1 END) / NULLIF(COUNT(d.id), 0), 2) as taxa_atraso,
    COALESCE(SUM(d.valor_cobrado), 0) as valor_processado,
    COALESCE(SUM(p.valor_final), 0) as receita_gerada,
    COALESCE(SUM(p.valor_final * COALESCE(cor.comissao_padrao, 0) / 100), 0) as comissoes_pagas,
    COALESCE(SUM(p.valor_final) - SUM(p.valor_final * COALESCE(cor.comissao_padrao, 0) / 100), 0) as margem_lucro,
    ROUND(COALESCE(cor.clasificacao, 0), 2),
    CASE
      WHEN COUNT(CASE WHEN d.status = 'concluida' THEN 1 END)::DECIMAL / NULLIF(COUNT(d.id), 0) >= 0.9 THEN 'EXCELENTE'
      WHEN COUNT(CASE WHEN d.status = 'concluida' THEN 1 END)::DECIMAL / NULLIF(COUNT(d.id), 0) >= 0.75 THEN 'BOM'
      WHEN COUNT(CASE WHEN d.status = 'concluida' THEN 1 END)::DECIMAL / NULLIF(COUNT(d.id), 0) >= 0.5 THEN 'SATISFATÓRIO'
      ELSE 'INSATISFATÓRIO'
    END as status_saude
  FROM correspondentes cor
  LEFT JOIN demandas d ON cor.id = d.correspondente_id 
    AND d.data_inicio >= p_data_inicio 
    AND d.data_inicio <= p_data_fim
  LEFT JOIN pagamentos p ON d.id = p.demanda_id 
    AND p.tipo = 'pagar'
  WHERE cor.deletado_em IS NULL
  GROUP BY cor.id, cor.nome_fantasia, cor.clasificacao, cor.comissao_padrao
  ORDER BY taxa_conclusao DESC NULLS LAST;

  SELECT * FROM temp_perf_correspondentes;
  DROP TABLE temp_perf_correspondentes;

  RAISE NOTICE 'Relatório de Performance de Correspondentes gerado de % a %', p_data_inicio, p_data_fim;
END;
$$;

-- Usar:
-- CALL proc_relatorio_performance_correspondentes('2025-01-01'::DATE, '2025-03-31'::DATE);
```

## 3.2 KPIs Gerenciais (Dashboard Executivo)

```sql
CREATE OR REPLACE PROCEDURE proc_relatorio_kpis_executivo(
  p_mes INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_inicio DATE;
  v_data_fim DATE;
BEGIN
  v_data_inicio := MAKE_DATE(p_ano, p_mes, 1);
  v_data_fim := (MAKE_DATE(p_ano, p_mes, 1) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  CREATE TEMP TABLE temp_kpis (
    kpi_nome VARCHAR,
    valor DECIMAL(15,2),
    meta DECIMAL(15,2),
    percentual_meta DECIMAL(5,2),
    status_meta VARCHAR,
    tendencia VARCHAR,
    comparativo_mes_anterior DECIMAL(5,2)
  );

  -- KPI 1: Receita Mensal
  INSERT INTO temp_kpis
  SELECT 'Receita Mensal',
    COALESCE(SUM(valor_final), 0),
    100000, -- Meta exemplo
    ROUND(COALESCE(SUM(valor_final), 0) / 100000 * 100, 2),
    CASE WHEN COALESCE(SUM(valor_final), 0) >= 100000 THEN 'ATINGIDO' ELSE 'NÃO ATINGIDO' END,
    'CRESCENTE',
    0
  FROM pagamentos
  WHERE tipo = 'receber' AND status = 'pago'
    AND data_pagamento BETWEEN v_data_inicio AND v_data_fim;

  -- KPI 2: Demandas Concluídas
  INSERT INTO temp_kpis
  SELECT 'Demandas Concluídas',
    COUNT(*)::DECIMAL,
    50, -- Meta
    ROUND(COUNT(*) / 50.0 * 100, 2),
    CASE WHEN COUNT(*) >= 50 THEN 'ATINGIDO' ELSE 'NÃO ATINGIDO' END,
    'ESTÁVEL',
    0
  FROM demandas
  WHERE status = 'concluida'
    AND DATE_TRUNC('month', data_conclusao) = DATE_TRUNC('month', v_data_inicio::TIMESTAMP);

  -- KPI 3: Taxa de Inadimplência
  INSERT INTO temp_kpis
  SELECT 'Taxa de Inadimplência (%)',
    ROUND(100.0 * COUNT(CASE WHEN p.status = 'vencido' THEN 1 END) / 
      NULLIF(COUNT(CASE WHEN p.tipo = 'receber' THEN 1 END), 0), 2),
    5, -- Meta de 5%
    0,
    CASE WHEN ROUND(100.0 * COUNT(CASE WHEN p.status = 'vencido' THEN 1 END) / 
      NULLIF(COUNT(CASE WHEN p.tipo = 'receber' THEN 1 END), 0), 2) <= 5 THEN 'ATINGIDO' 
      ELSE 'NÃO ATINGIDO' END,
    'CONTROLADA',
    0
  FROM pagamentos p;

  -- KPI 4: Tempo Médio de Conclusão
  INSERT INTO temp_kpis
  SELECT 'Tempo Médio Conclusão (dias)',
    ROUND(AVG(EXTRACT(DAY FROM d.data_conclusao - d.data_inicio)), 2),
    15, -- Meta de 15 dias
    ROUND(AVG(EXTRACT(DAY FROM d.data_conclusao - d.data_inicio)) / 15 * 100, 2),
    CASE WHEN ROUND(AVG(EXTRACT(DAY FROM d.data_conclusao - d.data_inicio)), 2) <= 15 
      THEN 'ATINGIDO' ELSE 'NÃO ATINGIDO' END,
    'OTIMIZANDO',
    0
  FROM demandas d
  WHERE d.status = 'concluida'
    AND DATE_TRUNC('month', d.data_conclusao) = DATE_TRUNC('month', v_data_inicio::TIMESTAMP);

  SELECT * FROM temp_kpis;
  DROP TABLE temp_kpis;

  RAISE NOTICE 'Relatório KPIs Executivo gerado para %/%', p_mes, p_ano;
END;
$$;

-- Usar:
-- CALL proc_relatorio_kpis_executivo(11, 2025);
```

---

**Relatórios Complexos - Parte 1/2** ✅

**Continuação com Análises Avançadas, Exportação e Procedures Gerenciais...**