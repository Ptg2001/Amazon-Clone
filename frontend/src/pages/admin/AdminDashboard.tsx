import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiPlus, FiBox, FiShoppingBag } from 'react-icons/fi';
import adminAPI from '../../services/adminAPI';
import { Link } from 'react-router-dom';
import countryService from '../../services/countryService';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { formatCurrency } from '../../utils/currency';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  // Fetch products data for stats
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery(
    ['admin-dashboard'],
    () => adminAPI.getDashboardStats(),
    { staleTime: 60 * 1000 }
  );

  // Re-render on country change so currency formatting updates on mobile/tablet too
  const [countryTick, setCountryTick] = React.useState(0);
  React.useEffect(() => {
    const onChange = () => setCountryTick((v) => v + 1);
    window.addEventListener('country:changed', onChange as any);
    return () => window.removeEventListener('country:changed', onChange as any);
  }, []);

  const stats = dashboardData?.data?.data || {};
  const totals = stats.totals || {};
  const recentOrders = stats.recentOrders || [];

  // Optimistic delete for recent orders
  const deleteRecentMutation = useMutation((id: string) => adminAPI.deleteAdminOrder(id), {
    onMutate: async (id: string) => {
      await queryClient.cancelQueries(['admin-dashboard'])
      const previous = queryClient.getQueryData<any>(['admin-dashboard'])
      queryClient.setQueryData(['admin-dashboard'], (old: any) => {
        const data = old?.data?.data || {}
        const current = data.recentOrders || []
        const next = current.filter((o: any) => o._id !== id)
        return { ...old, data: { ...old?.data, data: { ...data, recentOrders: next } } }
      })
      return { previous }
    },
    onError: (_err, _id, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(['admin-dashboard'], ctx.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['admin-dashboard'])
    }
  })

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <LoadingSkeleton height="40px" width="300px" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <LoadingSkeleton key={index} height="120px" />
            ))}
          </div>
          <LoadingSkeleton height="400px" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Amazon Clone</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/admin/products/new" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FiPlus className="h-5 w-5 text-amazon-orange" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Create</div>
                  <div className="text-base font-semibold text-gray-900">Add Product</div>
                </div>
              </div>
            </Link>
            <Link to="/admin/products" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiBox className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Inventory</div>
                  <div className="text-base font-semibold text-gray-900">Manage Stock</div>
                </div>
              </div>
            </Link>
            <Link to="/admin/orders" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiShoppingBag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Orders</div>
                  <div className="text-base font-semibold text-gray-900">Manage Orders</div>
                </div>
              </div>
            </Link>
            <Link to="/admin/users" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiUsers className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Customers</div>
                  <div className="text-base font-semibold text-gray-900">Manage Users</div>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{(totals.users ?? stats.userStats?.totalUsers ?? 0).toLocaleString?.()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiPackage className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{(totals.products ?? stats.productStats?.totalProducts ?? 0).toLocaleString?.()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiTrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{(totals.orders ?? stats.orderStats?.totalOrders ?? 0).toLocaleString?.()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiDollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const amount = (totals.revenue ?? stats.orderStats?.totalRevenue ?? 0) as number
                      const currency = (totals.revenueCurrency ?? stats.orderStats?.revenueCurrency ?? countryService.getCurrencyCode()) as string
                      try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount) } catch { return `${currency} ${amount.toFixed?.(2)}` }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id || order.orderNumber} id={`recent-${order._id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order?.pricing?.total != null ? formatCurrency(order.pricing.total as number, order?.payment?.currency) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => deleteRecentMutation.mutate(order._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
