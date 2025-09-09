import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setCartFromServer } from '../../store/slices/cartSlice';
import cartAPI from '../../services/cartAPI';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.auth?.isAuthenticated);
  const wishlist = useSelector((state: any) => state.wishlist?.wishlist ?? []);

  const isInWishlist = wishlist.some((item) => item._id === product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    try {
      await cartAPI.addItem(product._id, 1);
      const res = await cartAPI.getCart();
      dispatch(setCartFromServer(res?.data?.data?.cart));
      toast.success('Added to cart');
    } catch (_e) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product));
      toast.success('Added to wishlist');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className="h-3 w-3 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FiStar key="half" className="h-3 w-3 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className="h-3 w-3 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product._id}`} className="flex flex-col h-full">
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-white flex items-center justify-center">
          <LazyLoadImage
            src={product.images?.[imageIndex]?.url || '/images/placeholder.jpg'}
            alt={product.title}
            effect="blur"
            width={600}
            height={450}
            className="w-full h-full object-contain"
            placeholderSrc="/images/placeholder.jpg"
          />
          
          {/* Image Navigation */}
          {product.images && product.images.length > 1 && isHovered && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === imageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.discount}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
            }`}
          >
            <FiHeart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand + Title block with fixed height for alignment */}
          <div className="mb-2 min-h-[56px]">
            {product.brand && (
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
            )}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {product.title}
            </h3>
          </div>

          {/* Rating placeholder with fixed height to avoid shifting */}
          <div className="mb-2 h-5">
            {product.ratings?.average > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {renderStars(product.ratings.average)}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.ratings.count})
                </span>
              </div>
            )}
          </div>

          {/* Price with fixed row height for alignment */}
          <div className="flex items-baseline space-x-2 mb-2 h-6">
            <span className="text-lg font-bold text-amazon-orange">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="mt-auto w-full bg-amazon-orange text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <FiShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
