# 🔄 Como Restaurar um Backup

## Passo a Passo

### 1️⃣ Listar Backups Disponíveis
```bash
cd src/jurisconnect-backend
node restore-backup.js
```

Isso mostrará todos os backups disponíveis na pasta `backups/`.

### 2️⃣ Restaurar um Backup Específico
```bash
node restore-backup.js backup-2025-12-03T22-41-30.sql
```

**ATENÇÃO:**
- ⚠️ Este comando IRÁ SOBRESCREVER todos os dados do banco atual!
- 🛡️ O script tem um delay de 5 segundos para você cancelar (Ctrl+C)
- 💾 Faça um backup dos dados atuais antes de restaurar

### 3️⃣ Aguardar Conclusão
O script mostrará:
- ✅ Comandos executados com sucesso
- ❌ Comandos com erro (se houver)
- 📊 Resumo final

## Exemplo de Uso Real

```bash
# Cenário: Você perdeu dados e quer restaurar do backup de ontem

# 1. Pausar o servidor (pela segurança)
# Ctrl+C no terminal do npm run dev

# 2. Ver backups disponíveis
node restore-backup.js

# 3. Escolher o backup mais recente
node restore-backup.js backup-2025-12-03T03-00-00.sql

# 4. Aguardar (5 segundos para cancelar se mudar de ideia)

# 5. Script executa a restauração

# 6. Reiniciar o servidor
npm run dev
```

## ⚡ Restauração Rápida (Emergência)

Se você precisar restaurar AGORA:

```bash
cd src/jurisconnect-backend
node restore-backup.js <nome-do-backup.sql>
```

## 🔍 Verificar se Funcionou

Após restaurar, verifique:
1. Acesse o sistema
2. Confira os dados principais (clientes, demandas, etc.)
3. Teste as funcionalidades críticas

## ⚠️ Importante

- **SEMPRE** faça um backup antes de restaurar outro backup
- Restauração sobrescreve TUDO
- Tenha certeza do arquivo que está restaurando
- Em caso de dúvida, consulte antes de executar

## 📞 Em Caso de Problemas

Se algo der errado durante a restauração:
1. Não entre em pânico! 🧘
2. O script mostra erros específicos
3. Você pode tentar restaurar um backup mais antigo
4. Entre em contato se precisar de ajuda
