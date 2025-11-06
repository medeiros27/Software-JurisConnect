# JURISCONNECT - SIDEBAR RESPONSIVO COM MENU HIERÁRQUICO

## 📋 ÍNDICE

1. [Estrutura HTML Completa](#1-estrutura-html-completa)
2. [CSS da Sidebar](#2-css-da-sidebar)
3. [JavaScript Interativo](#3-javascript-interativo)
4. [Estados e Variações](#4-estados-e-variações)
5. [Responsividade](#5-responsividade)
6. [Acessibilidade](#6-acessibilidade)

---

# 1. ESTRUTURA HTML COMPLETA

## 1.1 HTML da Sidebar com Menu Hierárquico

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JurisConnect - Sidebar</title>
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/sidebar.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <!-- App Wrapper -->
  <div class="app-wrapper">
    
    <!-- ========== SIDEBAR ========== -->
    <aside class="sidebar" id="sidebar" role="navigation" aria-label="Menu principal">
      
      <!-- ========== SIDEBAR HEADER ========== -->
      <div class="sidebar-header">
        <a href="/" class="sidebar-logo" aria-label="JurisConnect - Página inicial">
          <div class="logo-icon">
            <i class="fas fa-gavel"></i>
          </div>
          <span class="logo-text">JurisConnect</span>
        </a>
        
        <!-- Toggle button (visível em mobile) -->
        <button 
          class="sidebar-close" 
          id="sidebarClose"
          aria-label="Fechar menu"
          aria-expanded="true"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- ========== SIDEBAR SEARCH ========== -->
      <div class="sidebar-search">
        <div class="search-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar menu..."
            aria-label="Buscar no menu"
            id="menuSearch"
          >
          <button 
            class="search-clear" 
            style="display: none;"
            aria-label="Limpar busca"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- ========== SIDEBAR NAV ========== -->
      <nav class="sidebar-nav" id="sidebarNav">
        
        <!-- Dashboard (sem submenu) -->
        <div class="nav-group">
          <ul class="nav-list">
            <li class="nav-item">
              <a href="/dashboard" class="nav-link active" aria-current="page">
                <i class="nav-icon fas fa-chart-line"></i>
                <span class="nav-text">Dashboard</span>
                <span class="nav-badge">3</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Grupo: Operações -->
        <div class="nav-group">
          <div class="nav-group-title">Operações</div>
          <ul class="nav-list">
            
            <!-- Demandas (com submenu) -->
            <li class="nav-item has-submenu">
              <a 
                href="#" 
                class="nav-link" 
                aria-expanded="false"
                aria-controls="submenu-demandas"
              >
                <i class="nav-icon fas fa-briefcase"></i>
                <span class="nav-text">Demandas</span>
                <i class="nav-arrow fas fa-chevron-down"></i>
              </a>
              <ul class="nav-submenu" id="submenu-demandas">
                <li class="nav-subitem">
                  <a href="/demandas/lista" class="nav-sublink">
                    <i class="nav-subicon fas fa-list"></i>
                    <span class="nav-subtext">Todas Demandas</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/demandas/nova" class="nav-sublink">
                    <i class="nav-subicon fas fa-plus-circle"></i>
                    <span class="nav-subtext">Nova Demanda</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/demandas/em-andamento" class="nav-sublink">
                    <i class="nav-subicon fas fa-spinner"></i>
                    <span class="nav-subtext">Em Andamento</span>
                    <span class="nav-subbadge">12</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/demandas/concluidas" class="nav-sublink">
                    <i class="nav-subicon fas fa-check-circle"></i>
                    <span class="nav-subtext">Concluídas</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/demandas/atrasadas" class="nav-sublink">
                    <i class="nav-subicon fas fa-exclamation-triangle"></i>
                    <span class="nav-subtext">Atrasadas</span>
                    <span class="nav-subbadge danger">5</span>
                  </a>
                </li>
              </ul>
            </li>

            <!-- Clientes -->
            <li class="nav-item">
              <a href="/clientes" class="nav-link">
                <i class="nav-icon fas fa-users"></i>
                <span class="nav-text">Clientes</span>
              </a>
            </li>

            <!-- Correspondentes (com submenu) -->
            <li class="nav-item has-submenu">
              <a 
                href="#" 
                class="nav-link"
                aria-expanded="false"
                aria-controls="submenu-correspondentes"
              >
                <i class="nav-icon fas fa-user-tie"></i>
                <span class="nav-text">Correspondentes</span>
                <i class="nav-arrow fas fa-chevron-down"></i>
              </a>
              <ul class="nav-submenu" id="submenu-correspondentes">
                <li class="nav-subitem">
                  <a href="/correspondentes/lista" class="nav-sublink">
                    <i class="nav-subicon fas fa-list"></i>
                    <span class="nav-subtext">Todos</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/correspondentes/novo" class="nav-sublink">
                    <i class="nav-subicon fas fa-user-plus"></i>
                    <span class="nav-subtext">Cadastrar</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/correspondentes/avaliacoes" class="nav-sublink">
                    <i class="nav-subicon fas fa-star"></i>
                    <span class="nav-subtext">Avaliações</span>
                  </a>
                </li>
              </ul>
            </li>

            <!-- Diligências -->
            <li class="nav-item">
              <a href="/diligencias" class="nav-link">
                <i class="nav-icon fas fa-tasks"></i>
                <span class="nav-text">Diligências</span>
                <span class="nav-badge danger">8</span>
              </a>
            </li>

          </ul>
        </div>

        <!-- Grupo: Financeiro -->
        <div class="nav-group">
          <div class="nav-group-title">Financeiro</div>
          <ul class="nav-list">
            
            <!-- Faturas (com submenu) -->
            <li class="nav-item has-submenu">
              <a 
                href="#" 
                class="nav-link"
                aria-expanded="false"
                aria-controls="submenu-faturas"
              >
                <i class="nav-icon fas fa-file-invoice-dollar"></i>
                <span class="nav-text">Faturas</span>
                <i class="nav-arrow fas fa-chevron-down"></i>
              </a>
              <ul class="nav-submenu" id="submenu-faturas">
                <li class="nav-subitem">
                  <a href="/faturas/todas" class="nav-sublink">
                    <i class="nav-subicon fas fa-list"></i>
                    <span class="nav-subtext">Todas</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/faturas/pendentes" class="nav-sublink">
                    <i class="nav-subicon fas fa-clock"></i>
                    <span class="nav-subtext">Pendentes</span>
                    <span class="nav-subbadge warning">7</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/faturas/pagas" class="nav-sublink">
                    <i class="nav-subicon fas fa-check"></i>
                    <span class="nav-subtext">Pagas</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/faturas/vencidas" class="nav-sublink">
                    <i class="nav-subicon fas fa-exclamation-circle"></i>
                    <span class="nav-subtext">Vencidas</span>
                    <span class="nav-subbadge danger">3</span>
                  </a>
                </li>
              </ul>
            </li>

            <!-- Pagamentos -->
            <li class="nav-item">
              <a href="/pagamentos" class="nav-link">
                <i class="nav-icon fas fa-credit-card"></i>
                <span class="nav-text">Pagamentos</span>
              </a>
            </li>

            <!-- Fluxo de Caixa -->
            <li class="nav-item">
              <a href="/fluxo-caixa" class="nav-link">
                <i class="nav-icon fas fa-chart-area"></i>
                <span class="nav-text">Fluxo de Caixa</span>
              </a>
            </li>

          </ul>
        </div>

        <!-- Grupo: Relatórios -->
        <div class="nav-group">
          <div class="nav-group-title">Relatórios</div>
          <ul class="nav-list">
            
            <!-- Relatórios (com submenu de 2 níveis) -->
            <li class="nav-item has-submenu">
              <a 
                href="#" 
                class="nav-link"
                aria-expanded="false"
                aria-controls="submenu-relatorios"
              >
                <i class="nav-icon fas fa-chart-bar"></i>
                <span class="nav-text">Relatórios</span>
                <i class="nav-arrow fas fa-chevron-down"></i>
              </a>
              <ul class="nav-submenu" id="submenu-relatorios">
                
                <!-- Financeiros (submenu de 2º nível) -->
                <li class="nav-subitem has-submenu">
                  <a href="#" class="nav-sublink" aria-expanded="false">
                    <i class="nav-subicon fas fa-dollar-sign"></i>
                    <span class="nav-subtext">Financeiros</span>
                    <i class="nav-subarrow fas fa-chevron-down"></i>
                  </a>
                  <ul class="nav-submenu-nested">
                    <li class="nav-nested-item">
                      <a href="/relatorios/receita" class="nav-nested-link">
                        <span class="nav-nested-text">Receita Mensal</span>
                      </a>
                    </li>
                    <li class="nav-nested-item">
                      <a href="/relatorios/fluxo" class="nav-nested-link">
                        <span class="nav-nested-text">Fluxo de Caixa</span>
                      </a>
                    </li>
                    <li class="nav-nested-item">
                      <a href="/relatorios/cobrancas" class="nav-nested-link">
                        <span class="nav-nested-text">Cobranças</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <!-- Operacionais (submenu de 2º nível) -->
                <li class="nav-subitem has-submenu">
                  <a href="#" class="nav-sublink" aria-expanded="false">
                    <i class="nav-subicon fas fa-cogs"></i>
                    <span class="nav-subtext">Operacionais</span>
                    <i class="nav-subarrow fas fa-chevron-down"></i>
                  </a>
                  <ul class="nav-submenu-nested">
                    <li class="nav-nested-item">
                      <a href="/relatorios/demandas" class="nav-nested-link">
                        <span class="nav-nested-text">Demandas</span>
                      </a>
                    </li>
                    <li class="nav-nested-item">
                      <a href="/relatorios/performance" class="nav-nested-link">
                        <span class="nav-nested-text">Performance</span>
                      </a>
                    </li>
                  </ul>
                </li>

                <!-- Relatório direto (sem submenu) -->
                <li class="nav-subitem">
                  <a href="/relatorios/executivo" class="nav-sublink">
                    <i class="nav-subicon fas fa-file-alt"></i>
                    <span class="nav-subtext">Dashboard Executivo</span>
                  </a>
                </li>

              </ul>
            </li>

          </ul>
        </div>

        <!-- Grupo: Configurações -->
        <div class="nav-group">
          <div class="nav-group-title">Sistema</div>
          <ul class="nav-list">
            
            <!-- Configurações (com submenu) -->
            <li class="nav-item has-submenu">
              <a 
                href="#" 
                class="nav-link"
                aria-expanded="false"
                aria-controls="submenu-config"
              >
                <i class="nav-icon fas fa-cog"></i>
                <span class="nav-text">Configurações</span>
                <i class="nav-arrow fas fa-chevron-down"></i>
              </a>
              <ul class="nav-submenu" id="submenu-config">
                <li class="nav-subitem">
                  <a href="/config/perfil" class="nav-sublink">
                    <i class="nav-subicon fas fa-user"></i>
                    <span class="nav-subtext">Perfil</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/config/empresa" class="nav-sublink">
                    <i class="nav-subicon fas fa-building"></i>
                    <span class="nav-subtext">Empresa</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/config/usuarios" class="nav-sublink">
                    <i class="nav-subicon fas fa-users-cog"></i>
                    <span class="nav-subtext">Usuários</span>
                  </a>
                </li>
                <li class="nav-subitem">
                  <a href="/config/integracao" class="nav-sublink">
                    <i class="nav-subicon fas fa-plug"></i>
                    <span class="nav-subtext">Integrações</span>
                  </a>
                </li>
              </ul>
            </li>

            <!-- Ajuda -->
            <li class="nav-item">
              <a href="/ajuda" class="nav-link">
                <i class="nav-icon fas fa-question-circle"></i>
                <span class="nav-text">Ajuda</span>
              </a>
            </li>

          </ul>
        </div>

      </nav>

      <!-- ========== SIDEBAR FOOTER ========== -->
      <div class="sidebar-footer">
        
        <!-- Usuário -->
        <div class="sidebar-user">
          <div class="user-avatar">
            <img src="/img/avatar.jpg" alt="João Silva">
          </div>
          <div class="user-info">
            <div class="user-name">João Silva</div>
            <div class="user-role">Administrador</div>
          </div>
          <button class="user-menu-toggle" aria-label="Menu do usuário">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>

        <!-- Dropdown do usuário -->
        <div class="user-dropdown" style="display: none;">
          <a href="/perfil" class="dropdown-item">
            <i class="fas fa-user"></i>
            <span>Meu Perfil</span>
          </a>
          <a href="/notificacoes" class="dropdown-item">
            <i class="fas fa-bell"></i>
            <span>Notificações</span>
            <span class="badge">3</span>
          </a>
          <div class="dropdown-divider"></div>
          <a href="/sair" class="dropdown-item text-danger">
            <i class="fas fa-sign-out-alt"></i>
            <span>Sair</span>
          </a>
        </div>

        <!-- Toggle collapsed (desktop) -->
        <button 
          class="sidebar-toggle" 
          id="sidebarToggle"
          aria-label="Expandir/Recolher menu"
          aria-expanded="true"
        >
          <i class="fas fa-angles-left"></i>
        </button>

      </div>

    </aside>

    <!-- ========== OVERLAY (Mobile) ========== -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- ========== MAIN CONTENT ========== -->
    <div class="main-container">
      <header class="header">
        <button class="toggle-sidebar-btn" id="toggleSidebar" aria-label="Abrir menu">
          <i class="fas fa-bars"></i>
        </button>
        <h1>Conteúdo Principal</h1>
      </header>
      <main class="main-content">
        <!-- Conteúdo da página -->
      </main>
    </div>

  </div>

  <script src="js/sidebar.js"></script>
</body>
</html>
```

---

# 2. CSS DA SIDEBAR

## 2.1 Arquivo: `css/sidebar.css`

```css
/*
 * SIDEBAR RESPONSIVO COM MENU HIERÁRQUICO
 * ========================================
 */

/* ========== VARIÁVEIS ========== */
:root {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --sidebar-bg: #ffffff;
  --sidebar-border: #e5e7eb;
  --sidebar-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  --nav-item-height: 44px;
  --nav-padding: 0.75rem 1rem;
  --nav-gap: 0.25rem;
  
  --nav-text-color: #6b7280;
  --nav-text-hover: #111827;
  --nav-text-active: #2465a7;
  
  --nav-bg-hover: #f3f4f6;
  --nav-bg-active: #e8eff7;
  
  --submenu-indent: 1rem;
  --submenu-bg: #f9fafb;
}

/* ========== APP WRAPPER ========== */
.app-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* ========== SIDEBAR BASE ========== */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--z-fixed);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* ========== SIDEBAR HEADER ========== */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--sidebar-border);
  min-height: 64px;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: var(--color-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  transition: all var(--transition-fast);
}

.sidebar-logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
  transition: all var(--transition-fast);
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
}

.sidebar-close {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.sidebar-close:hover {
  background-color: var(--bg-secondary);
}

/* ========== SIDEBAR SEARCH ========== */
.sidebar-search {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: var(--font-size-sm);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background-color: var(--bg-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  position: absolute;
  right: var(--spacing-sm);
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar.collapsed .sidebar-search {
  display: none;
}

/* ========== SIDEBAR NAV ========== */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md) 0;
}

/* Custom scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 999px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

/* ========== NAV GROUP ========== */
.nav-group {
  margin-bottom: var(--spacing-lg);
}

.nav-group:last-child {
  margin-bottom: 0;
}

.nav-group-title {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.sidebar.collapsed .nav-group-title {
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

/* ========== NAV LIST ========== */
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  position: relative;
}

/* ========== NAV LINK (Nível 1) ========== */
.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--nav-padding);
  color: var(--nav-text-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-left: 3px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
  min-height: var(--nav-item-height);
  position: relative;
}

.nav-link:hover {
  background-color: var(--nav-bg-hover);
  color: var(--nav-text-hover);
}

.nav-link.active {
  background-color: var(--nav-bg-active);
  color: var(--nav-text-active);
  border-left-color: var(--nav-text-active);
  font-weight: var(--font-weight-semibold);
}

.nav-icon {
  width: 20px;
  font-size: 1.125rem;
  flex-shrink: 0;
  text-align: center;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all var(--transition-fast);
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
}

.nav-arrow {
  font-size: 0.75rem;
  transition: transform var(--transition-fast);
  margin-left: auto;
}

.nav-link[aria-expanded="true"] .nav-arrow {
  transform: rotate(180deg);
}

.sidebar.collapsed .nav-arrow {
  display: none;
}

/* ========== NAV BADGE ========== */
.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background-color: var(--color-primary);
  color: var(--text-inverse);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  border-radius: 999px;
  margin-left: auto;
}

.nav-badge.danger {
  background-color: var(--color-error);
}

.nav-badge.warning {
  background-color: var(--color-warning);
}

.nav-badge.success {
  background-color: var(--color-success);
}

.sidebar.collapsed .nav-badge {
  display: none;
}

/* ========== SUBMENU (Nível 2) ========== */
.nav-submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: var(--submenu-bg);
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item.has-submenu.open > .nav-submenu {
  max-height: 500px;
  padding: var(--spacing-sm) 0;
}

.nav-subitem {
  position: relative;
}

.nav-sublink {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  padding-left: calc(var(--spacing-lg) + var(--submenu-indent) + 20px);
  color: var(--nav-text-color);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  min-height: 36px;
}

.nav-sublink:hover {
  background-color: var(--bg-secondary);
  color: var(--nav-text-hover);
}

.nav-sublink.active {
  background-color: var(--nav-bg-active);
  color: var(--nav-text-active);
  font-weight: var(--font-weight-medium);
}

.nav-subicon {
  width: 16px;
  font-size: 0.875rem;
  flex-shrink: 0;
  text-align: center;
}

.nav-subtext {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-subbadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  border-radius: 999px;
}

.nav-subbadge.danger {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.nav-subbadge.warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.nav-subarrow {
  font-size: 0.625rem;
  transition: transform var(--transition-fast);
  margin-left: auto;
}

.nav-subitem.has-submenu.open > .nav-sublink .nav-subarrow {
  transform: rotate(180deg);
}

/* ========== SUBMENU ANINHADO (Nível 3) ========== */
.nav-submenu-nested {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.02);
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-subitem.has-submenu.open > .nav-submenu-nested {
  max-height: 300px;
  padding: var(--spacing-xs) 0;
}

.nav-nested-item {
  position: relative;
}

.nav-nested-link {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-lg);
  padding-left: calc(var(--spacing-lg) + var(--submenu-indent) * 2 + 20px);
  color: var(--nav-text-color);
  text-decoration: none;
  font-size: var(--font-size-xs);
  transition: all var(--transition-fast);
  min-height: 32px;
}

.nav-nested-link:hover {
  background-color: var(--bg-primary);
  color: var(--nav-text-hover);
}

.nav-nested-link.active {
  background-color: var(--nav-bg-active);
  color: var(--nav-text-active);
  font-weight: var(--font-weight-medium);
}

.nav-nested-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========== SIDEBAR COLLAPSED (Tooltip) ========== */
.sidebar.collapsed .nav-item {
  position: relative;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar.collapsed .nav-item:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + var(--spacing-sm));
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--color-gray-800);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  z-index: var(--z-tooltip);
  box-shadow: var(--shadow-lg);
  animation: fadeIn 150ms;
}

/* ========== SIDEBAR FOOTER ========== */
.sidebar-footer {
  border-top: 1px solid var(--sidebar-border);
  padding: var(--spacing-md);
  flex-shrink: 0;
  position: relative;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-user:hover {
  background-color: var(--bg-secondary);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  overflow: hidden;
  transition: all var(--transition-fast);
}

.sidebar.collapsed .user-info {
  opacity: 0;
  width: 0;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-toggle {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.user-menu-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar.collapsed .user-menu-toggle {
  display: none;
}

/* ========== USER DROPDOWN ========== */
.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: var(--spacing-md);
  right: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-sm) 0;
  z-index: var(--z-dropdown);
  animation: slideUp 200ms;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.dropdown-item .badge {
  margin-left: auto;
  background-color: var(--color-error);
  color: var(--text-inverse);
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 0.625rem;
}

.dropdown-item.text-danger {
  color: var(--color-error);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-sm) 0;
}

/* ========== SIDEBAR TOGGLE (Desktop) ========== */
.sidebar-toggle {
  width: 100%;
  height: 40px;
  margin-top: var(--spacing-md);
  padding: 0;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  font-size: var(--font-size-base);
}

.sidebar-toggle:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sidebar.collapsed .sidebar-toggle i {
  transform: rotate(180deg);
}

/* ========== OVERLAY (Mobile) ========== */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-fixed) - 1);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.sidebar-overlay.show {
  display: block;
  opacity: 1;
}

