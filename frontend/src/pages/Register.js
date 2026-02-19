import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const extractErrorMessage = (error) => {
  const response = error.response?.data;

  if (Array.isArray(response?.errors) && response.errors.length) {
    return response.errors.map((item) => item.message || item).join(', ');
  }

  return response?.message || error.message || 'Registration failed. Please try again.';
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    storeName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const { name, email, password, confirmPassword, role, storeName } = formData;

    if (password !== confirmPassword) {
      setError('Password and confirm password must match.');
      return;
    }

    if (role === 'seller' && !storeName.trim()) {
      setError('Store name is required for seller registration.');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role
    };

    if (role === 'seller') {
      payload.storeName = storeName.trim();
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Registration failed');
      }

      navigate('/login', {
        state: { notice: 'Registration successful. You can login now.' }
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const roleButtonClass = (value) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      formData.role === value
        ? 'bg-slate-900 text-white'
        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
    }`;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 auth-grid-bg opacity-60" />
      <div className="pointer-events-none absolute -top-24 right-8 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-8 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/50 bg-white/75 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <aside className="hidden w-1/2 flex-col justify-between bg-slate-900 p-10 text-slate-100 md:flex">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">SMV-ECOM</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
              Build Your Seller
              <span className="mt-1 block text-amber-300">or Buyer Account</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-slate-300">
              Start as a customer or launch your store. The platform is ready for role-based workflows.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-5 text-sm text-slate-200">
            <p className="font-semibold text-white">MERN + JWT + Tailwind</p>
            <p className="mt-2">Registration is connected to backend validation and seller store metadata.</p>
          </div>
        </aside>

        <main className="w-full p-7 sm:p-10 md:w-1/2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Create Account</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Register</h2>
          <p className="mt-2 text-sm text-slate-600">Setup your access to the marketplace.</p>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Full Name
              <input
                type="text"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="Your full name"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="you@example.com"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Confirm Password
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(event) => handleChange('confirmPassword', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="Repeat password"
                  minLength={6}
                  required
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700">Role</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => handleChange('role', 'customer')} className={roleButtonClass('customer')}>
                  Customer
                </button>
                <button type="button" onClick={() => handleChange('role', 'seller')} className={roleButtonClass('seller')}>
                  Seller
                </button>
              </div>
            </div>

            {formData.role === 'seller' && (
              <label className="block text-sm font-medium text-slate-700">
                Store Name
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(event) => handleChange('storeName', event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="Enter your store name"
                  required
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-7 text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-amber-700 hover:text-amber-800">
              Login here
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}

export default Register;
