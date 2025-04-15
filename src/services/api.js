import axios from 'axios';
import { message } from 'antd';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          message.error('Phiên đăng nhập đã hết hạn');
          break;
        case 403:
          message.error('Bạn không có quyền thực hiện thao tác này');
          break;
        case 404:
          message.error('Không tìm thấy tài nguyên yêu cầu');
          break;
        case 500:
          message.error('Lỗi server, vui lòng thử lại sau');
          break;
        default:
          message.error(error.response.data.message || 'Có lỗi xảy ra');
      }
    } else if (error.request) {
      message.error('Không thể kết nối đến server');
    } else {
      message.error('Có lỗi xảy ra');
    }
    return Promise.reject(error);
  }
);

export default api;