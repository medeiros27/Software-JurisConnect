# JURISCONNECT - Documentação Técnica Completa

## Sistema de Gestão de Correspondentes Jurídicos

**Versão:** 1.0  
**Data:** Novembro 2025  
**Status:** Especificação para Implementação  
**Empresa:** JurisConnect LTDA  
**CNPJ:** 62.302.871/0001-17  
**Contatos:** 11 93011-9867 | 11 98244-2595

---

## 1. INTRODUÇÃO E ESCOPO

### 1.1 Objetivo do Sistema

O **JurisConnect** é uma plataforma SaaS desktop desenvolvida para gerenciar de forma integrada:
- **Correspondentes Jurídicos**: cadastro, especialidades, localização geográfica
- **Clientes**: escritórios, departamentos jurídicos, empresas
- **Demandas**: requisições de serviços, distribuição, acompanhamento
- **Pagamentos**: gestão financeira, faturas, recebimentos
- **Agenda**: agendamento de atividades, integração com calendários
- **Diligências**: tarefas processuais, prazos, status

### 1.2 Stack Tecnológica Recomendada

| Componente | Tecnologia | Versão | Justificativa |
|---|---|---|---|
| **Frontend Desktop** | Electron + React | 25.x + 18.x | Multiplataforma, UI moderna, componentes reutilizáveis |
| **Backend** | Node.js + Express | 18.x LTS + 4.x | Linguagem unificada, ecossistema robusto |
| **Banco de Dados** | PostgreSQL | 15.x | Relacional, ACID, integridade referencial, JSONB |
| **ORM** | Sequelize | 6.x | Migrations, validações, suporte PostgreSQL |
| **Autenticação** | JWT + bcrypt | - | Segurança, stateless, compatível com desktop |
| **Validação** | Joi ou Zod | - | Schemas tipados, validações robustas |
| **CLI/Process** | PM2 + node-cron | - | Gerenciamento de processos, agendamentos |
| **Backup** | pg_dump + @getvim/execute | - | Backup automático, restauração |

---

## 2. ARQUITETURA DO SISTEMA

### 2.1 Diagrama Arquitetural (ASCII Art)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO (UI)                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Components                                        │  │
│  │  - Dashboard | Correspondentes | Clientes | Demandas   │  │
│  │  - Pagamentos | Agenda | Diligências | Relatórios     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Electron IPC (Inter-Process Communication)             │  │
│  │  - Renderer Process ↔ Main Process                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE APLICAÇÃO                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Main Process (Electron + Node.js Backend)              │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Express.js API Routes & Controllers                │ │  │
│  │  │ ├─ /api/v1/correspondentes                         │ │  │
│  │  │ ├─ /api/v1/clientes                                │ │  │
│  │  │ ├─ /api/v1/demandas                                │ │  │
│  │  │ ├─ /api/v1/pagamentos                              │ │  │
│  │  │ ├─ /api/v1/agenda                                  │ │  │
│  │  │ ├─ /api/v1/diligencias                             │ │  │
│  │  │ ├─ /api/v1/relatorios                              │ │  │
│  │  │ └─ /api/v1/auth                                    │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                         ↕                                   │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Business Logic Layer (Services)                    │ │  │
│  │  │ ├─ CorrespondenteService                           │ │  │
│  │  │ ├─ ClienteService                                  │ │  │
│  │  │ ├─ DemandaService                                  │ │  │
│  │  │ ├─ PagamentoService                                │ │  │
│  │  │ ├─ AgendaService                                   │ │  │
│  │  │ ├─ RelatorioService                                │ │  │
│  │  │ └─ IntegracaoService (WhatsApp, Google Cal, etc)   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                         ↕                                   │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ Data Access Layer (Models + Sequelize ORM)         │ │  │
│  │  │ ├─ Correspondente                                  │ │  │
│  │  │ ├─ Cliente                                         │ │  │
│  │  │ ├─ Demanda                                         │ │  │
│  │  │ ├─ Pagamento                                       │ │  │
│  │  │ ├─ AgendaEvento                                    │ │  │
│  │  │ ├─ Diligencia                                      │ │  │
│  │  │ └─ Usuario (Autenticação)                          │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  CAMADA DE PERSISTÊNCIA                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Banco Local)                              │  │
│  │  ├─ Tabelas Principais                                 │  │
│  │  ├─ Índices & Chaves Estrangeiras                      │  │
│  │  ├─ Triggers & Procedures                              │  │
│  │  └─ Backup Automático (/backups)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 INTEGRAÇÕES EXTERNAS                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ WhatsApp API (Zenvia/Twilio) → Notificações            │  │
│  │ Google Calendar API → Sincronização Agenda              │  │
│  │ APIs Jurídicas (Judit, CNJ) → Consultas Processuais   │  │
│  │ Stripe/PagSeguro → Processamento Pagamentos (futuro)   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Padrão Arquitetural: MVC + Camadas

O sistema utiliza **MVC (Model-View-Controller)** com separação clara de responsabilidades:

**VIEW (Camada de Apresentação)**
- Componentes React
- Formulários, Tabelas, Dashboards
- Comunicação via Electron IPC

**CONTROLLER (Camada de Roteamento)**
- Express Routes
- Validação de entrada (Joi/Zod)
- Orquestração de chamadas ao Service Layer

**SERVICE (Camada de Negócio)**
- Lógica de negócio complexa
- Integração entre Models
- Regras jurídicas específicas

**MODEL (Camada de Dados)**
- Sequelize ORM
- Definição de Entidades
- Relacionamentos e Validações

---

## 3. MODELO DE BANCO DE DADOS

### 3.1 Diagrama Entidade-Relacionamento (DER - ASCII)

