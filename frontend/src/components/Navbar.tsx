"use client";
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex w-full items-center justify-between">
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200">
                  🍃
                </div>
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  Eco<span className="text-emerald-600">Travel.</span>
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center space-x-6">
                      <span className="text-sm font-medium text-gray-600">
                        Hello, <span className="font-bold text-gray-900">{user.name}</span>
                      </span>
                      <button
                        onClick={logout}
                        className="text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Link
                        href="/login"
                        className="text-sm font-bold text-gray-600 hover:text-emerald-600 px-4 py-2 transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        className="text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2.5 rounded-full transition-all shadow-md shadow-emerald-200 hover:shadow-lg"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
