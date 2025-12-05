# JURISCONNECT - Fluxos e Diagramas de Segurança

## 1. FLUXO DE AUTENTICAÇÃO COM JWT

```
┌─────────────────┐
│   Usuário       │
│   (Cliente)     │
└────────┬────────┘
         │
         │ 1. POST /auth/login
         │ { email, senha }
         ↓
    ┌────────────────────────────────────────┐
    │   Backend API (Express)                 │
    ├────────────────────────────────────────┤
    │ 1. Validar email/senha formato         │
    │ 2. Rate limiter check (5/15min)       │
    │ 3. Buscar usuário no BD                │
    │ 4. Comparar senha com bcrypt           │
    │ 5. Verificar 2FA se habilitado         │
    │ 6. Gerar JWT Access Token (24h)        │
    │ 7. Gerar JWT Refresh Token (7d)        │
    │ 8. Log de acesso (auditoria)           │
    └────────┬───────────────────────────────┘
             │
             │ 2. Response 200
             │ {
             │   token: "eyJhbG...",
             │   refresh_token: "eyJhbG...",
             │   expira_em: "2025-11-03T14:30:00Z"
             │ }
             ↓
    ┌─────────────────┐
    │ Client armazena │
    │ token (RAM)     │
    │ refresh_token   │
    │ (HTTP-only)     │
    └─────────────────┘


PRÓXIMAS REQUISIÇÕES:

┌─────────────────┐
│   Usuário       │
│   (Cliente)     │
└────────┬────────┘
         │
         │ GET /demandas
         │ Authorization: Bearer eyJhbG...
         ↓
    ┌────────────────────────────────────────┐
    │   Backend Middleware (verificarAuth)   │
    ├────────────────────────────────────────┤
    │ 1. Extrair token do header             │
    │ 2. Validar assinatura JWT              │
    │ 3. Verificar expiração                 │
    │ 4. Verificar na blacklist              │
    │ 5. Validar issuer/audience             │
    │ 6. Adicionar usuário ao req            │
    │ 7. Log de acesso                       │
    └────────┬───────────────────────────────┘
             │
             │ Se válido
             ↓
    ┌────────────────────────────────────────┐
    │   Próximo Middleware (verificarPermissao)
    ├────────────────────────────────────────┤
    │ 1. Verificar permissão no token        │
    │ 2. Verificar role do usuário           │
    │ 3. Aprovar ou negar                    │
    └────────┬───────────────────────────────┘
             │
             │ Se aprovado
             ↓
    ┌────────────────────────────────────────┐
    │   Controller (DemandaController)       │
    │   Processar requisição...              │
    └────────┬───────────────────────────────┘
             │
             │ Response com dados
             ↓
    ┌─────────────────┐
    │   Cliente       │
    │   Processa      │
    │   Resposta      │
    └─────────────────┘


TOKEN EXPIRADO:

┌─────────────────────┐
│ Token expirou?      │
│ (exp < agora)       │
└────────┬────────────┘
         │ Sim
         ↓
    ┌────────────────────────────────────────┐
    │ POST /auth/refresh-token               │
    │ { refresh_token: "eyJhbG..." }         │
    └────────┬───────────────────────────────┘
             │
             │ Validar refresh token
             │
             ↓
    ┌────────────────────────────────────────┐
    │ Gerar novo access token                │
    │ Reutilizar refresh token               │
    └────────┬───────────────────────────────┘
             │
             │ Response com novo token
             ↓
    ┌─────────────────┐
    │   Cliente       │
    │   Atualiza      │
    │   token em RAM  │
    └─────────────────┘
```

---

## 2. FLUXO DE CONTROLE DE ACESSO

