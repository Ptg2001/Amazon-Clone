import api from './api';

const authAPI = {
  // User authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),

  // User management
  getUserProfile: () => api.get('/users/profile'),
  updateUserProfile: (userData) => api.put('/users/profile', userData),
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  
  // Wishlist
  addToWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
  getWishlist: () => api.get('/users/wishlist'),
  
  // User orders
  getUserOrders: (params) => api.get('/users/orders', { params }),
  getUserStats: () => api.get('/users/stats'),

  // Payment methods
  getPaymentMethods: () => api.get('/users/payment-methods'),
  addPaymentMethod: (data) => api.post('/users/payment-methods', data),
  updatePaymentMethod: (id, data) => api.put(`/users/payment-methods/${id}`, data),
  deletePaymentMethod: (id) => api.delete(`/users/payment-methods/${id}`),
};

export default authAPI;
