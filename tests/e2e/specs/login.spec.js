import { test, expect } from '@playwright/test';

test.describe('Fluxo Completo de Login e Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('deve fazer login com credenciais válidas e acessar dashboard', async ({ page }) => {
        // Preencher formulário de login
        await page.fill('input[name="email"]', 'admin@jurisconnect.com');
        await page.fill('input[name="senha"]', 'admin123');

        // Clicar no botão de login
        await page.click('button[type="submit"]');

        // Aguardar redirecionamento para dashboard
        await page.waitForURL('/');

        // Verificar elementos do dashboard
        await expect(page.locator('h1')).toContainText('Dashboard');
        await expect(page.locator('[data-testid="kpi-demandas"]')).toBeVisible();
        await expect(page.locator('[data-testid="kpi-receita"]')).toBeVisible();
    });

    test('deve exibir erro com credenciais inválidas', async ({ page }) => {
        await page.fill('input[name="email"]', 'invalido@test.com');
        await page.fill('input[name="senha"]', 'senha_errada');
        await page.click('button[type="submit"]');

        // Verificar mensagem de erro
        await expect(page.locator('.toast-error')).toContainText('Email ou senha incorretos');
    });

    test('deve validar campos obrigatórios', async ({ page }) => {
        await page.click('button[type="submit"]');

        // Verificar mensagens de validação
        await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
        await expect(page.locator('input[name="senha"]:invalid')).toBeVisible();
    });

    test('deve fazer logout corretamente', async ({ page }) => {
        // Login
        await page.fill('input[name="email"]', 'admin@jurisconnect.com');
        await page.fill('input[name="senha"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Logout
        await page.click('[data-testid="user-menu"]');
        await page.click('[data-testid="logout-button"]');

        // Verificar redirecionamento para login
        await page.waitForURL('/login');
        await expect(page.locator('h1')).toContainText('Login');
    });
});
