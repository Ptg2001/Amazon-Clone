import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const resolveCategoryImage = (category, products = []) => {
  if (category?.image?.url) return category.image.url;
  const prod = products.find((p) => p?.category?._id === category?._id || p?.category === category?._id || p?.category?.slug === category?.slug);
  return prod?.images?.[0]?.url || '/images/category-placeholder.jpg';
};

const CategorySection = ({ categories, isLoading, productsForImages = [], initialCount = 12 }) => {
  const [showAll, setShowAll] = useState(false);
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

  const visibleCategories = showAll ? categories : categories.slice(0, initialCount);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {visibleCategories.map((category) => {
        const img = resolveCategoryImage(category, productsForImages);
        return (
          <Link
            key={category._id}
            to={`/category/${category.slug}`}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
          >
            <div className="relative overflow-hidden bg-gray-50 flex items-center justify-center" style={{ height: 140 }}>
              <LazyLoadImage
                src={img}
                alt={category.name}
                effect="blur"
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                placeholderSrc="/images/category-placeholder.jpg"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 text-center group-hover:text-amazon-orange transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                {category.name}
              </h3>
            </div>
          </Link>
        );
        })}
      </div>

      {categories.length > initialCount && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="px-4 py-2 text-sm font-medium text-white bg-amazon-blue rounded hover:bg-amazon-blue-dark transition-colors"
          >
            {showAll ? 'Show less' : `Show ${categories.length - initialCount} more`}
          </button>
        </div>
      )}
    </>
  );
};

export default CategorySection;
