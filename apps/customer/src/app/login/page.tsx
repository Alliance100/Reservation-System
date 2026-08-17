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
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your eco-friendly bookings.
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
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all"
              >
                Sign In
              </button>
            </form>
            
            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-500">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-0 flex-1 bg-emerald-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80"
          alt="Forest"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/40 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h3 className="text-3xl font-black mb-2">Travel with Purpose</h3>
          <p className="text-emerald-50 text-lg">Every booking on EcoTravel contributes to carbon offset initiatives and local community development.</p>
        </div>
      </div>
    </div>
  );
}
