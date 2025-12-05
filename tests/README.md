# Suite de Testes - JurisConnect

## ✅ Testes Criados

- [x] Configuração Jest (`jest.config.js`)
- [x] Setup global de testes (`tests/setup.js`)
- [x] Helpers e factories (`tests/helpers.js`)
- [x] Testes unitários - HealthController
- [x] Testes unitários - PdfService
- [x] Testes de integração - Auth
- [x] Testes de integração - Demandas (CRUD completo)
- [x] Testes E2E - Login e Dashboard
- [x] Testes E2E - Cadastro de Clientes
- [x] Testes E2E - Workflow de Demandas
- [x] Configuração Playwright
- [x] Guia completo de testes (`TESTES.md`)
- [ ] Testes de performance (k6)
- [ ] Testes de segurança (OWASP ZAP)
- [ ] CI/CD GitHub Actions

## 📊 Estrutura de Arquivos

```
Software-JurisConnect/
├── src/jurisconnect-backend/
│   ├── jest.config.js
│   └── tests/
│       ├── setup.js
│       ├── helpers.js
│       ├── unit/
│       │   ├── controllers/
│       │   │   └── HealthController.test.js
│       │   └── services/
│       │       └── PdfService.test.js
│       └── integration/
│           ├── auth.test.js
│           └── demandas.test.js
├── tests/
│   └── e2e/
│       ├── package.json
│       ├── playwright.config.js
│       └── specs/
│           ├── login.spec.js
│           ├── clientes.spec.js
│           └── demandas.spec.js
└── TESTES.md
```

## 🚀 Como Executar

### Testes Unitários e Integração

```bash
cd src/jurisconnect-backend

# Instalar dependências (se necessário)
npm install

# Executar todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Testes E2E

```bash
cd tests/e2e

# Instalar dependências
npm install
npx playwright install

# Executar testes
npm run test:e2e

# Com interface
npm run test:e2e:headed

# Modo debug
npm run test:e2e:debug
```

## 📋 Próximos Passos

1. **Criar banco de teste**:
   ```bash
   psql -U postgres -p 5433 -c "CREATE DATABASE jurisconnect_test;"
   ```

2. **Configurar .env.test** no backend

3. **Executar testes** para validar configuração

4. **Adicionar mais testes** conforme necessário:
   - Financeiro (CRUD + relatórios)
   - Agenda (eventos + alertas)
   - Upload de documentos
   - Geração de relatórios PDF

5. **Configurar CI/CD** (GitHub Actions)

6. **Testes de performance** (k6)

7. **Testes de segurança** (OWASP ZAP)

## 🎯 Cobertura Esperada

- **Unitários**: 80%+ de cobertura
- **Integração**: 70%+ de cobertura
- **E2E**: Todos os fluxos críticos

## 📝 Observações

- Testes usam banco `jurisconnect_test` (separado do desenvolvimento)
- Dados são limpos entre cada teste (ver `setup.js`)
- Helpers facilitam criação de dados de teste
- Playwright configurado para Chrome, Firefox, Safari e Mobile
- Relatórios HTML gerados automaticamente
