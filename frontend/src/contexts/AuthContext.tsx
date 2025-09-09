import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from '../store/slices/authSlice';
import { loadWishlist } from '../store/slices/wishlistSlice';

type AuthContextValue = {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user]);

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(loadWishlist());
    }
  }, [dispatch, isAuthenticated, user]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
