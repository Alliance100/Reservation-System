"use client";

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      login(data.token, data.user);
      router.push('/supplier');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Supplier Portal</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your inventory and bookings.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Sign in to Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:block relative w-0 flex-1 bg-emerald-900">
        <div className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-multiply bg-[url('https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-center bg-cover" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h2 className="text-4xl font-black mb-6">Manage Your Business.</h2>
            <p className="text-xl text-emerald-100 font-medium">
              Join our network of eco-conscious travel partners and reach thousands of conscious travelers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
