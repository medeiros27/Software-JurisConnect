# JURISCONNECT - SISTEMA DE AGENDA COM CALENDÁRIO E ALERTAS DE PRAZOS

## 📋 ÍNDICE

1. [Arquitetura do Sistema](#1-arquitetura-do-sistema)
2. [Calendário Principal](#2-calendário-principal)
3. [Visualizações Alternativas](#3-visualizações-alternativas)
4. [Sistema de Alertas](#4-sistema-de-alertas)
5. [Gestão de Eventos](#5-gestão-de-eventos)
6. [Notificações e Lembretes](#6-notificações-e-lembretes)
7. [JavaScript do Calendário](#7-javascript-do-calendário)
8. [Integração com APIs](#8-integração-com-apis)

---

# 1. ARQUITETURA DO SISTEMA

## 1.1 Estrutura de Pastas

```
js/modules/calendar/
├── index.js                         # Entry point
├── calendar.js                      # Calendário principal
├── agenda.js                        # Agenda/lista
├── alerts.js                        # Sistema alertas
├── controllers/
│   ├── calendar-controller.js       # Controle calendário
│   ├── alerts-controller.js         # Controle alertas
│   └── schedule-controller.js       # Controle agenda
├── services/
│   ├── calendar.service.js          # APIs calendário
│   ├── alerts.service.js            # Lógica alertas
│   ├── notification.service.js      # Notificações
│   └── sync.service.js              # Sincronização
├── views/
│   ├── calendar.view.js             # Renderização cal
│   ├── agenda.view.js               # Renderização agenda
│   └── alerts.view.js               # Renderização alertas
└── utils/
    ├── date-utils.js                # Funções data
    ├── recurring.js                 # Eventos recorrentes
    └── notifications.js             # Notificações browser

Tipos de Eventos:
├─ Prazo de Demanda
├─ Audiência/Julgamento
├─ Reunião com Cliente
├─ Vencimento de Fatura
├─ Evento Pessoal
└─ Tarefa

Alertas:
├─ 7 dias antes
├─ 3 dias antes
├─ 1 dia antes
├─ Na data
└─ Customizado
```

---

# 2. CALENDÁRIO PRINCIPAL

## 2.1 HTML do Calendário

```html
<div class="calendar-page">
  <!-- Header -->
  <div class="calendar-header">
    <div class="calendar-title">
      <button class="nav-btn prev" id="prevMonth" aria-label="Mês anterior">
        <i class="fas fa-chevron-left"></i>
      </button>
      <h1 id="currentMonth">Novembro 2025</h1>
      <button class="nav-btn next" id="nextMonth" aria-label="Próximo mês">
        <i class="fas fa-chevron-right"></i>
      </button>
      <button class="btn btn-sm btn-outline" id="todayBtn">
        Hoje
      </button>
    </div>

    <div class="calendar-controls">
      <select id="calendarViewSelect" class="form-control">
        <option value="month">Mês</option>
        <option value="week">Semana</option>
        <option value="day">Dia</option>
        <option value="agenda">Agenda</option>
      </select>

      <button class="btn btn-primary" id="newEventBtn">
        <i class="fas fa-plus"></i> Novo Evento
      </button>
    </div>
  </div>

  <!-- Legenda -->
  <div class="calendar-legend">
    <div class="legend-item">
      <span class="legend-color" style="background-color: var(--color-error);"></span>
      <span>Atrasado</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: var(--color-warning);"></span>
      <span>Alerta (< 3 dias)</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: var(--color-primary);"></span>
      <span>Demanda</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: var(--color-success);"></span>
      <span>Reunião</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" style="background-color: var(--color-info);"></span>
      <span>Fatura</span>
    </div>
  </div>

  <!-- Calendário Grid -->
  <div class="calendar-container">
    <!-- Weekdays Header -->
    <div class="calendar-weekdays">
      <div class="weekday">Dom</div>
      <div class="weekday">Seg</div>
      <div class="weekday">Ter</div>
      <div class="weekday">Qua</div>
      <div class="weekday">Qui</div>
      <div class="weekday">Sex</div>
      <div class="weekday">Sab</div>
    </div>

    <!-- Days Grid -->
    <div class="calendar-grid" id="calendarGrid">
      <!-- Renderizado dinamicamente -->
    </div>
  </div>

  <!-- Painel Lateral - Eventos do Dia -->
  <aside class="calendar-sidebar">
    <div class="sidebar-header">
      <h3>Eventos Hoje</h3>
      <span class="event-count" id="todayEventCount">0</span>
    </div>

    <div class="events-list" id="todayEventsList">
      <!-- Renderizado dinamicamente -->
    </div>

    <!-- Próximos Eventos -->
    <div class="upcoming-section">
      <h4>Próximos 7 Dias</h4>
      <div class="upcoming-list" id="upcomingList">
        <!-- Renderizado dinamicamente -->
      </div>
    </div>

    <!-- Alertas -->
    <div class="alerts-section">
      <h4>Alertas</h4>
      <div class="alerts-list" id="alertsList">
        <!-- Renderizado dinamicamente -->
      </div>
    </div>
  </aside>

  <!-- Modal de Detalhes -->
  <div id="eventDetailModal" class="modal" style="display: none;">
    <!-- Renderizado dinamicamente -->
  </div>

  <!-- Modal de Novo Evento -->
  <div id="eventFormModal" class="modal" style="display: none;">
    <!-- Renderizado dinamicamente -->
  </div>
</div>

<!-- CSS Calendário -->
<style>
.calendar-page {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.calendar-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.calendar-title h1 {
  margin: 0;
  font-size: var(--font-size-xl);
  min-width: 150px;
  text-align: center;
}

.nav-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.calendar-controls {
  display: flex;
  gap: var(--spacing-md);
}

.calendar-legend {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  grid-column: 1 / -1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.calendar-container {
  flex: 1;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  min-height: 600px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.weekday {
  text-align: center;
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  padding: var(--spacing-sm);
  text-transform: uppercase;
  font-size: var(--font-size-xs);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-sm);
  flex: 1;
}

.calendar-day {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-sm);
  min-height: 100px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-md);
}

.calendar-day.other-month {
  opacity: 0.5;
  cursor: default;
}

.calendar-day.other-month:hover {
  box-shadow: none;
  background-color: var(--bg-secondary);
}

.calendar-day.today {
  border: 2px solid var(--color-primary);
  background-color: var(--color-primary-lighter);
}

.calendar-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.calendar-day-number {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.calendar-day-number.other-month {
  color: var(--text-tertiary);
}

.calendar-day-alert {
  font-size: 0.75rem;
  color: var(--color-error);
  font-weight: var(--font-weight-bold);
}

.calendar-day-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
}

.event-badge {
  font-size: 0.65rem;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-badge:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.event-badge.demand {
  background-color: var(--color-primary);
}

.event-badge.meeting {
  background-color: var(--color-success);
}

.event-badge.invoice {
  background-color: var(--color-info);
}

.event-badge.task {
  background-color: var(--color-warning);
}

.event-badge.alert {
  background-color: var(--color-error);
}

.calendar-day-more {
  font-size: 0.7rem;
  color: var(--color-primary);
  cursor: pointer;
  margin-top: auto;
}

/* Sidebar */
.calendar-sidebar {
  width: 300px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  overflow-y: auto;
  max-height: 80vh;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h3 {
  margin: 0;
}

.event-count {
  background-color: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.event-item {
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-item:hover {
  background-color: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
}

.event-item.alert-high {
  border-left-color: var(--color-error);
}

.event-item.alert-medium {
  border-left-color: var(--color-warning);
}

.event-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.event-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.event-type {
  display: inline-block;
  font-size: 0.65rem;
  padding: 2px 6px;
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  border-radius: 999px;
  font-weight: var(--font-weight-medium);
}

.upcoming-section,
.alerts-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.upcoming-section h4,
.alerts-section h4 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

.upcoming-list,
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.upcoming-item,
.alert-item {
  font-size: var(--font-size-xs);
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}

.upcoming-item .date,
.alert-item .date {
  color: var(--text-secondary);
  display: block;
  margin-bottom: 2px;
}

.upcoming-item .title,
.alert-item .title {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.alert-item.high {
  background-color: var(--color-error-light);
  border-left: 3px solid var(--color-error);
}

.alert-item.medium {
  background-color: var(--color-warning-light);
  border-left: 3px solid var(--color-warning);
}

.alert-item.low {
  background-color: var(--color-info-light);
  border-left: 3px solid var(--color-info);
}

/* Responsividade */
@media (max-width: 1024px) {
  .calendar-page {
    flex-direction: column;
  }

  .calendar-sidebar {
    width: 100%;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .calendar-controls {
    flex-direction: column;
    width: 100%;
  }

  .calendar-controls > * {
    width: 100%;
  }

  .calendar-legend {
    flex-direction: column;
  }

  .calendar-day {
    min-height: 80px;
    font-size: 0.75rem;
  }

  .calendar-day-number {
    font-size: 0.875rem;
  }

  .event-badge {
    font-size: 0.6rem;
  }
}
</style>
```

---

# 3. VISUALIZAÇÕES ALTERNATIVAS

## 3.1 Visualização Semanal

```html
<div class="calendar-week-view" style="display: none;">
  <div class="week-header" id="weekHeader">
    <!-- Dias da semana renderizados -->
  </div>

  <div class="week-grid">
    <div class="time-labels">
      <div class="time-slot">08:00</div>
      <div class="time-slot">09:00</div>
      <div class="time-slot">10:00</div>
      <!-- ... até 18:00 -->
    </div>

    <div class="week-days" id="weekDays">
      <!-- Renderizado dinamicamente -->
    </div>
  </div>
</div>

<style>
.calendar-week-view {
  display: flex;
  height: 800px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-primary);
  overflow: hidden;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  text-align: center;
  font-weight: var(--font-weight-semibold);
}

.week-grid {
  display: flex;
  flex: 1;
}

.time-labels {
  width: 80px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

.time-slot {
  flex: 1;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
}

.week-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  gap: 1px;
}

.week-day-column {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

.week-hour {
  flex: 1;
  border-bottom: 1px solid var(--border-color);
  position: relative;
  min-height: 50px;
}

.event-block {
  position: absolute;
  left: 2px;
  right: 2px;
  background-color: var(--color-primary);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.65rem;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.event-block:hover {
  box-shadow: var(--shadow-md);
  z-index: 10;
}
</style>
```

## 3.2 Visualização de Agenda (Lista)

```html
<div class="calendar-agenda-view" style="display: none;">
  <div class="agenda-filters">
    <input 
      type="text" 
      class="form-control" 
      placeholder="Buscar evento..."
    >
    <select class="form-control">
      <option value="">Todos Tipos</option>
      <option value="demand">Demanda</option>
      <option value="meeting">Reunião</option>
      <option value="invoice">Fatura</option>
      <option value="task">Tarefa</option>
    </select>
    <select class="form-control">
      <option value="date">Por Data</option>
      <option value="priority">Por Prioridade</option>
      <option value="type">Por Tipo</option>
    </select>
  </div>

  <div class="agenda-list" id="agendaList">
    <!-- Renderizado dinamicamente -->
  </div>
</div>

<style>
.calendar-agenda-view {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.agenda-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.agenda-filters > * {
  flex: 1;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.agenda-date-group {
  margin-bottom: var(--spacing-lg);
}

.agenda-date-header {
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
  color: var(--text-primary);
}

.agenda-event {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.agenda-event:hover {
  background-color: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
}

.agenda-event-time {
  min-width: 60px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.agenda-event-content {
  flex: 1;
}

.agenda-event-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 2px;
}

.agenda-event-meta {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.agenda-event-status {
  display: flex;
  gap: var(--spacing-sm);
}

.agenda-event-tag {
  display: inline-block;
  font-size: 0.65rem;
  padding: 2px 6px;
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  border-radius: 999px;
  font-weight: var(--font-weight-medium);
}
</style>
```

---

# 4. SISTEMA DE ALERTAS

## 4.1 HTML de Alertas

```html
<div class="alerts-dashboard">
  <!-- Alertas Críticos -->
  <section class="alerts-section critical">
    <div class="section-header">
      <h3><i class="fas fa-exclamation-circle"></i> Crítico</h3>
      <span class="alert-count" id="criticalCount">0</span>
    </div>
    <div class="alerts-list" id="criticalAlerts">
      <!-- Renderizado dinamicamente -->
    </div>
  </section>

  <!-- Alertas de Aviso -->
  <section class="alerts-section warning">
    <div class="section-header">
      <h3><i class="fas fa-exclamation-triangle"></i> Aviso</h3>
      <span class="alert-count" id="warningCount">0</span>
    </div>
    <div class="alerts-list" id="warningAlerts">
      <!-- Renderizado dinamicamente -->
    </div>
  </section>

  <!-- Alertas de Informação -->
  <section class="alerts-section info">
    <div class="section-header">
      <h3><i class="fas fa-info-circle"></i> Informação</h3>
      <span class="alert-count" id="infoCount">0</span>
    </div>
    <div class="alerts-list" id="infoAlerts">
      <!-- Renderizado dinamicamente -->
    </div>
  </section>
</div>

<style>
.alerts-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.alerts-section {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
}

.alerts-section.critical {
  border-left: 4px solid var(--color-error);
}

.alerts-section.warning {
  border-left: 4px solid var(--color-warning);
}

.alerts-section.info {
  border-left: 4px solid var(--color-info);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.alert-count {
  background-color: var(--color-error);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.alert-card {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.alert-card:hover {
  background-color: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
}

.alert-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alert-icon.critical {
  background-color: var(--color-error-light);
  color: var(--color-error);
}

.alert-icon.warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.alert-icon.info {
  background-color: var(--color-info-light);
  color: var(--color-info);
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: var(--font-weight-medium);
  margin-bottom: 4px;
}

.alert-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.alert-meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.alert-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.alert-btn {
  padding: 4px 8px;
  font-size: var(--font-size-xs);
  border: none;
  background-color: transparent;
  color: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.alert-btn:hover {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
}
</style>
```

---

# 5. GESTÃO DE EVENTOS

## 5.1 Formulário de Novo Evento

```html
<!-- Modal Novo Evento -->
<div id="eventFormModal" class="modal">
  <div class="modal-dialog modal-lg">
    <div class="modal-header">
      <h2>Novo Evento</h2>
      <button class="modal-close">&times;</button>
    </div>

    <form class="event-form" id="eventForm">
      <div class="modal-body">
        
        <!-- Seção Básica -->
        <fieldset class="form-section">
          <legend>Informações Básicas</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="eventTitle">Título *</label>
              <input 
                type="text" 
                id="eventTitle" 
                name="title" 
                class="form-control"
                data-validate="required"
                placeholder="Ex: Prazo de Recurso"
                required
              >
              <small class="form-text"></small>
            </div>

            <div class="form-group">
              <label for="eventType">Tipo *</label>
              <select 
                id="eventType" 
                name="type" 
                class="form-control"
                data-validate="required"
                required
              >
                <option value="">Selecione...</option>
                <option value="demand">Prazo de Demanda</option>
                <option value="meeting">Reunião</option>
                <option value="hearing">Audiência/Julgamento</option>
                <option value="invoice">Vencimento de Fatura</option>
                <option value="task">Tarefa</option>
                <option value="other">Outro</option>
              </select>
              <small class="form-text"></small>
            </div>
          </div>

          <div class="form-group">
            <label for="eventDescription">Descrição</label>
            <textarea 
              id="eventDescription" 
              name="description" 
              class="form-control"
              rows="3"
              placeholder="Detalhes do evento..."
            ></textarea>
          </div>
        </fieldset>

        <!-- Seção Data e Hora -->
        <fieldset class="form-section">
          <legend>Data e Hora</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="eventDate">Data *</label>
              <input 
                type="date" 
                id="eventDate" 
                name="date" 
                class="form-control"
                data-validate="required"
                required
              >
            </div>

            <div class="form-group">
              <label for="eventTime">Hora</label>
              <input 
                type="time" 
                id="eventTime" 
                name="time" 
                class="form-control"
              >
            </div>

            <div class="form-group">
              <label for="eventDuration">Duração (min)</label>
              <input 
                type="number" 
                id="eventDuration" 
                name="duration" 
                class="form-control"
                value="60"
                min="15"
                step="15"
              >
            </div>
          </div>

          <!-- Recorrência -->
          <div class="form-group">
            <label for="eventRecurrence">Recorrência</label>
            <select id="eventRecurrence" name="recurrence" class="form-control">
              <option value="none">Sem recorrência</option>
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          <!-- Recorre até -->
          <div class="form-group" id="recurrenceUntilGroup" style="display: none;">
            <label for="eventRecurrenceUntil">Recorre até</label>
            <input 
              type="date" 
              id="eventRecurrenceUntil" 
              name="recurrenceUntil" 
              class="form-control"
            >
          </div>
        </fieldset>

        <!-- Seção Alertas -->
        <fieldset class="form-section">
          <legend>Alertas</legend>
          
          <div class="form-check-group">
            <div class="form-check">
              <input 
                type="checkbox" 
                id="alertWeek" 
                name="alerts" 
                value="week"
                class="form-check-input"
              >
              <label for="alertWeek">7 dias antes</label>
            </div>
            <div class="form-check">
              <input 
                type="checkbox" 
                id="alertThreeDays" 
                name="alerts" 
                value="three-days"
                class="form-check-input"
              >
              <label for="alertThreeDays">3 dias antes</label>
            </div>
            <div class="form-check">
              <input 
                type="checkbox" 
                id="alertDay" 
                name="alerts" 
                value="day"
                class="form-check-input"
              >
              <label for="alertDay">1 dia antes</label>
            </div>
            <div class="form-check">
              <input 
                type="checkbox" 
                id="alertOnDay" 
                name="alerts" 
                value="on-day"
                class="form-check-input"
                checked
              >
              <label for="alertOnDay">No dia</label>
            </div>
          </div>

          <!-- Notificações -->
          <div class="form-check-group" style="margin-top: var(--spacing-lg);">
            <div class="form-check">
              <input 
                type="checkbox" 
                id="notificationEmail" 
                name="notifications" 
                value="email"
                class="form-check-input"
              >
              <label for="notificationEmail">Notificação por Email</label>
            </div>
            <div class="form-check">
              <input 
                type="checkbox" 
                id="notificationBrowser" 
                name="notifications" 
                value="browser"
                class="form-check-input"
              >
              <label for="notificationBrowser">Notificação no Browser</label>
            </div>
            <div class="form-check">
              <input 
                type="checkbox" 
                id="notificationSMS" 
                name="notifications" 
                value="sms"
                class="form-check-input"
              >
              <label for="notificationSMS">SMS (se cadastrado)</label>
            </div>
          </div>
        </fieldset>

        <!-- Seção Vínculo -->
        <fieldset class="form-section">
          <legend>Vínculo</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="eventDemand">Demanda (opcional)</label>
              <select id="eventDemand" name="demand_id" class="form-control">
                <option value="">Sem vínculo</option>
                <option value="1">DEM-2025-001 - Ação de Cobrança</option>
                <option value="2">DEM-2025-002 - Parecer Jurídico</option>
              </select>
            </div>

            <div class="form-group">
              <label for="eventClient">Cliente (opcional)</label>
              <select id="eventClient" name="client_id" class="form-control">
                <option value="">Sem vínculo</option>
                <option value="1">Escritório XYZ</option>
                <option value="2">Empresa ABC</option>
              </select>
            </div>
          </div>
        </fieldset>

        <!-- Seção Prioridade -->
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
        <button type="button" class="btn btn-secondary" id="eventFormCancel">Cancelar</button>
        <button type="submit" class="btn btn-primary" id="eventFormSubmit">Criar Evento</button>
      </div>
    </form>
  </div>
</div>
```

---

# 6. NOTIFICAÇÕES E LEMBRETES

## 6.1 Sistema de Notificações

```javascript
// js/modules/calendar/services/notification.service.js
export class NotificationService {
  async sendBrowserNotification(event) {
    if (!('Notification' in window)) {
      console.log('Browser não suporta notificações');
      return;
    }

    if (Notification.permission === 'granted') {
      this.createNotification(event);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.createNotification(event);
        }
      });
    }
  }

  createNotification(event) {
    const notification = new Notification(`⏰ ${event.title}`, {
      body: `${event.description || ''}\nData: ${event.date}`,
      icon: '/img/logo.png',
      badge: '/img/badge.png',
      tag: `event-${event.id}`,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // Abrir detalhe do evento
    };

    // Auto-fechar em 5 segundos
    setTimeout(() => notification.close(), 5000);
  }

  async sendEmailNotification(event, userEmail) {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          event: event,
          type: 'event_reminder'
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async sendSMSNotification(event, phoneNumber) {
    try {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          event: event,
          type: 'event_reminder'
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      throw error;
    }
  }

  scheduleReminders(event) {
    const eventDate = new Date(event.date);
    const now = new Date();

    // 7 dias antes
    if (event.alerts.includes('week')) {
      const sevenDaysBefore = new Date(eventDate);
      sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
      this.scheduleNotification(event, sevenDaysBefore);
    }

    // 3 dias antes
    if (event.alerts.includes('three-days')) {
      const threeDaysBefore = new Date(eventDate);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      this.scheduleNotification(event, threeDaysBefore);
    }

    // 1 dia antes
    if (event.alerts.includes('day')) {
      const oneDayBefore = new Date(eventDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      this.scheduleNotification(event, oneDayBefore);
    }

    // No dia
    if (event.alerts.includes('on-day')) {
      const eventTime = event.time ? 
        new Date(`${event.date}T${event.time}`) : 
        new Date(event.date);
      this.scheduleNotification(event, eventTime);
    }
  }

  scheduleNotification(event, triggerTime) {
    const now = new Date();
    const delay = triggerTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        this.sendBrowserNotification(event);
        
        if (event.notifications.includes('email')) {
          this.sendEmailNotification(event, getUserEmail());
        }
        
        if (event.notifications.includes('sms')) {
          this.sendSMSNotification(event, getUserPhone());
        }
      }, delay);
    }
  }
}

export default new NotificationService();
```

---

# 7. JAVASCRIPT DO CALENDÁRIO

## 7.1 Controlador do Calendário

```javascript
// js/modules/calendar/controllers/calendar-controller.js
import CalendarService from '../services/calendar.service.js';
import AlertsService from '../services/alerts.service.js';
import NotificationService from '../services/notification.service.js';
import DateUtils from '../utils/date-utils.js';

export class CalendarController {
  constructor() {
    this.currentDate = new Date();
    this.events = [];
    this.view = 'month';
    this.init();
  }

  async init() {
    await this.loadEvents();
    this.render();
    this.setupEventListeners();
    this.startAlertChecker();
  }

  async loadEvents() {
    try {
      this.events = await CalendarService.getAllEvents();
      this.updateAlerts();
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  }

  render() {
    switch (this.view) {
      case 'month':
        this.renderMonthView();
        break;
      case 'week':
        this.renderWeekView();
        break;
      case 'day':
        this.renderDayView();
        break;
      case 'agenda':
        this.renderAgendaView();
        break;
    }

    this.updateSidebar();
  }

  renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Atualizar título
    const monthName = new Date(year, month).toLocaleDateString('pt-BR', 
      { month: 'long', year: 'numeric' }
    );
    document.getElementById('currentMonth').textContent = 
      monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Renderizar dias
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      this.createDayElement(date, true, grid);
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.createDayElement(date, false, grid);
    }

    // Dias do próximo mês
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.createDayElement(date, true, grid);
    }
  }

  createDayElement(date, isOtherMonth, container) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    if (isOtherMonth) {
      dayElement.classList.add('other-month');
    }

    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      dayElement.classList.add('today');
    }

    // Header do dia
    const header = document.createElement('div');
    header.className = 'calendar-day-header';

    const dayNumber = document.createElement('span');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = date.getDate();

    header.appendChild(dayNumber);

    // Eventos do dia
    const dayEvents = this.getEventsForDate(date);
    const eventsContainer = document.createElement('div');
    eventsContainer.className = 'calendar-day-events';

    dayEvents.slice(0, 2).forEach(event => {
      const badge = this.createEventBadge(event);
      eventsContainer.appendChild(badge);
    });

    if (dayEvents.length > 2) {
      const more = document.createElement('div');
      more.className = 'calendar-day-more';
      more.textContent = `+${dayEvents.length - 2} mais`;
      eventsContainer.appendChild(more);
    }

    dayElement.appendChild(header);
    dayElement.appendChild(eventsContainer);

    // Click para ver dia
    dayElement.addEventListener('click', () => {
      if (!isOtherMonth) {
        this.selectDay(date);
      }
    });

    container.appendChild(dayElement);
  }

  createEventBadge(event) {
    const badge = document.createElement('div');
    badge.className = `event-badge ${event.type}`;
    badge.textContent = event.title;
    badge.title = event.title;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showEventDetail(event);
    });

    return badge;
  }

  getEventsForDate(date) {
    return this.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  updateSidebar() {
    const today = new Date();
    const todayEvents = this.getEventsForDate(today);

    // Atualizar contador
    document.getElementById('todayEventCount').textContent = todayEvents.length;

    // Atualizar lista
    const eventsList = document.getElementById('todayEventsList');
    eventsList.innerHTML = '';

    todayEvents.forEach(event => {
      const item = this.createEventItem(event);
      eventsList.appendChild(item);
    });

    // Próximos 7 dias
    const upcomingList = document.getElementById('upcomingList');
    upcomingList.innerHTML = '';

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayEvents = this.getEventsForDate(date);

      dayEvents.forEach(event => {
        const item = document.createElement('div');
        item.className = 'upcoming-item';
        item.innerHTML = `
          <div class="date">${date.toLocaleDateString('pt-BR')}</div>
          <div class="title">${event.title}</div>
        `;
        upcomingList.appendChild(item);
      });
    }
  }

  updateAlerts() {
    const today = new Date();
    const alerts = AlertsService.checkAlerts(this.events, today);

    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    alerts.forEach(alert => {
      const item = document.createElement('div');
      item.className = `alert-item ${alert.level}`;
      item.innerHTML = `
        <div class="date">${alert.daysUntil} dias</div>
        <div class="title">${alert.event.title}</div>
      `;
      alertsList.appendChild(item);
    });
  }

  setupEventListeners() {
    document.getElementById('prevMonth')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    document.getElementById('nextMonth')?.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    document.getElementById('todayBtn')?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.render();
    });

    document.getElementById('newEventBtn')?.addEventListener('click', () => {
      this.showEventForm();
    });

    document.getElementById('calendarViewSelect')?.addEventListener('change', (e) => {
      this.view = e.target.value;
      this.render();
    });
  }

  startAlertChecker() {
    // Verificar alertas a cada minuto
    setInterval(() => {
      this.updateAlerts();
    }, 60000);
  }

  showEventForm() {
    // Renderizar modal de novo evento
  }

  showEventDetail(event) {
    // Renderizar modal de detalhes
  }

  selectDay(date) {
    this.currentDate = date;
    this.view = 'day';
    this.render();
  }
}

export default new CalendarController();
```

---

# 8. INTEGRAÇÃO COM APIS

## 8.1 Serviço de Calendário

```javascript
// js/modules/calendar/services/calendar.service.js
export class CalendarService {
  async getAllEvents(filters = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: 'Prazo de Recurso',
            type: 'demand',
            date: '2025-11-10',
            time: '14:00',
            duration: 60,
            description: 'Prazo final para protocolar recurso',
            demandId: 1,
            clientId: 1,
            priority: 'high',
            alerts: ['week', 'three-days', 'day', 'on-day'],
            notifications: ['email', 'browser'],
            recurrence: 'none'
          },
          {
            id: 2,
            title: 'Reunião com Cliente',
            type: 'meeting',
            date: '2025-11-05',
            time: '10:00',
            duration: 90,
            description: 'Alinhamento sobre DEM-2025-001',
            clientId: 1,
            priority: 'medium',
            alerts: ['day', 'on-day'],
            notifications: ['browser'],
            recurrence: 'none'
          },
          {
            id: 3,
            title: 'Vencimento Fatura FAT-001',
            type: 'invoice',
            date: '2025-11-08',
            description: 'Fatura para Escritório XYZ',
            priority: 'high',
            alerts: ['three-days', 'on-day'],
            notifications: ['email'],
            recurrence: 'monthly'
          }
        ]);
      }, 600);
    });
  }

  async createEvent(eventData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ ...eventData, id: Date.now() });
      }, 500);
    });
  }

  async updateEvent(eventId, eventData) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id: eventId, ...eventData });
      }, 500);
    });
  }

  async deleteEvent(eventId) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  async getEventDetail(eventId) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: eventId,
          title: 'Prazo de Recurso',
          description: 'Detalhes completos...'
        });
      }, 300);
    });
  }
}

export default new CalendarService();
```

---

**Sistema de Agenda Completo com Calendário e Alertas** ✅