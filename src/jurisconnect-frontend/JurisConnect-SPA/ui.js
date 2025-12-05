// UI rendering functions
import { authService } from './auth.js';
import { formatCurrency } from './utils.js';
import {
  getKPIsAPI,
  getReceitasSemanaAPI,
  getDemandasStatusAPI,
  getDemandasRecentesAPI
} from './api.js';

export function renderLogin() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">JC</div>
          <h1 class="login-title">JurisConnect</h1>
          <p class="login-subtitle">Sistema de Gestão Jurídica</p>
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              class="form-input"
              placeholder="seu@email.com"
              required
              autocomplete="email"
            />
            <span class="form-error" id="email-error"></span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Senha</label>
            <div class="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                class="form-input"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
              <span class="input-icon" id="toggle-password" role="button" aria-label="Mostrar senha">👁️</span>
            </div>
            <span class="form-error" id="password-error"></span>
          </div>

          <div class="form-options">
            <div class="checkbox-group">
              <input type="checkbox" id="remember" name="remember" />
              <label for="remember">Lembrar-me</label>
            </div>
            <a href="#" class="forgot-password" id="forgot-password-link">Esqueceu a senha?</a>
          </div>

          <button type="submit" class="btn" id="login-btn">
            <span>Entrar</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderDashboard() {
  const user = authService.getUser();

  return `
    <div class="dashboard">
      <!-- Sidebar -->
      <aside class="sidebar" role="navigation" aria-label="Menu principal">
        <div class="sidebar-logo">
          <div class="sidebar-logo-icon">JC</div>
          <span class="sidebar-logo-text">JurisConnect</span>
        </div>

        <nav>
          <ul class="sidebar-nav">
            <li class="nav-item">
              <a href="#dashboard" class="nav-link active" data-route="dashboard">
                <span class="nav-icon">📊</span>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#clientes" class="nav-link" data-route="clientes">
                <span class="nav-icon">👥</span>
                <span>Clientes</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#correspondentes" class="nav-link" data-route="correspondentes">
                <span class="nav-icon">⚖️</span>
                <span>Correspondentes</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#demandas" class="nav-link" data-route="demandas">
                <span class="nav-icon">📋</span>
                <span>Demandas</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#agenda" class="nav-link" data-route="agenda">
                <span class="nav-icon">📅</span>
                <span>Agenda</span>
              </a>
            </li>
            <li class="nav-item">
              <a href="#financeiro" class="nav-link" data-route="financeiro">
                <span class="nav-icon">💰</span>
                <span>Financeiro</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-search">
            <span class="header-search-icon">🔍</span>
            <input type="search" placeholder="Buscar..." aria-label="Buscar" />
          </div>

          <div class="header-actions">
            <button class="header-icon-btn" aria-label="Notificações">
              🔔
              <span class="badge">3</span>
            </button>

            <div class="header-profile" id="profile-menu" role="button" tabindex="0" aria-label="Menu do perfil">
              <div class="profile-avatar">${user ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}</div>
              <div class="profile-info">
                <div class="profile-name">${user ? user.nome : 'Usuário'}</div>
                <div class="profile-role">${user ? user.role : 'Role'}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <div class="content" id="dashboard-content">
          <div class="content-header">
            <h1 class="content-title">Dashboard</h1>
            <p class="content-subtitle">Visão geral do sistema</p>
          </div>

          <!-- KPI Cards -->
          <div class="kpi-grid" id="kpi-grid">
            <!-- KPIs will be loaded dynamically -->
          </div>

          <!-- Charts -->
          <div class="charts-grid">
            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">Receita Semanal</h3>
              </div>
              <div class="chart-container">
                <canvas id="revenue-chart"></canvas>
              </div>
            </div>

            <div class="chart-card">
              <div class="chart-header">
                <h3 class="chart-title">Demandas por Status</h3>
              </div>
              <div class="chart-container">
                <canvas id="demands-chart"></canvas>
              </div>
            </div>
          </div>

          <!-- Recent Demands Table -->
          <div class="table-card">
            <div class="table-header">
              <h3 class="table-title">Demandas Recentes</h3>
              <div class="table-actions">
                <button class="btn-secondary">Filtrar</button>
                <button class="btn-secondary">Exportar</button>
              </div>
            </div>
            <div class="table-wrapper">
              <table id="demands-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Cliente</th>
                    <th>Especialidade</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody id="demands-tbody">
                  <!-- Table rows will be loaded dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

export async function loadDashboardData() {
  try {
    // Load KPIs
    const kpis = await getKPIsAPI();
    renderKPIs(kpis);

    // Load Charts
    const receitasData = await getReceitasSemanaAPI();
    const demandasData = await getDemandasStatusAPI();
    renderCharts(receitasData, demandasData);

    // Load Table
    const demandas = await getDemandasRecentesAPI();
    renderDemandsTable(demandas);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function renderKPIs(kpis) {
  const kpiGrid = document.getElementById('kpi-grid');
  if (!kpiGrid) return;

  kpiGrid.innerHTML = `
    <div class="kpi-card blue">
      <div class="kpi-header">
        <span class="kpi-title">Demandas Ativas</span>
        <div class="kpi-icon">📋</div>
      </div>
      <div class="kpi-value">${kpis.demandas_ativas}</div>
      <div class="kpi-footer">
        <span>↑ 12%</span>
        <span>vs. mês anterior</span>
      </div>
    </div>

    <div class="kpi-card green">
      <div class="kpi-header">
        <span class="kpi-title">Receita Mensal</span>
        <div class="kpi-icon">💰</div>
      </div>
      <div class="kpi-value">${formatCurrency(kpis.receita_mes)}</div>
      <div class="kpi-footer">
        <span>↑ 8%</span>
        <span>vs. mês anterior</span>
      </div>
    </div>

    <div class="kpi-card purple">
      <div class="kpi-header">
        <span class="kpi-title">Correspondentes</span>
        <div class="kpi-icon">⚖️</div>
      </div>
      <div class="kpi-value">${kpis.correspondentes}</div>
      <div class="kpi-footer">
        <span>↑ 2</span>
        <span>novos este mês</span>
      </div>
    </div>

    <div class="kpi-card orange">
      <div class="kpi-header">
        <span class="kpi-title">Taxa Cumprimento</span>
        <div class="kpi-icon">✅</div>
      </div>
      <div class="kpi-value">${kpis.taxa_cumprimento}%</div>
      <div class="kpi-footer">
        <span>↑ 5%</span>
        <span>vs. mês anterior</span>
      </div>
    </div>
  `;
}

function renderCharts(receitasData, demandasData) {
  // Revenue Chart
  const revenueCtx = document.getElementById('revenue-chart');
  if (revenueCtx && window.Chart) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: receitasData.map(d => d.semana),
        datasets: [{
          label: 'Receita (R$)',
          data: receitasData.map(d => d.valor),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + (value / 1000) + 'k';
              }
            }
          }
        }
      }
    });
  }

  // Demands Chart
  const demandsCtx = document.getElementById('demands-chart');
  if (demandsCtx && window.Chart) {
    const colors = {
      primary: '#2465a7',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b'
    };

    new Chart(demandsCtx, {
      type: 'doughnut',
      data: {
        labels: demandasData.map(d => d.status),
        datasets: [{
          data: demandasData.map(d => d.quantidade),
          backgroundColor: demandasData.map(d => colors[d.cor]),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

function renderDemandsTable(demandas) {
  const tbody = document.getElementById('demands-tbody');
  if (!tbody) return;

  tbody.innerHTML = demandas.map(d => `
    <tr>
      <td><strong>${d.numero}</strong></td>
      <td>${d.cliente}</td>
      <td>${d.especialidade}</td>
      <td><span class="status-badge ${d.status.toLowerCase()}">${d.status}</span></td>
      <td>${d.data}</td>
    </tr>
  `).join('');
}