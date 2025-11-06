# JURISCONNECT - MÓDULO FINANCEIRO COM DASHBOARDS E GRÁFICOS

## 📋 ÍNDICE

1. [Arquitetura do Módulo Financeiro](#1-arquitetura-do-módulo-financeiro)
2. [Dashboard Financeiro Principal](#2-dashboard-financeiro-principal)
3. [Tela de Faturamento](#3-tela-de-faturamento)
4. [Tela de Cobranças](#4-tela-de-cobranças)
5. [Tela Fluxo de Caixa](#5-tela-fluxo-de-caixa)
6. [Relatórios Avançados](#6-relatórios-avançados)
7. [Gráficos Interativos com Chart.js](#7-gráficos-interativos-com-chartjs)
8. [JavaScript dos Gráficos](#8-javascript-dos-gráficos)

---

# 1. ARQUITETURA DO MÓDULO FINANCEIRO

## 1.1 Estrutura de Pastas

```
js/modules/financial/
├── index.js                         # Entry point
├── dashboard.js                     # Dashboard principal
├── billing.js                       # Gestão de faturamento
├── receivables.js                   # Gestão de cobranças
├── cashflow.js                      # Fluxo de caixa
├── reports.js                       # Relatórios
├── controllers/
│   ├── dashboard-controller.js
│   ├── billing-controller.js
│   ├── receivables-controller.js
│   └── reports-controller.js
├── services/
│   ├── financial.service.js         # APIs financeiras
│   ├── report.service.js            # Geração relatórios
│   ├── export.service.js            # Export (PDF/Excel)
│   └── calculation.service.js       # Cálculos
├── views/
│   ├── dashboard.view.js
│   ├── charts.view.js
│   ├── billing.view.js
│   └── reports.view.js
└── utils/
    ├── chart-config.js              # Configurações Chart.js
    ├── formatters.js                # Formatação de valores
    └── calculations.js              # Funções de cálculo

Módulos Financeiros:
├─ Dashboard (KPIs + Gráficos)
├─ Faturamento (Faturas, Emissão)
├─ Cobranças (Status, Histórico)
├─ Fluxo de Caixa (Previsão, Realizado)
└─ Relatórios (PDF, Excel, Filtros)
```

---

# 2. DASHBOARD FINANCEIRO PRINCIPAL

## 2.1 HTML do Dashboard Financeiro

```html
<div class="financial-dashboard-page">
  <!-- Header com Filtros -->
  <div class="dashboard-header">
    <h1>Dashboard Financeiro</h1>
    
    <div class="dashboard-filters">
      <div class="period-selector">
        <button class="period-btn active" data-period="month">
          Este Mês
        </button>
        <button class="period-btn" data-period="quarter">
          Este Trimestre
        </button>
        <button class="period-btn" data-period="year">
          Este Ano
        </button>
        <button class="period-btn" data-period="custom">
          Período Customizado
        </button>
      </div>

      <div class="date-range-selector" id="dateRange" style="display: none;">
        <input type="date" id="startDate" class="form-control">
        <span>até</span>
        <input type="date" id="endDate" class="form-control">
        <button class="btn btn-sm btn-primary">Aplicar</button>
      </div>

      <select id="filterClients" class="form-control">
        <option value="">Todos Clientes</option>
        <option value="xyz">Escritório XYZ</option>
        <option value="abc">Empresa ABC</option>
      </select>

      <button class="btn btn-secondary" id="exportDashboard">
        <i class="fas fa-download"></i> Exportar
      </button>
    </div>
  </div>

  <!-- KPI Cards -->
  <section class="kpi-section">
    <div class="kpi-grid">
      <!-- Receita Total -->
      <div class="kpi-card kpi-success">
        <div class="kpi-header">
          <h3 class="kpi-title">Receita Total</h3>
          <span class="kpi-icon"><i class="fas fa-dollar-sign"></i></span>
        </div>
        <div class="kpi-value" id="totalRevenue">R$ 0,00</div>
        <div class="kpi-change positive" id="revenueChange">
          <i class="fas fa-arrow-up"></i> 12% vs mês anterior
        </div>
      </div>

      <!-- Contas a Receber -->
      <div class="kpi-card kpi-warning">
        <div class="kpi-header">
          <h3 class="kpi-title">Contas a Receber</h3>
          <span class="kpi-icon"><i class="fas fa-hourglass"></i></span>
        </div>
        <div class="kpi-value" id="receivables">R$ 0,00</div>
        <div class="kpi-change" id="receivablesCount">
          <span id="receivablesNum">0</span> faturas pendentes
        </div>
      </div>

      <!-- Contas Vencidas -->
      <div class="kpi-card kpi-error">
        <div class="kpi-header">
          <h3 class="kpi-title">Contas Vencidas</h3>
          <span class="kpi-icon"><i class="fas fa-exclamation-circle"></i></span>
        </div>
        <div class="kpi-value" id="overdue">R$ 0,00</div>
        <div class="kpi-change" id="overdueCount">
          <span id="overdueNum">0</span> faturas vencidas
        </div>
      </div>

      <!-- Lucro Líquido -->
      <div class="kpi-card kpi-info">
        <div class="kpi-header">
          <h3 class="kpi-title">Lucro Líquido</h3>
          <span class="kpi-icon"><i class="fas fa-chart-line"></i></span>
        </div>
        <div class="kpi-value" id="netProfit">R$ 0,00</div>
        <div class="kpi-change" id="profitMargin">
          Margem: 45%
        </div>
      </div>

      <!-- Taxa de Adimplência -->
      <div class="kpi-card kpi-success">
        <div class="kpi-header">
          <h3 class="kpi-title">Taxa Adimplência</h3>
          <span class="kpi-icon"><i class="fas fa-check-circle"></i></span>
        </div>
        <div class="kpi-value" id="paymentRate">92%</div>
        <div class="kpi-change positive">
          <i class="fas fa-arrow-up"></i> 2% melhorado
        </div>
      </div>

      <!-- Ticket Médio -->
      <div class="kpi-card kpi-info">
        <div class="kpi-header">
          <h3 class="kpi-title">Ticket Médio</h3>
          <span class="kpi-icon"><i class="fas fa-calculator"></i></span>
        </div>
        <div class="kpi-value" id="avgTicket">R$ 5.230</div>
        <div class="kpi-change">
          Por demanda
        </div>
      </div>
    </div>
  </section>

  <!-- Gráficos Principais -->
  <section class="charts-section">
    <div class="charts-grid">
      <!-- Gráfico Receita Mensal -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Receita Mensal</h3>
          <div class="chart-controls">
            <button class="chart-view-btn active" data-view="line">
              <i class="fas fa-chart-line"></i>
            </button>
            <button class="chart-view-btn" data-view="bar">
              <i class="fas fa-chart-bar"></i>
            </button>
          </div>
        </div>
        <canvas id="revenueChart"></canvas>
      </div>

      <!-- Gráfico Receita por Cliente -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Receita por Cliente</h3>
        </div>
        <canvas id="clientRevenueChart"></canvas>
      </div>

      <!-- Gráfico Receita vs Despesa -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Receita vs Despesa</h3>
        </div>
        <canvas id="revenueExpenseChart"></canvas>
      </div>

      <!-- Gráfico Status de Pagamento -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Status de Pagamento</h3>
        </div>
        <canvas id="paymentStatusChart"></canvas>
      </div>

      <!-- Gráfico Fluxo de Caixa -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Fluxo de Caixa Projetado</h3>
        </div>
        <canvas id="cashflowChart"></canvas>
      </div>

      <!-- Gráfico Top Especialidades -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Receita por Especialidade</h3>
        </div>
        <canvas id="specialtyChart"></canvas>
      </div>
    </div>
  </section>

  <!-- Tabela de Faturas Recentes -->
  <section class="recent-invoices-section">
    <div class="section-header">
      <h3>Faturas Recentes</h3>
      <a href="#/financial/billing" class="btn btn-sm btn-outline">
        Ver Todas
      </a>
    </div>
    
    <div class="table-wrapper">
      <table class="table" id="recentInvoicesTable">
        <thead>
          <tr>
            <th>Número</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Data Emissão</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <!-- Renderizado dinamicamente -->
        </tbody>
      </table>
    </div>
  </section>
</div>

<!-- CSS Dashboard Financeiro -->
<style>
.financial-dashboard-page {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  margin-bottom: var(--spacing-xl);
}

.dashboard-header h1 {
  margin-bottom: var(--spacing-lg);
}

.dashboard-filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.period-selector {
  display: flex;
  gap: var(--spacing-sm);
  border-right: 1px solid var(--border-color);
  padding-right: var(--spacing-md);
}

.period-btn {
  padding: 0.5rem 1rem;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.period-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.period-btn.active {
  background-color: var(--color-primary);
  color: white;
}

.date-range-selector {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.date-range-selector input {
  max-width: 150px;
}

/* KPI Section */
.kpi-section {
  margin-bottom: var(--spacing-xl);
}

.kpi-grid {
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.kpi-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.kpi-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.kpi-title {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.kpi-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  font-size: 1.5rem;
}

.kpi-card.kpi-success .kpi-icon {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.kpi-card.kpi-error .kpi-icon {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.kpi-card.kpi-warning .kpi-icon {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.kpi-card.kpi-info .kpi-icon {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.kpi-change {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.kpi-change.positive {
  color: var(--color-success);
}

/* Charts Section */
.charts-section {
  margin-bottom: var(--spacing-xl);
}

.charts-grid {
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.chart-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.chart-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.chart-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.chart-view-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--border-color);
  background-color: transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-view-btn:hover {
  background-color: var(--bg-secondary);
}

.chart-view-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Recent Invoices */
.recent-invoices-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  border-bottom: 2px solid var(--border-color);
}

.table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.table tbody tr:hover {
  background-color: var(--bg-secondary);
}

/* Responsividade */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-filters {
    flex-direction: column;
  }

  .period-selector {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding-right: 0;
    padding-bottom: var(--spacing-md);
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .date-range-selector {
    flex-direction: column;
  }

  .date-range-selector input {
    max-width: 100%;
  }

  .chart-card {
    min-height: 300px;
  }
}
</style>
```

---

# 3. TELA DE FATURAMENTO

## 3.1 HTML de Faturamento

```html
<div class="billing-page">
  <!-- Header -->
  <div class="page-header">
    <h1>Gestão de Faturamento</h1>
    <button class="btn btn-primary" id="newInvoiceBtn">
      <i class="fas fa-plus"></i> Nova Fatura
    </button>
  </div>

  <!-- Filtros -->
  <div class="billing-filters">
    <input 
      type="text" 
      id="invoiceSearch" 
      class="form-control" 
      placeholder="Buscar por número, cliente..."
    >

    <select id="invoiceStatus" class="form-control">
      <option value="">Todos Status</option>
      <option value="draft">Rascunho</option>
      <option value="issued">Emitida</option>
      <option value="pending">Pendente</option>
      <option value="paid">Paga</option>
      <option value="overdue">Vencida</option>
      <option value="cancelled">Cancelada</option>
    </select>

    <input 
      type="date" 
      id="invoiceFromDate" 
      class="form-control"
      placeholder="Data Início"
    >

    <input 
      type="date" 
      id="invoiceToDate" 
      class="form-control"
      placeholder="Data Fim"
    >

    <button class="btn btn-secondary" id="billingExport">
      <i class="fas fa-download"></i> Exportar
    </button>
  </div>

  <!-- Estatísticas Rápidas -->
  <div class="billing-stats">
    <div class="stat-card">
      <span class="stat-label">Emitidas Este Mês</span>
      <span class="stat-value" id="issuedThisMonth">0</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Valor Total Emitido</span>
      <span class="stat-value" id="totalIssuedValue">R$ 0</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Média por Fatura</span>
      <span class="stat-value" id="avgInvoiceValue">R$ 0</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Taxa Emissão/Dia</span>
      <span class="stat-value" id="issueRate">0</span>
    </div>
  </div>

  <!-- Tabela de Faturas -->
  <div class="table-wrapper">
    <table class="table" id="invoicesTable">
      <thead>
        <tr>
          <th>Número</th>
          <th>Cliente</th>
          <th>Valor</th>
          <th>Data Emissão</th>
          <th>Vencimento</th>
          <th>Status</th>
          <th>Dias Vencimento</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Renderizado dinamicamente -->
      </tbody>
    </table>
  </div>

  <!-- Paginação -->
  <div class="pagination">
    <button class="btn btn-secondary" id="prevPageBilling">← Anterior</button>
    <span>Página <span id="currentPageBilling">1</span> de <span id="totalPagesBilling">1</span></span>
    <button class="btn btn-secondary" id="nextPageBilling">Próxima →</button>
  </div>
</div>

<!-- CSS Faturamento -->
<style>
.billing-page {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.billing-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.billing-filters > * {
  flex: 1;
  min-width: 150px;
}

.billing-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.table-wrapper {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  align-items: center;
}
</style>
```

---

# 4. TELA DE COBRANÇAS

## 4.1 HTML de Cobranças

```html
<div class="receivables-page">
  <!-- Header -->
  <div class="page-header">
    <h1>Gestão de Cobranças</h1>
    <div class="header-actions">
      <button class="btn btn-outline" id="sendReminder">
        <i class="fas fa-envelope"></i> Enviar Lembrete
      </button>
      <button class="btn btn-secondary" id="receivablesExport">
        <i class="fas fa-download"></i> Exportar
      </button>
    </div>
  </div>

  <!-- KPIs de Cobranças -->
  <div class="receivables-kpis">
    <div class="kpi-box">
      <h3>Total em Aberto</h3>
      <p class="kpi-value-large" id="totalOpen">R$ 0,00</p>
      <p class="kpi-sublabel" id="openCount">0 faturas</p>
    </div>
    <div class="kpi-box warning">
      <h3>Vencidas</h3>
      <p class="kpi-value-large" id="overdueTotal">R$ 0,00</p>
      <p class="kpi-sublabel" id="overdueCount">0 faturas</p>
    </div>
    <div class="kpi-box">
      <h3>A Vencer (7 dias)</h3>
      <p class="kpi-value-large" id="dueSoon">R$ 0,00</p>
      <p class="kpi-sublabel" id="dueSoonCount">0 faturas</p>
    </div>
    <div class="kpi-box success">
      <h3>Taxa Recebimento</h3>
      <p class="kpi-value-large" id="receivingRate">92%</p>
      <p class="kpi-sublabel">Últimas 4 semanas</p>
    </div>
  </div>

  <!-- Gráfico Aging -->
  <div class="chart-container">
    <div class="chart-header">
      <h3>Análise de Vencimento (Aging)</h3>
    </div>
    <canvas id="agingChart"></canvas>
  </div>

  <!-- Tabela de Cobranças -->
  <div class="receivables-filters">
    <input 
      type="text" 
      class="form-control" 
      placeholder="Buscar fatura..."
    >

    <select class="form-control">
      <option value="">Todos Status</option>
      <option value="pending">Pendente</option>
      <option value="overdue">Vencida</option>
      <option value="due_soon">A Vencer</option>
    </select>

    <select class="form-control">
      <option value="">Ordenar por</option>
      <option value="due_date">Data Vencimento</option>
      <option value="value">Valor (Maior)</option>
      <option value="client">Cliente</option>
    </select>
  </div>

  <div class="table-wrapper">
    <table class="table" id="receivablesTable">
      <thead>
        <tr>
          <th>Número</th>
          <th>Cliente</th>
          <th>Valor</th>
          <th>Data Vencimento</th>
          <th>Dias Vencido</th>
          <th>Status</th>
          <th>Última Cobrança</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Renderizado dinamicamente -->
      </tbody>
    </table>
  </div>
</div>

<!-- CSS Cobranças -->
<style>
.receivables-page {
  padding: var(--spacing-lg);
}

.receivables-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.kpi-box {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  border-left: 4px solid var(--color-primary);
}

.kpi-box.warning {
  border-left-color: var(--color-error);
}

.kpi-box.success {
  border-left-color: var(--color-success);
}

.kpi-box h3 {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.kpi-value-large {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.kpi-sublabel {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.chart-container {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.receivables-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.receivables-filters > * {
  flex: 1;
  min-width: 150px;
}
</style>
```

---

# 5. TELA FLUXO DE CAIXA

## 5.1 HTML Fluxo de Caixa

```html
<div class="cashflow-page">
  <div class="page-header">
    <h1>Fluxo de Caixa</h1>
  </div>

  <!-- Seletor de Período -->
  <div class="cashflow-period-selector">
    <button class="period-btn active" data-period="month">
      Mensal
    </button>
    <button class="period-btn" data-period="quarter">
      Trimestral
    </button>
    <button class="period-btn" data-period="year">
      Anual
    </button>
  </div>

  <!-- Gráfico Principal -->
  <div class="chart-container">
    <h3>Fluxo de Caixa Projetado</h3>
    <canvas id="mainCashflowChart"></canvas>
  </div>

  <!-- KPIs de Fluxo -->
  <div class="cashflow-kpis">
    <div class="kpi-card">
      <h4>Saldo Atual</h4>
      <p class="value" id="currentBalance">R$ 0,00</p>
    </div>
    <div class="kpi-card">
      <h4>Projeção 30 Dias</h4>
      <p class="value" id="projection30">R$ 0,00</p>
    </div>
    <div class="kpi-card">
      <h4>Ingressos Previstos</h4>
      <p class="value positive" id="expectedIncome">R$ 0,00</p>
    </div>
    <div class="kpi-card">
      <h4>Saídas Previstas</h4>
      <p class="value negative" id="expectedExpense">R$ 0,00</p>
    </div>
  </div>

  <!-- Tabela Detalhada -->
  <div class="cashflow-table-section">
    <h3>Movimento por Data</h3>
    
    <table class="table" id="cashflowTable">
      <thead>
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th>Tipo</th>
          <th>Ingressos</th>
          <th>Saídas</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        <!-- Renderizado dinamicamente -->
      </tbody>
    </table>
  </div>

  <!-- Cenários -->
  <div class="scenarios-section">
    <h3>Análise de Cenários</h3>
    
    <div class="scenarios-grid">
      <div class="scenario-card optimistic">
        <h4>Cenário Otimista</h4>
        <p>Taxa recebimento: 95%</p>
        <p class="scenario-value">R$ 250.000</p>
      </div>
      <div class="scenario-card realistic">
        <h4>Cenário Realista</h4>
        <p>Taxa recebimento: 85%</p>
        <p class="scenario-value">R$ 215.000</p>
      </div>
      <div class="scenario-card pessimistic">
        <h4>Cenário Pessimista</h4>
        <p>Taxa recebimento: 70%</p>
        <p class="scenario-value">R$ 180.000</p>
      </div>
    </div>
  </div>
</div>

<!-- CSS Fluxo de Caixa -->
<style>
.cashflow-page {
  padding: var(--spacing-lg);
}

.cashflow-period-selector {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.period-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.period-btn:hover {
  background-color: var(--bg-secondary);
}

.period-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.cashflow-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.kpi-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.kpi-card h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.kpi-card .value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.kpi-card .value.positive {
  color: var(--color-success);
}

.kpi-card .value.negative {
  color: var(--color-error);
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.scenario-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  border-left: 4px solid var(--color-primary);
}

.scenario-card.optimistic {
  border-left-color: var(--color-success);
}

.scenario-card.realistic {
  border-left-color: var(--color-primary);
}

.scenario-card.pessimistic {
  border-left-color: var(--color-error);
}

.scenario-value {
  margin: var(--spacing-md) 0 0 0;
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
}
</style>
```

---

# 6. RELATÓRIOS AVANÇADOS

## 6.1 HTML Relatórios

```html
<div class="reports-page">
  <div class="page-header">
    <h1>Relatórios Financeiros</h1>
  </div>

  <!-- Seletor de Relatório -->
  <div class="report-selector">
    <h3>Selecione um Relatório</h3>
    
    <div class="report-grid">
      <div class="report-card" id="reportReceivedByClient">
        <i class="fas fa-chart-pie"></i>
        <h4>Receita por Cliente</h4>
        <p>Análise de receita por cliente</p>
      </div>

      <div class="report-card" id="reportReceivedBySpecialty">
        <i class="fas fa-chart-bar"></i>
        <h4>Receita por Especialidade</h4>
        <p>Análise de receita por tipo de trabalho</p>
      </div>

      <div class="report-card" id="reportFinancialSummary">
        <i class="fas fa-file-invoice-dollar"></i>
        <h4>Resumo Financeiro</h4>
        <p>Relatório completo de receitas e despesas</p>
      </div>

      <div class="report-card" id="reportAging">
        <i class="fas fa-hourglass"></i>
        <h4>Análise de Vencimento</h4>
        <p>Distribuição de faturas por tempo de vencimento</p>
      </div>

      <div class="report-card" id="reportProfitability">
        <i class="fas fa-chart-line"></i>
        <h4>Lucratividade</h4>
        <p>Análise de margem de lucro por demanda</p>
      </div>

      <div class="report-card" id="reportCashflow">
        <i class="fas fa-cash-register"></i>
        <h4>Fluxo de Caixa</h4>
        <p>Projeção e análise de fluxo de caixa</p>
      </div>
    </div>
  </div>

  <!-- Filtros de Relatório -->
  <div class="report-filters" id="reportFilters" style="display: none;">
    <div class="filter-group">
      <label>Data Início</label>
      <input type="date" id="reportStartDate" class="form-control">
    </div>

    <div class="filter-group">
      <label>Data Fim</label>
      <input type="date" id="reportEndDate" class="form-control">
    </div>

    <div class="filter-group">
      <label>Cliente</label>
      <select id="reportClientFilter" class="form-control">
        <option value="">Todos</option>
        <option value="xyz">Escritório XYZ</option>
        <option value="abc">Empresa ABC</option>
      </select>
    </div>

    <div class="filter-group">
      <label>Especialidade</label>
      <select id="reportSpecialtyFilter" class="form-control">
        <option value="">Todas</option>
        <option value="civil">Civil</option>
        <option value="trabalhista">Trabalhista</option>
      </select>
    </div>

    <button class="btn btn-primary" id="generateReport">
      Gerar Relatório
    </button>

    <button class="btn btn-secondary" id="exportReportPDF">
      <i class="fas fa-file-pdf"></i> PDF
    </button>

    <button class="btn btn-secondary" id="exportReportExcel">
      <i class="fas fa-file-excel"></i> Excel
    </button>
  </div>

  <!-- Conteúdo do Relatório -->
  <div class="report-content" id="reportContent" style="display: none;">
    <!-- Renderizado dinamicamente -->
  </div>
</div>

<!-- CSS Relatórios -->
<style>
.reports-page {
  padding: var(--spacing-lg);
}

.report-selector {
  margin-bottom: var(--spacing-xl);
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.report-card {
  background-color: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.report-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.report-card i {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.report-card h4 {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
}

.report-card p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.report-filters {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.report-content {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}
</style>
```

---

# 7. GRÁFICOS INTERATIVOS COM CHART.JS

## 7.1 Configuração dos Gráficos

```javascript
// js/modules/financial/utils/chart-config.js
export const chartColors = {
  primary: '#2465a7',
  secondary: '#6c63ff',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#e8eff7',
  gray: '#6b7280'
};

export const getRevenueChartConfig = (data) => ({
  type: 'line',
  data: {
    labels: data.months,
    datasets: [{
      label: 'Receita',
      data: data.values,
      borderColor: chartColors.primary,
      backgroundColor: 'rgba(36, 101, 167, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0,0,0,0.8)',
        callbacks: {
          label: (context) => {
            return `R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `R$ ${(value/1000).toFixed(0)}k`
        }
      }
    }
  }
});

export const getClientRevenueChartConfig = (data) => ({
  type: 'doughnut',
  data: {
    labels: data.clients,
    datasets: [{
      data: data.values,
      backgroundColor: [
        chartColors.primary,
        chartColors.secondary,
        chartColors.success,
        chartColors.warning,
        chartColors.info
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `R$ ${context.parsed.toLocaleString('pt-BR')} (${percentage}%)`;
          }
        }
      }
    }
  }
});

export const getPaymentStatusChartConfig = (data) => ({
  type: 'bar',
  data: {
    labels: ['Pago', 'Pendente', 'Vencido'],
    datasets: [{
      label: 'Quantidade',
      data: [data.paid, data.pending, data.overdue],
      backgroundColor: [
        chartColors.success,
        chartColors.warning,
        chartColors.error
      ]
    }]
  },
  options: {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    }
  }
});

