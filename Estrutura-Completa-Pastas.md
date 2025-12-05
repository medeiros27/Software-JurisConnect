# 🏗️ ESTRUTURA COMPLETA DE PASTAS - JurisConnect

**Crie essa estrutura AGORA no seu projeto**

---

## 📁 ESTRUTURA EXATA QUE VOCÊ PRECISA

```
software-jurisconnect/
│
├── 📄 package.json ........................ (ARQUIVO PRINCIPAL)
├── 📄 package-lock.json
├── 📄 vite.config.js ..................... (Config Vite)
├── 📄 tailwind.config.js ................. (Config Tailwind)
├── 📄 postcss.config.js .................. (Config PostCSS)
├── 📄 .env.example
├── 📄 .gitignore
├── 📄 README.md
│
├── 📁 node_modules/ ...................... (Instalado via npm)
│
├── 📁 public/
│   ├── icon.png
│   ├── electron.js ....................... (Main Process)
│   └── preload.js ........................ (Segurança)
│
├── 📁 src/
│   ├── 📁 main/
│   │   ├── main.js ....................... (Electron Main)
│   │   ├── preload.js .................... (Segurança)
│   │   └── 📁 ipc/
│   │       ├── handlers.js
│   │       └── channels.js
│   │
│   ├── 📁 frontend/
│   │   ├── 📄 App.jsx .................... (Root Component)
│   │   ├── 📄 main.jsx ................... (Entry Point React)
│   │   ├── 📄 index.html ................. (HTML Base)
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 shared/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── index.js ............. (Export tudo)
│   │   │   │
│   │   │   ├── 📁 auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── 📁 modules/
│   │   │       ├── 📁 Correspondentes/
│   │   │       │   ├── CorrespondentesList.jsx
│   │   │       │   ├── CorrespondenteForm.jsx
│   │   │       │   ├── CorrespondenteModal.jsx
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── 📁 Clientes/
│   │   │       │   ├── ClientesList.jsx
│   │   │       │   ├── ClienteForm.jsx
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── 📁 Demandas/
│   │   │       │   ├── DemandasList.jsx
│   │   │       │   ├── DemandasForm.jsx
│   │   │       │   ├── DemandasDetails.jsx
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── 📁 Pagamentos/
│   │   │       │   ├── PagamentosList.jsx
│   │   │       │   ├── PagamentosForm.jsx
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── 📁 Agenda/
│   │   │       │   ├── AgendaCalendar.jsx
│   │   │       │   ├── AgendaForm.jsx
│   │   │       │   └── index.js
│   │   │       │
│   │   │       ├── 📁 Diligencias/
│   │   │       │   ├── DiligenciasList.jsx
│   │   │       │   ├── DiligenciasForm.jsx
│   │   │       │   └── index.js
│   │   │       │
│   │   │       └── 📁 Relatorios/
│   │   │           ├── Dashboard.jsx
│   │   │           ├── RelatorioPDF.jsx
│   │   │           └── index.js
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Unauthorized.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── 📁 hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   ├── useForm.js
│   │   │   ├── usePagination.js
│   │   │   ├── useNotification.js
│   │   │   └── index.js
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── api.js ................... (Axios instance)
│   │   │   ├── auth.js ................. (Login/Token)
│   │   │   ├── storage.js .............. (LocalStorage)
│   │   │   ├── correspondentes.js ....... (CRUD)
│   │   │   ├── clientes.js ............. (CRUD)
│   │   │   ├── demandas.js ............. (CRUD)
│   │   │   └── index.js
│   │   │
│   │   ├── 📁 store/
│   │   │   ├── authStore.js ............ (Zustand)
│   │   │   ├── demandaStore.js
│   │   │   ├── uiStore.js
│   │   │   └── index.js
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── constants.js ............ (Enums, constantes)
│   │   │   ├── validators.js ........... (Validação)
│   │   │   ├── formatters.js ........... (Formato data, moeda)
│   │   │   ├── api-errors.js ........... (Tratamento erros)
│   │   │   └── index.js
│   │   │
│   │   └── 📁 styles/
│   │       ├── globals.css
│   │       ├── tailwind.css
│   │       ├── variables.css
│   │       └── animations.css
│   │
│   └── 📁 backend/ (SEPARADO - será Node.js/Express)
│       └── (Desenvolver depois)
│
├── 📁 dist/ ............................ (Gerado ao build)
│
├── 📁 .github/
│   └── workflows/ ...................... (CI/CD depois)
│
└── 📁 docs/
    ├── CONTRIBUTING.md
    ├── SETUP.md
    └── API.md
```

