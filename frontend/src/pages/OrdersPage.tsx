import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useQuery } from 'react-query';
import orderAPI from '../services/orderAPI';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const OrdersPage = () => {
  const { data, isLoading } = useQuery(
    ['user-orders'],
    () => orderAPI.getOrders({ limit: 20 }),
    { staleTime: 30 * 1000 }
  );

  const orders = data?.data?.data?.orders || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <FiTruck className="h-5 w-5 text-blue-500" />;
      default:
        return <FiPackage className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Orders - NexaCart</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <FiPackage className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading your orders...</h2>
              <p className="text-gray-600 mb-8">Please wait</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
              <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
              <a
                href="/"
                className="bg-amazon-orange text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(order.pricing?.total, order?.payment?.currency)}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} item(s)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${
                        order.status === 'delivered' ? 'text-green-600' :
                        order.status === 'shipped' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="space-x-3">
                      <Link to={`/orders/${order._id}`} className="text-amazon-orange hover:text-orange-600 text-sm font-medium">
                        View Details
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersPage;
