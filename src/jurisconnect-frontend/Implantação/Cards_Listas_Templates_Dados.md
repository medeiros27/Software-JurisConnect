# JURISCONNECT - BIBLIOTECA COMPLETA DE CARDS, LISTAS E TEMPLATES

## 📋 ÍNDICE

1. [Cards Base](#1-cards-base)
2. [Cards Especializados](#2-cards-especializados)
3. [Listas](#3-listas)
4. [Templates de Dados](#4-templates-de-dados)
5. [Grids de Cards](#5-grids-de-cards)
6. [Estados e Variações](#6-estados-e-variações)

---

# 1. CARDS BASE

## 1.1 Card Padrão

```html
<!-- CARD BÁSICO -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título do Card</h3>
    <button class="card-menu" aria-label="Opções">
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
  <div class="card-body">
    <p>Conteúdo do card aqui.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-secondary">Cancelar</button>
    <button class="btn btn-primary">Salvar</button>
  </div>
</div>

<!-- CSS -->
<style>
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-color-dark);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-body {
  margin-bottom: var(--spacing-lg);
}

.card-body p {
  margin: 0 0 var(--spacing-md) 0;
}

.card-body p:last-child {
  margin-bottom: 0;
}

.card-footer {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.card-menu {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.card-menu:hover {
  color: var(--text-primary);
}
</style>
```

## 1.2 Card com Variações de Cor

```html
<!-- CARD PRIMARY -->
<div class="card card-primary">
  <div class="card-icon">
    <i class="fas fa-briefcase"></i>
  </div>
  <h4 class="card-title">Demandas Ativas</h4>
  <p class="card-stat">28</p>
</div>

<!-- CARD SUCCESS -->
<div class="card card-success">
  <div class="card-icon">
    <i class="fas fa-check-circle"></i>
  </div>
  <h4 class="card-title">Concluídas</h4>
  <p class="card-stat">65</p>
</div>

<!-- CARD ERROR -->
<div class="card card-error">
  <div class="card-icon">
    <i class="fas fa-exclamation-circle"></i>
  </div>
  <h4 class="card-title">Atrasadas</h4>
  <p class="card-stat">8</p>
</div>

<!-- CARD WARNING -->
<div class="card card-warning">
  <div class="card-icon">
    <i class="fas fa-clock"></i>
  </div>
  <h4 class="card-title">Pendentes</h4>
  <p class="card-stat">15</p>
</div>

<!-- CSS VARIAÇÕES -->
<style>
.card-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.8;
}

.card-stat {
  margin: var(--spacing-md) 0 0 0;
  font-size: 2.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.card-primary {
  border-left: 4px solid var(--color-primary);
  background: linear-gradient(135deg, var(--color-primary-lighter) 0%, transparent 100%);
}

.card-primary .card-icon {
  color: var(--color-primary);
}

.card-success {
  border-left: 4px solid var(--color-success);
  background: linear-gradient(135deg, var(--color-success-light) 0%, transparent 100%);
}

.card-success .card-icon {
  color: var(--color-success);
}

.card-error {
  border-left: 4px solid var(--color-error);
  background: linear-gradient(135deg, var(--color-error-light) 0%, transparent 100%);
}

.card-error .card-icon {
  color: var(--color-error);
}

.card-warning {
  border-left: 4px solid var(--color-warning);
  background: linear-gradient(135deg, var(--color-warning-light) 0%, transparent 100%);
}

.card-warning .card-icon {
  color: var(--color-warning);
}
</style>
```

---

# 2. CARDS ESPECIALIZADOS

## 2.1 Card de Demanda

```html
<div class="card card-demand">
  <div class="card-header-compact">
    <div class="card-number">DEM-2025-001</div>
    <span class="card-badge badge-success">Ativa</span>
  </div>

  <h4 class="card-demand-title">Ação de Cobrança</h4>
  
  <div class="card-demand-meta">
    <div class="meta-item">
      <span class="meta-label">Cliente:</span>
      <span class="meta-value">Escritório XYZ</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Correspondente:</span>
      <span class="meta-value">João Silva</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Especialidade:</span>
      <span class="meta-value">Civil</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Data:</span>
      <span class="meta-value">01/Nov/2025</span>
    </div>
  </div>

  <div class="card-progress">
    <div class="progress-label">
      <span>Progresso</span>
      <span class="progress-percent">65%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: 65%"></div>
    </div>
  </div>

  <div class="card-actions">
    <button class="btn btn-sm btn-outline">Detalhar</button>
    <button class="btn btn-sm btn-primary">Editar</button>
  </div>
</div>

<!-- CSS -->
<style>
.card-demand {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-number {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}

.card-demand-title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.card-demand-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-top: var(--spacing-xs);
}

.card-progress {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 999px;
  transition: width 300ms ease;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-xs);
}

@media (max-width: 768px) {
  .card-demand-meta {
    grid-template-columns: 1fr;
  }
}
</style>
```

## 2.2 Card de Cliente

```html
<div class="card card-client">
  <div class="card-avatar-wrapper">
    <div class="card-avatar">
      <span>XYZ</span>
    </div>
    <div class="card-client-header">
      <h4 class="card-client-name">Escritório XYZ</h4>
      <p class="card-client-type">Pessoa Jurídica</p>
    </div>
    <button class="card-favorite" aria-label="Adicionar aos favoritos">
      <i class="far fa-heart"></i>
    </button>
  </div>

  <div class="card-client-info">
    <div class="info-row">
      <i class="fas fa-map-marker-alt"></i>
      <span>São Paulo - SP</span>
    </div>
    <div class="info-row">
      <i class="fas fa-phone"></i>
      <span>(11) 3333-3333</span>
    </div>
    <div class="info-row">
      <i class="fas fa-envelope"></i>
      <span>contato@xyz.com</span>
    </div>
  </div>

  <div class="card-client-stats">
    <div class="stat">
      <div class="stat-value">12</div>
      <div class="stat-label">Demandas</div>
    </div>
    <div class="stat">
      <div class="stat-value">R$ 85k</div>
      <div class="stat-label">Faturamento</div>
    </div>
    <div class="stat">
      <div class="stat-value">92%</div>
      <div class="stat-label">Adimplência</div>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.card-client {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
}

.card-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.card-client-header {
  flex: 1;
}

.card-client-name {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.card-client-type {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.card-favorite {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-lg);
  transition: all var(--transition-fast);
  padding: var(--spacing-xs);
}

.card-favorite:hover {
  color: var(--color-error);
}

.card-favorite.active {
  color: var(--color-error);
}

.card-favorite.active i {
  font-weight: var(--font-weight-bold);
}

.card-client-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.info-row i {
  width: 20px;
  text-align: center;
  color: var(--color-primary);
}

.card-client-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
```

## 2.3 Card de Correspondente

```html
<div class="card card-correspondent">
  <div class="card-correspondent-header">
    <div class="correspondent-avatar">
      <img src="/img/avatar.jpg" alt="João Silva">
    </div>
    <div class="correspondent-info">
      <h4 class="correspondent-name">João Silva</h4>
      <div class="correspondent-rating">
        <div class="stars">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star-half-alt"></i>
        </div>
        <span class="rating-text">4.7</span>
      </div>
    </div>
    <span class="correspondent-status online">Online</span>
  </div>

  <div class="correspondent-specialties">
    <span class="specialty-tag">Civil</span>
    <span class="specialty-tag">Trabalhista</span>
  </div>

  <div class="correspondent-stats">
    <div class="stat-row">
      <span>Demandas Concluídas:</span>
      <strong>45</strong>
    </div>
    <div class="stat-row">
      <span>Taxa Sucesso:</span>
      <strong>95%</strong>
    </div>
    <div class="stat-row">
      <span>Ticket Médio:</span>
      <strong>18 dias</strong>
    </div>
  </div>

  <div class="card-actions">
    <button class="btn btn-outline btn-sm">Visualizar Perfil</button>
    <button class="btn btn-primary btn-sm">Contatar</button>
  </div>
</div>

<!-- CSS -->
<style>
.card-correspondent-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.correspondent-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.correspondent-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.correspondent-info {
  flex: 1;
}

.correspondent-name {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.correspondent-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.stars {
  display: flex;
  gap: 2px;
  font-size: 0.75rem;
  color: var(--color-warning);
}

.rating-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.correspondent-status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0.25rem 0.75rem;
  font-size: var(--font-size-xs);
  border-radius: 999px;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
}

.correspondent-status.online {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.correspondent-status.online::before {
  content: '';
  width: 8px;
  height: 8px;
  background-color: var(--color-success);
  border-radius: 50%;
}

.correspondent-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.specialty-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  border-radius: 999px;
  font-weight: var(--font-weight-medium);
}

.correspondent-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.stat-row span {
  color: var(--text-secondary);
}

.stat-row strong {
  color: var(--text-primary);
}
</style>
```

---

# 3. LISTAS

## 3.1 Lista Simples

```html
<div class="list">
  <div class="list-item">
    <div class="list-item-content">
      <h4 class="list-item-title">Título do Item</h4>
      <p class="list-item-subtitle">Subtítulo ou descrição</p>
    </div>
    <div class="list-item-action">
      <button class="btn btn-sm btn-ghost">Ação</button>
    </div>
  </div>

  <div class="list-item">
    <div class="list-item-content">
      <h4 class="list-item-title">Segundo Item</h4>
      <p class="list-item-subtitle">Mais uma descrição</p>
    </div>
    <div class="list-item-action">
      <button class="btn btn-sm btn-ghost">Ação</button>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.list-item:last-child {
  border-bottom: none;
}

.list-item:hover {
  background-color: var(--bg-secondary);
}

.list-item-content {
  flex: 1;
}

.list-item-title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.list-item-subtitle {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.list-item-action {
  margin-left: var(--spacing-lg);
  flex-shrink: 0;
}
</style>
```

## 3.2 Lista com Ícones

```html
<div class="list list-with-icons">
  <div class="list-item">
    <div class="list-item-icon">
      <i class="fas fa-briefcase"></i>
    </div>
    <div class="list-item-content">
      <h4 class="list-item-title">Demanda DEM-001</h4>
      <p class="list-item-subtitle">Ação de Cobrança - Civil</p>
    </div>
    <span class="list-item-badge badge-success">Ativa</span>
  </div>

  <div class="list-item">
    <div class="list-item-icon">
      <i class="fas fa-briefcase"></i>
    </div>
    <div class="list-item-content">
      <h4 class="list-item-title">Demanda DEM-002</h4>
      <p class="list-item-subtitle">Parecer Jurídico - Trabalhista</p>
    </div>
    <span class="list-item-badge badge-warning">Pendente</span>
  </div>
</div>

<!-- CSS -->
<style>
.list-item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  background-color: var(--bg-secondary);
  color: var(--color-primary);
  font-size: 1.125rem;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.list-item-badge {
  margin-left: auto;
  flex-shrink: 0;
}
</style>
```

## 3.3 Lista Expandível

```html
<div class="list list-expandable">
  <div class="list-item">
    <div class="list-item-header">
      <div class="list-item-content">
        <h4 class="list-item-title">Seção 1</h4>
        <p class="list-item-subtitle">3 itens</p>
      </div>
      <button class="list-toggle" aria-expanded="false">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    <div class="list-item-body" style="display: none;">
      <ul class="list-nested">
        <li class="list-nested-item">Item 1.1</li>
        <li class="list-nested-item">Item 1.2</li>
        <li class="list-nested-item">Item 1.3</li>
      </ul>
    </div>
  </div>

  <div class="list-item">
    <div class="list-item-header">
      <div class="list-item-content">
        <h4 class="list-item-title">Seção 2</h4>
        <p class="list-item-subtitle">2 itens</p>
      </div>
      <button class="list-toggle" aria-expanded="false">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    <div class="list-item-body" style="display: none;">
      <ul class="list-nested">
        <li class="list-nested-item">Item 2.1</li>
        <li class="list-nested-item">Item 2.2</li>
      </ul>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.list-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.list-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: var(--font-size-sm);
  transition: transform var(--transition-fast);
}

.list-toggle[aria-expanded="true"] {
  transform: rotate(180deg);
}

.list-item-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms ease;
}

.list-item-body.show {
  max-height: 500px;
}

.list-nested {
  list-style: none;
  padding: 0;
  margin: var(--spacing-md) 0 0 0;
  padding-left: var(--spacing-lg);
  border-left: 2px solid var(--border-color);
}

.list-nested-item {
  padding: var(--spacing-sm) 0;
  color: var(--text-secondary);
}
</style>

<!-- JavaScript -->
<script>
document.querySelectorAll('.list-toggle').forEach(button => {
  button.addEventListener('click', (e) => {
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);
    
    const body = button.closest('.list-item').querySelector('.list-item-body');
    body.classList.toggle('show');
  });
});
</script>
```

---

# 4. TEMPLATES DE DADOS

## 4.1 Template Tabela Simples

```html
<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr>
        <th>Protocolo</th>
        <th>Cliente</th>
        <th>Especialidade</th>
        <th>Status</th>
        <th>Data</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <span class="table-number">DEM-2025-001</span>
        </td>
        <td>
          <div class="table-client">
            <div class="table-avatar">XY</div>
            <div>
              <strong>Escritório XYZ</strong>
              <p>São Paulo, SP</p>
            </div>
          </div>
        </td>
        <td>Civil</td>
        <td>
          <span class="badge badge-success">Ativa</span>
        </td>
        <td>01/Nov/2025</td>
        <td class="table-actions">
          <button class="btn-icon" aria-label="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" aria-label="Deletar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- CSS -->
<style>
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.table thead {
  background-color: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
}

.table th {
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.table tbody tr:hover {
  background-color: var(--bg-secondary);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table-number {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.table-client {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.table-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.table-client strong {
  display: block;
  color: var(--text-primary);
}

.table-client p {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.table-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}
</style>
```

## 4.2 Template com Filtros e Busca

```html
<div class="data-container">
  <div class="data-header">
    <div class="data-search">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Buscar..."
      >
    </div>
    <div class="data-filters">
      <select class="form-control">
        <option>Filtrar por...</option>
        <option>Ativo</option>
        <option>Concluído</option>
      </select>
      <button class="btn btn-primary">
        <i class="fas fa-plus"></i> Novo
      </button>
    </div>
  </div>

  <div class="data-content">
    <!-- Tabela ou Cards -->
  </div>

  <div class="data-footer">
    <div class="data-info">
      Mostrando <strong>10</strong> de <strong>45</strong> itens
    </div>
    <div class="data-pagination">
      <button class="btn btn-secondary" disabled>← Anterior</button>
      <span class="pagination-pages">1 de 5</span>
      <button class="btn btn-secondary">Próxima →</button>
    </div>
  </div>
</div>

<!-- CSS -->
<style>
.data-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.data-search {
  flex: 1;
  min-width: 200px;
}

.data-filters {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.data-content {
  flex: 1;
  min-height: 300px;
}

.data-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.data-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.data-pagination {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.pagination-pages {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}

@media (max-width: 768px) {
  .data-header {
    flex-direction: column;
    align-items: stretch;
  }

  .data-search,
  .data-filters {
    width: 100%;
  }
}
</style>
```

---

# 5. GRIDS DE CARDS

## 5.1 Grid Responsivo

```html
<div class="cards-grid">
  <!-- Cards aqui -->
</div>

<!-- CSS -->
<style>
.cards-grid {
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

/* Responsividade -->
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .cards-grid {
    gap: var(--spacing-md);
  }
}
</style>
```

---

# 6. ESTADOS E VARIAÇÕES

## 6.1 Estados de Cards

```html
<!-- CARD CARREGANDO -->
<div class="card card-loading">
  <div class="skeleton skeleton-text" style="width: 60%; height: 20px;"></div>
  <div class="skeleton skeleton-text" style="margin-top: 10px; width: 100%; height: 100px;"></div>
</div>

<!-- CARD VAZIO -->
<div class="card card-empty">
  <div class="empty-state">
    <i class="fas fa-inbox"></i>
    <p>Nenhum dado disponível</p>
  </div>
</div>

<!-- CARD COM ERRO -->
<div class="card card-error">
  <div class="error-state">
    <i class="fas fa-exclamation-circle"></i>
    <p>Erro ao carregar dados</p>
    <button class="btn btn-primary btn-sm">Tentar Novamente</button>
  </div>
</div>

<!-- CSS -->
<style>
.card-loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.card-empty,
.card-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.empty-state,
.error-state {
  text-align: center;
  color: var(--text-secondary);
}

.empty-state i,
.error-state i {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-state p,
.error-state p {
  margin: 0 0 var(--spacing-md) 0;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
```

---

**Biblioteca Completa de Cards, Listas e Templates** ✅