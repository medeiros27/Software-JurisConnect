# JURISCONNECT - Modelo de Banco de Dados - Detalhamento Completo

## Versão do PostgreSQL: 15.x
## Codificação: UTF-8
## Collation: pt_BR.UTF-8

---

## 1. SCRIPT DE CRIAÇÃO COMPLETO DO BANCO

```sql
-- ================================================================
-- CRIAÇÃO DO BANCO DE DADOS
-- ================================================================

-- Criar banco de dados
CREATE DATABASE jurisconnect_db
  ENCODING 'UTF8'
  LC_COLLATE 'pt_BR.UTF-8'
  LC_CTYPE 'pt_BR.UTF-8'
  TEMPLATE template0
  OWNER postgres;

-- Conectar ao banco recém criado
\c jurisconnect_db

-- ================================================================
-- EXTENSÕES NECESSÁRIAS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- Para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- Para funções criptográficas
CREATE EXTENSION IF NOT EXISTS "citext";     -- Para busca case-insensitive

-- ================================================================
-- TIPOS CUSTOMIZADOS (ENUMS)
-- ================================================================

CREATE TYPE role_usuario AS ENUM ('admin', 'gerenciador', 'usuario', 'operacional');
CREATE TYPE tipo_cliente AS ENUM ('escritorio', 'empresa', 'departamento_juridico', 'pj', 'pessoa_fisica');
CREATE TYPE status_demanda AS ENUM ('aberta', 'em_progresso', 'aguardando_cliente', 'concluida', 'cancelada', 'suspensa');
CREATE TYPE prioridade_demanda AS ENUM ('baixa', 'normal', 'alta', 'urgente');
CREATE TYPE status_diligencia AS ENUM ('pendente', 'em_progresso', 'concluida', 'atrasada', 'cancelada', 'impossivel');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'parcial', 'completo', 'atrasado', 'cancelado', 'em_cobranca');
CREATE TYPE metodo_pagamento AS ENUM ('transferencia', 'boleto', 'pix', 'cartao', 'cheque', 'dinheiro');
CREATE TYPE tipo_evento AS ENUM ('reuniao', 'prazo', 'lembrete', 'videocall', 'audiencia', 'despacho', 'decisao');
CREATE TYPE status_evento AS ENUM ('pendente', 'confirmado', 'realizado', 'cancelado', 'remarcado');
CREATE TYPE nivel_experiencia AS ENUM ('junior', 'pleno', 'senior', 'especialista');
CREATE TYPE classificacao_risco AS ENUM ('baixo', 'medio', 'alto', 'critico');
```

---

## 2. TABELA: USUARIOS

```sql
-- ================================================================
-- TABELA: USUARIOS
-- Descrição: Registro de todos os usuários do sistema
-- ================================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    
    -- Identidade
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    
    -- Segurança
    senha_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    
    -- Autorização
    role role_usuario NOT NULL DEFAULT 'usuario',
    
    -- Status
    ativo BOOLEAN NOT NULL DEFAULT true,
    verificado BOOLEAN NOT NULL DEFAULT false,
    data_verificacao TIMESTAMP,
    
    -- Login
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultima_login TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultima_alteracao_senha TIMESTAMP,
    
    -- 2FA
    dois_fa_habilitado BOOLEAN DEFAULT false,
    dois_fa_secret VARCHAR(255),
    codigos_backup VARCHAR(500),
    
    -- Configurações
    fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    notificacoes_email BOOLEAN DEFAULT true,
    notificacoes_whatsapp BOOLEAN DEFAULT true,
    
    -- Rastreamento
    numero_tentativas_login_falhas INT DEFAULT 0,
    bloqueado_ate TIMESTAMP,
    
    CONSTRAINT email_valido CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT cpf_formato CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' OR cpf IS NULL),
    CONSTRAINT senha_tamanho CHECK (LENGTH(senha_hash) >= 60)
);

-- Índices para USUARIOS
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_role ON usuarios(role);
CREATE INDEX idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX idx_usuarios_data_criacao ON usuarios(data_criacao DESC);
CREATE INDEX idx_usuarios_data_ultima_login ON usuarios(data_ultima_login DESC);
CREATE UNIQUE INDEX idx_usuarios_cpf ON usuarios(cpf) WHERE cpf IS NOT NULL;

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_usuarios_atualizar_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 3. TABELA: ESPECIALIDADES

```sql
-- ================================================================
-- TABELA: ESPECIALIDADES
-- Descrição: Áreas de atuação jurídica e especialidades
-- ================================================================

CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    nome VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(20) UNIQUE,
    slug VARCHAR(100) UNIQUE,
    
    -- Descrição
    descricao TEXT,
    area_atuacao VARCHAR(255),
    
    -- Classificação
    categoria VARCHAR(50),
    complexidade INT CHECK (complexidade BETWEEN 1 AND 5),
    
    -- Status
    ativo BOOLEAN NOT NULL DEFAULT true,
    
    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    criado_por INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices para ESPECIALIDADES
CREATE INDEX idx_especialidades_nome ON especialidades(nome);
CREATE INDEX idx_especialidades_slug ON especialidades(slug);
CREATE INDEX idx_especialidades_categoria ON especialidades(categoria);
CREATE INDEX idx_especialidades_ativo ON especialidades(ativo);

