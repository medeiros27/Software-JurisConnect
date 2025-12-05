// SPA Router
import { authService } from './auth.js';
import { renderLogin, renderDashboard, loadDashboardData } from './ui.js';
import { $, showLoading, hideLoading } from './utils.js';

class Router {
  constructor() {
    this.routes = {
      login: { render: renderLogin, requiresAuth: false },
      dashboard: { render: renderDashboard, requiresAuth: true },
      clientes: { render: () => '<div>Clientes (em desenvolvimento)</div>', requiresAuth: true },
      correspondentes: { render: () => '<div>Correspondentes (em desenvolvimento)</div>', requiresAuth: true },
      demandas: { render: () => '<div>Demandas (em desenvolvimento)</div>', requiresAuth: true },
      agenda: { render: () => '<div>Agenda (em desenvolvimento)</div>', requiresAuth: true },
      financeiro: { render: () => '<div>Financeiro (em desenvolvimento)</div>', requiresAuth: true }
    };
    
    this.currentRoute = null;
  }

  init() {
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.navigate(window.location.hash.slice(1) || 'login', false);
    });

    // Initial route
    const initialRoute = authService.isAuth() ? 'dashboard' : 'login';
    this.navigate(initialRoute, true);
  }

  async navigate(routeName, pushState = true) {
    const route = this.routes[routeName];
    
    if (!route) {
      console.error('Route not found:', routeName);
      return;
    }

    // Check authentication
    if (route.requiresAuth && !authService.isAuth()) {
      this.navigate('login', true);
      return;
    }

    // Redirect to dashboard if already authenticated and trying to access login
    if (routeName === 'login' && authService.isAuth()) {
      this.navigate('dashboard', true);
      return;
    }

    // Show loading
    showLoading();

    // Update URL
    if (pushState) {
      window.history.pushState(null, '', `#${routeName}`);
    }

    // Render route
    await this.renderRoute(routeName, route);

    // Hide loading
    setTimeout(() => hideLoading(), 300);

    this.currentRoute = routeName;
  }

  async renderRoute(routeName, route) {
    const app = $('#app');
    if (!app) return;

    // Render HTML
    app.innerHTML = route.render();

    // Setup route-specific logic
    if (routeName === 'login') {
      this.setupLoginHandlers();
    } else if (routeName === 'dashboard') {
      await this.setupDashboardHandlers();
    }
  }

  setupLoginHandlers() {
    const form = $('#login-form');
    const emailInput = $('#email');
    const passwordInput = $('#password');
    const togglePassword = $('#toggle-password');
    const loginBtn = $('#login-btn');

    // Toggle password visibility
    if (togglePassword) {
      togglePassword.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
      });
    }

    // Real-time email validation
    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const email = emailInput.value;
        const errorEl = $('#email-error');
        
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailInput.classList.add('error');
          emailInput.classList.remove('success');
          if (errorEl) errorEl.textContent = 'Email inválido';
        } else if (email) {
          emailInput.classList.remove('error');
          emailInput.classList.add('success');
          if (errorEl) errorEl.textContent = '';
        }
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Clear previous errors
        const emailError = $('#email-error');
        const passwordError = $('#password-error');
        if (emailError) emailError.textContent = '';
        if (passwordError) passwordError.textContent = '';

        // Validate
        let hasErrors = false;
        if (!email) {
          if (emailError) emailError.textContent = 'Email é obrigatório';
          hasErrors = true;
        }
        if (!password) {
          if (passwordError) passwordError.textContent = 'Senha é obrigatória';
          hasErrors = true;
        }

        if (hasErrors) return;

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
        loginBtn.innerHTML = '<span>Entrando...</span> <span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>';

        try {
          await authService.login(email, password);
          this.navigate('dashboard', true);
        } catch (error) {
          if (passwordError) passwordError.textContent = error.message;
        } finally {
          loginBtn.disabled = false;
          loginBtn.classList.remove('loading');
          loginBtn.innerHTML = '<span>Entrar</span>';
        }
      });
    }

    // Forgot password link
    const forgotLink = $('#forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Funcionalidade de recuperação de senha em desenvolvimento');
      });
    }
  }

  async setupDashboardHandlers() {
    // Load dashboard data
    await loadDashboardData();

    // Setup navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        if (route) {
          // Update active state
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          this.navigate(route, true);
        }
      });
    });

    // Setup profile menu
    const profileMenu = $('#profile-menu');
    if (profileMenu) {
      profileMenu.addEventListener('click', () => {
        const confirmed = confirm('Deseja sair do sistema?');
        if (confirmed) {
          authService.logout();
          this.navigate('login', true);
        }
      });
    }
  }
}

export const router = new Router();