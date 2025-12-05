# JURISCONNECT - COMPONENTES DE FORMULÁRIO COM VALIDAÇÃO VISUAL

## 📋 ÍNDICE

1. [Inputs Padrão](#1-inputs-padrão)
2. [Selects e Dropdowns](#2-selects-e-dropdowns)
3. [Checkboxes e Radios](#3-checkboxes-e-radios)
4. [Textareas](#4-textareas)
5. [Datepickers](#5-datepickers)
6. [Upload de Arquivos](#6-upload-de-arquivos)
7. [Máscaras e Formatação](#7-máscaras-e-formatação)
8. [Validação em Tempo Real](#8-validação-em-tempo-real)
9. [Formulários Completos (Exemplos)](#9-formulários-completos-exemplos)

---

# 1. INPUTS PADRÃO

## 1.1 HTML Base com Validação Visual

```html
<!-- INPUT PADRÃO -->
<div class="form-group">
  <label for="name">Nome Completo</label>
  <input 
    type="text" 
    id="name" 
    class="form-control" 
    placeholder="Digite seu nome"
    data-validate="required|min:3|max:100"
    aria-label="Nome Completo"
    aria-describedby="name-error"
  >
  <small id="name-error" class="form-text"></small>
</div>

<!-- INPUT COM ÍCONE -->
<div class="form-group">
  <label for="email">Email</label>
  <div class="input-group">
    <span class="input-icon">
      <i class="fas fa-envelope"></i>
    </span>
    <input 
      type="email" 
      id="email" 
      class="form-control" 
      placeholder="seu@email.com"
      data-validate="required|email"
    >
  </div>
  <small class="form-text"></small>
</div>

<!-- INPUT COM SUFIXO/PREFIXO -->
<div class="form-group">
  <label for="phone">Telefone</label>
  <div class="input-group">
    <span class="input-prefix">+55</span>
    <input 
      type="tel" 
      id="phone" 
      class="form-control" 
      placeholder="(11) 99999-9999"
      data-mask="(##) #####-####"
      data-validate="required|phone"
    >
    <span class="input-suffix">
      <i class="fas fa-check" style="display: none;"></i>
    </span>
  </div>
  <small class="form-text"></small>
</div>

<!-- INPUT NUMÉRICO COM INCREMENTO -->
<div class="form-group">
  <label for="quantity">Quantidade</label>
  <div class="input-number">
    <button class="btn-decrement" type="button">
      <i class="fas fa-minus"></i>
    </button>
    <input 
      type="number" 
      id="quantity" 
      class="form-control" 
      value="1" 
      min="1" 
      max="100"
    >
    <button class="btn-increment" type="button">
      <i class="fas fa-plus"></i>
    </button>
  </div>
  <small class="form-text"></small>
</div>

<!-- INPUT COM CONTADOR DE CARACTERES -->
<div class="form-group">
  <label for="bio">Biografia</label>
  <div class="input-counter">
    <input 
      type="text" 
      id="bio" 
      class="form-control" 
      placeholder="Máximo 200 caracteres"
      maxlength="200"
      data-counter="true"
    >
    <span class="counter-display">
      <span class="counter-current">0</span> / 200
    </span>
  </div>
  <small class="form-text"></small>
</div>

<!-- INPUT SENHA COM TOGGLE -->
<div class="form-group">
  <label for="password">Senha</label>
  <div class="input-password">
    <input 
      type="password" 
      id="password" 
      class="form-control" 
      placeholder="Mínimo 8 caracteres"
      data-validate="required|min:8|password"
    >
    <button class="toggle-password" type="button" aria-label="Mostrar/Ocultar senha">
      <i class="fas fa-eye"></i>
    </button>
  </div>
  <small class="form-text"></small>
  <!-- Indicador de força -->
  <div class="password-strength">
    <div class="strength-bar">
      <div class="strength-fill" style="width: 0%"></div>
    </div>
    <span class="strength-text">Força: Nenhuma</span>
  </div>
</div>

<!-- INPUT DESABILITADO -->
<div class="form-group">
  <label for="disabled">Campo Desabilitado</label>
  <input 
    type="text" 
    id="disabled" 
    class="form-control" 
    placeholder="Não é possível editar"
    disabled
  >
  <small class="form-text">Este campo não pode ser editado</small>
</div>

<!-- INPUT SOMENTE LEITURA -->
<div class="form-group">
  <label for="readonly">Campo Somente Leitura</label>
  <input 
    type="text" 
    id="readonly" 
    class="form-control" 
    value="Valor fixo"
    readonly
  >
</div>

<!-- INPUT COM AUTOCOMPLETAR -->
<div class="form-group">
  <label for="country">País</label>
  <input 
    type="text" 
    id="country" 
    class="form-control autocomplete" 
    placeholder="Digite para buscar..."
    data-source="api/countries"
    autocomplete="off"
  >
  <ul class="autocomplete-list" style="display: none;">
    <!-- Preenchido dinamicamente -->
  </ul>
  <small class="form-text"></small>
</div>
```

## 1.2 CSS para Inputs

```css
/* ========== INPUT GRUPOS ========== */
.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-group .form-control {
  flex: 1;
}

.input-icon,
.input-prefix,
.input-suffix {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-base);
}

.input-icon {
  left: var(--spacing-md);
}

.input-icon + .form-control {
  padding-left: 2.5rem;
}

.input-prefix {
  left: var(--spacing-md);
}

.input-prefix + .form-control {
  padding-left: 3rem;
}

.input-suffix {
  right: var(--spacing-md);
}

.form-control + .input-suffix {
  padding-right: 2.5rem;
}

.input-suffix i.fa-check {
  color: var(--color-success);
}

.input-suffix i.fa-exclamation-circle {
  color: var(--color-error);
}

/* ========== INPUT NÚMERO ========== */
.input-number {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.input-number .form-control {
  text-align: center;
  flex: 1;
  max-width: 100px;
}

.btn-increment,
.btn-decrement {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.btn-increment:hover,
.btn-decrement:hover {
  background-color: var(--color-primary-lighter);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-increment:active,
.btn-decrement:active {
  transform: scale(0.95);
}

/* ========== INPUT CONTADOR ========== */
.input-counter {
  position: relative;
}

.counter-display {
  position: absolute;
  right: var(--spacing-md);
  top: -1.75rem;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.counter-current {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* ========== INPUT SENHA ========== */
.input-password {
  position: relative;
  display: flex;
  align-items: center;
}

.input-password .form-control {
  flex: 1;
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-base);
  padding: var(--spacing-sm);
  transition: color var(--transition-fast);
}

.toggle-password:hover {
  color: var(--text-primary);
}

/* Indicador de força da senha */
.password-strength {
  margin-top: var(--spacing-sm);
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: var(--spacing-xs);
}

.strength-fill {
  height: 100%;
  transition: width var(--transition-normal), background-color var(--transition-normal);
  background-color: var(--color-error);
}

.strength-fill.weak { background-color: var(--color-error); width: 25%; }
.strength-fill.fair { background-color: var(--color-warning); width: 50%; }
.strength-fill.good { background-color: #f59e0b; width: 75%; }
.strength-fill.strong { background-color: var(--color-success); width: 100%; }

.strength-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

/* ========== AUTOCOMPLETE ========== */
.autocomplete {
  position: relative;
}

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: var(--z-dropdown);
  box-shadow: var(--shadow-md);
}

.autocomplete-item {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.autocomplete-item:hover {
  background-color: var(--bg-secondary);
}

.autocomplete-item.selected {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
}

/* ========== ESTADOS DE VALIDAÇÃO ========== */
.form-control.is-valid {
  border-color: var(--color-success);
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

.form-control.is-valid:focus {
  box-shadow: 0 0 0 3px var(--color-success-light);
  border-color: var(--color-success);
}

.form-control.is-invalid {
  border-color: var(--color-error);
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
  border-color: var(--color-error);
}

/* ========== LOADING STATE ========== */
.form-control.is-loading {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><style>.spinner{animation:rotate 2s linear infinite;transform-origin:center center;transform:translateZ(0)}.spinner circle{stroke-dasharray:60;stroke-dashoffset:0;transform-origin:center center;stroke:%232465a7;animation:dash 1.5s ease-in-out infinite}</style><g class="spinner"><circle cx="12" cy="12" r="10" fill="none" stroke-width="2"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}
```

---

# 2. SELECTS E DROPDOWNS

## 2.1 HTML

```html
<!-- SELECT PADRÃO -->
<div class="form-group">
  <label for="specialty">Especialidade Jurídica</label>
  <select 
    id="specialty" 
    class="form-control form-select"
    data-validate="required"
  >
    <option value="">Selecione uma especialidade...</option>
    <option value="civil">Civil</option>
    <option value="penal">Penal</option>
    <option value="trabalhista">Trabalhista</option>
    <option value="tributaria">Tributária</option>
    <option value="imobiliaria">Imobiliária</option>
  </select>
  <small class="form-text"></small>
</div>

<!-- SELECT COM GRUPO -->
<div class="form-group">
  <label for="country">País</label>
  <select id="country" class="form-control form-select">
    <option value="">Selecione...</option>
    <optgroup label="América do Sul">
      <option value="br">Brasil</option>
      <option value="ar">Argentina</option>
      <option value="cl">Chile</option>
    </optgroup>
    <optgroup label="América do Norte">
      <option value="us">Estados Unidos</option>
      <option value="ca">Canadá</option>
    </optgroup>
  </select>
  <small class="form-text"></small>
</div>

<!-- SELECT MÚLTIPLO -->
<div class="form-group">
  <label for="expertise">Áreas de Expertise</label>
  <select 
    id="expertise" 
    class="form-control form-select" 
    multiple
    data-placeholder="Selecione uma ou mais áreas"
  >
    <option value="civil">Civil</option>
    <option value="penal">Penal</option>
    <option value="trabalhista">Trabalhista</option>
    <option value="tributaria">Tributária</option>
  </select>
  <small class="form-text">Você pode selecionar múltiplas opções</small>
</div>

<!-- MULTISELECT CUSTOMIZADO -->
<div class="form-group">
  <label for="skills">Competências</label>
  <div class="multiselect">
    <input 
      type="text" 
      class="form-control multiselect-input" 
      placeholder="Digite para buscar ou selecione..."
      aria-expanded="false"
    >
    <button class="multiselect-toggle" type="button" aria-label="Toggle">
      <i class="fas fa-chevron-down"></i>
    </button>
    <ul class="multiselect-options" style="display: none;">
      <li class="multiselect-option">
        <input type="checkbox" id="skill-1" value="html">
        <label for="skill-1">HTML/CSS</label>
      </li>
      <li class="multiselect-option">
        <input type="checkbox" id="skill-2" value="js">
        <label for="skill-2">JavaScript</label>
      </li>
      <li class="multiselect-option">
        <input type="checkbox" id="skill-3" value="react">
        <label for="skill-3">React</label>
      </li>
    </ul>
  </div>
  <div class="multiselect-tags">
    <!-- Tags preenchidas dinamicamente -->
  </div>
  <small class="form-text"></small>
</div>

<!-- COMBOBOX SEARCHABLE -->
<div class="form-group">
  <label for="client">Cliente</label>
  <div class="combobox">
    <input 
      type="text" 
      id="client" 
      class="form-control combobox-input" 
      placeholder="Digite nome do cliente..."
      autocomplete="off"
      data-source="api/clients"
      aria-autocomplete="list"
      aria-controls="client-list"
    >
    <ul class="combobox-list" id="client-list" style="display: none;">
      <li class="combobox-option">
        <span class="option-main">Escritório XYZ</span>
        <span class="option-sub">São Paulo - SP</span>
      </li>
      <li class="combobox-option">
        <span class="option-main">Empresa ABC</span>
        <span class="option-sub">Rio de Janeiro - RJ</span>
      </li>
    </ul>
  </div>
  <small class="form-text"></small>
</div>
```

## 2.2 CSS para Selects

```css
/* ========== SELECT PADRÃO ========== */
.form-select {
  appearance: none;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.form-select option {
  padding: var(--spacing-sm);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-select option:checked {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
}

/* ========== OPTGROUP ========== */
.form-select optgroup {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

/* ========== MULTISELECT CUSTOMIZADO ========== */
.multiselect {
  position: relative;
}

.multiselect-input {
  cursor: pointer;
  padding-right: 2.5rem;
}

.multiselect-toggle {
  position: absolute;
  right: var(--spacing-sm);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-base);
  padding: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.multiselect-toggle:hover {
  color: var(--text-primary);
}

.multiselect-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
  padding: var(--spacing-sm) 0;
  margin: 0;
  z-index: var(--z-dropdown);
  box-shadow: var(--shadow-md);
}

.multiselect-option {
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.multiselect-option:hover {
  background-color: var(--bg-secondary);
}

.multiselect-option input[type="checkbox"] {
  cursor: pointer;
}

.multiselect-option label {
  flex: 1;
  margin: 0;
  cursor: pointer;
}

.multiselect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  min-height: 0;
}

.multiselect-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-sm);
  animation: slideUp var(--transition-fast);
}

.multiselect-tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
}

.multiselect-tag-remove:hover {
  opacity: 0.7;
}

/* ========== COMBOBOX ========== */
.combobox {
  position: relative;
}

.combobox-input {
  padding-right: 2.5rem;
}

.combobox-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-top: none;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  max-height: 300px;
  overflow-y: auto;
  list-style: none;
  padding: var(--spacing-sm) 0;
  margin: 0;
  z-index: var(--z-dropdown);
  box-shadow: var(--shadow-md);
}

.combobox-option {
  padding: var(--spacing-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  border-bottom: 1px solid var(--border-color);
}

.combobox-option:last-child {
  border-bottom: none;
}

.combobox-option:hover {
  background-color: var(--bg-secondary);
}

.combobox-option.selected {
  background-color: var(--color-primary-lighter);
}

.option-main {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.option-sub {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}
```

---

# 3. CHECKBOXES E RADIOS

## 3.1 HTML

```html
<!-- CHECKBOX PADRÃO -->
<div class="form-check">
  <input 
    type="checkbox" 
    id="terms" 
    class="form-check-input"
    data-validate="required"
  >
  <label for="terms" class="form-check-label">
    Aceito os <a href="#">termos de serviço</a>
  </label>
</div>

<!-- CHECKBOX COM AJUDA -->
<div class="form-check">
  <input type="checkbox" id="newsletter" class="form-check-input">
  <label for="newsletter" class="form-check-label">
    Desejo receber newsletter
    <span class="form-check-help">Enviaremos atualizações semanais</span>
  </label>
</div>

<!-- GRUPO DE CHECKBOXES -->
<fieldset class="form-group">
  <legend>Áreas de Interesse</legend>
  <div class="form-check-group">
    <div class="form-check">
      <input type="checkbox" id="area1" class="form-check-input" value="civil">
      <label for="area1">Civil</label>
    </div>
    <div class="form-check">
      <input type="checkbox" id="area2" class="form-check-input" value="penal">
      <label for="area2">Penal</label>
    </div>
    <div class="form-check">
      <input type="checkbox" id="area3" class="form-check-input" value="trabalhista">
      <label for="area3">Trabalhista</label>
    </div>
  </div>
</fieldset>

<!-- RADIO BUTTONS -->
<fieldset class="form-group">
  <legend>Tipo de Pessoa</legend>
  <div class="form-check-group">
    <div class="form-check">
      <input 
        type="radio" 
        id="person-pf" 
        name="person-type" 
        class="form-check-input" 
        value="pf"
        checked
      >
      <label for="person-pf">Pessoa Física</label>
    </div>
    <div class="form-check">
      <input 
        type="radio" 
        id="person-pj" 
        name="person-type" 
        class="form-check-input" 
        value="pj"
      >
      <label for="person-pj">Pessoa Jurídica</label>
    </div>
  </div>
</fieldset>

<!-- RADIO COM ÍCONE -->
<fieldset class="form-group">
  <legend>Opções de Pagamento</legend>
  <div class="form-radio-icon-group">
    <label class="form-radio-icon">
      <input type="radio" name="payment" value="credit" class="form-check-input">
      <span class="icon">
        <i class="fas fa-credit-card"></i>
      </span>
      <span class="label">Cartão de Crédito</span>
    </label>
    <label class="form-radio-icon">
      <input type="radio" name="payment" value="pix" class="form-check-input">
      <span class="icon">
        <i class="fas fa-mobile-alt"></i>
      </span>
      <span class="label">PIX</span>
    </label>
    <label class="form-radio-icon">
      <input type="radio" name="payment" value="boleto" class="form-check-input">
      <span class="icon">
        <i class="fas fa-barcode"></i>
      </span>
      <span class="label">Boleto</span>
    </label>
  </div>
</fieldset>

<!-- SWITCH TOGGLE -->
<div class="form-group">
  <label for="notifications" class="form-label-with-switch">
    <span>Ativar Notificações</span>
    <input type="checkbox" id="notifications" class="form-switch">
    <span class="switch-slider"></span>
  </label>
</div>

<!-- CHECKBOX INDETERMINADO -->
<div class="form-group">
  <div class="form-check">
    <input 
      type="checkbox" 
      id="select-all" 
      class="form-check-input" 
      indeterminate
    >
    <label for="select-all">Selecionar Tudo</label>
  </div>
  <div style="margin-left: 1.5rem; margin-top: var(--spacing-sm);">
    <div class="form-check">
      <input type="checkbox" id="item1" class="form-check-input child">
      <label for="item1">Item 1</label>
    </div>
    <div class="form-check">
      <input type="checkbox" id="item2" class="form-check-input child">
      <label for="item2">Item 2</label>
    </div>
    <div class="form-check">
      <input type="checkbox" id="item3" class="form-check-input child">
      <label for="item3">Item 3</label>
    </div>
  </div>
</div>
```

## 3.2 CSS para Checkboxes/Radios

```css
/* ========== FORM CHECK (Customizado) ========== */
.form-check {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  min-width: 1.25rem;
  margin-top: 0.15rem;
  cursor: pointer;
  accent-color: var(--color-primary);
  appearance: none;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  position: relative;
}

.form-check-input:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-lighter);
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z"/></svg>');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%;
}

.form-check-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.form-check-input:disabled {
  background-color: var(--bg-secondary);
  border-color: var(--border-color);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Radio Button */
.form-check-input[type="radio"] {
  border-radius: 50%;
}

.form-check-input[type="radio"]:checked {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="3"/></svg>');
}

.form-check-label {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
}

.form-check-help {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

/* ========== GRUPO DE CHECKBOXES ========== */
.form-check-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

legend {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding: 0;
}

/* ========== RADIO COM ÍCONE ========== */
.form-radio-icon-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.form-radio-icon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.form-radio-icon:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-lighter);
}

.form-radio-icon input[type="radio"] {
  display: none;
}

.form-radio-icon input[type="radio"]:checked + .icon {
  color: var(--color-primary);
}

.form-radio-icon input[type="radio"]:checked ~ .label {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.form-radio-icon .icon {
  font-size: 2rem;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.form-radio-icon .label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* ========== SWITCH TOGGLE ========== */
.form-label-with-switch {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.form-switch {
  appearance: none;
  width: 3rem;
  height: 1.5rem;
  border-radius: 999px;
  border: none;
  background-color: var(--border-color);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-fast);
  outline: none;
  margin: 0;
}

.form-switch:checked {
  background-color: var(--color-primary);
}

.form-switch:focus {
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.form-switch::after {
  content: '';
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: white;
  top: 0.125rem;
  left: 0.125rem;
  transition: all var(--transition-fast);
}

.form-switch:checked::after {
  left: 1.625rem;
}

.switch-slider {
  display: none;
}
```

---

# 4. TEXTAREAS

## 4.1 HTML

```html
<!-- TEXTAREA PADRÃO -->
<div class="form-group">
  <label for="message">Mensagem</label>
  <textarea 
    id="message" 
    class="form-control" 
    rows="4" 
    placeholder="Digite sua mensagem"
    data-validate="required|min:10|max:500"
  ></textarea>
  <small class="form-text"></small>
</div>

<!-- TEXTAREA REDIMENSIONÁVEL -->
<div class="form-group">
  <label for="notes">Notas</label>
  <textarea 
    id="notes" 
    class="form-control textarea-resize" 
    rows="4" 
    placeholder="Digite suas notas"
  ></textarea>
  <small class="form-text">Você pode redimensionar este campo</small>
</div>

<!-- TEXTAREA COM AUTO-CRESCIMENTO -->
<div class="form-group">
  <label for="description">Descrição</label>
  <textarea 
    id="description" 
    class="form-control textarea-auto-grow" 
    rows="2" 
    placeholder="Cresce automaticamente conforme você digita"
    data-max-rows="8"
  ></textarea>
  <small class="form-text"></small>
</div>

<!-- TEXTAREA COM EDITOR RICO (Markdown) -->
<div class="form-group">
  <label for="content">Conteúdo</label>
  <div class="editor-toolbar">
    <button class="editor-btn" data-action="bold" title="Bold (Ctrl+B)">
      <i class="fas fa-bold"></i>
    </button>
    <button class="editor-btn" data-action="italic" title="Italic (Ctrl+I)">
      <i class="fas fa-italic"></i>
    </button>
    <button class="editor-btn" data-action="link" title="Link">
      <i class="fas fa-link"></i>
    </button>
    <span class="toolbar-divider"></span>
    <button class="editor-btn" data-action="ul" title="Unordered List">
      <i class="fas fa-list-ul"></i>
    </button>
    <button class="editor-btn" data-action="ol" title="Ordered List">
      <i class="fas fa-list-ol"></i>
    </button>
    <span class="toolbar-divider"></span>
    <button class="editor-btn" data-action="code" title="Code">
      <i class="fas fa-code"></i>
    </button>
  </div>
  <textarea 
    id="content" 
    class="form-control editor-textarea" 
    rows="6" 
    placeholder="# Digite seu conteúdo"
  ></textarea>
  <small class="form-text">Suporta Markdown</small>
</div>
```

## 4.2 CSS para Textareas

```css
/* ========== TEXTAREA PADRÃO ========== */
textarea.form-control {
  font-family: inherit;
  resize: vertical;
}

textarea.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

/* ========== TEXTAREA COM AUTO-CRESCIMENTO ========== */
textarea.textarea-auto-grow {
  resize: none;
  overflow: hidden;
}

/* ========== EDITOR TOOLBAR ========== */
.editor-toolbar {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  flex-wrap: wrap;
}

.editor-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid transparent;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
}

.editor-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.editor-btn.active {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
  margin: 0 var(--spacing-xs);
}

.editor-textarea {
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  border-top: none;
  font-family: 'Courier New', monospace;
}

.editor-textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}
```

---

# 5. DATEPICKERS

## 5.1 HTML

```html
<!-- DATE INPUT PADRÃO -->
<div class="form-group">
  <label for="birthdate">Data de Nascimento</label>
  <input 
    type="date" 
    id="birthdate" 
    class="form-control" 
    data-validate="required|date"
  >
  <small class="form-text"></small>
</div>

<!-- DATE RANGE -->
<div class="form-group">
  <label>Período</label>
  <div class="date-range">
    <input 
      type="date" 
      class="form-control" 
      placeholder="Data Inicial"
      data-range="start"
    >
    <span class="date-range-separator">até</span>
    <input 
      type="date" 
      class="form-control" 
      placeholder="Data Final"
      data-range="end"
    >
  </div>
  <small class="form-text"></small>
</div>

<!-- TIME INPUT -->
<div class="form-group">
  <label for="appointment-time">Hora do Agendamento</label>
  <input 
    type="time" 
    id="appointment-time" 
    class="form-control" 
    data-validate="required|time"
  >
  <small class="form-text">Horário comercial: 08:00 - 18:00</small>
</div>

<!-- DATETIME INPUT -->
<div class="form-group">
  <label for="event-datetime">Data e Hora do Evento</label>
  <input 
    type="datetime-local" 
    id="event-datetime" 
    class="form-control"
    data-validate="required|datetime"
  >
  <small class="form-text"></small>
</div>

<!-- MONTH INPUT -->
<div class="form-group">
  <label for="valid-month">Mês de Validade</label>
  <input 
    type="month" 
    id="valid-month" 
    class="form-control"
    data-validate="required|month"
  >
  <small class="form-text"></small>
</div>

<!-- CUSTOM DATEPICKER COM CALENDÁRIO -->
<div class="form-group">
  <label for="custom-date">Selecione uma Data</label>
  <div class="custom-datepicker">
    <input 
      type="text" 
      id="custom-date"
      class="form-control datepicker-input" 
      placeholder="dd/mm/yyyy"
      readonly
      data-validate="required|date"
    >
    <button class="datepicker-trigger" type="button" aria-label="Abrir calendário">
      <i class="fas fa-calendar"></i>
    </button>
    <div class="datepicker-calendar" style="display: none;">
      <div class="datepicker-header">
        <button class="datepicker-prev" type="button">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h3 class="datepicker-month-year">Novembro 2025</h3>
        <button class="datepicker-next" type="button">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      <div class="datepicker-weekdays">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sab</div>
      </div>
      <div class="datepicker-days">
        <!-- Dias preenchidos dinamicamente -->
      </div>
    </div>
  </div>
  <small class="form-text"></small>
</div>
```

## 5.2 CSS para Datepickers

```css
/* ========== DATE RANGE ========== */
.date-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.date-range .form-control {
  flex: 1;
}

.date-range-separator {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
}

/* ========== CUSTOM DATEPICKER ========== */
.custom-datepicker {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
}

.datepicker-input {
  flex: 1;
  text-align: center;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.datepicker-trigger {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-left: none;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  transition: all var(--transition-fast);
  font-size: var(--font-size-base);
}

.datepicker-trigger:hover {
  background-color: var(--bg-tertiary);
}

.datepicker-trigger:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* ========== CALENDÁRIO ========== */
.datepicker-calendar {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: var(--spacing-xs);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  min-width: 320px;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
}

.datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.datepicker-month-year {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  min-width: 150px;
  text-align: center;
}

.datepicker-prev,
.datepicker-next {
  width: 36px;
  height: 36px;
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

.datepicker-prev:hover,
.datepicker-next:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

/* Dias da semana */
.datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.datepicker-weekdays div {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  padding: var(--spacing-xs);
}

/* Dias do mês */
.datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
}

.datepicker-day {
  aspect-ratio: 1;
  padding: var(--spacing-xs);
  border: none;
  background-color: transparent;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.datepicker-day:hover {
  background-color: var(--bg-secondary);
}

.datepicker-day.other-month {
  color: var(--text-tertiary);
}

.datepicker-day.today {
  border: 2px solid var(--color-primary);
}

.datepicker-day.selected {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  font-weight: var(--font-weight-medium);
}

.datepicker-day.disabled {
  color: var(--text-tertiary);
  cursor: not-allowed;
  opacity: 0.5;
}
```

---

# 6. UPLOAD DE ARQUIVOS

## 6.1 HTML

```html
<!-- UPLOAD BÁSICO -->
<div class="form-group">
  <label for="document">Documento</label>
  <input 
    type="file" 
    id="document" 
    class="form-control form-file"
    accept=".pdf,.doc,.docx"
    data-validate="required|file:5000|accept:pdf,doc,docx"
  >
  <small class="form-text">Máximo: 5MB. Formatos: PDF, DOC, DOCX</small>
</div>

<!-- UPLOAD MÚLTIPLO -->
<div class="form-group">
  <label for="attachments">Anexos</label>
  <input 
    type="file" 
    id="attachments" 
    class="form-control form-file" 
    multiple
    accept="image/*,.pdf"
    data-validate="file:10000"
  >
  <small class="form-text">Você pode enviar múltiplos arquivos</small>
</div>

<!-- DRAG & DROP -->
<div class="form-group">
  <label>Arraste arquivos aqui</label>
  <div class="file-drop-zone">
    <i class="fas fa-cloud-upload-alt"></i>
    <p>Arraste arquivos ou <a href="#" class="file-drop-link">clique para selecionar</a></p>
    <small>Máximo: 25MB por arquivo</small>
    <input 
      type="file" 
      class="file-drop-input" 
      multiple
      style="display: none;"
    >
  </div>
</div>

<!-- UPLOAD COM PREVIEW DE IMAGEM -->
<div class="form-group">
  <label for="avatar">Foto de Perfil</label>
  <div class="file-upload-preview">
    <input 
      type="file" 
      id="avatar" 
      class="form-control form-file" 
      accept="image/*"
      data-validate="file:5000|accept:jpg,jpeg,png,gif"
    >
    <div class="preview-zone">
      <img class="preview-image" style="display: none;">
      <div class="preview-placeholder" style="display: flex;">
        <i class="fas fa-image"></i>
        <p>Nenhuma imagem selecionada</p>
      </div>
    </div>
  </div>
</div>

<!-- UPLOAD COM BARRA DE PROGRESSO -->
<div class="form-group">
  <label for="video">Vídeo</label>
  <div class="file-upload-advanced">
    <input 
      type="file" 
      id="video" 
      class="form-control form-file" 
      accept="video/*"
      data-validate="file:100000"
    >
    <div class="upload-progress" style="display: none;">
      <div class="progress-bar-wrapper">
        <div class="progress-bar"></div>
      </div>
      <span class="progress-text">0%</span>
    </div>
  </div>
</div>

<!-- LISTA DE ARQUIVOS ENVIADOS -->
<div class="form-group">
  <label>Arquivos Anexados</label>
  <div class="file-list">
    <div class="file-item">
      <div class="file-icon">
        <i class="fas fa-file-pdf"></i>
      </div>
      <div class="file-info">
        <p class="file-name">documento.pdf</p>
        <p class="file-size">2.3 MB</p>
      </div>
      <button class="file-remove" type="button" aria-label="Remover">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    <div class="file-item">
      <div class="file-icon">
        <i class="fas fa-file-word"></i>
      </div>
      <div class="file-info">
        <p class="file-name">relatorio.docx</p>
        <p class="file-size">1.1 MB</p>
      </div>
      <button class="file-remove" type="button">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</div>
```

## 6.2 CSS para Upload

```css
/* ========== FILE INPUT ========== */
.form-file {
  /* Customizar aparência nativa */
}

/* ========== DROP ZONE ========== */
.file-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: 3rem var(--spacing-lg);
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  background-color: var(--bg-secondary);
}

.file-drop-zone:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-lighter);
}

.file-drop-zone.drag-over {
  border-color: var(--color-primary);
  background-color: var(--color-primary-lighter);
  transform: scale(1.02);
}

.file-drop-zone i {
  font-size: 3rem;
  color: var(--text-secondary);
}

.file-drop-zone p {
  margin: 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.file-drop-zone small {
  color: var(--text-secondary);
}

.file-drop-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.file-drop-link:hover {
  text-decoration: underline;
}

/* ========== PREVIEW DE IMAGEM ========== */
.file-upload-preview {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: var(--spacing-lg);
}

.preview-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--bg-secondary);
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-placeholder {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--text-tertiary);
}

.preview-placeholder i {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-sm);
}

.preview-placeholder p {
  margin: 0;
  font-size: var(--font-size-sm);
}

/* ========== BARRA DE PROGRESSO ========== */
.upload-progress {
  margin-top: var(--spacing-md);
}

.progress-bar-wrapper {
  width: 100%;
  height: 8px;
  background-color: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  width: 0%;
  transition: width 200ms linear;
  border-radius: 999px;
}

.progress-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* ========== FILE LIST ========== */
.file-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.file-item:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-lighter);
}

.file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--color-primary);
}

.file-info {
  flex: 1;
}

.file-name {
  margin: 0;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.file-size {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.file-remove {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--font-size-base);
  padding: var(--spacing-sm);
  transition: color var(--transition-fast);
}

.file-remove:hover {
  color: var(--color-error);
}
```

---

# 7. MÁSCARAS E FORMATAÇÃO

## 7.1 JavaScript para Máscaras

```javascript
/*
 * MÁSCARAS E FORMATAÇÃO DE ENTRADA
 */

class InputMask {
  static masks = {
    phone: '(##) #####-####',
    cpf: '###.###.###-##',
    cnpj: '##.###.###/####-##',
    cep: '#####-###',
    creditcard: '#### #### #### ####',
    currency: 'R$ #.###,##'
  };

  static apply(input, maskPattern) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      let masked = '';
      let maskIndex = 0;

      for (let i = 0; i < value.length && maskIndex < maskPattern.length; i++) {
        if (maskPattern[maskIndex] === '#') {
          masked += value[i];
          maskIndex++;
        } else {
          masked += maskPattern[maskIndex];
          maskIndex++;
          if (maskPattern[maskIndex] === '#') {
            masked += value[i];
            maskIndex++;
          }
        }
      }

      e.target.value = masked;
    });
  }

  static applyCPF(input) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (value.length > 0) {
        value = value.slice(0, 3) + '.' + value.slice(3);
      }
      if (value.length > 7) {
        value = value.slice(0, 7) + '.' + value.slice(7);
      }
      if (value.length > 11) {
        value = value.slice(0, 11) + '-' + value.slice(11);
      }
      e.target.value = value;
    });
  }

  static applyCurrency(input) {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      let cents = value.slice(-2) || '00';
      let reais = value.slice(0, -2) || '0';
      
      reais = parseInt(reais || '0').toLocaleString('pt-BR');
      e.target.value = `R$ ${reais},${cents}`;
    });
  }
}

// Usar:
// InputMask.apply(document.getElementById('phone'), InputMask.masks.phone);
// InputMask.applyCPF(document.getElementById('cpf'));
// InputMask.applyCurrency(document.getElementById('amount'));
```

---

# 8. VALIDAÇÃO EM TEMPO REAL

## 8.1 JavaScript de Validação

```javascript
/*
 * VALIDAÇÃO EM TEMPO REAL
 */

class FormValidator {
  constructor(form) {
    this.form = form;
    this.rules = {};
    this.errors = {};
    this.init();
  }

  init() {
    this.form.querySelectorAll('[data-validate]').forEach(field => {
      const rules = field.getAttribute('data-validate');
      this.rules[field.name || field.id] = rules.split('|');

      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          this.validateField(field);
        }
      });
    });

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateField(field) {
    const name = field.name || field.id;
    const rules = this.rules[name] || [];
    const value = field.value.trim();
    const errors = [];

    for (let rule of rules) {
      const [validator, ...params] = rule.split(':');

      if (this.validators[validator]) {
        const isValid = this.validators[validator](value, params);
        if (!isValid) {
          errors.push(this.getErrorMessage(validator, params));
        }
      }
    }

    this.setFieldState(field, errors);
    return errors.length === 0;
  }

  validators = {
    required: (value) => value.length > 0,
    
    email: (value) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value);
    },
    
    min: (value, params) => value.length >= parseInt(params[0]),
    
    max: (value, params) => value.length <= parseInt(params[0]),
    
    phone: (value) => {
      const regex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      return regex.test(value);
    },
    
    password: (value) => {
      // Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial
      const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return regex.test(value);
    },
    
    match: (value, params) => {
      const otherField = document.querySelector(`[name="${params[0]}"], #${params[0]}`);
      return otherField && value === otherField.value;
    },
    
    date: (value) => !isNaN(Date.parse(value)),
    
    cpf: (value) => {
      value = value.replace(/\D/g, '');
      if (value.length !== 11) return false;
      
      let sum = 0;
      let remainder;
      
      for (let i = 1; i <= 9; i++) {
        sum += parseInt(value.substring(i - 1, i)) * (11 - i);
      }
      
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(value.substring(9, 10))) return false;
      
      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum += parseInt(value.substring(i - 1, i)) * (12 - i);
      }
      
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(value.substring(10, 11))) return false;
      
      return true;
    },
    
    cnpj: (value) => {
      value = value.replace(/\D/g, '');
      if (value.length !== 14) return false;
      
      let size = value.length - 2;
      let numbers = value.substring(0, size);
      let digits = value.substring(size);
      
      let sum = 0;
      let pos = size - 7;
      
      for (let i = size; i >= 1; i--) {
        sum += numbers.charAt(size - i) * pos--;
        if (pos < 2) pos = 9;
      }
      
      let firstDigit = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (firstDigit !== parseInt(digits.charAt(0))) return false;
      
      sum = 0;
      pos = size - 6;
      
      for (let i = size + 1; i >= 1; i--) {
        sum += numbers.charAt(size + 1 - i) * pos--;
        if (pos < 2) pos = 9;
      }
      
      let secondDigit = sum % 11 < 2 ? 0 : 11 - sum % 11;
      return secondDigit === parseInt(digits.charAt(1));
    }
  };

  getErrorMessage(validator, params) {
    const messages = {
      required: 'Este campo é obrigatório',
      email: 'Email inválido',
      min: `Mínimo de ${params[0]} caracteres`,
      max: `Máximo de ${params[0]} caracteres`,
      phone: 'Telefone inválido',
      password: 'Senha deve conter maiúscula, número e caractere especial',
      match: 'Senhas não conferem',
      date: 'Data inválida',
      cpf: 'CPF inválido',
      cnpj: 'CNPJ inválido'
    };
    return messages[validator] || 'Campo inválido';
  }

  setFieldState(field, errors) {
    const errorElement = field.parentElement.querySelector('.form-text') ||
                        field.closest('.form-group')?.querySelector('.form-text');
    
    field.classList.remove('is-valid', 'is-invalid');
    
    if (errors.length > 0) {
      field.classList.add('is-invalid');
      if (errorElement) {
        errorElement.textContent = errors[0];
        errorElement.classList.add('text-error');
      }
    } else {
      field.classList.add('is-valid');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('text-error');
      }
    }
  }

  handleSubmit(e) {
    let isValid = true;
    
    this.form.querySelectorAll('[data-validate]').forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    if (!isValid) {
      e.preventDefault();
    }

    return isValid;
  }
}

// Usar:
// const form = document.querySelector('#my-form');
// new FormValidator(form);
```

---

# 9. FORMULÁRIOS COMPLETOS (EXEMPLOS)

## 9.1 Formulário de Cadastro de Cliente

```html
<form id="client-form" class="form-container">
  <h2>Cadastro de Cliente</h2>

  <!-- SEÇÃO 1: INFORMAÇÕES BÁSICAS -->
  <fieldset class="form-section">
    <legend>Informações Básicas</legend>
    
    <div class="grid grid-cols-2">
      <div class="form-group">
        <label for="client-name">Nome Completo *</label>
        <input 
          type="text" 
          id="client-name" 
          name="name"
          class="form-control" 
          placeholder="Digite o nome"
          data-validate="required|min:3|max:100"
        >
        <small class="form-text"></small>
      </div>

      <div class="form-group">
        <label for="client-email">Email *</label>
        <input 
          type="email" 
          id="client-email" 
          name="email"
          class="form-control" 
          placeholder="seu@email.com"
          data-validate="required|email"
        >
        <small class="form-text"></small>
      </div>
    </div>

    <div class="grid grid-cols-2">
      <div class="form-group">
        <label for="client-type">Tipo de Cliente *</label>
        <select id="client-type" name="type" class="form-control form-select" data-validate="required">
          <option value="">Selecione...</option>
          <option value="pf">Pessoa Física</option>
          <option value="pj">Pessoa Jurídica</option>
        </select>
        <small class="form-text"></small>
      </div>

      <div class="form-group">
        <label for="client-phone">Telefone *</label>
        <input 
          type="tel" 
          id="client-phone" 
          name="phone"
          class="form-control" 
          placeholder="(11) 99999-9999"
          data-mask="(##) #####-####"
          data-validate="required|phone"
        >
        <small class="form-text"></small>
      </div>
    </div>
  </fieldset>

  <!-- SEÇÃO 2: ENDEREÇO -->
  <fieldset class="form-section">
    <legend>Endereço</legend>
    
    <div class="grid grid-cols-3">
      <div class="form-group">
        <label for="client-cep">CEP *</label>
        <input 
          type="text" 
          id="client-cep" 
          name="cep"
          class="form-control" 
          placeholder="00000-000"
          data-mask="#####-###"
          data-validate="required"
        >
        <small class="form-text"></small>
      </div>

      <div class="form-group">
        <label for="client-city">Cidade *</label>
        <input 
          type="text" 
          id="client-city" 
          name="city"
          class="form-control autocomplete" 
          data-validate="required"
        >
        <small class="form-text"></small>
      </div>

      <div class="form-group">
        <label for="client-state">Estado *</label>
        <select id="client-state" name="state" class="form-control form-select" data-validate="required">
          <option value="">Selecione...</option>
          <option value="sp">São Paulo</option>
          <option value="rj">Rio de Janeiro</option>
          <!-- Mais estados -->
        </select>
        <small class="form-text"></small>
      </div>
    </div>

    <div class="form-group">
      <label for="client-address">Endereço *</label>
      <input 
        type="text" 
        id="client-address" 
        name="address"
        class="form-control" 
        placeholder="Rua, Avenida, etc"
        data-validate="required"
      >
      <small class="form-text"></small>
    </div>
  </fieldset>

  <!-- SEÇÃO 3: DOCUMENTOS -->
  <fieldset class="form-section">
    <legend>Documentos</legend>
    
    <div class="grid grid-cols-2">
      <div class="form-group">
        <label for="client-cpf">CPF/CNPJ *</label>
        <input 
          type="text" 
          id="client-cpf" 
          name="cpf"
          class="form-control" 
          placeholder="000.000.000-00"
          data-validate="required|cpf"
        >
        <small class="form-text"></small>
      </div>

      <div class="form-group">
        <label for="client-rg">RG/IE</label>
        <input 
          type="text" 
          id="client-rg" 
          name="rg"
          class="form-control" 
          placeholder="0000000"
        >
        <small class="form-text"></small>
      </div>
    </div>
  </fieldset>

  <!-- SEÇÃO 4: ESPECIALIDADES -->
  <fieldset class="form-section">
    <legend>Áreas de Interesse</legend>
    
    <div class="form-check-group">
      <div class="form-check">
        <input type="checkbox" id="area-civil" name="areas" value="civil" class="form-check-input">
        <label for="area-civil">Civil</label>
      </div>
      <div class="form-check">
        <input type="checkbox" id="area-penal" name="areas" value="penal" class="form-check-input">
        <label for="area-penal">Penal</label>
      </div>
      <div class="form-check">
        <input type="checkbox" id="area-trabalhista" name="areas" value="trabalhista" class="form-check-input">
        <label for="area-trabalhista">Trabalhista</label>
      </div>
    </div>
  </fieldset>

  <!-- SEÇÃO 5: OBSERVAÇÕES -->
  <fieldset class="form-section">
    <legend>Observações</legend>
    
    <div class="form-group">
      <label for="client-notes">Notas</label>
      <textarea 
        id="client-notes" 
        name="notes"
        class="form-control textarea-auto-grow" 
        rows="3" 
        placeholder="Adicione observações sobre o cliente"
        data-max-rows="6"
      ></textarea>
      <small class="form-text"></small>
    </div>
  </fieldset>

  <!-- BOTÕES -->
  <div class="form-actions">
    <button type="reset" class="btn btn-secondary">
      <i class="fas fa-redo"></i> Limpar
    </button>
    <button type="submit" class="btn btn-primary">
      <i class="fas fa-save"></i> Salvar Cliente
    </button>
  </div>
</form>

<style>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.form-section {
  border: none;
  padding: 0;
  margin-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-lg);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section legend {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3 {
    grid-template-columns: 1fr !important;
  }
}
</style>
```

---

**Componentes de Formulário Completos e Padronizados** ✅