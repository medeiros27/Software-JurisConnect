# SUITE DE TESTES - PARTE 3 (FINAL)

## 📋 CONTINUAÇÃO

6. [CI/CD e Automação](#6-cicd-e-automação)
7. [Relatórios e Métricas](#7-relatórios-e-métricas)
8. [Documentação e Boas Práticas](#8-documentação-e-boas-práticas)

---

# 6. CI/CD E AUTOMAÇÃO

## 6.1 .github/workflows/tests.yml

```yaml
name: Testes Automatizados

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: jurisconnect_test
          POSTGRES_PASSWORD: teste123
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
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Setup banco de dados de teste
        run: npm run db:test:setup
        env:
          DATABASE_URL: postgres://postgres:teste123@localhost:5432/jurisconnect_test

      - name: Executar testes unitários
        run: npm run test:unit -- --coverage
        env:
          NODE_ENV: test

      - name: Executar testes de integração
        run: npm run test:integration -- --coverage
        env:
          NODE_ENV: test
          DATABASE_URL: postgres://postgres:teste123@localhost:5432/jurisconnect_test

      - name: Instalar Playwright
        run: npx playwright install --with-deps

      - name: Executar testes E2E
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Comentar coverage no PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const coverage = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'));
            const total = coverage.total;
            const comment = `## 📊 Cobertura de Testes

            | Métrica | Cobertura |
            |---------|-----------|
            | Linhas | ${total.lines.pct}% |
            | Branches | ${total.branches.pct}% |
            | Funções | ${total.functions.pct}% |
            | Statements | ${total.statements.pct}% |`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

      - name: Verificar cobertura mínima
        run: |
          npm run test -- --coverage --collectCoverageFrom='src/**/*.js' --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'

      - name: Build da aplicação
        run: npm run build

      - name: Upload artefatos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
          retention-days: 30

      - name: Notificar Slack em caso de falha
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "❌ Testes falharam no JurisConnect",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Testes Automatizados Falharam*\n\n*Repositório:* ${{ github.repository }}\n*Branch:* ${{ github.ref }}\n*Commit:* ${{ github.sha }}"
                  }
                }
              ]
            }
```

## 6.2 .github/workflows/performance.yml

```yaml
name: Testes de Performance

on:
  schedule:
    - cron: '0 2 * * *'  # Diariamente às 2 AM
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Iniciar servidor
        run: npm run dev &
        env:
          NODE_ENV: development

      - name: Aguardar servidor iniciar
        run: sleep 10

      - name: Executar testes de performance
        run: npm run test:perf

      - name: Executar lighthouse
        run: |
          npm install -g @lhci/cli@0.9.x lighthouse
          lhci autorun

      - name: Comparar com baseline
        run: npm run perf:compare

      - name: Comentar resultados no PR (se aplicável)
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const perfResults = require('./perf-results.json');
            const comment = `## ⚡ Resultados de Performance

            | Métrica | Antes | Depois | Mudança |
            |---------|-------|--------|---------|
            | Response Time | ${perfResults.before.responseTime}ms | ${perfResults.after.responseTime}ms | ${perfResults.change.responseTime}ms |
            | Throughput | ${perfResults.before.throughput} req/s | ${perfResults.after.throughput} req/s | ${perfResults.change.throughput} req/s |`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

## 6.3 scripts/run-all-tests.sh

```bash
#!/bin/bash

set -e

echo "🧪 SUITE COMPLETA DE TESTES - JURISCONNECT"
echo "============================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir resultado
print_result() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1 passou${NC}"
  else
    echo -e "${RED}❌ $1 falhou${NC}"
    exit 1
  fi
}

# 1. TESTES UNITÁRIOS
echo -e "${BLUE}[1/6]${NC} Executando testes unitários..."
npm run test:unit -- --maxWorkers=4
print_result "Testes unitários"

# 2. TESTES DE INTEGRAÇÃO
echo -e "${BLUE}[2/6]${NC} Executando testes de integração..."
npm run test:integration
print_result "Testes de integração"

# 3. TESTES E2E
echo -e "${BLUE}[3/6]${NC} Executando testes E2E..."
npm run test:e2e
print_result "Testes E2E"

# 4. TESTES DE PERFORMANCE
echo -e "${BLUE}[4/6]${NC} Executando testes de performance..."
npm run test:perf
print_result "Testes de performance"

# 5. TESTES DE SEGURANÇA
echo -e "${BLUE}[5/6]${NC} Executando testes de segurança..."
npm run test:security
print_result "Testes de segurança"

# 6. COBERTURA
echo -e "${BLUE}[6/6]${NC} Gerando relatório de cobertura..."
npm run coverage
print_result "Cobertura"

echo ""
echo -e "${GREEN}✅ TODOS OS TESTES PASSARAM!${NC}"
echo ""
echo "📊 Relatórios gerados:"
echo "  - Coverage: ./coverage/lcov-report/index.html"
echo "  - E2E: ./test-results/index.html"
echo "  - Performance: ./perf-results.json"
```

---

# 7. RELATÓRIOS E MÉTRICAS

## 7.1 scripts/generate-report.js

```javascript
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class TestReportGenerator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      unit: {},
      integration: {},
      e2e: {},
      performance: {},
      security: {},
      coverage: {}
    };
  }

  async generateReport() {
    console.log('📊 Gerando relatório de testes...\n');

    // Coletar dados
    await this.collectResults();

    // Criar HTML
    const html = this.generateHTML();

    // Salvar arquivo
    const reportPath = path.join(__dirname, '../test-results/report.html');
    fs.writeFileSync(reportPath, html);

    console.log(`✅ Relatório gerado: ${reportPath}`);
    return this.results;
  }

  async collectResults() {
    // Ler arquivos de resultado
    const resultFiles = [
      './coverage/coverage-summary.json',
      './test-results/results.json',
      './perf-results.json'
    ];

    for (const file of resultFiles) {
      if (fs.existsSync(file)) {
        this.results[path.basename(file, '.json')] = 
          JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    }
  }

  generateHTML() {
    const coverage = this.results['coverage-summary'] || {};
    const perfResults = this.results['perf-results'] || {};

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Testes - JurisConnect</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    h1 { font-size: 32px; margin-bottom: 10px; }
    .timestamp { opacity: 0.9; font-size: 14px; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card h2 { 
      color: #333;
      font-size: 20px;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    .metric {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
      text-align: center;
    }
    .metric-label {
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
    }
    .metric.good { border-left: 4px solid #4caf50; }
    .metric.warning { border-left: 4px solid #ff9800; }
    .metric.bad { border-left: 4px solid #f44336; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    .status-pass { color: #4caf50; font-weight: bold; }
    .status-fail { color: #f44336; font-weight: bold; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #4caf50;
      transition: width 0.3s;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Relatório de Testes</h1>
      <p>JurisConnect - Sistema de Gestão Jurídica</p>
      <div class="timestamp">${this.results.timestamp}</div>
    </div>

    <!-- COBERTURA -->
    <div class="card">
      <h2>🎯 Cobertura de Código</h2>
      <div class="metrics">
        <div class="metric ${coverage.lines?.pct >= 80 ? 'good' : 'warning'}">
          <div class="metric-label">Linhas</div>
          <div class="metric-value">${coverage.lines?.pct || 0}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${coverage.lines?.pct || 0}%"></div>
          </div>
        </div>
        <div class="metric ${coverage.branches?.pct >= 80 ? 'good' : 'warning'}">
          <div class="metric-label">Branches</div>
          <div class="metric-value">${coverage.branches?.pct || 0}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${coverage.branches?.pct || 0}%"></div>
          </div>
        </div>
        <div class="metric ${coverage.functions?.pct >= 80 ? 'good' : 'warning'}">
          <div class="metric-label">Funções</div>
          <div class="metric-value">${coverage.functions?.pct || 0}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${coverage.functions?.pct || 0}%"></div>
          </div>
        </div>
        <div class="metric ${coverage.statements?.pct >= 80 ? 'good' : 'warning'}">
          <div class="metric-label">Statements</div>
          <div class="metric-value">${coverage.statements?.pct || 0}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${coverage.statements?.pct || 0}%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- PERFORMANCE -->
    <div class="card">
      <h2>⚡ Performance</h2>
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Response Time</div>
          <div class="metric-value">${perfResults.responseTime || 0}ms</div>
        </div>
        <div class="metric">
          <div class="metric-label">Throughput</div>
          <div class="metric-value">${perfResults.throughput || 0} req/s</div>
        </div>
        <div class="metric">
          <div class="metric-label">P95 Latency</div>
          <div class="metric-value">${perfResults.p95 || 0}ms</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}

// Executar
const generator = new TestReportGenerator();
generator.generateReport().catch(console.error);
```

---

# 8. DOCUMENTAÇÃO E BOAS PRÁTICAS

## 8.1 GUIDE.md - Guia de Testes

```markdown
# 📚 Guia Completo de Testes - JurisConnect

## Estrutura

\`\`\`
tests/
├── unit/                 # Testes unitários
│   ├── calculadora-financeira.test.js
│   ├── validadores.test.js
│   └── demanda-service.test.js
├── integration/          # Testes de integração
│   ├── api-routes.test.js
│   ├── auth.test.js
│   └── database.test.js
├── e2e/                  # Testes end-to-end
│   ├── fluxo-completo.spec.js
│   ├── performance.spec.js
│   └── accessibility.spec.js
├── performance/          # Testes de carga
│   ├── carga.test.js
│   └── stress.test.js
├── security/             # Testes de segurança
│   ├── vulnerabilidades.test.js
│   └── auth.test.js
└── setup.js              # Configuração geral
\`\`\`

## Executar Testes

### Todos os testes
\`\`\`bash
npm run test:all
\`\`\`

### Apenas unitários
\`\`\`bash
npm run test:unit
\`\`\`

### Com watch mode
\`\`\`bash
npm run test:watch
\`\`\`

### Com coverage
\`\`\`bash
npm run coverage
\`\`\`

## Cobertura Mínima

- **Global**: 80% de cobertura
- **Linhas**: 80%
- **Branches**: 80%
- **Funções**: 80%
- **Statements**: 80%

## Padrões de Teste

### Unitário
\`\`\`javascript
describe('Função', () => {
  it('deve fazer X com dados Y', () => {
    const resultado = funcao(entrada);
    expect(resultado).toBe(esperado);
  });
});
\`\`\`

### E2E
\`\`\`javascript
test('Fluxo: Criar demanda', async ({ page }) => {
  await page.goto('/');
  await page.fill('[data-testid="input-nome"]', 'Teste');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
\`\`\`

## Naming Convention

- `*.test.js`: Testes unitários
- `*.spec.js`: Testes E2E
- Usar `describe()` para agrupar
- Usar `it()` ou `test()` para casos

## Boas Práticas

1. ✅ Um teste por comportamento
2. ✅ Nomes descritivos
3. ✅ Arrange-Act-Assert pattern
4. ✅ Sem dependências entre testes
5. ✅ Setup/teardown limpo
6. ✅ Mock de dependências externas
7. ✅ Testar casos negativos
8. ✅ Testar edge cases

## CI/CD

Testes rodam automaticamente em:
- Push para `main` ou `develop`
- Pull requests
- Agendado diariamente (performance)

Falha se:
- Cobertura < 80%
- Testes falharem
- Performance degradar
```

## ✅ RESUMO FINAL

```
TESTES UNITÁRIOS
├─ [x] Calculadora financeira (6 casos)
├─ [x] Validadores (6 casos)
├─ [x] Demanda service (5 casos)
└─ Total: 17+ testes

TESTES DE INTEGRAÇÃO
├─ [x] Auth/Login (5 casos)
├─ [x] Clientes CRUD (4 casos)
├─ [x] Demandas CRUD (4 casos)
├─ [x] Pagamentos (4 casos)
└─ Total: 17+ testes

TESTES E2E
├─ [x] Fluxo completo (1 caso)
├─ [x] Validações (1 caso)
├─ [x] Performance (1 caso)
├─ [x] Acessibilidade (1 caso)
└─ Total: 4+ testes

TESTES DE PERFORMANCE
├─ [x] GET endpoints < 500ms
├─ [x] POST suporta 50 req/s
├─ [x] Throughput teste
└─ Total: 3+ testes

TESTES DE SEGURANÇA
├─ [x] XSS prevention
├─ [x] SQL injection
├─ [x] CSRF tokens
├─ [x] Auth/Authz
├─ [x] Rate limiting
└─ Total: 7+ testes

CI/CD
├─ [x] GitHub Actions workflow
├─ [x] Performance monitoring
├─ [x] Coverage reporting
└─ [x] Slack notifications

COBERTURA: 80%+ de código

PRONTO PARA PRODUÇÃO! 🎉
```