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
import countryService from '../../services/countryService';

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
      toast.success('Added to cart', { duration: 1500 });
    } catch (_e) {
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await cartAPI.removeFromWishlist(product._id);
        dispatch(removeFromWishlist(product._id));
        toast.success('Removed from wishlist');
      } else {
        await cartAPI.addToWishlist(product._id);
        dispatch(addToWishlist(product));
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const formatPrice = (price) => countryService.formatPrice(price);

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

  const truncatedTitle = typeof product.title === 'string' ? product.title.slice(0, 60) : '';

  const hasValidOriginal = typeof product.originalPrice === 'number' && product.originalPrice > product.price;
  const percentFromOriginal = hasValidOriginal ? Math.round((1 - (product.price / product.originalPrice)) * 100) : 0;
  const percentFromDiscountField = typeof product.discount === 'number' && product.discount > 0 ? Math.round(product.discount) : 0;
  const computedDiscountPercent = percentFromDiscountField || percentFromOriginal;

  // If there is a percent but no original price, derive a pseudo original for UI
  const pseudoOriginal = !hasValidOriginal && percentFromDiscountField > 0
    ? parseFloat((product.price / (1 - percentFromDiscountField / 100)).toFixed(2))
    : null;

  const displayOriginal = hasValidOriginal ? product.originalPrice : (pseudoOriginal ?? null);
  const savingsAmount = displayOriginal ? Math.max(0, displayOriginal - product.price) : 0;

  const productId = (product as any)?._id || (product as any)?.id;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={productId ? `/product/${productId}` : '#'} className={`flex flex-col h-full ${!productId ? 'pointer-events-none opacity-60' : ''}`}>
        {/* Product Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center min-h-[160px]">
          <LazyLoadImage
            src={product.images?.[imageIndex]?.url || '/images/placeholder.jpg'}
            alt={product.title}
            effect="blur"
            width={400}
            height={300}
            className="w-full h-full object-contain p-2"
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
          {computedDiscountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{computedDiscountPercent}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              isInWishlist
                ? 'bg-white text-red-500'
                : 'bg-white bg-opacity-80 text-gray-600 hover:bg-opacity-100'
            }`}
          >
            <FiHeart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} style={{ color: isInWishlist ? '#ef4444' : 'inherit' }} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          {/* Brand + Title block with fixed height for alignment */}
          <div className="mb-2 min-h-[44px]">
            {product.brand && (
              <p className="text-xs text-gray-500 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{product.brand}</p>
            )}
            <h3 className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis" title={product.title}>
              {truncatedTitle}
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
          <div className="flex items-baseline space-x-2 mb-1 h-6">
            <span className="text-lg font-bold text-amazon-orange">
              {formatPrice(product.price)}
            </span>
            {displayOriginal && displayOriginal > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(displayOriginal)}
              </span>
            )}
          </div>

          {/* Savings row */}
          {computedDiscountPercent > 0 && savingsAmount > 0 && (
            <div className="mb-2 -mt-1 h-5">
              <span className="text-xs text-green-700 font-medium">
                Save {formatPrice(savingsAmount)} ({computedDiscountPercent}%)
              </span>
            </div>
          )}

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
