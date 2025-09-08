import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const CategorySection = ({ categories, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <LoadingSkeleton key={index} height="200px" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => (
        <Link
          key={category._id}
          to={`/category/${category.slug}`}
          className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
        >
          <div className="aspect-square relative overflow-hidden">
            <LazyLoadImage
              src={category.image?.url || '/images/category-placeholder.jpg'}
              alt={category.name}
              effect="blur"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              placeholderSrc="/images/category-placeholder.jpg"
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-amazon-orange transition-colors">
              {category.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CategorySection;
