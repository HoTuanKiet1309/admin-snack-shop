import api from './api';

export const orderService = {
  getAllOrders: (params) => api.get('/orders/all', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  getOrdersByUser: (userId) => api.get(`/orders/user/${userId}`),
  getOrderStatistics: () => api.get('/orders/statistics'),
  getCompletedOrdersStatistics: (params) => api.get('/orders/statistics/completed', { params }),
  sendOrderEmail: (id) => api.post(`/orders/${id}/send-email`),
  exportOrders: () => api.get('/orders/export', { 
    responseType: 'blob'
  })
}; 