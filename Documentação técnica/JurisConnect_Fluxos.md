# JURISCONNECT - Diagramas de Fluxo e Arquitetura

## 1. Fluxo de Dados - Criação de Demanda

```
┌──────────────────────────────────────────────────────────────────────────┐
│  USUÁRIO FRONTEND                                                        │
│  1. Preenche formulário: Cliente, Especialidade, Descrição, Prioridade  │
│  2. Clica em "Criar Demanda"                                            │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │ POST /api/v1/demandas
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  ELECTRON IPC (Renderer → Main)                                          │
│  Transfere dados via processo interprocess                              │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  EXPRESS ROUTE: /demandas POST                                           │
│  - Validação de entrada (Joi schema)                                     │
│  - Verificação de autenticação (JWT middleware)                          │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  DemandaController.criar()                                               │
│  - Extrai dados da requisição                                            │
│  - Chama DemandaService                                                  │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  DemandaService.criarDemanda()                                           │
│  - Gera número de protocolo único                                        │
│  - Valida cliente e especialidade                                        │
│  - Se correspondente_id: atribui demanda                                 │
│  - Registra usuário responsável                                          │
│  - Calcula valor estimado (se aplicável)                                │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  ORM Sequelize: demanda.create({...})                                    │
│  - Validações de integridade referencial                                 │
│  - Triggers no banco (se configurados)                                   │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL: INSERT INTO demandas                                        │
│  - Tabela recebe novo registro                                           │
│  - Índices atualizam                                                     │
│  - Triggers disparam (se houver)                                         │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  TRANSAÇÃO SUCESSO / SERVIÇOS SUBSEQUENTES                              │
│  ├─→ Se correspondente atribuído: WhatsAppService.enviarNotificacao()    │
│  ├─→ RelatorioService.atualizarCache()                                  │
│  └─→ RetornoResponse 201: { id, numero_protocolo, ... }                 │
└──────────────────────────┬───────────────────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  FRONTEND - Dashboard atualizado                                         │
│  - Nova demanda aparece na lista                                         │
│  - Toast notification: "Demanda criada com sucesso"                      │
│  - Contador de demandas abertas incrementa                               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Processamento de Pagamento

```
                    ┌─────────────────────────────┐
                    │  DEMANDA CONCLUÍDA          │
                    │  Status = "concluida"       │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │ Gerar Pagamento            │
                    │ Pagamento.create()         │
                    └──────────────┬──────────────┘
                                   │ status = "pendente"
                    ┌──────────────┴──────────────┐
                    │  NOTIFICATION               │
                    │  WhatsApp: "Pagamento de    │
                    │  R$ X devido até DATA"      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │ Correspondente Recebe       │
                    │ Notificação via WhatsApp    │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
        ↓                          ↓                          ↓
    [PIX]               [TRANSFERÊNCIA]                 [BOLETO]
        │                          │                          │
    Cliente envia         Cliente envia            Cliente recebe
    chave PIX             por CNPJ                 código barras
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  Usuário registra pagamento │
                    │  Faz upload de comprovante  │
                    │  PUT /pagamentos/:id        │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  Sistema valida documentos  │
                    │  e confirma valor          │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  Status = "completo"        │
                    │  data_pagamento = agora()   │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  Notificações Finais        │
                    │  ├─ WhatsApp Correspondente │
                    │  │  "Pagamento confirmado"  │
                    │  └─ Relatório atualizado    │
                    └─────────────────────────────┘
```

---

## 3. Fluxo de Controle de Diligências e Prazos

```
DILIGÊNCIA CRIADA
│
├─ Tipo: "Petição"
├─ Prazo: +15 dias
├─ Status: "pendente"
└─ Data Prazo: 2025-11-17

                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ↓ D+7           ↓ D+14          ↓ D+1
 (8 dias antes)  (1 dia antes)  (atraso)

    │               │               │
    ├──→ Email+SMS  ├──→ Notificação├──→ Status = "atrasada"
    │   "Falta 7d"  │   Crítica     │   WhatsApp urgente
    │               │               │
    
    ↓
