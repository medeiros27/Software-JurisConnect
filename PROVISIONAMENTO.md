# ✅ Provisionamento Completo do JurisConnect

## 📊 Status Final

| Componente | Status | Detalhes |
|------------|--------|----------|
| **PostgreSQL** | ✅ Rodando | Porta 5433 (alternativa) |
| **Banco de dados** | ✅ Criado | `jurisconnect` com todas as tabelas |
| **Scripts SQL** | ✅ Aplicados | DDL, índices, views, procedures, triggers, functions, seeds |
| **Backend Node.js** | ✅ Rodando | Porta 3000 - http://localhost:3000/api/v1 |
| **Frontend** | ✅ Compilado | Build gerado em `src/jurisconnect-frontend/dist/` |
| **Dependências npm** | ✅ Instaladas | Raiz, backend e frontend |

## 🔐 Credenciais de Acesso

### Banco de Dados
- **Host**: localhost
- **Porta**: 5433 (⚠️ **porta alternativa**)
- **Banco**: jurisconnect
- **Usuário**: postgres
- **Senha**: (vazio - trust authentication)

### Aplicação
- **Login**: admin
- **Senha**: admin123
- **Email**: admin@jurisconnect.com

## 🚀 Como Usar

### 1. Iniciar o PostgreSQL

O PostgreSQL já está rodando na porta 5433. Para parar/iniciar manualmente:

```bash
# Parar
postgres\bin\pg_ctl.exe -D postgres\data stop

# Iniciar
postgres\bin\pg_ctl.exe -D postgres\data -o "-p 5433" start
```

### 2. Iniciar o Backend

```bash
cd src\jurisconnect-backend
node src\server.js
```

O backend estará disponível em: http://localhost:3000/api/v1

### 3. Iniciar o Frontend (desenvolvimento)

```bash
cd src\jurisconnect-frontend
npm run dev
```

O frontend estará disponível em: http://localhost:5173

### 4. Empacotar para Desktop (Electron)

```bash
npm run build:electron
```

Isso gerará o instalador em `dist/JurisConnect Setup.exe`

## 📁 Estrutura do Banco de Dados

### Tabelas Criadas

- `usuarios` - Usuários do sistema (admin, operador, cliente)
- `clientes` - Clientes (PF/PJ)
- `correspondentes` - Advogados e despachantes
- `demandas` - Processos e demandas jurídicas
- `financeiro` - Contas a pagar/receber
- `agenda` - Eventos e prazos
- `documentos` - Arquivos versionados
- `logs_auditoria` - Rastreamento de todas as operações
- `configuracoes` - Configurações do sistema
- `feriados` - Feriados nacionais

### Views Disponíveis

- `vw_kpis` - KPIs do dashboard
- `vw_ultimas_demandas` - Últimas 10 demandas
- `vw_auditoria_recente` - Últimas 100 operações auditadas

### Procedures e Functions

- `relatorio_financeiro(inicio, fim)` - Relatório financeiro por período
- `relatorio_demandas_por_cliente()` - Demandas agrupadas por cliente
- `relatorio_cashflow(inicio, fim)` - Fluxo de caixa diário
- `dias_uteis(inicio, fim)` - Calcula dias úteis entre datas
- `hash_senha(senha)` - Gera hash bcrypt
- `verifica_senha(hash, senha)` - Valida senha
- `limpar_logs_auditoria(dias)` - Remove logs antigos
- `reindexar_tabelas()` - Reindexação completa
- `atualizar_estatisticas()` - Atualiza estatísticas do PostgreSQL

## 🔧 Manutenção

### Backup Manual

```bash
postgres\bin\pg_dump.exe -p 5433 -U postgres -Fc -f backup.dump jurisconnect
```

### Restore

```bash
postgres\bin\pg_restore.exe -p 5433 -U postgres -d jurisconnect -c backup.dump
```

### Limpeza de Logs (SQL)

```sql
CALL limpar_logs_auditoria(180);  -- Remove logs com mais de 180 dias
```

### Reindexação (SQL)

```sql
CALL reindexar_tabelas();
```

## ⚠️ Observações Importantes

1. **Porta do PostgreSQL**: O sistema usa a porta **5433** (não a padrão 5432) para evitar conflitos com outras instalações.

2. **Arquivo .env**: O arquivo `src/jurisconnect-backend/.env` já foi atualizado com a porta correta.

3. **Auditoria**: Todas as operações DML (INSERT/UPDATE/DELETE) são automaticamente auditadas na tabela `logs_auditoria`.

4. **Feriados**: A tabela `feriados` já contém os feriados nacionais de 2025. Atualize anualmente.

5. **Google Calendar**: Para usar a integração com Google Calendar, configure as variáveis:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`

## 📞 Troubleshooting

### Erro: "could not bind IPv4 address"
- A porta 5432 já está em uso. O sistema foi configurado para usar a porta 5433.

### Erro: "Cannot find module"
- Execute `npm install` nas pastas raiz, backend e frontend.

### Backend não inicia
- Verifique se o PostgreSQL está rodando: `postgres\bin\pg_isready.exe -p 5433`
- Verifique os logs em: `src/jurisconnect-backend/logs/`

### Frontend não compila
- Limpe o cache: `cd src/jurisconnect-frontend && npm run build`

## 🎯 Próximos Passos

1. ✅ Testar login na aplicação (admin / admin123)
2. ✅ Criar alguns registros de teste
3. ⬜ Configurar backup automático via Task Scheduler
4. ⬜ Empacotar aplicação Electron para distribuição
5. ⬜ Configurar integração com Google Calendar (opcional)

---

**Data do Provisionamento**: 2025-11-25  
**Versão**: 1.0.0
