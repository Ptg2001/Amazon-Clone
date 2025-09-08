import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { setCartFromServer } from '../store/slices/cartSlice';
import cartAPI from '../services/cartAPI';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const dispatch = useDispatch();
  const { items, totalItems, totalAmount } = useCart();

  const handleQuantityChange = async (productId, variant, newQuantity) => {
    await cartAPI.updateItem(productId, Math.max(0, newQuantity), variant);
    const res = await cartAPI.getCart();
    dispatch(setCartFromServer(res?.data?.data?.cart));
  };

  const handleRemoveItem = async (productId, variant) => {
    await cartAPI.removeItem(productId, variant);
    const res = await cartAPI.getCart();
    dispatch(setCartFromServer(res?.data?.data?.cart));
  };

  const handleClearCart = async () => {
    await cartAPI.clear();
    const res = await cartAPI.getCart();
    dispatch(setCartFromServer(res?.data?.data?.cart));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>{'Shopping Cart - Amazon Clone'}</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <FiShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-8">Add some items to get started</p>
              <Link
                to="/"
                className="bg-amazon-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${String(totalItems)} items) - Amazon Clone`}</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({totalItems})</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div key={`${item.product._id}-${index}`} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                        {/* Product Image */}
                        <div className="w-20 h-20 flex-shrink-0">
                          <LazyLoadImage
                            src={item.product.images?.[0]?.url || '/images/placeholder.jpg'}
                            alt={item.product.title}
                            effect="blur"
                            className="w-full h-full object-cover rounded"
                            placeholderSrc="/images/placeholder.jpg"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {item.product.brand}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">
                              {item.variant.name}: {item.variant.option}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-amazon-orange">
                              {formatPrice(item.price)}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(
                                  item.product._id,
                                  item.variant,
                                  item.quantity - 1
                                )}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <FiMinus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(
                                  item.product._id,
                                  item.variant,
                                  item.quantity + 1
                                )}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <FiPlus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.product._id, item.variant)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(totalAmount * 0.08)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-amazon-orange">{formatPrice(totalAmount * 1.08)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="w-full bg-amazon-orange text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200 text-center block font-medium"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  to="/"
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors duration-200 text-center block font-medium mt-3"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
