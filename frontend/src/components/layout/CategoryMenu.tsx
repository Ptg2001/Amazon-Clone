import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { useQuery } from 'react-query';
import productAPI from '../../services/productAPI';

const CategoryMenu = ({ isMobile = false }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery(
    'categories',
    () => productAPI.getCategories({ tree: true }),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const categories = categoriesData?.data?.categories || [];

  const handleCategoryHover = (category) => {
    setActiveCategory(category);
    setShowSubcategories(true);
  };

  const handleCategoryLeave = () => {
    setActiveCategory(null);
    setShowSubcategories(false);
  };

  if (isLoading) {
    return (
      <div className={`${isMobile ? 'px-4 py-2' : 'py-2'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900 mb-2">Categories</div>
        {categories.map((category) => (
          <div key={category._id}>
            <Link
              to={`/category/${category.slug}`}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {category.name}
            </Link>
            {category.children && category.children.length > 0 && (
              <div className="ml-4 space-y-1">
                {category.children.slice(0, 5).map((subcategory) => (
                  <Link
                    key={subcategory._id}
                    to={`/category/${subcategory.slug}`}
                    className="block px-3 py-1 text-sm text-gray-600 hover:text-amazon-orange hover:bg-gray-50 rounded"
                  >
                    {subcategory.name}
                  </Link>
                ))}
                {category.children.length > 5 && (
                  <Link
                    to={`/category/${category.slug}`}
                    className="block px-3 py-1 text-sm text-amazon-orange hover:underline"
                  >
                    View all {category.children.length} items
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-6">
        {categories.slice(0, 8).map((category) => (
          <div
            key={category._id}
            className="relative"
            onMouseEnter={() => handleCategoryHover(category)}
            onMouseLeave={handleCategoryLeave}
          >
            <Link
              to={`/category/${category.slug}`}
              className="text-sm font-medium text-gray-700 hover:text-amazon-orange transition-colors duration-200 flex items-center space-x-1"
            >
              <span>{category.name}</span>
              {category.children && category.children.length > 0 && (
                <FiChevronDown className="h-3 w-3" />
              )}
            </Link>

            {/* Subcategories Dropdown */}
            {activeCategory?._id === category._id && category.children && category.children.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">
                    {category.name}
                  </div>
                  <div className="space-y-2">
                    {category.children.slice(0, 10).map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        to={`/category/${subcategory.slug}`}
                        className="block text-sm text-gray-700 hover:text-amazon-orange hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                    {category.children.length > 10 && (
                      <Link
                        to={`/category/${category.slug}`}
                        className="block text-sm text-amazon-orange hover:underline p-2 rounded font-medium"
                      >
                        View all {category.children.length} items
                        <FiChevronRight className="inline h-3 w-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* More Categories Link */}
        {categories.length > 8 && (
          <Link
            to="/categories"
            className="text-sm font-medium text-gray-700 hover:text-amazon-orange transition-colors duration-200"
          >
            More Categories
          </Link>
        )}
      </div>
    </div>
  );
};

export default CategoryMenu;
