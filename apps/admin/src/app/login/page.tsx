"use client";

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.user?.role !== 'admin') {
        throw new Error(`Access Denied: Account (${data.user?.email}) has role "${data.user?.role}" and is not authorized to access the Admin Panel. Please sign in with an Admin account.`);
      }

      login(data.token, data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FBF9] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 transition-all">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
            🛡️ Master Control
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Admin Portal</h1>
          <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
            Sign in to manage platform operations, inventory, and users.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <p className="text-xs sm:text-sm text-red-700 font-bold leading-relaxed">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 text-left">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm font-bold transition-all placeholder:text-gray-400 placeholder:font-normal"
              placeholder="admin@ecotravel.com"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 text-left">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white text-sm font-bold transition-all placeholder:text-gray-400 placeholder:font-normal"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-purple-600/25 text-sm font-black text-white bg-purple-700 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer mt-2"
          >
            Sign In to Dashboard →
          </button>
        </form>

      </div>
    </div>
  );
}
