import api from './api';

export const categoryService = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'image') {
        formData.append('image', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });
    return api.post('/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateCategory: (id, categoryData) => {
    const formData = new FormData();
    Object.keys(categoryData).forEach(key => {
      if (key === 'image') {
        formData.append('image', categoryData[key]);
      } else {
        formData.append(key, categoryData[key]);
      }
    });
    return api.put(`/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteCategory: (id) => api.delete(`/categories/${id}`)
}; 