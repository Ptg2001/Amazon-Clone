import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiShield } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { clearCart } from '../store/slices/cartSlice';
import { useDispatch } from 'react-redux';
import orderAPI from '../services/orderAPI';
import countryService from '../services/countryService';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, totalAmount } = useCart();
  const [countryTick, setCountryTick] = React.useState(0);
  React.useEffect(() => {
    const onChange = () => setCountryTick((v) => v + 1);
    window.addEventListener('country:changed', onChange as any);
    return () => window.removeEventListener('country:changed', onChange as any);
  }, []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const loadScript = (src: string) => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      // 1) Create order on backend from cart
      const method = data.paymentMethod;
      const mappedMethod = method === 'cod' ? 'cash_on_delivery' : 'card';
      const orderPayload = {
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          price: i.price,
        })),
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          phone: data.phone,
        },
        payment: { method: mappedMethod },
      };
      const createdOrderRes = await orderAPI.createOrder(orderPayload);
      const createdOrder = createdOrderRes?.data?.data?.order || createdOrderRes?.data?.order;
      const orderId = createdOrder?._id;
      if (!orderId) throw new Error('Failed to create order');

      // selected method already captured in mappedMethod
      if (method === 'cod') {
        // Mark order as COD locally; backend can handle status on fulfilment
        toast.success('Order placed with Cash on Delivery');
        dispatch(clearCart());
        navigate('/orders');
        return;
      }

      // 2) Ask backend to create Razorpay order
      const amountToPay = total; // local already converted from server cart; backend handles gateway currency
      const rzpOrderRes = await orderAPI.createPaymentIntent({ orderId, amount: amountToPay });
      const rzpData = rzpOrderRes.data.data;

      // 3) Load Razorpay checkout
      const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!ok) throw new Error('Razorpay SDK failed to load');

      const options: any = {
        key: rzpData.razorpayKeyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'AmazonVirtua',
        description: 'Order Payment',
        order_id: rzpData.razorpayOrderId,
        handler: async function (response) {
          try {
            const confirmRes = await orderAPI.confirmPayment({
              orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (confirmRes?.data?.success) {
              dispatch(clearCart());
              toast.success('Order placed successfully!');
              navigate('/orders');
            } else {
              throw new Error('Payment confirmation failed');
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment confirmation failed');
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: '',
          contact: data.phone,
        },
        notes: {
          orderId,
        },
        theme: { color: '#ff9900' },
        // Enable payment method based on selection
        method: {
          netbanking: method === 'netbanking',
          card: method === 'card',
          upi: method === 'upi',
          wallet: false,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        toast.error('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Prices in cart are stored in USD; convert and format according to current location
  const formatPrice = (price) => countryService.formatPrice(price);

  const subtotal = totalAmount;
  const tax = subtotal * 0.08;
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return (
    <>
      <Helmet>
        <title>Checkout - Amazon Clone</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      {...register('address1', { required: 'Address is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.address1 && (
                      <p className="mt-1 text-sm text-red-600">{errors.address1.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      {...register('address2')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register('city', { required: 'City is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      {...register('state', { required: 'State is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      {...register('zipCode', { required: 'ZIP code is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      {...register('phone', { required: 'Phone is required' })}
                      type="tel"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      {...register('paymentMethod', { required: 'Payment method is required' })}
                      type="radio"
                      value="card"
                      id="card"
                      className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300"
                    />
                    <label htmlFor="card" className="flex items-center space-x-2">
                      <FiCreditCard className="h-5 w-5 text-gray-400" />
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="upi"
                      id="upi"
                      className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300"
                    />
                    <label htmlFor="upi" className="flex items-center space-x-2">
                      <span>UPI</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="netbanking"
                      id="netbanking"
                      className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300"
                    />
                    <label htmlFor="netbanking" className="flex items-center space-x-2">
                      <span>Net Banking</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      {...register('paymentMethod')}
                      type="radio"
                      value="cod"
                      id="cod"
                      className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300"
                    />
                    <label htmlFor="cod" className="flex items-center space-x-2">
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item, index) => (
                    <div key={`${item.product._id}-${index}`} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-amazon-orange">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="space-y-2 mb-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FiShield className="h-4 w-4 text-green-500" />
                    <span>Secure payment with SSL encryption</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiTruck className="h-4 w-4 text-green-500" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-amazon-orange text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
