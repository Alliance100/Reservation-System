"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait until auth state is known

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/my-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.success) {
          setBookings(data.data);
        } else {
          setError(data.message || "Failed to load bookings");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, authLoading, router]);

  const handleCancelBooking = async (id: string) => {
    if (!confirm("Are you sure you want to request a cancellation? This will restore inventory.")) return;
    
    setCancelLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/bookings/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    } finally {
      setCancelLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] pt-24 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBF9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">My Bookings</h1>
            <p className="text-gray-500 font-medium">Manage your upcoming and past eco-travel adventures.</p>
          </div>
          <Link href="/" className="hidden sm:inline-flex px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl shadow-sm transition-all">
            Book New Trip
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium mb-8">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6 opacity-50">🌍</div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">No bookings yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't made any reservations. Ready to explore the world sustainably?</p>
            <Link href="/" className="inline-flex px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-1">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'confirmed' || booking.status === 'pending' ? 'bg-emerald-100 text-emerald-800' : 
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-sm font-medium">
                        Order #{booking._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-sm font-medium">
                        • {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {booking.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                            {item.itemType === 'hotel' ? '🏨' : item.itemType === 'bus' ? '🚌' : item.itemType === 'flight' ? '✈️' : '🗺️'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                            <p className="text-gray-500 text-sm font-medium">{item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)} • Qty: {item.quantity}</p>
                          </div>
                          <div className="ml-auto font-black text-gray-900">
                            ${item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:w-64 bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-bold mb-1">Total Paid</p>
                      <p className="text-3xl font-black text-gray-900 mb-6">${booking.totalAmount.toFixed(2)}</p>
                    </div>

                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <button 
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancelLoading === booking._id}
                        className="w-full py-3 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {cancelLoading === booking._id ? "Cancelling..." : "Request Cancellation"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
