# JURISCONNECT - Referência Rápida do Banco de Dados

## 1. SUMÁRIO EXECUTIVO DAS TABELAS

### 15 Tabelas Principais + 4 Tabelas de Auditoria/Logs

```
┌────────────────────────────────────────────────────────────────────┐
│                    DOMÍNIOS FUNCIONAIS                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ 🔐 SEGURANÇA                                                       │
│    └─ USUARIOS (id, email, role, ativo, data_ultima_login)       │
│                                                                    │
│ ⚖️  CORRESPONDENTES                                                 │
│    ├─ CORRESPONDENTES (id, nome, cpf_cnpj, estado, ativo)        │
│    ├─ ESPECIALIDADES (id, nome, area_atuacao, complexidade)      │
│    └─ CORRESPONDENTE_ESPECIALIDADES (N:M link)                   │
│                                                                    │
│ 🏢 CLIENTES                                                        │
│    └─ CLIENTES (id, nome, tipo, cpf_cnpj, classificacao_risco)   │
│                                                                    │
│ 📋 DEMANDAS                                                        │
│    ├─ DEMANDAS (id, protocolo, cliente_id, corresponden_id)      │
│    ├─ DILIGENCIAS (id, demanda_id, tipo, data_prazo, status)     │
│    └─ PAGAMENTOS (id, demanda_id, correspondente_id, valor)      │
│                                                                    │
│ 📅 AGENDA                                                          │
│    └─ AGENDA_EVENTOS (id, usuario_id, demanda_id, tipo)          │
│                                                                    │
│ 📊 RELATÓRIOS                                                      │
│    └─ RELATORIOS (id, tipo, periodo, dados_json)                 │
│                                                                    │
│ 📝 AUDITORIA E LOGS                                                │
│    ├─ AUDITORIA_DEMANDAS (id, demanda_id, campo, valor_antigo)   │
│    ├─ AUDITORIA_PAGAMENTOS (id, pagamento_id, campo, valor)      │
│    ├─ LOGS_ACESSO (id, usuario_id, tipo_acesso, data)            │
│    ├─ LOGS_SINCRONIZACAO (id, api_externa, status)               │
│    └─ CONFIGURACOES (chave, valor, tipo_valor)                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. DETALHAMENTO RÁPIDO DE CADA TABELA

### USUARIOS (Segurança e Acesso)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| email | VARCHAR(255) | NOT NULL, UNIQUE | ✓ |
| nome_completo | VARCHAR(255) | NOT NULL | |
| cpf | VARCHAR(14) | UNIQUE | ✓ |
| senha_hash | VARCHAR(255) | NOT NULL | |
| role | ENUM | NOT NULL, DEFAULT 'usuario' | ✓ |
| ativo | BOOLEAN | NOT NULL, DEFAULT true | ✓ |
| data_ultima_login | TIMESTAMP | | ✓ |
| data_criacao | TIMESTAMP | NOT NULL, DEFAULT now() | ✓ |
| **Roles:** | admin, gerenciador, usuario, operacional | | |

---

### ESPECIALIDADES (Áreas de Atuação)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| nome | VARCHAR(100) | NOT NULL, UNIQUE | ✓ |
| slug | VARCHAR(100) | UNIQUE | ✓ |
| descricao | TEXT | | |
| area_atuacao | VARCHAR(255) | | |
| categoria | VARCHAR(50) | | |
| complexidade | INT | CHECK (1-5) | |
| ativo | BOOLEAN | DEFAULT true | ✓ |

**Valores Padrão Inseridos:**
- Direito Civil, Trabalhista, Penal, Processual
- Imobiliário, Comercial, Administrativo, Tributário

---

### CORRESPONDENTES (Rede de Profissionais)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| nome_fantasia | VARCHAR(255) | NOT NULL | |
| cpf_cnpj | VARCHAR(20) | NOT NULL, UNIQUE | ✓ |
| email | CITEXT | NOT NULL | ✓ |
| telefone | VARCHAR(20) | NOT NULL | |
| estado_sediado | CHAR(2) | NOT NULL, CHECK (UF válido) | ✓ |
| cidade_sediado | VARCHAR(100) | NOT NULL | |
| classificacao | NUMERIC(3,2) | CHECK (0-5) | ✓ |
| taxa_sucesso | NUMERIC(5,2) | CHECK (0-100) | ✓ |
| ativo | BOOLEAN | DEFAULT true | ✓ |
| data_cadastro | TIMESTAMP | DEFAULT now() | ✓ |

---

### CORRESPONDENTE_ESPECIALIDADES (Relacionamento N:M)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | |
| correspondente_id | INT | FK, NOT NULL | ✓ |
| especialidade_id | INT | FK, NOT NULL | ✓ |
| nivel_experiencia | ENUM | junior, pleno, senior, especialista | ✓ |
| preco_minimo | NUMERIC(10,2) | CHECK (> 0) | |
| preco_por_hora | NUMERIC(10,2) | CHECK (> 0) | |
| ativo | BOOLEAN | DEFAULT true | ✓ |
| UNIQUE | (correspondente_id, especialidade_id) | | |

---

### CLIENTES (Contratantes)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| nome_razao_social | VARCHAR(255) | NOT NULL | |
| tipo | ENUM | escritorio, empresa, departamento_juridico, pj | ✓ |
| cpf_cnpj | VARCHAR(20) | NOT NULL, UNIQUE | ✓ |
| email | CITEXT | NOT NULL | ✓ |
| estado_sediado | CHAR(2) | NOT NULL | ✓ |
| classificacao_risco | ENUM | baixo, medio, alto, critico | ✓ |
| limite_credito | NUMERIC(15,2) | | |
| dias_prazo_pagamento | INT | DEFAULT 30 | |
| total_demandas | INT | DEFAULT 0 | |
| total_pago | NUMERIC(15,2) | DEFAULT 0 | |
| total_devido | NUMERIC(15,2) | DEFAULT 0 | |
| ativo | BOOLEAN | DEFAULT true | ✓ |

---

### DEMANDAS (Requisições de Serviço)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| numero_protocolo | VARCHAR(50) | NOT NULL, UNIQUE | ✓ |
| cliente_id | INT | FK, NOT NULL | ✓ |
| correspondente_id | INT | FK | ✓ |
| especialidade_id | INT | FK, NOT NULL | |
| usuario_responsavel_id | INT | FK, NOT NULL | |
| titulo | VARCHAR(255) | NOT NULL | |
| descricao_servico | TEXT | NOT NULL | |
| status | ENUM | aberta, em_progresso, aguardando_cliente, concluida, cancelada, suspensa | ✓ |
| prioridade | ENUM | baixa, normal, alta, urgente | ✓ |
| valor_estimado | NUMERIC(15,2) | | |
| valor_final | NUMERIC(15,2) | | |
| data_abertura | TIMESTAMP | DEFAULT now() | ✓ |
| data_conclusao | TIMESTAMP | | ✓ |
| data_prazo_cliente | DATE | | ✓ |
| numero_processo_judicial | VARCHAR(50) | | |

---

### DILIGENCIAS (Tarefas Processuais)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| demanda_id | INT | FK CASCADE, NOT NULL | ✓ |
| tipo_diligencia | VARCHAR(100) | NOT NULL | ✓ |
| descricao | TEXT | NOT NULL | |
| responsavel_id | INT | FK | ✓ |
| data_prazo | DATE | NOT NULL | ✓ |
| status | ENUM | pendente, em_progresso, concluida, atrasada, cancelada, impossivel | ✓ |
| data_conclusion | TIMESTAMP | | |
| dias_atraso | INT | | |
| arquivo_anexado | VARCHAR(500) | | |
| observacoes | TEXT | | |
| data_atualizacao | TIMESTAMP | DEFAULT now() | ✓ |

**Tipos de Diligências:**
- Petição, Parecer, Despacho, Moção, Recurso
- Consulta Processual, Reunião, Verificação Documental

---

### PAGAMENTOS (Gestão Financeira)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| numero_fatura | VARCHAR(50) | UNIQUE | |
| demanda_id | INT | FK, NOT NULL | ✓ |
| correspondente_id | INT | FK, NOT NULL | ✓ |
| valor_total | NUMERIC(15,2) | NOT NULL, CHECK (> 0) | |
| valor_pago | NUMERIC(15,2) | DEFAULT 0 | |
| status_pagamento | ENUM | pendente, parcial, completo, atrasado, cancelado, em_cobranca | ✓ |
| metodo_pagamento | ENUM | transferencia, boleto, pix, cartao, cheque, dinheiro | ✓ |
| data_vencimento | DATE | NOT NULL | ✓ |
| data_pagamento | TIMESTAMP | | |
| codigo_barras | VARCHAR(50) | | |
| comprovante_arquivo | VARCHAR(500) | | |
| numero_nota_fiscal | VARCHAR(50) | | |

---

### AGENDA_EVENTOS (Agendamentos)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| titulo | VARCHAR(255) | NOT NULL | |
| usuario_id | INT | FK CASCADE, NOT NULL | ✓ |
| demanda_id | INT | FK | ✓ |
| correspondente_id | INT | FK | ✓ |
| cliente_id | INT | FK | ✓ |
| data_hora_inicio | TIMESTAMP | NOT NULL | ✓ |
| data_hora_fim | TIMESTAMP | NOT NULL, CHECK (> inicio) | |
| tipo_evento | ENUM | reuniao, prazo, lembrete, videocall, audiencia | ✓ |
| status_evento | ENUM | pendente, confirmado, realizado, cancelado, remarcado | ✓ |
| local | VARCHAR(500) | | |
| link_videocall | VARCHAR(500) | | |
| sincronizado_google_calendar | BOOLEAN | DEFAULT false | ✓ |
| notificacao_email | BOOLEAN | DEFAULT true | |
| notificacao_whatsapp | BOOLEAN | DEFAULT false | |

---

### RELATORIOS (Cache e BI)

| Campo | Tipo | Constraints | Índice |
|-------|------|-------------|--------|
| id | SERIAL | PK | ✓ |
| uuid | UUID | NOT NULL, UNIQUE | ✓ |
| tipo_relatorio | VARCHAR(100) | NOT NULL | ✓ |
| titulo | VARCHAR(255) | NOT NULL | |
| periodo_inicio | DATE | | |
| periodo_fim | DATE | | |
| dados_json | JSONB | NOT NULL | |
| usuario_id | INT | FK | ✓ |
| publico | BOOLEAN | DEFAULT false | ✓ |
| data_geracao | TIMESTAMP | DEFAULT now() | ✓ |

**Tipos de Relatórios:**
- Dashboard KPI, Financeiro, Correspondentes Ranking
- Demandas por Status, Diligências Críticas, Fluxo de Caixa

---

## 3. TIPOS DE DADOS UTILIZADOS

### TIPOS BÁSICOS

| Tipo | Tamanho | Uso |
|------|--------|-----|
| SERIAL | 4 bytes | IDs auto-incrementadas |
| BIGSERIAL | 8 bytes | Logs com alto volume |
| INTEGER | 4 bytes | Contadores, prioridades |
| NUMERIC(precision,scale) | Variável | Valores monetários |
| VARCHAR(n) | Variável | Strings com limite |
| TEXT | Variável | Descrições longas |
| CITEXT | Variável | Case-insensitive (emails) |
| TIMESTAMP | 8 bytes | Data e hora completa |
| DATE | 4 bytes | Apenas data |
| TIME | 8 bytes | Apenas hora |
| BOOLEAN | 1 byte | Verdadeiro/Falso |
| INET | Variável | Endereços IP |
| UUID | 16 bytes | Identificadores únicos |
| JSONB | Variável | Dados semi-estruturados |

---

## 4. TIPOS ENUM CUSTOMIZADOS

```sql
-- Roles de Usuário (4 valores)
role_usuario: 'admin', 'gerenciador', 'usuario', 'operacional'

