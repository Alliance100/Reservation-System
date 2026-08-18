"use client";
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPendingSuccess, setIsPendingSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'supplier' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setIsPendingSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  if (isPendingSuccess) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#F7FBF9] p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
            ⏳
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Application Received!</h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Your Supplier partner account has been created and is currently <span className="font-bold text-amber-800">waiting for Admin verification</span>.
            </p>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-900 text-left space-y-1.5 font-medium">
            <p className="font-bold">📋 Next Steps</p>
            <p>1. Platform administrator will review and verify your account.</p>
            <p>2. Once approved, you can log in to list hotels, buses, tours, and flights.</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              Go to Supplier Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3">
              📦 Supplier Partner
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Register as Supplier</h2>
            <p className="mt-1 text-sm text-gray-600 font-medium">
              Create an inventory management account. Subject to admin approval.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Company / Supplier Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  placeholder="Green Eco Resorts Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  placeholder="partner@example.com"
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

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <span>ℹ️</span> Admin Verification Policy
                </p>
                <p className="text-amber-800">
                  To ensure traveler safety and quality inventory, all new supplier accounts must be reviewed and approved by the platform administrator before access is activated.
                </p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all mt-4"
              >
                Submit Supplier Application →
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already verified?{' '}
              <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative w-0 flex-1 bg-emerald-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1542314831-c53cd4b85ca4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Supplier Network"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/40 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h3 className="text-3xl font-black mb-2">Partner with EcoTravel.</h3>
          <p className="text-emerald-50 text-lg">Join a verified network of sustainable hospitality, transport, and tour providers.</p>
        </div>
      </div>
    </div>
  );
}
