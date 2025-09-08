import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const DealsSection = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <LoadingSkeleton key={index} height="300px" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No deals available</p>
        <Link
          to="/deals"
          className="mt-4 inline-block bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          View All Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group h-full"
          >
            <Link to={`/product/${product._id}`} className="flex flex-col h-full">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <LazyLoadImage
                  src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                  alt={product.title}
                  effect="blur"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  placeholderSrc="/images/placeholder.jpg"
                />
                
                {/* Discount Badge */}
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                
                {/* Price */}
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-bold text-amazon-orange">
                    ${product.price?.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Savings */}
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-sm text-green-600 font-medium mt-auto">
                    Save ${(product.originalPrice - product.price).toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View All Deals Button */}
      <div className="text-center">
        <Link
          to="/deals"
          className="inline-block bg-amazon-orange text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors duration-200"
        >
          View All Deals
        </Link>
      </div>
    </div>
  );
};

export default DealsSection;
