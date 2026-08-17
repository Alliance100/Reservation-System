"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex w-full items-center justify-between">
              <div className="shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200 group-hover:bg-emerald-500 transition-colors">
                    🍃
                  </div>
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">
                    Eco<span className="text-emerald-600 group-hover:text-emerald-500 transition-colors">Travel.</span>
                  </span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50 mr-2"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-emerald-500 rounded-full shadow-sm animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {!loading && (
                  <>
                    {user ? (
                      <div className="flex items-center space-x-6">
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">
                          Hello, <span className="font-bold text-gray-900">{user.name}</span>
                        </span>
                        
                        {user.role === 'admin' && (
                          <Link href="/admin" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'supplier' && (
                          <Link href="/supplier" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Supplier Dashboard
                          </Link>
                        )}
                        {user.role === 'customer' && (
                          <Link href="/bookings" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            My Bookings
                          </Link>
                        )}

                        <button
                          onClick={logout}
                          className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Link
                          href="/login"
                          className="text-sm font-bold text-gray-600 hover:text-emerald-600 px-4 py-2 transition-colors hidden sm:block"
                        >
                          Log in
                        </Link>
                        <Link
                          href="/register"
                          className="text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2.5 rounded-full transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
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

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
