import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useQuery } from 'react-query';
import authAPI from '../services/authAPI';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const { data, isLoading } = useQuery(['wishlist'], () => authAPI.getWishlist(), { staleTime: 60 * 1000 });
  const wishlistItems = data?.data?.data?.wishlist || [];

  return (
    <>
      <Helmet>
        <title>My Wishlist - Amazon Clone</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <FiHeart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading your wishlist...</h2>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <FiHeart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-8">Add items you love to your wishlist</p>
              <a
                href="/"
                className="bg-amazon-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <Link to={`/product/${product._id}`} className="block">
                    <div className="aspect-square bg-gray-100 rounded mb-3 overflow-hidden">
                      <img src={product.images?.[0]?.url || '/images/placeholder.jpg'} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                    <div className="mt-2 text-amazon-orange font-semibold">${product.price?.toFixed?.(2)}</div>
                  </Link>
                  <button className="mt-3 w-full bg-amazon-orange text-white py-2 rounded hover:bg-orange-600 flex items-center justify-center space-x-2">
                    <FiShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistPage;
