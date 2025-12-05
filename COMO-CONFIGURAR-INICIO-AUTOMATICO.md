# Como Configurar Início Automático do JurisConnect

## 📋 Opção 1: Pasta de Inicialização (Mais Simples)

1. **Pressione** `Win + R`
2. **Digite**: `shell:startup` e pressione Enter
3. **Crie um atalho** do arquivo `iniciar-jurisconnect.bat` nesta pasta
   - Clique com botão direito → Novo → Atalho
   - Navegue até: `C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\iniciar-jurisconnect.bat`
   - Clique em Avançar → Concluir

**Pronto!** Na próxima vez que você ligar o PC, o JurisConnect vai iniciar automaticamente.

---

## 📋 Opção 2: Agendador de Tarefas (Mais Controle)

### Criar Tarefa

1. **Pressione** `Win + R`
2. **Digite**: `taskschd.msc` e pressione Enter
3. No painel direito, clique em **Criar Tarefa Básica...**

### Configurar Tarefa

**Geral:**
- Nome: `JurisConnect Startup`
- Descrição: `Inicia Backend, Frontend e Tunnel do JurisConnect`
- ✅ Marque: "Executar com privilégios mais altos"

**Disparadores:**
1. Clique em **Nova**
2. Iniciar a tarefa: **Ao fazer logon**
3. Configurações avançadas: **Atrasar tarefa por:** `30 segundos` (para garantir que a rede está pronta)
4. OK

**Ações:**
1. Clique em **Nova**
2. Ação: **Iniciar um programa**
3. Programa/script: `C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\iniciar-jurisconnect.bat`
4. OK

**Condições:**
- ❌ Desmarque: "Iniciar a tarefa apenas se o computador estiver conectado à energia CA"

**Configurações:**
- ✅ Marque: "Permitir que a tarefa seja executada sob demanda"
- ✅ Marque: "Executar tarefa assim que possível após uma inicialização agendada ter sido perdida"

### Salvar
- Clique em **OK**
- Digite sua senha de administrador se solicitado

---

## 🛑 Como Parar os Serviços

Se precisar parar todos os serviços manualmente:

```batch
# Parar Node.js (Backend e Frontend)
taskkill /F /IM node.exe

# Parar Cloudflared
taskkill /F /IM cloudflared.exe
```

Ou crie um arquivo `parar-jurisconnect.bat`:

---

## 📝 Notas Importantes

- **Aguarde 10-15 segundos** após o login para todos os serviços subirem
- **Backend inicia primeiro** (porta 3001)
- **Frontend inicia depois** (porta 5173) 
- **Tunnel inicia por último** e conecta ao Cloudflare
- Todas as janelas ficam minimizadas, mas você pode maximizá-las se precisar ver os logs

---

## ✅ Teste Manual

Antes de configurar o início automático, teste o script manualmente:

1. Dê duplo clique em `iniciar-jurisconnect.bat`
2. Aguarde todas as janelas abrirem
3. Acesse: `https://app.jurisconnect.com.br`
4. Verifique se está funcionando

Se funcionar corretamente, pode configurar o início automático!
