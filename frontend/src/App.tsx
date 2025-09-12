import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import WishlistPage from './pages/WishlistPage'
import ProductsPage from './pages/ProductsPage'
import DealsPage from './pages/DealsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminAddProduct from './pages/admin/AdminAddProduct'
import AdminOrders from './pages/admin/AdminOrders'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSlides from './pages/admin/AdminSlides'
import NotFoundPage from './pages/NotFoundPage'

import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'
import ScrollToTop from './components/layout/ScrollToTop'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import AddressesPage from './pages/AddressesPage'
import RegistryPage from './pages/RegistryPage'
import CustomerServicePage from './pages/CustomerServicePage'
import GiftCardsPage from './pages/GiftCardsPage'
import SellPage from './pages/SellPage'
import Chatbot from './components/ui/Chatbot'

export default function App(): React.ReactElement {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App min-h-screen bg-gray-50">
          <Helmet>
            <title>NexaCart - Shop Online</title>
            <meta
              name="description"
              content="NexaCart - Your one-stop shop for everything. Free shipping on millions of items. Get the best of Shopping and Entertainment with Prime."
            />
            <meta name="keywords" content="nexacart, shopping, ecommerce, online store, products, deals" />
          </Helmet>

          <Navbar />

          <main className="min-h-screen">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/registry" element={<RegistryPage />} />
              <Route path="/customer-service" element={<CustomerServicePage />} />
              <Route path="/gift-cards" element={<GiftCardsPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/settings"
                element={
                  <ProtectedRoute>
                    <ProfileSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/payment-methods"
                element={
                  <ProtectedRoute>
                    <PaymentMethodsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/addresses"
                element={
                  <ProtectedRoute>
                    <AddressesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <AdminRoute>
                    <AdminAddProduct />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/slides"
                element={
                  <AdminRoute>
                    <AdminSlides />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />

          <Chatbot />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}


