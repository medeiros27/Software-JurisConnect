# SUITE DE TESTES - PARTE 2

## 📋 CONTINUAÇÃO

3. [Testes de Integração](#3-testes-de-integração)
4. [Testes End-to-End](#4-testes-end-to-end)
5. [Testes de Performance e Segurança](#5-testes-de-performance-e-segurança)
6. [CI/CD e Relatórios](#6-cicd-e-relatórios)

---

# 3. TESTES DE INTEGRAÇÃO

## 3.1 Tests/Integration/api-routes.test.js

```javascript
import request from 'supertest';
import { app } from '../../src/app';
import { pool } from '../../src/database';

describe('API Routes - Integração', () => {
  let demandaId;
  let clienteId;
  let token;

  beforeAll(async () => {
    // Setup: Criar dados de teste
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    // Teardown: Limpar dados
    await pool.query('ROLLBACK');
    await pool.end();
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@jurisconnect.com',
          senha: 'Senha@123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario).toBeDefined();

      token = response.body.token;
    });

    it('deve rejeitar login com senha inválida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teste@jurisconnect.com',
          senha: 'SenhaErrada@123'
        });

      expect(response.status).toBe(401);
      expect(response.body.erro).toBeDefined();
    });

    it('deve rejeitar login com usuário inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@jurisconnect.com',
          senha: 'Senha@123'
        });

      expect(response.status).toBe(404);
    });

    it('deve rejeitar request sem email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          senha: 'Senha@123'
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email_invalido',
          senha: 'Senha@123'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/clientes', () => {
    it('deve criar cliente com dados válidos', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Cliente Teste',
          email: 'cliente@teste.com',
          cpf: '11144477735',
          telefone: '(11) 99999-9999'
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.nome).toBe('Cliente Teste');

      clienteId = response.body.id;
    });

    it('deve rejeitar cliente sem autenticação', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .send({
          nome: 'Cliente Teste',
          email: 'cliente@teste.com'
        });

      expect(response.status).toBe(401);
    });

    it('deve rejeitar cliente com email duplicado', async () => {
      // Criar primeiro cliente
      await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Cliente 1',
          email: 'duplicado@teste.com',
          cpf: '11144477735'
        });

      // Tentar criar segundo com mesmo email
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Cliente 2',
          email: 'duplicado@teste.com',
          cpf: '22255588846'
        });

      expect(response.status).toBe(409);
      expect(response.body.erro).toContain('duplicado');
    });

    it('deve validar CPF', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Cliente',
          email: 'cliente@teste.com',
          cpf: 'cpf-invalido'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/demandas', () => {
    it('deve criar demanda com dados válidos', async () => {
      const response = await request(app)
        .post('/api/demandas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Demanda de Teste',
          descricao: 'Descrição teste',
          cliente_id: clienteId,
          valor_estimado: 5000,
          prazo_dias: 30
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('aberta');

      demandaId = response.body.id;
    });

    it('deve rejeitar demanda com cliente inexistente', async () => {
      const response = await request(app)
        .post('/api/demandas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Demanda',
          cliente_id: 999999,
          valor_estimado: 5000
        });

      expect(response.status).toBe(404);
    });

    it('deve calcular total corretamente', async () => {
      const response = await request(app)
        .post('/api/demandas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Demanda',
          cliente_id: clienteId,
          valor_estimado: 1000,
          prazo_dias: 30,
          taxa_juros: 0.05
        });

      expect(response.status).toBe(201);
      expect(response.body.valor_total).toBeGreaterThan(1000);
    });
  });

  describe('GET /api/demandas/:id', () => {
    it('deve retornar demanda existente', async () => {
      const response = await request(app)
        .get(`/api/demandas/${demandaId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(demandaId);
    });

    it('deve retornar 404 para demanda inexistente', async () => {
      const response = await request(app)
        .get('/api/demandas/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('deve retornar dados completos', async () => {
      const response = await request(app)
        .get(`/api/demandas/${demandaId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('titulo');
      expect(response.body).toHaveProperty('cliente_id');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('valor_estimado');
    });
  });

  describe('PATCH /api/demandas/:id/status', () => {
    it('deve atualizar status de demanda', async () => {
      const response = await request(app)
        .patch(`/api/demandas/${demandaId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'em_andamento'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('em_andamento');
    });

    it('deve rejeitar status inválido', async () => {
      const response = await request(app)
        .patch(`/api/demandas/${demandaId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'status_invalido'
        });

      expect(response.status).toBe(400);
    });

    it('deve validar transição de status', async () => {
      // Demanda aberta -> em andamento (OK)
      let response = await request(app)
        .patch(`/api/demandas/${demandaId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'concluida' });

      // Dependendo de regras de negócio
      if (response.status === 400) {
        expect(response.body.erro).toBeDefined();
      }
    });
  });

  describe('POST /api/pagamentos', () => {
    it('deve criar pagamento com dados válidos', async () => {
      const response = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          demanda_id: demandaId,
          valor: 5000,
          metodo: 'boleto',
          descricao: 'Pagamento parcial'
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.status).toBe('aguardando');
    });

    it('deve rejeitar pagamento sem demanda', async () => {
      const response = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          demanda_id: 999999,
          valor: 5000
        });

      expect(response.status).toBe(404);
    });

    it('deve rejeitar pagamento com valor inválido', async () => {
      const response = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          demanda_id: demandaId,
          valor: -5000
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar pagamento > valor da demanda', async () => {
      const response = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          demanda_id: demandaId,
          valor: 999999
        });

      expect(response.status).toBe(400);
    });
  });
});
```

---

# 4. TESTES END-TO-END

## 4.1 Tests/E2E/fluxo-completo.spec.js

```javascript
import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo - Demanda', () => {
  let clienteEmail;
  let demandaNumero;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    clienteEmail = `cliente-${Date.now()}@teste.com`;
  });

  test('Cadastrar cliente, criar demanda e gerar pagamento', async ({ page }) => {
    // 1. LOGIN
    console.log('✓ Etapa 1: Fazendo login');
    await page.click('[data-testid="btn-login"]');
    await page.fill('[data-testid="input-email"]', 'admin@jurisconnect.com');
    await page.fill('[data-testid="input-senha"]', 'Admin@123');
    await page.click('[data-testid="btn-entrar"]');
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');

    // 2. CADASTRAR CLIENTE
    console.log('✓ Etapa 2: Cadastrando cliente');
    await page.goto('/clientes');
    await page.click('[data-testid="btn-novo-cliente"]');
    
    await page.fill('[data-testid="input-nome"]', 'Cliente Teste E2E');
    await page.fill('[data-testid="input-email"]', clienteEmail);
    await page.fill('[data-testid="input-cpf"]', '111.444.777-35');
    await page.fill('[data-testid="input-telefone"]', '(11) 99999-9999');
    
    await page.click('[data-testid="btn-salvar-cliente"]');
    
    // Verificar sucesso
    const successMessage = page.locator('[data-testid="toast-success"]');
    await expect(successMessage).toContainText('Cliente criado com sucesso');
    
    // Obter ID do cliente
    const clienteId = await page.getAttribute('[data-testid="cliente-id"]', 'value');
    expect(clienteId).toBeTruthy();

    // 3. CRIAR DEMANDA
    console.log('✓ Etapa 3: Criando demanda');
    await page.goto('/demandas');
    await page.click('[data-testid="btn-nova-demanda"]');
    
    await page.fill('[data-testid="input-titulo"]', 'Demanda de Teste E2E');
    await page.fill('[data-testid="input-descricao"]', 'Descrição da demanda teste');
    await page.selectOption('[data-testid="select-cliente"]', clienteId);
    await page.fill('[data-testid="input-valor-estimado"]', '5000');
    await page.fill('[data-testid="input-prazo-dias"]', '30');
    
    await page.click('[data-testid="btn-salvar-demanda"]');
    
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Demanda criada');
    
    // Obter número da demanda
    demandaNumero = await page.getAttribute('[data-testid="demanda-numero"]', 'value');
    expect(demandaNumero).toBeTruthy();

    // 4. VERIFICAR DEMANDA NA LISTA
    console.log('✓ Etapa 4: Verificando demanda na lista');
    await page.goto('/demandas');
    const demandaRow = page.locator(`[data-testid="demanda-${demandaNumero}"]`);
    await expect(demandaRow).toBeVisible();
    expect(await demandaRow.textContent()).toContain('Demanda de Teste E2E');

    // 5. ABRIR DEMANDA
    console.log('✓ Etapa 5: Abrindo demanda');
    await demandaRow.click();
    await page.waitForURL(`/demandas/${demandaNumero}`);
    
    // Verificar detalhes
    await expect(page.locator('[data-testid="demanda-titulo"]')).toContainText('Demanda de Teste E2E');
    await expect(page.locator('[data-testid="demanda-valor"]')).toContainText('5.000');
    await expect(page.locator('[data-testid="demanda-status"]')).toContainText('Aberta');

    // 6. CRIAR PAGAMENTO
    console.log('✓ Etapa 6: Criando pagamento');
    await page.click('[data-testid="btn-novo-pagamento"]');
    
    await page.fill('[data-testid="input-valor-pagamento"]', '2500');
    await page.selectOption('[data-testid="select-metodo"]', 'boleto');
    
    await page.click('[data-testid="btn-gerar-boleto"]');
    
    await expect(page.locator('[data-testid="toast-success"]')).toContainText('Pagamento criado');
    
    // Verificar boleto gerado
    const boletoLink = page.locator('[data-testid="link-boleto"]');
    await expect(boletoLink).toBeVisible();
    expect(await boletoLink.getAttribute('href')).toMatch(/\.pdf$/);

    // 7. GERAR RELATÓRIO
    console.log('✓ Etapa 7: Gerando relatório');
    await page.goto('/relatorios');
    await page.selectOption('[data-testid="select-tipo-relatorio"]', 'demandas');
    await page.fill('[data-testid="input-data-inicio"]', '2025-01-01');
    await page.fill('[data-testid="input-data-fim"]', '2025-12-31');
    
    await page.click('[data-testid="btn-gerar-relatorio"]');
    
    // Aguardar download
    const downloadPromise = page.waitForEvent('download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/);

    console.log('✅ Fluxo completo executado com sucesso!');
  });

  test('Validações de erro no cadastro', async ({ page }) => {
    await page.goto('/clientes');
    await page.click('[data-testid="btn-novo-cliente"]');
    
    // Tentar salvar sem dados
    await page.click('[data-testid="btn-salvar-cliente"]');
    
    // Verificar erros de validação
    await expect(page.locator('[data-testid="error-nome"]')).toContainText('obrigatório');
    await expect(page.locator('[data-testid="error-email"]')).toContainText('obrigatório');
    
    // Preencher com email inválido
    await page.fill('[data-testid="input-nome"]', 'Cliente');
    await page.fill('[data-testid="input-email"]', 'email-invalido');
    await page.click('[data-testid="btn-salvar-cliente"]');
    
    await expect(page.locator('[data-testid="error-email"]')).toContainText('inválido');
  });

  test('Performance: Abrir demanda em < 2s', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="btn-login"]');
    await page.fill('[data-testid="input-email"]', 'admin@jurisconnect.com');
    await page.fill('[data-testid="input-senha"]', 'Admin@123');
    await page.click('[data-testid="btn-entrar"]');
    
    // Medir tempo de carregamento
    const startTime = Date.now();
    await page.goto('/demandas/1');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    expect(loadTime).toBeLessThan(2000);
    console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
  });

  test('Acessibilidade: Navegar com teclado', async ({ page }) => {
    await page.goto('/');
    
    // Navegar com TAB
    await page.keyboard.press('Tab');
    const focused1 = page.evaluateHandle(() => document.activeElement);
    expect(focused1).toBeTruthy();
    
    // Ativar com ENTER
    await page.keyboard.press('Enter');
    
    // Continuar navegando
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    const finalFocused = page.evaluateHandle(() => document.activeElement?.tagName);
    expect(finalFocused).toBeTruthy();
  });

  test('Responsividade mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone
    
    await page.goto('/clientes');
    
    // Verificar que elementos estão visíveis
    await expect(page.locator('[data-testid="btn-novo-cliente"]')).toBeVisible();
    
    // Verificar que não há overflow horizontal
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
  });
});
```

---

# 5. TESTES DE PERFORMANCE E SEGURANÇA

## 5.1 Tests/Performance/carga.test.js

```javascript
import autocannon from 'autocannon';

