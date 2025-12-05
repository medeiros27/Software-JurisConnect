# JURISCONNECT - SUITE COMPLETA DE TESTES AUTOMATIZADOS

## 📋 ÍNDICE

1. [Setup e Configuração](#1-setup-e-configuração)
2. [Testes Unitários (Jest)](#2-testes-unitários-jest)
3. [Testes de Integração](#3-testes-de-integração)
4. [Testes End-to-End (Playwright)](#4-testes-end-to-end-playwright)
5. [Testes de Performance](#5-testes-de-performance)
6. [Testes de Segurança](#6-testes-de-segurança)
7. [CI/CD e Relatórios](#7-cicd-e-relatórios)

---

# 1. SETUP E CONFIGURAÇÃO

## 1.1 package.json - Dependências

```json
{
  "name": "jurisconnect-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "jest --coverage",
    "test:unit": "jest tests/unit --coverage",
    "test:integration": "jest tests/integration --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:perf": "jest tests/performance",
    "test:security": "jest tests/security",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:watch": "jest --watch",
    "coverage": "jest --coverage && open coverage/lcov-report/index.html"
  },
  "devDependencies": {
    "@jest/globals": "^29.0.0",
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "jest": "^29.0.0",
    "jest-mock-extended": "^3.0.0",
    "supertest": "^6.3.0",
    "faker": "^6.6.0",
    "autocannon": "^7.10.0"
  }
}
```

## 1.2 jest.config.js

```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  testTimeout: 30000
};
```

## 1.3 playwright.config.js

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

---

# 2. TESTES UNITÁRIOS (Jest)

## 2.1 Tests/Unit/calculadora-financeira.test.js

```javascript
import { jest } from '@jest/globals';
import {
  calcularJuros,
  calcularMulta,
  calcularTotal,
  validarValor,
  formatarMoeda,
  calcularTaxaAdministrativa
} from '../../src/services/calculadora-financeira';

describe('Calculadora Financeira', () => {
  
  describe('calcularJuros', () => {
    it('deve calcular juros simples corretamente', () => {
      const resultado = calcularJuros(1000, 0.10, 30);
      expect(resultado).toBeCloseTo(100, 2);
    });

    it('deve retornar 0 para taxa 0', () => {
      const resultado = calcularJuros(1000, 0, 30);
      expect(resultado).toBe(0);
    });

    it('deve retornar 0 para dias 0', () => {
      const resultado = calcularJuros(1000, 0.10, 0);
      expect(resultado).toBe(0);
    });

    it('deve lançar erro para valor negativo', () => {
      expect(() => calcularJuros(-1000, 0.10, 30)).toThrow('Valor deve ser positivo');
    });

    it('deve lançar erro para taxa maior que 100%', () => {
      expect(() => calcularJuros(1000, 1.5, 30)).toThrow('Taxa deve estar entre 0 e 1');
    });

    it('deve calcular corretamente para grande volume', () => {
      const resultado = calcularJuros(1000000, 0.005, 365);
      expect(resultado).toBeCloseTo(18250, 0);
    });
  });

  describe('calcularMulta', () => {
    it('deve calcular multa de forma correta', () => {
      const resultado = calcularMulta(1000, 0.05);
      expect(resultado).toBe(50);
    });

    it('deve aplicar múltipla multa para períodos vencidos', () => {
      const resultado = calcularMulta(1000, 0.05, 3);
      expect(resultado).toBe(150);
    });

    it('deve lançar erro para taxa inválida', () => {
      expect(() => calcularMulta(1000, -0.05)).toThrow('Taxa deve ser positiva');
    });
  });

  describe('calcularTotal', () => {
    it('deve calcular total com juros e multa', () => {
      const resultado = calcularTotal({
        valor: 1000,
        taxaJuros: 0.10,
        dias: 30,
        multa: 50
      });
      expect(resultado).toBe(1150);
    });

    it('deve retornar valor sem juros se taxa for 0', () => {
      const resultado = calcularTotal({
        valor: 1000,
        taxaJuros: 0,
        dias: 30,
        multa: 0
      });
      expect(resultado).toBe(1000);
    });

    it('deve lançar erro para objeto inválido', () => {
      expect(() => calcularTotal({})).toThrow('Parâmetros obrigatórios ausentes');
    });
  });

  describe('validarValor', () => {
    it('deve validar valor positivo', () => {
      expect(validarValor(100)).toBe(true);
    });

    it('deve rejeitar valor zero', () => {
      expect(validarValor(0)).toBe(false);
    });

    it('deve rejeitar valor negativo', () => {
      expect(validarValor(-100)).toBe(false);
    });

    it('deve rejeitar null/undefined', () => {
      expect(validarValor(null)).toBe(false);
      expect(validarValor(undefined)).toBe(false);
    });

    it('deve validar valores muito grandes', () => {
      expect(validarValor(999999999999)).toBe(true);
    });

    it('deve validar valores com centavos', () => {
      expect(validarValor(99.99)).toBe(true);
    });
  });

  describe('formatarMoeda', () => {
    it('deve formatar valor em reais', () => {
      expect(formatarMoeda(1000)).toBe('R$ 1.000,00');
    });

    it('deve formatar com centavos', () => {
      expect(formatarMoeda(1999.99)).toBe('R$ 1.999,99');
    });

    it('deve formatar zero', () => {
      expect(formatarMoeda(0)).toBe('R$ 0,00');
    });

    it('deve formatar negativos', () => {
      expect(formatarMoeda(-100)).toBe('-R$ 100,00');
    });
  });

  describe('calcularTaxaAdministrativa', () => {
    it('deve calcular taxa conforme faixa', () => {
      expect(calcularTaxaAdministrativa(1000)).toBe(20);   // 2% para até 1500
      expect(calcularTaxaAdministrativa(5000)).toBe(100);  // 2% para até 5000
      expect(calcularTaxaAdministrativa(10000)).toBe(150); // 1.5% para >5000
    });

    it('deve lançar erro para valor inválido', () => {
      expect(() => calcularTaxaAdministrativa(-100)).toThrow();
    });
  });
});
```

## 2.2 Tests/Unit/validadores.test.js

```javascript
import {
  validarEmail,
  validarCPF,
  validarCNPJ,
  validarTelefone,
  validarSenha,
  sanitizarInput
} from '../../src/utils/validadores';

describe('Validadores', () => {
  
  describe('validarEmail', () => {
    it('deve validar email válido', () => {
      expect(validarEmail('usuario@jurisconnect.com.br')).toBe(true);
    });

    it('deve rejeitar email sem @', () => {
      expect(validarEmail('usuariojurisconnect.com.br')).toBe(false);
    });

    it('deve rejeitar email com múltiplos @', () => {
      expect(validarEmail('usuario@@jurisconnect.com.br')).toBe(false);
    });

    it('deve rejeitar email vazio', () => {
      expect(validarEmail('')).toBe(false);
    });

    it('deve aceitar variações válidas', () => {
      expect(validarEmail('nome+tag@empresa.co.uk')).toBe(true);
      expect(validarEmail('nome.sobrenome@empresa.com')).toBe(true);
    });
  });

  describe('validarCPF', () => {
    it('deve validar CPF com dígitos corretos', () => {
      expect(validarCPF('11144477735')).toBe(true);
    });

    it('deve validar CPF com pontuação', () => {
      expect(validarCPF('111.444.777-35')).toBe(true);
    });

    it('deve rejeitar CPF com dígitos repetidos', () => {
      expect(validarCPF('11111111111')).toBe(false);
    });

    it('deve rejeitar CPF com dígito verificador errado', () => {
      expect(validarCPF('11144477736')).toBe(false);
    });

    it('deve rejeitar CPF vazio', () => {
      expect(validarCPF('')).toBe(false);
    });
  });

  describe('validarCNPJ', () => {
    it('deve validar CNPJ válido', () => {
      expect(validarCNPJ('11222333000181')).toBe(true);
    });

    it('deve validar CNPJ com pontuação', () => {
      expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validarCNPJ('11222333000182')).toBe(false);
    });
  });

  describe('validarTelefone', () => {
    it('deve validar celular brasileiro', () => {
      expect(validarTelefone('(11) 99999-9999')).toBe(true);
      expect(validarTelefone('11999999999')).toBe(true);
    });

    it('deve validar telefone fixo', () => {
      expect(validarTelefone('(11) 3333-3333')).toBe(true);
    });

    it('deve rejeitar telefone inválido', () => {
      expect(validarTelefone('1234')).toBe(false);
    });
  });

  describe('validarSenha', () => {
    it('deve aceitar senha forte', () => {
      expect(validarSenha('Senha@123#')).toBe(true);
    });

    it('deve rejeitar senha sem maiúscula', () => {
      expect(validarSenha('senha@123#')).toBe(false);
    });

    it('deve rejeitar senha sem número', () => {
      expect(validarSenha('Senha@abc#')).toBe(false);
    });

    it('deve rejeitar senha sem caractere especial', () => {
      expect(validarSenha('Senha123abc')).toBe(false);
    });

    it('deve rejeitar senha menor que 8 caracteres', () => {
      expect(validarSenha('Sen@123')).toBe(false);
    });
  });

  describe('sanitizarInput', () => {
    it('deve remover scripts maliciosos', () => {
      const input = '<script>alert("xss")</script>Nome';
      expect(sanitizarInput(input)).not.toContain('<script>');
    });

    it('deve remover SQL injection attempts', () => {
      const input = "'; DROP TABLE usuarios; --";
      expect(sanitizarInput(input)).not.toContain('DROP');
    });

    it('deve preservar texto válido', () => {
      const input = 'João da Silva';
      expect(sanitizarInput(input)).toBe('João da Silva');
    });

    it('deve remover tags HTML', () => {
      const input = '<p>Texto</p>';
      expect(sanitizarInput(input)).not.toContain('<p>');
    });
  });
});
```

## 2.3 Tests/Unit/demanda-service.test.js

```javascript
import { DemandaService } from '../../src/services/demanda.service';
import { jest } from '@jest/globals';

describe('DemandaService', () => {
  let demandaService;
  let mockDatabase;

  beforeEach(() => {
    mockDatabase = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn()
    };

    demandaService = new DemandaService(mockDatabase);
  });

  describe('criarDemanda', () => {
    it('deve criar demanda com dados válidos', async () => {
      const demandaData = {
        titulo: 'Demanda de teste',
        descricao: 'Descrição teste',
        cliente_id: 1,
        valor_estimado: 5000,
        prazo_dias: 30
      };

      mockDatabase.query.mockResolvedValue({
        rows: [{ id: 1, ...demandaData }]
      });

      const resultado = await demandaService.criarDemanda(demandaData);

      expect(resultado.id).toBeDefined();
      expect(mockDatabase.query).toHaveBeenCalled();
    });

    it('deve lançar erro para dados inválidos', async () => {
      const demandaData = {
        titulo: '', // Inválido
        cliente_id: 1
      };

      await expect(demandaService.criarDemanda(demandaData))
        .rejects.toThrow('Título obrigatório');
    });

    it('deve lançar erro para cliente inexistente', async () => {
      const demandaData = {
        titulo: 'Demanda',
        cliente_id: 999
      };

      mockDatabase.query.mockResolvedValue({ rows: [] });

      await expect(demandaService.criarDemanda(demandaData))
        .rejects.toThrow('Cliente não encontrado');
    });

    it('deve usar transação para criar demanda', async () => {
      await demandaService.criarDemanda({
        titulo: 'Test',
        cliente_id: 1
      });

      expect(mockDatabase.beginTransaction).toHaveBeenCalled();
      expect(mockDatabase.commit).toHaveBeenCalled();
    });

    it('deve fazer rollback em caso de erro', async () => {
      mockDatabase.query.mockRejectedValue(new Error('DB Error'));
      mockDatabase.rollback.mockResolvedValue(true);

      await expect(demandaService.criarDemanda({
        titulo: 'Test',
        cliente_id: 1
      })).rejects.toThrow();

      expect(mockDatabase.rollback).toHaveBeenCalled();
    });
  });

  describe('atualizarStatus', () => {
    it('deve atualizar status de demanda válida', async () => {
      mockDatabase.query.mockResolvedValue({
        rows: [{ id: 1, status: 'em_andamento' }]
      });

      const resultado = await demandaService.atualizarStatus(1, 'em_andamento');

      expect(resultado.status).toBe('em_andamento');
    });

    it('deve rejeitar transição de status inválida', async () => {
      await expect(demandaService.atualizarStatus(1, 'status_invalido'))
        .rejects.toThrow('Status inválido');
    });

    it('deve auditar mudança de status', async () => {
      const auditarSpy = jest.spyOn(demandaService, 'auditarAlteracao');

      await demandaService.atualizarStatus(1, 'concluida');

      expect(auditarSpy).toHaveBeenCalled();
    });
  });

  describe('listarDemandas', () => {
    it('deve listar demandas com filtros', async () => {
      const demandas = [
        { id: 1, titulo: 'Demanda 1' },
        { id: 2, titulo: 'Demanda 2' }
      ];

      mockDatabase.query.mockResolvedValue({ rows: demandas });

      const resultado = await demandaService.listarDemandas({
        status: 'aberta'
      });

      expect(resultado).toHaveLength(2);
      expect(mockDatabase.query).toHaveBeenCalled();
    });

    it('deve aplicar paginação', async () => {
      await demandaService.listarDemandas({
        pagina: 1,
        limite: 10
      });

      expect(mockDatabase.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.any(Array)
      );
    });
  });
});
```

---

**Testes Unitários - Parte 1/3 Completa** ✅

**Continuação com Testes de Integração e E2E...**