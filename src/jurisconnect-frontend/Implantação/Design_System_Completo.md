# JURISCONNECT - DESIGN SYSTEM COMPLETO

## 📋 ÍNDICE

1. [Variáveis CSS & Paleta de Cores](#1-variáveis-css--paleta-de-cores)
2. [Tipografia](#2-tipografia)
3. [Grid e Layout](#3-grid-e-layout)
4. [Componentes Base](#4-componentes-base)
5. [Padrão Principal (App Layout)](#5-padrão-principal-app-layout)
6. [Acessibilidade & Animações](#6-acessibilidade--animações)

---

# 1. VARIÁVEIS CSS & PALETA DE CORES

## 1.1 Arquivo: `css/variables.css`

```css
/*
 * JURISCONNECT - Design System Variables
 * Paleta profissional para SaaS jurídico
 * ======================================
 */

:root {
  /* ========== CORES PRIMÁRIAS ========== */
  --color-primary: #2465a7;           /* Azul jurídico (principal) */
  --color-primary-dark: #1a4d8a;      /* Azul escuro (hover) */
  --color-primary-light: #3d7acc;     /* Azul claro (background) */
  --color-primary-lighter: #e8eff7;   /* Azul muito claro (bg button hover) */
  
  /* ========== CORES SECUNDÁRIAS ========== */
  --color-secondary: #6c63ff;         /* Roxo (complementar) */
  --color-secondary-light: #e8e5ff;   /* Roxo claro */
  --color-secondary-dark: #4a3fbf;    /* Roxo escuro */
  
  /* ========== CORES DE SUCESSO/ERRO/AVISO ========== */
  --color-success: #10b981;           /* Verde (sucesso) */
  --color-success-light: #d1fae5;     /* Verde claro (background) */
  --color-success-dark: #059669;      /* Verde escuro */
  
  --color-error: #ef4444;             /* Vermelho (erro) */
  --color-error-light: #fee2e2;       /* Vermelho claro */
  --color-error-dark: #dc2626;        /* Vermelho escuro */
  
  --color-warning: #f59e0b;           /* Laranja (aviso) */
  --color-warning-light: #fef3c7;     /* Laranja claro */
  --color-warning-dark: #d97706;      /* Laranja escuro */
  
  --color-info: #3b82f6;              /* Azul claro (informação) */
  --color-info-light: #dbeafe;        /* Azul muito claro */
  --color-info-dark: #1d4ed8;         /* Azul escuro */
  
  /* ========== ESCALA CINZA (Neutros) ========== */
  --color-gray-50: #f9fafb;           /* Quase branco */
  --color-gray-100: #f3f4f6;          /* Muito claro */
  --color-gray-200: #e5e7eb;          /* Claro */
  --color-gray-300: #d1d5db;          /* Médio claro */
  --color-gray-400: #9ca3af;          /* Médio */
  --color-gray-500: #6b7280;          /* Médio escuro */
  --color-gray-600: #4b5563;          /* Escuro */
  --color-gray-700: #374151;          /* Mais escuro */
  --color-gray-800: #1f2937;          /* Muito escuro */
  --color-gray-900: #111827;          /* Preto (quase) */
  
  /* ========== CORES DE BACKGROUND ========== */
  --bg-primary: #ffffff;              /* Branco principal */
  --bg-secondary: #f9fafb;            /* Cinza muito claro */
  --bg-tertiary: #f3f4f6;             /* Cinza claro */
  --bg-overlay: rgba(0, 0, 0, 0.5);   /* Overlay modal */
  
  /* ========== CORES DE TEXTO ========== */
  --text-primary: #111827;            /* Texto principal */
  --text-secondary: #6b7280;          /* Texto secundário */
  --text-tertiary: #9ca3af;           /* Texto terciário (desabilitado) */
  --text-inverse: #ffffff;            /* Texto em background escuro */
  --text-link: #2465a7;               /* Links */
  --text-link-hover: #1a4d8a;         /* Links hover */
  
  /* ========== SOMBRAS ========== */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 
               0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
               0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 
               0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
               0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* ========== BORDAS ========== */
  --border-color: #e5e7eb;
  --border-color-dark: #d1d5db;
  --border-radius: 0.5rem;            /* 8px */
  --border-radius-md: 0.75rem;        /* 12px */
  --border-radius-lg: 1rem;           /* 16px */
  
  /* ========== ESPAÇAMENTO (8px base) ========== */
  --spacing-xs: 0.25rem;              /* 4px */
  --spacing-sm: 0.5rem;               /* 8px */
  --spacing-md: 1rem;                 /* 16px */
  --spacing-lg: 1.5rem;               /* 24px */
  --spacing-xl: 2rem;                 /* 32px */
  --spacing-2xl: 2.5rem;              /* 40px */
  --spacing-3xl: 3rem;                /* 48px */
  
  /* ========== TRANSIÇÕES ========== */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* ========== Z-INDEX (Escala 10) ========== */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-notification: 800;
  
  /* ========== BREAKPOINTS (Mobile First) ========== */
  --breakpoint-sm: 640px;             /* Tablet pequeno */
  --breakpoint-md: 768px;             /* Tablet */
  --breakpoint-lg: 1024px;            /* Desktop pequeno */
  --breakpoint-xl: 1280px;            /* Desktop */
  --breakpoint-2xl: 1536px;           /* Desktop grande */
  
  /* ========== TAMANHOS DE FONTE (Rem base 16px) ========== */
  --font-size-xs: 0.75rem;            /* 12px */
  --font-size-sm: 0.875rem;           /* 14px */
  --font-size-base: 1rem;             /* 16px */
  --font-size-lg: 1.125rem;           /* 18px */
  --font-size-xl: 1.25rem;            /* 20px */
  --font-size-2xl: 1.5rem;            /* 24px */
  --font-size-3xl: 1.875rem;          /* 30px */
  --font-size-4xl: 2.25rem;           /* 36px */
  
  /* ========== ALTURA DE LINHA ========== */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* ========== PESO DA FONTE ========== */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
}

/* ========== DARK MODE (Futuro) ========== */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #3d7acc;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --bg-tertiary: #374151;
    --border-color: #4b5563;
  }
}
```

---

# 2. TIPOGRAFIA

## 2.1 Arquivo: `css/typography.css`

```css
/*
 * TIPOGRAFIA - Hierarquia e Legibilidade
 * =====================================
 */

/* ========== IMPORTAÇÃO DE FONTE ========== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ========== RESET BASE ========== */
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  margin: 0;
  padding: 0;
}

/* ========== TÍTULOS (H1-H6) ========== */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  padding: 0;
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

h1 {
  font-size: var(--font-size-4xl);        /* 36px */
  font-weight: var(--font-weight-extrabold);
  margin-bottom: var(--spacing-lg);
}

h2 {
  font-size: var(--font-size-3xl);        /* 30px */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
}

h3 {
  font-size: var(--font-size-2xl);        /* 24px */
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
}

h4 {
  font-size: var(--font-size-xl);         /* 20px */
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
}

h5 {
  font-size: var(--font-size-lg);         /* 18px */
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

h6 {
  font-size: var(--font-size-base);       /* 16px */
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
}

/* ========== PARÁGRAFOS E TEXTO ========== */
p {
  margin: 0;
  padding: 0;
  margin-bottom: var(--spacing-md);
}

p:last-child {
  margin-bottom: 0;
}

small {
  font-size: var(--font-size-sm);         /* 14px */
  color: var(--text-secondary);
}

/* ========== CLASSES UTILITÁRIAS ========== */
.text-xs { font-size: var(--font-size-xs); }
.text-sm { font-size: var(--font-size-sm); }
.text-base { font-size: var(--font-size-base); }
.text-lg { font-size: var(--font-size-lg); }
.text-xl { font-size: var(--font-size-xl); }

.text-light { font-weight: var(--font-weight-light); }
.text-normal { font-weight: var(--font-weight-normal); }
.text-medium { font-weight: var(--font-weight-medium); }
.text-semibold { font-weight: var(--font-weight-semibold); }
.text-bold { font-weight: var(--font-weight-bold); }

.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }
.text-muted { color: var(--color-gray-500); }

.text-success { color: var(--color-success); }
.text-error { color: var(--color-error); }
.text-warning { color: var(--color-warning); }
.text-info { color: var(--color-info); }

.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }
.text-justify { text-align: justify; }

.text-uppercase { text-transform: uppercase; }
.text-lowercase { text-transform: lowercase; }
.text-capitalize { text-transform: capitalize; }

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* ========== LINKS ========== */
a {
  color: var(--text-link);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--text-link-hover);
  text-decoration: underline;
}

a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--border-radius);
}

/* ========== CÓDIGO ========== */
code, pre {
  font-family: 'Courier New', monospace;
  background-color: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  color: var(--color-error-dark);
}

pre {
  padding: var(--spacing-md);
  overflow-x: auto;
  margin-bottom: var(--spacing-md);
}

/* ========== LISTAS ========== */
ul, ol {
  margin: 0;
  padding-left: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

li {
  margin-bottom: var(--spacing-sm);
}

/* ========== BLOCOS DE CITAÇÃO ========== */
blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: var(--spacing-md);
  margin-left: 0;
  margin-right: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
  font-style: italic;
}

/* ========== RESPONSIVIDADE TIPOGRÁFICA ========== */
@media (max-width: 640px) {
  h1 { font-size: var(--font-size-3xl); }
  h2 { font-size: var(--font-size-2xl); }
  h3 { font-size: var(--font-size-xl); }
  h4 { font-size: var(--font-size-lg); }
  
  body {
    font-size: var(--font-size-sm);
  }
}
```

---

# 3. GRID E LAYOUT

## 3.1 Arquivo: `css/grid.css`

```css
/*
 * SISTEMA DE GRID E LAYOUT
 * ========================
 */

/* ========== CONTAINER ========== */
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

.container-sm {
  max-width: 640px;
}

.container-md {
  max-width: 768px;
}

.container-lg {
  max-width: 1024px;
}

/* ========== GRID (CSS Grid) ========== */
.grid {
  display: grid;
  gap: var(--spacing-md);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* ========== FLEXBOX ========== */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.flex-wrap {
  flex-wrap: wrap;
}

.flex-nowrap {
  flex-wrap: nowrap;
}

.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
.gap-xl { gap: var(--spacing-xl); }

.items-start { align-items: flex-start; }
.items-center { align-items: center; }
.items-end { align-items: flex-end; }
.items-stretch { align-items: stretch; }

.justify-start { justify-content: flex-start; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.justify-evenly { justify-content: space-evenly; }

/* ========== FLEX ITEMS ========== */
.flex-1 { flex: 1 1 0%; }
.flex-auto { flex: 1 1 auto; }
.flex-none { flex: none; }

.flex-grow { flex-grow: 1; }
.flex-shrink { flex-shrink: 1; }
.flex-grow-0 { flex-grow: 0; }
.flex-shrink-0 { flex-shrink: 0; }

/* ========== ESPAÇAMENTO (Margin/Padding) ========== */
.p-0 { padding: 0; }
.p-xs { padding: var(--spacing-xs); }
.p-sm { padding: var(--spacing-sm); }
.p-md { padding: var(--spacing-md); }
.p-lg { padding: var(--spacing-lg); }
.p-xl { padding: var(--spacing-xl); }

.px-sm { padding-left: var(--spacing-sm); padding-right: var(--spacing-sm); }
.px-md { padding-left: var(--spacing-md); padding-right: var(--spacing-md); }
.px-lg { padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }

.py-sm { padding-top: var(--spacing-sm); padding-bottom: var(--spacing-sm); }
.py-md { padding-top: var(--spacing-md); padding-bottom: var(--spacing-md); }
.py-lg { padding-top: var(--spacing-lg); padding-bottom: var(--spacing-lg); }

.m-0 { margin: 0; }
.m-auto { margin: auto; }
.m-xs { margin: var(--spacing-xs); }
.m-sm { margin: var(--spacing-sm); }
.m-md { margin: var(--spacing-md); }
.m-lg { margin: var(--spacing-lg); }

.mx-auto { margin-left: auto; margin-right: auto; }
.my-auto { margin-top: auto; margin-bottom: auto; }

.mb-xs { margin-bottom: var(--spacing-xs); }
.mb-sm { margin-bottom: var(--spacing-sm); }
.mb-md { margin-bottom: var(--spacing-md); }
.mb-lg { margin-bottom: var(--spacing-lg); }

.mt-xs { margin-top: var(--spacing-xs); }
.mt-sm { margin-top: var(--spacing-sm); }
.mt-md { margin-top: var(--spacing-md); }
.mt-lg { margin-top: var(--spacing-lg); }

/* ========== DISPLAY ========== */
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }
.hidden { display: none; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* ========== POSICIONAMENTO ========== */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }

.top-0 { top: 0; }
.right-0 { right: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }

/* ========== OVERFLOW ========== */
.overflow-auto { overflow: auto; }
.overflow-hidden { overflow: hidden; }
.overflow-x-auto { overflow-x: auto; }
.overflow-y-auto { overflow-y: auto; }

/* ========== RESPONSIVIDADE ========== */
@media (max-width: 768px) {
  .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grid-cols-12 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  
  .hidden-mobile { display: none; }
}

@media (max-width: 640px) {
  .grid-cols-2 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-4 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-12 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  
  .flex-col-mobile { flex-direction: column; }
}
```

---

# 4. COMPONENTES BASE

## 4.1 Arquivo: `css/components.css`

```css
/*
 * COMPONENTES BASE
 * ================
 */

/* ========== BOTÕES ========== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: 0.625rem 1rem;
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  outline: none;
}

/* Botão Primary */
.btn-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Botão Secondary */
.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--color-gray-200);
  border-color: var(--color-gray-300);
}

/* Botão Outline */
.btn-outline {
  background-color: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-outline:hover {
  background-color: var(--color-primary-lighter);
}

/* Botão Ghost */
.btn-ghost {
  background-color: transparent;
  color: var(--color-primary);
}

.btn-ghost:hover {
  background-color: var(--color-primary-lighter);
}

/* Tamanhos */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-xs);
}

.btn-lg {
  padding: 0.875rem 1.5rem;
  font-size: var(--font-size-base);
}

.btn-block {
  width: 100%;
}

/* Botão com ícone */
.btn i {
  font-size: 1.125rem;
}

.btn-icon-only {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: var(--border-radius);
}

/* ========== INPUTS ========== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: all var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.form-control:disabled {
  background-color: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-control::placeholder {
  color: var(--text-tertiary);
}

/* Input sucesso */
.form-control.is-valid {
  border-color: var(--color-success);
}

.form-control.is-valid:focus {
  box-shadow: 0 0 0 3px var(--color-success-light);
}

/* Input erro */
.form-control.is-invalid {
  border-color: var(--color-error);
}

.form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
}

/* Ajuda de formulário */
.form-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.form-text.is-invalid {
  color: var(--color-error);
}

/* Checkbox e Radio */
.form-check {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.form-check input[type="checkbox"],
.form-check input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.form-check label {
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

/* ========== CARDS ========== */
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
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
}

.card-header h2 {
  margin-bottom: 0;
}

.card-body {
  padding: var(--spacing-md) 0;
}

.card-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-md);
}

/* Variações */
.card-primary {
  border-left: 4px solid var(--color-primary);
  background-color: var(--color-primary-lighter);
}

.card-success {
  border-left: 4px solid var(--color-success);
  background-color: var(--color-success-light);
}

.card-error {
  border-left: 4px solid var(--color-error);
  background-color: var(--color-error-light);
}

/* ========== MODAL ========== */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-overlay);
  z-index: var(--z-modal-backdrop);
  align-items: center;
  justify-content: center;
}

.modal.show {
  display: flex;
  animation: fadeIn var(--transition-normal);
}

.modal-dialog {
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: var(--z-modal);
  animation: slideUp var(--transition-normal);
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

/* ========== TABELAS ========== */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.table thead {
  background-color: var(--bg-secondary);
  border-bottom: 2px solid var(--border-color);
}

.table th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.table td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.table tbody tr:hover {
  background-color: var(--bg-secondary);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* Responsivo */
@media (max-width: 768px) {
  .modal-dialog {
    max-width: 90%;
  }
}

/* ========== BADGES ========== */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

/* ========== ALERTAS ========== */
.alert {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.alert-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
  border: 1px solid var(--color-success);
}

.alert-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  border: 1px solid var(--color-error);
}

.alert-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
  border: 1px solid var(--color-warning);
}

.alert-info {
  background-color: var(--color-info-light);
  color: var(--color-info-dark);
  border: 1px solid var(--color-info);
}

.alert i {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

/* ========== SPINNERS ========== */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.spinner-sm {
  width: 0.75rem;
  height: 0.75rem;
}

.spinner-lg {
  width: 1.5rem;
  height: 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

# 5. PADRÃO PRINCIPAL (APP LAYOUT)

## 5.1 Arquivo: `css/app-layout.css`

```css
/*
 * LAYOUT PRINCIPAL - Sidebar + Header + Main
 * ===========================================
 */

/* ========== ESTRUTURA BASE ========== */
.app-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

/* ========== SIDEBAR ========== */
.sidebar {
  width: 280px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  transition: transform var(--transition-normal);
  z-index: var(--z-fixed);
  flex-shrink: 0;
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar.mobile-open {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: var(--z-modal-backdrop);
  box-shadow: var(--shadow-lg);
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: 0;
}

.sidebar-logo i {
  font-size: var(--font-size-2xl);
}

.sidebar.collapsed .sidebar-logo span {
  display: none;
}

.sidebar-nav {
  padding: var(--spacing-md) 0;
}

.nav-group {
  padding: var(--spacing-md) 0;
}

.nav-group-title {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  position: relative;
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-link.active {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.nav-link i {
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.nav-link span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.collapsed .nav-link span {
  display: none;
}

.sidebar.collapsed .nav-link {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  justify-content: center;
}

/* ========== HEADER ========== */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-md) var(--spacing-lg);
  height: 64px;
  flex-shrink: 0;
  gap: var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.toggle-sidebar {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-search {
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: var(--font-size-sm);
  background-color: var(--bg-secondary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.notification-badge {
  position: relative;
}

.notification-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--color-error);
  color: var(--text-inverse);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}

/* ========== MAIN CONTENT ========== */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  margin-bottom: var(--spacing-sm);
}

.page-header p {
  color: var(--text-secondary);
}

/* ========== RESPONSIVIDADE ========== */
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }
  
  .sidebar-logo span,
  .nav-link span {
    display: none;
  }
  
  .nav-link {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100vh;
    background-color: var(--bg-primary);
    border-right: 1px solid var(--border-color);
  }
  
  .sidebar.mobile-open {
    left: 0;
    z-index: var(--z-modal-backdrop);
  }
  
  .sidebar-logo span,
  .nav-link span {
    display: block;
  }
  
  .nav-link {
    justify-content: flex-start;
  }
  
  .header-search {
    max-width: none;
  }
  
  .header-search.hidden-mobile {
    display: none;
  }
}
```

---

# 6. ACESSIBILIDADE & ANIMAÇÕES

## 6.1 Arquivo: `css/accessibility-animations.css`

```css
/*
 * ACESSIBILIDADE E ANIMAÇÕES
 * ==========================
 */

/* ========== FOCO VISÍVEL ========== */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ========== SKIP TO CONTENT ========== */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background-color: var(--color-primary);
  color: var(--text-inverse);
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  z-index: var(--z-tooltip);
}

.skip-link:focus {
  top: 0;
}

/* ========== REDUÇÃO DE MOVIMENTO ========== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ========== ANIMAÇÕES ========== */

/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn var(--transition-normal);
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp var(--transition-normal);
}

/* Slide Down */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slideDown var(--transition-normal);
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn var(--transition-normal);
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* ========== TRANSIÇÕES DE ESTADO ========== */

/* Loading State */
.is-loading {
  position: relative;
  pointer-events: none;
  opacity: 0.6;
}

.is-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Success State */
.is-success {
  background-color: var(--color-success-light) !important;
  border-color: var(--color-success) !important;
  color: var(--color-success-dark) !important;
}

/* Error State */
.is-error {
  background-color: var(--color-error-light) !important;
  border-color: var(--color-error) !important;
  color: var(--color-error-dark) !important;
}

/* Warning State */
.is-warning {
  background-color: var(--color-warning-light) !important;
  border-color: var(--color-warning) !important;
  color: var(--color-warning-dark) !important;
}

/* ========== HOVER & FOCUS ESTADOS ========== */

/* Raised effect (card hover) */
.raised-on-hover {
  transition: all var(--transition-normal);
  cursor: pointer;
}

.raised-on-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Soft highlight */
.highlight-on-hover {
  transition: background-color var(--transition-fast);
}

.highlight-on-hover:hover {
  background-color: var(--bg-secondary);
}

/* ========== TOASTS & NOTIFICAÇÕES ========== */
.toast {
  position: fixed;
  bottom: var(--spacing-lg);
  right: var(--spacing-lg);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-notification);
  max-width: 400px;
  animation: slideUp var(--transition-normal);
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-error {
  border-left: 4px solid var(--color-error);
}

.toast-warning {
  border-left: 4px solid var(--color-warning);
}

.toast-info {
  border-left: 4px solid var(--color-info);
}

/* ========== DROPDOWNS ========== */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  min-width: 200px;
  padding: var(--spacing-sm) 0;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
  margin-top: var(--spacing-xs);
}

.dropdown.show .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
}

.dropdown-item.active {
  background-color: var(--color-primary-lighter);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  margin: var(--spacing-xs) 0;
}

/* ========== TABS ========== */
.tabs {
  display: flex;
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.tab {
  padding: var(--spacing-md) 0;
  border: none;
  background: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  position: relative;
  transition: color var(--transition-fast);
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--color-primary);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-primary);
}

.tab-content {
  display: none;
  animation: fadeIn var(--transition-normal);
}

.tab-content.active {
  display: block;
}

/* ========== PROGRESS BAR ========== */
.progress {
  width: 100%;
  height: 4px;
  background-color: var(--bg-secondary);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary);
  transition: width var(--transition-normal);
  border-radius: 999px;
}

.progress-bar.success {
  background-color: var(--color-success);
}

.progress-bar.warning {
  background-color: var(--color-warning);
}

.progress-bar.error {
  background-color: var(--color-error);
}

/* ========== SKELETON LOADING ========== */
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

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-text {
  height: 1rem;
  margin-bottom: var(--spacing-sm);
  border-radius: var(--border-radius);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-card {
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
}
```

---

## 6.2 Arquivo: `js/app.js` (JavaScript Vanilla)

```javascript
/*
 * JURISCONNECT - JavaScript Principal
 * ===================================
 */

// ========== TOGGLES ========== //
class AppUI {
  constructor() {
    this.sidebar = document.querySelector('.sidebar');
    this.toggleBtn = document.querySelector('.toggle-sidebar');
    this.modalBackdrop = document.querySelector('[data-backdrop]');
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Toggle sidebar
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }

    // Mobile menu close on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMobileSidebar());
    });

    // Modal handling
    this.setupModals();
    
    // Dropdowns
    this.setupDropdowns();
    
    // Tabs
    this.setupTabs();
  }

  toggleSidebar() {
    this.sidebar?.classList.toggle('collapsed');
    localStorage.setItem('sidebar-collapsed', 
      this.sidebar?.classList.contains('collapsed'));
  }

  closeMobileSidebar() {
    if (window.innerWidth < 768) {
      this.sidebar?.classList.remove('mobile-open');
    }
  }

  setupModals() {
    // Modal open
    document.querySelectorAll('[data-toggle="modal"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('data-target');
        const modal = document.querySelector(targetId);
        this.openModal(modal);
      });
    });

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = btn.closest('.modal');
        this.closeModal(modal);
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });
    });
  }

  openModal(modal) {
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  setupDropdowns() {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      const toggle = dropdown.querySelector('[data-toggle="dropdown"]');
      if (toggle) {
        toggle.addEventListener('click', () => {
          dropdown.classList.toggle('show');
        });
      }
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.dropdown.show').forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      });
    });
  }

  setupTabs() {
    document.querySelectorAll('.tabs').forEach(tabsContainer => {
      const tabs = tabsContainer.querySelectorAll('.tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetId = tab.getAttribute('data-target');
          const tabContent = document.querySelector(targetId);
          
          // Remove active from all tabs/content
          tabsContainer.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
          });
          tabsContainer.closest('.tab-wrapper')
            ?.querySelectorAll('.tab-content')
            .forEach(content => {
              content.classList.remove('active');
            });

          // Add active to clicked tab/content
          tab.classList.add('active');
          if (tabContent) {
            tabContent.classList.add('active');
          }
        });
      });
    });
  }

  // Toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-up`;
    toast.innerHTML = `
      <div style="display: flex; gap: var(--spacing-md); align-items: center;">
        <i class="fas fa-${this.getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  getToastIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'warning',
      info: 'info-circle'
    };
    return icons[type] || icons.info;
  }
}

// ========== INICIALIZAÇÃO ========== //
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppUI();
  app.init();
  
  // Restore sidebar state
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    document.querySelector('.sidebar')?.classList.add('collapsed');
  }
});
```