---

## 🚀 PASSO 1: CRIAR PASTAS PRINCIPAIS

Execute no **PowerShell** na pasta `software-jurisconnect`:

```bash
# Criar estrutura principal
mkdir src
mkdir src\main
mkdir src\main\ipc
mkdir src\frontend
mkdir src\backend

# Criar pastas do frontend
mkdir src\frontend\components
mkdir src\frontend\components\shared
mkdir src\frontend\components\auth
mkdir src\frontend\components\modules

# Criar módulos
mkdir src\frontend\components\modules\Correspondentes
mkdir src\frontend\components\modules\Clientes
mkdir src\frontend\components\modules\Demandas
mkdir src\frontend\components\modules\Pagamentos
mkdir src\frontend\components\modules\Agenda
mkdir src\frontend\components\modules\Diligencias
mkdir src\frontend\components\modules\Relatorios

# Criar outras pastas
mkdir src\frontend\pages
mkdir src\frontend\hooks
mkdir src\frontend\services
mkdir src\frontend\store
mkdir src\frontend\utils
mkdir src\frontend\styles

# Criar pastas públicas e docs
mkdir public
mkdir docs
mkdir .github
mkdir .github\workflows
```

---

## 📝 PASSO 2: CRIAR ARQUIVOS BÁSICOS

### 2.1 Criar `src/frontend/index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>JurisConnect</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/frontend/main.jsx"></script>
  </body>
</html>
```

### 2.2 Criar `src/frontend/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2.3 Criar `src/frontend/App.jsx`

```jsx
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>JurisConnect - Em Desenvolvimento</h1>
      </div>
    </BrowserRouter>
  )
}
```

### 2.4 Criar `vite.config.js` na RAIZ

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/frontend'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
```

### 2.5 Criar `tailwind.config.js` na RAIZ

```javascript
module.exports = {
  content: ["./src/frontend/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#0084ff',
          600: '#0066ff',
          700: '#004dd9',
        },
      },
    },
  },
  plugins: [],
}
```

### 2.6 Criar `postcss.config.js` na RAIZ

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2.7 Criar `src/frontend/styles/tailwind.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.8 Criar `src/frontend/styles/globals.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
  color: #111827;
}
```

### 2.9 Criar `.env.example` na RAIZ

```env
# API
VITE_API_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=30000

# Autenticação
VITE_AUTH_TOKEN_KEY=jc_auth_token
VITE_AUTH_REFRESH_KEY=jc_refresh_token

# Aplicação
VITE_APP_VERSION=1.0.0
VITE_ENV=development
```

### 2.10 Criar `.gitignore` na RAIZ

```
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build
dist/
build/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Electron
/out
```

---

## ✅ PASSO 3: VERIFICAR ESTRUTURA

Abra o **VS Code** e procure por:

```
✅ Tem src/
✅ Tem src/frontend/
✅ Tem src/frontend/components/shared/
✅ Tem src/frontend/index.html
✅ Tem vite.config.js na raiz
✅ Tem package.json com scripts atualizados
```

Se tiver tudo, execute:

```bash
npm install
npm run dev
```

Deve abrir em `http://localhost:5173` com sua app React funcionando!

---

## 🎯 PRÓXIMA ETAPA

Copie os componentes de `Componentes-Principais.md` para:

- `src/frontend/components/shared/Button.jsx`
- `src/frontend/components/shared/Input.jsx`
- `src/frontend/components/shared/Select.jsx`
- etc...

Depois copie as páginas de `Modulos-Negocio.md`.

---

## 📋 CHECKLIST

- [ ] Criei pasta `src/`
- [ ] Criei `src/frontend/`, `src/main/`, etc
- [ ] Criei `index.html`
- [ ] Criei `main.jsx`
- [ ] Criei `App.jsx`
- [ ] Criei `vite.config.js`
- [ ] Criei `tailwind.config.js`
- [ ] Criei `.env.example`
- [ ] Executei `npm install`
- [ ] Testei com `npm run dev` ✅

---

**Agora está pronto para começar a copiar componentes! 🚀**
