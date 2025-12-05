# 📥 Instalação do k6 - JurisConnect

## ⚠️ Instalação Requer Permissões de Administrador

O k6 não pôde ser instalado automaticamente porque requer permissões de administrador.

## 🔧 Opções de Instalação

### Opção 1: Download Direto (Recomendado)

1. **Baixar k6 para Windows:**
   - Acesse: https://github.com/grafana/k6/releases/latest
   - Baixe: `k6-v0.48.0-windows-amd64.zip` (ou versão mais recente)

2. **Extrair e configurar:**
   ```powershell
   # Criar diretório
   mkdir C:\k6
   
   # Extrair o arquivo baixado para C:\k6
   # Você terá o executável: C:\k6\k6.exe
   ```

3. **Adicionar ao PATH:**
   ```powershell
   # Abrir PowerShell como Administrador e executar:
   [Environment]::SetEnvironmentVariable(
       "Path",
       [Environment]::GetEnvironmentVariable("Path", "Machine") + ";C:\k6",
       "Machine"
   )
   ```

4. **Verificar instalação:**
   ```powershell
   # Fechar e reabrir PowerShell
   k6 version
   ```

### Opção 2: Chocolatey (Requer Admin)

```powershell
# Abrir PowerShell como Administrador
choco install k6 -y
```

### Opção 3: Scoop (Sem Admin)

```powershell
# Instalar Scoop (se não tiver)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar k6
scoop install k6
```

### Opção 4: Winget (Windows 11)

```powershell
winget install k6
```

## ✅ Verificar Instalação

Após instalar, execute:

```powershell
k6 version
```

Você deve ver algo como:
```
k6 v0.48.0 (2023-11-29T10:33:35+0000/v0.48.0-0-gbc0a5e1e, go1.21.4, windows/amd64)
```

## 🚀 Executar Testes

Após instalar o k6:

```powershell
cd tests\performance

# Executar teste de carga
k6 run load-test.js

# Ou usar o script interativo
.\run-tests.bat
```

## 🐛 Troubleshooting

### Erro: "k6 não é reconhecido"

**Solução 1:** Adicionar ao PATH manualmente
1. Pressione `Win + R`
2. Digite `sysdm.cpl` e pressione Enter
3. Vá para "Avançado" → "Variáveis de Ambiente"
4. Em "Variáveis do sistema", edite "Path"
5. Adicione `C:\k6` (ou onde extraiu o k6)
6. Clique OK e reinicie o PowerShell

**Solução 2:** Usar caminho completo
```powershell
C:\k6\k6.exe run load-test.js
```

### Erro: "Acesso negado"

Execute o PowerShell como **Administrador**.

### Erro: "Execution Policy"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Próximos Passos

Após instalar o k6:

1. ✅ Verificar instalação: `k6 version`
2. ✅ Navegar para testes: `cd tests\performance`
3. ✅ Executar primeiro teste: `k6 run load-test.js`
4. ✅ Ver resultados no console

---

**Precisa de ajuda?** Consulte a [documentação oficial do k6](https://k6.io/docs/get-started/installation/)
