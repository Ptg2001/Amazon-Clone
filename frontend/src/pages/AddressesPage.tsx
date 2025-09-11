import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import authAPI from '../services/authAPI';
import toast from 'react-hot-toast';

type Address = {
  _id?: string;
  type?: 'home'|'work'|'other';
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
};

const AddressesPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Address>({ type: 'home', country: 'US' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getUserProfile();
      const u = res?.data?.data?.user || res?.data?.user;
      setAddresses(u?.addresses || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authAPI.addAddress(form);
      setForm({ type: 'home', country: 'US' });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id?: string) => {
    if (!id) return;
    try {
      await authAPI.updateAddress(id, { isDefault: true });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to set default');
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    try {
      await authAPI.deleteAddress(id);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to remove address');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Your Addresses - Amazon Clone</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your Addresses</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((a) => (
                <div key={a._id} className="border border-gray-200 rounded-md p-4">
                  <div className="font-medium text-gray-900">{a.firstName} {a.lastName}</div>
                  <div className="text-sm text-gray-700">{a.address1}{a.address2 ? `, ${a.address2}` : ''}</div>
                  <div className="text-sm text-gray-700">{a.city}, {a.state} {a.zipCode}</div>
                  <div className="text-sm text-gray-700">{a.country}</div>
                  {a.phone && <div className="text-sm text-gray-700">{a.phone}</div>}
                  {a.isDefault && <div className="text-xs text-green-700 font-medium mt-1">Default</div>}
                  <div className="mt-3 space-x-2">
                    {!a.isDefault && <button onClick={() => setDefault(a._id)} className="text-sm border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50">Set default</button>}
                    <button onClick={() => remove(a._id)} className="text-sm border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50">Remove</button>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="text-gray-600">No addresses yet.</div>
              )}
            </div>
          )}

          <form onSubmit={add} className="mt-6 border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">First name</label>
              <input value={form.firstName || ''} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Last name</label>
              <input value={form.lastName || ''} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Address line 1</label>
              <input value={form.address1 || ''} onChange={(e) => setForm((p) => ({ ...p, address1: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Address line 2</label>
              <input value={form.address2 || ''} onChange={(e) => setForm((p) => ({ ...p, address2: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">City</label>
              <input value={form.city || ''} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">State</label>
              <input value={form.state || ''} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Zip code</label>
              <input value={form.zipCode || ''} onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Country</label>
              <input value={form.country || ''} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Phone</label>
              <input value={form.phone || ''} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
            </div>
            <label className="inline-flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
              Set as default address
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className="bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-60">{saving ? 'Saving...' : 'Add address'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;


