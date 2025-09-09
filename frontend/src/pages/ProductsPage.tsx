import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import productAPI from '../services/productAPI';
import ProductCard from '../components/products/ProductCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const featured = searchParams.get('featured') === 'true';

  const { data, isLoading } = useQuery(
    ['products-list', featured],
    () => productAPI.getProducts({ featured: featured || undefined, limit: 24 }),
    { keepPreviousData: true }
  );

  const products = data?.data?.data?.products || [];

  return (
    <>
      <Helmet>
        <title>{`${featured ? 'Featured Products' : 'All Products'} - Amazon Clone`}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {featured ? 'Featured Products' : 'All Products'}
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <LoadingSkeleton key={index} height="240px" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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

export default ProductsPage;


