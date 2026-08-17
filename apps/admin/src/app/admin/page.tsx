"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCoupon, setNewCoupon] = useState({ code: "", discountType: "percentage", discountValue: 10, expiryDate: "" });
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/");
      else fetchAdminData();
    }
  }, [user, authLoading, router]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const h = { Authorization: `Bearer ${token}` };
      const opts = { cache: "no-store" as RequestCache };
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const [sR, uR, bR, cR] = await Promise.all([
        fetch(`${base}/admin/stats`, { headers: h, ...opts }),
        fetch(`${base}/admin/users`, { headers: h, ...opts }),
        fetch(`${base}/admin/bookings`, { headers: h, ...opts }),
        fetch(`${base}/admin/coupons`, { headers: h, ...opts }),
      ]);
      const [sD, uD, bD, cD] = await Promise.all([sR.json(), uR.json(), bR.json(), cR.json()]);
      if (sD.success) setStats(sD.data);
      if (uD.success) setUsers(uD.data);
      if (bD.success) setBookings(bD.data);
      if (cD.success) setCoupons(cD.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const api = async (url: string, method = "GET", body?: object) => {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return res.json();
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/users/${id}`, "DELETE");
    if (data.success) setUsers(users.filter(u => u._id !== id));
    else alert(data.message);
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/users/${id}/role`, "PUT", { role });
    if (data.success) setUsers(users.map(u => u._id === id ? { ...u, role: data.data.role } : u));
    else alert(data.message);
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/bookings/${id}/status`, "PUT", { status });
    if (data.success) setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
    else alert(data.message);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg("");
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/coupons`, "POST", newCoupon);
    if (data.success) {
      setCoupons([data.data, ...coupons]);
      setNewCoupon({ code: "", discountType: "percentage", discountValue: 10, expiryDate: "" });
      setCouponMsg("success");
    } else {
      setCouponMsg(`error:${data.message}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/coupons/${id}`, "DELETE");
    if (data.success) setCoupons(coupons.filter(c => c._id !== id));
    else alert(data.message);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] pt-24 px-4 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const inp = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none";
  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "users", label: "👥 Users" },
    { id: "bookings", label: "📅 Bookings" },
    { id: "coupons", label: "🎟️ Coupons" },
  ];

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-emerald-100 text-emerald-800" :
    s === "cancelled" ? "bg-red-100 text-red-800" :
    s === "completed" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="min-h-screen bg-[#F7FBF9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-28">
            <h2 className="text-xl font-black text-gray-900 mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? "bg-emerald-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-50"}`}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-medium mb-6">{error}</div>}

          {activeTab === "overview" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Overview</h1>
                <p className="text-gray-500 font-medium">Platform overview and global statistics.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: "💰", label: "Total Revenue", value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`, bg: "bg-emerald-100 text-emerald-600" },
                  { icon: "📅", label: "Total Bookings", value: stats?.totalBookings || 0, bg: "bg-blue-100 text-blue-600" },
                  { icon: "👥", label: "Registered Users", value: stats?.totalUsers || 0, bg: "bg-purple-100 text-purple-600" },
                  { icon: "🎟️", label: "Active Coupons", value: stats?.totalCoupons || 0, bg: "bg-orange-100 text-orange-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-xl mb-4`}>{s.icon}</div>
                    <p className="text-gray-500 text-sm font-bold mb-1">{s.label}</p>
                    <h3 className="text-3xl font-black text-gray-900">{s.value}</h3>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Manage Users ({users.length})</h2>
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
                      <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="py-4 font-bold text-gray-900">{u.name}</td>
                        <td className="py-4 text-gray-600 text-sm">{u.email}</td>
                        <td className="py-4">
                          {user?._id === u._id ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">{u.role.toUpperCase()} (You)</span>
                          ) : (
                            <select value={u.role} onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                              className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer">
                              <option value="customer">CUSTOMER</option>
                              <option value="supplier">SUPPLIER</option>
                              <option value="admin">ADMIN</option>
                            </select>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleDeleteUser(u._id)} disabled={user?._id === u._id}
                            className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30">
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

          {activeTab === "bookings" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Global Bookings ({bookings.length})</h2>
              <div className="space-y-4">
                {bookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
                {bookings.map((booking) => (
                  <div key={booking._id} className="p-6 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gray-50/50">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(booking.status)}`}>{booking.status.toUpperCase()}</span>
                        <span className="text-gray-500 font-medium text-sm">Order #{booking._id.slice(-8).toUpperCase()}</span>
                      </div>
                      <p className="text-gray-900 font-bold">{booking.user?.name || "Guest"} <span className="text-gray-400 font-normal text-sm">({booking.user?.email})</span></p>
                      <p className="text-gray-500 text-sm mt-1">{booking.items.length} item(s) • <span className="font-bold text-gray-700">${booking.totalAmount.toFixed(2)}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                        disabled={["confirmed","cancelled","completed"].includes(booking.status)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-40">Confirm</button>
                      <button onClick={() => handleUpdateBookingStatus(booking._id, "completed")}
                        disabled={booking.status !== "confirmed"}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-40">Complete</button>
                      <button onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                        disabled={["cancelled","completed"].includes(booking.status)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-40">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "coupons" && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Create New Coupon</h2>
                {couponMsg === "success" && <p className="mb-4 text-emerald-600 font-bold">✅ Coupon created successfully!</p>}
                {couponMsg.startsWith("error:") && <p className="mb-4 text-red-600 font-bold">❌ {couponMsg.replace("error:", "")}</p>}
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Coupon Code</label>
                    <input type="text" placeholder="e.g. SAVE20" required value={newCoupon.code}
                      onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className={`${inp} font-mono font-bold uppercase`} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount Type</label>
                    <select value={newCoupon.discountType} onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })} className={inp}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount Value</label>
                    <input type="number" min="1" required value={newCoupon.discountValue}
                      onChange={e => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date (optional)</label>
                    <input type="date" value={newCoupon.expiryDate}
                      onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} className={inp} />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">+ Create Coupon</button>
                  </div>
                </form>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-6">All Coupons ({coupons.length})</h2>
                {coupons.length === 0 && <p className="text-gray-500">No coupons yet.</p>}
                <div className="space-y-3">
                  {coupons.map(coupon => (
                    <div key={coupon._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-black text-gray-900 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg text-sm tracking-widest">{coupon.code}</span>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{coupon.discountType === "percentage" ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}</p>
                          <p className="text-gray-400 text-xs">{coupon.expiryDate ? `Expires: ${new Date(coupon.expiryDate).toLocaleDateString()}` : "No expiry"}{!coupon.isActive && <span className="ml-2 text-red-400 font-bold"> • INACTIVE</span>}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