/* ========== MAIN CONTENT ========== */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed + .sidebar-overlay + .main-container {
  margin-left: var(--sidebar-collapsed-width);
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  min-height: 64px;
}

.toggle-sidebar-btn {
  display: none;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  font-size: var(--font-size-lg);
}

.toggle-sidebar-btn:hover {
  background-color: var(--bg-secondary);
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

/* ========== RESPONSIVIDADE ========== */

/* Tablet (1024px) */
@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-collapsed-width);
  }

  .sidebar .logo-text,
  .sidebar .nav-text,
  .sidebar .nav-badge,
  .sidebar .nav-arrow,
  .sidebar .user-info,
  .sidebar .user-menu-toggle,
  .sidebar .nav-group-title,
  .sidebar .sidebar-search {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  .sidebar .nav-link {
    justify-content: center;
  }

  .main-container {
    margin-left: var(--sidebar-collapsed-width);
  }
}

/* Mobile (768px) */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-width);
    box-shadow: var(--sidebar-shadow);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.mobile-open .logo-text,
  .sidebar.mobile-open .nav-text,
  .sidebar.mobile-open .nav-badge,
  .sidebar.mobile-open .nav-arrow,
  .sidebar.mobile-open .user-info,
  .sidebar.mobile-open .user-menu-toggle,
  .sidebar.mobile-open .nav-group-title,
  .sidebar.mobile-open .sidebar-search {
    opacity: 1;
    width: auto;
  }

  .sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-toggle {
    display: none;
  }

  .main-container {
    margin-left: 0;
  }

  .toggle-sidebar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* ========== ANIMAÇÕES ========== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== SEARCH HIGHLIGHT ========== */