```
┌──────────────────────┐
│   Requisição         │
│   POST /demandas/:id │
│   Authorization: ... │
└──────────┬───────────┘
           │
           ↓
    ┌─────────────────────────────────────────────┐
    │   Middleware 1: verificarAuth               │
    ├─────────────────────────────────────────────┤
    │ ✓ Token válido? → Extrair payload            │
    │ ✓ Não expirado?                             │
    │ ✓ Na blacklist? → Negar                     │
    └──────────┬────────────────────────────────┬─┘
               │                                │
               │ ✓ Válido                       │ ✗ Inválido
               ↓                                ↓
          ┌────────────┐              ┌──────────────────┐
          │ Continuar  │              │ 401 Unauthorized │
          └──────┬─────┘              │ Token inválido   │
                 │                    └──────────────────┘
                 ↓
    ┌─────────────────────────────────────────────┐
    │   Middleware 2: verificarAutorizacao        │
    ├─────────────────────────────────────────────┤
    │ ✓ Role: [admin, gerenciador]?               │
    └──────────┬────────────────────────────────┬─┘
               │                                │
               │ ✓ Role OK                      │ ✗ Role negada
               ↓                                ↓
          ┌────────────┐              ┌──────────────────┐
          │ Continuar  │              │ 403 Forbidden    │
          └──────┬─────┘              │ Role insuficiente│
                 │                    └──────────────────┘
                 ↓
    ┌─────────────────────────────────────────────┐
    │   Middleware 3: verificarPermissao          │
    ├─────────────────────────────────────────────┤
    │ ✓ Permissão: demandas.update?               │
    │ ✓ Usuário é admin? (bypass)                 │
    └──────────┬────────────────────────────────┬─┘
               │                                │
               │ ✓ Perm OK                      │ ✗ Perm negada
               ↓                                ↓
          ┌────────────┐              ┌──────────────────┐
          │ Continuar  │              │ 403 Forbidden    │
          └──────┬─────┘              │ Perm insuficiente│
                 │                    └──────────────────┘
                 ↓
    ┌─────────────────────────────────────────────┐
    │   Service/Controller                        │
    ├─────────────────────────────────────────────┤
    │ ✓ Validação de negócio                      │
    │ ✓ Acesso a dados (filtragem por usuário)    │
    │ ✓ Operação (update)                         │
    │ ✓ Log de auditoria                          │
    └──────────┬────────────────────────────────┬─┘
               │                                │
               │ ✓ Sucesso                      │ ✗ Erro
               ↓                                ↓
          ┌────────────┐              ┌──────────────────┐
          │ 200 OK     │              │ 400/500          │
          │ Dados      │              │ Erro             │
          └────────────┘              └──────────────────┘
```

---

## 3. FLUXO DE CRIPTOGRAFIA DE DADOS

