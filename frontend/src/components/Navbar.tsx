"use client";
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex w-full items-center justify-between">
            <div className="shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black text-emerald-600 tracking-tighter">
                EcoTravel.
              </Link>
            </div>
            
            {!loading && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
                {user ? (
                  <>
                    <span className="text-gray-700 text-sm font-medium px-1">
                      Hello, {user.name} ({user.role})
                    </span>
                    <button
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium ml-4"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
