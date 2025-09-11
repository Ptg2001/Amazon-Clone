import api from './api';

const adminAPI = {
  // Dashboard
  getDashboardStats: (params) => api.get('/admin/dashboard', { params }),

  // Orders
  getAdminOrders: (params) => api.get('/admin/orders', { params }),
  deleteAdminOrder: (orderId) => api.delete(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId, payload) => api.put(`/orders/${orderId}/status`, payload),

  // Products
  getAdminProducts: (params) => api.get('/admin/products', { params }),

  // Users
  getAdminUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, roleData) => api.put(`/admin/users/${id}/role`, roleData),
  updateUser: (id, payload) => api.put(`/admin/users/${id}`, payload),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default adminAPI;
