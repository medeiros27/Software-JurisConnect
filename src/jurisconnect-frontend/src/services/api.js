import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Determine Base URL dynamically
// Web: Use relative path (forces proxy via Cloudflare or Vite)
// Native: Use absolute path (Capacitor doesn't use the tunnel proxy logic directly)
const getBaseUrl = () => {
  // Check for Capacitor native platform
  if (Capacitor.isNativePlatform()) {
    return 'https://app.jurisconnect.com.br/api/v1';
  }

  // Fallback detection logic:
  // Capacitor on Android typically runs on http://localhost (no port)
  // Vite Dev server runs on http://localhost:5173 (with port)
  if (window.location.hostname === 'localhost' && !window.location.port) {
    return 'https://app.jurisconnect.com.br/api/v1';
  }

  return import.meta.env.VITE_API_URL;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  // Break circular dependency by using localStorage directly
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  async error => {
    // Tratamento simplificado de 401 para evitar dependência circular
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Extrair mensagem de erro da resposta
    const message = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'Erro ao processar requisição';

    return Promise.reject({
      ...error,
      message
    });
  }
);

// Helper para extrair mensagem de erro
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  return error?.message || error?.response?.data?.message || 'Erro desconhecido';
};

export default api;

