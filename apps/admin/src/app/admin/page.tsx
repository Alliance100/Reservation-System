"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

// CSV Export Utility
function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
    [headers.map(escapeCell).join(','), ...rows.map(row => row.map(escapeCell).join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, bookings, coupons
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [couponSearch, setCouponSearch] = useState("");

  // Pagination state
  const [bookingPage, setBookingPage] = useState(1);
  const bookingsPerPage = 6;

  // Dynamic Chart Controls
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Coupon Creation state
  const [newCoupon, setNewCoupon] = useState({ code: "", discountType: "percentage", discountValue: 10, expiryDate: "" });
  const [couponMsg, setCouponMsg] = useState("");

  // Edit Coupon Modal State
  const [editingCoupon, setEditingCoupon] = useState<{
    _id: string;
    code: string;
    discountType: string;
    discountValue: number;
    expiryDate: string;
    isActive: boolean;
  } | null>(null);
  const [editCouponMsg, setEditCouponMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/");
      else fetchAdminData(false);
    }
  }, [user, authLoading, router]);

  const fetchAdminData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
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

      if (manual) {
        showToast("✓ Admin platform data refreshed!");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
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
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/users/${id}`, "DELETE");
    if (data.success) {
      setUsers(users.filter(u => u._id !== id));
      showToast("User account removed");
    } else {
      alert(data.message);
    }
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/users/${id}/role`, "PUT", { role });
    if (data.success) {
      setUsers(users.map(u => u._id === id ? { ...u, role: data.data.role } : u));
      showToast(`User role updated to ${role.toUpperCase()}`);
    } else {
      alert(data.message);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/bookings/${id}/status`, "PUT", { status });
    if (data.success) {
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      showToast(`Booking marked as ${status.toUpperCase()}`);
    } else {
      alert(data.message);
    }
  };

  const handleVerifySupplier = async (id: string, status: 'approved' | 'rejected') => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/users/${id}/verify`, "PUT", { status });
    if (data.success) {
      setUsers(users.map(u => u._id === id ? { ...u, isVerified: status === 'approved', verificationStatus: status } : u));
      showToast(status === 'approved' ? "✓ Supplier account approved and activated!" : "✕ Supplier application rejected");
    } else {
      alert(data.message);
    }
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
      showToast("Coupon created and activated!");
    } else {
      setCouponMsg(`error:${data.message}`);
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setEditCouponMsg("");
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/coupons/${editingCoupon._id}`, "PUT", {
      code: editingCoupon.code.toUpperCase(),
      discountType: editingCoupon.discountType,
      discountValue: editingCoupon.discountValue,
      expiryDate: editingCoupon.expiryDate ? editingCoupon.expiryDate : null,
      isActive: editingCoupon.isActive,
    });
    if (data.success) {
      setCoupons(coupons.map(c => c._id === editingCoupon._id ? data.data : c));
      setEditingCoupon(null);
      showToast("Coupon updated successfully!");
    } else {
      setEditCouponMsg(`error:${data.message || "Failed to update coupon"}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon code?")) return;
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const data = await api(`${base}/admin/coupons/${id}`, "DELETE");
    if (data.success) {
      setCoupons(coupons.filter(c => c._id !== id));
      showToast("Coupon deleted");
    } else {
      alert(data.message);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // CSV Exports for Admin
  const exportBookingsCSV = () => {
    const headers = ["Order ID", "Traveler Name", "Email", "Status", "Items Count", "Scheduled Dates & Times", "Total Amount ($)", "Date Created"];
    const rows = filteredBookings.map(b => [
      b._id,
      b.user?.name || "Guest",
      b.user?.email || "N/A",
      b.status.toUpperCase(),
      b.items?.length || 0,
      b.items?.map((i: any) => `${i.name} [${i.selectedDate || i.details?.selectedDate || 'N/A'} @ ${i.selectedTime || i.details?.selectedTime || 'N/A'}]`).join("; "),
      b.totalAmount.toFixed(2),
      new Date(b.createdAt).toLocaleDateString()
    ]);
    downloadCSV(`Admin_Global_Bookings_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast("✓ Global Bookings CSV exported!");
  };

  const exportUsersCSV = () => {
    const headers = ["User ID", "Name", "Email", "Role", "Joined Date"];
    const rows = filteredUsers.map(u => [
      u._id,
      u.name,
      u.email,
      u.role.toUpperCase(),
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"
    ]);
    downloadCSV(`Admin_Users_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast("✓ Platform Users CSV exported!");
  };

  const exportCouponsCSV = () => {
    const headers = ["Coupon Code", "Discount Type", "Discount Value", "Status", "Expiry Date"];
    const rows = filteredCoupons.map(c => [
      c.code,
      c.discountType.toUpperCase(),
      c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`,
      c.isActive ? "ACTIVE" : "DISABLED",
      c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "NEVER"
    ]);
    downloadCSV(`Admin_Coupons_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast("✓ Promo Coupons CSV exported!");
  };

  // Pending Suppliers Count
  const pendingSuppliersCount = useMemo(() => {
    return users.filter(u => u.role === 'supplier' && (u.verificationStatus === 'pending' || u.isVerified === false)).length;
  }, [users]);

  // Filtered lists
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      let matchRole = true;
      if (userRoleFilter === 'pending_supplier') {
        matchRole = u.role === 'supplier' && (u.verificationStatus === 'pending' || u.isVerified === false);
      } else if (userRoleFilter !== 'all') {
        matchRole = u.role === userRoleFilter;
      }
      const matchSearch = !userSearch || 
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email?.toLowerCase().includes(userSearch.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, userRoleFilter, userSearch]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      const matchSearch = !bookingSearch ||
        b._id?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.user?.name?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.user?.email?.toLowerCase().includes(bookingSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [bookings, bookingStatusFilter, bookingSearch]);

  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const paginatedBookings = useMemo(() => {
    const start = (bookingPage - 1) * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, bookingPage, bookingsPerPage]);

  useEffect(() => {
    setBookingPage(1);
  }, [bookingSearch, bookingStatusFilter]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      return !couponSearch || c.code?.toLowerCase().includes(couponSearch.toLowerCase());
    });
  }, [coupons, couponSearch]);

  // Dynamic Chart Computation for Admin
  const chartData = useMemo(() => {
    const buckets: { label: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    if (chartTimeframe === '7d') {
      // 7 Days: Clean weekday or short date (e.g. Aug 12, Aug 13, ...)
      for (let i = 6; i >= 0; i--) {
        const d = new Date(startOfToday - i * MS_PER_DAY);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        buckets.push({ label, revenue: 0, orders: 0 });
      }

      bookings.forEach(b => {
        if (b.status === 'cancelled') return;
        const bDate = new Date(b.createdAt);
        if (isNaN(bDate.getTime())) return;
        const amount = Number(b.totalAmount) || 0;
        const bStartDay = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime();
        const diffDays = Math.round((startOfToday - bStartDay) / MS_PER_DAY);
        if (diffDays >= 0 && diffDays < 7) {
          const idx = 6 - diffDays;
          if (buckets[idx]) {
            buckets[idx].revenue += amount;
            buckets[idx].orders += 1;
          }
        }
      });
    } else if (chartTimeframe === '30d') {
      // 30 Days: 6 clean 5-day intervals
      for (let i = 5; i >= 0; i--) {
        const d = new Date(startOfToday - (i * 6) * MS_PER_DAY);
        const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        buckets.push({ label, revenue: 0, orders: 0 });
      }

      bookings.forEach(b => {
        if (b.status === 'cancelled') return;
        const bDate = new Date(b.createdAt);
        if (isNaN(bDate.getTime())) return;
        const amount = Number(b.totalAmount) || 0;
        const bStartDay = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate()).getTime();
        const diffDays = Math.round((startOfToday - bStartDay) / MS_PER_DAY);
        if (diffDays >= 0 && diffDays < 30) {
          const idx = Math.min(5, Math.floor((29 - diffDays) / 5));
          if (buckets[idx]) {
            buckets[idx].revenue += amount;
            buckets[idx].orders += 1;
          }
        }
      });
    } else {
      // All Time: 6 Monthly intervals
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        buckets.push({ label, revenue: 0, orders: 0 });
      }

      bookings.forEach(b => {
        if (b.status === 'cancelled') return;
        const bDate = new Date(b.createdAt);
        if (isNaN(bDate.getTime())) return;
        const amount = Number(b.totalAmount) || 0;
        const diffMonths = (now.getFullYear() - bDate.getFullYear()) * 12 + (now.getMonth() - bDate.getMonth());
        if (diffMonths >= 0 && diffMonths < 6) {
          const idx = 5 - diffMonths;
          if (buckets[idx]) {
            buckets[idx].revenue += amount;
            buckets[idx].orders += 1;
          }
        }
      });
    }

    const values = buckets.map(b => chartMetric === 'revenue' ? b.revenue : b.orders);
    const maxVal = Math.max(...values, chartMetric === 'revenue' ? 100 : 5);
    const totalPeriodRevenue = buckets.reduce((s, b) => s + b.revenue, 0);
    const totalPeriodOrders = buckets.reduce((s, b) => s + b.orders, 0);
    const peakValue = Math.max(...values, 0);

    const points = buckets.map((b, i) => {
      const val = chartMetric === 'revenue' ? b.revenue : b.orders;
      const x = buckets.length > 1 ? (i / (buckets.length - 1)) * 460 + 20 : 250;
      const normalizedY = maxVal > 0 ? val / maxVal : 0;
      const y = 110 - (normalizedY * 85);
      return { ...b, val, x, y };
    });

    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x},${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX1 = prev.x + (curr.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (curr.x - prev.x) / 2;
        const cpY2 = curr.y;
        pathD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${curr.x},${curr.y}`;
      }
    }

    let areaD = "";
    if (points.length > 0) {
      const firstX = points[0].x;
      const lastX = points[points.length - 1].x;
      areaD = `${pathD} L ${lastX},110 L ${firstX},110 Z`;
    }

    return { buckets, points, pathD, areaD, maxVal, totalPeriodRevenue, totalPeriodOrders, peakValue };
  }, [bookings, chartTimeframe, chartMetric]);

  // Status breakdown calculations
  const statusStats = useMemo(() => {
    const total = bookings.length || 1;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return {
      confirmed: { count: confirmed, pct: Math.round((confirmed / total) * 100) },
      completed: { count: completed, pct: Math.round((completed / total) * 100) },
      pending: { count: pending, pct: Math.round((pending / total) * 100) },
      cancelled: { count: cancelled, pct: Math.round((cancelled / total) * 100) },
    };
  }, [bookings]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] pt-32 px-4 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500 text-sm animate-pulse">Loading Admin Control Center...</p>
      </div>
    );
  }

  const inp = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium";
  const tabs = [
    { id: "overview", label: "📊 Overview & Trends", count: null },
    { id: "users", label: "👥 Users", count: users.length },
    { id: "bookings", label: "📅 Global Bookings", count: bookings.length },
    { id: "coupons", label: "🎟️ Promo Coupons", count: coupons.length },
  ];

  const statusColor = (s: string) =>
    s === "confirmed" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
    s === "cancelled" ? "bg-red-100 text-red-800 border-red-200" :
    s === "completed" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-24 pt-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="text-sm font-semibold">{notification}</span>
        </div>
      )}

      {/* Hero Welcome Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-900 p-8 sm:p-10 text-white shadow-xl shadow-gray-950/10">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-500/30 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                System Master Control • Live Order Sync
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                Platform Administration
              </h1>
              <p className="text-gray-300 font-medium text-sm sm:text-base max-w-xl">
                Global governance for users, reservations, promo discount engines, CSV reporting, and multi-category metrics.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAdminData(true)}
                disabled={isRefreshing}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
                <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 text-sm"
                title="Sign out"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 sticky top-8 space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider px-3 mb-2">Control Tabs</p>
              {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                    activeTab === tab.id 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center gap-3">{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                      activeTab === tab.id ? "bg-emerald-700 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}

              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                <button
                  onClick={exportBookingsCSV}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <span>📥</span> Export Bookings CSV
                </button>
                <button
                  onClick={exportUsersCSV}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <span>📥</span> Export Users CSV
                </button>
                <button
                  onClick={exportCouponsCSV}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <span>📥</span> Export Coupons CSV
                </button>
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-3 rounded-xl border border-red-100 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors mt-2"
                >
                  <span>🚪</span> Logout Admin
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-8">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 font-medium text-sm flex items-center gap-3">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { icon: "💰", label: "Total Revenue", value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`, note: "Platform wide gross", bg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" },
                    { icon: "📅", label: "Total Bookings", value: stats?.totalBookings || 0, note: "All categories", bg: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300" },
                    { icon: "👥", label: "Registered Users", value: stats?.totalUsers || 0, note: "Customers & Suppliers", bg: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300" },
                    { icon: "🎟️", label: "Active Coupons", value: stats?.totalCoupons || 0, note: "Promo campaigns", bg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300" },
                  ].map((s, i) => (
                    <div key={i} className="h-full bg-white dark:bg-[#13201b] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1f332b] card-interactive flex flex-col justify-between group">
                      <div>
                        <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                          {s.icon}
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1">{s.value}</h3>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{s.note}</p>
                    </div>
                  ))}
                </div>

                {/* Dynamic SVG Financial Trajectory & Platform Volume Chart */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
                        <h2 className="text-xl font-black text-gray-900">
                          {chartMetric === 'revenue' ? 'Platform Gross Revenue Trajectory' : 'Global Order Volume'}
                        </h2>
                      </div>
                      <p className="text-gray-400 text-xs font-medium">
                        Live aggregate metrics computed from {bookings.length} platform transaction{bookings.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Chart Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Metric Toggle */}
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                          onClick={() => setChartMetric('revenue')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            chartMetric === 'revenue' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          💰 Revenue ($)
                        </button>
                        <button
                          onClick={() => setChartMetric('orders')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            chartMetric === 'orders' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🛒 Transactions
                        </button>
                      </div>

                      {/* Timeframe Toggle */}
                      <div className="flex bg-gray-100 dark:bg-[#162620] p-1 rounded-xl">
                        {[
                          { id: '7d', label: '7 Days' },
                          { id: '30d', label: '30 Days' },
                          { id: 'all', label: 'All Time' },
                        ].map((tf) => (
                          <button
                            key={tf.id}
                            onClick={() => setChartTimeframe(tf.id as any)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              chartTimeframe === tf.id ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-purple-50/40 dark:bg-[#162620] rounded-2xl border border-purple-100/60 dark:border-[#274238]">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Period Total</p>
                      <p className="text-lg font-black text-purple-900 dark:text-purple-300">
                        {chartMetric === 'revenue' ? `$${chartData.totalPeriodRevenue.toFixed(2)}` : `${chartData.totalPeriodOrders} Orders`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Peak Value</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {chartMetric === 'revenue' ? `$${chartData.peakValue.toFixed(2)}` : `${chartData.peakValue} Orders`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Timeframe</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {chartTimeframe === '7d' ? 'Last 7 Days' : chartTimeframe === '30d' ? 'Last 30 Days' : 'All Time'}
                      </p>
                    </div>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative w-full h-56 bg-gradient-to-b from-purple-50/30 via-white to-transparent rounded-2xl border border-purple-100/50 p-4 flex flex-col justify-between">
                    {/* Y-Axis scale labels */}
                    <div className="absolute left-3 top-3 text-[10px] font-bold text-gray-400">
                      {chartMetric === 'revenue' ? `$${chartData.maxVal.toFixed(0)}` : `${chartData.maxVal}`}
                    </div>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                      {chartMetric === 'revenue' ? `$${(chartData.maxVal / 2).toFixed(0)}` : `${Math.round(chartData.maxVal / 2)}`}
                    </div>
                    <div className="absolute left-3 bottom-8 text-[10px] font-bold text-gray-400">
                      {chartMetric === 'revenue' ? '$0' : '0'}
                    </div>

                    {/* SVG Graphic */}
                    <div className="relative w-full h-40 pl-8 pr-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="adminDynamicGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="20" y1="25" x2="480" y2="25" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="20" y1="67" x2="480" y2="67" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="20" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeWidth="1.5" />

                        {/* Area fill */}
                        {chartData.areaD && (
                          <path d={chartData.areaD} fill="url(#adminDynamicGrad)" />
                        )}

                        {/* Polyline Curve */}
                        {chartData.pathD && (
                          <path
                            d={chartData.pathD}
                            fill="none"
                            stroke="#7c3aed"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        )}

                        {/* Data Points */}
                        {chartData.points.map((pt, idx) => {
                          const isHovered = hoveredPointIndex === idx;
                          return (
                            <g key={idx} className="cursor-pointer">
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? "7" : "4.5"}
                                fill={isHovered ? "#7c3aed" : "#ffffff"}
                                stroke="#6d28d9"
                                strokeWidth="2.5"
                                onMouseEnter={() => setHoveredPointIndex(idx)}
                                onMouseLeave={() => setHoveredPointIndex(null)}
                                className="transition-all"
                              />
                            </g>
                          );
                        })}
                      </svg>

                      {/* Floating Tooltip */}
                      {hoveredPointIndex !== null && chartData.points[hoveredPointIndex] && (
                        <div 
                          className="absolute z-20 pointer-events-none bg-gray-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-gray-700 animate-in fade-in zoom-in-95 -translate-x-1/2 -translate-y-full"
                          style={{
                            left: `${(chartData.points[hoveredPointIndex].x / 500) * 100}%`,
                            top: `${(chartData.points[hoveredPointIndex].y / 130) * 100}%`,
                            marginTop: '-10px'
                          }}
                        >
                          <p className="text-[10px] text-gray-400 font-medium">{chartData.points[hoveredPointIndex].label}</p>
                          <p className="text-purple-300">
                            {chartMetric === 'revenue' 
                              ? `$${chartData.points[hoveredPointIndex].revenue.toFixed(2)}`
                              : `${chartData.points[hoveredPointIndex].orders} Transaction(s)`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Dynamic X-Axis Labels */}
                    <div className="flex justify-between text-[11px] font-bold text-gray-400 pl-8 pr-2 pt-2 border-t border-gray-100">
                      {chartData.buckets.map((b, i) => (
                        <span key={i} className="truncate max-w-[60px] text-center">{b.label}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Status Breakdown Distribution Bar */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Order Fulfillment Distribution</h2>
                      <p className="text-gray-400 text-xs font-medium">Real-time status breakdown across all platform transactions</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{bookings.length} total orders</span>
                  </div>

                  {/* Multi-color Progress Bar */}
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                    <div style={{ width: `${statusStats.confirmed.pct}%` }} className="bg-emerald-500 transition-all" title={`Confirmed: ${statusStats.confirmed.count}`} />
                    <div style={{ width: `${statusStats.completed.pct}%` }} className="bg-blue-500 transition-all" title={`Completed: ${statusStats.completed.count}`} />
                    <div style={{ width: `${statusStats.pending.pct}%` }} className="bg-amber-400 transition-all" title={`Pending: ${statusStats.pending.count}`} />
                    <div style={{ width: `${statusStats.cancelled.pct}%` }} className="bg-red-400 transition-all" title={`Cancelled: ${statusStats.cancelled.count}`} />
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-gray-700">Confirmed: {statusStats.confirmed.count} ({statusStats.confirmed.pct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-xs font-bold text-gray-700">Completed: {statusStats.completed.count} ({statusStats.completed.pct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="text-xs font-bold text-gray-700">Pending: {statusStats.pending.count} ({statusStats.pending.pct}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="text-xs font-bold text-gray-700">Cancelled: {statusStats.cancelled.count} ({statusStats.cancelled.pct}%)</span>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts & Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div 
                    onClick={() => setActiveTab("users")}
                    className="p-6 bg-white rounded-3xl border border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">👥</span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">Manage →</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-1">User Governance</h3>
                    <p className="text-xs text-gray-500 font-medium">Modify account roles between Customer, Supplier, and Admin, or revoke access.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab("bookings")}
                    className="p-6 bg-white rounded-3xl border border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">🎫</span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">Manage →</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-1">Order Fulfillment</h3>
                    <p className="text-xs text-gray-500 font-medium">Override reservation statuses, mark journeys complete, or handle cancellations.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab("coupons")}
                    className="p-6 bg-white rounded-3xl border border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">🎟️</span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">Manage →</span>
                    </div>
                    <h3 className="font-black text-gray-900 text-lg mb-1">Discount Campaigns</h3>
                    <p className="text-xs text-gray-500 font-medium">Create and edit percentage/fixed discount promo codes for seasonal promotions.</p>
                  </div>
                </div>

                {/* Recent Bookings Snapshot */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Latest Platform Activity</h2>
                      <p className="text-gray-400 text-xs font-medium">Real-time stream of incoming customer reservations</p>
                    </div>
                    <button onClick={() => setActiveTab("bookings")} className="text-xs font-bold text-emerald-600 hover:underline">
                      See All Orders ({bookings.length}) →
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No transactions recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((b) => (
                        <div key={b._id} className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center font-bold text-emerald-600">
                              🛍️
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{b.user?.name || "Guest Traveler"} <span className="text-gray-400 font-normal text-xs">({b.user?.email || "No email"})</span></p>
                              <p className="text-xs text-gray-400">Order #{b._id.slice(-8).toUpperCase()} • {b.items?.length || 0} item(s) • <span className="font-bold text-gray-700">${b.totalAmount.toFixed(2)}</span></p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor(b.status)}`}>
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: USERS */}
            {activeTab === "users" && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Manage Users ({users.length})</h2>
                    <p className="text-gray-400 text-xs font-medium">Control roles, supplier approvals, privileges, accounts, and export user lists</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={exportUsersCSV}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📥</span> Export CSV
                    </button>
                    {[
                      { id: 'all', label: 'All Roles' },
                      { id: 'customer', label: 'Customers' },
                      { id: 'supplier', label: 'Suppliers' },
                      { id: 'pending_supplier', label: `Pending Approvals (${pendingSuppliersCount})`, alert: pendingSuppliersCount > 0 },
                      { id: 'admin', label: 'Admins' },
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => setUserRoleFilter(r.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          userRoleFilter === r.id
                            ? 'bg-gray-900 text-white shadow-sm'
                            : r.alert
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black animate-pulse'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pending Verification Notice Banner if any suppliers are waiting */}
                {pendingSuppliersCount > 0 && userRoleFilter !== 'pending_supplier' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏳</span>
                      <div>
                        <p className="text-xs font-black text-amber-900">
                          {pendingSuppliersCount} Supplier Registration{pendingSuppliersCount > 1 ? 's' : ''} Awaiting Admin Approval
                        </p>
                        <p className="text-[11px] text-amber-700">Suppliers cannot log in to manage inventory until verified.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUserRoleFilter('pending_supplier')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Review Now →
                    </button>
                  </div>
                )}

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 font-medium">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="text-gray-600 font-bold mb-1">No users matched</p>
                    <p className="text-xs">Try clearing your search query or role filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 text-xs font-black uppercase">
                          <th className="pb-4 font-bold">User Details</th>
                          <th className="pb-4 font-bold">Account Role</th>
                          <th className="pb-4 font-bold">Verification Status</th>
                          <th className="pb-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                                  {u.name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                  <p className="text-xs text-gray-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              {(user?.id === u._id || user?._id === u._id) ? (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-200">
                                  {u.role.toUpperCase()} (You)
                                </span>
                              ) : (
                                <select 
                                  value={u.role} 
                                  onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                  className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer text-gray-800"
                                >
                                  <option value="customer">CUSTOMER</option>
                                  <option value="supplier">SUPPLIER</option>
                                  <option value="admin">ADMIN</option>
                                </select>
                              )}
                            </td>
                            <td className="py-4">
                              {u.role === 'supplier' ? (
                                <div className="flex items-center gap-2">
                                  {u.isVerified !== false && u.verificationStatus !== 'pending' && u.verificationStatus !== 'rejected' ? (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                      <span>✓</span> Approved
                                    </span>
                                  ) : u.verificationStatus === 'rejected' ? (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                      <span>✕</span> Rejected
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                                      <span>⏳</span> Pending Review
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 font-medium">Standard Verified</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {u.role === 'supplier' && (
                                  <>
                                    {u.isVerified === false || u.verificationStatus === 'pending' || u.verificationStatus === 'rejected' ? (
                                      <button
                                        onClick={() => handleVerifySupplier(u._id, 'approved')}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1"
                                        title="Approve supplier registration"
                                      >
                                        <span>✓</span> Approve
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleVerifySupplier(u._id, 'rejected')}
                                        className="px-2 py-1 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] rounded-xl transition-all"
                                        title="Revoke supplier access"
                                      >
                                        Revoke
                                      </button>
                                    )}

                                    {u.verificationStatus === 'pending' && (
                                      <button
                                        onClick={() => handleVerifySupplier(u._id, 'rejected')}
                                        className="px-2 py-1 border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-[11px] rounded-xl transition-all"
                                        title="Reject application"
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </>
                                )}

                                <button 
                                  onClick={() => handleDeleteUser(u._id)} 
                                  disabled={user?.id === u._id || user?._id === u._id}
                                  className="text-red-500 hover:text-red-700 font-bold text-xs px-2.5 py-1 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === "bookings" && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Global Bookings ({bookings.length})</h2>
                    <p className="text-gray-400 text-xs font-medium">All platform transactions, order statuses, and CSV export</p>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                    <button
                      onClick={exportBookingsCSV}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span>📥</span> Export CSV
                    </button>
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setBookingStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                          bookingStatusFilter === st
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by order ID, customer name/email..."
                    value={bookingSearch}
                    onChange={e => setBookingSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                  />
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 font-medium">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-gray-600 font-bold mb-1">No bookings match your filter</p>
                    <p className="text-xs">Adjust your search query or filter options.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {paginatedBookings.map((booking) => (
                        <div 
                          key={booking._id} 
                          className="p-6 border border-gray-100 rounded-3xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-gray-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor(booking.status)}`}>
                                {booking.status.toUpperCase()}
                              </span>
                              <span className="text-gray-400 font-medium text-xs font-mono">Order #{booking._id.slice(-8).toUpperCase()}</span>
                              <span className="text-gray-400 text-xs">• {new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>

                            <p className="text-gray-900 font-black text-base">
                              {booking.user?.name || "Guest"} <span className="text-gray-400 font-normal text-xs">({booking.user?.email || "No email"})</span>
                            </p>

                            <div className="pl-3 border-l-2 border-emerald-300 space-y-1">
                              <p className="text-xs text-gray-500 font-medium">
                                {booking.items.length} item(s) • Total Amount: <span className="font-black text-gray-800">${booking.totalAmount.toFixed(2)}</span>
                              </p>
                              {booking.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700 py-0.5">
                                  <span>• {item.name}</span>
                                  <span className="text-gray-400 font-normal">(Qty: {item.quantity})</span>
                                  {(item.selectedDate || item.details?.selectedDate) && (
                                    <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                                      📅 {item.selectedDate || item.details?.selectedDate}
                                    </span>
                                  )}
                                  {(item.selectedTime || item.details?.selectedTime) && (
                                    <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">
                                      ⏰ {item.selectedTime || item.details?.selectedTime}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => handleUpdateBookingStatus(booking._id, "confirmed")}
                              disabled={["confirmed","cancelled","completed"].includes(booking.status)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={() => handleUpdateBookingStatus(booking._id, "completed")}
                              disabled={booking.status !== "confirmed"}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => handleUpdateBookingStatus(booking._id, "cancelled")}
                              disabled={["cancelled","completed"].includes(booking.status)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalBookingPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500">
                          Showing <span className="font-black text-gray-900">{(bookingPage - 1) * bookingsPerPage + 1}</span> to <span className="font-black text-gray-900">{Math.min(bookingPage * bookingsPerPage, filteredBookings.length)}</span> of <span className="font-black text-gray-900">{filteredBookings.length}</span> bookings
                        </p>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setBookingPage(p => Math.max(1, p - 1))}
                            disabled={bookingPage === 1}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            ← Previous
                          </button>

                          {Array.from({ length: totalBookingPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setBookingPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                bookingPage === pageNum
                                  ? "bg-purple-700 text-white shadow-md shadow-purple-600/20"
                                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            onClick={() => setBookingPage(p => Math.min(totalBookingPages, p + 1))}
                            disabled={bookingPage === totalBookingPages}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: COUPONS */}
            {activeTab === "coupons" && (
              <div className="space-y-8">
                {/* Create Coupon Form Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Create Discount Coupon</h2>
                      <p className="text-gray-400 text-xs font-medium">Issue promotional codes to drive sustainable reservations</p>
                    </div>
                    <button
                      onClick={exportCouponsCSV}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📥</span> Export Coupons CSV
                    </button>
                  </div>

                  {couponMsg === "success" && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold text-sm">
                      ✅ Coupon created and activated successfully!
                    </div>
                  )}
                  {couponMsg.startsWith("error:") && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-sm">
                      ❌ {couponMsg.replace("error:", "")}
                    </div>
                  )}

                  <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Coupon Code</label>
                      <input 
                        type="text" 
                        placeholder="e.g. ECOSUMMER" 
                        required 
                        value={newCoupon.code}
                        onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        className={`${inp} font-mono font-bold uppercase`} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Type</label>
                      <select 
                        value={newCoupon.discountType} 
                        onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })} 
                        className={inp}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Value</label>
                      <input 
                        type="number" 
                        min="1" 
                        required 
                        value={newCoupon.discountValue}
                        onChange={e => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} 
                        className={inp} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expiry Date (optional)</label>
                      <input 
                        type="date" 
                        value={newCoupon.expiryDate}
                        onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} 
                        className={inp} 
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-2">
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
                      >
                        + Create Coupon
                      </button>
                    </div>
                  </form>
                </div>

                {/* Coupon List Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">Active Coupons ({coupons.length})</h2>
                      <p className="text-gray-400 text-xs font-medium">All generated promo codes</p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                      <input
                        type="text"
                        placeholder="Search promo code..."
                        value={couponSearch}
                        onChange={e => setCouponSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  {filteredCoupons.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 font-medium">
                      <p className="text-4xl mb-2">🎟️</p>
                      No coupons found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredCoupons.map(coupon => (
                        <div 
                          key={coupon._id} 
                          className="p-5 border border-gray-100 rounded-2xl bg-gray-50/60 hover:bg-white hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-sm tracking-wider shadow-sm">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => copyToClipboard(coupon.code)}
                                className="text-xs text-gray-400 hover:text-emerald-600 transition-colors p-1"
                                title="Copy code"
                              >
                                {copiedCode === coupon.code ? "✓ Copied" : "📋"}
                              </button>
                            </div>

                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              coupon.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {coupon.isActive ? "Active" : "Disabled"}
                            </span>
                          </div>

                          <div className="mb-4">
                            <p className="font-black text-gray-900 text-base">
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                            </p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {coupon.expiryDate ? `Expires on ${new Date(coupon.expiryDate).toLocaleDateString()}` : "No expiration date"}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => {
                                setEditingCoupon({
                                  _id: coupon._id,
                                  code: coupon.code,
                                  discountType: coupon.discountType,
                                  discountValue: coupon.discountValue,
                                  expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : "",
                                  isActive: coupon.isActive !== undefined ? coupon.isActive : true,
                                });
                                setEditCouponMsg("");
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Edit Promo Coupon</h3>
              <button 
                onClick={() => setEditingCoupon(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {editCouponMsg.startsWith("error:") && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-sm">
                ❌ {editCouponMsg.replace("error:", "")}
              </div>
            )}

            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  required 
                  value={editingCoupon.code}
                  onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className={`${inp} font-mono font-bold uppercase`} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Type</label>
                  <select 
                    value={editingCoupon.discountType} 
                    onChange={e => setEditingCoupon({ ...editingCoupon, discountType: e.target.value })} 
                    className={inp}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Discount Value</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={editingCoupon.discountValue}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) })} 
                    className={inp} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Expiry Date (optional)</label>
                <input 
                  type="date" 
                  value={editingCoupon.expiryDate}
                  onChange={e => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })} 
                  className={inp} 
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3.5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100/70 transition-colors">
                  <input 
                    type="checkbox"
                    checked={editingCoupon.isActive}
                    onChange={e => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-gray-800 block">Coupon Active</span>
                    <span className="text-xs text-gray-400">Toggle to enable or disable promo code usage at checkout</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setEditingCoupon(null)} 
                  className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
