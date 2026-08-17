"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, coupons, bookings
  const [stats, setStats] = useState<any>(null);
  
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== 'admin') {
        router.push("/");
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/bookings`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data);
      if (bookingsData.success) setBookings(bookingsData.data);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== id));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Error deleting user");
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Error updating booking");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] pt-24 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBF9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28">
            <h2 className="text-xl font-black text-gray-900 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                📊 Overview
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                👥 Users
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                📅 Global Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium mb-6">
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Overview</h1>
                <p className="text-gray-500 font-medium">Platform overview and global statistics.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4">💰</div>
                  <p className="text-gray-500 text-sm font-bold mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-black text-gray-900">${stats?.totalRevenue.toFixed(2) || '0.00'}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-4">📅</div>
                  <p className="text-gray-500 text-sm font-bold mb-1">Total Bookings</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats?.totalBookings || 0}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl mb-4">👥</div>
                  <p className="text-gray-500 text-sm font-bold mb-1">Registered Users</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats?.totalUsers || 0}</h3>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Manage Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                      <th className="pb-4 font-bold">Name</th>
                      <th className="pb-4 font-bold">Email</th>
                      <th className="pb-4 font-bold">Role</th>
                      <th className="pb-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 font-bold text-gray-900">{u.name}</td>
                        <td className="py-4 text-gray-600">{u.email}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'supplier' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={user._id === u._id}
                            className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Global Bookings</h2>
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="p-6 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50/50">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                        <span className="text-gray-500 font-medium text-sm">Order #{booking._id.slice(-8)}</span>
                      </div>
                      <p className="text-gray-900 font-bold mb-1">{booking.user?.name || 'Guest'}</p>
                      <p className="text-gray-500 text-sm">{booking.items.length} items • ${booking.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                        disabled={booking.status === 'confirmed' || booking.status === 'cancelled'}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                        disabled={booking.status === 'cancelled'}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