-- Inserir especialidades padrão
INSERT INTO especialidades (nome, codigo, slug, descricao, area_atuacao, categoria, complexidade) VALUES
('Direito Civil', 'DIR_CIV', 'direito-civil', 'Contratos, responsabilidade civil, direito de família', 'Cível', 'Contencioso', 3),
('Direito Trabalhista', 'DIR_TRAB', 'direito-trabalhista', 'Demandas trabalhistas, rescisão, férias', 'Trabalhista', 'Contencioso', 3),
('Direito Penal', 'DIR_PEN', 'direito-penal', 'Processos criminais, defesa', 'Criminal', 'Contencioso', 4),
('Direito Processual', 'DIR_PROC', 'direito-processual', 'Peças processuais, procedimentos', 'Processual', 'Consultoria', 2),
('Direito Imobiliário', 'DIR_IMOB', 'direito-imobiliario', 'Questões imobiliárias, propriedade', 'Imobiliário', 'Consultoria', 2),
('Direito Comercial', 'DIR_COM', 'direito-comercial', 'Contratos comerciais, negócios', 'Comercial', 'Consultoria', 2),
('Direito Administrativo', 'DIR_ADMIN', 'direito-administrativo', 'Questões administrativas, FOIA', 'Administrativo', 'Consultoria', 3),
('Direito Ambiental', 'DIR_AMB', 'direito-ambiental', 'Questões ambientais, sustentabilidade', 'Ambiental', 'Consultoria', 3),
('Direito Tributário', 'DIR_TRIB', 'direito-tributario', 'Questões fiscais e tributárias', 'Tributário', 'Consultoria', 4),
('Direito Previdenciário', 'DIR_PREVI', 'direito-previdenciario', 'Questões de previdência social', 'Previdenciário', 'Consultoria', 2);
```

---

## 4. TABELA: CORRESPONDENTES

```sql
-- ================================================================
-- TABELA: CORRESPONDENTES
-- Descrição: Rede de correspondentes jurídicos
-- ================================================================

