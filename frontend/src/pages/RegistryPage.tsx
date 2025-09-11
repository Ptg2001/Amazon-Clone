import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import authAPI from '../services/authAPI';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';

const RegistryPage = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      if (isAuthenticated) {
        const res = await authAPI.getWishlist();
        setItems(res?.data?.data?.wishlist || res?.data?.wishlist || []);
      }
    } catch (_) {
      // ignore for unauthenticated
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isAuthenticated]);

  return (
    <>
      <Helmet>
        <title>Registry - Amazon Clone</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Registry</h1>
          {!isAuthenticated ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Sign in to view and manage your registry (wishlist).</p>
              <Link className="inline-block bg-amazon-orange text-white px-6 py-2 rounded-md hover:bg-orange-600" to="/login?redirect=/registry">Sign In</Link>
            </div>
          ) : loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your registry is empty.</p>
              <Link to="/products" className="text-amazon-orange hover:text-orange-600">Browse products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegistryPage;


