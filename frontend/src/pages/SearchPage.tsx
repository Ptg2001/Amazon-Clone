import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import productAPI from '../services/productAPI';
import ProductCard from '../components/products/ProductCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  const { data: searchResults, isLoading } = useQuery(
    ['search', query, category],
    () => {
      const params = { limit: 20 };
      if (category && category !== 'all') params.category = category;
      return productAPI.searchProducts(query, params);
    },
    {
      enabled: query.length > 0,
    }
  );

  const products = searchResults?.data?.data?.products || [];

  return (
    <>
      <Helmet>
        <title>{`${query ? `Search results for "${query}"` : 'Search'} - Amazon Clone`}</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {query ? `Search results for "${query}"` : 'Search Products'}
            </h1>
            {query && (
              <p className="text-gray-600">
                {isLoading ? 'Searching...' : `Found ${products.length} products`}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <LoadingSkeleton key={index} height="300px" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {query ? 'No products found for your search.' : 'Enter a search term to find products.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
