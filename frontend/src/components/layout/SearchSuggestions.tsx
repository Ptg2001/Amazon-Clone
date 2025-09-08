import React from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiClock } from 'react-icons/fi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const SearchSuggestions = ({ suggestions, isLoading, onSuggestionClick, onClose, onViewAll }) => {
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50">
        <div className="p-4 text-center text-gray-500">
          <FiSearch className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        <div className="text-xs text-gray-500 px-2 py-1 mb-2 border-b border-gray-100">
          Suggestions
        </div>
        
        {suggestions.map((product) => (
          <div
            key={product._id}
            onClick={() => onSuggestionClick(product)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-200"
          >
            {/* Product Image */}
            <div className="w-12 h-12 flex-shrink-0">
              <LazyLoadImage
                src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                alt={product.title}
                effect="blur"
                className="w-full h-full object-cover rounded"
                placeholderSrc="/images/placeholder.jpg"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {product.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {product.brand}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm font-bold text-amazon-orange">
                  ${product.price?.toFixed(2)}
                </span>
                {product.ratings?.average > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-500">
                      {product.ratings.average} ({product.ratings.count})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Search Icon */}
            <FiSearch className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
        ))}

        {/* View All Results */}
        <div className="border-t border-gray-100 mt-2 pt-2">
          <button onClick={onViewAll} className="w-full text-left px-2 py-2 text-sm text-amazon-orange hover:bg-gray-50 rounded-md flex items-center space-x-2">
            <FiClock className="h-4 w-4" />
            <span>View all results</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;
