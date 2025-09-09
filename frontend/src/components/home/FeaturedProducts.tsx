import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import ProductCard from '../products/ProductCard';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const FeaturedProducts = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <LoadingSkeleton key={index} height="300px" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No featured products available</p>
        <Link
          to="/products"
          className="mt-4 inline-block bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          View All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link
          to="/products?featured=true"
          className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          View All Featured Products
        </Link>
      </div>
    </div>
  );
};

export default FeaturedProducts;
