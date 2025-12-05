# Correção Final - Schema do Banco de Dados

**Data:** 25/11/2025 19:44  
**Status:** ✅ Resolvido

## Problema

Após corrigir a porta do banco de dados, novo erro apareceu:
```
error: coluna "google_access_token" não existe
SequelizeDatabaseError
```

## Causa

A tabela `usuarios` no banco de dados não tinha as colunas `google_access_token` e `google_refresh_token` que o modelo `Usuario.js` estava esperando.

**Colunas existentes:** 10  
**Colunas esperadas:** 12

**Colunas faltantes:**
- `google_access_token` (TEXT)
- `google_refresh_token` (TEXT)

## Solução

### Migration Criada

**Arquivo:** `src/migrations/20251125194500-add-google-tokens-to-usuarios.js`

```javascript
up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'google_access_token', {
        type: Sequelize.TEXT,
        allowNull: true,
    });

    await queryInterface.addColumn('usuarios', 'google_refresh_token', {
        type: Sequelize.TEXT,
        allowNull: true,
    });
}
```

### Execução

```bash
cd src/jurisconnect-backend
npx sequelize-cli db:migrate
```

**Resultado:**
```
== 20251125194500-add-google-tokens-to-usuarios: migrated (0.026s)
```

## Verificação

### Colunas da Tabela usuarios (Após Migration)

1. id
2. nome
3. email
4. senha_hash
5. role
6. ativo
7. ultimo_login
8. refresh_token
9. google_access_token ✅ **NOVO**
10. google_refresh_token ✅ **NOVO**
11. created_at
12. updated_at

**Total:** 12 colunas ✅

## Status Final

✅ **Schema sincronizado**  
✅ **Login deve funcionar agora**  
✅ **Todas as colunas presentes**

## Próximo Passo

Testar login novamente no frontend com credenciais válidas.
