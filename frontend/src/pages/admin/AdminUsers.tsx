import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FiEdit, FiTrash2, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import adminAPI from '../../services/adminAPI';

const AdminUsers = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-users'],
    () => adminAPI.getAdminUsers({ limit: 100 }),
    { staleTime: 60 * 1000 }
  );

  const users = data?.data?.data?.users || [];

  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    isEmailVerified: false,
    isActive: true,
  });

  const updateRoleMutation = useMutation(
    ({ id, role }: { id: string; role: 'user' | 'admin' }) => adminAPI.updateUserRole(id, { role }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
      },
    }
  );

  const deleteUserMutation = useMutation(
    (id: string) => adminAPI.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
      },
    }
  );

  const updateUserMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) => adminAPI.updateUser(id, payload),
    {
      onSuccess: () => {
        setEditingUser(null);
        queryClient.invalidateQueries(['admin-users']);
      },
    }
  );

  const handleToggleRole = (user: any) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const ok = window.confirm(`Change role for ${user.email} to ${nextRole}?`);
    if (!ok) return;
    updateRoleMutation.mutate({ id: user._id, role: nextRole });
  };

  const handleDelete = (user: any) => {
    const ok = window.confirm(`Delete user ${user.email}? This cannot be undone.`);
    if (!ok) return;
    deleteUserMutation.mutate(user._id);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      isEmailVerified: !!user.isEmailVerified,
      isActive: user.isActive !== false,
    });
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({ id: editingUser._id, payload: form });
  };

  return (
    <>
      <Helmet>
        <title>Manage Users - Admin - Amazon Clone</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Users</h1>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">Loading users...</td>
                    </tr>
                  ) : users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                            <FiUser className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">ID: {user._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isEmailVerified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isEmailVerified ? 'verified' : 'unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-amazon-orange hover:text-orange-600 disabled:opacity-50"
                            onClick={() => openEdit(user)}
                            title="Edit user"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            onClick={() => handleDelete(user)}
                            disabled={deleteUserMutation.isLoading}
                            title="Delete user"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
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
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit User</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditingUser(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitEdit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                  <input
                    className="input-amazon"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                  <input
                    className="input-amazon"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input-amazon"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    className="input-amazon"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="input-amazon"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as 'user' | 'admin' })}
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.isEmailVerified}
                      onChange={(e) => setForm({ ...form, isEmailVerified: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Email verified</span>
                  </label>
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  className="btn-amazon-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-amazon disabled:opacity-50"
                  disabled={updateUserMutation.isLoading}
                >
                  {updateUserMutation.isLoading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;