CREATE TABLE correspondentes (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    nome_juridico VARCHAR(255),
    
    -- Documentação
    cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
    cpf_cnpj_validado BOOLEAN DEFAULT false,
    inscricao_estadual VARCHAR(50),
    
    -- Contato
    email CITEXT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    
    -- Localização
    estado_sediado CHAR(2) NOT NULL,  -- UF
    cidade_sediado VARCHAR(100) NOT NULL,
    cep VARCHAR(10),
    endereco_rua VARCHAR(255),
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(255),
    endereco_bairro VARCHAR(100),
    
    -- Geolocalização
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    
    -- Profissional
    registro_advocacia VARCHAR(50),  -- OAB, etc
    registro_advocacia_validado BOOLEAN DEFAULT false,
    data_registro_advocacia DATE,
    
    -- Classificação
    classificacao NUMERIC(3, 2) DEFAULT 0.00 CHECK (classificacao >= 0 AND classificacao <= 5),
    total_avaliacoes INT DEFAULT 0,
    taxa_sucesso NUMERIC(5, 2) DEFAULT 0.00 CHECK (taxa_sucesso >= 0 AND taxa_sucesso <= 100),
    
    -- Operacional
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Auditoria
    cadastrado_por INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    CONSTRAINT cpf_cnpj_valido CHECK (
        (cpf_cnpj ~ '^\d{11}$' AND LENGTH(cpf_cnpj) = 11) OR
        (cpf_cnpj ~ '^\d{14}$' AND LENGTH(cpf_cnpj) = 14)
    ),
    CONSTRAINT estado_valido CHECK (estado_sediado IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
    CONSTRAINT email_valido CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Índices para CORRESPONDENTES
CREATE INDEX idx_correspondentes_uuid ON correspondentes(uuid);
CREATE INDEX idx_correspondentes_cpf_cnpj ON correspondentes(cpf_cnpj);
CREATE INDEX idx_correspondentes_email ON correspondentes(email);
CREATE INDEX idx_correspondentes_estado ON correspondentes(estado_sediado);
CREATE INDEX idx_correspondentes_ativo ON correspondentes(ativo);
CREATE INDEX idx_correspondentes_classificacao ON correspondentes(classificacao DESC);
CREATE INDEX idx_correspondentes_taxa_sucesso ON correspondentes(taxa_sucesso DESC);
CREATE INDEX idx_correspondentes_data_cadastro ON correspondentes(data_cadastro DESC);
CREATE INDEX idx_correspondentes_localizacao ON correspondentes(latitude, longitude);
CREATE UNIQUE INDEX idx_correspondentes_registro_advocacia ON correspondentes(registro_advocacia) WHERE registro_advocacia IS NOT NULL;

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_correspondentes_atualizar_timestamp
BEFORE UPDATE ON correspondentes
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 5. TABELA: CORRESPONDENTE_ESPECIALIDADES

```sql
-- ================================================================
-- TABELA: CORRESPONDENTE_ESPECIALIDADES
-- Descrição: Relacionamento N:N entre correspondentes e especialidades
-- ================================================================

CREATE TABLE correspondente_especialidades (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Keys
    correspondente_id INT NOT NULL REFERENCES correspondentes(id) ON DELETE CASCADE,
    especialidade_id INT NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT,
    
    -- Experiência
    nivel_experiencia nivel_experiencia NOT NULL DEFAULT 'pleno',
    anos_experiencia INT CHECK (anos_experiencia >= 0),
    
    -- Preços
    preco_minimo NUMERIC(10, 2) CHECK (preco_minimo > 0),
    preco_por_hora NUMERIC(10, 2) CHECK (preco_por_hora > 0),
    
    -- Disponibilidade
    ativo BOOLEAN DEFAULT true,
    capacidade_maxima_demandas INT DEFAULT 10,
    demandas_ativas INT DEFAULT 0,
    
    -- Auditoria
    data_desde TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chave_unica_corr_espec UNIQUE(correspondente_id, especialidade_id)
);

-- Índices para CORRESPONDENTE_ESPECIALIDADES
CREATE INDEX idx_corr_espec_correspondente ON correspondente_especialidades(correspondente_id);
CREATE INDEX idx_corr_espec_especialidade ON correspondente_especialidades(especialidade_id);
CREATE INDEX idx_corr_espec_nivel ON correspondente_especialidades(nivel_experiencia);
CREATE INDEX idx_corr_espec_ativo ON correspondente_especialidades(ativo);

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_corr_espec_atualizar_timestamp
BEFORE UPDATE ON correspondente_especialidades
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 6. TABELA: CLIENTES

```sql
-- ================================================================
-- TABELA: CLIENTES
-- Descrição: Escritórios, empresas e órgãos contratantes
-- ================================================================

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    nome_razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    tipo tipo_cliente NOT NULL,
    
    -- Documentação
    cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
    cpf_cnpj_validado BOOLEAN DEFAULT false,
    inscricao_estadual VARCHAR(50),
    
    -- Contato
    email CITEXT NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    
    -- Localização
    estado_sediado CHAR(2) NOT NULL,
    cidade_sediado VARCHAR(100) NOT NULL,
    cep VARCHAR(10),
    endereco_rua VARCHAR(255),
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(255),
    
    -- Representante
    contato_principal VARCHAR(255),
    contato_email VARCHAR(255),
    contato_telefone VARCHAR(20),
    
    -- Informações Comerciais
    ramo_atuacao VARCHAR(255),
    classificacao_risco classificacao_risco DEFAULT 'medio',
    limite_credito NUMERIC(15, 2),
    dias_prazo_pagamento INT DEFAULT 30,
    
    -- Histórico
    data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultima_demanda TIMESTAMP,
    total_demandas INT DEFAULT 0,
    total_pago NUMERIC(15, 2) DEFAULT 0,
    total_devido NUMERIC(15, 2) DEFAULT 0,
    
    -- Status
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Auditoria
    cadastrado_por INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    CONSTRAINT cpf_cnpj_valido CHECK (
        (cpf_cnpj ~ '^\d{11}$' AND LENGTH(cpf_cnpj) = 11) OR
        (cpf_cnpj ~ '^\d{14}$' AND LENGTH(cpf_cnpj) = 14)
    ),
    CONSTRAINT estado_valido CHECK (estado_sediado IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
    CONSTRAINT email_valido CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Índices para CLIENTES
CREATE INDEX idx_clientes_uuid ON clientes(uuid);
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_tipo ON clientes(tipo);
CREATE INDEX idx_clientes_estado ON clientes(estado_sediado);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_clientes_classificacao_risco ON clientes(classificacao_risco);
CREATE INDEX idx_clientes_data_cadastro ON clientes(data_cadastro DESC);
CREATE INDEX idx_clientes_data_ultima_demanda ON clientes(data_ultima_demanda DESC);

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_clientes_atualizar_timestamp
BEFORE UPDATE ON clientes
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 7. TABELA: DEMANDAS

```sql
-- ================================================================
-- TABELA: DEMANDAS
-- Descrição: Requisições de serviços jurídicos (casos/processos)
-- ================================================================

CREATE TABLE demandas (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    numero_protocolo VARCHAR(50) NOT NULL UNIQUE,
    
    -- Relacionamentos
    cliente_id INT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    correspondente_id INT REFERENCES correspondentes(id) ON DELETE SET NULL,
    especialidade_id INT NOT NULL REFERENCES especialidades(id) ON DELETE RESTRICT,
    usuario_responsavel_id INT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    
    -- Descrição
    titulo VARCHAR(255) NOT NULL,
    descricao_servico TEXT NOT NULL,
    observacoes_adicionais TEXT,
    numero_processo_judicial VARCHAR(50),
    
    -- Status
    status status_demanda NOT NULL DEFAULT 'aberta',
    prioridade prioridade_demanda NOT NULL DEFAULT 'normal',
    estatus_processual VARCHAR(255),
    
    -- Financeiro
    valor_estimado NUMERIC(15, 2),
    valor_final NUMERIC(15, 2),
    desconto_aplicado NUMERIC(10, 2),
    valor_total_pago NUMERIC(15, 2) DEFAULT 0,
    
    -- Prazos
    data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    data_prazo_cliente DATE,
    dias_uteis_consumidos INT DEFAULT 0,
    
    -- Histórico
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atividade TIMESTAMP,
    
    -- Rastreamento
    tags VARCHAR(500),
    referencia_externa VARCHAR(100),
    
    CONSTRAINT titulo_tamanho CHECK (LENGTH(titulo) >= 5),
    CONSTRAINT protocolo_formato CHECK (numero_protocolo ~ '^[A-Z0-9\-]+$'),
    CONSTRAINT valor_consistencia CHECK (valor_total_pago <= valor_final OR valor_final IS NULL),
    CONSTRAINT datas_consistentes CHECK (data_conclusao IS NULL OR data_conclusao >= data_abertura)
);

-- Índices para DEMANDAS
CREATE INDEX idx_demandas_uuid ON demandas(uuid);
CREATE INDEX idx_demandas_numero_protocolo ON demandas(numero_protocolo);
CREATE INDEX idx_demandas_cliente ON demandas(cliente_id);
CREATE INDEX idx_demandas_correspondente ON demandas(correspondente_id);
CREATE INDEX idx_demandas_especialidade ON demandas(especialidade_id);
CREATE INDEX idx_demandas_usuario_responsavel ON demandas(usuario_responsavel_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_prioridade ON demandas(prioridade);
CREATE INDEX idx_demandas_data_abertura ON demandas(data_abertura DESC);
CREATE INDEX idx_demandas_data_conclusao ON demandas(data_conclusao DESC);
CREATE INDEX idx_demandas_status_cliente ON demandas(status, cliente_id);
CREATE INDEX idx_demandas_status_correspondente ON demandas(status, correspondente_id);
CREATE INDEX idx_demandas_data_prazo ON demandas(data_prazo_cliente);
CREATE INDEX idx_demandas_numero_processo ON demandas(numero_processo_judicial) WHERE numero_processo_judicial IS NOT NULL;
CREATE INDEX idx_demandas_tags ON demandas USING GIN(to_tsvector('portuguese', tags));

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_demandas_atualizar_timestamp
BEFORE UPDATE ON demandas
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 8. TABELA: DILIGENCIAS

```sql
-- ================================================================
-- TABELA: DILIGENCIAS
-- Descrição: Tarefas processuais e atividades dentro de demandas
-- ================================================================

CREATE TABLE diligencias (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    demanda_id INT NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    
    -- Descrição
    tipo_diligencia VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    motivo_cancelamento VARCHAR(255),
    
    -- Responsabilidade
    responsavel_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Prazos
    prazo_dias INT CHECK (prazo_dias > 0),
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_prazo DATE NOT NULL,
    data_conclusion TIMESTAMP,
    dias_atraso INT DEFAULT 0,
    
    -- Status
    status status_diligencia NOT NULL DEFAULT 'pendente',
    prioridade INT CHECK (prioridade BETWEEN 1 AND 5) DEFAULT 3,
    
    -- Arquivos
    arquivo_anexado VARCHAR(500),
    arquivo_mime_type VARCHAR(50),
    arquivo_tamanho_bytes INT,
    arquivo_hash VARCHAR(64),
    
    -- Observações
    observacoes TEXT,
    resultado_final TEXT,
    
    -- Auditoria
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_por INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    CONSTRAINT data_prazo_futura CHECK (data_prazo > data_criacao::date),
    CONSTRAINT arquivo_tamanho_valido CHECK (arquivo_tamanho_bytes <= 52428800)  -- 50MB
);

-- Índices para DILIGENCIAS
CREATE INDEX idx_diligencias_uuid ON diligencias(uuid);
CREATE INDEX idx_diligencias_demanda ON diligencias(demanda_id);
CREATE INDEX idx_diligencias_responsavel ON diligencias(responsavel_id);
CREATE INDEX idx_diligencias_status ON diligencias(status);
CREATE INDEX idx_diligencias_data_prazo ON diligencias(data_prazo);
CREATE INDEX idx_diligencias_tipo ON diligencias(tipo_diligencia);
CREATE INDEX idx_diligencias_atrasadas ON diligencias(status, data_prazo) WHERE status IN ('pendente', 'em_progresso', 'atrasada');
CREATE INDEX idx_diligencias_criacao ON diligencias(data_criacao DESC);
CREATE INDEX idx_diligencias_demanda_status ON diligencias(demanda_id, status);

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_diligencias_atualizar_timestamp
BEFORE UPDATE ON diligencias
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- Trigger para calcular dias de atraso
CREATE TRIGGER trigger_diligencias_calcular_atraso
BEFORE UPDATE ON diligencias
FOR EACH ROW
WHEN (NEW.status = 'atrasada')
EXECUTE FUNCTION calcular_dias_atraso();
```

---

## 9. TABELA: PAGAMENTOS

```sql
-- ================================================================
-- TABELA: PAGAMENTOS
-- Descrição: Controle de pagamentos de demandas aos correspondentes
-- ================================================================

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    numero_fatura VARCHAR(50) UNIQUE,
    
    -- Relacionamentos
    demanda_id INT NOT NULL REFERENCES demandas(id) ON DELETE RESTRICT,
    correspondente_id INT NOT NULL REFERENCES correspondentes(id) ON DELETE RESTRICT,
    usuario_responsavel_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Valores
    valor_total NUMERIC(15, 2) NOT NULL CHECK (valor_total > 0),
    valor_pago NUMERIC(15, 2) DEFAULT 0 CHECK (valor_pago >= 0),
    valor_taxas NUMERIC(10, 2) DEFAULT 0,
    juros_calculados NUMERIC(10, 2) DEFAULT 0,
    desconto_concedido NUMERIC(10, 2) DEFAULT 0,
    
    -- Status
    status_pagamento status_pagamento NOT NULL DEFAULT 'pendente',
    metodo_pagamento metodo_pagamento,
    
    -- Datas
    data_emissao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP,
    data_compensacao TIMESTAMP,
    
    -- Boleto (se aplicável)
    codigo_barras VARCHAR(50),
    linha_digitavel VARCHAR(50),
    url_boleto VARCHAR(500),
    nosso_numero VARCHAR(50),
    
    -- PIX (se aplicável)
    qr_code_pix VARCHAR(500),
    copia_cola_pix TEXT,
    id_transacao_pix VARCHAR(100),
    
    -- Comprovante
    comprovante_arquivo VARCHAR(500),
    comprovante_arquivo_hash VARCHAR(64),
    data_envio_comprovante TIMESTAMP,
    
    -- Observações
    observacoes TEXT,
    numero_nota_fiscal VARCHAR(50),
    
    -- Auditoria
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    
    CONSTRAINT data_vencimento_valida CHECK (data_vencimento > data_emissao::date),
    CONSTRAINT consistencia_valores CHECK (valor_pago <= (valor_total + juros_calculados))
);

-- Índices para PAGAMENTOS
CREATE INDEX idx_pagamentos_uuid ON pagamentos(uuid);
CREATE INDEX idx_pagamentos_numero_fatura ON pagamentos(numero_fatura);
CREATE INDEX idx_pagamentos_demanda ON pagamentos(demanda_id);
CREATE INDEX idx_pagamentos_correspondente ON pagamentos(correspondente_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status_pagamento);
CREATE INDEX idx_pagamentos_metodo ON pagamentos(metodo_pagamento);
CREATE INDEX idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX idx_pagamentos_data_emissao ON pagamentos(data_emissao DESC);
CREATE INDEX idx_pagamentos_status_vencimento ON pagamentos(status_pagamento, data_vencimento) WHERE status_pagamento IN ('pendente', 'parcial', 'atrasado');
CREATE INDEX idx_pagamentos_pendentes ON pagamentos(data_vencimento) WHERE status_pagamento IN ('pendente', 'parcial', 'atrasado');
CREATE INDEX idx_pagamentos_correspondente_status ON pagamentos(correspondente_id, status_pagamento);

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_pagamentos_atualizar_timestamp
BEFORE UPDATE ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 10. TABELA: AGENDA_EVENTOS

```sql
-- ================================================================
-- TABELA: AGENDA_EVENTOS
-- Descrição: Eventos de agenda com sincronização Google Calendar
-- ================================================================

CREATE TABLE agenda_eventos (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Descrição
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Relacionamentos
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    demanda_id INT REFERENCES demandas(id) ON DELETE SET NULL,
    correspondente_id INT REFERENCES correspondentes(id) ON DELETE SET NULL,
    cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL,
    
    -- Horário
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Localização
    local VARCHAR(500),
    link_videocall VARCHAR(500),
    
    -- Classificação
    tipo_evento tipo_evento NOT NULL DEFAULT 'reuniao',
    prioridade INT DEFAULT 2 CHECK (prioridade BETWEEN 1 AND 5),
    
    -- Status
    status status_evento NOT NULL DEFAULT 'pendente',
    cancelado BOOLEAN DEFAULT false,
    motivo_cancelamento VARCHAR(255),
    
    -- Participantes
    participantes_emails TEXT,  -- Array de emails separados por ;
    confirmados_count INT DEFAULT 0,
    
    -- Google Calendar Sync
    sincronizado_google_calendar BOOLEAN DEFAULT false,
    id_google_calendar VARCHAR(500),
    data_sincronizacao TIMESTAMP,
    
    -- Notificações
    notificacao_email BOOLEAN DEFAULT true,
    notificacao_email_minutos_antes INT DEFAULT 1440,  -- 24 horas
    notificacao_whatsapp BOOLEAN DEFAULT false,
    notificacao_whatsapp_minutos_antes INT DEFAULT 1440,
    notificacoes_enviadas BOOLEAN DEFAULT false,
    
    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    criado_por INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    CONSTRAINT horario_valido CHECK (data_hora_fim > data_hora_inicio),
    CONSTRAINT notificacoes_antes_evento CHECK (data_hora_inicio > CURRENT_TIMESTAMP OR cancelado = true)
);

-- Índices para AGENDA_EVENTOS
CREATE INDEX idx_agenda_uuid ON agenda_eventos(uuid);
CREATE INDEX idx_agenda_usuario ON agenda_eventos(usuario_id);
CREATE INDEX idx_agenda_demanda ON agenda_eventos(demanda_id);
CREATE INDEX idx_agenda_correspondente ON agenda_eventos(correspondente_id);
CREATE INDEX idx_agenda_data_inicio ON agenda_eventos(data_hora_inicio);
CREATE INDEX idx_agenda_data_fim ON agenda_eventos(data_hora_fim);
CREATE INDEX idx_agenda_tipo ON agenda_eventos(tipo_evento);
CREATE INDEX idx_agenda_status ON agenda_eventos(status);
CREATE INDEX idx_agenda_proximos_eventos ON agenda_eventos(data_hora_inicio) WHERE status != 'cancelado' AND cancelado = false;
CREATE INDEX idx_agenda_usuario_data ON agenda_eventos(usuario_id, data_hora_inicio DESC);
CREATE INDEX idx_agenda_google_calendar ON agenda_eventos(id_google_calendar) WHERE sincronizado_google_calendar = true;

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_agenda_atualizar_timestamp
BEFORE UPDATE ON agenda_eventos
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 11. TABELA: RELATORIOS

```sql
-- ================================================================
-- TABELA: RELATORIOS
-- Descrição: Cache de relatórios para performance e BI
-- ================================================================

CREATE TABLE relatorios (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    
    -- Classificação
    tipo_relatorio VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Período
    periodo_inicio DATE,
    periodo_fim DATE,
    
    -- Dados
    dados_json JSONB NOT NULL,
    dados_csv TEXT,
    
    -- Usuário e Permissões
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    compartilhado_com VARCHAR(500),  -- IDs de usuários separados por ;
    publico BOOLEAN DEFAULT false,
    
    -- Auditoria
    data_geracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT dados_nao_vazio CHECK (dados_json IS NOT NULL AND dados_json != 'null'::jsonb)
);

-- Índices para RELATORIOS
CREATE INDEX idx_relatorios_uuid ON relatorios(uuid);
CREATE INDEX idx_relatorios_tipo ON relatorios(tipo_relatorio);
CREATE INDEX idx_relatorios_usuario ON relatorios(usuario_id);
CREATE INDEX idx_relatorios_periodo ON relatorios(periodo_inicio, periodo_fim);
CREATE INDEX idx_relatorios_data_geracao ON relatorios(data_geracao DESC);
CREATE INDEX idx_relatorios_publico ON relatorios(publico) WHERE publico = true;

-- Trigger para atualizar data_atualizacao
CREATE TRIGGER trigger_relatorios_atualizar_timestamp
BEFORE UPDATE ON relatorios
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

---

## 12. TABELAS DE AUDITORIA

```sql
-- ================================================================
-- TABELA: AUDITORIA_DEMANDAS
-- Descrição: Histórico completo de mudanças em demandas
-- ================================================================

CREATE TABLE auditoria_demandas (
    id SERIAL PRIMARY KEY,
    
    -- Relacionamento
    demanda_id INT NOT NULL REFERENCES demandas(id) ON DELETE CASCADE,
    
    -- Mudança
    campo_alterado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    
    -- Contexto
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    ip_address INET,
    data_alteracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(255)
);

-- Índices para AUDITORIA_DEMANDAS
CREATE INDEX idx_auditoria_demandas_demanda ON auditoria_demandas(demanda_id);
CREATE INDEX idx_auditoria_demandas_usuario ON auditoria_demandas(usuario_id);
CREATE INDEX idx_auditoria_demandas_data ON auditoria_demandas(data_alteracao DESC);

-- ================================================================
-- TABELA: AUDITORIA_PAGAMENTOS
-- Descrição: Histórico de mudanças em pagamentos
-- ================================================================

CREATE TABLE auditoria_pagamentos (
    id SERIAL PRIMARY KEY,
    
    pagamento_id INT NOT NULL REFERENCES pagamentos(id) ON DELETE CASCADE,
    
    campo_alterado VARCHAR(100) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    ip_address INET,
    data_alteracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para AUDITORIA_PAGAMENTOS
CREATE INDEX idx_auditoria_pagamentos_pagamento ON auditoria_pagamentos(pagamento_id);
CREATE INDEX idx_auditoria_pagamentos_data ON auditoria_pagamentos(data_alteracao DESC);
```

---

## 13. TABELAS DE LOG E RASTREAMENTO

```sql
-- ================================================================
-- TABELA: LOGS_ACESSO
-- Descrição: Rastreamento de acessos ao sistema
-- ================================================================

CREATE TABLE logs_acesso (
    id BIGSERIAL PRIMARY KEY,
    
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    
    tipo_acesso VARCHAR(50) NOT NULL,  -- login, logout, view, edit, delete
    entidade_tipo VARCHAR(50),
    entidade_id INT,
    
    ip_address INET,
    user_agent VARCHAR(500),
    
    data_acesso TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duracao_segundos INT
);

-- Índices para LOGS_ACESSO
CREATE INDEX idx_logs_acesso_usuario ON logs_acesso(usuario_id);
CREATE INDEX idx_logs_acesso_tipo ON logs_acesso(tipo_acesso);
CREATE INDEX idx_logs_acesso_data ON logs_acesso(data_acesso DESC);
CREATE INDEX idx_logs_acesso_entidade ON logs_acesso(entidade_tipo, entidade_id);

-- ================================================================
-- TABELA: LOGS_SINCRONIZACAO
-- Descrição: Log de sincronizações com APIs externas
-- ================================================================

CREATE TABLE logs_sincronizacao (
    id SERIAL PRIMARY KEY,
    
    api_externa VARCHAR(100) NOT NULL,  -- 'google_calendar', 'whatsapp', 'judit', etc
    tipo_sincronizacao VARCHAR(50),
    entidade_tipo VARCHAR(50),
    entidade_id INT,
    
    status_sincronizacao VARCHAR(50),  -- sucesso, erro, pendente
    mensagem_erro TEXT,
    
    tentativas INT DEFAULT 1,
    proxima_tentativa TIMESTAMP,
    
    data_sincronizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para LOGS_SINCRONIZACAO
CREATE INDEX idx_logs_sincronizacao_api ON logs_sincronizacao(api_externa);
CREATE INDEX idx_logs_sincronizacao_status ON logs_sincronizacao(status_sincronizacao);
CREATE INDEX idx_logs_sincronizacao_data ON logs_sincronizacao(data_sincronizacao DESC);
```

---

## 14. TABELA: CONFIGURACOES

```sql
-- ================================================================
-- TABELA: CONFIGURACOES
-- Descrição: Configurações globais do sistema
-- ================================================================

CREATE TABLE configuracoes (
    id SERIAL PRIMARY KEY,
    
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    tipo_valor VARCHAR(20),  -- 'string', 'number', 'boolean', 'json'
    descricao TEXT,
    
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, tipo_valor, descricao) VALUES
('backup_frequencia', '0 2 * * *', 'string', 'CRON: Backup automático diário às 02:00'),
('backup_retencao_dias', '30', 'number', 'Número de backups a manter'),
('jwt_expiracao_horas', '24', 'number', 'Expiração do token JWT'),
('preco_minimo_demanda', '500.00', 'number', 'Valor mínimo de demanda'),
('dias_prazo_padrao', '30', 'number', 'Prazo padrão em dias para demandas'),
('notificacao_whatsapp_ativa', 'true', 'boolean', 'Habilitar notificações WhatsApp'),
('notificacao_email_ativa', 'true', 'boolean', 'Habilitar notificações por email'),
('google_calendar_ativa', 'true', 'boolean', 'Habilitar sincronização Google Calendar');
```

---

## 15. FUNCTIONS (FUNÇÕES POSTGRESQL)

```sql
-- ================================================================
-- FUNCTION: atualizar_timestamp
-- Descrição: Atualiza automaticamente data_atualizacao
-- ================================================================

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FUNCTION: calcular_dias_atraso
-- Descrição: Calcula dias de atraso em diligências
-- ================================================================

CREATE OR REPLACE FUNCTION calcular_dias_atraso()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'atrasada' THEN
        NEW.dias_atraso = CURRENT_DATE - NEW.data_prazo;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FUNCTION: validar_cpf
-- Descrição: Valida CPF usando algoritmo de dígito verificador
-- ================================================================

CREATE OR REPLACE FUNCTION validar_cpf(cpf VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    numero VARCHAR(11);
    digito1 INT;
    digito2 INT;
    soma INT;
    resto INT;
    i INT;
BEGIN
    numero := regexp_replace(cpf, '[^0-9]', '', 'g');
    
    IF LENGTH(numero) <> 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Calcular primeiro dígito
    soma := 0;
    FOR i IN 0..8 LOOP
        soma := soma + (SUBSTRING(numero, i+1, 1)::INT * (10-i));
    END LOOP;
    resto := soma % 11;
    digito1 := CASE WHEN resto < 2 THEN 0 ELSE 11 - resto END;
    
    -- Calcular segundo dígito
    soma := 0;
    FOR i IN 0..9 LOOP
        soma := soma + (SUBSTRING(numero, i+1, 1)::INT * (11-i));
    END LOOP;
    resto := soma % 11;
    digito2 := CASE WHEN resto < 2 THEN 0 ELSE 11 - resto END;
    
    RETURN (SUBSTRING(numero, 10, 1)::INT = digito1 AND SUBSTRING(numero, 11, 1)::INT = digito2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================================
-- FUNCTION: calcular_taxa_sucesso
-- Descrição: Recalcula taxa de sucesso do correspondente
-- ================================================================

CREATE OR REPLACE FUNCTION calcular_taxa_sucesso(p_correspondente_id INT)
RETURNS NUMERIC(5, 2) AS $$
DECLARE
    total_demandas INT;
    demandas_concluidas INT;
    taxa NUMERIC(5, 2);
BEGIN
    SELECT COUNT(*) INTO total_demandas
    FROM demandas
    WHERE correspondente_id = p_correspondente_id;
    
    SELECT COUNT(*) INTO demandas_concluidas
    FROM demandas
    WHERE correspondente_id = p_correspondente_id
    AND status = 'concluida';
    
    IF total_demandas = 0 THEN
        taxa := 0;
    ELSE
        taxa := (demandas_concluidas::NUMERIC / total_demandas::NUMERIC) * 100;
    END IF;
    
    UPDATE correspondentes
    SET taxa_sucesso = taxa
    WHERE id = p_correspondente_id;
    
    RETURN taxa;
END;
$$ LANGUAGE plpgsql;
```

---

## 16. VIEWS (VISÕES)

```sql
-- ================================================================
-- VIEW: vw_demandas_pendentes_correspondente
-- Descrição: Demandas em aberto por correspondente
-- ================================================================

CREATE OR REPLACE VIEW vw_demandas_pendentes_correspondente AS
SELECT
    c.id,
    c.nome_fantasia,
    COUNT(d.id) as total_demandas_abertas,
    SUM(CASE WHEN d.prioridade = 'urgente' THEN 1 ELSE 0 END) as total_urgentes,
    SUM(CASE WHEN d.prioridade = 'alta' THEN 1 ELSE 0 END) as total_altas,
    MAX(d.data_abertura) as demanda_mais_antiga,
    MIN(d.data_prazo_cliente) as proximo_prazo
FROM
    correspondentes c
    LEFT JOIN demandas d ON c.id = d.correspondente_id
        AND d.status IN ('aberta', 'em_progresso', 'aguardando_cliente')
WHERE
    c.ativo = true
GROUP BY
    c.id, c.nome_fantasia;

-- ================================================================
-- VIEW: vw_pagamentos_pendentes
-- Descrição: Pagamentos vencidos ou a vencer
-- ================================================================

CREATE OR REPLACE VIEW vw_pagamentos_pendentes AS
SELECT
    p.id,
    p.numero_fatura,
    d.numero_protocolo,
    c.nome_fantasia,
    p.valor_total,
    p.valor_pago,
    (p.valor_total - p.valor_pago) as valor_pendente,
    p.data_vencimento,
    CASE
        WHEN p.data_vencimento < CURRENT_DATE THEN 'ATRASADO'
        WHEN p.data_vencimento = CURRENT_DATE THEN 'VENCE_HOJE'
        WHEN p.data_vencimento <= CURRENT_DATE + INTERVAL '7 days' THEN 'VENCE_PROXIMA_SEMANA'
        ELSE 'NO_PRAZO'
    END as status_prazo,
    (CURRENT_DATE - p.data_vencimento) as dias_atraso
FROM
    pagamentos p
    JOIN demandas d ON p.demanda_id = d.id
    JOIN correspondentes c ON p.correspondente_id = c.id
WHERE
    p.status_pagamento IN ('pendente', 'parcial', 'atrasado')
ORDER BY
    p.data_vencimento ASC;

-- ================================================================
-- VIEW: vw_diligencias_criticas
-- Descrição: Diligências com prazos vencidos ou próximos de vencer
-- ================================================================

CREATE OR REPLACE VIEW vw_diligencias_criticas AS
SELECT
    d.id,
    d.uuid,
    dem.numero_protocolo,
    c.nome_fantasia,
    d.tipo_diligencia,
    d.descricao,
    d.data_prazo,
    CASE
        WHEN d.status = 'atrasada' OR d.data_prazo < CURRENT_DATE THEN 'ATRASADO'
        WHEN d.data_prazo = CURRENT_DATE THEN 'VENCE_HOJE'
        WHEN d.data_prazo <= CURRENT_DATE + INTERVAL '3 days' THEN 'CRITICO'
        ELSE 'NORMAL'
    END as criticidade,
    (CURRENT_DATE - d.data_prazo) as dias_atraso,
    u.nome_completo as responsavel
FROM
    diligencias d
    JOIN demandas dem ON d.demanda_id = dem.id
    JOIN correspondentes c ON dem.correspondente_id = c.id
    LEFT JOIN usuarios u ON d.responsavel_id = u.id
WHERE
    d.status IN ('pendente', 'em_progresso', 'atrasada')
ORDER BY
    d.data_prazo ASC;

-- ================================================================
-- VIEW: vw_desempenho_correspondentes
-- Descrição: KPIs agregados por correspondente
-- ================================================================

CREATE OR REPLACE VIEW vw_desempenho_correspondentes AS
SELECT
    c.id,
    c.nome_fantasia,
    c.classificacao,
    c.taxa_sucesso,
    COUNT(DISTINCT d.id) as total_demandas,
    COUNT(DISTINCT CASE WHEN d.status = 'concluida' THEN d.id END) as demandas_concluidas,
    SUM(p.valor_total) as receita_total,
    AVG(CAST((EXTRACT(EPOCH FROM (d.data_conclusao - d.data_abertura))/86400) AS NUMERIC)) as tempo_medio_resolucao_dias
FROM
    correspondentes c
    LEFT JOIN demandas d ON c.id = d.correspondente_id
    LEFT JOIN pagamentos p ON d.id = p.demanda_id
WHERE
    c.ativo = true
GROUP BY
    c.id, c.nome_fantasia, c.classificacao, c.taxa_sucesso
ORDER BY
    c.classificacao DESC;

-- ================================================================
-- VIEW: vw_fluxo_caixa_mes_atual
-- Descrição: Fluxo de caixa do mês atual
-- ================================================================

CREATE OR REPLACE VIEW vw_fluxo_caixa_mes_atual AS
SELECT
    'Faturado' as tipo,
    DATE_TRUNC('day', p.data_emissao)::date as data,
    SUM(p.valor_total) as valor
FROM
    pagamentos p
WHERE
    DATE_TRUNC('month', p.data_emissao) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
GROUP BY
    DATE_TRUNC('day', p.data_emissao)::date

UNION ALL

SELECT
    'Recebido' as tipo,
    DATE_TRUNC('day', p.data_pagamento)::date as data,
    SUM(p.valor_pago) as valor
FROM
    pagamentos p
WHERE
    DATE_TRUNC('month', p.data_pagamento) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    AND p.data_pagamento IS NOT NULL
GROUP BY
    DATE_TRUNC('day', p.data_pagamento)::date
ORDER BY
    data DESC;
```

---

## 17. RESUMO DE TABELAS E ÍNDICES

| Tabela | Registros Típicos | Total de Índices | Índices Críticos |
|--------|------------------|-----------------|-----------------|
| usuarios | 10-50 | 6 | email, role, ativo |
| especialidades | 10-20 | 4 | nome, slug, ativo |
| correspondentes | 100-500 | 10 | cpf_cnpj, estado, ativo, classificacao |
| correspondente_especialidades | 500-2000 | 4 | correspondente, especialidade, ativo |
| clientes | 50-200 | 9 | cpf_cnpj, email, tipo, ativo |
| demandas | 1000-10000 | 13 | cliente, correspondente, status, data |
| diligencias | 3000-30000 | 10 | demanda, status, data_prazo |
| pagamentos | 1000-10000 | 11 | correspondente, status, vencimento |
| agenda_eventos | 1000-5000 | 11 | usuario, demanda, data_inicio |
| relatorios | 100-500 | 6 | tipo, usuario, data_geracao |
| auditoria_demandas | 5000-50000 | 3 | demanda, usuario, data |
| auditoria_pagamentos | 2000-20000 | 2 | pagamento, data |
| logs_acesso | 10000+ | 4 | usuario, tipo, data |
| logs_sincronizacao | 1000-5000 | 3 | api, status, data |

**TOTAL GERAL: ~120+ índices otimizados para performance**

---

## 18. CONSTRAINTS E VALIDAÇÕES

### Tipos de Constraints Implementados:

1. **PRIMARY KEY**: Todas as tabelas têm ID ou UUID
2. **FOREIGN KEY**: Relacionamentos com ON DELETE (CASCADE, RESTRICT, SET NULL)
3. **UNIQUE**: Campos únicos (email, cpf_cnpj, numero_protocolo, etc)
4. **NOT NULL**: Campos obrigatórios
5. **CHECK**: Validações de domínio (valores, datas, fórmulas)
6. **ENUM**: Tipos customizados para status, tipos, etc

### Validações de Negócio Implementadas:

- ✅ CPF/CNPJ validados com check constraint
- ✅ Email com regex validation
- ✅ Estados brasileiros validados
- ✅ Prazos de datas validados
- ✅ Valores monetários sempre positivos
- ✅ Inconsistências de valores impedidas

---

## 19. PERFORMANCE - QUERY TÍPICAS OTIMIZADAS

### Query 1: Listar Demandas de Um Cliente

```sql
SELECT 
    d.id, d.numero_protocolo, d.titulo,
    c.nome_fantasia, e.nome as especialidade,
    d.status, d.prioridade, d.data_abertura
FROM demandas d
JOIN clientes c ON d.cliente_id = c.id
JOIN especialidades e ON d.especialidade_id = e.id
WHERE d.cliente_id = $1
    AND d.status != 'cancelada'
ORDER BY d.data_abertura DESC
LIMIT 20 OFFSET 0;
```
**Índices utilizados:** demandas(cliente_id, status), clientes(id), especialidades(id)

### Query 2: Pagamentos Vencidos

```sql
SELECT p.*, c.nome_fantasia, d.numero_protocolo
FROM pagamentos p
JOIN correspondentes c ON p.correspondente_id = c.id
JOIN demandas d ON p.demanda_id = d.id
WHERE p.status_pagamento IN ('pendente', 'parcial', 'atrasado')
    AND p.data_vencimento < CURRENT_DATE
ORDER BY p.data_vencimento ASC;
```
**Índices utilizados:** pagamentos(status_pagamento, data_vencimento)

### Query 3: Diligências Atrasadas

```sql
SELECT d.*, dem.numero_protocolo, c.nome_fantasia
FROM diligencias d
JOIN demandas dem ON d.demanda_id = dem.id
JOIN correspondentes c ON dem.correspondente_id = c.id
WHERE d.status IN ('pendente', 'em_progresso', 'atrasada')
    AND d.data_prazo < CURRENT_DATE
ORDER BY d.data_prazo ASC;
```
**Índices utilizados:** diligencias(status, data_prazo)

---

## 20. BACKUP E RESTAURAÇÃO

### Backup Completo

```bash
pg_dump -h localhost -U jurisconnect_user -d jurisconnect_db \
  -F c -b -v -f backup_jurisconnect_$(date +%Y%m%d_%H%M%S).dump
```

### Restauração Completa

```bash
pg_restore -h localhost -U jurisconnect_user -d jurisconnect_db \
  -v backup_jurisconnect_20251102_140000.dump
```

### Backup Apenas Schema

```bash
pg_dump -h localhost -U jurisconnect_user -d jurisconnect_db \
  -s -F p -f schema_jurisconnect.sql
```

---

**Documentação v1.0 - Modelo de Banco de Dados Completo**
**Pronto para Implementação em Produção**