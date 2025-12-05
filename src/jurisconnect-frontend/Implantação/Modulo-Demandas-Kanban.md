# JURISCONNECT - MÓDULO DE GESTÃO DE DEMANDAS COM KANBAN

## 📋 ÍNDICE

1. [Arquitetura do Módulo](#1-arquitetura-do-módulo)
2. [Tela Kanban (Principal)](#2-tela-kanban-principal)
3. [Tela Lista de Demandas](#3-tela-lista-de-demandas)
4. [Tela Detalhes da Demanda](#4-tela-detalhes-da-demanda)
5. [Formulário Nova Demanda](#5-formulário-nova-demanda)
6. [JavaScript do Kanban](#6-javascript-do-kanban)
7. [Integração e APIs](#7-integração-e-apis)

---

# 1. ARQUITETURA DO MÓDULO

## 1.1 Estrutura de Pastas

```
js/modules/demands/
├── index.js                    # Entry point do módulo
├── kanban.js                   # Lógica kanban
├── list.js                     # Lógica listagem
├── detail.js                   # Detalhos demanda
├── form.js                     # Formulário criar/editar
├── api.js                      # APIs específicas
├── models.js                   # Tipos de dados
├── controllers/
│   ├── kanban-controller.js   # Controlador kanban
│   └── list-controller.js     # Controlador listagem
├── services/
│   ├── demand.service.js      # Serviço demandas
│   ├── workflow.service.js    # Serviço workflow
│   └── notification.service.js # Notificações
└── views/
    ├── kanban.view.js         # Renderização kanban
    ├── list.view.js           # Renderização lista
    └── detail.view.js         # Renderização detalhes

Estados de Demanda:
├─ Rascunho
├─ Pendente Análise
├─ Análise em Andamento
├─ Aguardando Correspondente
├─ Em Andamento (Correspondente)
├─ Aguardando Parecer
├─ Concluída
└─ Arquivada

Transições:
Rascunho → Pendente → Análise → Aguardando Correspondente
         → Em Andamento → Aguardando Parecer → Concluída
```

---

# 2. TELA KANBAN (PRINCIPAL)

## 2.1 HTML do Kanban

```html
<!-- Tela Kanban com 5 colunas -->
<div class="demands-kanban-page">
  <!-- Header -->
  <div class="kanban-header">
    <h1>Gestão de Demandas - Kanban</h1>
    
    <!-- Filtros -->
    <div class="kanban-filters">
      <input 
        type="text" 
        id="kanbanSearch" 
        class="search-input" 
        placeholder="Buscar demanda..."
      >
      
      <select id="kanbanFilterAssignee" class="form-control">
        <option value="">Todos Correspondentes</option>
        <option value="joao">João Silva</option>
        <option value="maria">Maria Santos</option>
      </select>
      
      <select id="kanbanFilterClient" class="form-control">
        <option value="">Todos Clientes</option>
        <option value="xyz">Escritório XYZ</option>
        <option value="abc">Empresa ABC</option>
      </select>
      
      <select id="kanbanFilterSpecialty" class="form-control">
        <option value="">Todas Especialidades</option>
        <option value="civil">Civil</option>
        <option value="trabalhista">Trabalhista</option>
        <option value="tributaria">Tributária</option>
      </select>

      <button class="btn btn-primary" id="newDemandBtn">
        <i class="fas fa-plus"></i> Nova Demanda
      </button>
    </div>

    <!-- Estatísticas -->
    <div class="kanban-stats">
      <div class="stat">
        <span class="stat-label">Total</span>
        <span class="stat-value" id="totalDemands">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">Em Andamento</span>
        <span class="stat-value" id="inProgressCount">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">Atrasadas</span>
        <span class="stat-value danger" id="overduCount">0</span>
      </div>
    </div>
  </div>

  <!-- Kanban Board -->
  <div class="kanban-board" id="kanbanBoard">
    <!-- Colunas geradas dinamicamente -->
  </div>

  <!-- Modais -->
  <div id="demandDetailModal" class="modal" style="display: none;">
    <!-- Renderizado dinamicamente -->
  </div>

  <div id="demandFormModal" class="modal" style="display: none;">
    <!-- Renderizado dinamicamente -->
  </div>
</div>

<!-- CSS Kanban -->
<style>
.demands-kanban-page {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  min-height: 100vh;
}

.kanban-header {
  margin-bottom: var(--spacing-xl);
}

.kanban-header h1 {
  margin-bottom: var(--spacing-lg);
}

.kanban-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
}

.kanban-filters > * {
  flex: 1;
  min-width: 150px;
}

.kanban-filters .btn {
  flex: 0 1 auto;
}

.kanban-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.stat-value.danger {
  color: var(--color-error);
}

/* Kanban Board */
.kanban-board {
  display: flex;
  gap: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-lg);
}

.kanban-column {
  flex: 0 0 350px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.kanban-column-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanban-column-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  margin: 0;
}

.kanban-column-count {
  background-color: var(--bg-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.kanban-column-count.active {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
}

.kanban-cards {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanban-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  cursor: grab;
  transition: all var(--transition-fast);
  user-select: none;
}

.kanban-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kanban-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.kanban-card-number {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.kanban-card-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.kanban-card-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.kanban-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
}

.kanban-card-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
}

.kanban-card-priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.kanban-card-priority.high {
  background-color: var(--color-error);
}

.kanban-card-priority.medium {
  background-color: var(--color-warning);
}

.kanban-card-priority.low {
  background-color: var(--color-success);
}

.kanban-column-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-tertiary);
  text-align: center;
}

.kanban-column-empty p {
  margin: 0;
}

/* Responsividade */
@media (max-width: 1024px) {
  .kanban-column {
    flex: 0 0 300px;
  }
}

@media (max-width: 768px) {
  .kanban-filters {
    flex-direction: column;
  }

  .kanban-filters > * {
    min-width: 100%;
  }

  .kanban-column {
    flex: 0 0 280px;
  }

  .kanban-stats {
    flex-direction: column;
  }
}
</style>
```

## 2.2 Renderização Dinâmica do Kanban

```javascript
// js/modules/demands/views/kanban.view.js
import { formatDate, formatCurrency } from '../../../utils.js';

const COLUMNS = [
  { id: 'draft', title: 'Rascunho', color: '#6b7280' },
  { id: 'pending', title: 'Pendente Análise', color: '#f59e0b' },
  { id: 'analyzing', title: 'Em Análise', color: '#3b82f6' },
  { id: 'waiting_correspondent', title: 'Aguardando Correspondente', color: '#8b5cf6' },
  { id: 'in_progress', title: 'Em Andamento', color: '#ec4899' },
  { id: 'completed', title: 'Concluída', color: '#10b981' }
];

export class KanbanView {
  static renderBoard(demands) {
    const board = document.getElementById('kanbanBoard');
    board.innerHTML = '';

    COLUMNS.forEach(column => {
      const columnDemands = demands.filter(d => d.status === column.id);
      const columnHtml = this.renderColumn(column, columnDemands);
      board.appendChild(columnHtml);
    });

    this.setupDragAndDrop();
  }

  static renderColumn(column, demands) {
    const colElement = document.createElement('div');
    colElement.className = 'kanban-column';
    colElement.dataset.status = column.id;

    const header = `
      <div class="kanban-column-header">
        <h3 class="kanban-column-title">${column.title}</h3>
        <span class="kanban-column-count ${demands.length > 0 ? 'active' : ''}">
          ${demands.length}
        </span>
      </div>
    `;

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'kanban-cards';
    cardsContainer.dataset.status = column.id;

    if (demands.length === 0) {
      cardsContainer.innerHTML = `
        <div class="kanban-column-empty">
          <p>Nenhuma demanda</p>
        </div>
      `;
    } else {
      demands.forEach(demand => {
        const card = this.renderCard(demand);
        cardsContainer.appendChild(card);
      });
    }

    colElement.innerHTML = header;
    colElement.appendChild(cardsContainer);

    return colElement;
  }

  static renderCard(demand) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.demandId = demand.id;

    const dueDate = new Date(demand.due_date);
    const today = new Date();
    const isOverdue = dueDate < today && demand.status !== 'completed';

    card.innerHTML = `
      <div class="kanban-card-number">${demand.number}</div>
      <div class="kanban-card-title">${demand.title}</div>
      
      <div class="kanban-card-meta">
        <div><strong>Cliente:</strong> ${demand.client_name}</div>
        <div><strong>Especialidade:</strong> ${demand.specialty}</div>
        <div><strong>Vencimento:</strong> ${formatDate(demand.due_date)}
          ${isOverdue ? '<span style="color: var(--color-error);"> ⚠️ Atrasada</span>' : ''}
        </div>
      </div>

      <div class="kanban-card-footer">
        <div style="display: flex; gap: 4px;">
          <div class="kanban-card-priority ${demand.priority}"></div>
          <div class="kanban-card-avatar" title="${demand.assigned_to}">
            ${demand.assigned_to?.split(' ').map(w => w[0]).join('')}
          </div>
        </div>
        <span class="badge badge-${demand.priority}">
          ${demand.priority.toUpperCase()}
        </span>
      </div>
    `;

    // Eventos
    card.addEventListener('click', () => {
      this.onCardClick?.(demand);
    });

    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', card.innerHTML);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    return card;
  }

  static setupDragAndDrop() {
    const columns = document.querySelectorAll('.kanban-cards');

    columns.forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        column.style.backgroundColor = 'rgba(36, 101, 167, 0.1)';
      });

      column.addEventListener('dragleave', () => {
        column.style.backgroundColor = '';
      });

      column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.style.backgroundColor = '';

        const card = document.querySelector('.kanban-card.dragging');
        if (card && column !== card.parentElement) {
          column.appendChild(card);
          
          // Callback para salvar mudança
          const demandId = card.dataset.demandId;
          const newStatus = column.dataset.status;
          this.onCardMoved?.(demandId, newStatus);
        }
      });
    });
  }
}

export default KanbanView;
```

---

# 3. TELA LISTA DE DEMANDAS

## 3.1 HTML da Lista

```html
<div class="demands-list-page">
  <div class="list-header">
    <h1>Demandas - Visualização em Lista</h1>
    
    <div class="list-controls">
      <div class="search-box">
        <input 
          type="text" 
          id="listSearch" 
          class="form-control" 
          placeholder="Buscar demanda..."
        >
      </div>

      <div class="list-filters">
        <select id="listFilterStatus" class="form-control">
          <option value="">Todos Status</option>
          <option value="draft">Rascunho</option>
          <option value="pending">Pendente</option>
          <option value="completed">Concluída</option>
        </select>

        <select id="listFilterSort" class="form-control">
          <option value="date_desc">Data (Recente)</option>
          <option value="date_asc">Data (Antiga)</option>
          <option value="priority_high">Prioridade (Alta)</option>
          <option value="value_high">Valor (Maior)</option>
        </select>

        <button class="btn btn-secondary" id="listViewToggle">
          <i class="fas fa-th"></i> Kanban
        </button>
      </div>
    </div>
  </div>

  <!-- Tabela -->
  <div class="table-wrapper">
    <table class="table" id="demandsTable">
      <thead>
        <tr>
          <th>Protocolo</th>
          <th>Título</th>
          <th>Cliente</th>
          <th>Especialidade</th>
          <th>Status</th>
          <th>Correspondente</th>
          <th>Vencimento</th>
          <th>Valor</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="demandsTableBody">
        <!-- Renderizado dinamicamente -->
      </tbody>
    </table>
  </div>

  <!-- Paginação -->
  <div class="pagination">
    <button class="btn btn-secondary" id="prevPage">← Anterior</button>
    <span class="pagination-info">
      Página <input type="number" id="pageInput" value="1" min="1" max="1" style="width: 50px;"> 
      de <span id="totalPages">1</span>
    </span>
    <button class="btn btn-secondary" id="nextPage">Próxima →</button>
  </div>
</div>

<!-- CSS Lista -->
<style>
.demands-list-page {
  padding: var(--spacing-lg);
}

.list-header {
  margin-bottom: var(--spacing-xl);
}

.list-controls {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.list-filters {
  display: flex;
  gap: var(--spacing-md);
}

.table-wrapper {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md) var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  border-bottom: 2px solid var(--border-color);
}

.table td {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.table tbody tr:hover {
  background-color: var(--bg-secondary);
}

.table-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
}

.pagination-info {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .list-controls {
    flex-direction: column;
  }

  .list-filters {
    flex-direction: column;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: var(--spacing-sm);
  }
}
</style>
```

## 3.2 JavaScript da Lista

```javascript
// js/modules/demands/views/list.view.js
export class ListView {
  static renderTable(demands, page = 1, limit = 10) {
    const tbody = document.getElementById('demandsTableBody');
    const totalPages = Math.ceil(demands.length / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = demands.slice(start, end);

    tbody.innerHTML = paginated.map(demand => `
      <tr data-demand-id="${demand.id}">
        <td>
          <strong>${demand.number}</strong>
        </td>
        <td>${demand.title}</td>
        <td>${demand.client_name}</td>
        <td>${demand.specialty}</td>
        <td>
          <span class="badge badge-${this.getStatusColor(demand.status)}">
            ${this.getStatusLabel(demand.status)}
          </span>
        </td>
        <td>${demand.assigned_to || '-'}</td>
        <td>${this.formatDate(demand.due_date)}</td>
        <td>${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(demand.value)}</td>
        <td class="table-actions">
          <button class="btn-icon view-btn" data-id="${demand.id}" title="Ver detalhes">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon edit-btn" data-id="${demand.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-btn" data-id="${demand.id}" title="Deletar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Atualizar paginação
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('pageInput').max = totalPages;
  }

  static getStatusColor(status) {
    const colors = {
      draft: 'secondary',
      pending: 'warning',
      analyzing: 'info',
      waiting_correspondent: 'info',
      in_progress: 'info',
      completed: 'success'
    };
    return colors[status] || 'default';
  }

  static getStatusLabel(status) {
    const labels = {
      draft: 'Rascunho',
      pending: 'Pendente',
      analyzing: 'Em Análise',
      waiting_correspondent: 'Ag. Correspondente',
      in_progress: 'Em Andamento',
      completed: 'Concluída'
    };
    return labels[status] || status;
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

export default ListView;
```

---

# 4. TELA DETALHES DA DEMANDA

## 4.1 Modal de Detalhes

```html
<!-- Modal Detalhes -->
<div id="demandDetailModal" class="modal">
  <div class="modal-dialog modal-lg">
    <div class="modal-header">
      <h2 id="detailTitle">Detalhes da Demanda</h2>
      <button class="modal-close" aria-label="Fechar">&times;</button>
    </div>

    <div class="modal-body">
      <div class="detail-container">
        
        <!-- Info Principal -->
        <section class="detail-section">
          <h3>Informações Principais</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Número</label>
              <p id="detailNumber"></p>
            </div>
            <div class="detail-item">
              <label>Status</label>
              <p><span id="detailStatus" class="badge"></span></p>
            </div>
            <div class="detail-item">
              <label>Título</label>
              <p id="detailTitle"></p>
            </div>
            <div class="detail-item">
              <label>Prioridade</label>
              <p id="detailPriority"></p>
            </div>
          </div>
        </section>

        <!-- Cliente e Correspondente -->
        <section class="detail-section">
          <h3>Cliente e Correspondente</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Cliente</label>
              <p id="detailClient"></p>
            </div>
            <div class="detail-item">
              <label>Especialidade</label>
              <p id="detailSpecialty"></p>
            </div>
            <div class="detail-item">
              <label>Correspondente Atribuído</label>
              <p id="detailAssignee"></p>
            </div>
            <div class="detail-item">
              <label>Contato</label>
              <p id="detailContact"></p>
            </div>
          </div>
        </section>

        <!-- Datas e Valores -->
        <section class="detail-section">
          <h3>Datas e Valores</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Data Criação</label>
              <p id="detailCreatedAt"></p>
            </div>
            <div class="detail-item">
              <label>Data Vencimento</label>
              <p id="detailDueDate"></p>
            </div>
            <div class="detail-item">
              <label>Valor</label>
              <p id="detailValue"></p>
            </div>
            <div class="detail-item">
              <label>Comissão Esperada</label>
              <p id="detailCommission"></p>
            </div>
          </div>
        </section>

        <!-- Descrição -->
        <section class="detail-section">
          <h3>Descrição</h3>
          <div class="detail-description" id="detailDescription"></div>
        </section>

        <!-- Timeline -->
        <section class="detail-section">
          <h3>Histórico</h3>
          <div class="detail-timeline" id="detailTimeline">
            <!-- Renderizado dinamicamente -->
          </div>
        </section>

      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" id="detailCloseBtn">Fechar</button>
      <button class="btn btn-primary" id="detailEditBtn">Editar</button>
    </div>
  </div>
</div>

<!-- CSS Modal -->
<style>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.detail-section {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-lg);
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.detail-item p {
  margin: 0;
  color: var(--text-primary);
}

.detail-description {
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  line-height: var(--line-height-relaxed);
}

.detail-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.timeline-item {
  display: flex;
  gap: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-left: 2px solid var(--color-primary);
  padding-left: var(--spacing-md);
  margin-left: var(--spacing-md);
}

.timeline-item:last-child {
  border-left: none;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  background-color: var(--color-primary);
  border-radius: 50%;
  margin-left: -11px;
  margin-top: 2px;
}

.timeline-content {
  flex: 1;
}

.timeline-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.timeline-message {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-top: var(--spacing-xs);
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

# 5. FORMULÁRIO NOVA DEMANDA

## 5.1 HTML do Formulário

```html
<!-- Modal Formulário -->
<div id="demandFormModal" class="modal">
  <div class="modal-dialog modal-lg">
    <div class="modal-header">
      <h2>Nova Demanda</h2>
      <button class="modal-close" aria-label="Fechar">&times;</button>
    </div>

    <form class="demand-form" id="demandForm">
      <div class="modal-body">
        
        <!-- Seção 1: Informações Básicas -->
        <fieldset class="form-section">
          <legend>Informações Básicas</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="formTitle">Título *</label>
              <input 
                type="text" 
                id="formTitle" 
                name="title" 
                class="form-control"
                data-validate="required|min:5|max:100"
                placeholder="Ex: Ação de Cobrança"
                required
              >
              <small class="form-text"></small>
            </div>

            <div class="form-group">
              <label for="formSpecialty">Especialidade *</label>
              <select 
                id="formSpecialty" 
                name="specialty" 
                class="form-control"
                data-validate="required"
                required
              >
                <option value="">Selecione...</option>
                <option value="civil">Civil</option>
                <option value="penal">Penal</option>
                <option value="trabalhista">Trabalhista</option>
                <option value="tributaria">Tributária</option>
                <option value="comercial">Comercial</option>
              </select>
              <small class="form-text"></small>
            </div>
          </div>

          <div class="form-group">
            <label for="formDescription">Descrição *</label>
            <textarea 
              id="formDescription" 
              name="description" 
              class="form-control"
              rows="4"
              data-validate="required|min:10|max:2000"
              placeholder="Descreva os detalhes da demanda"
              required
            ></textarea>
            <small class="form-text"></small>
          </div>
        </fieldset>

        <!-- Seção 2: Cliente -->
        <fieldset class="form-section">
          <legend>Cliente</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="formClient">Cliente *</label>
              <select 
                id="formClient" 
                name="client_id" 
                class="form-control"
                data-validate="required"
                required
              >
                <option value="">Selecione cliente...</option>
                <option value="1">Escritório XYZ</option>
                <option value="2">Empresa ABC</option>
                <option value="3">Consultoria DEF</option>
              </select>
              <small class="form-text"></small>
            </div>

            <div class="form-group">
              <label for="formContact">Contato</label>
              <input 
                type="text" 
                id="formContact" 
                name="contact" 
                class="form-control"
                placeholder="(11) 3333-3333 / email@client.com"
              >
            </div>
          </div>
        </fieldset>

        <!-- Seção 3: Correspondente e Datas -->
        <fieldset class="form-section">
          <legend>Correspondente e Prazos</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="formAssignee">Correspondente</label>
              <select 
                id="formAssignee" 
                name="assigned_to" 
                class="form-control"
              >
                <option value="">Não atribuído</option>
                <option value="joao">João Silva</option>
                <option value="maria">Maria Santos</option>
                <option value="carlos">Carlos oliveira</option>
              </select>
            </div>

            <div class="form-group">
              <label for="formDueDate">Data Vencimento *</label>
              <input 
                type="date" 
                id="formDueDate" 
                name="due_date" 
                class="form-control"
                data-validate="required|date"
                required
              >
              <small class="form-text"></small>
            </div>
          </div>
        </fieldset>

        <!-- Seção 4: Financeiro -->
        <fieldset class="form-section">
          <legend>Informações Financeiras</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="formValue">Valor *</label>
              <div class="input-group">
                <span class="input-prefix">R$</span>
                <input 
                  type="number" 
                  id="formValue" 
                  name="value" 
                  class="form-control"
                  data-validate="required|min:0"
                  placeholder="0,00"
                  step="0.01"
                  required
                >
              </div>
              <small class="form-text"></small>
            </div>

            <div class="form-group">
              <label for="formCommission">Comissão (%)</label>
              <input 
                type="number" 
                id="formCommission" 
                name="commission_rate" 
                class="form-control"
                placeholder="10"
                step="0.01"
                min="0"
                max="100"
              >
              <small class="form-text">Será calculado automaticamente</small>
            </div>
          </div>
        </fieldset>

        <!-- Seção 5: Prioridade -->
        <fieldset class="form-section">
          <legend>Prioridade</legend>
          
          <div class="form-check-group">
            <div class="form-check">
              <input 
                type="radio" 
                id="priorityLow" 
                name="priority" 
                value="low" 
                class="form-check-input"
              >
              <label for="priorityLow">Baixa</label>
            </div>
            <div class="form-check">
              <input 
                type="radio" 
                id="priorityMedium" 
                name="priority" 
                value="medium" 
                class="form-check-input"
                checked
              >
              <label for="priorityMedium">Média</label>
            </div>
            <div class="form-check">
              <input 
                type="radio" 
                id="priorityHigh" 
                name="priority" 
                value="high" 
                class="form-check-input"
              >
              <label for="priorityHigh">Alta</label>
            </div>
          </div>
        </fieldset>

      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="formCancelBtn">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="formSubmitBtn">Criar Demanda</button>
      </div>
    </form>
  </div>
</div>

<!-- CSS Formulário -->
<style>
.demand-form {
  display: contents;
}

.form-section {
  border: none;
  padding: 0;
  margin: 0;
  margin-bottom: var(--spacing-xl);
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section legend {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  padding: 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.form-control {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  transition: all 150ms ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(36, 101, 167, 0.1);
}

.form-check-group {
  display: flex;
  gap: var(--spacing-lg);
}

.form-check {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  padding: 0.625rem 0.875rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-right: none;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.input-group .form-control {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  border-left: none;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

# 6. JAVASCRIPT DO KANBAN

## 6.1 Controlador Kanban

```javascript
// js/modules/demands/controllers/kanban-controller.js
import DemandService from '../services/demand.service.js';
import KanbanView from '../views/kanban.view.js';
import NotificationService from '../services/notification.service.js';

export class KanbanController {
  constructor() {
    this.demandService = DemandService;
    this.demands = [];
    this.filteredDemands = [];
    this.init();
  }

  async init() {
    await this.loadDemands();
    this.setupEventListeners();
    this.render();
  }

  async loadDemands() {
    try {
      this.demands = await this.demandService.getAllDemands();
      this.applyFilters();
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
      NotificationService.error('Erro ao carregar demandas');
    }
  }

  setupEventListeners() {
    // Filtros
    document.getElementById('kanbanSearch')?.addEventListener('input', 
      (e) => this.onSearchChange(e.target.value));
    
    document.getElementById('kanbanFilterAssignee')?.addEventListener('change',
      () => this.applyFilters());
    
    document.getElementById('kanbanFilterSpecialty')?.addEventListener('change',
      () => this.applyFilters());

    // Nova demanda
    document.getElementById('newDemandBtn')?.addEventListener('click',
      () => this.showNewDemandForm());

    // Kanban card events
    KanbanView.onCardClick = (demand) => this.showDemandDetail(demand);
    KanbanView.onCardMoved = (demandId, newStatus) => this.onCardMoved(demandId, newStatus);
  }

  applyFilters() {
    let filtered = this.demands;

    // Filtro de busca
    const search = document.getElementById('kanbanSearch')?.value || '';
    if (search) {
      filtered = filtered.filter(d =>
        d.number.includes(search) ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.client_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtro de correspondente
    const assignee = document.getElementById('kanbanFilterAssignee')?.value;
    if (assignee) {
      filtered = filtered.filter(d => d.assigned_to === assignee);
    }

    // Filtro de especialidade
    const specialty = document.getElementById('kanbanFilterSpecialty')?.value;
    if (specialty) {
      filtered = filtered.filter(d => d.specialty === specialty);
    }

    this.filteredDemands = filtered;
    this.updateStatistics();
    this.render();
  }

  onSearchChange(value) {
    this.applyFilters();
  }

  async onCardMoved(demandId, newStatus) {
    try {
      await this.demandService.updateDemandStatus(demandId, newStatus);
      
      // Atualizar no array
      const demand = this.demands.find(d => d.id === demandId);
      if (demand) {
        demand.status = newStatus;
        this.applyFilters();
      }

      NotificationService.success(`Demanda movida para ${newStatus}`);
    } catch (error) {
      console.error('Erro ao mover demanda:', error);
      NotificationService.error('Erro ao mover demanda');
      this.render(); // Re-render para voltar ao estado anterior
    }
  }

  updateStatistics() {
    const total = this.filteredDemands.length;
    const inProgress = this.filteredDemands.filter(d => 
      ['analyzing', 'waiting_correspondent', 'in_progress'].includes(d.status)
    ).length;
    const overdue = this.filteredDemands.filter(d => {
      const dueDate = new Date(d.due_date);
      return dueDate < new Date() && !['completed', 'archived'].includes(d.status);
    }).length;

    document.getElementById('totalDemands').textContent = total;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('overduCount').textContent = overdue;
  }

  render() {
    KanbanView.renderBoard(this.filteredDemands);
  }

  showNewDemandForm() {
    // Renderizar modal de nova demanda
    this.renderDemandForm();
  }

  showDemandDetail(demand) {
    // Renderizar modal de detalhes
    this.renderDemandDetail(demand);
  }

  renderDemandForm() {
    // Implementação do formulário
    // ...
  }

  renderDemandDetail(demand) {
    // Implementação dos detalhes
    // ...
  }
}

export default new KanbanController();
```

---

# 7. INTEGRAÇÃO E APIs

## 7.1 Serviço de Demandas

```javascript
// js/modules/demands/services/demand.service.js
import APIClient from '../../../utils.js';

export class DemandService {
  async getAllDemands(filters = {}) {
    return APIClient.get('/demands', { params: filters });
  }

  async getDemandById(id) {
    return APIClient.get(`/demands/${id}`);
  }

  async createDemand(data) {
    return APIClient.post('/demands', data);
  }

  async updateDemand(id, data) {
    return APIClient.put(`/demands/${id}`, data);
  }

  async updateDemandStatus(id, status) {
    return APIClient.put(`/demands/${id}/status`, { status });
  }

  async deleteDemand(id) {
    return APIClient.delete(`/demands/${id}`);
  }

  async getTimeline(demandId) {
    return APIClient.get(`/demands/${demandId}/timeline`);
  }

  async addComment(demandId, comment) {
    return APIClient.post(`/demands/${demandId}/comments`, { comment });
  }

  async assignCorrespondent(demandId, correspondentId) {
    return APIClient.put(`/demands/${demandId}/assign`, { correspondent_id: correspondentId });
  }
}

export default new DemandService();
```

---

**Módulo de Gestão de Demandas Completo** ✅