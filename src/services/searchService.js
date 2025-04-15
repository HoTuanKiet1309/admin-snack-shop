import api from './api';

export const searchService = {
  // Tìm kiếm tổng hợp
  search: (query, type) => api.get('/search', { params: { query, type } }),
  
  // Gợi ý tìm kiếm
  getSuggestions: (query) => api.get('/search/suggestions', { params: { query } })
}; 