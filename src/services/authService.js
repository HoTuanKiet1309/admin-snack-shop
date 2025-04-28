import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', { ...credentials, source: 'admin' }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
  getCurrentUser: () => api.get('/auth/me'),
  register: (userData) => api.post('/auth/register', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};