-- Tipos de Cliente (5 valores)
tipo_cliente: 'escritorio', 'empresa', 'departamento_juridico', 'pj', 'pessoa_fisica'

-- Status de Demanda (6 valores)
status_demanda: 'aberta', 'em_progresso', 'aguardando_cliente', 'concluida', 'cancelada', 'suspensa'

-- Prioridade de Demanda (4 valores)
prioridade_demanda: 'baixa', 'normal', 'alta', 'urgente'

-- Status de Diligência (6 valores)
status_diligencia: 'pendente', 'em_progresso', 'concluida', 'atrasada', 'cancelada', 'impossivel'

-- Status de Pagamento (6 valores)
status_pagamento: 'pendente', 'parcial', 'completo', 'atrasado', 'cancelado', 'em_cobranca'

-- Método de Pagamento (6 valores)
metodo_pagamento: 'transferencia', 'boleto', 'pix', 'cartao', 'cheque', 'dinheiro'

-- Tipo de Evento (7 valores)
tipo_evento: 'reuniao', 'prazo', 'lembrete', 'videocall', 'audiencia', 'despacho', 'decisao'

-- Status de Evento (5 valores)
status_evento: 'pendente', 'confirmado', 'realizado', 'cancelado', 'remarcado'

-- Nível de Experiência (4 valores)
nivel_experiencia: 'junior', 'pleno', 'senior', 'especialista'

