-- 07_seeds.sql
-- Dados iniciais (usuário admin e configurações)

-- Usuário administrador padrão
-- Login: admin
-- Senha: admin123
INSERT INTO usuarios (login, senha_hash, nome, email, perfil)
VALUES (
  'admin',
  hash_senha('admin123'),
  'Administrador do Sistema',
  'admin@jurisconnect.com',
  'admin'
) ON CONFLICT (login) DO NOTHING;

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Configurações iniciais
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('versao_sistema', '1.0.0', 'Versão atual do sistema'),
  ('data_instalacao', now()::TEXT, 'Data e hora da instalação'),
  ('nome_empresa', 'JurisConnect', 'Nome da empresa/escritório'),
  ('backup_automatico', 'true', 'Ativar backup automático diário'),
  ('retencao_logs_dias', '180', 'Dias de retenção dos logs de auditoria')
ON CONFLICT (chave) DO NOTHING;

-- Feriados nacionais de 2025 (exemplo)
INSERT INTO feriados (data, descricao) VALUES
  ('2025-01-01', 'Confraternização Universal'),
  ('2025-04-18', 'Sexta-feira Santa'),
  ('2025-04-21', 'Tiradentes'),
  ('2025-05-01', 'Dia do Trabalho'),
  ('2025-09-07', 'Independência do Brasil'),
  ('2025-10-12', 'Nossa Senhora Aparecida'),
  ('2025-11-02', 'Finados'),
  ('2025-11-15', 'Proclamação da República'),
  ('2025-12-25', 'Natal')
ON CONFLICT (data) DO NOTHING;