┌─────────────────────────────────┐
│ DAEMON CRON (job-prazos.js)    │
│ Executa a cada 6 horas         │
│ - Verifica diligências vencidas │
│ - Envia notificações           │
│ - Atualiza status              │
└─────────────────────────────────┘
    │
    ├─ Às 08:00: Check diligências
    ├─ Às 14:00: Resync com agenda
    └─ Às 20:00: Backup & report

    ↓
┌─────────────────────────────────┐
│ USUÁRIO CONCLUIU DILIGÊNCIA     │
│ PUT /diligencias/:id            │
│ status = "concluida"            │
│ data_conclusao = now()          │
└──────────┬──────────────────────┘
           │
    ┌──────┴──────┐
    ↓             ↓
SUCESSO       FALHA (prazo vencido)
│             │
└─→ Check     └─→ Registrar atraso
   próximas      Notificar cliente
   diligências   Atualizar KPIs
```

---

## 4. Arquitetura de Segurança - Autenticação

```
┌──────────────────────────────────────────────────────────┐
│           LOGIN (POST /auth/login)                       │
├──────────────────────────────────────────────────────────┤
│ 1. Usuário submete: email + senha                       │
│ 2. Backend recebe via HTTPS                             │
│ 3. Validar formato email                                │
└───────────────┬────────────────────────────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    ↓                       ↓
USUÁRIO NÃO      USUÁRIO ENCONTRADO
ENCONTRADO       │
│                ├─ Comparar senha
└─ Erro 404      │  (bcrypt.compare)
                 │
         ┌───────┴────────┐
         │                │
    SENHA INVÁLIDA    SENHA VÁLIDA
         │                │
         └─ Erro 401  ┌───┴──────────┐
                      │              │
              Verificar 2FA?    ┌────┴─ Se 2FA desabilitado
              │                 │     → JWT token gerado
              │            ├─ Gerar token JWT
        ┌─────┴─────┐      │ {
        │           │      │   "sub": "user_id",
    Enviar   2FA    │      │   "role": "admin",
    Código  Bypass  │      │   "exp": 1730614800,
    SMS/Email       │      │   "iat": 1730530400
        │           │      │ }
        ├─────┬─────┘      │
        │     │            ├─ Refresh token armazenado
        ↓ ✓   ↓            │ ├─ HTTP-Only Cookie ou
    Código  Erro            │ └─ LocalStorage (criptografado)
    aceito                  │
        │                   │
        ├──────┬────────────┘
        │      │
    Retornar  Response 200:
    token     {
        │       "token": "eyJhbGciOiJIUzI1NiI...",
        │       "refresh_token": "...",
        │       "expira_em": "2025-11-03T14:00:00Z",
        ↓       "usuario": { id, nome, role }
    ┌──────────────────────────────────┐
    │   Frontend armazena token        │
    │   Inclui em Header              │
    │   Authorization: Bearer <token> │
    └───┬────────────────────────────┘
        │
        └─→ Requisições subsequentes validadas
            Middleware verificar JWT
            ├─ Signature válida?
            ├─ Token expirado?
            ├─ User ainda ativo?
            └─ Role tem permissão?
```

---

## 5. Integração WhatsApp - Fluxo de Notificações

```
EVENT TRIGGER                  WHATSAPP SERVICE
      │                               │
      ├─ Demanda criada      ┌────────┴─────────────┐
      ├─ Diligência atrasada │ 1. Preparar mensagem │
      ├─ Pagamento registrado│ 2. Validar telefone  │
      └─ Evento agenda       │ 3. Chamar API Zenvia │
                             │ 4. Registrar log     │
                             └────────┬─────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │   ZENVIA WhatsApp API             │
                    │   https://api.zenvia.com/v1/..    │
                    └────────────────┬──────────────────┘
                                     │
                    ┌────────────────┴──────────────────┐
                    │   VALIDAÇÃO                       │
                    │ • API Key correto?                │
                    │ • Número válido?                  │
                    │ • Texto < 1024 caracteres?        │
                    └────────────────┬──────────────────┘
                                     │
                    ┌────────────────┴──────────────────┐
                    │   ENVIO VIA WHATSAPP              │
                    │   └─ 11 9XXXX-XXXX                │
                    └────────────────┬──────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ↓ ENTREGUE (✓)              ↓ LIDO (✓✓)              ↓ ERRO
    
    Registrar no DB        Atualizar status        Retry 3x
    Status = "enviado"     em tempo real           Após 5min
        │                       │                     │
        └───────────────┬───────┘                     │
                        │                        ┌────┴─────┐
                        │              ┌─────────┴──────────┐
                        │              │  3 Falhas?         │
                        │              │  Alertar admin     │
                        │              │  Registrar erro    │
                        │              └────────────────────┘
                        │
                        ↓
                    NOTIFICAÇÃO CONCLUÍDA
                    Usuário recebeu mensagem
                    Sistema registrou confirmação
```

---

## 6. Fluxo de Backup Automático

```
┌─────────────────────────────────────────────────┐
│  CRON JOB: "0 2 * * *" (02:00 AM todos os dias)│
└──────────────┬────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ↓                     ↓
INICIADO          Verificar
LOG: "Iniciando"  espaço disco
│                 │
├─ Espaço OK? ┐   │
│ └─→ SIM     │   │
│             ↓   │
│ Executar    pg_dump -h localhost...
│ │           │
│ │           ├─ Conexão aberta
│ │           ├─ Dump completo do BD
│ │           └─ Compressão TAR
│ │
│ └─ Arquivo: backup_jurisconnect_2025_11_02.tar
│    (Tamanho: ~150MB para BD típico)
│
├─ Salvar em: /database/backups/
├─ Permissões: 600 (somente leitura admin)
│
└─ Armazenar metadados:
   {
     "arquivo": "backup_jurisconnect_2025_11_02.tar",
     "data_criacao": "2025-11-02T02:00:00Z",
     "tamanho_bytes": 157286400,
     "checksum_md5": "a1b2c3d4e5...",
     "status": "sucesso",
     "duracao_segundos": 45
   }

┌─────────────────────────────────────────────────┐
│  LIMPEZA DE BACKUPS ANTIGOS                      │
├─────────────────────────────────────────────────┤
│ Se > 30 backups:                                │
│ 1. Ordenar por data DESC                        │
│ 2. Manter últimos 30                            │
│ 3. Deletar anteriores                           │
│ 4. Liberar espaço em disco                      │
└─────────────────────────────────────────────────┘

RESTAURAÇÃO (Se necessário):
┌─────────────────────────────────┐
│ 1. Admin seleciona arquivo      │
│ 2. Parar aplicação              │
│ 3. DROP banco atual (confirm)   │
│ 4. pg_restore backup_xxx.tar    │
│ 5. Validar integridade          │
│ 6. Reiniciar app                │
└─────────────────────────────────┘
```

---

## 7. Camadas de Arquitetura Detalhadas

```
┌─────────────────────────────────────────────────────────────────┐
│                    APRESENTAÇÃO (REACT)                          │
│  - Componentes reutilizáveis                                    │
│  - State management (Context/Redux)                             │
│  - Validação lado cliente                                       │
│  - UI/UX responsiva                                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Props, Events
┌──────────────────────┴──────────────────────────────────────────┐
│             IPC (Inter-Process Communication)                   │
│  - Comunicação segura entre Renderer e Main Process             │
│  - Context Bridge (whitelisting de funções)                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │ JSON-RPC
┌──────────────────────┴──────────────────────────────────────────┐
│                   ROTEAMENTO (Express)                          │
│  - Definição de rotas (/api/v1/*)                              │
│  - Middleware chain:                                            │
│    ├─ CORS                                                      │
│    ├─ Body parser                                              │
│    ├─ Auth middleware                                          │
│    ├─ Validation middleware                                    │
│    ├─ Request logger                                           │
│    └─ Route handler                                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │ this.req, this.res
┌──────────────────────┴──────────────────────────────────────────┐
│              CONTROLADORES (Controllers)                        │
│  - Orquestração de requisição/resposta                          │
│  - Validação de entrada (Joi schema)                            │
│  - Delegação para Services                                      │
│  - Tratamento de erros específicos                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Métodos de negócio
┌──────────────────────┴──────────────────────────────────────────┐
│              SERVIÇOS (Business Logic)                          │
│  - Lógica de negócio complexa                                   │
│  - Orquestração entre Models                                    │
│  - Integração com serviços externos                             │
│  - Transformação de dados                                       │
│  - Validações de regras de negócio                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Métodos de acesso
┌──────────────────────┴──────────────────────────────────────────┐
│              MODELOS (Models/ORM)                               │
│  - Definição de esquemas (Sequelize)                            │
│  - Validações de atributos                                      │
│  - Relacionamentos (hasMany, belongsTo, etc)                    │
│  - Hooks (beforeCreate, afterUpdate, etc)                       │
│  - Métodos de instância                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │ SQL queries
┌──────────────────────┴──────────────────────────────────────────┐
│              PERSISTÊNCIA (PostgreSQL)                          │
│  - Tabelas relacionais                                          │
│  - Índices para performance                                     │
│  - Constraints de integridade                                   │
│  - Transações ACID                                              │
│  - Triggers para workflows                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Resposta de API Padrão

### Sucesso (200/201):
```json
{
  "sucesso": true,
  "codigo_http": 200,
  "mensagem": "Correspondente atualizado com sucesso",
  "dados": {
    "id": 5,
    "nome_fantasia": "Advocacia Silva & Associados",
    "cpf_cnpj": "12345678901234",
    "email": "contato@advocacia-silva.com",
    "telefone": "(11) 98765-4321",
    "estado_sediado": "SP",
    "ativo": true,
    "classificacao": 4.8,
    "data_atualizacao": "2025-11-02T14:30:00Z"
  },
  "timestamp": "2025-11-02T14:30:45.123Z"
}
```

### Erro (400/404/500):
```json
{
  "sucesso": false,
  "codigo_http": 404,
  "mensagem": "Correspondente não encontrado",
  "erro": {
    "codigo": "CORRESPONDENTE_NAO_ENCONTRADO",
    "detalhes": "ID: 999 não existe no sistema",
    "timestamp": "2025-11-02T14:31:15.456Z"
  },
  "trace": "Stack trace aqui em DEV" 
}
```

---

## 9. Variáveis de Ambiente Necessárias

```env
# DATABASE
DB_HOST=localhost
DB_PORT=5432
DB_USER=jurisconnect_user
DB_PASSWORD=senha_super_segura_123
DB_NAME=jurisconnect_db

# AUTH
JWT_SECRET=sua_chave_super_secreta_aqui
JWT_EXPIRATION=24h
REFRESH_TOKEN_EXPIRATION=7d

# ENCRYPTION
ENCRYPTION_KEY=32_caracteres_exatamente_aqui

# WHATSAPP
WHATSAPP_PROVIDER=zenvia
WHATSAPP_API_KEY=sua_chave_zenvia
WHATSAPP_API_URL=https://api.zenvia.com/v1/channels/whatsapp/messages
WHATSAPP_NUMERO_PRINCIPAL=5511930119867

# GOOGLE CALENDAR
GOOGLE_CLIENT_ID=seu_id_google
GOOGLE_CLIENT_SECRET=seu_secret_google
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JURIDICAL APIS
JUDIT_API_KEY=chave_judit
JUDIT_API_URL=https://api.judit.io
CNJ_API_KEY=chave_cnj

# SERVER
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# BACKUP
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
```

---

**Documentação v1.0 - Completa e Pronta para Implementação**