---

## 6.3 Arquivo: `index.html` (Exemplo Completo)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JurisConnect - Dashboard</title>
  
  <!-- CSS -->
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/typography.css">
  <link rel="stylesheet" href="css/grid.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/app-layout.css">
  <link rel="stylesheet" href="css/accessibility-animations.css">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Pular para conteúdo principal</a>

  <div class="app-wrapper">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-gavel"></i>
          <span>JurisConnect</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- Dashboard -->
        <div class="nav-group">
          <div class="nav-item">
            <a href="#" class="nav-link active">
              <i class="fas fa-chart-line"></i>
              <span>Dashboard</span>
            </a>
          </div>
        </div>

        <!-- Operações -->
        <div class="nav-group">
          <div class="nav-group-title">Operações</div>
          <div class="nav-item">
            <a href="#" class="nav-link">
              <i class="fas fa-briefcase"></i>
              <span>Demandas</span>
            </a>
          </div>
          <div class="nav-item">
            <a href="#" class="nav-link">
              <i class="fas fa-users"></i>
              <span>Clientes</span>
            </a>
          </div>
          <div class="nav-item">
            <a href="#" class="nav-link">
              <i class="fas fa-link"></i>
              <span>Correspondentes</span>
            </a>
          </div>
        </div>

        <!-- Financeiro -->
        <div class="nav-group">
          <div class="nav-group-title">Financeiro</div>
          <div class="nav-item">
            <a href="#" class="nav-link">
              <i class="fas fa-file-invoice-dollar"></i>
              <span>Faturas</span>
            </a>
          </div>
          <div class="nav-item">
            <a href="#" class="nav-link">
              <i class="fas fa-credit-card"></i>
              <span>Pagamentos</span>
            </a>
          </div>
        </div>

        <!-- Relatórios -->
        <div class="nav-group">
          <div class="nav-group-title">Relatórios</div>
          <div class="nav-item">
            <a href="#" class="nav-link">
              <i class="fas fa-chart-bar"></i>
              <span>Análise</span>
            </a>
          </div>
        </div>
      </nav>
    </aside>

    <!-- MAIN CONTAINER -->
    <div class="main-container">
      <!-- HEADER -->
      <header class="header">
        <div class="header-left">
          <button class="toggle-sidebar" aria-label="Toggle sidebar">
            <i class="fas fa-bars"></i>
          </button>
          <div class="header-search hidden-mobile">
            <input 
              type="text" 
              class="search-input" 
              placeholder="Buscar demandas, clientes..."
              aria-label="Buscar"
            >
          </div>
        </div>

        <div class="header-right">
          <div class="header-actions">
            <!-- Notificações -->
            <button class="btn btn-icon-only" aria-label="Notificações">
              <i class="fas fa-bell"></i>
              <span class="notification-count">3</span>
            </button>

            <!-- Usuário -->
            <div class="dropdown">
              <button class="user-profile" data-toggle="dropdown">
                <div class="user-avatar">JD</div>
                <span class="hidden-mobile">João Dias</span>
              </button>
              <ul class="dropdown-menu">
                <li><a href="#" class="dropdown-item">Perfil</a></li>
                <li><a href="#" class="dropdown-item">Configurações</a></li>
                <li class="dropdown-divider"></li>
                <li><a href="#" class="dropdown-item">Sair</a></li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <!-- MAIN CONTENT -->
      <main class="main-content" id="main-content">
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Bem-vindo ao JurisConnect</p>
        </div>

        <!-- CARDS RESUMO -->
        <div class="grid grid-cols-4">
          <div class="card">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm text-secondary">Demandas Ativas</p>
                <h3 class="mt-sm">28</h3>
              </div>
              <i class="fas fa-briefcase text-lg text-primary"></i>
            </div>
          </div>

          <div class="card">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm text-secondary">Receita Mensal</p>
                <h3 class="mt-sm">R$ 125.500</h3>
              </div>
              <i class="fas fa-chart-line text-lg text-success"></i>
            </div>
          </div>

          <div class="card">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm text-secondary">Clientes</p>
                <h3 class="mt-sm">42</h3>
              </div>
              <i class="fas fa-users text-lg text-info"></i>
            </div>
          </div>

          <div class="card">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm text-secondary">Taxa Cobrança</p>
                <h3 class="mt-sm">75%</h3>
              </div>
              <i class="fas fa-percent text-lg text-warning"></i>
            </div>
          </div>
        </div>

        <!-- TABELA -->
        <div class="card mt-lg">
          <div class="card-header">
            <h2>Demandas Recentes</h2>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Protocolo</th>
                  <th>Cliente</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>DEM-2025-001</td>
                  <td>Escritório XYZ</td>
                  <td>Civil</td>
                  <td><span class="badge badge-success">Ativa</span></td>
                  <td>02/Nov/2025</td>
                </tr>
                <tr>
                  <td>DEM-2025-002</td>
                  <td>Empresa ABC</td>
                  <td>Trabalhista</td>
                  <td><span class="badge">Em progresso</span></td>
                  <td>01/Nov/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- MODAL EXEMPLO -->
  <div class="modal" id="exampleModal">
    <div class="modal-dialog">
      <div class="modal-header">
        <h2>Nova Demanda</h2>
        <button class="modal-close" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal-body">
        <form>
          <div class="form-group">
            <label for="cliente">Cliente</label>
            <input type="text" id="cliente" class="form-control" placeholder="Selecione...">
          </div>
          <div class="form-group">
            <label for="especialidade">Especialidade</label>
            <select id="especialidade" class="form-control">
              <option>Civil</option>
              <option>Penal</option>
              <option>Trabalhista</option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary modal-close">Cancelar</button>
        <button class="btn btn-primary">Criar</button>
      </div>
    </div>
  </div>

  <!-- JavaScript -->
  <script src="js/app.js"></script>
</body>
</html>
```

---

**Design System JurisConnect Completo** ✅