```
┌──────────────────────┐
│      USUARIO         │
├──────────────────────┤
│ id (PK)              │
│ email                │
│ senha_hash           │
│ nome_completo        │
│ role (admin/user)    │
│ ativo                │
│ data_criacao         │
│ data_ultima_login    │
└──────────────────────┘
         │
         │ 1:N (usuario_id)
         │
    ┌────┴────┐
    │          │
    ↓          ↓
┌─────────────────────────────┐    ┌──────────────────────┐
│      CORRESPONDENTE         │◄───┤     ESPECIALIDADE    │
├─────────────────────────────┤    ├──────────────────────┤
│ id (PK)                     │    │ id (PK)              │
│ nome_fantasia               │    │ nome                 │
│ nome_juridico               │    │ descricao            │
│ cpf/cnpj                    │    │ area_atuacao         │
│ email                       │    │ ativo                │
│ telefone                    │    └──────────────────────┘
│ estado_sediado              │
│ cidade_sediado              │    ┌──────────────────────┐
│ endereco_completo           │◄───┤  CORRESPONDENTE_ESPEC│
│ cep                         │    ├──────────────────────┤
│ cnpj_validado               │    │ correspondente_id(FK)│
│ inscricao_estadual          │    │ especialidade_id(FK) │
│ data_cadastro               │    │ nivel_experiencia    │
│ ativo                       │    │ preco_minimo         │
│ classificacao (1-5 stars)   │    │ preco_por_hora       │
│ taxa_sucesso                │    │ data_desde           │
└─────────────────────────────┘    └──────────────────────┘
         │
         │ 1:N (correspondente_id)
         │
         ├─────────────────────────────────┬──────────────────────┐
         │                                 │                      │
         ↓                                 ↓                      ↓
┌──────────────────────────┐    ┌──────────────────────┐  ┌──────────────────────┐
│      CLIENTE             │    │    DEMANDA           │  │    PAGAMENTO         │
├──────────────────────────┤    ├──────────────────────┤  ├──────────────────────┤
│ id (PK)                  │    │ id (PK)              │  │ id (PK)              │
│ nome_razao_social        │    │ numero_protocolo     │  │ demanda_id (FK)      │
│ tipo (escritorio/empresa)│    │ descricao_servico    │  │ correspondente_id(FK)│
│ cpf_cnpj                 │    │ cliente_id (FK)      │  │ valor_total          │
│ email                    │    │ correspondente_id(FK)│  │ valor_pago           │
│ telefone                 │    │ especialidade_id (FK)│  │ status_pagamento     │
│ cidade_estado            │    │ data_abertura        │  │ data_vencimento      │
│ contato_principal        │    │ data_conclusao       │  │ data_pagamento       │
│ ramo_atuacao             │    │ status               │  │ metodo_pagamento     │
│ classificacao_risco      │    │ prioridade           │  │ numero_nota_fiscal   │
│ limite_credito           │    │ estatus_processual   │  │ data_criacao         │
│ data_cadastro            │    │ observacoes          │  │ comprovante_arquivo  │
│ ativo                    │    │ data_criacao         │  │ ativo                │
└──────────────────────────┘    │ usuario_responsavel  │  └──────────────────────┘
         │                       │ usuario_id (FK)      │
         │                       └──────────────────────┘
         │                                 │
         │                                 │ 1:N (demanda_id)
         │                                 │
         │                                 ↓
         │                       ┌──────────────────────┐
         │                       │    DILIGENCIA        │
         │                       ├──────────────────────┤
         │                       │ id (PK)              │
         │                       │ demanda_id (FK)      │
         │                       │ tipo_diligencia      │
         │                       │ descricao            │
         │                       │ prazo_dias           │
         │                       │ data_prazo           │
         │                       │ status               │
         │                       │ responsavel          │
         │                       │ data_conclusao       │
         │                       │ observacoes          │
         │                       │ arquivo_anexado      │
         │                       │ data_criacao         │
         │                       └──────────────────────┘

┌──────────────────────────────────────────────────────────┐
│              AGENDA_EVENTO (Independente)                │
├──────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ titulo                                                   │
│ descricao                                                │
│ usuario_id (FK)                                          │
│ demanda_id (FK - opcional)                               │
│ correspondente_id (FK - opcional)                        │
│ data_hora_inicio                                         │
│ data_hora_fim                                            │
│ local                                                    │
│ tipo_evento (reuniao/prazo/lembrete/videocall)           │
│ prioridade                                               │
│ sincronizado_google_calendar (boolean)                   │
│ id_google_calendar (se sincronizado)                     │
│ notificacao_whatsapp (boolean)                           │
│ status (pendente/confirmado/cancelado)                   │
│ data_criacao                                             │
│ data_atualizacao                                         │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│           RELATORIO (Cache/Resumo - opcional)            │
├──────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ tipo_relatorio                                           │
│ periodo_inicio                                           │
│ periodo_fim                                              │
│ dados_json                                               │
│ usuario_id (FK)                                          │
│ data_geracao                                             │
│ data_atualizacao                                         │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Especificações das Tabelas

#### 3.2.1 USUARIOS
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'gerenciador', 'usuario')),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ultima_login TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_format CHECK (email LIKE '%@%.%')
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
```

#### 3.2.2 CORRESPONDENTES
```sql
CREATE TABLE correspondentes (
    id SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(255) NOT NULL,
    nome_juridico VARCHAR(255),
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    estado_sediado CHAR(2) NOT NULL,
    cidade_sediado VARCHAR(100) NOT NULL,
    endereco_completo VARCHAR(500),
    cep VARCHAR(10),
    cnpj_validado BOOLEAN DEFAULT false,
    inscricao_estadual VARCHAR(50),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    classificacao DECIMAL(3,2) DEFAULT 0.00,
    taxa_sucesso DECIMAL(5,2) DEFAULT 0.00,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cpf_cnpj_format CHECK (length(cpf_cnpj) IN (11, 14))
);

CREATE INDEX idx_correspondentes_cpf_cnpj ON correspondentes(cpf_cnpj);
CREATE INDEX idx_correspondentes_estado ON correspondentes(estado_sediado);
CREATE INDEX idx_correspondentes_ativo ON correspondentes(ativo);
```

