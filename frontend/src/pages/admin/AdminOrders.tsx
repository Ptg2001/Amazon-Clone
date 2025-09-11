import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import adminAPI from '../../services/adminAPI';
import countryService from '../../services/countryService';

type Status = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

type AdminOrder = {
  _id: string;
  orderNumber: string;
  user?: { firstName?: string; lastName?: string } | null;
  createdAt: string | number | Date;
  pricing?: { total?: number } | null;
  status: Status | string;
};

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ['admin-orders'],
    () => adminAPI.getAdminOrders({ limit: 50 }),
    { staleTime: 30 * 1000 }
  );

  const orders = (data?.data?.data?.orders ?? []) as AdminOrder[];

  // Re-render to refresh currency formatting on location changes (mobile/tablet too)
  const [countryTick, setCountryTick] = React.useState(0);
  React.useEffect(() => {
    const onChange = () => setCountryTick((v) => v + 1);
    window.addEventListener('country:changed', onChange as any);
    return () => window.removeEventListener('country:changed', onChange as any);
  }, []);

  const [selectedStatusById, setSelectedStatusById] = React.useState<Record<string, Status>>({});

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: Status }) =>
      adminAPI.updateOrderStatus(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-orders']);
      },
    }
  );

  const allowedStatuses: Status[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
        return <FiTruck className="h-4 w-4 text-blue-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Orders - Admin - Amazon Clone</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Orders</h1>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Customer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-gray-500">Loading orders...</td>
                    </tr>
                  ) : orders.map((order: AdminOrder) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {order?.pricing?.total != null ? countryService.formatPrice(order.pricing.total as number) : '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon((order.status as Status))}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor((order.status as Status))}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button className="text-amazon-orange hover:text-orange-600 flex items-center space-x-1">
                            <FiEye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={(selectedStatusById[order._id] ?? order.status) as Status}
                              onChange={(e) =>
                                setSelectedStatusById((prev) => ({ ...prev, [order._id]: e.target.value as Status }))
                              }
                            >
                              {allowedStatuses.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              className="bg-amazon-orange text-white px-3 py-1 rounded text-sm disabled:opacity-60"
                              disabled={updateStatusMutation.isLoading}
                              onClick={() =>
                                updateStatusMutation.mutate({ id: order._id, status: (selectedStatusById[order._id] ?? order.status) as Status })
                              }
                            >
                              {updateStatusMutation.isLoading ? 'Updating...' : 'Update'}
                            </button>
                          </div>
                        </div>
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

export default AdminOrders;
