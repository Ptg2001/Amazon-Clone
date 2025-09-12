import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiEdit3 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <Helmet>
        <title>My Profile - NexaCart</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  <Link to="/profile/settings" className="text-amazon-orange hover:text-orange-600 flex items-center space-x-1">
                    <FiEdit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <FiUser className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FiMail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  
                  {user?.phone && (
                    <div className="flex items-center space-x-3">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a href="/orders" className="block text-amazon-orange hover:text-orange-600">
                    View Orders
                  </a>
                  <a href="/wishlist" className="block text-amazon-orange hover:text-orange-600">
                    My Wishlist
                  </a>
                  <a href="/addresses" className="block text-amazon-orange hover:text-orange-600">
                    Manage Addresses
                  </a>
                  <a href="/profile/payment-methods" className="block text-amazon-orange hover:text-orange-600">
                    Payment Methods
                  </a>
                  <a href="/profile/settings" className="block text-amazon-orange hover:text-orange-600">
                    Account Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