#### 3.2.3 ESPECIALIDADES
```sql
CREATE TABLE especialidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    area_atuacao VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais
INSERT INTO especialidades (nome, descricao, area_atuacao) VALUES
('Direito Civil', 'Contratos, responsabilidade civil', 'Cível'),
('Direito Trabalhista', 'Demandas trabalhistas', 'Trabalhista'),
('Direito Penal', 'Processos criminais', 'Criminal'),
('Direito Processual', 'Peças processuais', 'Processual'),
('Direito Imobiliário', 'Questões imobiliárias', 'Imobiliário'),
('Direito Comercial', 'Direito comercial', 'Comercial'),
('Direito Administrativo', 'Direito administrativo', 'Administrativo');
```

#### 3.2.4 CORRESPONDENTE_ESPECIALIDADES
```sql
CREATE TABLE correspondente_especialidades (
    id SERIAL PRIMARY KEY,
    correspondente_id INTEGER NOT NULL,
    especialidade_id INTEGER NOT NULL,
    nivel_experiencia VARCHAR(50) CHECK (nivel_experiencia IN ('junior', 'pleno', 'senior')),
    preco_minimo DECIMAL(10,2),
    preco_por_hora DECIMAL(10,2),
    data_desde TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_correspondente FOREIGN KEY (correspondente_id) REFERENCES correspondentes(id) ON DELETE CASCADE,
    CONSTRAINT fk_especialidade FOREIGN KEY (especialidade_id) REFERENCES especialidades(id),
    UNIQUE(correspondente_id, especialidade_id)
);

CREATE INDEX idx_corr_espec_correspondente ON correspondente_especialidades(correspondente_id);
```

#### 3.2.5 CLIENTES
```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome_razao_social VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('escritorio', 'empresa', 'departamento_juridico', 'pj')),
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    cidade_estado VARCHAR(100),
    contato_principal VARCHAR(255),
    ramo_atuacao VARCHAR(255),
    classificacao_risco VARCHAR(50) CHECK (classificacao_risco IN ('baixo', 'medio', 'alto')),
    limite_credito DECIMAL(15,2),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_tipo ON clientes(tipo);
```

#### 3.2.6 DEMANDAS
```sql
CREATE TABLE demandas (
    id SERIAL PRIMARY KEY,
    numero_protocolo VARCHAR(50) UNIQUE NOT NULL,
    descricao_servico TEXT NOT NULL,
    cliente_id INTEGER NOT NULL,
    correspondente_id INTEGER,
    especialidade_id INTEGER NOT NULL,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'aberta' 
        CHECK (status IN ('aberta', 'em_progresso', 'aguardando_cliente', 'concluida', 'cancelada')),
    prioridade VARCHAR(50) DEFAULT 'normal' 
        CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    estatus_processual VARCHAR(255),
    observacoes TEXT,
    usuario_responsavel_id INTEGER NOT NULL,
    valor_estimado DECIMAL(15,2),
    valor_final DECIMAL(15,2),
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT fk_correspondente FOREIGN KEY (correspondente_id) REFERENCES correspondentes(id),
    CONSTRAINT fk_especialidade FOREIGN KEY (especialidade_id) REFERENCES especialidades(id),
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_responsavel_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_demandas_cliente ON demandas(cliente_id);
CREATE INDEX idx_demandas_correspondente ON demandas(correspondente_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_data_abertura ON demandas(data_abertura);
```

#### 3.2.7 DILIGENCIAS
```sql
CREATE TABLE diligencias (
    id SERIAL PRIMARY KEY,
    demanda_id INTEGER NOT NULL,
    tipo_diligencia VARCHAR(100) NOT NULL,
    descricao TEXT,
    prazo_dias INTEGER,
    data_prazo DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'em_progresso', 'concluida', 'atrasada', 'cancelada')),
    responsavel_id INTEGER,
    data_conclusao TIMESTAMP,
    observacoes TEXT,
    arquivo_anexado VARCHAR(500),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE CASCADE,
    CONSTRAINT fk_responsavel FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_diligencias_demanda ON diligencias(demanda_id);
CREATE INDEX idx_diligencias_status ON diligencias(status);
CREATE INDEX idx_diligencias_data_prazo ON diligencias(data_prazo);
```

#### 3.2.8 PAGAMENTOS
```sql
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    demanda_id INTEGER NOT NULL,
    correspondente_id INTEGER NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0.00,
    status_pagamento VARCHAR(50) NOT NULL DEFAULT 'pendente'
        CHECK (status_pagamento IN ('pendente', 'parcial', 'completo', 'atrasado', 'cancelado')),
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP,
    metodo_pagamento VARCHAR(50) CHECK (metodo_pagamento IN ('transferencia', 'boleto', 'cartao', 'pix')),
    numero_nota_fiscal VARCHAR(50),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comprovante_arquivo VARCHAR(500),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id),
    CONSTRAINT fk_correspondente FOREIGN KEY (correspondente_id) REFERENCES correspondentes(id)
);

CREATE INDEX idx_pagamentos_status ON pagamentos(status_pagamento);
CREATE INDEX idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX idx_pagamentos_correspondente ON pagamentos(correspondente_id);
```

