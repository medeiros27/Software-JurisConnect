import api from './api';

export const login = async (email, senha) => {
  const response = await api.post('/auth/login', { email, senha });
  return response.data.data;
};

export const verifyToken = async (token) => {
  const response = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  return response.data.data.token;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

