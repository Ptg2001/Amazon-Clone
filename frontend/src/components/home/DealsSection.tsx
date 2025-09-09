import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ProductCard from '../products/ProductCard';

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
      {/* Deals Grid using shared ProductCard for consistent layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
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
