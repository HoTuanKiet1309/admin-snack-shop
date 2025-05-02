import api from './api';

export const orderService = {
  getAllOrders: () => api.get('/orders/all'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  getOrdersByUser: (userId) => api.get(`/orders/user/${userId}`),
  getOrderStatistics: () => api.get('/orders/statistics'),
  getCompletedOrdersStatistics: () => api.get('/orders/statistics/completed'),
  exportOrders: () => api.get('/orders/export', { 
    responseType: 'blob'
  })
}; 