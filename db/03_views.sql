-- 03_views.sql
-- Views para consultas complexas frequentes

-- KPIs do dashboard
CREATE OR REPLACE VIEW vw_kpis AS
SELECT
  (SELECT COUNT(*) FROM demandas WHERE status='em_andamento') AS demandas_em_andamento,
  (SELECT COUNT(*) FROM demandas WHERE status='concluida') AS demandas_concluidas,
  (SELECT COALESCE(SUM(valor_cents),0)/100 FROM financeiro WHERE tipo='receita' AND pago_em IS NOT NULL) AS receita_total,
  (SELECT COALESCE(SUM(valor_cents),0)/100 FROM financeiro WHERE tipo='despesa' AND pago_em IS NOT NULL) AS despesa_total,
  (SELECT COUNT(*) FROM agenda WHERE data_inicio BETWEEN now() AND now()+interval '7 days') AS eventos_proximos;

-- Últimas 10 demandas
CREATE OR REPLACE VIEW vw_ultimas_demandas AS
SELECT d.id, d.numero, d.status, d.prioridade,
       c.nome AS cliente,
       co.nome AS correspondente,
       d.data_abertura,
       d.data_fim_prevista
FROM demandas d
JOIN clientes c ON d.cliente_id = c.id
JOIN correspondentes co ON d.correspondente_id = co.id
ORDER BY d.criado_em DESC
LIMIT 10;

-- Auditoria recente
CREATE OR REPLACE VIEW vw_auditoria_recente AS
SELECT id, tabela, operacao, registro_id,
       to_char(timestamp,'YYYY-MM-DD HH24:MI:SS') AS ts,
       ip_address, user_agent
FROM logs_auditoria
ORDER BY timestamp DESC
LIMIT 100;
