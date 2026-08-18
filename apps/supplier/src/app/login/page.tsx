"use client";

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsPending(false);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.isPendingVerification) {
          setIsPending(true);
        }
        throw new Error(data.message || 'Login failed');
      }

      if (data.user?.role !== 'supplier' && data.user?.role !== 'admin') {
        throw new Error('Access Denied: This portal is reserved for registered supplier partners.');
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3">
              📦 Supplier Portal
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Partner Sign In</h2>
            <p className="mt-1 text-sm text-gray-600 font-medium">
              Sign in to manage your inventory, bookings, and analytics.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className={`p-4 rounded-2xl border ${
                  isPending 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base">{isPending ? '⏳' : '⚠️'}</span>
                    <div>
                      <p className="text-xs font-bold leading-relaxed">{error}</p>
                      {isPending && (
                        <p className="text-[11px] text-amber-700 mt-1">
                          Please wait for the platform administrator to verify your credentials.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm font-bold transition-all"
                  placeholder="partner@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm font-bold transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-600/20 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer mt-2"
              >
                Sign In to Supplier Hub →
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600 font-medium">
              Want to become a partner?{' '}
              <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-500">
                Register here
              </Link>
            </p>
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