```
ARMAZENAMENTO:

┌──────────────────────────────────────────────┐
│   Aplicação                                  │
│   usuario.cpf_cnpj = "123.456.789-00"       │
└──────────┬───────────────────────────────────┘
           │
           ↓
    ┌──────────────────────────────────────────────┐
    │   Model Hook (beforeSave)                    │
    ├──────────────────────────────────────────────┤
    │ 1. Detectar campo sensível (cpf_cnpj)       │
    │ 2. Chamar encryption.encrypt()              │
    │ 3. Gerar IV aleatório                       │
    │ 4. Encriptar com AES-256-GCM               │
    │ 5. Retornar: IV:TAG:CIPHERTEXT             │
    └──────────┬───────────────────────────────────┘
               │
               │ Valor criptografado
               │ "a1b2c3d4e5f6...:ghijklmn...:opqrst..."
               ↓
    ┌──────────────────────────────────────────────┐
    │   PostgreSQL Database                        │
    │   cpf_cnpj VARCHAR (2000)                    │
    │   = "a1b2c3d4e5f6...:ghijklmn...:opqrst..."  │
    └──────────────────────────────────────────────┘


RECUPERAÇÃO:

┌──────────────────────────────────────────────┐
│   Aplicação                                  │
│   const usuario = await Usuario.findByPk(1) │
└──────────┬───────────────────────────────────┘
           │
           ↓
    ┌──────────────────────────────────────────────┐
    │   PostgreSQL                                 │
    │   SELECT * FROM usuarios WHERE id = 1       │
    │   cpf_cnpj: "a1b2c3d4e5f6...:ghij..."      │
    └──────────┬───────────────────────────────────┘
               │
               │ Retorna dados (criptografados)
               ↓
    ┌──────────────────────────────────────────────┐
    │   Model Hook (afterLoad)                     │
    ├──────────────────────────────────────────────┤
    │ 1. Detectar campo criptografado             │
    │ 2. Chamar encryption.decrypt()              │
    │ 3. Extrair IV do começo                     │
    │ 4. Extrair TAG (GCM auth)                   │
    │ 5. Descriptografar texto                    │
    │ 6. Validar integridade (TAG)                │
    │ 7. Retornar valor original                  │
    └──────────┬───────────────────────────────────┘
               │
               │ Valor descriptografado
               │ "123.456.789-00"
               ↓
    ┌──────────────────────────────────────────────┐
    │   Aplicação                                  │
    │   usuario.cpf_cnpj = "123.456.789-00"       │
    │   (disponível para lógica)                   │
    └──────────────────────────────────────────────┘


COMPARAÇÃO (Busca):

┌──────────────────────────────────────────────┐
│   SQL com IN-APP Encryption                  │
│   SELECT * FROM usuarios                     │
│   WHERE cpf_cnpj = ?                         │
└──────────┬───────────────────────────────────┘
           │
           ↓
    ┌──────────────────────────────────────────────┐
    │   1. Encriptar valor de busca               │
    │   valor_busca_encrypted =                    │
    │     encryption.encrypt("123.456.789-00")    │
    │   "a1b2c3d4e5f6...:ghijklmn...:opqrst..."   │
    └──────────┬───────────────────────────────────┘
               │
               ↓
    ┌──────────────────────────────────────────────┐
    │   2. Buscar com valor criptografado         │
    │   SELECT * FROM usuarios                    │
    │   WHERE cpf_cnpj = ?                        │
    │   Params: ["a1b2c3d4e5f6...:ghij..."]      │
    └──────────┬───────────────────────────────────┘
               │
               │ IV muda cada vez, então não funciona!
               │ SOLUÇÃO: Usar índice com hash
               ↓
    ┌──────────────────────────────────────────────┐
    │   Coluna Hash (não reversível)              │
    │   cpf_cnpj_hash = SHA256("123.456.789-00")  │
    │   Índice em cpf_cnpj_hash                    │
    │   SELECT * WHERE cpf_cnpj_hash = ?          │
    └──────────────────────────────────────────────┘
```

---

## 4. FLUXO DE AUDITORIA

```
OPERAÇÃO:

┌─────────────────────────────────────────────────────┐
│   Requisição: PUT /demandas/1                       │
│   Body: { status: "em_progresso", valor_final: ... }
└──────────┬────────────────────────────────────────┬─┘
           │                                        │
           │ 1. Obter estado anterior               │
           ↓                                        │
    ┌──────────────────────────────────────────┐   │
    │   SELECT * FROM demandas WHERE id = 1    │   │
    │   valor_anterior = {                     │   │
    │     status: "aberta",                    │   │
    │     valor_final: NULL                    │   │
    │   }                                      │   │
    └──────────┬───────────────────────────────┘   │
               │                                    │
               │ 2. Atualizar registro              │
               │                                    │
               ↓                                    │
    ┌──────────────────────────────────────────┐   │
    │   UPDATE demandas SET ...                │   │
    │   status = "em_progresso"                │   │
    │   valor_final = 5500.00                  │   │
    └──────────┬───────────────────────────────┘   │
               │                                    │
               │ 3. Registrar auditoria             │
               │                                    │
               ↓                                    │
    ┌──────────────────────────────────────────────────┐
    │   INSERT INTO auditoria_demandas                │
    │   (demanda_id, usuario_id, operacao,           │
    │    campo_alterado, valor_anterior,              │
    │    valor_novo, ip_address, user_agent,         │
    │    data_alteracao)                              │
    │   VALUES (                                       │
    │     1,                        -- demanda_id     │
    │     req.usuario.sub,          -- usuario_id    │
    │     'update',                 -- operacao       │
    │     'status',                 -- campo          │
    │     'aberta',                 -- valor_anterior │
    │     'em_progresso',           -- valor_novo    │
    │     '192.168.1.100',          -- ip_address    │
    │     'Mozilla/5.0...',         -- user_agent    │
    │     NOW()                     -- data           │
    │   )                                             │
    └──────────┬───────────────────────────────────────┘
               │
               │ 4. Log registrado
               ↓
    ┌──────────────────────────────────────────┐
    │   Response 200                           │
    │   { sucesso: true, ... }                │
    └──────────────────────────────────────────┘


AUDITORIA COMPLETA:

┌──────────────────────────────────────────────────┐
│   Histórico de uma demanda (ID=1)               │
├──────────────────────────────────────────────────┤
│                                                  │
│   ID │ Usuário │ Campo   │ Anterior   │ Novo    │
│   ───┼─────────┼─────────┼────────────┼─────── │
│   1  │ João    │ status  │ aberta     │ em_prog │
│   2  │ Maria   │ status  │ em_prog    │ aguard  │
│   3  │ João    │ valor   │ NULL       │ 5500.00 │
│   4  │ Admin   │ status  │ aguard     │ concl   │
│                                                  │
│   Permite rastrear TODOS os mudanças de:       │
│   - Quem fez                                    │
│   - Quando foi                                  │
│   - De qual IP/navegador                        │
│   - Que valores foram alterados                 │
│   - Para auditoria regulatória                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 5. FLUXO DE 2FA (AUTENTICAÇÃO EM DOIS FATORES)

```
PRIMEIRA TENTATIVA DE LOGIN:

┌─────────────────────┐
│   POST /auth/login  │
│   { email, senha }  │
└──────────┬──────────┘
           │
           ↓
    ┌──────────────────────────────────────┐
    │   Validar email/senha                │
    │   ✓ Corretos                         │
    │   ✓ 2FA habilitado?                  │
    └──────────┬───────────────────────────┘
               │ Sim, 2FA habilitado
               ↓
    ┌──────────────────────────────────────────────────┐
    │   1. Gerar código TOTP/SMS/Email                 │
    │   2. Armazenar em cache (5 min TTL)              │
    │   3. Enviar ao usuário                           │
    │   4. Retornar token temporário (5 min)           │
    └──────────┬───────────────────────────────────────┘
               │
               │ Response 200
               │ {
               │   status: "2fa_requerido",
               │   metodo: "authenticator",
               │   token_temp: "temp_abc123..."
               │ }
               ↓
    ┌──────────────────────────────────────┐
    │   Cliente                            │
    │   Recebe código no Authenticator     │
    │   (ou SMS/Email)                     │
    └──────────────────────────────────────┘


CONFIRMAÇÃO DO 2FA:

┌──────────────────────────────────┐
│   POST /auth/login-2fa           │
│   {                              │
│     email: "usuario@...",        │
│     codigo_2fa: "123456",        │
│     token_temp: "temp_abc123..." │
│   }                              │
└──────────┬───────────────────────┘
           │
           ↓
    ┌───────────────────────────────────────────────┐
    │   1. Validar token_temp                       │
    │   2. Comparar código_2fa com TOTP            │
    │   3. Verificar se já foi usado                │
    │   4. Limpar código do cache                   │
    └──────────┬────────────────────────────────────┘
               │
               │ ✓ Código correto
               ↓
    ┌───────────────────────────────────────────────┐
    │   Gerar JWT access_token + refresh_token     │
    │   Marcar: 2fa_verificado = true               │
    │   Log: tipo_evento = 'login_2fa_confirmado'   │
    └──────────┬────────────────────────────────────┘
               │
               │ Response 200
               │ {
               │   token: "eyJhbG...",
               │   refresh_token: "eyJhbG...",
               │   expira_em: "2025-11-03T14:30:00Z"
               │ }
               ↓
    ┌──────────────────────────────────────┐
    │   Cliente                            │
    │   Armazena token                     │
    │   Acesso completo ao sistema         │
    └──────────────────────────────────────┘
```

---

## 6. FLUXO DE DETECÇÃO DE ANOMALIAS

```
DURANTE REQUISIÇÃO:

