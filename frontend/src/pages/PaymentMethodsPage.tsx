import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import authAPI from '../services/authAPI';
import toast from 'react-hot-toast';

type Method = { _id: string; type: 'card'|'paypal'|'amazon_pay'; cardNumber?: string; expiryMonth?: string; expiryYear?: string; cardHolderName?: string; isDefault?: boolean };

const PaymentMethodsPage = () => {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Method>>({ type: 'card' });

  const load = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getPaymentMethods();
      setMethods(res?.data?.data?.paymentMethods || res?.data?.paymentMethods || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdding(true);
      const payload = { ...form } as any;
      // only keep last 4 for storage in this demo
      if (payload.cardNumber) payload.cardNumber = String(payload.cardNumber).slice(-4);
      await authAPI.addPaymentMethod(payload);
      toast.success('Payment method added', { duration: 1500 });
      setForm({ type: 'card' });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await authAPI.updatePaymentMethod(id, { isDefault: true });
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to set default');
    }
  };

  const removeMethod = async (id: string) => {
    try {
      await authAPI.deletePaymentMethod(id);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to remove');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Your Payment Methods - NexaCart</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your Payment Methods</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="space-y-4">
              {methods.map((m) => (
                <div key={m._id} className="flex items-center justify-between border border-gray-200 rounded-md p-4">
                  <div>
                    <div className="text-gray-900 font-medium">
                      {m.type === 'card' ? `Card •••• ${m.cardNumber}` : m.type === 'paypal' ? 'PayPal' : 'NexaCart Pay'}
                    </div>
                    {m.expiryMonth && m.expiryYear && (
                      <div className="text-sm text-gray-600">Exp {m.expiryMonth}/{m.expiryYear}</div>
                    )}
                    {m.cardHolderName && (
                      <div className="text-sm text-gray-600">{m.cardHolderName}</div>
                    )}
                    {m.isDefault && (
                      <div className="text-xs text-green-700 font-medium">Default</div>
                    )}
                  </div>
                  <div className="space-x-2">
                    {!m.isDefault && (
                      <button onClick={() => setDefault(m._id)} className="text-sm border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50">Set default</button>
                    )}
                    <button onClick={() => removeMethod(m._id)} className="text-sm border border-gray-300 rounded-md px-3 py-1 hover:bg-gray-50">Remove</button>
                  </div>
                </div>
              ))}
              {methods.length === 0 && (
                <div className="text-gray-600">No payment methods yet.</div>
              )}
            </div>
          )}

          <form onSubmit={addMethod} className="mt-6 border-t border-gray-200 pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select value={form.type as any} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange">
                  <option value="card">Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="amazon_pay">NexaCart Pay</option>
                </select>
              </div>
              {form.type === 'card' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Card holder name</label>
                  <input value={form.cardHolderName || ''} onChange={(e) => setForm((p) => ({ ...p, cardHolderName: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
                </div>
              )}
              {form.type === 'card' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Card number</label>
                  <input value={form.cardNumber || ''} onChange={(e) => setForm((p) => ({ ...p, cardNumber: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
                </div>
              )}
              {form.type === 'card' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Expiry Month</label>
                    <input value={form.expiryMonth || ''} onChange={(e) => setForm((p) => ({ ...p, expiryMonth: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Expiry Year</label>
                    <input value={form.expiryYear || ''} onChange={(e) => setForm((p) => ({ ...p, expiryYear: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
                  </div>
                </div>
              )}
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))} />
              Set as default
            </label>
            <div>
              <button type="submit" disabled={adding} className="bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-60">{adding ? 'Adding...' : 'Add payment method'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;


