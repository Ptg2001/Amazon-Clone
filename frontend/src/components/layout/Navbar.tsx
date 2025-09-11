import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart, FiMapPin, FiChevronDown } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { useCart } from '../../contexts/CartContext';
import SearchBar from './SearchBar';
import CategoryMenu from './CategoryMenu';
import UserMenu from './UserMenu';
import CartSidebar from './CartSidebar';
import countryService from '../../services/countryService';

type Country = { code: string; name: string; flag?: string };

'use strict';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { totalItems } = (useCart() as any);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load country on component mount
  useEffect(() => {
    let mounted = true;
    const loadCountry = async () => {
      try {
        await countryService.refreshFxRates();
        const country = await countryService.detectCountry();
        if (mounted) setCurrentCountry(country as Country);
      } catch (_error) {
        // Silence geolocation CORS errors in dev; fall back to stored/browser locale
        if (mounted) setCurrentCountry(countryService.getCurrentCountry() as Country);
      }
    };
    // Defer detection slightly to reduce initial load burst
    const t = setTimeout(loadCountry, 500);
    const onChange = () => setCurrentCountry(countryService.getCurrentCountry() as Country);
    window.addEventListener('country:changed', onChange as any);
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showCountryDropdown && !event.target.closest('.country-dropdown')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleCountryDropdown = () => setShowCountryDropdown(!showCountryDropdown);

  const handleCountrySelect = (countryCode: string) => {
    const country = countryService.setCountry(countryCode) as Country;
    setCurrentCountry(country);
    setShowCountryDropdown(false);
  };

  const goToOrders = () => {
    if (isAuthenticated) {
      navigate('/orders');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Main Navigation - Amazon Dark Header */}
      <div className="bg-amazon-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Logo and Delivery */}
            <div className="flex items-center gap-4 sm:gap-8">
              {/* Amazon Logo */}
              <Link to="/" className="flex items-center">
                <div className="relative">
                  <span className="text-3xl font-bold text-white">amazon</span>
                  <div className="absolute -bottom-2 left-0 w-full h-2">
                    <svg width="100%" height="100%" viewBox="0 0 200 20" className="overflow-visible">
                      <path
                        d="M 8 12 Q 50 2 95 12 Q 140 22 185 12"
                        stroke="#ff9900"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
              
              {/* Delivery Location */}
              <div className="relative country-dropdown hidden sm:block">
                <button
                  onClick={toggleCountryDropdown}
                  className="flex items-center space-x-1 hover:text-gray-300 transition-colors"
                >
                  <FiMapPin className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Deliver to</div>
                    <div className="text-sm font-semibold">
                      {currentCountry ? currentCountry.name : 'United States'}
                    </div>
                  </div>
                  <FiChevronDown className="h-3 w-3" />
                </button>

                {/* Country Dropdown */}
                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2">Choose your location</div>
                      <div className="max-h-60 overflow-y-auto">
                        {(countryService.getAllCountries() as Country[]).map((country) => (
                          <button
                            key={country.code}
                            onClick={() => handleCountrySelect(country.code)}
                            className={`w-full flex items-center space-x-2 px-2 py-1 text-sm hover:bg-gray-100 rounded ${
                              currentCountry?.code === country.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span>{country.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-2xl mx-2 sm:mx-4 hidden md:block">
              <SearchBar />
            </div>

            {/* Right Side - User Menu, Cart, etc. */}
            <div className="flex items-center gap-3 sm:gap-8">
              {/* Mobile Search Button */}
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
              >
                <FiSearch className="h-6 w-6" />
              </button>

              {/* Language/Region */}
              <div className="hidden lg:flex items-center space-x-1 text-white hover:text-gray-300 transition-colors cursor-pointer">
                <span className="text-lg">🇺🇸</span>
                <span className="text-sm">EN</span>
                <FiChevronDown className="h-3 w-3" />
              </div>

              {/* Desktop User Menu */}
              <div className="hidden md:block">
                <UserMenu user={user} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
              </div>

              {/* Mobile Account shortcut */}
              <button
                onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
                className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
                aria-label="Account"
              >
                <FiUser className="h-6 w-6" />
              </button>

              {/* Returns & Orders */}
              <button
                onClick={goToOrders}
                className="hidden lg:block text-white hover:text-gray-300 transition-colors cursor-pointer text-left"
                aria-label="Returns and Orders"
              >
                <div className="text-xs">Returns</div>
                <div className="text-sm font-semibold">& Orders</div>
              </button>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors relative"
              >
                <div className="relative">
                  <FiShoppingCart className="h-8 w-8" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amazon-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-semibold">Cart</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 text-white hover:text-gray-300 transition-colors"
              >
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden py-4">
              <SearchBar />
            </div>
          )}
        </div>
      </div>



        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-2 space-y-2">
              <CategoryMenu isMobile />
              <div className="border-t border-gray-200 pt-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      My Wishlist
                    </Link>
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-200" />
                        <Link
                          to="/admin"
                          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          to="/admin/products"
                          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          Manage Products
                        </Link>
                        <Link
                          to="/admin/orders"
                          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          Manage Orders
                        </Link>
                        <Link
                          to="/admin/users"
                          className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          Manage Users
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Secondary Navigation Bar - Amazon Blue */}
      <div className="bg-amazon-blue text-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-8 py-2 overflow-x-auto no-scrollbar">
            {/* All Menu */}
            <button onClick={() => navigate('/products')} className="flex items-center space-x-1 hover:text-gray-300 transition-colors border border-transparent hover:border-white px-2 py-1">
              <FiMenu className="h-4 w-4" />
              <span className="font-medium">All</span>
            </button>

            {/* Navigation Links */}
            <Link to="/deals" className="hover:text-gray-300 transition-colors">
              Today's Deals
            </Link>
            <a href="https://www.primevideo.com" target="_blank" rel="noreferrer" className="hover:text-gray-300 transition-colors">
              Prime Video
            </a>
            <Link to="/registry" className="hover:text-gray-300 transition-colors">
              Registry
            </Link>
            <Link to="/customer-service" className="hover:text-gray-300 transition-colors">
              Customer Service
            </Link>
            <Link to="/gift-cards" className="hover:text-gray-300 transition-colors">
              Gift Cards
            </Link>
            <Link to="/sell" className="hover:text-gray-300 transition-colors">
              Sell
            </Link>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;


