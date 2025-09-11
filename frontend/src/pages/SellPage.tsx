import React from 'react';
import { Helmet } from 'react-helmet-async';

const SellPage = () => {
  return (
    <>
      <Helmet>
        <title>Sell on Amazon Clone</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sell on Amazon Clone</h1>
          <div className="bg-white border border-gray-200 rounded-md p-6">
            <p className="text-gray-700">Coming soon: Seller onboarding and product listing tools.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellPage;


