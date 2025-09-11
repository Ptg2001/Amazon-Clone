import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import {
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} from '../../store/slices/cartSlice';
import { useCart } from '../../contexts/CartContext';
import cartAPI from '../../services/cartAPI';
import { setCartFromServer } from '../../store/slices/cartSlice';

const CartSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalItems, totalAmount } = useCart();

  const handleQuantityChange = async (productId, variant, newQuantity) => {
    try {
      await cartAPI.updateItem(productId, Math.max(0, newQuantity), variant);
      const res = await cartAPI.getCart();
      dispatch(setCartFromServer(res?.data?.data?.cart));
    } catch (_e) {}
  };

  const handleRemoveItem = async (productId, variant) => {
    // Optimistic update for better UX
    dispatch(removeFromCart({ productId, variant }));
    try {
      await cartAPI.removeItem(productId, variant);
      const res = await cartAPI.getCart();
      dispatch(setCartFromServer(res?.data?.data?.cart));
    } catch (_e) {
      // Re-sync with server if request failed
      try {
        const res = await cartAPI.getCart();
        dispatch(setCartFromServer(res?.data?.data?.cart));
      } catch (__e) {}
    }
  };

  const handleClearCart = async () => {
    try {
      await cartAPI.clear();
      const res = await cartAPI.getCart();
      dispatch(setCartFromServer(res?.data?.data?.cart));
    } catch (_e) {}
  };

  const goToCart = () => {
    onClose?.();
    navigate('/cart');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({totalItems})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiShoppingBag className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm text-center">
                  Add some items to get started
                </p>
                <Link
                  to="/"
                  onClick={onClose}
                  className="mt-4 bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.product._id}-${index}`} className="flex items-center space-x-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0">
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
                          ${item.price.toFixed(2)}
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
                      type="button"
                      onClick={() => handleRemoveItem(item.product._id, item.variant)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-amazon-orange">${totalAmount.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={goToCart}
                  className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  View Cart
                </button>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block w-full bg-amazon-orange text-white text-center py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Checkout
                </Link>
                <button
                  onClick={handleClearCart}
                  className="block w-full text-red-600 text-sm py-1 hover:underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