#### 3.2.9 AGENDA_EVENTOS
```sql
CREATE TABLE agenda_eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    usuario_id INTEGER NOT NULL,
    demanda_id INTEGER,
    correspondente_id INTEGER,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_fim TIMESTAMP NOT NULL,
    local VARCHAR(500),
    tipo_evento VARCHAR(50) NOT NULL DEFAULT 'reuniao'
        CHECK (tipo_evento IN ('reuniao', 'prazo', 'lembrete', 'videocall', 'audiencia')),
    prioridade VARCHAR(50) DEFAULT 'normal',
    sincronizado_google_calendar BOOLEAN DEFAULT false,
    id_google_calendar VARCHAR(500),
    notificacao_whatsapp BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'confirmado', 'realizado', 'cancelado')),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT fk_demanda FOREIGN KEY (demanda_id) REFERENCES demandas(id) ON DELETE SET NULL,
    CONSTRAINT fk_correspondente FOREIGN KEY (correspondente_id) REFERENCES correspondentes(id) ON DELETE SET NULL,
    CHECK (data_hora_fim > data_hora_inicio)
);

CREATE INDEX idx_agenda_usuario ON agenda_eventos(usuario_id);
CREATE INDEX idx_agenda_data_inicio ON agenda_eventos(data_hora_inicio);
CREATE INDEX idx_agenda_demanda ON agenda_eventos(demanda_id);
```

#### 3.2.10 RELATORIOS (Cache)
```sql
CREATE TABLE relatorios (
    id SERIAL PRIMARY KEY,
    tipo_relatorio VARCHAR(100) NOT NULL,
    periodo_inicio DATE,
    periodo_fim DATE,
    dados_json JSONB,
    usuario_id INTEGER NOT NULL,
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

---

## 4. APIs REST - ESPECIFICAÇÃO DOS ENDPOINTS

### 4.1 Estrutura Base dos Endpoints

```
BASE_URL: http://localhost:3000/api/v1

Formato de Resposta:
{
  "sucesso": true/false,
  "dados": {...} ou [...],
  "mensagem": "Descrição",
  "timestamp": "2025-11-02T14:30:00Z",
  "codigo_http": 200/201/400/401/404/500
}
```

### 4.2 Autenticação e Autorização

**Endpoint de Login:**
```
POST /auth/login
Body: {
  "email": "usuario@jurisconnect.com",
  "senha": "senha_segura"
}
Response 200: {
  "token": "eyJhbGc...",
  "usuario": {...},
  "expira_em": "2025-11-02T22:30:00Z"
}
```

**Header para Requisições Autenticadas:**
```
Authorization: Bearer eyJhbGc...
```

### 4.3 Endpoints de CORRESPONDENTES

```
▶ GET /correspondentes
  Query: ?estado=SP&ativo=true&especialidade_id=1&pagina=1&limite=20
  Response: Array de correspondentes com paginação

▶ GET /correspondentes/:id
  Response: Detalhes completo do correspondente

▶ POST /correspondentes
  Body: {
    "nome_fantasia": "...",
    "cpf_cnpj": "12345678901234",
    "email": "...",
    "telefone": "...",
    "estado_sediado": "SP",
    "cidade_sediado": "São Paulo",
    "especialidades": [
      { "especialidade_id": 1, "nivel_experiencia": "senior" }
    ]
  }
  Response 201: { id, ... }

▶ PUT /correspondentes/:id
  Body: { campos_a_atualizar }
  Response 200: { mensagem: "Atualizado com sucesso" }

▶ DELETE /correspondentes/:id
  Response 204: Sem conteúdo

▶ PATCH /correspondentes/:id/especialidades
  Body: { "especialidades": [...] }
  Response 200: { mensagem: "Especialidades atualizadas" }

▶ GET /correspondentes/:id/desempenho
  Response: {
    "classificacao": 4.5,
    "taxa_sucesso": 95.2,
    "demandas_concluidas": 150,
    "receita_gerada": 50000.00
  }
```

### 4.4 Endpoints de CLIENTES

```
▶ GET /clientes
  Query: ?tipo=escritorio&ativo=true&pagina=1&limite=20
  Response: Array de clientes

▶ GET /clientes/:id
  Response: Detalhes do cliente

▶ POST /clientes
  Body: {
    "nome_razao_social": "...",
    "tipo": "escritorio|empresa|departamento_juridico",
    "cpf_cnpj": "12345678901234",
    "email": "...",
    "contato_principal": "...",
    "limite_credito": 50000.00
  }
  Response 201: { id, ... }

▶ PUT /clientes/:id
  Response 200: { mensagem: "Atualizado" }

▶ GET /clientes/:id/demandas
  Query: ?status=aberta&pagina=1
  Response: Array de demandas do cliente

▶ GET /clientes/:id/pagamentos/resumo
  Response: {
    "total_devido": 5000.00,
    "total_pago": 3000.00,
    "total_atrasado": 2000.00
  }
```

### 4.5 Endpoints de DEMANDAS

```
▶ GET /demandas
  Query: ?cliente_id=1&status=aberta&especialidade_id=1&prioridade=alta&pagina=1
  Response: Array paginado de demandas

▶ GET /demandas/:id
  Response: {
    "id": 1,
    "numero_protocolo": "DEM-2025-001",
    "cliente": {...},
    "correspondente": {...},
    "especialidade": {...},
    "diligencias": [...],
    "pagamentos": [...],
    "eventos_agenda": [...]
  }

▶ POST /demandas
  Body: {
    "descricao_servico": "...",
    "cliente_id": 1,
    "especialidade_id": 1,
    "prioridade": "alta",
    "valor_estimado": 5000.00
  }
  Response 201: { id, numero_protocolo, ... }

▶ PUT /demandas/:id
  Body: { "status": "em_progresso", "correspondente_id": 5 }
  Response 200: { mensagem: "Atualizado" }

▶ POST /demandas/:id/atribuir-correspondente
  Body: { "correspondente_id": 5 }
  Response 200: { mensagem: "Correspondente atribuído" }

▶ GET /demandas/:id/historico
  Response: Array de todas as mudanças na demanda

▶ POST /demandas/:id/finalizar
  Body: { "valor_final": 5000.00, "observacoes": "..." }
  Response 200: { mensagem: "Demanda finalizada" }
