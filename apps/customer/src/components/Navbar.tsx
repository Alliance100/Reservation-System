"use client";
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  const handleNavClick = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group" onClick={handleNavClick}>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg shadow-emerald-200 group-hover:bg-emerald-500 transition-colors">
                  🍃
                </div>
                <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter">
                  Eco<span className="text-emerald-600 group-hover:text-emerald-500 transition-colors">Travel.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav Actions */}
            <div className="hidden sm:flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
                aria-label="Open cart"
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
                    <div className="flex items-center space-x-5">
                      <span className="text-sm font-bold text-gray-900 hidden md:block">
                        {user.name}
                      </span>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                          Admin
                        </Link>
                      )}
                      {user.role === 'supplier' && (
                        <Link href="/supplier" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                          Supplier Dashboard
                        </Link>
                      )}
                      {user.role === 'customer' && (
                        <>
                          <Link href="/bookings" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            My Bookings
                          </Link>
                          <Link href="/profile" className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
                            Profile
                          </Link>
                        </>
                      )}
                      <button
                        onClick={logout}
                        className="text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
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
                        className="text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-full transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
                aria-label="Open cart"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-emerald-500 rounded-full shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 text-gray-700 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md shadow-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <div className="px-3 py-2 bg-emerald-50 rounded-xl mb-2">
                        <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                        <p className="font-black text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={handleNavClick}
                          className="block px-3 py-3 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                          🛡️ Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'supplier' && (
                        <Link href="/supplier" onClick={handleNavClick}
                          className="block px-3 py-3 rounded-xl text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors">
                          📦 Supplier Dashboard
                        </Link>
                      )}
                      {user.role === 'customer' && (
                        <>
                          <Link href="/bookings" onClick={handleNavClick}
                            className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            🎫 My Bookings
                          </Link>
                          <Link href="/profile" onClick={handleNavClick}
                            className="block px-3 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            👤 Profile
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={() => { logout(); handleNavClick(); }}
                          className="w-full text-left px-3 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <Link href="/login" onClick={handleNavClick}
                        className="block w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                        Log in
                      </Link>
                      <Link href="/register" onClick={handleNavClick}
                        className="block w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-200">
                        Sign up — It's Free
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
