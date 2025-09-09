import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import cartAPI from '../services/cartAPI';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlist, isLoading } = useSelector((state: any) => state.wishlist);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await cartAPI.removeFromWishlist(productId);
      dispatch(removeFromWishlist(productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

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
          ) : wishlist.length === 0 ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {wishlist.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex flex-col h-full">
                  <Link to={`/product/${product._id}`} className="block flex-1 flex flex-col">
                    <div className="aspect-square bg-gray-50 rounded mb-2 overflow-hidden flex items-center justify-center" style={{ height: '160px' }}>
                      <img src={product.images?.[0]?.url || '/images/placeholder.jpg'} alt={product.title} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xs font-medium text-gray-900 line-clamp-2 min-h-[2rem] leading-tight">{product.title}</h3>
                      <div className="mt-1 text-amazon-orange font-semibold text-sm">${product.price?.toFixed?.(2)}</div>
                    </div>
                  </Link>
                  
                  <div className="mt-2 space-y-1">
                    <button className="w-full bg-amazon-orange text-white py-1.5 rounded text-xs hover:bg-orange-600 flex items-center justify-center space-x-1">
                      <FiShoppingCart className="h-3 w-3" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="w-full bg-gray-200 text-gray-700 py-1.5 rounded text-xs hover:bg-gray-300 flex items-center justify-center space-x-1"
                    >
                      <FiHeart className="h-3 w-3 fill-current text-red-500" />
                      <span>Remove</span>
                    </button>
                  </div>
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