-- Classificação de Risco (4 valores)
classificacao_risco: 'baixo', 'medio', 'alto', 'critico'
```

---

## 5. TABELAS DE AUDITORIA

### AUDITORIA_DEMANDAS

Rastreia TODAS as mudanças em demandas.

| Campo | Tipo |
|-------|------|
| id | SERIAL (PK) |
| demanda_id | INT (FK → demandas) |
| campo_alterado | VARCHAR(100) |
| valor_anterior | TEXT |
| valor_novo | TEXT |
| usuario_id | INT (FK → usuarios) |
| data_alteracao | TIMESTAMP |

---

### AUDITORIA_PAGAMENTOS

Rastreia TODAS as mudanças em pagamentos.

| Campo | Tipo |
|-------|------|
| id | SERIAL (PK) |
| pagamento_id | INT (FK → pagamentos) |
| campo_alterado | VARCHAR(100) |
| valor_anterior | TEXT |
| valor_novo | TEXT |
| usuario_id | INT (FK → usuarios) |
| data_alteracao | TIMESTAMP |

---

### LOGS_ACESSO

Registra todas as ações de usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGSERIAL (PK) | Identificação |
| usuario_id | INT (FK) | Quem fez |
| tipo_acesso | VARCHAR(50) | login, logout, view, edit, delete |
| entidade_tipo | VARCHAR(50) | demanda, pagamento, diligencia, etc |
| entidade_id | INT | ID do registro acessado |
| ip_address | INET | IP de origem |
| data_acesso | TIMESTAMP | Quando fez |

---

## 6. ESTATÍSTICAS ESPERADAS

### Volume de Dados Típicos (Por Mês)

| Entidade | Criações/Mês | Total Acumulado (12 meses) |
|----------|--------------|---------------------------|
| Demandas | 50-100 | 600-1200 |
| Diligências | 200-400 | 2400-4800 |
| Pagamentos | 50-100 | 600-1200 |
| Eventos de Agenda | 200-500 | 2400-6000 |
| Logs de Acesso | 10000+ | 120000+ |

### Tamanho Estimado do Banco

- **Schema estruturado:** ~50 MB
- **Dados (12 meses):** ~200-500 MB
- **Com backups (30 últimos):** ~6-15 GB local
- **Recomendação:** Mínimo 50 GB de armazenamento

---

## 7. CONSTRAINTS PRINCIPAIS

### CONSTRAINTS DE INTEGRIDADE REFERENCIAL

- Usuários não podem ser deletados se referenciam outros registros
- Demandas exigem Cliente + Especialidade (RESTRICT)
- Diligências são deletadas quando Demanda é deletada (CASCADE)
- Pagamentos exigem Demanda + Correspondente (RESTRICT)
- Agenda_Eventos podem ficar órfãs se registros são deletados (SET NULL)

### CONSTRAINTS DE NEGÓCIO

- CPF/CNPJ únicos e validados
- Emails únicos e validados
- Status seguem transições válidas
- Valores monetários sempre >= 0
- Datas de conclusão >= data de abertura
- data_hora_fim > data_hora_inicio

---

## 8. ÍNDICES CRÍTICOS PARA PERFORMANCE

### Top 10 Índices Mais Importantes

```sql
1. idx_demandas_status              -- Listar demandas abertas
2. idx_demandas_cliente             -- Demandas por cliente
3. idx_demandas_correspondente      -- Demandas por correspondente
4. idx_correspondentes_estado       -- Buscar por estado
5. idx_diligencias_data_prazo       -- Diligências vencidas
6. idx_pagamentos_vencimento        -- Pagamentos a vencer
7. idx_pagamentos_status            -- Pagamentos pendentes
8. idx_usuarios_email               -- Login
9. idx_correspondentes_cpf_cnpj     -- Verificar duplicatas
10. idx_agenda_data_inicio          -- Próximos eventos
```

---

## 9. QUERIES MAIS COMUNS

```sql
-- 1. Demandas abertas por cliente
SELECT COUNT(*) FROM demandas 
WHERE cliente_id = $1 AND status = 'aberta';

