import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import authAPI from '../services/authAPI';
import toast from 'react-hot-toast';

const ProfileSettingsPage = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authAPI.getUserProfile();
        const u = res?.data?.data?.user || res?.data?.user;
        if (u) {
          setFirstName(u.firstName || '');
          setLastName(u.lastName || '');
          setEmail(u.email || '');
        }
      } catch (_) {}
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authAPI.updateUserProfile({ firstName, lastName, email });
      toast.success('Profile updated', { duration: 1500 });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Account Settings - Amazon Clone</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Account Settings</h1>
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange" />
          </div>
          <button type="submit" disabled={saving} className="bg-amazon-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;


