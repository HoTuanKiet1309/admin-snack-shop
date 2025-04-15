import api from './api';

export const orderService = {
  getAllOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  getOrdersByUser: (userId) => api.get(`/order/user/${userId}`),
  getOrderStatistics: (params) => api.get('/order/statistics', { params }),
  exportOrders: (params) => api.get('/order/export', { 
    params,
    responseType: 'blob'
  })
}; 