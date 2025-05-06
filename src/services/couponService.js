import api from './api';

export const couponService = {
  getAllCoupons: () => api.get('/coupons'),
  getCouponById: (id) => api.get(`/coupons/${id}`),
  createCoupon: (data) => api.post('/coupons', {
    code: data.code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minPurchase: data.minPurchase || 0,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive !== undefined ? data.isActive : true,
    description: data.description || ''
  }),
  updateCoupon: (id, data) => api.put(`/coupons/${id}`, {
    code: data.code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    minPurchase: data.minPurchase,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive,
    description: data.description
  }),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  validateCoupon: (code) => api.post('/coupons/validate', { code })
}; 