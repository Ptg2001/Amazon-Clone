import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const RelatedProducts = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Related Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className="aspect-square overflow-hidden">
              <LazyLoadImage
                src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                alt={product.title}
                effect="blur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                placeholderSrc="/images/placeholder.jpg"
              />
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                {product.title}
              </h4>
              <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amazon-orange">
                  ${product.price?.toFixed(2)}
                </span>
                {product.ratings?.average > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-xs text-gray-500">
                      {product.ratings.average}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
