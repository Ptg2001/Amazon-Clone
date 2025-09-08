import api from './api';

const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (productId: string, quantity: number, variant?: any) =>
    api.post('/cart/items', { product: productId, quantity, variant }),
  updateItem: (productId: string, quantity: number, variant?: any) =>
    api.put(`/cart/items/${productId}`, { quantity, variant }),
  removeItem: (productId: string, variant?: any) =>
    api.delete(`/cart/items/${productId}`, { params: { variant: variant ? JSON.stringify(variant) : undefined } }),
  clear: () => api.delete('/cart'),
};

export default cartAPI;


