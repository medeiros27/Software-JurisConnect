// Authentication module
import { loginAPI } from './api.js';
import { validateEmail, validatePassword } from './validators.js';
import { showToast } from './utils.js';

class AuthService {
  constructor() {
    // Use in-memory storage instead of localStorage due to sandbox restrictions
    this.currentUser = null;
    this.token = null;
    this.isAuthenticated = false;
  }

  async login(email, password) {
    try {
      // Validate inputs
      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }

      if (!password || password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }

      // Call API
      const response = await loginAPI(email, password);

      // Store user data in memory
      this.currentUser = response.user;
      this.token = response.token;
      this.isAuthenticated = true;

      showToast('Login realizado com sucesso!', 'success');
      return { success: true, user: response.user };
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    this.isAuthenticated = false;
    showToast('Logout realizado com sucesso', 'info');
  }

  getUser() {
    return this.currentUser;
  }

  isAuth() {
    return this.isAuthenticated;
  }

  getToken() {
    return this.token;
  }
}

// Export singleton instance
export const authService = new AuthService();