export const getCashflowChartConfig = (data) => ({
  type: 'area',
  data: {
    labels: data.dates,
    datasets: [
      {
        label: 'Ingressos',
        data: data.income,
        borderColor: chartColors.success,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Saídas',
        data: data.expenses,
        borderColor: chartColors.error,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Saldo',
        data: data.balance,
        borderColor: chartColors.primary,
        borderWidth: 2,
        fill: false,
        type: 'line'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `R$ ${(value/1000).toFixed(0)}k`
        }
      }
    }
  }
});
```

---

# 8. JAVASCRIPT DOS GRÁFICOS

## 8.1 Controlador de Gráficos

```javascript
// js/modules/financial/controllers/dashboard-controller.js
import FinancialService from '../services/financial.service.js';
import * as ChartConfigs from '../utils/chart-config.js';

export class FinancialDashboardController {
  constructor() {
    this.charts = {};
    this.financialData = {};
    this.init();
  }

  async init() {
    await this.loadData();
    this.renderCharts();
    this.setupEventListeners();
  }

  async loadData() {
    try {
      this.financialData = await FinancialService.getDashboardData();
      this.updateKPIs();
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  }

  updateKPIs() {
    const data = this.financialData;

    // Atualizar valores
    document.getElementById('totalRevenue').textContent = 
      this.formatCurrency(data.totalRevenue);
    
    document.getElementById('receivables').textContent = 
      this.formatCurrency(data.receivables);
    
    document.getElementById('overdue').textContent = 
      this.formatCurrency(data.overdue);
    
    document.getElementById('netProfit').textContent = 
      this.formatCurrency(data.netProfit);

    // Atualizar badges
    document.getElementById('receivablesNum').textContent = data.receivablesCount;
    document.getElementById('overdueNum').textContent = data.overdueCount;
  }

  renderCharts() {
    // Gráfico Receita Mensal
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
      const config = ChartConfigs.getRevenueChartConfig(
        this.financialData.monthlyRevenue
      );
      this.charts.revenue = new Chart(revenueCtx, config);
    }

    // Gráfico Receita por Cliente
    const clientCtx = document.getElementById('clientRevenueChart')?.getContext('2d');
    if (clientCtx) {
      const config = ChartConfigs.getClientRevenueChartConfig(
        this.financialData.clientRevenue
      );
      this.charts.clientRevenue = new Chart(clientCtx, config);
    }

    // Gráfico Status de Pagamento
    const statusCtx = document.getElementById('paymentStatusChart')?.getContext('2d');
    if (statusCtx) {
      const config = ChartConfigs.getPaymentStatusChartConfig(
        this.financialData.paymentStatus
      );
      this.charts.paymentStatus = new Chart(statusCtx, config);
    }

    // Gráfico Fluxo de Caixa
    const cashflowCtx = document.getElementById('cashflowChart')?.getContext('2d');
    if (cashflowCtx) {
      const config = ChartConfigs.getCashflowChartConfig(
        this.financialData.cashflow
      );
      this.charts.cashflow = new Chart(cashflowCtx, config);
    }
  }

