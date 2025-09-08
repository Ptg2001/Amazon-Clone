import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  shippingAddress: null,
  paymentMethod: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, variant } = action.payload;
      const existingItem = state.items.find(
        item => 
          item.product._id === product._id && 
          JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          variant: variant || null,
          price: product.price,
        });
      }

      // Update totals
      cartSlice.caseReducers.calculateTotals(state);
      
      // No localStorage persistence; synced via backend
    },

    removeFromCart: (state, action) => {
      const { productId, variant } = action.payload;
      state.items = state.items.filter(
        item => 
          !(item.product._id === productId && 
            JSON.stringify(item.variant) === JSON.stringify(variant))
      );

      // Update totals
      cartSlice.caseReducers.calculateTotals(state);
      
      // No localStorage persistence; synced via backend
    },

    updateCartItemQuantity: (state, action) => {
      const { productId, quantity, variant } = action.payload;
      const item = state.items.find(
        item => 
          item.product._id === productId && 
          JSON.stringify(item.variant) === JSON.stringify(variant)
      );

      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(
            cartItem => 
              !(cartItem.product._id === productId && 
                JSON.stringify(cartItem.variant) === JSON.stringify(variant))
          );
        } else {
          item.quantity = quantity;
        }
      }

      // Update totals
      cartSlice.caseReducers.calculateTotals(state);
      
      // No localStorage persistence; synced via backend
    },

    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      // No localStorage persistence; synced via backend
    },

    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = state.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
    },

    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      // Persist server-side during checkout
    },

    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      // Persist server-side during checkout
    },

    setCartFromServer: (state, action) => {
      const { items } = action.payload || { items: [] };
      state.items = items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        variant: i.variant || null,
        price: i.price,
      }));
      cartSlice.caseReducers.calculateTotals(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  calculateTotals,
  setShippingAddress,
  setPaymentMethod,
  setCartFromServer,
} = cartSlice.actions;

export default cartSlice.reducer;