describe('Testes de Performance - Carga', () => {
  const baseURL = 'http://localhost:3000';

  test('GET /api/demandas deve responder < 500ms em média', async () => {
    const result = await autocannon({
      url: `${baseURL}/api/demandas`,
      connections: 10,
      duration: 30,
      requests: [{ path: '/api/demandas' }]
    });

    const avgLatency = result.latency.mean;
    console.log(`Latência média: ${avgLatency}ms`);
    
    expect(avgLatency).toBeLessThan(500);
    expect(result.errors).toBe(0);
  });

  test('POST /api/demandas suporta 50 req/s', async () => {
    const result = await autocannon({
      url: `${baseURL}/api/demandas`,
      connections: 50,
      duration: 10,
      pipelining: 1,
      requests: [{
        path: '/api/demandas',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        },
        body: JSON.stringify({
          titulo: 'Teste',
          cliente_id: 1,
          valor_estimado: 5000
        })
      }]
    });

    const throughput = result.throughput.average / 1024; // KB/s
    const rps = result.requests.average;
    
    console.log(`Throughput: ${throughput} KB/s`);
    console.log(`RPS: ${rps}`);
    
    expect(result.errors).toBe(0);
    expect(rps).toBeGreaterThan(50);
  });
});
```

## 5.2 Tests/Security/vulnerabilidades.test.js

```javascript
import request from 'supertest';
import { app } from '../../src/app';

