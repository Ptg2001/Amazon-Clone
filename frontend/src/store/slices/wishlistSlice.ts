import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartAPI from '../../services/cartAPI';

interface Product {
  _id: string;
  title: string;
  price: number;
  images: Array<{ url: string }>;
  ratings: { average: number; count: number };
  brand?: string;
  category?: any;
}

interface WishlistState {
  wishlist: Product[];
  isLoading: boolean;
  error: string | null;
}

// Async thunk to load wishlist from backend
export const loadWishlist = createAsyncThunk(
  'wishlist/loadWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartAPI.getWishlist();
      return response.data.data.wishlist;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load wishlist');
    }
  }
);

const initialState: WishlistState = {
  wishlist: [],
  isLoading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const product: Product = action.payload;
      const existingItem = state.wishlist.find(item => item._id === product._id);
      
      if (!existingItem) {
        state.wishlist.push(product);
      }
    },
    removeFromWishlist: (state, action) => {
      const productId: string = action.payload;
      state.wishlist = state.wishlist.filter(item => item._id !== productId);
    },
    clearWishlist: (state) => {
      state.wishlist = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist = action.payload;
        state.error = null;
      })
      .addCase(loadWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
