"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';

// Synthesize pleasant notification chime using browser Web Audio API
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    /* Silent catch if audio policy requires gesture */
  }
}

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; desc: string; time: string; read: boolean }>>([]);
  const [newOrderAlert, setNewOrderAlert] = useState<{ id: string; customer: string; amount: number; time: string } | null>(null);
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(false);

  // Background live order polling every 10s for admin
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const checkIncomingOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${base}/admin/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const bookings = data.data;

          if (initialLoadRef.current) {
            const newOrders = bookings.filter((b: any) => !knownBookingIdsRef.current.has(b._id));
            if (newOrders.length > 0) {
              playNotificationChime();
              const latest = newOrders[0];
              setNewOrderAlert({
                id: latest._id,
                customer: latest.user?.name || "Customer",
                amount: latest.totalAmount || 0,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              });

              const newItems = newOrders.map((o: any) => ({
                id: o._id,
                title: `New Global Order #${o._id.slice(-6).toUpperCase()}`,
                desc: `${o.user?.name || 'Customer'} placed an order • $${o.totalAmount}`,
                time: "Just now",
                read: false
              }));
              setNotifications(prev => [...newItems, ...prev]);

              setTimeout(() => setNewOrderAlert(null), 6000);
            }
          }

          bookings.forEach((b: any) => knownBookingIdsRef.current.add(b._id));
          initialLoadRef.current = true;
        }
      } catch (e) {
        /* silent catch */
      }
    };

    checkIncomingOrders();
    const interval = setInterval(checkIncomingOrders, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Floating Order Alert Banner from Navbar */}
      {newOrderAlert && (
        <div
          onClick={() => {
            router.push('/admin');
            setNewOrderAlert(null);
          }}
          className="fixed top-24 right-6 z-50 max-w-sm w-full bg-emerald-950 text-white p-5 rounded-3xl shadow-2xl border-2 border-emerald-400 animate-bounce cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔔</span>
              <div>
                <h4 className="font-black text-emerald-300 text-sm">INCOMING PLATFORM ORDER!</h4>
                <p className="text-xs font-semibold text-white mt-0.5">{newOrderAlert.customer} placed a ${newOrderAlert.amount} booking</p>
                <p className="text-[10px] text-emerald-200 font-mono mt-1">Order #{newOrderAlert.id.slice(-6).toUpperCase()} • {newOrderAlert.time}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setNewOrderAlert(null); }}
              className="text-emerald-300 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-800/60 flex justify-between items-center text-xs">
            <span className="text-emerald-300 font-bold">Click to view in Admin panel</span>
            <span className="text-white font-black">Open →</span>
          </div>
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex w-full items-center justify-between">
              <div className="shrink-0 flex items-center">
                <Link href="/admin" className="flex items-center gap-2 group">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-200 group-hover:bg-emerald-500 transition-colors">
                    🍃
                  </div>
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">
                    Eco<span className="text-emerald-600 group-hover:text-emerald-500 transition-colors">Travel.</span>
                    <span className="ml-2 text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">Admin</span>
                  </span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                {!loading && (
                  <>
                    {user ? (
                      <div className="flex items-center space-x-5">
                        {/* Navbar Notification Bell Icon & Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all flex items-center justify-center"
                            title="Live Order Alerts"
                          >
                            <span className="text-xl">🔔</span>
                            {unreadCount > 0 && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-black bg-emerald-500 text-white rounded-full animate-pulse shadow-sm min-w-[18px] text-center leading-none">
                                {unreadCount}
                              </span>
                            )}
                          </button>

                          {/* Dropdown Menu */}
                          {showNotifications && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 text-gray-800 z-50 animate-in fade-in zoom-in-95">
                              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-gray-900 text-sm">System Order Alerts</span>
                                  {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      {unreadCount} new
                                    </span>
                                  )}
                                </div>
                                {notifications.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                    }}
                                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                                  >
                                    Mark all read
                                  </button>
                                )}
                              </div>

                              {notifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">
                                  <span className="text-3xl block mb-1">📭</span>
                                  <p className="text-xs font-semibold text-gray-500">No new alerts yet</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Platform orders will trigger live alerts here!</p>
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                  {notifications.map((n, i) => (
                                    <div
                                      key={i}
                                      onClick={() => {
                                        router.push('/admin');
                                        setShowNotifications(false);
                                      }}
                                      className={`p-3 rounded-2xl cursor-pointer transition-colors ${n.read ? 'bg-gray-50 hover:bg-gray-100/80' : 'bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/60'
                                        }`}
                                    >
                                      <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-xs font-black text-gray-900">{n.title}</p>
                                        <span className="text-[9px] text-gray-400 font-bold">{n.time}</span>
                                      </div>
                                      <p className="text-[11px] text-gray-600 font-medium">{n.desc}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="text-sm font-bold text-gray-900 hidden sm:block">
                          {user.name}
                        </span>

                        {user.role === 'admin' && (
                          <Link href="/admin" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={logout}
                          className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
