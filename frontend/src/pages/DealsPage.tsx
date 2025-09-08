import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import productAPI from '../services/productAPI';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

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
        <title>Today’s Deals - Amazon Clone</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Today’s Deals</h1>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <LoadingSkeleton key={index} height="300px" />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No deals available right now.</p>
              <Link to="/products" className="mt-4 inline-block bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">Browse Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={product.images?.[0]?.url || '/images/placeholder.jpg'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg font-bold text-amazon-orange">${product.price?.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice?.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Save ${(product.originalPrice - product.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DealsPage;


