import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useQuery } from 'react-query';
import orderAPI from '../services/orderAPI';
import { formatCurrency } from '../utils/currency';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery(['order-details', id], () => orderAPI.getOrder(id), { enabled: !!id });
  const order = data?.data?.data?.order;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
        return <FiTruck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <FiPackage className="h-5 w-5 text-yellow-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
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
        <title>{`Order Details - ${order?.orderNumber || id} - Amazon Clone`}</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>
          
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(order?.status)}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order #{order?.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-500">Placed on {order ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  order?.status === 'delivered' ? 'text-green-600' :
                  order?.status === 'shipped' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {getStatusText(order?.status)}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-gray-500">Loading items...</div>
                ) : order?.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <img src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'} alt={item.product?.title} className="w-full h-full object-cover rounded" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{item.product?.title}</h4>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.price, order?.payment?.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <p className="text-sm text-gray-900">{order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}</p>
              <p className="text-sm text-gray-600">{order?.shippingAddress?.address1}, {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}</p>
            </div>

            {/* Tracking Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking</h3>
              {/* Stepper */}
              <div className="flex items-center justify-between">
                {[
                  { key: 'ordered', label: 'Ordered' },
                  { key: 'shipped', label: 'Shipped' },
                  { key: 'out_for_delivery', label: 'Out for delivery' },
                  { key: 'delivered', label: 'Delivered' },
                ].map((step, idx) => {
                  const isActive = order?.status === step.key || ['delivered','out_for_delivery','shipped'].includes(order?.status) && step.key !== 'ordered' || (order?.status === 'ordered' && step.key === 'ordered');
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>•</div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</div>
                      {idx < 3 && <div className={`h-1 w-full ${isActive ? 'bg-amber-400' : 'bg-gray-200'}`}></div>}
                    </div>
                  )
                })}
              </div>
              {order?.tracking && (
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-gray-600"><span className="font-medium">Carrier:</span> {order.tracking.carrier}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Tracking Number:</span> {order.tracking.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order?.pricing?.subtotal, order?.payment?.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatCurrency(order?.pricing?.shipping, order?.payment?.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatCurrency(order?.pricing?.tax, order?.payment?.currency)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-amazon-orange">{formatCurrency(order?.pricing?.total, order?.payment?.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;
