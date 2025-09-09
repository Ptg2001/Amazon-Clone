import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import adminAPI from '../../services/adminAPI';
import productAPI from '../../services/productAPI';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { Link } from 'react-router-dom';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const queryClient = useQueryClient();

  // Fetch all products for admin
  const { data: productsData, isLoading, error } = useQuery(
    ['admin-products'],
    () => adminAPI.getAdminProducts({ limit: 100 }),
    { staleTime: 60 * 1000 }
  );

  const products = productsData?.data?.data?.products || [];

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: '',
    price: 0,
    quantity: 0,
    isActive: true,
    featuresText: '',
    attributesText: '',
    imagesText: '',
    variationsText: '',
  });

  const deleteMutation = useMutation(
    (id: string) => productAPI.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-products']);
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, payload }: { id: string; payload: any }) => productAPI.updateProduct(id, payload),
    {
      onSuccess: () => {
        setEditingProduct(null);
        queryClient.invalidateQueries(['admin-products']);
      },
    }
  );

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      title: product.title || '',
      price: product.price || 0,
      quantity: product.inventory?.quantity || 0,
      isActive: product.isActive !== false,
      featuresText: (product.features || []).join('\n'),
      attributesText: (() => {
        const attrs = product.attributes;
        const lines: string[] = [];
        if (attrs?.forEach) {
          attrs.forEach((v: string, k: string) => lines.push(`${k}: ${v}`));
        } else if (attrs && typeof attrs === 'object') {
          Object.entries(attrs).forEach(([k, v]) => {
            if (typeof v === 'string') lines.push(`${k}: ${v}`);
          });
        }
        return lines.join('\n');
      })(),
      imagesText: (product.images || []).map((i: any) => i.url).join('\n'),
      variationsText: (() => {
        const raw = Array.isArray(product.variations) && product.variations.length ? product.variations : (Array.isArray(product.variants) ? product.variants : []);
        return (raw || []).map((v: any) => `${v?.name || ''} | ${Array.isArray(v?.options) ? v.options.join(', ') : ''}`.trim()).join('\n');
      })(),
    });
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateMutation.mutate({
      id: editingProduct._id,
      payload: {
        title: form.title,
        price: form.price,
        inventory: { quantity: form.quantity },
        isActive: form.isActive,
        features: (form.featuresText || '').split('\n').map(s => s.trim()).filter(Boolean),
        attributes: (() => {
          const map: Record<string,string> = {};
          (form.attributesText || '').split('\n').forEach((raw) => {
            const line = raw.trim();
            if (!line) return;
            const idx = line.indexOf(':');
            if (idx > -1) {
              const k = line.slice(0, idx).trim();
              const v = line.slice(idx + 1).trim();
              if (k && v) map[k] = v;
            }
          });
          return map;
        })(),
        images: (form.imagesText || '').split('\n').map((u) => ({ url: u.trim() })).filter((i) => i.url && i.url.startsWith('http')),
        variants: (form.variationsText || '').split('\n').map((raw) => {
          const line = raw.trim();
          if (!line) return null as any;
          const [namePart, optsPart] = line.split('|');
          const name = (namePart || '').trim();
          const options = (optsPart || '').split(',').map((s) => s.trim()).filter(Boolean);
          if (!name || options.length === 0) return null as any;
          return { name, options } as any;
        }).filter(Boolean),
      },
    });
  };

  const handleDelete = (product: any) => {
    const ok = window.confirm(`Delete product "${product.title}"? This cannot be undone.`);
    if (!ok) return;
    deleteMutation.mutate(product._id);
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category?.name === categoryFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <LoadingSkeleton height="40px" width="300px" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <LoadingSkeleton key={index} height="80px" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
            <p className="text-gray-600">Failed to load products. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Products - Admin - Amazon Clone</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
            <Link to="/admin/products/new" className="bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2">
              <FiPlus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                  />
                </div>
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                              {product.images?.[0]?.url ? (
                                <img 
                                  src={product.images[0].url} 
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-500">IMG</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 max-w-[140px] sm:max-w-[220px] truncate" title={product.title}>
                                {product.title}
                              </div>
                              {product.brand && (
                                <div className="text-xs text-gray-400">{product.brand}</div>
                              )}
                              <div className="text-xs text-gray-500 hidden sm:block">ID: {product._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          {product.inventory?.quantity || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-amazon-orange hover:text-orange-600"
                              onClick={() => openEdit(product)}
                              title="Edit product"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                              onClick={() => handleDelete(product)}
                              disabled={deleteMutation.isLoading}
                              title="Delete product"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Product</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditingProduct(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={submitEdit} className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    className="input-amazon"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-amazon"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    className="input-amazon"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">About this item (one per line)</label>
                  <textarea
                    className="input-amazon h-24"
                    value={form.featuresText}
                    onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attributes (Label: Value, per line)</label>
                  <textarea
                    className="input-amazon h-24"
                    value={form.attributesText}
                    onChange={(e) => setForm({ ...form, attributesText: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images (one URL per line)</label>
                  <textarea
                    className="input-amazon h-24"
                    value={form.imagesText}
                    onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variations (Name | option1, option2)</label>
                  <textarea
                    className="input-amazon h-24"
                    value={form.variationsText}
                    onChange={(e) => setForm({ ...form, variationsText: e.target.value })}
                    placeholder={`Color | Navy, Black, Gray\nStorage | 128GB, 256GB, 512GB\nStyle | S25, S25 Edge, S25 Ultra\nPattern Name | Phone Only, Phone w/ Buds 3 Pro`}
                  />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  className="btn-amazon-secondary"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-amazon disabled:opacity-50"
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProducts;