.nav-item.search-match {
  animation: highlight 500ms;
}

@keyframes highlight {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--color-warning-light);
  }
}

/* ========== SKELETON LOADING ========== */
.nav-item.loading {
  opacity: 0.5;
  pointer-events: none;
}

.nav-item.loading .nav-link {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

# 3. JAVASCRIPT INTERATIVO

## 3.1 Arquivo: `js/sidebar.js`

```javascript
/*
 * SIDEBAR INTERATIVO - JurisConnect
 * ==================================
 */

class Sidebar {
  constructor() {
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.sidebarClose = document.getElementById('sidebarClose');
    this.toggleSidebarBtn = document.getElementById('toggleSidebar');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
    this.menuSearch = document.getElementById('menuSearch');
    this.searchClear = document.querySelector('.search-clear');
    
    this.isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    this.isMobileOpen = false;
    
    this.init();
  }

  init() {
    // Restaurar estado collapsed
    if (this.isCollapsed && window.innerWidth > 768) {
      this.sidebar.classList.add('collapsed');
    }

    // Event listeners
    this.sidebarToggle?.addEventListener('click', () => this.toggleCollapse());
    this.sidebarClose?.addEventListener('click', () => this.closeMobile());
    this.toggleSidebarBtn?.addEventListener('click', () => this.openMobile());
    this.sidebarOverlay?.addEventListener('click', () => this.closeMobile());
    
    // Submenu toggles
    this.initSubmenuToggles();
    
    // Search
    this.initSearch();
    
    // User dropdown
    this.initUserDropdown();
    
    // Keyboard navigation
    this.initKeyboardNavigation();
    
    // Resize handler
    window.addEventListener('resize', () => this.handleResize());
    
    // Tooltips em collapsed
    this.initTooltips();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebar.classList.toggle('collapsed');
    
    localStorage.setItem('sidebar-collapsed', this.isCollapsed);
    
    // Fechar todos submenus ao colapsar
    if (this.isCollapsed) {
      this.closeAllSubmenus();
    }
    
    // Atualizar aria-expanded
    this.sidebarToggle?.setAttribute('aria-expanded', !this.isCollapsed);
  }

  openMobile() {
    this.isMobileOpen = true;
    this.sidebar.classList.add('mobile-open');
    this.sidebarOverlay?.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    this.sidebarClose?.setAttribute('aria-expanded', 'true');
  }

  closeMobile() {
    this.isMobileOpen = false;
    this.sidebar.classList.remove('mobile-open');
    this.sidebarOverlay?.classList.remove('show');
    document.body.style.overflow = '';
    
    this.sidebarClose?.setAttribute('aria-expanded', 'false');
  }

  initSubmenuToggles() {
    const submenuToggles = document.querySelectorAll('.nav-item.has-submenu > .nav-link');
    
    submenuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        
        const navItem = toggle.parentElement;
        const isOpen = navItem.classList.contains('open');
        const submenuId = toggle.getAttribute('aria-controls');
        
        // Fechar outros submenus no mesmo nível
        const siblings = navItem.parentElement.querySelectorAll('.nav-item.has-submenu.open');
        siblings.forEach(sibling => {
          if (sibling !== navItem) {
            sibling.classList.remove('open');
            const siblingToggle = sibling.querySelector('.nav-link');
            siblingToggle?.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle atual
        navItem.classList.toggle('open');
        toggle.setAttribute('aria-expanded', !isOpen);
        
        // Salvar estado no localStorage
        this.saveSubmenuState(submenuId, !isOpen);
      });
    });
    
    // Submenu de 2º nível
    const nestedToggles = document.querySelectorAll('.nav-subitem.has-submenu > .nav-sublink');
    
    nestedToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        
        const navItem = toggle.parentElement;
        const isOpen = navItem.classList.contains('open');
        
        // Fechar outros submenus aninhados
        const siblings = navItem.parentElement.querySelectorAll('.nav-subitem.has-submenu.open');
        siblings.forEach(sibling => {
          if (sibling !== navItem) {
            sibling.classList.remove('open');
            const siblingToggle = sibling.querySelector('.nav-sublink');
            siblingToggle?.setAttribute('aria-expanded', 'false');
          }
        });
        
        // Toggle atual
        navItem.classList.toggle('open');
        toggle.setAttribute('aria-expanded', !isOpen);
      });
    });
    
    // Restaurar estado dos submenus
    this.restoreSubmenuStates();
  }

  saveSubmenuState(submenuId, isOpen) {
    if (!submenuId) return;
    const states = JSON.parse(localStorage.getItem('submenu-states') || '{}');
    states[submenuId] = isOpen;
    localStorage.setItem('submenu-states', JSON.stringify(states));
  }

  restoreSubmenuStates() {
    const states = JSON.parse(localStorage.getItem('submenu-states') || '{}');
    
    Object.keys(states).forEach(submenuId => {
      if (states[submenuId]) {
        const toggle = document.querySelector(`[aria-controls="${submenuId}"]`);
        if (toggle) {
          const navItem = toggle.parentElement;
          navItem.classList.add('open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }

  closeAllSubmenus() {
    const openSubmenus = document.querySelectorAll('.nav-item.has-submenu.open');
    openSubmenus.forEach(item => {
      item.classList.remove('open');
      const toggle = item.querySelector('.nav-link');
      toggle?.setAttribute('aria-expanded', 'false');
    });
  }

  initSearch() {
    if (!this.menuSearch) return;
    
    this.menuSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      
      if (query.length > 0) {
        this.searchClear.style.display = 'block';
        this.filterMenu(query);
      } else {
        this.searchClear.style.display = 'none';
        this.clearSearch();
      }
    });
    
    this.searchClear?.addEventListener('click', () => {
      this.menuSearch.value = '';
      this.searchClear.style.display = 'none';
      this.clearSearch();
      this.menuSearch.focus();
    });
  }

  filterMenu(query) {
    const allNavItems = document.querySelectorAll('.nav-item, .nav-subitem');
    let hasResults = false;
    
    allNavItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const matches = text.includes(query);
      
      if (matches) {
        item.style.display = '';
        item.classList.add('search-match');
        hasResults = true;
        
        // Abrir submenu pai se necessário
        const parentSubmenu = item.closest('.nav-item.has-submenu');
        if (parentSubmenu) {
          parentSubmenu.classList.add('open');
          const toggle = parentSubmenu.querySelector('.nav-link');
          toggle?.setAttribute('aria-expanded', 'true');
        }
      } else {
        item.style.display = 'none';
        item.classList.remove('search-match');
      }
    });
    
    // Esconder grupos vazios
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
      const visibleItems = group.querySelectorAll('.nav-item:not([style*="display: none"])');
      group.style.display = visibleItems.length > 0 ? '' : 'none';
    });
  }

  clearSearch() {
    const allNavItems = document.querySelectorAll('.nav-item, .nav-subitem');
    allNavItems.forEach(item => {
      item.style.display = '';
      item.classList.remove('search-match');
    });
    
    const navGroups = document.querySelectorAll('.nav-group');
    navGroups.forEach(group => {
      group.style.display = '';
    });
    
    // Restaurar estado de submenus
    this.restoreSubmenuStates();
  }

  initUserDropdown() {
    const userToggle = document.querySelector('.sidebar-user');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (!userToggle || !userDropdown) return;
    
    userToggle.addEventListener('click', () => {
      const isVisible = userDropdown.style.display === 'block';
      userDropdown.style.display = isVisible ? 'none' : 'block';
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.style.display = 'none';
      }
    });
  }

  initKeyboardNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-sublink, .nav-nested-link');
    
    navLinks.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        switch(e.key) {
          case 'ArrowDown':
            e.preventDefault();
            navLinks[index + 1]?.focus();
            break;
          case 'ArrowUp':
            e.preventDefault();
            navLinks[index - 1]?.focus();
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            link.click();
            break;
          case 'Escape':
            if (this.isMobileOpen) {
              this.closeMobile();
            }
            break;
        }
      });
    });
  }

  initTooltips() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      const text = link?.querySelector('.nav-text')?.textContent;
      
      if (text) {
        item.setAttribute('data-tooltip', text);
      }
    });
  }

  handleResize() {
    const width = window.innerWidth;
    
    if (width > 768 && this.isMobileOpen) {
      this.closeMobile();
    }
    
    if (width <= 768) {
      this.sidebar.classList.remove('collapsed');
    } else if (this.isCollapsed) {
      this.sidebar.classList.add('collapsed');
    }
  }
}

// ========== INICIALIZAÇÃO ========== //
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = new Sidebar();
  
  // Expor globalmente para debug
  window.sidebar = sidebar;
});
```

---

# 4. ESTADOS E VARIAÇÕES

## 4.1 Estados da Sidebar

```
Estados Principais:
├─ Normal (280px) - Desktop padrão
├─ Collapsed (80px) - Desktop recolhido
├─ Mobile Closed - Fora da tela (-280px)
└─ Mobile Open - Sobreposto (280px)

Transições:
├─ Normal → Collapsed: width 280px → 80px (300ms)
├─ Collapsed → Normal: width 80px → 280px (300ms)
├─ Mobile Closed → Open: translateX(-100%) → 0 (300ms)
└─ Mobile Open → Closed: translateX(0) → -100% (300ms)

Estados de Menu:
├─ Nível 1: Link principal
├─ Nível 2: Submenu (max-height 0 → 500px)
└─ Nível 3: Submenu aninhado (max-height 0 → 300px)
```

---

# 5. RESPONSIVIDADE

## 5.1 Breakpoints

```css
/* Desktop Grande (> 1024px) */
- Sidebar: 280px (normal) ou 80px (collapsed)
- Toggle: Botão no footer
- Tooltips: Sim (em collapsed)

/* Desktop Pequeno / Tablet (768px - 1024px) */
- Sidebar: 80px (collapsed por padrão)
- Tooltips: Sim
- Search: Oculto
- Textos: Ocultos

/* Mobile (< 768px) */
- Sidebar: -280px (fora da tela)
- Abertura: Overlay escuro + slide-in
- Toggle: Botão hamburger no header
- Fechamento: X no header, click no overlay, Esc
- Textos: Visíveis quando aberto
```

---

# 6. ACESSIBILIDADE

## 6.1 ARIA Labels e Roles

```html
Sidebar:
├─ role="navigation"
├─ aria-label="Menu principal"
└─ aria-expanded="true/false"

Links:
├─ aria-current="page" (link ativo)
├─ aria-expanded="true/false" (submenus)
├─ aria-controls="submenu-id"
└─ aria-label="Descrição clara"

Buttons:
├─ aria-label para ações
├─ aria-expanded para estados
└─ aria-describedby para ajuda

Keyboard:
├─ Tab: Navega entre links
├─ ↑↓: Navega vertical
├─ Enter/Space: Ativa link
├─ Esc: Fecha mobile sidebar
└─ Focus visible: Outline azul 2px
```

---

**Sidebar Responsivo com Menu Hierárquico Completo** ✅