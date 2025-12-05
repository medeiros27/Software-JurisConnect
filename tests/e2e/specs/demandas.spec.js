import { test, expect } from '@playwright/test';

test.describe('Workflow Completo de Demandas', () => {
    test.beforeEach(async ({ page }) => {
        // Login e navegação
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@jurisconnect.com');
        await page.fill('input[name="senha"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
        await page.click('[data-testid="menu-demandas"]');
    });

    test('deve criar demanda completa com todas as etapas', async ({ page }) => {
        // Criar nova demanda
        await page.click('[data-testid="btn-nova-demanda"]');

        // Passo 1: Informações básicas
        await page.fill('input[name="titulo"]', 'Ação Judicial Teste');
        await page.fill('textarea[name="descricao"]', 'Descrição detalhada da demanda');
        await page.selectOption('select[name="tipo_demanda"]', 'judicial');
        await page.selectOption('select[name="prioridade"]', 'alta');

        // Selecionar cliente
        await page.click('button[data-testid="select-cliente"]');
        await page.click('[data-testid="cliente-option-1"]');

        // Selecionar correspondente
        await page.click('button[data-testid="select-correspondente"]');
        await page.click('[data-testid="correspondente-option-1"]');

        await page.click('button[data-testid="btn-proximo"]');

        // Passo 2: Prazos e datas
        await page.fill('input[name="data_abertura"]', '2025-01-15');
        await page.fill('input[name="data_prazo"]', '2025-03-15');

        await page.click('button[data-testid="btn-proximo"]');

        // Passo 3: Valores
        await page.fill('input[name="valor_causa"]', '50000.00');
        await page.fill('input[name="honorarios"]', '5000.00');

        await page.click('button[data-testid="btn-salvar"]');

        // Verificar sucesso
        await expect(page.locator('.toast-success')).toContainText('Demanda criada');

        // Verificar na listagem
        await expect(page.locator('table')).toContainText('Ação Judicial Teste');
    });

    test('deve atualizar status da demanda', async ({ page }) => {
        // Abrir demanda existente
        await page.click('table tbody tr:first-child');

        // Alterar status
        await page.selectOption('select[name="status"]', 'em_andamento');
        await page.click('button[data-testid="btn-atualizar-status"]');

        await expect(page.locator('.toast-success')).toContainText('Status atualizado');

        // Verificar badge de status
        await expect(page.locator('[data-testid="status-badge"]')).toContainText('Em Andamento');
    });

    test('deve adicionar andamento à demanda', async ({ page }) => {
        await page.click('table tbody tr:first-child');

        // Ir para aba de andamentos
        await page.click('[data-testid="tab-andamentos"]');

        // Adicionar andamento
        await page.click('[data-testid="btn-novo-andamento"]');
        await page.fill('textarea[name="descricao"]', 'Protocolo realizado com sucesso');
        await page.fill('input[name="data"]', '2025-01-20');
        await page.click('button[data-testid="btn-salvar-andamento"]');

        await expect(page.locator('.andamentos-list')).toContainText('Protocolo realizado');
    });

    test('deve anexar documento à demanda', async ({ page }) => {
        await page.click('table tbody tr:first-child');
        await page.click('[data-testid="tab-documentos"]');

        // Upload de arquivo
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('tests/fixtures/documento-teste.pdf');

        await page.fill('input[name="nome_documento"]', 'Petição Inicial');
        await page.click('button[data-testid="btn-upload"]');

        await expect(page.locator('.documentos-list')).toContainText('Petição Inicial');
    });

    test('deve filtrar demandas por status', async ({ page }) => {
        await page.selectOption('select[name="filtro-status"]', 'pendente');

        // Verificar que todos os resultados têm status pendente
        const statusBadges = page.locator('[data-testid="status-badge"]');
        const count = await statusBadges.count();

        for (let i = 0; i < count; i++) {
            await expect(statusBadges.nth(i)).toContainText('Pendente');
        }
    });

    test('deve ordenar demandas por prioridade', async ({ page }) => {
        await page.click('[data-testid="sort-prioridade"]');

        // Verificar que primeira linha tem prioridade alta
        await expect(
            page.locator('table tbody tr:first-child [data-testid="prioridade-badge"]')
        ).toContainText('Alta');
    });

    test('deve concluir demanda', async ({ page }) => {
        await page.click('table tbody tr:first-child');

        // Concluir demanda
        await page.click('[data-testid="btn-concluir-demanda"]');

        // Preencher modal de conclusão
        await page.fill('textarea[name="observacoes_conclusao"]', 'Demanda concluída com êxito');
        await page.fill('input[name="data_conclusao"]', '2025-03-10');
        await page.click('button[data-testid="btn-confirmar-conclusao"]');

        await expect(page.locator('.toast-success')).toContainText('Demanda concluída');
        await expect(page.locator('[data-testid="status-badge"]')).toContainText('Concluída');
    });
});
