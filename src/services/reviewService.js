import api from './api';

export const reviewService = {
  // Lấy tất cả đánh giá
  getAllReviews: (params) => api.get('/review', { params }),
  
  // Lấy đánh giá theo sản phẩm
  getReviewsByProduct: (productId) => api.get(`/review/product/${productId}`),
  
  // Lấy đánh giá theo user
  getReviewsByUser: (userId) => api.get(`/review/user/${userId}`),
  
  // Xóa đánh giá
  deleteReview: (id) => api.delete(`/review/${id}`),
  
  // Phê duyệt/từ chối đánh giá
  updateReviewStatus: (id, status) => api.put(`/review/${id}/status`, { status })
}; 