import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CustomerServicePage = () => {
  return (
    <>
      <Helmet>
        <title>Customer Service - NexaCart</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Service</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/orders" className="block p-6 bg-white border border-gray-200 rounded-md hover:shadow-sm">
              <div className="text-lg font-medium text-gray-900">Your Orders</div>
              <div className="text-sm text-gray-600">Track packages, edit or cancel orders</div>
            </Link>
            <Link to="/addresses" className="block p-6 bg-white border border-gray-200 rounded-md hover:shadow-sm">
              <div className="text-lg font-medium text-gray-900">Your Addresses</div>
              <div className="text-sm text-gray-600">Edit addresses for orders and gifts</div>
            </Link>
            <Link to="/profile/payment-methods" className="block p-6 bg-white border border-gray-200 rounded-md hover:shadow-sm">
              <div className="text-lg font-medium text-gray-900">Payment Options</div>
              <div className="text-sm text-gray-600">Edit or add payment methods</div>
            </Link>
            <Link to="/profile" className="block p-6 bg-white border border-gray-200 rounded-md hover:shadow-sm">
              <div className="text-lg font-medium text-gray-900">Account Settings</div>
              <div className="text-sm text-gray-600">Change your email, name and more</div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerServicePage;


