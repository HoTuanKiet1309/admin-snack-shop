import api from './api';

export const productService = {
  getAllProducts: () => api.get('/snacks'),
  getProductsByCategory: (categoryId) => api.get(`/snacks/category/${categoryId}`),
  getProductById: (id) => api.get(`/snacks/${id}`),
  createProduct: (data) => api.post('/snacks', {
    snackName: data.snackName,
    description: data.description,
    price: data.price,
    stock: data.stock,
    categoryId: data.categoryId,
    discount: data.discount || 0,
    images: Array.isArray(data.images) ? data.images : [data.images]
  }),
  updateProduct: (id, data) => api.put(`/snacks/${id}`, {
    snackName: data.snackName,
    description: data.description,
    price: data.price,
    stock: data.stock,
    categoryId: data.categoryId,
    discount: data.discount || 0,
    images: Array.isArray(data.images) ? data.images : [data.images]
  }),
  deleteProduct: (id) => api.delete(`/snacks/${id}`),
  searchProducts: (query) => api.get(`/snack/search`, { params: { query } }),
}; 