-- 2. Pagamentos vencidos
SELECT * FROM pagamentos 
WHERE status_pagamento IN ('pendente', 'atrasado')
AND data_vencimento < CURRENT_DATE;

-- 3. Diligências críticas
SELECT * FROM diligencias 
WHERE status IN ('pendente', 'atrasada')
AND data_prazo <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY data_prazo;

-- 4. Correspondentes mais bem avaliados
SELECT * FROM correspondentes 
WHERE ativo = true 
ORDER BY classificacao DESC 
LIMIT 10;

-- 5. Receita do mês
SELECT SUM(valor_total) FROM pagamentos 
WHERE DATE_TRUNC('month', data_emissao) = DATE_TRUNC('month', CURRENT_DATE);
```

---

## 10. BOAS PRÁTICAS IMPLEMENTADAS

✅ **Cada tabela tem:**
- ID único (PRIMARY KEY)
- UUID para referência externa
- Timestamps (criação + atualização)
- Índices em campos consultados
- Foreign keys com ON DELETE apropriado
- Constraints de negócio

✅ **Segurança:**
- Senhas com hash (bcrypt)
- Logs de acesso completos
- Auditoria de mudanças críticas
- Validação de CPF/CNPJ
- Validação de email

✅ **Performance:**
- Índices em JOINs frequentes
- Índices em WHERE clauses
- ENUM em vez de strings para status
- JSONB para dados semi-estruturados
- Triggers para atualização automática

✅ **Confiabilidade:**
- Foreign keys RESTRICT quando crítico
- Foreign keys CASCADE quando apropriado
- Constraints CHECK para validação
- Transações ACID
- Backup automático diário

---

**Banco de Dados Pronto para Produção** ✅

Documentação v1.0 - Completa e Detalhada