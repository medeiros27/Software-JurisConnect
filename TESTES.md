# 🧪 Guia Completo de Testes - JurisConnect

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Testes Unitários](#testes-unitários)
4. [Testes de Integração](#testes-de-integração)
5. [Testes E2E](#testes-e2e)
6. [Testes de Performance](#testes-de-performance)
7. [Testes de Segurança](#testes-de-segurança)
8. [CI/CD](#cicd)
9. [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

### Cobertura de Testes

| Tipo | Framework | Cobertura Mínima | Localização |
|------|-----------|------------------|-------------|
| Unitários | Jest | 80% | `src/jurisconnect-backend/tests/unit/` |
| Integração | Jest + Supertest | 70% | `src/jurisconnect-backend/tests/integration/` |
| E2E | Playwright | Fluxos críticos | `tests/e2e/specs/` |
| Performance | k6 | - | `tests/performance/` |
| Segurança | OWASP ZAP | - | `tests/security/` |

### Métricas de Qualidade

- **Cobertura de código**: Mínimo 80%
- **Tempo de execução**: Máximo 5 minutos (unitários + integração)
- **Taxa de sucesso**: Mínimo 95%
- **Flakiness**: Máximo 2%

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
# Backend (Jest + Supertest)
cd src/jurisconnect-backend
npm install --save-dev jest supertest @types/jest

# E2E (Playwright)
cd tests/e2e
npm install
npx playwright install
```

### 2. Configurar Banco de Dados de Teste

```bash
# Criar banco de teste
psql -U postgres -p 5433 -c "CREATE DATABASE jurisconnect_test;"

# Aplicar migrations
cd src/jurisconnect-backend
NODE_ENV=test npm run migrate
```

### 3. Variáveis de Ambiente

Criar `.env.test` no backend:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5433
DB_NAME=jurisconnect_test
DB_USER=postgres
DB_PASSWORD=
JWT_SECRET=test_secret_key
```

## 🧪 Testes Unitários

### Executar

```bash
cd src/jurisconnect-backend

# Todos os testes
npm test

# Com watch mode
npm run test:watch

# Com cobertura
npm run test -- --coverage

# Teste específico
npm test -- HealthController.test.js
```

### Estrutura

```
tests/
├── unit/
│   ├── controllers/
│   │   ├── HealthController.test.js
│   │   ├── AuthController.test.js
│   │   └── DemandaController.test.js
│   ├── services/
│   │   ├── PdfService.test.js
│   │   └── EmailService.test.js
│   └── utils/
│       ├── validators.test.js
│       └── formatters.test.js
├── helpers.js
└── setup.js
```

### Exemplo de Teste Unitário

```javascript
const { mockRequest, mockResponse } = require('../helpers');
const Controller = require('../../src/controllers/MyController');

describe('MyController', () => {
  describe('myMethod', () => {
    it('deve retornar sucesso com dados válidos', async () => {
      const req = mockRequest({ body: { name: 'Test' } });
      const res = mockResponse();

      await Controller.myMethod(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'success' })
      );
    });

    it('deve retornar erro com dados inválidos', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();

      await Controller.myMethod(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
```

## 🔗 Testes de Integração

### Executar

```bash
cd src/jurisconnect-backend

# Todos os testes de integração
npm test -- tests/integration

# Teste específico
npm test -- tests/integration/auth.test.js
```

### Estrutura

```
tests/
└── integration/
    ├── auth.test.js
    ├── demandas.test.js
    ├── clientes.test.js
    └── financeiro.test.js
```

### Exemplo de Teste de Integração

```javascript
const request = require('supertest');
const app = require('../../src/app');
const { generateTestToken } = require('../helpers');

describe('API Integration Tests', () => {
  let authToken;

  beforeEach(async () => {
    authToken = generateTestToken(1, 'admin');
  });

  it('deve criar recurso via API', async () => {
    const response = await request(app)
      .post('/api/v1/resource')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Test' });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

## 🎭 Testes E2E

### Executar

```bash
cd tests/e2e

# Todos os testes
npm run test:e2e

# Com interface gráfica
npm run test:e2e:headed

# Modo debug
npm run test:e2e:debug

# UI mode (interativo)
npm run test:e2e:ui

# Apenas Chrome
npx playwright test --project=chromium

# Teste específico
npx playwright test login.spec.js
```

### Estrutura

```
tests/e2e/
├── specs/
│   ├── login.spec.js
│   ├── clientes.spec.js
│   ├── demandas.spec.js
│   └── financeiro.spec.js
├── fixtures/
│   └── documento-teste.pdf
├── playwright.config.js
└── package.json
```

### Exemplo de Teste E2E

```javascript
import { test, expect } from '@playwright/test';

test('fluxo completo de cadastro', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="senha"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## ⚡ Testes de Performance

### Instalar k6

```bash
# Windows (via Chocolatey)
choco install k6

# Ou baixar de https://k6.io/docs/getting-started/installation/
```

### Executar

```bash
cd tests/performance
k6 run load-test.js
```

### Exemplo de Teste de Performance

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições < 500ms
    http_req_failed: ['rate<0.01'],   // < 1% de falhas
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/health');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

## 🔒 Testes de Segurança

### OWASP ZAP (Automated Scan)

```bash
# Instalar OWASP ZAP
# Download: https://www.zaproxy.org/download/

# Executar scan
zap-cli quick-scan --self-contained \
  --start-options '-config api.disablekey=true' \
  http://localhost:3000
```

### Testes de Segurança Manuais

```bash
# SQL Injection
npm test -- tests/security/sql-injection.test.js

# XSS
npm test -- tests/security/xss.test.js

# CSRF
npm test -- tests/security/csrf.test.js
```

## 🚀 CI/CD

### GitHub Actions

Criar `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd src/jurisconnect-backend
          npm ci
      
      - name: Run tests
        run: |
          cd src/jurisconnect-backend
          npm test -- --coverage
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: jurisconnect_test
          DB_USER: postgres
          DB_PASSWORD: postgres
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./src/jurisconnect-backend/coverage/lcov.info
```

### Scripts de Teste

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

## ✅ Boas Práticas

### 1. Nomenclatura

```javascript
// ✅ Bom
describe('UserController', () => {
  describe('create', () => {
    it('deve criar usuário com dados válidos', () => {});
    it('deve retornar erro quando email já existe', () => {});
  });
});

// ❌ Ruim
describe('test', () => {
  it('works', () => {});
});
```

### 2. Arrange-Act-Assert

```javascript
it('deve calcular total corretamente', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

### 3. Testes Independentes

```javascript
// ✅ Bom - cada teste limpa seus dados
beforeEach(async () => {
  await cleanDatabase();
});

// ❌ Ruim - testes dependem uns dos outros
let userId;
it('cria usuário', () => { userId = 1; });
it('atualiza usuário', () => { update(userId); });
```

### 4. Mocks Apropriados

```javascript
// ✅ Bom - mock de dependências externas
jest.mock('../services/EmailService');

// ❌ Ruim - mock de lógica de negócio
jest.mock('../controllers/UserController');
```

### 5. Dados de Teste Realistas

```javascript
// ✅ Bom
const testUser = {
  email: 'user@example.com',
  name: 'John Doe',
  cpf: '123.456.789-00'
};

// ❌ Ruim
const testUser = {
  email: 'a@a.com',
  name: 'a',
  cpf: '111'
};
```

## 📊 Relatórios

### Cobertura de Código

```bash
# Gerar relatório HTML
npm test -- --coverage

# Abrir relatório
open coverage/lcov-report/index.html
```

### Relatório de Testes E2E

```bash
cd tests/e2e
npm run test:e2e:report
```

## 🐛 Debugging

### Jest

```bash
# Debug com Node Inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug teste específico
node --inspect-brk node_modules/.bin/jest tests/unit/MyTest.test.js
```

### Playwright

```bash
# Modo debug
npx playwright test --debug

# Pausar em ponto específico
await page.pause();
```

## 📝 Checklist de Testes

Antes de fazer commit:

- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura >= 80%
- [ ] Testes E2E dos fluxos críticos passam
- [ ] Sem warnings ou deprecations
- [ ] Testes de performance dentro dos limites
- [ ] Scan de segurança sem vulnerabilidades críticas

---

**Última atualização**: 2025-11-25  
**Versão**: 1.0.0
