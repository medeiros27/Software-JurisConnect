import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo de Cadastro de Cliente', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@jurisconnect.com');
        await page.fill('input[name="senha"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Navegar para clientes
        await page.click('[data-testid="menu-clientes"]');
        await page.waitForURL('/clientes');
    });

    test('deve cadastrar novo cliente PJ com sucesso', async ({ page }) => {
        // Clicar em novo cliente
        await page.click('[data-testid="btn-novo-cliente"]');

        // Preencher formulário
        await page.selectOption('select[name="tipo"]', 'PJ');
        await page.fill('input[name="nome_fantasia"]', 'Empresa Teste LTDA');
        await page.fill('input[name="razao_social"]', 'Empresa Teste LTDA');
        await page.fill('input[name="cnpj"]', '12.345.678/0001-99');
        await page.fill('input[name="email"]', 'contato@empresateste.com');
        await page.fill('input[name="telefone"]', '(11) 98765-4321');
        await page.fill('input[name="endereco"]', 'Rua Teste, 123');

        // Salvar
        await page.click('button[type="submit"]');

        // Verificar mensagem de sucesso
        await expect(page.locator('.toast-success')).toContainText('Cliente cadastrado com sucesso');

        // Verificar se aparece na listagem
        await expect(page.locator('table')).toContainText('Empresa Teste LTDA');
    });

    test('deve cadastrar novo cliente PF com sucesso', async ({ page }) => {
        await page.click('[data-testid="btn-novo-cliente"]');

        await page.selectOption('select[name="tipo"]', 'PF');
        await page.fill('input[name="nome"]', 'João da Silva');
        await page.fill('input[name="cpf"]', '123.456.789-00');
        await page.fill('input[name="email"]', 'joao@test.com');
        await page.fill('input[name="telefone"]', '(11) 91234-5678');

        await page.click('button[type="submit"]');

        await expect(page.locator('.toast-success')).toBeVisible();
        await expect(page.locator('table')).toContainText('João da Silva');
    });

    test('deve validar CNPJ inválido', async ({ page }) => {
        await page.click('[data-testid="btn-novo-cliente"]');

        await page.selectOption('select[name="tipo"]', 'PJ');
        await page.fill('input[name="cnpj"]', '00.000.000/0000-00');
        await page.fill('input[name="nome_fantasia"]', 'Teste');

        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('CNPJ inválido');
    });

    test('deve editar cliente existente', async ({ page }) => {
        // Assumindo que já existe um cliente
        await page.click('table tbody tr:first-child [data-testid="btn-editar"]');

        // Alterar nome
        await page.fill('input[name="nome_fantasia"]', 'Nome Atualizado');
        await page.click('button[type="submit"]');

        await expect(page.locator('.toast-success')).toContainText('atualizado');
        await expect(page.locator('table')).toContainText('Nome Atualizado');
    });

    test('deve deletar cliente', async ({ page }) => {
        // Clicar em deletar
        await page.click('table tbody tr:first-child [data-testid="btn-deletar"]');

        // Confirmar modal
        await page.click('[data-testid="confirm-delete"]');

        await expect(page.locator('.toast-success')).toContainText('removido');
    });

    test('deve buscar cliente por nome', async ({ page }) => {
        await page.fill('input[name="busca"]', 'Empresa Teste');
        await page.click('[data-testid="btn-buscar"]');

        // Verificar que apenas resultados relevantes aparecem
        const rows = page.locator('table tbody tr');
        await expect(rows).toHaveCount(1);
    });

    test('deve filtrar clientes por tipo', async ({ page }) => {
        await page.selectOption('select[name="filtro-tipo"]', 'PJ');

        // Verificar que todos os resultados são PJ
        const tiposCells = page.locator('table tbody tr td:nth-child(2)');
        const count = await tiposCells.count();

        for (let i = 0; i < count; i++) {
            await expect(tiposCells.nth(i)).toContainText('PJ');
        }
    });
});
