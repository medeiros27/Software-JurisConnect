import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: !!localStorage.getItem('token'),
  error: null,

  // Login Local
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, senha: password });

      const { token, refreshToken, usuario } = response.data.data;

      // Salvar token
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Configurar header padrão para próximas requisições
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({ token, user: usuario, isLoading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Erro ao fazer login';
      set({ error: message, isLoading: false, token: null, user: null });
      return false;
    }
  },

  // Logout Local
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      delete api.defaults.headers.common['Authorization'];
      set({ user: null, token: null });
    }
  },

  // Refresh Token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      const { token } = response.data.data;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token });

      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  },

  // Init Auth (Check token)
  initAuth: async () => {
    const token = localStorage.getItem('token');

    if (token) {
      set({ isLoading: true, token });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const response = await api.get('/auth/me');
        const user = response.data.data;
        set({ user, isLoading: false });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Se falhar, limpar tudo
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isLoading: false });
      }
    } else {
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