```

### 4.6 Endpoints de DILIGÊNCIAS

```
▶ GET /diligencias
  Query: ?demanda_id=1&status=pendente&atrasadas=true&pagina=1
  Response: Array de diligências

▶ GET /diligencias/:id
  Response: Detalhes da diligência

▶ POST /demandas/:id/diligencias
  Body: {
    "tipo_diligencia": "petição",
    "descricao": "...",
    "prazo_dias": 15,
    "responsavel_id": 2
  }
  Response 201: { id, ... }

▶ PUT /diligencias/:id
  Body: { "status": "concluida", "observacoes": "..." }
  Response 200: { mensagem: "Atualizado" }

▶ POST /diligencias/:id/upload-arquivo
  File: multipart/form-data (arquivo anexado)
  Response 200: { url: "arquivos/diligencia_001.pdf" }

▶ GET /diligencias/atrasadas
  Query: ?limite_dias=7
  Response: Array de diligências vencidas

▶ GET /dashboard/diligencias-criticas
  Response: {
    "total_atrasadas": 5,
    "total_vencendo_hoje": 2,
    "total_proximas_72h": 8
  }
```

### 4.7 Endpoints de PAGAMENTOS

```
▶ GET /pagamentos
  Query: ?status=pendente&correspondente_id=1&data_inicio=2025-01-01&pagina=1
  Response: Array de pagamentos

▶ GET /pagamentos/:id
  Response: Detalhes do pagamento com comprovante

▶ POST /pagamentos
  Body: {
    "demanda_id": 1,
    "correspondente_id": 5,
    "valor_total": 3000.00,
    "data_vencimento": "2025-12-01",
    "metodo_pagamento": "transferencia"
  }
  Response 201: { id, ... }

▶ PUT /pagamentos/:id
  Body: { "status_pagamento": "completo", "data_pagamento": "2025-11-02" }
  Response 200: { mensagem: "Atualizado" }

▶ POST /pagamentos/:id/registrar-pagamento
  Body: {
    "valor_pago": 3000.00,
    "data_pagamento": "2025-11-02",
    "metodo_pagamento": "pix"
  }
  Response 200: { mensagem: "Pagamento registrado" }

▶ POST /pagamentos/:id/upload-comprovante
  File: multipart (PDF/PNG)
  Response 200: { url: "comprovantes/pag_001.pdf" }

▶ GET /pagamentos/relatorio-financeiro
  Query: ?periodo=mes&ano=2025&mes=11
  Response: {
    "total_emitido": 50000.00,
    "total_recebido": 35000.00,
    "pendente": 15000.00,
    "atrasado": 5000.00
  }

▶ POST /pagamentos/:id/gerar-boleto
  Response 200: { 
    "codigo_barras": "12345.67890 12345.678901 12345.678901 1 12345678901234",
    "url_boleto": "https://boleto-url..." 
  }
```

### 4.8 Endpoints de AGENDA

```
▶ GET /agenda
  Query: ?data_inicio=2025-11-01&data_fim=2025-11-30&usuario_id=1
  Response: Array de eventos no período

▶ GET /agenda/dia/:data
  Query: ?usuario_id=1
  Response: Eventos do dia especificado

▶ GET /agenda/proximos-7-dias
  Response: Array de próximos 7 dias com eventos

▶ POST /agenda
  Body: {
    "titulo": "Reunião com cliente",
    "descricao": "...",
    "data_hora_inicio": "2025-11-05T14:00:00Z",
    "data_hora_fim": "2025-11-05T15:00:00Z",
    "tipo_evento": "reuniao",
    "demanda_id": 1,
    "correspondente_id": 5,
    "notificacao_whatsapp": true
  }
  Response 201: { id, ... }

▶ PUT /agenda/:id
  Body: { "status": "confirmado", "local": "..." }
  Response 200: { mensagem: "Atualizado" }

▶ DELETE /agenda/:id
  Response 204: Sem conteúdo

▶ POST /agenda/:id/sincronizar-google-calendar
  Body: { "usuario_google_id": "..." }
  Response 200: { mensagem: "Sincronizado" }

▶ POST /agenda/:id/enviar-notificacao-whatsapp
  Body: { "numero": "11987654321" }
  Response 200: { mensagem: "Notificação enviada" }

▶ GET /agenda/disponibilidade/:correspondente_id
  Query: ?periodo_inicio=2025-11-01&periodo_fim=2025-11-30
  Response: Array de slots disponíveis
```

### 4.9 Endpoints de RELATÓRIOS

```
▶ GET /relatorios/dashboard
  Response: {
    "kpi_demandas_abertas": 12,
    "kpi_pagamentos_pendentes": 5,
    "kpi_diligencias_atrasadas": 2,
    "receita_mes": 50000.00,
    "correspondentes_ativos": 25,
    "clientes_ativos": 15
  }

▶ GET /relatorios/demandas-por-status
  Query: ?periodo=mes
  Response: { "aberta": 10, "em_progresso": 5, "concluida": 8 }

▶ GET /relatorios/correspondentes-ranking
  Query: ?periodo=trimestre&limite=10
  Response: Array com ranking de correspondentes

▶ GET /relatorios/financeiro
  Query: ?data_inicio=2025-01-01&data_fim=2025-11-30
  Response: {
    "receita_total": 150000.00,
    "despesas_total": 80000.00,
    "lucro": 70000.00,
    "por_correspondente": [...]
  }

▶ POST /relatorios/gerar-pdf
  Body: { "tipo": "financeiro", "periodo": "mes" }
  Response 200: { url: "relatorios/fin_2025_11.pdf" }
```

### 4.10 Endpoints Administrativos

```
▶ GET /usuarios
  Response: Array de usuários

▶ POST /usuarios
  Body: {
    "email": "novo@jurisconnect.com",
    "nome_completo": "João Silva",
    "role": "gerenciador"
  }
  Response 201: { id, token_temporario, ... }