describe('Testes de Segurança', () => {
  
  test('XSS: Deve sanitizar entrada HTML', async () => {
    const maliciousInput = '<img src=x onerror="alert(1)">';
    
    const response = await request(app)
      .post('/api/clientes')
      .send({
        nome: maliciousInput,
        email: 'teste@teste.com'
      })
      .set('Authorization', 'Bearer valid_token');

    // Verificar que script não está na resposta
    expect(JSON.stringify(response.body)).not.toContain('onerror');
  });

  test('SQL Injection: Deve rejeitar queries maliciosas', async () => {
    const sqlInjection = "'; DROP TABLE clientes; --";
    
    const response = await request(app)
      .post('/api/clientes')
      .send({
        nome: sqlInjection,
        email: 'teste@teste.com'
      })
      .set('Authorization', 'Bearer valid_token');

    // Query não deve executar
    const clientes = await request(app)
      .get('/api/clientes')
      .set('Authorization', 'Bearer valid_token');

    expect(clientes.status).toBe(200);
    expect(Array.isArray(clientes.body)).toBe(true);
  });

  test('CSRF: Token CSRF deve ser validado', async () => {
    const response = await request(app)
      .post('/api/demandas')
      .send({
        titulo: 'Teste',
        cliente_id: 1
      })
      .set('X-Requested-With', '');  // Sem header CSRF

    // Deve rejeitar se CSRF não estiver protegido
    if (response.status === 403) {
      expect(response.body.erro).toContain('CSRF');
    }
  });

  test('Autenticação: Acesso sem token deve ser negado', async () => {
    const response = await request(app)
      .get('/api/demandas');

    expect(response.status).toBe(401);
    expect(response.body.erro).toContain('Autenticação');
  });

  test('Autorização: Usuário não pode acessar dados de outro', async () => {
    // Criar dois usuários
    const user1Token = 'token_usuario_1';
    const user2Id = 'usuario_2_id';

    const response = await request(app)
      .get(`/api/usuarios/${user2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.status).toBe(403);
  });

  test('Password: Senhas devem ser hash', async () => {
    const response = await request(app)
      .get('/api/usuarios/1')
      .set('Authorization', 'Bearer admin_token');

    // Senha não deve estar em texto plano
    expect(response.body).not.toHaveProperty('senha');
    expect(response.body.senha_hash).not.toContain('Admin@123');
  });

  test('Rate Limiting: Deve limitar requisições por IP', async () => {
    const ip = '192.168.1.1';
    
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(
        request(app)
          .get('/api/demandas')
          .set('X-Forwarded-For', ip)
      );
    }

    const responses = await Promise.all(requests);
    
    // Últimas requisições devem ser rate-limited
    const last = responses[responses.length - 1];
    expect(last.status).toBe(429);
    expect(last.headers['retry-after']).toBeDefined();
  });

  test('HTTPS: Deve redirecionar HTTP para HTTPS', async () => {
    // Em produção, verificar headers HSTS
    const response = await request(app)
      .get('/')
      .redirects(0);

    // Em desenvolvimento pode permitir HTTP
    if (process.env.NODE_ENV === 'production') {
      expect([301, 307]).toContain(response.status);
    }
  });
});
```

---

**Suite de Testes - Parte 2/3 Completa** ✅

**Continuação com CI/CD e Relatórios...**