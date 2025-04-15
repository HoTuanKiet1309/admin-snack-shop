import api from './api';

export const userService = {
  getAllUsers: () => api.get('/admin/users', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  getUserById: (id) => api.get(`/admin/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  createUser: (userData) => api.post('/user', userData),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    role: data.role
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  resetPassword: (id) => api.post(`/admin/users/${id}/reset-password`, {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
  searchUsers: (query) => api.get(`/user/search`, { params: { query } })
}; 