-- 01_create_schema.sql
-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- usuários
CREATE TABLE usuarios (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login         TEXT NOT NULL UNIQUE,
    senha_hash    TEXT NOT NULL,
    nome          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    perfil        TEXT NOT NULL CHECK (perfil IN ('admin','operador','cliente')),
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- clientes
CREATE TABLE clientes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo          TEXT NOT NULL CHECK (tipo IN ('PF','PJ')),
    nome          TEXT NOT NULL,
    documento     TEXT NOT NULL UNIQUE,
    email         TEXT,
    telefone      TEXT,
    endereco      TEXT,
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- correspondentes
CREATE TABLE correspondentes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome          TEXT NOT NULL,
    oab_numero    TEXT,
    tipo          TEXT NOT NULL CHECK (tipo IN ('advogado','despachante')),
    email         TEXT,
    telefone      TEXT,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- demandas
CREATE TABLE demandas (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id        UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    correspondente_id UUID NOT NULL REFERENCES correspondentes(id) ON DELETE RESTRICT,
    numero            TEXT NOT NULL UNIQUE,
    descricao         TEXT,
    status            TEXT NOT NULL CHECK (status IN ('rascunho','pendente','em_andamento','concluida','cancelada')),
    prioridade        INTEGER NOT NULL CHECK (prioridade BETWEEN 1 AND 5),
    data_abertura     DATE NOT NULL,
    data_fim_prevista DATE,
    data_fim_real     DATE,
    criado_em         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- financeiro
CREATE TABLE financeiro (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demanda_id    UUID REFERENCES demandas(id) ON DELETE SET NULL,
    tipo          TEXT NOT NULL CHECK (tipo IN ('receita','despesa')),
    categoria     TEXT NOT NULL,
    descricao     TEXT,
    valor_cents   BIGINT NOT NULL CHECK (valor_cents >= 0),
    vencimento    DATE NOT NULL,
    pago_em       TIMESTAMP WITH TIME ZONE,
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- agenda
CREATE TABLE agenda (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demanda_id        UUID REFERENCES demandas(id) ON DELETE SET NULL,
    titulo            TEXT NOT NULL,
    descricao         TEXT,
    data_inicio       TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim          TIMESTAMP WITH TIME ZONE,
    lembrete_antes    INTERVAL,
    criado_em         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- documentos
CREATE TABLE documentos (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demanda_id    UUID NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    nome_arquivo  TEXT NOT NULL,
    mime_type     TEXT NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    versao        INTEGER NOT NULL DEFAULT 1,
    conteudo      BYTEA NOT NULL,
    criado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (demanda_id, nome_arquivo, versao)
);

-- logs_auditoria
CREATE TABLE logs_auditoria (
    id            BIGSERIAL PRIMARY KEY,
    tabela        TEXT NOT NULL,
    operacao      TEXT NOT NULL CHECK (operacao IN ('INSERT','UPDATE','DELETE')),
    registro_id   UUID NOT NULL,
    usuario_id    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    dados_antes   JSONB,
    dados_depois  JSONB,
    ip_address    INET,
    user_agent    TEXT,
    timestamp     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
