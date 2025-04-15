import api from './api';

export const dashboardService = {
  // Thống kê tổng quan
  getOverviewStats: () => api.get('/dashboard/stats'),
  
  // Thống kê doanh thu
  getRevenueStats: (params) => api.get('/dashboard/revenue', { params }),
  
  // Thống kê đơn hàng
  getOrderStats: (params) => api.get('/dashboard/orders', { params }),
  
  // Thống kê sản phẩm
  getProductStats: () => api.get('/dashboard/products'),
  
  // Thống kê người dùng
  getUserStats: () => api.get('/dashboard/users'),
  
  // Top sản phẩm bán chạy
  getTopProducts: () => api.get('/snack/top-selling'),
  
  // Xuất báo cáo
  exportReport: (type, params) => api.get(`/dashboard/export/${type}`, {
    params,
    responseType: 'blob'
  }),
  
  // Lấy đơn hàng gần đây
  getRecentOrders: () => api.get('/order/recent'),
  
  // Lấy sản phẩm sắp hết hàng
  getLowStockProducts: () => api.get('/snack/low-stock'),
}; 