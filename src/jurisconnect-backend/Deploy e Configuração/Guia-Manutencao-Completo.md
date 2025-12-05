# JURISCONNECT - GUIA COMPLETO DE MANUTENÇÃO E ATUALIZAÇÃO

## 📋 ÍNDICE

1. [Manutenção Preventiva](#1-manutenção-preventiva)
2. [Monitoramento da Saúde](#2-monitoramento-da-saúde)
3. [Limpeza e Otimização](#3-limpeza-e-otimização)
4. [Atualização de Software](#4-atualização-de-software)
5. [Troubleshooting Comum](#5-troubleshooting-comum)
6. [Checklist de Rotina](#6-checklist-de-rotina)
7. [Contato e Suporte](#7-contato-e-suporte)

---

# 1. MANUTENÇÃO PREVENTIVA

## 1.1 O Que é Manutenção Preventiva?

Manutenção preventiva significa cuidar do JurisConnect **regularmente** para evitar problemas. Assim como você faz manutenção no carro, você deve fazer no software.

### Benefícios:

✅ **Previne Falhas** - Evita travamentos inesperados
✅ **Melhora Performance** - Aplicação mais rápida
✅ **Protege Dados** - Backups regulares
✅ **Reduz Custos** - Evita perda de dados
✅ **Aumenta Vida Útil** - Computador dura mais

## 1.2 Tarefas Mensais (1x ao mês)

### 📅 Primeiro dia do mês - Limpeza Profunda

**Tempo necessário**: 30 minutos

1. **Fazer Backup Completo**
   - Abrir JurisConnect
   - Menu: **Banco de Dados** > **Backup na Nuvem**
   - Clique: "💾 Fazer Backup Agora"
   - Aguarde conclusão (ver barra de progresso)
   - Confirme: Mensagem "Backup realizado com sucesso"

2. **Otimizar Banco de Dados**
   - Menu: **Banco de Dados** > **Status do Banco**
   - Se "Registros Mortos" > 1000:
     - Clique: "Otimizar Banco"
     - Aguarde 5-10 minutos
   - Confirme: "Otimização concluída"

3. **Verificar Espaço em Disco**
   - Abrir: Windows Explorer
   - Clique direito em: C:\ (ou unidade instalação)
   - Selecione: "Propriedades"
   - Ver: Espaço livre (deve ser >10% do total)
   - Se <10%: Limpar downloads/arquivos antigos

4. **Revisar Backups Antigos**
   - Menu: **Banco de Dados** > **Backup na Nuvem**
   - Verificar: "Backups Locais"
   - Se >5 backups locais antigos:
     - Deletar backups com >3 meses

## 1.3 Tarefas Semanais (1x por semana)

### 📅 Toda sexta-feira - Verificação Rápida

**Tempo necessário**: 5 minutos

```
[ ] 1. Abrir JurisConnect
[ ] 2. Menu: Banco de Dados > Status do Banco
[ ] 3. Anotar "Registros Mortos"
[ ] 4. Se > 2000: Agendar otimização para próxima semana
[ ] 5. Fechar aplicação normalmente
```

## 1.4 Tarefas Diárias (Automáticas)

✅ **Backup Automático** - Nightly 22:00
✅ **Sincronização** - Nightly 23:00
✅ **Limpeza de Logs** - Nightly 02:00

**Você não precisa fazer nada!** O JurisConnect faz automaticamente.

---

# 2. MONITORAMENTO DA SAÚDE

## 2.1 Onde Verificar a Saúde

### Via Menu (Recomendado)

```
JurisConnect > Menu > Banco de Dados > Status do Banco
```

**Mostra:**
- ✅ Conexão com banco
- 📊 Número de tabelas
- 📝 Número de registros
- 💾 Tamanho total
- 🧹 Registros mortos (lixo)
- ⏱️ Última otimização

### Via Dashboard (Informações Detalhadas)

```
JurisConnect > Menu > Ferramentas > Health Check
```

**Mostra:**
- 🟢 Status da conexão
- 🔌 Conexões ativas
- 💻 Cache hit ratio
- 🔒 Locks ativas
- 📈 Query lentas
- 💾 Espaço utilizado

## 2.2 Indicadores de Saúde

### 🟢 VERDE - Tudo OK

```
Cache Hit Ratio: > 99%
Registros Mortos: < 1000
Queries Lentas: 0
Conexões Ativas: < 10
```

**Ação**: Nenhuma. Continue com rotina normal.

### 🟡 AMARELO - Atenção Necessária

```
Cache Hit Ratio: 90-99%
Registros Mortos: 1000-5000
Queries Lentas: 1-5
Conexões Ativas: 10-30
```

**Ação**: 
1. Fazer backup agora
2. Agendar otimização para hoje à noite
3. Monitorar próximas horas
4. Se persistir: Contatar suporte

### 🔴 VERMELHO - Ação Urgente

```
Cache Hit Ratio: < 90%
Registros Mortos: > 5000
Queries Lentas: > 5
Conexões Ativas: > 30
Espaço livre: < 5%
```

**Ação IMEDIATA**:
1. Fazer backup AGORA
2. Fechar outros programas
3. Executar: Menu > Banco de Dados > Otimizar Banco
4. Se problema persistir: CONTACTAR SUPORTE URGENTE
5. **NÃO desligar computador durante otimização**

## 2.3 O Que Significam os Números

### Cache Hit Ratio (Proporção de Cache)

```
O que é: Porcentagem de dados lidos do cache vs disco

Ideal:   > 99% (muito rápido)
Bom:     90-99% (rápido)
Alerta:  80-90% (começando a ficar lento)
Crítico: < 80% (muito lento)

Como melhorar:
- Aumentar RAM do computador
- Remover programas desnecessários
- Otimizar banco de dados
```

### Registros Mortos (Dead Tuples)

```
O que é: Dados deletados mas ainda ocupando espaço

Ideal:   < 500 (limpo)
Bom:     500-1000 (normal)
Alerta:  1000-5000 (deve otimizar)
Crítico: > 5000 (DEVE otimizar AGORA)

Como melhorar:
- Executar: Banco de Dados > Otimizar Banco
- Fazer mensal
```

### Queries Lentas

```
O que é: Consultas demorando mais de X segundos

Ideal:   0 queries lentas
Alerta:  1-5 queries lentas
Crítico: > 5 queries lentas

Como melhorar:
- Verificar filtros no relatório
- Usar períodos menores
- Otimizar banco
```

---

# 3. LIMPEZA E OTIMIZAÇÃO

## 3.1 Limpeza Manual (Mensal Recomendado)

### Passo 1: Fazer Backup de Segurança

```
Menu > Banco de Dados > Backup na Nuvem > Fazer Backup Agora
⏱️ Tempo: 5-10 minutos
```

### Passo 2: Otimizar Banco de Dados

```
Menu > Banco de Dados > Status do Banco > Otimizar Banco
⏱️ Tempo: 5-20 minutos (depende do tamanho)
```

**O que acontece:**
- Remove lixo (registros deletados)
- Reorganiza índices
- Atualiza estatísticas
- Melhora performance

### Passo 3: Liberar Espaço em Disco

```
Windows > Painel de Controle > Sistema > Armazenamento
⏱️ Tempo: Varia
```

**Como fazer:**
1. Abrir: Windows Explorer
2. Clique direito em: C:\ (ou unidade)
3. Selecione: "Limpar disco"
4. Marcar: Arquivos Temporários, Lixeira
5. Clique: "Limpar arquivos do sistema"

### Passo 4: Limpar Cache de Navegador (se necessário)

```
JurisConnect > Menu > Arquivo > Limpar Cache
⏱️ Tempo: 1 minuto
```

**Isso remove:**
- Cache de navegação
- Cookies temporários
- Arquivos temporários da web

## 3.2 Agenda de Limpeza

```
📅 SEMANA 1: Verificação rápida (5 min)
   - Status do banco
   - Verificar espaço disco

📅 SEMANA 2: Limpeza leve (10 min)
   - Limpar cache
   - Revisar backups

📅 SEMANA 3: Verificação rápida (5 min)
   - Status do banco
   - Revisar alertas

📅 SEMANA 4: LIMPEZA PROFUNDA (30 min)
   - Backup completo
   - Otimizar banco
   - Liberar espaço
   - Limpar downloads antigos
```

---

# 4. ATUALIZAÇÃO DE SOFTWARE

## 4.1 Tipos de Atualizações

### 🔵 Atualizações de Segurança (CRÍTICA)

```
⚠️  PRIORIDADE: MÁXIMA
⏱️  Quando: Assim que notificado
💾 Tamanho: 50-150 MB
```

**Incluem:**
- Correções de vulnerabilidades
- Patches de segurança
- Proteção contra hacks

**Ação**: Instalar IMEDIATAMENTE

### 🟢 Atualizações de Recursos (Recomendada)

```
⏱️  Quando: Próximas 2-4 semanas
💾 Tamanho: 100-300 MB
```

**Incluem:**
- Novas funcionalidades
- Melhorias de interface
- Novos relatórios

**Ação**: Instalar em breve

### 🟡 Atualizações Menores (Opcional)

```
⏱️  Quando: A seu critério
💾 Tamanho: 20-100 MB
```

**Incluem:**
- Ajustes de performance
- Melhorias UI/UX
- Correções menores

**Ação**: Instalar quando conveniente

## 4.2 Como Atualizar - Método 1: Automático

### Mais Fácil! ✅

```
1. JurisConnect > Menu > Ajuda > Verificar Atualizações
2. Se houver atualização:
   - Clique: "Atualizar Agora"
3. Aguarde o download
4. Clique: "Instalar"
5. Aplicação será reiniciada
6. Pronto!
```

## 4.3 Como Atualizar - Método 2: Manual

### Se automático falhar

```
1. Abrir: https://jurisconnect.com.br/download
2. Clique: "Baixar Versão Mais Recente"
3. Execute o instalador
4. Clique: "Próximo >" várias vezes
5. Na pergunta "Instalar em...":
   - SELECIONE: Mesma pasta anterior
   - MARQUE: ✅ Atualizar existente
6. Clique: "Instalar"
7. Aguarde conclusão
8. Clique: "Concluir"
```

**⚠️ IMPORTANTE**: O instalador detectará versão anterior e perguntará se deseja atualizar. **DIGA SIM!**

## 4.4 O Que Fazer Antes de Atualizar

### Checklist Pré-Atualização

```
[ ] 1. Fazer backup (Menu > Banco de Dados > Backup na Nuvem)
[ ] 2. Fechar todos os relatórios abertos
[ ] 3. Desconectar outros usuários (se usar compartilhado)
[ ] 4. Ter bastante espaço livre (>1GB)
[ ] 5. Conexão internet estável
[ ] 6. Fechar outros programas pesados (Chrome, etc)
```

## 4.5 O Que Fazer Depois de Atualizar

### Checklist Pós-Atualização

```
[ ] 1. Aguardar aplicação carregar completamente (1-2 min)
[ ] 2. Menu > Banco de Dados > Status do Banco
[ ] 3. Verificar se "Conexão: OK"
[ ] 4. Tentar acessar 1-2 demandas
[ ] 5. Se OK: Tudo funcionando normalmente
[ ] 6. Se ERRO: Ver seção Troubleshooting
```

## 4.6 Rollback (Voltar Versão Anterior)

### Se algo der errado

```
1. PARAR: Feche JurisConnect completamente
2. RESTAURAR: Menu > Banco de Dados > Backup na Nuvem
3. SELECIONAR: Backup anterior (antes da atualização)
4. CONFIRMAR: "Deseja restaurar este backup?"
5. AGUARDAR: Até "Restore concluído com sucesso"
6. REINICIAR: Aplicação será reiniciada
7. PRONTO: Voltou para versão anterior
```

---

# 5. TROUBLESHOOTING COMUM

## 5.1 Problemas de Inicialização

### ❌ "Erro: Não consegue conectar ao banco de dados"

**Possíveis causas:**
1. PostgreSQL não iniciou
2. Porta 5432 ocupada
3. Dados corrompidos

**Soluções:**

```
Opção 1: Reiniciar (Frequentemente resolve)
1. Feche JurisConnect completamente
2. Aguarde 30 segundos
3. Abra novamente
4. Se ainda der erro: Prossiga para Opção 2

Opção 2: Reiniciar Computador
1. Salve todas as coisas abertas
2. Reinicie o computador
3. Aguarde boot completar (2-3 min)
4. Abra JurisConnect novamente
5. Se ainda der erro: Prossiga para Opção 3

Opção 3: Verificar Porta
1. Abrir: PowerShell (Pesquisar "PowerShell", clicar direito "Executar como admin")
2. Digitar: netstat -ano | findstr :5432
3. Se retornar algo: Há outro processo usando porta
4. Opção A: Reiniciar computador (mais seguro)
5. Opção B: Contactar suporte com o resultado
```

### ❌ "Erro: Arquivo de configuração não encontrado"

**Possível causa:** Arquivos de dados corrompidos ou deletados

**Solução:**

```
1. Menu > Banco de Dados > Restaurar Backup
2. Selecione backup mais recente
3. Clique: "Restaurar"
4. Confirme: "Deseja restaurar este backup?"
5. Aguarde conclusão
6. Aplicação será reiniciada
7. Se funcionar: Problema resolvido!
```

## 5.2 Problemas de Performance

### ⚠️ "A aplicação está lenta"

**Prognóstico:**
- Banco precisa de otimização
- Disco lotado
- RAM insuficiente
- Outro programa competindo recursos

**Solução Imediata (5 min):**

```
1. Feche outros programas (Chrome, Spotify, etc)
2. Menu > Banco de Dados > Status do Banco
3. Veja "Registros Mortos"
4. Se > 1000:
   - Clique: "Otimizar Banco"
   - Aguarde 10 minutos
5. Teste performance novamente
```

**Se ainda lento:**

```
1. Abrir: Task Manager (Ctrl+Shift+Esc)
2. Clique: Aba "Performance"
3. Verificar "Memória" - Deve ter >50% livre
4. Se <50% livre:
   - Feche mais programas
   - Reinicie computador
```

### ⚠️ "Relatórios demoram muito"

**Possíveis causas:**
1. Período muito longo (ex: 1 ano inteiro)
2. Muitas demandas
3. Banco desotimizado

**Soluções:**

```
Opção 1: Reduzir Período (Mais rápido)
- Em vez de "Todos os tempos"
- Usar "Últimos 3 meses"
- Usar "Este mês"

Opção 2: Filtrar Dados
- Deixar em branco campos desnecessários
- Usar filtros específicos
- Excluir demandas encerradas antigas

Opção 3: Otimizar Banco
- Menu > Banco de Dados > Otimizar Banco
- Aguarde conclusão
- Tente relatório novamente
```

## 5.3 Problemas de Sincronização

### ⚠️ "Google Drive: Erro de sincronização"

**Possível causa:** Conexão internet instável

**Solução:**

```
1. Verificar conexão internet (abrir navegador)
2. Menu > Banco de Dados > Backup na Nuvem
3. Clique: "🔄 Atualizar Status"
4. Se erro persiste:
   - Desconectar (Menu > Logout)
   - Conectar novamente (Login)
   - Tentar backup manualmente
```

### ⚠️ "Google Drive: Espaço cheio"

**Possível causa:** 30 backups na nuvem (limite)

**Solução:**

```
1. Menu > Banco de Dados > Backup na Nuvem
2. Ver: "Backups na Nuvem"
3. Deletar backups com >3 meses
4. Tentar fazer novo backup
```

## 5.4 Problemas de Dados

### ⚠️ "Perdi dados após fechar programa"

**Possível causa:** Dados não foram salvos

**Informação importante:**
- JurisConnect SALVA AUTOMATICAMENTE
- Não há botão "Salvar"
- Mudanças são persistidas ao digitar

**Recuperação:**

```
1. Menu > Banco de Dados > Restaurar Backup
2. Selecione backup anterior
3. Clique: "Restaurar"
4. Confirme
5. Dados voltam para antes da perda
```

### ⚠️ "Vi erro mas não anotei qual foi"

**Solução:**

```
1. Menu > Ferramentas > Ver Logs
2. Procure por mensagens de erro
3. Copie o erro
4. Envie para suporte (suporte@jurisconnect.com.br)
5. Será resolvido em até 24 horas
```

---

# 6. CHECKLIST DE ROTINA

## 6.1 Checklist Mensal (1x/mês - 1º dia)

```
BACKUP & SEGURANÇA
[ ] Fazer backup completo na nuvem
[ ] Verificar se último backup foi bem-sucedido
[ ] Verificar espaço na nuvem (deve ter >10GB livre)

PERFORMANCE
[ ] Verificar Status do Banco
[ ] Se "Registros Mortos" > 1000: Otimizar
[ ] Verificar Cache Hit Ratio (deve ser >99%)

DISCO
[ ] Verificar espaço em disco (deve ter >10% livre)
[ ] Se <10%: Limpar downloads/temporários
[ ] Deletar backups locais com >3 meses

DADOS
[ ] Revisar relatórios críticos
[ ] Verificar se todas demandas carregam
[ ] Testar export de dados para Excel

ATUALIZAÇÃO
[ ] Menu > Ajuda > Verificar Atualizações
[ ] Se houver: Fazer backup ANTES
[ ] Instalar atualização
[ ] Testar aplicação após
```

## 6.2 Checklist Semanal (Toda sexta-feira)

```
RÁPIDO (5 minutos)
[ ] Abrir JurisConnect
[ ] Menu > Banco de Dados > Status do Banco
[ ] Ver "Registros Mortos"
[ ] Se > 2000: Agendar otimização para próxima semana
[ ] Fechar aplicação normalmente
```

## 6.3 Checklist Diário (Recomendado)

```
MUITO RÁPIDO (1 minuto)
[ ] Abrir JurisConnect
[ ] Verificar se abre normalmente
[ ] Se houver erro: Notar qual é
[ ] Se estiver OK: Pronto para usar
```

---

# 7. CONTATO E SUPORTE

## 7.1 Como Obter Ajuda

### 📧 Email (Resposta em até 24h)

```
suporte@jurisconnect.com.br

Inclua:
- Seu nome e empresa
- Versão do JurisConnect (Menu > Ajuda > Sobre)
- O que estava fazendo quando erro ocorreu
- Mensagem de erro exata
- Já tentou algo? O quê?
- Prints ou logs do erro
```

### 📞 WhatsApp (Resposta em até 4h)

```
+55 (11) 9999-9999

Use para:
✅ Problemas urgentes
✅ Dúvidas rápidas
✅ Agendamento com técnico
```

### 🌐 Portal Online (Auto-atendimento)

```
https://suporte.jurisconnect.com.br

Oferece:
✅ Base de conhecimento (FAQ)
✅ Vídeo tutoriais
✅ Downloads
✅ Abrir chamado
✅ Acompanhar status
```

### 📞 Telefone (Horário comercial)

```
(11) 3333-3333

Horário: Segunda a Sexta
        08:00 - 18:00

Use para:
✅ Suporte técnico
✅ Renovação de licença
✅ Consultoria
```

## 7.2 O Que Levar Quando Contatar

### Informações Importantes

```
1. VERSÃO
   Menu > Ajuda > Sobre
   Anotar: v1.0.0

2. SISTEMA
   Windows > Configurações > Sistema > Sobre
   Anotar: Windows 10/11, RAM, Processador

3. ERRO
   Mensagem de erro exata (copiar/colar)
   Quando ocorre (sempre? esporadicamente?)
   Já tentou algo?

4. DADOS
   Se problema envolve dados específicos:
   - Número da demanda
   - Data do registro
   - Outro identificador

5. LOG
   Menu > Ferramentas > Exportar Log
   Anexar arquivo .log no email
```

## 7.3 Matriz de Suporte

```
PROBLEMA           TEMPO      CANAL
====================================
Erro crítico       1 hora     Telefone/WhatsApp
Lentidão app       4 horas    WhatsApp/Email
Dúvida funcional   24 horas   Email/Portal
Feature request    5 dias     Portal

DISPONIBILIDADE:
- Seg-Sex: 08:00-18:00 (horário comercial)
- Sábado: 09:00-13:00 (suporte básico)
- Domingo: Sem suporte (emergências via WhatsApp)
- Feriados: Suporte básico via email
```

## 7.4 FAQ Rápido

### ❓ Como reiniciar o PostgreSQL?

```
Resposta: Feche JurisConnect, aguarde 30s, abra novamente
```

### ❓ Perdi minha senha

```
Resposta: Menu > Login > Esqueci Minha Senha
Siga emails para reset
```

### ❓ Como fazer export?

```
Resposta: Relatório > Botão de 3 pontos (...) > Exportar
Escolha: Excel, PDF, CSV
```

### ❓ Posso usar em 2 computadores?

```
Resposta: Sim! Sincronizam via nuvem automaticamente
```

### ❓ E se der erro na atualização?

```
Resposta: Restaurar backup anterior + contatar suporte
```

---

## 📚 RESUMO FINAL

| Tarefa | Frequência | Tempo | Prioridade |
|--------|-----------|-------|-----------|
| Backup automático | Diário (22:00) | Auto | 🔴 Crítica |
| Verificar status | Semanal | 5 min | 🟡 Alta |
| Otimizar banco | Mensal | 20 min | 🟡 Alta |
| Limpar disco | Mensal | 10 min | 🟢 Média |
| Atualizar app | Conforme | 15 min | 🟢 Média |

---

## ✅ VOCÊ ESTÁ PRONTO!

Parabéns! Agora você sabe como:

✅ Manter JurisConnect saudável
✅ Resolver problemas comuns
✅ Fazer backups regularmente
✅ Atualizar o software
✅ Obter suporte quando necessário

**Dúvidas?** Contacte: suporte@jurisconnect.com.br

**Bom uso! 🎉**