▶ PUT /usuarios/:id
  Body: { "nome_completo": "...", "role": "admin" }
  Response 200

▶ DELETE /usuarios/:id
  Response 204

▶ POST /backup/agora
  Response 200: { mensagem: "Backup iniciado", arquivo: "backup_2025_11_02.tar" }

▶ GET /backup/historico
  Response: Array de backups realizados

▶ POST /restaurar-backup
  Body: { "arquivo_backup": "backup_2025_11_02.tar" }
  Response 200: { mensagem: "Restauração iniciada" }
```

---

## 5. INTEGRAÇÕES EXTERNAS

### 5.1 WhatsApp Integration

**Configuração:**

```javascript
// config/whatsapp.js
module.exports = {
  provider: 'zenvia', // ou 'twilio'
  apiKey: process.env.WHATSAPP_API_KEY,
  apiUrl: 'https://api.zenvia.com/v1/channels/whatsapp/messages',
  números_autorizados: [
    '11 93011-9867',
    '11 98244-2595'
  ]
};
```

**Casos de Uso:**

1. **Notificação de Diligências Criadas**
   - Trigger: Quando diligência é criada
   - Mensagem: "Nova diligência: {tipo}, prazo: {data}"

2. **Lembrete de Prazos**
   - Trigger: 24h antes do prazo
   - Mensagem: "Atenção! Diligência {tipo} vence em 24h"

3. **Confirmação de Pagamentos**
   - Trigger: Após registrar pagamento
   - Mensagem: "Pagamento confirmado em {data}"

4. **Confirmação de Eventos Agenda**
   - Trigger: Antes do evento
   - Mensagem: "Lembrete: {evento} em {tempo}"

**Implementação (Service):**

```javascript
// services/WhatsAppService.js
class WhatsAppService {
  async enviarNotificacao(numero, mensagem) {
    try {
      const response = await axios.post(process.env.WHATSAPP_API_URL, {
        messaging_product: 'whatsapp',
        to: numero.replace(/\D/g, ''),
        type: 'text',
        text: { body: mensagem }
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error);
      throw error;
    }
  }
  
  async enviarNotificacaoDiligencia(diligencia) {
    const mensagem = `📋 Nova Diligência\n
Tipo: ${diligencia.tipo_diligencia}\n
Demanda: ${diligencia.demanda?.numero_protocolo}\n
Prazo: ${this.formatarData(diligencia.data_prazo)}\n\n
Acesse JurisConnect para mais detalhes.`;
    
    await this.enviarNotificacao(
      process.env.WHATSAPP_NUMERO_PRINCIPAL,
      mensagem
    );
  }
  
  formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}

module.exports = new WhatsAppService();
```

### 5.2 Google Calendar Integration

**Configuração:**

```javascript
// config/googleCalendar.js
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

module.exports = { google, oauth2Client };
```

**Sincronização de Eventos:**

```javascript
// services/GoogleCalendarService.js
class GoogleCalendarService {
  async sincronizarEvento(evento, usuarioToken) {
    const calendar = google.calendar({ version: 'v3', auth: usuarioToken });
    
    const googleEvent = {
      summary: evento.titulo,
      description: evento.descricao,
      start: { dateTime: evento.data_hora_inicio, timeZone: 'America/Sao_Paulo' },
      end: { dateTime: evento.data_hora_fim, timeZone: 'America/Sao_Paulo' },
      location: evento.local,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: googleEvent
      });
      
      return response.data.id;
    } catch (error) {
      console.error('Erro Google Calendar:', error);
      throw error;
    }
  }
  
  async obterDisponibilidade(usuarioToken, dataInicio, dataFim) {
    const calendar = google.calendar({ version: 'v3', auth: usuarioToken });
    
    const response = await calendar.freebusy.query({
      resource: {
        timeMin: dataInicio,
        timeMax: dataFim,
        items: [{ id: 'primary' }]
      }
    });
    
    return response.data.calendars.primary;
  }
}

