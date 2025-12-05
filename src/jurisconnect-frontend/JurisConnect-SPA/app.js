// Main application entry point
import { router } from './router.js';
import { showToast } from './utils.js';

// Application initialization
class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    console.log('🚀 JurisConnect iniciado');

    // Initialize router
    router.init();

    // Setup global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      showToast('Ocorreu um erro inesperado', 'error');
    });

    // Setup unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled rejection:', e.reason);
      showToast('Ocorreu um erro inesperado', 'error');
    });

    // Add keyboard navigation support
    this.setupKeyboardNavigation();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // ESC key - close modals, clear search, etc.
      if (e.key === 'Escape') {
        // Handle ESC key actions
      }

      // Ctrl/Cmd + K - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.header-search input');
        if (searchInput) searchInput.focus();
      }
    });
  }
}

// Start the application
const app = new App();

// Export for debugging
window.JurisConnect = app;