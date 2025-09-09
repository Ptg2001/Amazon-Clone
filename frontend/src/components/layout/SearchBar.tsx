import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useQuery } from 'react-query';
import productAPI from '../../services/productAPI';
import SearchSuggestions from './SearchSuggestions';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Load categories for department dropdown (live data)
  const { data: categoriesData } = useQuery(
    ['search-categories'],
    () => productAPI.getCategories({}),
    { staleTime: 10 * 60 * 1000 }
  );

  const categories = categoriesData?.data?.data?.categories || [];
  const topLevelCategories = categories.filter((c) => !c.parent);

  // Search suggestions query
  const { data: suggestions, isLoading } = useQuery(
    ['search-suggestions', query, selectedCategory],
    () => {
      const categoryParam = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      return productAPI.searchProducts(query, { limit: 5, ...categoryParam });
    },
    {
      enabled: query.length > 2 && isFocused,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 2 && isFocused);
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      navigate(`/search?${params.toString()}`);
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    navigate(`/product/${suggestion._id}`);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(query.length > 2);
  };

  // Handle blur
  const handleBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-100 border border-gray-300 rounded-l-md px-2 sm:px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent min-w-[90px] sm:min-w-[120px]"
          >
            <option value="all">All</option>
            {topLevelCategories.map((cat) => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search Amazon"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            />
            
            {/* Clear Button */}
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="bg-amazon-orange text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center min-w-[50px]"
          >
            <FiSearch className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <SearchSuggestions
          suggestions={suggestions?.data?.data?.products || suggestions?.data?.products || []}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
          onClose={() => setShowSuggestions(false)}
          onViewAll={() => {
            if (query.trim()) {
              const params = new URLSearchParams({ q: query.trim() });
              if (selectedCategory !== 'all') {
                params.set('category', selectedCategory);
              }
              navigate(`/search?${params.toString()}`);
              setShowSuggestions(false);
              setIsFocused(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default SearchBar;