module.exports = new GoogleCalendarService();
```

### 5.3 APIs Jurídicas (Judit, CNJ)

**Consultoria de Processos:**

```javascript
// services/JuridicalAPIService.js
class JuridicalAPIService {
  async consultarProcessoCNJ(numeroProcesso) {
    try {
      const response = await axios.get(
        `https://api.cnj.jus.br/consulta-judicial?numero=${numeroProcesso}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CNJ_API_KEY}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro na consulta CNJ:', error);
      return null;
    }
  }
  
  async consultarJudit(cpfCnpj) {
    try {
      const response = await axios.get(
        `${process.env.JUDIT_API_URL}/consulta`,
        {
          params: { cpf_cnpj: cpfCnpj },
          headers: {
            'Authorization': `Bearer ${process.env.JUDIT_API_KEY}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro na consulta Judit:', error);
      return null;
    }
  }
}

module.exports = new JuridicalAPIService();
```

---

## 6. ESTRUTURA DE PASTAS DO PROJETO

```
jurisconnect/
│
├── README.md
├── package.json
├── .env.example
├── .env.local (não versionado)
├── .gitignore
│
├── src/
│   │
│   ├── main/                              # Electron Main Process
│   │   ├── index.js                       # Entrada principal
│   │   ├── preload.js                     # Context Bridge (segurança)
│   │   └── ipc-handlers.js               # IPC handlers
│   │
│   ├── backend/
│   │   ├── app.js                         # Express app setup
│   │   ├── server.js                      # Inicializa servidor
│   │   │
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── auth.js
│   │   │   ├── whatsapp.js
│   │   │   ├── googleCalendar.js
│   │   │   └── env.js
│   │   │
│   │   ├── models/
│   │   │   ├── Usuario.js
│   │   │   ├── Correspondente.js
│   │   │   ├── Especialidade.js
│   │   │   ├── Cliente.js
│   │   │   ├── Demanda.js
│   │   │   ├── Diligencia.js
│   │   │   ├── Pagamento.js
│   │   │   ├── AgendaEvento.js
│   │   │   ├── Relatorio.js
│   │   │   └── index.js                   # Associations
│   │   │
│   │   ├── controllers/
│   │   │   ├── AuthController.js
│   │   │   ├── CorrespondenteController.js
│   │   │   ├── ClienteController.js
│   │   │   ├── DemandaController.js
│   │   │   ├── DiligenciaController.js
│   │   │   ├── PagamentoController.js
│   │   │   ├── AgendaController.js
│   │   │   ├── RelatorioController.js
│   │   │   └── UsuarioController.js
│   │   │
│   │   ├── services/
│   │   │   ├── CorrespondenteService.js
│   │   │   ├── ClienteService.js
│   │   │   ├── DemandaService.js
│   │   │   ├── PagamentoService.js
│   │   │   ├── DiligenciaService.js
│   │   │   ├── AgendaService.js
│   │   │   ├── RelatorioService.js
│   │   │   ├── WhatsAppService.js
│   │   │   ├── GoogleCalendarService.js
│   │   │   ├── JuridicalAPIService.js
│   │   │   ├── BackupService.js
│   │   │   └── AuthService.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── correspondentes.js
│   │   │   ├── clientes.js
│   │   │   ├── demandas.js
│   │   │   ├── diligencias.js
│   │   │   ├── pagamentos.js
│   │   │   ├── agenda.js
│   │   │   ├── relatorios.js
│   │   │   ├── usuarios.js
│   │   │   ├── backup.js
│   │   │   └── index.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                   # JWT validation
│   │   │   ├── errorHandler.js
│   │   │   ├── validation.js
│   │   │   ├── cors.js
│   │   │   └── requestLogger.js
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── errorCodes.js
│   │   │   ├── constants.js
│   │   │   └── logger.js
│   │   │
│   │   ├── database/
│   │   │   ├── migrations/               # Sequelize migrations
│   │   │   │   ├── 001-create-usuarios.js
│   │   │   │   ├── 002-create-especialidades.js
│   │   │   │   ├── 003-create-correspondentes.js
│   │   │   │   ├── 004-create-clientes.js
│   │   │   │   ├── 005-create-demandas.js
│   │   │   │   ├── 006-create-diligencias.js
│   │   │   │   ├── 007-create-pagamentos.js
│   │   │   │   ├── 008-create-agenda.js
│   │   │   │   └── 009-create-relatorios.js
│   │   │   │
│   │   │   ├── seeders/                  # Dados iniciais
│   │   │   │   ├── 001-especialidades.js
│   │   │   │   └── 002-usuarios-padrao.js
│   │   │   │
│   │   │   └── backups/                  # Backups automáticos
│   │   │       └── *.tar
│   │   │
│   │   ├── scripts/
│   │   │   ├── backup-cron.js           # Agendador de backup
│   │   │   └── manutencao-db.js
│   │   │
│   │   └── jobs/
│   │       ├── enviar-notificacoes.js
│   │       ├── processar-prazos.js
│   │       └── sincronizar-calendarios.js
│   │
│   ├── frontend/
│   │   ├── index.html
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── components/
│   │   │
│   │   ├── public/
│   │   │   ├── icon.png
│   │   │   └── logo.svg
│   │   │
│   │   └── src/
│   │       ├── App.jsx
│   │       ├── index.jsx
│   │       │
│   │       ├── components/
│   │       │   ├── Header/
│   │       │   ├── Sidebar/
│   │       │   ├── Dashboard/
│   │       │   ├── Correspondentes/
│   │       │   ├── Clientes/
│   │       │   ├── Demandas/
│   │       │   ├── Pagamentos/
│   │       │   ├── Diligencias/
│   │       │   ├── Agenda/
│   │       │   ├── Relatorios/
│   │       │   └── Forms/
│   │       │
│   │       ├── pages/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── CorrespondentesList.jsx
│   │       │   ├── ClientesList.jsx
│   │       │   ├── DemandasList.jsx
│   │       │   ├── Pagamentos.jsx
│   │       │   ├── Agenda.jsx
│   │       │   ├── Relatorios.jsx
│   │       │   └── Configuracoes.jsx
│   │       │
│   │       ├── hooks/
│   │       │   ├── useApi.js
│   │       │   ├── useAuth.js
│   │       │   ├── useFetch.js
│   │       │   └── useForm.js
│   │       │
│   │       ├── services/
│   │       │   ├── api.js               # Cliente HTTP
│   │       │   ├── auth.js
│   │       │   └── storage.js
│   │       │
│   │       ├── context/
│   │       │   ├── AuthContext.jsx
│   │       │   └── AppContext.jsx
│   │       │
│   │       ├── utils/
│   │       │   ├── date-utils.js
│   │       │   ├── format-utils.js
│   │       │   └── validators.js
│   │       │
│   │       └── assets/
│   │           ├── images/
│   │           └── icons/
│   │
│   └── shared/
│       ├── constants.js
│       ├── types.js
│       └── enums.js
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   └── e2e/
│       └── workflows/
│
├── docs/
│   ├── SETUP.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── TROUBLESHOOTING.md
│
└── .github/
    └── workflows/
        ├── ci.yml
        └── build.yml
```

---

## 7. SEGURANÇA

### 7.1 Políticas de Autenticação e Autorização

**Autenticação:**
- JWT com expiração de 24 horas
- Refresh tokens para extensão de sessão
- Senha com hash bcrypt (salt rounds: 12)
- 2FA opcional para admins

**Autorização por Role:**
```javascript
const roles = {
  'admin': ['tudo'],
  'gerenciador': ['ver_tudo', 'criar_demandas', 'atribuir_correspondentes'],
  'usuario': ['ver_suas_demandas', 'criar_diligencias']
};
```

### 7.2 Proteção de Dados Sensíveis

**Criptografia:**
- Dados em trânsito: TLS 1.3
- Dados em repouso: AES-256 para CPF/CNPJ
- Senhas: bcrypt com 12 rounds

**Implementação:**
```javascript
// utils/encryption.js
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = process.env.ENCRYPTION_KEY;
  }
  
  criptografar(texto) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, Buffer.from(this.key), iv);
    let criptografado = cipher.update(texto, 'utf-8', 'hex');
    criptografado += cipher.final('hex');
    return iv.toString('hex') + ':' + criptografado;
  }
  
  descriptografar(texto) {
    const parts = texto.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, Buffer.from(this.key), iv);
    let descriptografado = decipher.update(parts[1], 'hex', 'utf-8');
    descriptografado += decipher.final('utf-8');
    return descriptografado;
  }
}
```

### 7.3 Backup e Recuperação de Desastres

**Estratégia de Backup:**
- Backup automático diário via CRON às 02:00 AM
- Retenção: 30 últimos backups
- Armazenamento: Pasta local `backups/` + upload opcional para cloud

**Implementação:**
```javascript
// services/BackupService.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

