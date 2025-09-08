import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiChevronDown, FiLogOut, FiSettings, FiPackage, FiHeart, FiCreditCard } from 'react-icons/fi';

const UserMenu = ({ user, isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  if (!isAuthenticated) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={toggleMenu}
          className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
        >
          <div className="text-left">
            <div className="text-xs">Hello, sign in</div>
            <div className="text-sm font-semibold">Account & Lists</div>
          </div>
          <FiChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div className="p-4">
              <div className="mb-4">
                <Link
                  to="/login"
                  className="block w-full bg-amazon-orange text-white text-center py-2 px-4 rounded-md hover:bg-orange-600 transition-colors mb-2"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <div className="text-center text-sm text-gray-600">
                  New customer? <Link to="/register" className="text-blue-600 hover:underline" onClick={() => setIsOpen(false)}>Start here</Link>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Your Lists</div>
                <div className="space-y-1">
                  <Link to="/wishlist" className="block text-sm text-gray-700 hover:text-amazon-orange" onClick={() => setIsOpen(false)}>
                    Create a Wish List
                  </Link>
                  <Link to="/lists" className="block text-sm text-gray-700 hover:text-amazon-orange" onClick={() => setIsOpen(false)}>
                    Find a List or Registry
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
      >
        <div className="text-left">
          <div className="text-xs">Hello, {user?.firstName || 'User'}</div>
          <div className="text-sm font-semibold">Account & Lists</div>
        </div>
        <FiChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-4">
            {/* User Info */}
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>

            {/* Account Section */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Your Account</div>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Your Account
                </Link>
                <Link
                  to="/orders"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Your Orders
                </Link>
                <Link
                  to="/profile/payment-methods"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Your Payment Methods
                </Link>
                <Link
                  to="/profile/settings"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Your Account Settings
                </Link>
              </div>
            </div>

            {/* Lists Section */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-900 mb-2">Your Lists</div>
              <div className="space-y-1">
                <Link
                  to="/wishlist"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Create a Wish List
                </Link>
                <Link
                  to="/lists"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Find a List or Registry
                </Link>
              </div>
            </div>

            {/* Admin Link */}
            {user?.role === 'admin' && (
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">Admin</div>
                <Link
                  to="/admin"
                  className="block text-sm text-gray-700 hover:text-amazon-orange"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </div>
            )}

            {/* Sign Out */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-sm text-gray-700 hover:text-amazon-orange"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