  setupEventListeners() {
    // Filtro por período
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.onPeriodChange(e.target.dataset.period);
      });
    });

    // Exportar
    document.getElementById('exportDashboard')?.addEventListener('click', 
      () => this.exportDashboard());

    // Toggle de vista de gráfico
    document.querySelectorAll('.chart-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.changeChartView(e.target.closest('.chart-card'), e.target.dataset.view);
      });
    });
  }

  async onPeriodChange(period) {
    try {
      this.financialData = await FinancialService.getDashboardData({ period });
      this.updateKPIs();
      
      // Atualizar gráficos
      Object.keys(this.charts).forEach(key => {
        this.charts[key].destroy();
      });
      this.renderCharts();
    } catch (error) {
      console.error('Erro ao mudar período:', error);
    }
  }

  changeChartView(chartCard, view) {
    const canvas = chartCard.querySelector('canvas');
    // Implementar lógica para mudar tipo de gráfico
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  async exportDashboard() {
    try {
      await FinancialService.exportDashboard(this.financialData);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  }
}

export default new FinancialDashboardController();
```

---

## 8.2 Serviço Financeiro (Mock API)

```javascript
// js/modules/financial/services/financial.service.js
export class FinancialService {
  async getDashboardData(filters = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalRevenue: 125500,
          receivables: 35200,
          overdue: 8900,
          netProfit: 45800,
          receivablesCount: 12,
          overdueCount: 3,
          paymentRate: 92,
          avgTicket: 5230,

          monthlyRevenue: {
            months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            values: [28500, 32100, 29800, 35100, 38200, 42100]
          },

          clientRevenue: {
            clients: ['Escritório XYZ', 'Empresa ABC', 'Consultoria DEF', 'Indústria GHI'],
            values: [45000, 32100, 28500, 19900]
          },

          paymentStatus: {
            paid: 65,
            pending: 15,
            overdue: 8
          },

          cashflow: {
            dates: ['01/11', '02/11', '03/11', '04/11', '05/11', '06/11'],
            income: [18000, 22500, 19800, 25400, 28100, 32500],
            expenses: [12000, 15200, 14300, 16800, 18900, 20100],
            balance: [35000, 42300, 47800, 56400, 65600, 77000]
          }
        });
      }, 800);
    });
  }

  async exportDashboard(data) {
    // Implementar exportação
    console.log('Exportando dashboard...', data);
  }
}

export default new FinancialService();
```

---

**Módulo Financeiro Completo com Dashboards e Gráficos** ✅