class BackupService {
  async criarBackup() {
    const timestamp = new Date().toISOString().slice(0, 10);
    const nomeArquivo = `backup_jurisconnect_${timestamp}.tar`;
    const caminhoBackup = path.join(__dirname, '../../database/backups/', nomeArquivo);
    
    return new Promise((resolve, reject) => {
      const backup = spawn('pg_dump', [
        '-h', process.env.DB_HOST,
        '-p', process.env.DB_PORT,
        '-U', process.env.DB_USER,
        '-d', process.env.DB_NAME,
        '-F', 't',
        '-f', caminhoBackup
      ], {
        env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD }
      });
      
      backup.on('close', (code) => {
        if (code === 0) {
          console.log(`Backup criado: ${nomeArquivo}`);
          this.limparBackpsAntigos();
          resolve(nomeArquivo);
        } else {
          reject(`Erro ao criar backup (código: ${code})`);
        }
      });
    });
  }
  
  limparBackpsAntigos() {
    const dir = path.join(__dirname, '../../database/backups/');
    const arquivos = fs.readdirSync(dir).sort().reverse();
    
    // Manter apenas 30 últimos backups
    if (arquivos.length > 30) {
      for (let i = 30; i < arquivos.length; i++) {
        fs.unlinkSync(path.join(dir, arquivos[i]));
      }
    }
  }
  
  agendar() {
    cron.schedule('0 2 * * *', async () => {
      console.log('Iniciando backup automático...');
      try {
        await this.criarBackup();
      } catch (error) {
        console.error('Erro no backup automático:', error);
      }
    }, { timezone: 'America/Sao_Paulo' });
  }
}

module.exports = new BackupService();
```

### 7.4 Conformidade com LGPD

- **Consentimento**: Registro de consentimento de tratamento de dados
- **Direito ao esquecimento**: Endpoint para deletar dados de pessoa física
- **Portabilidade**: Exportação de dados em JSON/CSV
- **Auditoria**: Logs de acesso a dados sensíveis
- **Minimização**: Coleta apenas dados necessários

---

## 8. PROCEDIMENTOS DE DESENVOLVIMENTO

### 8.1 Instalação e Configuração

```bash
# Clonar repositório
git clone https://github.com/jurisconnect/jurisconnect.git
cd jurisconnect

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com credenciais locais

# Executar migrações do banco
npm run db:migrate

# Executar seeders (dados iniciais)
npm run db:seed

# Iniciar em desenvolvimento
npm run dev

# Iniciar apenas backend (porta 3000)
npm run backend

# Iniciar apenas frontend React (porta 3001)
npm run frontend

# Compilar aplicação desktop
npm run build

# Compilar para Windows, Mac, Linux
npm run build:windows
npm run build:mac
npm run build:linux
```

### 8.2 Padrões de Código

**Naming Conventions:**
- Variáveis/funções: camelCase
- Classes/Modelos: PascalCase
- Constantes: UPPER_SNAKE_CASE
- Funções async: sempre com prefix `async`
- Handlers: `handle` + NomeEvento

**Validações:**
Usar Joi para validar schemas:
```javascript
const schema = Joi.object({
  cpf_cnpj: Joi.string().length(14).required(),
  email: Joi.string().email().required(),
  telefone: Joi.string().min(10).required()
});
```

**Error Handling:**
```javascript
try {
  const resultado = await operacao();
  return { sucesso: true, dados: resultado };
} catch (error) {
  logger.error('Erro na operação:', error);
  throw new ApiError(error.message, 500);
}
```

---

## 9. DEPLOYMENT

### 9.1 Preparação para Produção

**Build Otimizado:**
```bash
npm run build:prod
```

**Checklist:**
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Backup do banco de dados realizado
- [ ] Certificado SSL gerado
- [ ] Testes de regressão executados
- [ ] Documentação atualizada
- [ ] Plano de rollback definido

### 9.2 Instalação em Cliente

1. Executar instalador `JurisConnect-Setup.exe`
2. Selecionar pasta de instalação
3. Configurar conexão com banco (ou usar default local)
4. Criar usuário admin
5. Realizar teste de conexão

---

## 10. SUPORTE E MANUTENÇÃO

**Contatos:**
- Email: suporte@jurisconnect.com
- Telefone: 11 93011-9867 | 11 98244-2595
- Portal: https://suporte.jurisconnect.com

**Documentação Técnica:**
- `/docs/API.md` - Referência completa de endpoints
- `/docs/DATABASE.md` - Esquema do banco
- `/docs/TROUBLESHOOTING.md` - Resolução de problemas

---

**Versão:** 1.0  
**Última atualização:** Novembro 2025  
**Status:** Pronta para Implementação