-- 04_procedures.sql
-- Stored procedures para relatórios pesados

-- Relatório financeiro por período
CREATE OR REPLACE FUNCTION relatorio_financeiro(p_inicio DATE, p_fim DATE)
RETURNS TABLE (tipo TEXT, categoria TEXT, total_cents BIGINT, qtd_registros INTEGER) 
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT f.tipo, f.categoria,
         SUM(f.valor_cents) AS total_cents,
         COUNT(*)::INTEGER AS qtd_registros
  FROM financeiro f
  WHERE f.vencimento BETWEEN p_inicio AND p_fim
  GROUP BY f.tipo, f.categoria
  ORDER BY f.tipo, total_cents DESC;
END;
$$;

-- Relatório de demandas por cliente e status
CREATE OR REPLACE FUNCTION relatorio_demandas_por_cliente()
RETURNS TABLE (cliente_id UUID, cliente_nome TEXT, status TEXT, qtd INTEGER) 
LANGUAGE sql STABLE AS $$
    SELECT c.id, c.nome, d.status, COUNT(*)::INTEGER AS qtd
    FROM demandas d
    JOIN clientes c ON d.cliente_id = c.id
    GROUP BY c.id, c.nome, d.status
    ORDER BY c.nome, d.status;
$$;

-- Relatório de cash flow
CREATE OR REPLACE FUNCTION relatorio_cashflow(p_inicio DATE, p_fim DATE)
RETURNS TABLE (
    data DATE,
    entrada_cents BIGINT,
    saida_cents BIGINT,
    saldo_cents BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT d::DATE,
         COALESCE(SUM(CASE WHEN tipo='receita' THEN valor_cents END),0) AS entrada_cents,
         COALESCE(SUM(CASE WHEN tipo='despesa' THEN valor_cents END),0) AS saida_cents,
         (COALESCE(SUM(CASE WHEN tipo='receita' THEN valor_cents END),0) -
          COALESCE(SUM(CASE WHEN tipo='despesa' THEN valor_cents END),0)) AS saldo_cents
  FROM generate_series(p_inicio, p_fim, interval '1 day') g(d)
  LEFT JOIN financeiro f ON f.vencimento = d::DATE
  GROUP BY d
  ORDER BY d;
END;
$$;
