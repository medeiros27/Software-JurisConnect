# JURISCONNECT - SETUP POSTGRESQL COMPLETO

## 📋 ÍNDICE

1. [Criação de Database e Extensions](#1-criação-de-database-e-extensions)
2. [DDL - Tabelas Base](#2-ddl---tabelas-base)
3. [Índices Otimizados](#3-índices-otimizados)
4. [Views Frequentes](#4-views-frequentes)
5. [Stored Procedures](#5-stored-procedures)
6. [Functions PL/pgSQL](#6-functions-plpgsql)
7. [Triggers Automáticos](#7-triggers-automáticos)
8. [Seeds de Dados Iniciais](#8-seeds-de-dados-iniciais)
9. [Manutenção e Backup](#9-manutenção-e-backup)

---

# 1. CRIAÇÃO DE DATABASE E EXTENSIONS

## 1.1 setup_initial.sql

```sql
-- Criar database
CREATE DATABASE jurisconnect
  WITH ENCODING 'UTF8'
       LC_COLLATE 'pt_BR.UTF-8'
       LC_CTYPE 'pt_BR.UTF-8'
       TEMPLATE template0;

-- Conectar ao database
\c jurisconnect

-- Criar schema
CREATE SCHEMA public;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Índices múltiplos
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- R-tree indexes

-- Configurações de performance
ALTER DATABASE jurisconnect SET shared_buffers = '256MB';
ALTER DATABASE jurisconnect SET effective_cache_size = '1GB';
ALTER DATABASE jurisconnect SET maintenance_work_mem = '64MB';
ALTER DATABASE jurisconnect SET work_mem = '16MB';

-- Criar user/roles
CREATE ROLE jurisconnect_admin WITH LOGIN CREATEDB CREATEROLE ENCRYPTED PASSWORD 'admin_password_strong';
CREATE ROLE jurisconnect_app WITH LOGIN ENCRYPTED PASSWORD 'app_password_strong';

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE jurisconnect TO jurisconnect_admin;
GRANT CONNECT ON DATABASE jurisconnect TO jurisconnect_app;
GRANT USAGE ON SCHEMA public TO jurisconnect_app;

-- Schema de auditoria
CREATE SCHEMA auditoria;
GRANT USAGE ON SCHEMA auditoria TO jurisconnect_app;

-- Tabela base para auditoria
CREATE TABLE auditoria.log_auditoria (
  id BIGSERIAL PRIMARY KEY,
  tabela VARCHAR(100) NOT NULL,
  operacao VARCHAR(10) NOT NULL,
  usuario VARCHAR(100),
  ip_origem VARCHAR(50),
  dados_antigos JSONB,
  dados_novos JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo TEXT
);

CREATE INDEX idx_auditoria_timestamp ON auditoria.log_auditoria(timestamp DESC);
CREATE INDEX idx_auditoria_tabela ON auditoria.log_auditoria(tabela);

GRANT SELECT ON ALL TABLES IN SCHEMA auditoria TO jurisconnect_app;
```

---

# 2. DDL - TABELAS BASE

## 2.1 01_usuarios_table.sql

```sql
-- Tabela de Usuários
CREATE TABLE public.usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operador'
    CHECK (role IN ('admin', 'gestor', 'operador')),
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_login TIMESTAMP,
  refresh_token TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_criado_em ON usuarios(criado_em DESC);

-- Comentários
COMMENT ON TABLE usuarios IS 'Usuários do sistema JurisConnect';
COMMENT ON COLUMN usuarios.role IS 'Papel do usuário: admin (acesso total), gestor (gerência), operador (execução)';
```

## 2.2 02_clientes_table.sql

```sql
CREATE TABLE public.clientes (
  id SERIAL PRIMARY KEY,
  tipo_pessoa VARCHAR(10) NOT NULL CHECK (tipo_pessoa IN ('fisica', 'juridica')),
  nome_fantasia VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  celular VARCHAR(20),
  endereco VARCHAR(500),
  numero_endereco VARCHAR(20),
  complemento VARCHAR(200),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado CHAR(2),
  cep VARCHAR(10),
  pais VARCHAR(50) DEFAULT 'Brasil',
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  categoria VARCHAR(50),
  limite_credito DECIMAL(10,2) DEFAULT 0,
  dias_pagamento INTEGER DEFAULT 30,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Índices
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_nome_fantasia ON clientes USING gin(nome_fantasia gin_trgm_ops);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_clientes_cidade ON clientes(cidade);
CREATE INDEX idx_clientes_created_at ON clientes(criado_em DESC);

-- Full-text search
CREATE INDEX idx_clientes_fts ON clientes USING gin(
  to_tsvector('portuguese', nome_fantasia || ' ' || COALESCE(razao_social, ''))
);
```

## 2.3 03_correspondentes_table.sql

```sql
CREATE TABLE public.correspondentes (
  id SERIAL PRIMARY KEY,
  nome_fantasia VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  celular VARCHAR(20),
  estado_sediado CHAR(2) NOT NULL,
  cidade_sediado VARCHAR(100) NOT NULL,
  endereco_completo VARCHAR(500),
  numero_endereco VARCHAR(20),
  cep VARCHAR(10),
  oab_numero VARCHAR(20),
  oab_estado CHAR(2),
  oab_valido BOOLEAN,
  clasificacao DECIMAL(3,2) DEFAULT 0 CHECK (clasificacion >= 0 AND clasificacion <= 5),
  taxa_sucesso DECIMAL(5,2) DEFAULT 0,
  comissao_padrao DECIMAL(5,2),
  tempo_medio_conclusao INTEGER COMMENT 'em dias',
  observacoes TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Índices
CREATE INDEX idx_correspondentes_cpf_cnpj ON correspondentes(cpf_cnpj);
CREATE INDEX idx_correspondentes_oab ON correspondentes(oab_numero, oab_estado);
CREATE INDEX idx_correspondentes_estado ON correspondentes(estado_sediado);
CREATE INDEX idx_correspondentes_ativo ON correspondentes(ativo);
CREATE INDEX idx_correspondentes_fts ON correspondentes USING gin(
  to_tsvector('portuguese', nome_fantasia || ' ' || COALESCE(razao_social, ''))
);
```

## 2.4 04_demandas_table.sql

```sql
CREATE TABLE public.demandas (
  id SERIAL PRIMARY KEY,
  numero VARCHAR(50) NOT NULL UNIQUE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo_demanda VARCHAR(50) NOT NULL CHECK (
    tipo_demanda IN ('diligencia', 'audiencia', 'protocolo', 'intimacao', 'parecer', 'outro')
  ),
  status VARCHAR(50) NOT NULL DEFAULT 'rascunho' CHECK (
    status IN ('rascunho', 'pendente', 'em_analise', 'em_andamento', 
               'aguardando_correspondente', 'aguardando_cliente', 'concluida', 'cancelada', 'suspensa')
  ),
  sub_status VARCHAR(100),
  prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  data_prazo DATE,
  data_prazo_revisao DATE,
  data_inicio DATE,
  data_conclusao DATE,
  data_cancelamento DATE,
  valor_estimado DECIMAL(10,2) DEFAULT 0,
  valor_cobrado DECIMAL(10,2) DEFAULT 0,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  etapa_atual VARCHAR(50),
  etapa_anterior VARCHAR(50),
  progresso_percentual INTEGER DEFAULT 0 CHECK (progresso_percentual >= 0 AND progresso_percentual <= 100),
  motivo_cancelamento TEXT,
  motivo_suspensao TEXT,
  responsavel_atual_id INTEGER REFERENCES usuarios(id),
  responsavel_anterior_id INTEGER REFERENCES usuarios(id),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  correspondente_id INTEGER REFERENCES correspondentes(id),
  especialidade_id INTEGER,
  criado_por INTEGER REFERENCES usuarios(id),
  observacoes TEXT,
  observacoes_privadas TEXT,
  urgente BOOLEAN DEFAULT FALSE,
  atrasada BOOLEAN DEFAULT FALSE,
  requer_assinatura BOOLEAN DEFAULT FALSE,
  permitir_edicao_cliente BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Índices críticos para performance
CREATE INDEX idx_demandas_numero ON demandas(numero);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_cliente_id ON demandas(cliente_id);
CREATE INDEX idx_demandas_correspondente_id ON demandas(correspondente_id);
CREATE INDEX idx_demandas_data_prazo ON demandas(data_prazo) WHERE status != 'concluida';
CREATE INDEX idx_demandas_prioridade ON demandas(prioridade);
CREATE INDEX idx_demandas_responsavel ON demandas(responsavel_atual_id);
CREATE INDEX idx_demandas_atrasada ON demandas(atrasada) WHERE atrasada = TRUE;
CREATE INDEX idx_demandas_criado_em ON demandas(criado_em DESC);
CREATE INDEX idx_demandas_status_prazo ON demandas(status, data_prazo);

-- Full-text search
CREATE INDEX idx_demandas_fts ON demandas USING gin(
  to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, ''))
);
```

## 2.5 05_pagamentos_table.sql

```sql
CREATE TABLE public.pagamentos (
  id SERIAL PRIMARY KEY,
  numero_fatura VARCHAR(50) NOT NULL UNIQUE,
  numero_recibo VARCHAR(50) UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receber', 'pagar')),
  categoria VARCHAR(50) NOT NULL CHECK (
    categoria IN ('honorarios', 'custas_processuais', 'taxa_correspondente', 
                  'despesa_operacional', 'salario', 'aluguel', 'internet', 'outro')
  ),
  descricao TEXT,
  valor_original DECIMAL(10,2) NOT NULL,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  valor_juros DECIMAL(10,2) DEFAULT 0,
  valor_multa DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) NOT NULL,
  percentual_desconto DECIMAL(5,2) DEFAULT 0,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  data_compensacao DATE,
  dias_atraso INTEGER DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'rascunho' CHECK (
    status IN ('rascunho', 'emitido', 'pendente', 'pago', 'pago_parcial', 'vencido', 'cancelado', 'devolvido')
  ),
  forma_pagamento VARCHAR(50),
  numero_cheque VARCHAR(20),
  banco_cheque VARCHAR(100),
  comprovante_url VARCHAR(500),
  observacoes TEXT,
  referencia_externa VARCHAR(100),
  demanda_id INTEGER REFERENCES demandas(id),
  cliente_id INTEGER REFERENCES clientes(id),
  correspondente_id INTEGER REFERENCES correspondentes(id),
  usuario_criado INTEGER REFERENCES usuarios(id),
  usuario_pagador INTEGER REFERENCES usuarios(id),
  tentativas_cobranca INTEGER DEFAULT 0,
  ultima_tentativa_cobranca TIMESTAMP,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Índices criticamente importantes para relatórios financeiros
CREATE INDEX idx_pagamentos_numero_fatura ON pagamentos(numero_fatura);
CREATE INDEX idx_pagamentos_tipo_status ON pagamentos(tipo, status);
CREATE INDEX idx_pagamentos_data_vencimento ON pagamentos(data_vencimento);
CREATE INDEX idx_pagamentos_data_pagamento ON pagamentos(data_pagamento);
CREATE INDEX idx_pagamentos_cliente_id ON pagamentos(cliente_id);
CREATE INDEX idx_pagamentos_correspondente_id ON pagamentos(correspondente_id);
CREATE INDEX idx_pagamentos_demanda_id ON pagamentos(demanda_id);
CREATE INDEX idx_pagamentos_status_vencimento ON pagamentos(status, data_vencimento);
CREATE INDEX idx_pagamentos_valor_final ON pagamentos(valor_final);
CREATE INDEX idx_pagamentos_criado_em ON pagamentos(criado_em DESC);
```

## 2.6 06_documentos_table.sql

```sql
CREATE TABLE public.documentos (
  id SERIAL PRIMARY KEY,
  demanda_id INTEGER NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'outro' CHECK (
    tipo IN ('contrato', 'intimacao', 'parecer', 'decisao', 'outro')
  ),
  url_arquivo VARCHAR(500) NOT NULL,
  tamanho_bytes BIGINT,
  mime_type VARCHAR(100),
  hash_arquivo VARCHAR(100),
  versao INTEGER DEFAULT 1,
  requer_assinatura BOOLEAN DEFAULT FALSE,
  assinado BOOLEAN DEFAULT FALSE,
  data_assinatura TIMESTAMP,
  assinado_por_id INTEGER REFERENCES usuarios(id),
  enviado_por_id INTEGER REFERENCES usuarios(id),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Índices
CREATE INDEX idx_documentos_demanda_id ON documentos(demanda_id);
CREATE INDEX idx_documentos_hash ON documentos(hash_arquivo);
CREATE INDEX idx_documentos_assinado ON documentos(assinado);
CREATE INDEX idx_documentos_criado_em ON documentos(criado_em DESC);
```

## 2.7 07_agenda_table.sql

```sql
CREATE TABLE public.agenda (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('prazo', 'audiencia', 'reuniao', 'lembrete', 'outro')),
  data_evento DATE NOT NULL,
  hora_evento TIME,
  duracao_minutos INTEGER DEFAULT 60,
  local VARCHAR(500),
  alerta_dias_antes INTEGER DEFAULT 1,
  demanda_id INTEGER REFERENCES demandas(id),
  criado_por INTEGER REFERENCES usuarios(id),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletado_em TIMESTAMP
);

-- Índices
CREATE INDEX idx_agenda_data_evento ON agenda(data_evento);
CREATE INDEX idx_agenda_demanda_id ON agenda(demanda_id);
CREATE INDEX idx_agenda_tipo ON agenda(tipo);
CREATE INDEX idx_agenda_proximo_prazo ON agenda(data_evento) 
  WHERE deletado_em IS NULL AND data_evento >= CURRENT_DATE;
```

## 2.8 08_historico_workflow_table.sql

```sql
CREATE TABLE public.historico_workflow (
  id BIGSERIAL PRIMARY KEY,
  demanda_id INTEGER NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL CHECK (
    acao IN ('criacao', 'mudanca_status', 'mudanca_prioridade', 'atribuicao', 
             'transferencia', 'cancelamento', 'suspensao', 'retomada', 'conclusao',
             'adicionar_documento', 'adicionar_comentario')
  ),
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50),
  responsavel_anterior_id INTEGER,
  responsavel_novo_id INTEGER,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  descricao TEXT,
  dados_mudados JSONB,
  ip_origem VARCHAR(50),
  user_agent VARCHAR(500),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_historico_demanda_id ON historico_workflow(demanda_id);
CREATE INDEX idx_historico_acao ON historico_workflow(acao);
CREATE INDEX idx_historico_criado_em ON historico_workflow(criado_em DESC);
CREATE INDEX idx_historico_usuario_id ON historico_workflow(usuario_id);
```

---

**PostgreSQL Setup - Parte 1/4** ✅

**Continuação com Índices, Views, Procedures e Triggers no próximo arquivo...**