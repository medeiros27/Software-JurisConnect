## 🔧 Problema Identificado

O app Android não consegue fazer login porque:
1. **Frontend caiu** - Veja o erro do Cloudflare Tunnel: "dial tcp [::1]:5173: connectex: No connection could be made"
2. **App Android usa localhost** - Mas localhost no celular é o próprio celular, não o PC

## ✅ Solução

### 1. Reinicie o Frontend

Execute:
```bash
cd C:\Users\Bruno\Documents\Bruno\Software-JurisConnect\src\jurisconnect-frontend
npm run dev
```

Ou use o script `iniciar-jurisconnect.bat` que criamos.

### 2. Configure o Android para Usar IP do PC

Você precisa criar um arquivo `.env.production` com o IP do seu PC.

**Descubra seu IP:**
```bash
ipconfig
```

Procure por "IPv4" da sua rede WiFi (geralmente algo como `192.168.x.x`)

**Crie o arquivo:**
`src/jurisconnect-frontend/.env.production`
```
VITE_API_URL=http://SEU_IP_AQUI:3001/api/v1
```

Exemplo:
```
VITE_API_URL=http://192.168.15.3:3001/api/v1
```

### 3. Rebuild o APK

```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### 4. Teste

- Certifique-se que o **celular está na mesma rede WiFi** que o PC
- Backend precisa estar rodando
- Instale o novo APK e teste o login

---

**Nota:** Se quiser que funcione em qualquer lugar, use o domínio público:
```
VITE_API_URL=https://SEU_DOMINIO_BACKEND/api/v1
```

Mas para isso você precisa expor o backend também via Cloudflare Tunnel na porta 3001.
