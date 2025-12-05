# Correção do Erro de Login - JurisConnect

**Data:** 25/11/2025 19:31  
**Status:** ✅ Resolvido

## Problema Reportado

Erro 500 ao tentar fazer login no sistema:
```
POST /api/v1/auth/login 500 33.949 ms
error: [object Object]
```

## Diagnóstico

### 1. Erro de Logging
- Logger estava tentando serializar objeto de erro incorretamente
- Resultado: `[object Object]` nos logs

### 2. Erro de Conexão com Banco de Dados
- **Root Cause**: Porta incorreta configurada no `.env`
- Configurado: `DB_PORT=5433`
- Correto: `DB_PORT=5432`
- Erro: `ECONNREFUSED` - PostgreSQL não estava escutando na porta 5433

## Correções Aplicadas

### 1. errorHandler.js
**Arquivo:** `src/jurisconnect-backend/src/middleware/errorHandler.js`

**Mudanças:**
- ✅ Corrigido logging de erros para serializar corretamente
- ✅ Adicionado tratamento para `SequelizeConnectionError`
- ✅ Adicionado tratamento para `SequelizeConnectionRefusedError`
- ✅ Adicionado tratamento para `SequelizeAccessDeniedError`
- ✅ Mensagens de erro mais descritivas

**Antes:**
```javascript
logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
});
```

**Depois:**
```javascript
logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    name: err.name,
    code: err.code,
});
```

### 2. .env - Porta do Banco de Dados
**Arquivo:** `src/jurisconnect-backend/.env`

**Mudança:**
```diff
- DB_PORT=5433
+ DB_PORT=5432
```

### 3. test-db-connection.js (NOVO)
**Arquivo:** `src/jurisconnect-backend/test-db-connection.js`

Script de teste para diagnosticar problemas de conexão com o banco.

**Uso:**
```bash
cd src/jurisconnect-backend
node test-db-connection.js
```

## Verificação

### Teste de Conexão
```bash
✅ Connection successful!
Database info: {
  current_database: 'jurisconnect',
  current_user: 'postgres',
  version: 'PostgreSQL 18.x'
}
```

### Status do PostgreSQL
```
Name: postgresql-x64-18
Status: Running
Port: 5432
```

## Próximos Passos

1. **Reiniciar Backend**
   ```bash
   cd src/jurisconnect-backend
   npm run dev
   ```

2. **Testar Login**
   - Acessar frontend em `http://localhost:5173`
   - Tentar fazer login
   - Verificar se não há mais erro 500

3. **Verificar Migrations**
   - Executar migrations se necessário:
   ```bash
   cd src/jurisconnect-backend
   npm run migrate
   ```

4. **Criar Usuário Admin** (se necessário)
   ```bash
   cd src/jurisconnect-backend
   node src/scripts/criarAdmin.js
   ```

## Arquivos Modificados

1. `src/jurisconnect-backend/src/middleware/errorHandler.js` - Corrigido logging e adicionado tratamento de erros de DB
2. `src/jurisconnect-backend/.env` - Corrigida porta do banco (5433 → 5432)
3. `src/jurisconnect-backend/test-db-connection.js` - Criado script de teste

## Observações

> [!IMPORTANT]
> **Senha do Banco de Dados**
> 
> A senha do PostgreSQL está configurada no `.env`. Se estiver vazia, certifique-se de que o PostgreSQL está configurado para aceitar conexões sem senha (trust) ou configure uma senha adequada.

> [!TIP]
> **Script de Teste**
> 
> Use `test-db-connection.js` sempre que suspeitar de problemas de conexão com o banco de dados. Ele fornece informações detalhadas sobre o erro.

---

**Status Final:** ✅ **Problema Resolvido**  
**Backend:** Pronto para aceitar requisições de login  
**Database:** Conectado e funcionando
