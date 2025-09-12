import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import authAPI from '../services/authAPI';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('If that email exists, we sent a reset link');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - NexaCart</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white w-full max-w-md rounded-md shadow p-6">
          <h1 className="text-xl font-bold mb-4">Forgot your password?</h1>
          <p className="text-sm text-gray-600 mb-4">Enter your email and we'll send you a link to reset your password.</p>
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="you@example.com"
            />
            <button type="submit" disabled={loading} className="w-full bg-amazon-orange text-white rounded px-3 py-2 disabled:opacity-60">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;