┌──────────────────────────────────────┐
│   Requisição autenticada recebida    │
└──────────┬───────────────────────────┘
           │
           ↓
    ┌──────────────────────────────────────────────────┐
    │   Sistema de Detecção de Anomalias              │
    ├──────────────────────────────────────────────────┤
    │                                                  │
    │   CHECK 1: IP diferente do usual                │
    │   - Usuário sempre acessa de São Paulo (SP)     │
    │   - Hoje acessa de Tóquio (JP)                  │
    │   → SUSPEITO: possível conta comprometida       │
    │                                                  │
    │   CHECK 2: Múltiplos IPs simultâneos            │
    │   - 3+ IPs diferentes em 5 minutos              │
    │   → SUSPEITO: login automatizado/bot            │
    │                                                  │
    │   CHECK 3: Horário anormal                      │
    │   - Usuário nunca acessa às 3:00 AM            │
    │   - Hoje acessa às 3:00 AM                      │
    │   → SUSPEITO: possível acesso não autorizado    │
    │                                                  │
    │   CHECK 4: Padrão de acesso                     │
    │   - Acesso a 100+ registros em 1 minuto        │
    │   → SUSPEITO: possível vazamento de dados       │
    │                                                  │
    │   CHECK 5: Tentativas de acesso negado          │
    │   - 10 tentativas de acesso negado              │
    │   → SUSPEITO: possível ataque/exploração       │
    │                                                  │
    └──────────┬───────────────────────────────────────┘
               │
               ↓
    ┌──────────────────────────────────────────────────┐
    │   Pontuação de Risco                             │
    │   - 0-30: Normal (permitir)                      │
    │   - 30-60: Média (alertar usuário + admin)      │
    │   - 60-100: Alta (bloquear + forçar 2FA)        │
    └──────────┬───────────────────────────────────────┘
               │
               │ Se risco_score > 60
               ↓
    ┌──────────────────────────────────────────────────┐
    │   AÇÃO: Bloquear requisição                      │
    │   1. Log de tentativa suspeita                   │
    │   2. Enviar notificação ao usuário               │
    │   3. Alertar administrador                       │
    │   4. Exigir re-autenticação com 2FA              │
    │   5. Possível bloqueio da conta                  │
    └──────────────────────────────────────────────────┘
```

---

## 7. MATRIZ DE PERMISSÕES

```
┌────────────────────────────────────────────────────────────────┐
│   MATRIZ DE PERMISSÕES POR ROLE E RECURSO                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ RECURSO      │ CREATE │ READ │ UPDATE │ DELETE │ ADMIN │ ROLE │
│ ─────────────┼────────┼──────┼────────┼────────┼───────┼──────┤
│ demandas     │  ✓✓✓   │ ✓✓✓  │  ✓✓✓   │  ✓✓   │   ✓   │ (1)  │
│ diligencias  │  ✓✓✓   │ ✓✓✓  │  ✓✓✓   │  ✓    │   ✓   │ (2)  │
│ pagamentos   │  ✓✓    │ ✓✓✓  │  ✓✓    │  ✓    │   ✓   │ (3)  │
│ correspon.   │  ✓✓    │ ✓✓✓  │  ✓✓    │  ✓    │   ✓   │ (4)  │
│ clientes     │  ✓✓    │ ✓✓✓  │  ✓✓    │  ✓    │   ✓   │ (5)  │
│ usuarios     │         │ ✓    │  ✓*    │       │   ✓   │ (6)  │
│ relatorios   │         │ ✓✓✓  │        │       │   ✓   │ (7)  │
│ auditoria    │         │ ✓    │        │       │   ✓   │ (8)  │
│                                                                │
│ Legenda:                                                      │
│ ✓ = Admin                                                     │
│ ✓✓ = Admin + Gerenciador                                      │
│ ✓✓✓ = Admin + Gerenciador + Usuário                           │
│ * = Apenas próprio perfil                                     │
│                                                                │
│ ROLES:                                                        │
│ (1) Admin, Gerenciador, Usuário                              │
│ (2) Admin, Gerenciador, Operacional                          │
│ (3) Admin, Gerenciador                                       │
│ (4) Admin, Gerenciador                                       │
│ (5) Admin, Gerenciador                                       │
│ (6) Admin (criar), Próprio (update)                          │
│ (7) Admin, Gerenciador, Usuário (próprios)                   │
│ (8) Admin (leitura completa)                                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

**Fluxos e Diagramas v1.0 - Documentação Completa** ✅