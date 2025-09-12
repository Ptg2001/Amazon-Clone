import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import productAPI from '../services/productAPI';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';

const DealsPage = () => {
  const { data, isLoading } = useQuery(
    ['deals-list'],
    () => productAPI.getProducts({ limit: 48 }),
    { keepPreviousData: true }
  );

  const allProducts = data?.data?.data?.products || [];
  const deals = allProducts.filter(p => p.originalPrice && p.originalPrice > p.price);

  return (
    <>
      <Helmet>
        <title>Today’s Deals - NexaCart</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Today’s Deals</h1>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(9)].map((_, index) => (
                <LoadingSkeleton key={index} height="240px" />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No deals available right now.</p>
              <Link to="/products" className="mt-4 inline-block bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">Browse Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {deals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DealsPage;


