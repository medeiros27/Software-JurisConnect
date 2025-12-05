# JURISCONNECT - SISTEMA DE AUDITORIA (PARTE 2)

## 📋 CONTINUAÇÃO

4. [Views de Auditoria](#4-views-de-auditoria)
5. [Procedures de Relatório de Auditoria](#5-procedures-de-relatório-de-auditoria)
6. [Cleanup e Manutenção](#6-cleanup-e-manutenção)
7. [Dashboard de Conformidade](#7-dashboard-de-conformidade)

---

# 4. VIEWS DE AUDITORIA

## 4.1 Views para Análise

```sql
-- VIEW: Alterações Recentes por Tabela
CREATE OR REPLACE VIEW vw_alteracoes_recentes AS
SELECT
  id,
  tabela,
  registro_id,
  operacao,
  usuario_nome,
  timestamp,
  CASE
    WHEN campos_alterados IS NOT NULL THEN array_to_string(campos_alterados, ', ')
    ELSE 'N/A'
  END as campos_modificados,
  CASE
    WHEN operacao = 'UPDATE' THEN mudancas_detalhadas
    ELSE NULL
  END as detalhes_mudancas
FROM auditoria.log_completo
ORDER BY timestamp DESC
LIMIT 100;

-- VIEW: Atividade por Usuário
CREATE OR REPLACE VIEW vw_auditoria_atividade_usuario AS
SELECT
  u.id,
  u.nome,
  u.email,
  COUNT(l.id) as total_operacoes,
  COUNT(CASE WHEN l.operacao = 'INSERT' THEN 1 END) as insercoes,
  COUNT(CASE WHEN l.operacao = 'UPDATE' THEN 1 END) as atualizacoes,
  COUNT(CASE WHEN l.operacao = 'DELETE' THEN 1 END) as delecoes,
  MIN(l.timestamp) as primeira_atividade,
  MAX(l.timestamp) as ultima_atividade,
  COUNT(DISTINCT l.tabela) as tabelas_afetadas
FROM usuarios u
LEFT JOIN auditoria.log_completo l ON u.id = l.usuario_id
WHERE u.deletado_em IS NULL
GROUP BY u.id, u.nome, u.email
ORDER BY total_operacoes DESC;

-- VIEW: Exclusões Suspensas
CREATE OR REPLACE VIEW vw_exclusoes_suspensas AS
SELECT
  le.id,
  le.tabela,
  le.registro_id,
  le.tipo_exclusao,
  u.nome as excluido_por,
  le.timestamp as data_exclusao,
  le.dados_completos,
  CASE
    WHEN le.restaurado_em IS NOT NULL THEN 'Restaurado'
    ELSE 'Permanente'
  END as status_atual,
  le.motivo
FROM auditoria.log_exclusoes le
LEFT JOIN usuarios u ON le.usuario_id = u.id
ORDER BY le.timestamp DESC;

-- VIEW: Acessos Sensíveis
CREATE OR REPLACE VIEW vw_acessos_sensivel AS
SELECT
  u.nome,
  las.tabela,
  las.coluna_sensivel,
  las.tipo_acesso,
  las.quantidade_registros,
  las.ip_origem,
  las.timestamp,
  CASE
    WHEN las.sucesso THEN 'Sucesso'
    ELSE 'Negado'
  END as resultado
FROM auditoria.log_acesso_sensivel las
JOIN usuarios u ON las.usuario_id = u.id
ORDER BY las.timestamp DESC;

-- VIEW: Tentativas de Login Suspeitas
CREATE OR REPLACE VIEW vw_logins_suspeitos AS
SELECT
  u.nome,
  lu.email,
  lu.acao,
  COUNT(*) as total_tentativas,
  COUNT(CASE WHEN lu.success = FALSE THEN 1 END) as falhas,
  array_agg(DISTINCT lu.ip_origem) as ips_utilizados,
  MAX(lu.timestamp) as ultima_tentativa,
  MIN(lu.timestamp) as primeira_tentativa
FROM auditoria.log_usuarios lu
LEFT JOIN usuarios u ON lu.usuario_id = u.id
WHERE DATE(lu.timestamp) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY u.id, u.nome, lu.email, lu.acao
HAVING COUNT(CASE WHEN lu.success = FALSE THEN 1 END) > 3
ORDER BY falhas DESC;

-- VIEW: Transações Críticas
CREATE OR REPLACE VIEW vw_transacoes_criticas AS
SELECT
  id,
  u.nome as usuario,
  tipo_transacao,
  descricao,
  valor,
  status,
  timestamp_inicio,
  timestamp_fim,
  duracao_ms,
  resultado,
  ip_origem,
  CASE
    WHEN erro IS NOT NULL THEN 'Erro: ' || erro
    ELSE 'OK'
  END as status_transacao
FROM auditoria.log_transacoes_criticas lt
LEFT JOIN usuarios u ON lt.usuario_id = u.id
ORDER BY timestamp_inicio DESC;

-- VIEW: Relatórios Exportados
CREATE OR REPLACE VIEW vw_relatorios_exportados AS
SELECT
  u.nome as usuario,
  lr.tipo_relatorio,
  lr.formato_exportacao,
  lr.quantidade_registros,
  lr.tamanho_arquivo,
  lr.timestamp,
  lr.ip_origem,
  CASE
    WHEN lr.arquivo_url IS NOT NULL THEN 'Disponível'
    ELSE 'Deletado'
  END as status_arquivo
FROM auditoria.log_relatorios lr
LEFT JOIN usuarios u ON lr.usuario_id = u.id
ORDER BY lr.timestamp DESC;

-- VIEW: Mudanças em Demandas Críticas
CREATE OR REPLACE VIEW vw_mudancas_demandas_criticas AS
SELECT
  l.timestamp,
  u.nome as usuario,
  d.numero as demanda_numero,
  d.titulo,
  l.campos_alterados,
  l.mudancas_detalhadas,
  l.ip_origem
FROM auditoria.log_completo l
JOIN demandas d ON l.registro_id = d.id
LEFT JOIN usuarios u ON l.usuario_id = u.id
WHERE l.tabela = 'demandas'
  AND (l.operacao IN ('INSERT', 'DELETE') 
       OR l.campos_alterados @> ARRAY['status', 'valor_estimado'])
ORDER BY l.timestamp DESC;

-- VIEW: Auditoria Pagamentos
CREATE OR REPLACE VIEW vw_auditoria_pagamentos AS
SELECT
  l.timestamp,
  u.nome as usuario,
  p.numero_fatura,
  p.tipo,
  l.operacao,
  CASE WHEN l.operacao = 'UPDATE' THEN
    jsonb_build_object(
      'status_antigo', l.dados_antigos ->> 'status',
      'status_novo', l.dados_novos ->> 'status',
      'valor_antigo', l.dados_antigos ->> 'valor_final',
      'valor_novo', l.dados_novos ->> 'valor_final'
    )
  ELSE NULL END as alteracoes_financeiras,
  l.ip_origem
FROM auditoria.log_completo l
JOIN pagamentos p ON l.registro_id = p.id
LEFT JOIN usuarios u ON l.usuario_id = u.id
WHERE l.tabela = 'pagamentos'
ORDER BY l.timestamp DESC;
```

---

# 5. PROCEDURES DE RELATÓRIO DE AUDITORIA

## 5.1 Relatório Detalhado de Auditoria

```sql
CREATE OR REPLACE PROCEDURE auditoria.proc_relatorio_auditoria_detalhado(
  p_data_inicio DATE,
  p_data_fim DATE,
  p_usuario_id INTEGER DEFAULT NULL,
  p_tabela VARCHAR DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_operacoes INTEGER;
  v_total_insercoes INTEGER;
  v_total_atualizacoes INTEGER;
  v_total_delecoes INTEGER;
BEGIN
  CREATE TEMP TABLE temp_relatorio_auditoria (
    periodo VARCHAR,
    total_operacoes INTEGER,
    insercoes INTEGER,
    atualizacoes INTEGER,
    delecoes INTEGER,
    usuarios_ativos INTEGER,
    tabelas_afetadas VARCHAR[],
    usuario_mais_ativo VARCHAR,
    operacao_mais_comum VARCHAR,
    ultima_operacao TIMESTAMP
  );

  -- Contar operações
  SELECT
    COUNT(*),
    COUNT(CASE WHEN operacao = 'INSERT' THEN 1 END),
    COUNT(CASE WHEN operacao = 'UPDATE' THEN 1 END),
    COUNT(CASE WHEN operacao = 'DELETE' THEN 1 END)
  INTO v_total_operacoes, v_total_insercoes, v_total_atualizacoes, v_total_delecoes
  FROM auditoria.log_completo
  WHERE DATE(timestamp) BETWEEN p_data_inicio AND p_data_fim
    AND (p_usuario_id IS NULL OR usuario_id = p_usuario_id)
    AND (p_tabela IS NULL OR tabela = p_tabela);

  INSERT INTO temp_relatorio_auditoria
  SELECT
    p_data_inicio::TEXT || ' a ' || p_data_fim::TEXT,
    v_total_operacoes,
    v_total_insercoes,
    v_total_atualizacoes,
    v_total_delecoes,
    COUNT(DISTINCT usuario_id),
    array_agg(DISTINCT tabela),
    (SELECT usuario_nome FROM auditoria.log_completo
     WHERE DATE(timestamp) BETWEEN p_data_inicio AND p_data_fim
       AND (p_usuario_id IS NULL OR usuario_id = p_usuario_id)
     GROUP BY usuario_id ORDER BY COUNT(*) DESC LIMIT 1),
    (SELECT operacao FROM auditoria.log_completo
     WHERE DATE(timestamp) BETWEEN p_data_inicio AND p_data_fim
       AND (p_usuario_id IS NULL OR usuario_id = p_usuario_id)
     GROUP BY operacao ORDER BY COUNT(*) DESC LIMIT 1),
    MAX(timestamp)
  FROM auditoria.log_completo
  WHERE DATE(timestamp) BETWEEN p_data_inicio AND p_data_fim
    AND (p_usuario_id IS NULL OR usuario_id = p_usuario_id)
    AND (p_tabela IS NULL OR tabela = p_tabela);

  SELECT * FROM temp_relatorio_auditoria;
  DROP TABLE temp_relatorio_auditoria;

  RAISE NOTICE 'Relatório de Auditoria gerado: % operações de % a %', 
    v_total_operacoes, p_data_inicio, p_data_fim;
END;
$$;

-- Usar:
-- CALL auditoria.proc_relatorio_auditoria_detalhado('2025-11-01'::DATE, '2025-11-30'::DATE);
```

## 5.2 Relatório de Conformidade (LGPD/Compliance)

```sql
CREATE OR REPLACE PROCEDURE auditoria.proc_relatorio_conformidade_lgpd()
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_conformidade (
    verificacao VARCHAR,
    status VARCHAR,
    detalhes TEXT,
    quantidade INTEGER,
    recomendacao TEXT
  );

  -- 1. Verificar acesso a dados pessoais
  INSERT INTO temp_conformidade
  SELECT
    'Acessos a Dados Pessoais',
    'OK',
    'Total de acessos registrados',
    COUNT(*),
    'Monitorar regularmente'
  FROM auditoria.log_acesso_sensivel
  WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '30 days';

  -- 2. Verificar exclusões (direito ao esquecimento)
  INSERT INTO temp_conformidade
  SELECT
    'Direito ao Esquecimento',
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'CRÍTICO' END,
    'Exclusões registradas nos últimos 90 dias',
    COUNT(*),
    CASE WHEN COUNT(*) > 0 THEN 'Procedures de exclusão funcionando'
         ELSE 'Implementar sistema de exclusão' END
  FROM auditoria.log_exclusoes
  WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '90 days';

  -- 3. Verificar consentimento e logins
  INSERT INTO temp_conformidade
  SELECT
    'Auditoria de Acesso',
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'CRÍTICO' END,
    'Logins registrados',
    COUNT(*),
    'Sistema de logging ativo'
  FROM auditoria.log_usuarios
  WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '90 days';

  -- 4. Detectar acessos não autorizados
  INSERT INTO temp_conformidade
  SELECT
    'Segurança de Acesso',
    CASE WHEN COUNT(CASE WHEN success = FALSE THEN 1 END) > 10 THEN 'ALERTA'
         ELSE 'OK' END,
    'Tentativas de login falhadas',
    COUNT(CASE WHEN success = FALSE THEN 1 END),
    'Revisar tentativas falhadas'
  FROM auditoria.log_usuarios
  WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

  -- 5. Verificar retenção de dados
  INSERT INTO temp_conformidade
  SELECT
    'Política de Retenção',
    CASE WHEN MAX(DATE(timestamp)) < CURRENT_DATE - INTERVAL '2 years' THEN 'CRÍTICO'
         ELSE 'OK' END,
    'Logs antigos detectados',
    COUNT(*),
    CASE WHEN MAX(DATE(timestamp)) < CURRENT_DATE - INTERVAL '2 years'
         THEN 'Implementar cleanup automático' ELSE 'OK' END
  FROM auditoria.log_completo
  WHERE DATE(timestamp) < CURRENT_DATE - INTERVAL '2 years';

  SELECT * FROM temp_conformidade;
  DROP TABLE temp_conformidade;

  RAISE NOTICE 'Relatório de Conformidade LGPD gerado';
END;
$$;

-- Usar:
-- CALL auditoria.proc_relatorio_conformidade_lgpd();
```

## 5.3 Análise de Risco de Segurança

```sql
CREATE OR REPLACE PROCEDURE auditoria.proc_analise_risco_seguranca()
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TEMP TABLE temp_riscos (
    tipo_risco VARCHAR,
    severidade VARCHAR,
    descricao TEXT,
    quantidade INTEGER,
    acao_recomendada VARCHAR,
    data_deteccao TIMESTAMP
  );

  -- 1. Força bruta de login
  INSERT INTO temp_riscos
  SELECT
    'Força Bruta',
    CASE WHEN COUNT(*) > 20 THEN 'CRÍTICO'
         WHEN COUNT(*) > 10 THEN 'ALTO'
         ELSE 'MÉDIO' END,
    'Múltiplas tentativas falhadas do mesmo IP',
    COUNT(*),
    'Bloquear IP temporariamente',
    CURRENT_TIMESTAMP
  FROM (
    SELECT ip_origem, COUNT(*) as falhas
    FROM auditoria.log_usuarios
    WHERE success = FALSE
      AND DATE(timestamp) >= CURRENT_DATE - INTERVAL '1 day'
    GROUP BY ip_origem
    HAVING COUNT(*) > 5
  ) a;

  -- 2. Acesso não autorizado a dados sensíveis
  INSERT INTO temp_riscos
  SELECT
    'Acesso Não Autorizado',
    'ALTO',
    'Tentativas de acesso a dados protegidos',
    COUNT(*),
    'Revisar permissões de usuário',
    CURRENT_TIMESTAMP
  FROM auditoria.log_acesso_sensivel
  WHERE sucesso = FALSE
    AND DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days';

  -- 3. Exclusões em massa suspeitas
  INSERT INTO temp_riscos
  SELECT
    'Exclusão em Massa',
    CASE WHEN COUNT(*) > 100 THEN 'CRÍTICO' ELSE 'ALTO' END,
    'Grande volume de exclusões em curto período',
    COUNT(*),
    'Investigar e possivelmente reverter',
    CURRENT_TIMESTAMP
  FROM auditoria.log_exclusoes
  WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '1 day'
  GROUP BY DATE(timestamp)
  HAVING COUNT(*) > 50;

  -- 4. Alterações fora do horário comercial
  INSERT INTO temp_riscos
  SELECT
    'Atividade Fora do Horário',
    'MÉDIO',
    'Operações críticas realizadas fora de horário',
    COUNT(*),
    'Revisar contexto das alterações',
    CURRENT_TIMESTAMP
  FROM auditoria.log_transacoes_criticas
  WHERE EXTRACT(HOUR FROM timestamp_inicio) NOT BETWEEN 8 AND 18
    AND DATE(timestamp_inicio) >= CURRENT_DATE - INTERVAL '7 days';

  -- 5. Alterações de valores críticos
  INSERT INTO temp_riscos
  SELECT
    'Alteração Financeira Crítica',
    'CRÍTICO',
    'Mudanças significativas em valores',
    COUNT(*),
    'Aprovar manualmente grandes alterações',
    CURRENT_TIMESTAMP
  FROM auditoria.log_completo
  WHERE tabela = 'pagamentos'
    AND operacao = 'UPDATE'
    AND mudancas_detalhadas ->> 'valor_final' IS NOT NULL
    AND DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days'
    AND (mudancas_detalhadas -> 'valor_final' ->> 'novo')::DECIMAL > 50000;

  SELECT * FROM temp_riscos ORDER BY 
    CASE WHEN severidade = 'CRÍTICO' THEN 1 
         WHEN severidade = 'ALTO' THEN 2 
         ELSE 3 END;

  DROP TABLE temp_riscos;

  RAISE NOTICE 'Análise de Risco de Segurança concluída';
END;
$$;

-- Usar:
-- CALL auditoria.proc_analise_risco_seguranca();
```

---

# 6. CLEANUP E MANUTENÇÃO

## 6.1 Procedures de Limpeza

```sql
-- Procedure para arquivar logs antigos
CREATE OR REPLACE PROCEDURE auditoria.proc_arquivar_logs_antigos(
  p_dias_retencao INTEGER DEFAULT 365
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_limite DATE;
  v_registros_arquivados INTEGER;
BEGIN
  v_data_limite := CURRENT_DATE - (p_dias_retencao || ' days')::INTERVAL;

  -- Criar tabela de arquivo se não existir
  CREATE TABLE IF NOT EXISTS auditoria.log_completo_arquivo AS
  SELECT * FROM auditoria.log_completo WHERE FALSE;

  -- Arquivar logs antigos
  INSERT INTO auditoria.log_completo_arquivo
  SELECT * FROM auditoria.log_completo
  WHERE DATE(timestamp) < v_data_limite;

  GET DIAGNOSTICS v_registros_arquivados = ROW_COUNT;

  -- Deletar logs antigos
  DELETE FROM auditoria.log_completo
  WHERE DATE(timestamp) < v_data_limite;

  RAISE NOTICE 'Logs arquivados: %. Registros anteriores a % deletados', 
    v_registros_arquivados, v_data_limite;
END;
$$;

-- Procedure para otimizar tabelas de auditoria
CREATE OR REPLACE PROCEDURE auditoria.proc_otimizar_auditoria()
LANGUAGE plpgsql
AS $$
BEGIN
  VACUUM ANALYZE auditoria.log_completo;
  VACUUM ANALYZE auditoria.log_usuarios;
  VACUUM ANALYZE auditoria.log_acesso_sensivel;
  VACUUM ANALYZE auditoria.log_exclusoes;
  VACUUM ANALYZE auditoria.log_transacoes_criticas;
  VACUUM ANALYZE auditoria.log_relatorios;
  VACUUM ANALYZE auditoria.log_configuracoes;

  REINDEX TABLE auditoria.log_completo;
  REINDEX TABLE auditoria.log_usuarios;
  REINDEX TABLE auditoria.log_exclusoes;

  RAISE NOTICE 'Otimização das tabelas de auditoria concluída';
END;
$$;
```

---

# 7. DASHBOARD DE CONFORMIDADE

## 7.1 View do Dashboard

```sql
CREATE OR REPLACE VIEW vw_dashboard_conformidade AS
SELECT
  'Auditoria' as categoria,
  'Operações nos últimos 7 dias' as metrica,
  COUNT(*) as valor
FROM auditoria.log_completo
WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT
  'Segurança',
  'Tentativas de login falhadas',
  COUNT(*)
FROM auditoria.log_usuarios
WHERE success = FALSE
  AND DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT
  'Conformidade',
  'Acessos a dados sensíveis',
  COUNT(*)
FROM auditoria.log_acesso_sensivel
WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '7 days'

UNION ALL

SELECT
  'Conformidade',
  'Exclusões (últimos 30 dias)',
  COUNT(*)
FROM auditoria.log_exclusoes
WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT
  'Segurança',
  'Usuários ativos (últimos 30 dias)',
  COUNT(DISTINCT usuario_id)
FROM auditoria.log_usuarios
WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '30 days';
```

---

**Sistema de Auditoria Completo - Parte 2/2** ✅

## Resumo Final

```sql
TABELAS DE AUDITORIA (7):
├─ log_completo (principal)
├─ log_usuarios (login/logout)
├─ log_acesso_sensivel (LGPD)
├─ log_exclusoes (direito ao esquecimento)
├─ log_transacoes_criticas (financeiras)
├─ log_relatorios (exportações)
└─ log_configuracoes (mudanças de config)

TRIGGERS (6):
├─ Auditoria principal (6 tabelas)
├─ Soft delete tracking
└─ Alterações críticas

FUNCTIONS (4):
├─ Auditoria detalhada
├─ Login/logout
├─ Acesso sensível
└─ Contexto de sessão

VIEWS (9):
├─ Alterações recentes
├─ Atividade por usuário
├─ Exclusões suspensas
├─ Acessos sensíveis
├─ Logins suspeitos
├─ Transações críticas
├─ Relatórios exportados
├─ Mudanças em demandas
└─ Auditoria pagamentos

PROCEDURES (3):
├─ Relatório detalhado
├─ Conformidade LGPD
└─ Análise de risco

MANUTENÇÃO:
├─ Arquivo automático
├─ Otimização de índices
└─ Cleanup de logs

Pronto para Produção! 🎉
```