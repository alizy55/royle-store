import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

const TEST_ACCOUNTS = [
  { label: 'Admin', email: 'admin@royalstore.com', password: 'Admin@123' },
  { label: 'Seller', email: 'seller@royalstore.com', password: 'Seller@123' },
  { label: 'Customer', email: 'customer@royalstore.com', password: 'Customer@123' }
];

const extractErrorMessage = (error) => {
  const response = error.response?.data;

  if (Array.isArray(response?.errors) && response.errors.length) {
    return response.errors.map((item) => item.message || item).join(', ');
  }

  return response?.message || error.message || 'Unable to login. Confirm backend is running on port 5000.';
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const successNotice = location.state?.notice || '';

  const routeByRole = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/seller';
    return '/customer';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const payload = response.data || {};
      const user = payload?.data?.user || payload?.user;
      const token = payload?.data?.token || payload?.token;

      if (!payload.success || !user || !token) {
        throw new Error(payload.message || 'Invalid login response from server.');
      }

      dispatch(setCredentials({ user, token }));
      navigate(routeByRole(user.role));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 auth-grid-bg opacity-60" />
      <div className="pointer-events-none absolute -top-24 left-8 h-72 w-72 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-8 h-80 w-80 rounded-full bg-orange-300/40 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/50 bg-white/75 shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <aside className="hidden w-1/2 bg-slate-900 p-10 text-slate-100 md:flex md:flex-col">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">SMV-ECOM</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
              Smart Multi-Vendor
              <span className="mt-1 block text-cyan-300">Marketplace</span>
            </h1>
          </div>
        </aside>

        <main className="w-full p-7 sm:p-10 md:w-1/2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Welcome Back</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm text-slate-600">Continue as admin, seller, or customer.</p>

          {successNotice && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successNotice}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                placeholder="Enter your password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Quick Fill Accounts</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEST_ACCOUNTS.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-7 text-sm text-slate-600">
            No account yet?{' '}
            <Link to="/register" className="font-semibold text-cyan-700 hover:text-cyan-800">
              Create one
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}

export default Login;
