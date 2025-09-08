import api from './api';

const orderAPI = {
  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}/status`, statusData),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  requestReturn: (id, returnData) => api.post(`/orders/${id}/return`, returnData),

  // Payments (Razorpay-compatible endpoints)
  createPaymentIntent: (paymentData) => api.post('/payments/create-payment-intent', paymentData),
  confirmPayment: (paymentData) => api.post('/payments/confirm-payment', paymentData),
  createRefund: (refundData) => api.post('/payments/create-refund', refundData),
  getPaymentMethods: () => api.get('/payments/methods'),
  addPaymentMethod: (methodData) => api.post('/payments/methods', methodData),
  deletePaymentMethod: (methodId) => api.delete(`/payments/methods/${methodId}`),
};

export default orderAPI;
