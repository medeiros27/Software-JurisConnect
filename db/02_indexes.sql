-- 02_indexes.sql
-- Índices otimizados para performance

-- Usuários
CREATE UNIQUE INDEX idx_usuarios_login ON usuarios (login);
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios (email);

-- Full-text search
CREATE INDEX idx_clientes_fulltext ON clientes
  USING GIN (to_tsvector('portuguese', nome || ' ' || documento));
CREATE INDEX idx_correspondentes_fulltext ON correspondentes
  USING GIN (to_tsvector('portuguese', nome || ' ' || COALESCE(oab_numero,'')));

-- Demandas
CREATE INDEX idx_demandas_status ON demandas (status);
CREATE INDEX idx_demandas_prioridade ON demandas (prioridade);
CREATE INDEX idx_demandas_fim_real ON demandas (data_fim_real);

-- Financeiro
CREATE INDEX idx_financeiro_tipo ON financeiro (tipo);
CREATE INDEX idx_financeiro_vencimento ON financeiro (vencimento);

-- Agenda
CREATE INDEX idx_agenda_intervalo ON agenda (data_inicio, data_fim);

-- Documentos
CREATE INDEX idx_documentos_nome_versao ON documentos (nome_arquivo, versao);

-- Logs de auditoria
CREATE INDEX idx_logs_auditoria_tabela ON logs_auditoria (tabela);
CREATE INDEX idx_logs_auditoria_usuario ON logs_auditoria (usuario_id);
CREATE INDEX idx_logs_auditoria_timestamp ON logs_auditoria (timestamp DESC);
