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

export default function SupplierDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview"); // overview, inventory, bookings, analytics
  const [stats, setStats] = useState<any>(null);
  const [inventory, setInventory] = useState<any>({ hotels: [], buses: [], tours: [], flights: [] });
  const [bookings, setBookings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination states
  const [listingsPage, setListingsPage] = useState(1);
  const listingsPerPage = 6;
  const [bookingPage, setBookingPage] = useState(1);
  const bookingsPerPage = 6;

  // Dynamic Chart Controls
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Create Inventory Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemType, setNewItemType] = useState('hotel');
  const [newItemData, setNewItemData] = useState<any>({});

  // Edit Inventory Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemType, setEditItemType] = useState('hotel');
  const [editItemData, setEditItemData] = useState<any>({});

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemData({ ...newItemData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditItemData({ ...editItemData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (type: string, item: any) => {
    setEditItemType(type);
    let dataToEdit = { ...item };
    if (type === 'hotel' && item.location) {
      dataToEdit.city = item.location.city;
      dataToEdit.address = item.location.address;
    }
    if (type === 'hotel' && item.rooms && item.rooms.length > 0) {
      dataToEdit.price = item.rooms[0].price;
      dataToEdit.availableQuantity = item.rooms[0].availableQuantity;
    }
    setEditItemData(dataToEdit);
    setShowEditModal(true);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== 'supplier') {
        router.push("/");
      } else {
        fetchSupplierData(false);
      }
    }
  }, [user, authLoading, router]);

  const fetchSupplierData = async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const [statsRes, invRes, bookingsRes] = await Promise.all([
        fetch(`${base}/supplier/stats`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${base}/supplier/inventory`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${base}/supplier/bookings`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
      ]);
      
      const statsData = await statsRes.json();
      const invData = await invRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (invData.success) setInventory(invData.data);
      if (bookingsData.success) setBookings(bookingsData.data);

      if (manual) {
        showToast("✓ Supplier workspace data refreshed!");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  };

  const handleDeleteInventory = async (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/inventory/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Listing deleted successfully");
        fetchSupplierData(false);
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Error deleting inventory");
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/bookings/${id}/status`, {
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
        showToast(`Booking marked as ${status.toUpperCase()}`);
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Error updating booking");
    }
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let payload = { ...newItemData, type: newItemType };
      
      if (payload.city || payload.country) {
        payload.location = { city: payload.city, country: payload.country };
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setNewItemData({});
        showToast("New listing published successfully!");
        fetchSupplierData(false);
      } else {
        alert(data.message || "Validation Error");
      }
    } catch (err: any) {
      alert("Error creating inventory");
    }
  };

  const handleUpdateInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/inventory/${editItemType}/${editItemData._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(editItemData)
      });
      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setEditItemData({});
        showToast("Listing updated successfully!");
        fetchSupplierData(false);
      } else {
        alert(data.message || "Validation Error");
      }
    } catch (err: any) {
      alert("Error updating inventory");
    }
  };

  // Combine and filter inventory items
  const allListings = useMemo(() => {
    const list: any[] = [];
    (inventory.hotels || []).forEach((item: any) => list.push({ ...item, category: 'hotel', title: item.name, subtitle: `${item.location?.city || 'Eco Stay'} • $${item.rooms?.[0]?.price || 0}/night`, priceVal: item.rooms?.[0]?.price || 0 }));
    (inventory.flights || []).forEach((item: any) => list.push({ ...item, category: 'flight', title: `${item.airline} ${item.flightNumber}`, subtitle: `${item.origin} → ${item.destination} • $${item.price}`, priceVal: item.price }));
    (inventory.buses || []).forEach((item: any) => list.push({ ...item, category: 'bus', title: item.operator, subtitle: `${item.origin} → ${item.destination} • $${item.fare}`, priceVal: item.fare }));
    (inventory.tours || []).forEach((item: any) => list.push({ ...item, category: 'tour', title: item.title, subtitle: `${item.durationDays} Days • ${item.pickupPoint} • $${item.price}`, priceVal: item.price }));
    return list;
  }, [inventory]);

  const filteredListings = useMemo(() => {
    return allListings.filter(item => {
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesQuery = !searchQuery || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [allListings, categoryFilter, searchQuery]);

  const totalListingsPages = Math.max(1, Math.ceil(filteredListings.length / listingsPerPage));
  const paginatedListings = useMemo(() => {
    const start = (listingsPage - 1) * listingsPerPage;
    return filteredListings.slice(start, start + listingsPerPage);
  }, [filteredListings, listingsPage, listingsPerPage]);

  useEffect(() => {
    setListingsPage(1);
  }, [categoryFilter, searchQuery]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return b._id?.toLowerCase().includes(q) || b.user?.name?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
    });
  }, [bookings, bookingStatusFilter, searchQuery]);

  const totalBookingPages = Math.max(1, Math.ceil(filteredBookings.length / bookingsPerPage));
  const paginatedBookings = useMemo(() => {
    const start = (bookingPage - 1) * bookingsPerPage;
    return filteredBookings.slice(start, start + bookingsPerPage);
  }, [filteredBookings, bookingPage, bookingsPerPage]);

  useEffect(() => {
    setBookingPage(1);
  }, [bookingStatusFilter, searchQuery]);

  // Dynamic Chart Computation
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

  // Export Bookings to CSV
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
    downloadCSV(`Supplier_Bookings_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast("✓ Bookings CSV exported successfully!");
  };

  // Export Listings to CSV
  const exportListingsCSV = () => {
    const headers = ["Listing ID", "Category", "Title", "Details", "Price ($)"];
    const rows = filteredListings.map(l => [
      l._id,
      l.category.toUpperCase(),
      l.title,
      l.subtitle,
      l.priceVal || 0
    ]);
    downloadCSV(`Supplier_Inventory_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    showToast("✓ Inventory CSV exported successfully!");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] pt-32 px-4 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500 text-sm animate-pulse">Loading Supplier Workspace...</p>
      </div>
    );
  }

  const categoryIcons: Record<string, string> = {
    hotel: "🏨",
    flight: "✈️",
    bus: "🚌",
    tour: "🌲"
  };

  const categoryColors: Record<string, string> = {
    hotel: "bg-purple-50 text-purple-700 border-purple-200",
    flight: "bg-blue-50 text-blue-700 border-blue-200",
    bus: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tour: "bg-amber-50 text-amber-700 border-amber-200"
  };

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 p-8 sm:p-10 text-white shadow-xl shadow-emerald-950/10">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Supplier Workspace • Live Sync & Analytics
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                Welcome back, {user?.name || "Partner"}
              </h1>
              <p className="text-emerald-100/80 font-medium text-sm sm:text-base max-w-xl">
                Oversee incoming reservations, manage eco listings, export spreadsheets, and analyze revenue trends.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 text-sm"
              >
                <span>+</span> Add New Listing
              </button>

              <button
                onClick={() => fetchSupplierData(true)}
                disabled={isRefreshing}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 transition-all text-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
                title="Refresh Metrics"
              >
                <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
                <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 sticky top-28 space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider px-3 mb-2">Workspace Navigation</p>
              
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'overview' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>📊</span> Overview & Trends
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'inventory' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>📦</span> My Listings
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeTab === 'inventory' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {stats?.totalInventoryCount || 0}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeTab === 'bookings' 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>🎫</span> Reservations
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-black ${activeTab === 'bookings' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {bookings.length}
                </span>
              </button>

              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                <button
                  onClick={exportBookingsCSV}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <span>📥</span> Export Bookings CSV
                </button>
                <button
                  onClick={exportListingsCSV}
                  className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <span>📥</span> Export Inventory CSV
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
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="h-full bg-white dark:bg-[#13201b] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1f332b] card-interactive relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-950/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        💰
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Gross Revenue</p>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>↑ 100% earned</span> • <span className="text-gray-400 dark:text-gray-500 font-medium">Real-time payouts</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-full bg-white dark:bg-[#13201b] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1f332b] card-interactive relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-950/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        🎫
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Customer Bookings</p>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        {stats?.totalBookings || 0}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span>⚡ Active demand</span> • <span className="text-gray-400 dark:text-gray-500 font-medium">Auto chime alerts</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-full bg-white dark:bg-[#13201b] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-[#1f332b] card-interactive relative overflow-hidden group flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-950/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 rounded-2xl flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform shadow-inner">
                        📦
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Active Listings</p>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        {stats?.totalInventoryCount || 0}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <span>🌱 Published & Live</span> • <span className="text-gray-400 dark:text-gray-500 font-medium">Ready to reserve</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Visual Revenue / Demand Graph */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h2 className="text-xl font-black text-gray-900">
                          {chartMetric === 'revenue' ? 'Dynamic Revenue Trajectory' : 'Order Booking Velocity'}
                        </h2>
                      </div>
                      <p className="text-gray-400 text-xs font-medium">
                        Computed live from {bookings.length} reservation{bookings.length !== 1 ? 's' : ''} across your listings
                      </p>
                    </div>

                    {/* Chart Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Metric Toggle */}
                      <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                          onClick={() => setChartMetric('revenue')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            chartMetric === 'revenue' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          💰 Revenue ($)
                        </button>
                        <button
                          onClick={() => setChartMetric('orders')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            chartMetric === 'orders' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          🎫 Orders
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
                              chartTimeframe === tf.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3 p-4 bg-emerald-50/40 dark:bg-[#162620] rounded-2xl border border-emerald-100/60 dark:border-[#274238]">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Period Total</p>
                      <p className="text-lg font-black text-emerald-800 dark:text-emerald-300">
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

                  {/* SVG Chart Container */}
                  <div className="relative w-full h-56 bg-gradient-to-b from-emerald-50/20 via-white to-transparent rounded-2xl border border-emerald-100/50 p-4 flex flex-col justify-between">
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
                          <linearGradient id="supplierDynamicGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1="20" y1="25" x2="480" y2="25" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="20" y1="67" x2="480" y2="67" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                        <line x1="20" y1="110" x2="480" y2="110" stroke="#e2e8f0" strokeWidth="1.5" />

                        {/* Area fill */}
                        {chartData.areaD && (
                          <path d={chartData.areaD} fill="url(#supplierDynamicGrad)" />
                        )}

                        {/* Polyline Curve */}
                        {chartData.pathD && (
                          <path
                            d={chartData.pathD}
                            fill="none"
                            stroke="#059669"
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
                                fill={isHovered ? "#059669" : "#ffffff"}
                                stroke="#047857"
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
                          <p className="text-emerald-400">
                            {chartMetric === 'revenue' 
                              ? `$${chartData.points[hoveredPointIndex].revenue.toFixed(2)}`
                              : `${chartData.points[hoveredPointIndex].orders} Order(s)`}
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

                {/* Inventory Breakdown by Category */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Inventory Distribution</h2>
                      <p className="text-gray-400 text-xs font-medium">Breakdown of listings across your sustainable offerings</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('inventory')}
                      className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                    >
                      Manage All →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { type: 'Hotels', count: inventory.hotels?.length || 0, icon: '🏨', color: 'border-purple-200 bg-purple-50/50' },
                      { type: 'Flights', count: inventory.flights?.length || 0, icon: '✈️', color: 'border-blue-200 bg-blue-50/50' },
                      { type: 'Buses', count: inventory.buses?.length || 0, icon: '🚌', color: 'border-emerald-200 bg-emerald-50/50' },
                      { type: 'Tours', count: inventory.tours?.length || 0, icon: '🌲', color: 'border-amber-200 bg-amber-50/50' },
                    ].map((c, i) => (
                      <div key={i} className={`p-5 rounded-2xl border ${c.color} flex flex-col justify-between`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-2xl">{c.icon}</span>
                          <span className="text-xs font-bold text-gray-500 uppercase">{c.type}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{c.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Bookings Feed */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Recent Customer Bookings</h2>
                      <p className="text-gray-400 text-xs font-medium">Latest incoming orders for your listings</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                    >
                      View All Bookings ({bookings.length}) →
                    </button>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 font-medium">
                      <p className="text-4xl mb-2">🎫</p>
                      No reservations yet. Once travelers book your items, orders will appear here automatically.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => (
                        <div key={booking._id} className="p-4 bg-gray-50/60 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-200 flex items-center justify-center font-bold text-emerald-600">
                              👤
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{booking.user?.name || "Traveler"}</p>
                              <p className="text-xs text-gray-400">Order #{booking._id?.slice(-8).toUpperCase()} • {booking.items?.length || 0} item(s)</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                              booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {booking.status?.toUpperCase()}
                            </span>
                            <button
                              onClick={() => setActiveTab('bookings')}
                              className="text-xs text-emerald-600 font-bold hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Your Listings ({filteredListings.length})</h2>
                    <p className="text-gray-400 text-xs font-medium">Manage, edit, or export your sustainable offerings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportListingsCSV}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📥</span> Export CSV
                    </button>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2"
                    >
                      <span>+</span> Add Listing
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
                  <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search listings by title, destination..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                    {['all', 'hotel', 'flight', 'bus', 'tour'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors capitalize ${
                          categoryFilter === cat 
                            ? 'bg-gray-900 text-white shadow-sm' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'all' ? '✨ All' : `${categoryIcons[cat]} ${cat}s`}
                      </button>
                    ))}

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                    <div className="hidden sm:flex border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 text-xs font-bold ${viewMode === 'table' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                      >
                        Table
                      </button>
                    </div>
                  </div>
                </div>

                {/* Listings Display */}
                {filteredListings.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 font-medium">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-600 font-bold mb-1">No listings found</p>
                    <p className="text-xs">Try adjusting your filter or create your first inventory listing.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedListings.map((item) => (
                          <div 
                            key={item._id} 
                            className="p-5 border border-gray-100 rounded-3xl bg-gray-50/40 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${categoryColors[item.category]}`}>
                                  {categoryIcons[item.category]} {item.category}
                                </span>
                                <span className="text-xs font-bold text-gray-400">
                                  ID #{item._id.slice(-6)}
                                </span>
                              </div>

                              <h3 className="font-black text-gray-900 text-base mb-1 group-hover:text-emerald-700 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-gray-500 text-xs font-medium mb-4">
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100/80">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                <span>🍃 Eco Certified</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => openEditModal(item.category, item)} 
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteInventory(item.category, item._id)} 
                                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs rounded-xl transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 text-xs font-black uppercase">
                              <th className="pb-3">Category</th>
                              <th className="pb-3">Title</th>
                              <th className="pb-3">Details</th>
                              <th className="pb-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedListings.map(item => (
                              <tr key={item._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                <td className="py-3.5">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${categoryColors[item.category]}`}>
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-3.5 font-bold text-gray-900 text-sm">{item.title}</td>
                                <td className="py-3.5 text-gray-500 text-xs">{item.subtitle}</td>
                                <td className="py-3.5 text-right space-x-2">
                                  <button onClick={() => openEditModal(item.category, item)} className="text-blue-600 font-bold text-xs hover:underline">Edit</button>
                                  <button onClick={() => handleDeleteInventory(item.category, item._id)} className="text-red-600 font-bold text-xs hover:underline">Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Listings Pagination Controls */}
                    {totalListingsPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500">
                          Showing <span className="font-black text-gray-900">{(listingsPage - 1) * listingsPerPage + 1}</span> to <span className="font-black text-gray-900">{Math.min(listingsPage * listingsPerPage, filteredListings.length)}</span> of <span className="font-black text-gray-900">{filteredListings.length}</span> listings
                        </p>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setListingsPage(p => Math.max(1, p - 1))}
                            disabled={listingsPage === 1}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            ← Previous
                          </button>

                          {Array.from({ length: totalListingsPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              onClick={() => setListingsPage(pageNum)}
                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                listingsPage === pageNum
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}

                          <button
                            onClick={() => setListingsPage(p => Math.min(totalListingsPages, p + 1))}
                            disabled={listingsPage === totalListingsPages}
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

            {/* TAB: BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Booking Management ({filteredBookings.length})</h2>
                    <p className="text-gray-400 text-xs font-medium">Review, fulfill, or export reservations on your listings</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportBookingsCSV}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>📥</span> Export CSV
                    </button>

                    <div className="flex items-center gap-1">
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
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 font-medium">
                    <p className="text-4xl mb-3">🎫</p>
                    <p className="text-gray-600 font-bold mb-1">No bookings match your filter</p>
                    <p className="text-xs">Check other status tabs or wait for new customer requests.</p>
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
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {booking.status.toUpperCase()}
                              </span>
                              <span className="text-gray-400 font-medium text-xs font-mono">Order #{booking._id.slice(-8).toUpperCase()}</span>
                              <span className="text-gray-400 text-xs">• {new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>

                            <p className="text-gray-900 font-black text-base">{booking.user?.name || 'Guest Traveler'}</p>
                            
                            <div className="pl-3 border-l-2 border-emerald-300 space-y-1">
                              {booking.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700 py-0.5">
                                  <span>• {item.name}</span>
                                  <span className="text-gray-400 font-normal">(Qty: {item.quantity}) • ${item.price}</span>
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

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                              disabled={booking.status === 'confirmed' || booking.status === 'cancelled' || booking.status === 'completed'}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                              disabled={booking.status !== 'confirmed'}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                            >
                              Complete
                            </button>
                            <button 
                              onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                              disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reservations Pagination Controls */}
                    {totalBookingPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500">
                          Showing <span className="font-black text-gray-900">{(bookingPage - 1) * bookingsPerPage + 1}</span> to <span className="font-black text-gray-900">{Math.min(bookingPage * bookingsPerPage, filteredBookings.length)}</span> of <span className="font-black text-gray-900">{filteredBookings.length}</span> reservations
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
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
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
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Create New Listing</h3>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">✕</button>
            </div>
            
            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Listing Category</label>
                <select 
                  value={newItemType} 
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-800"
                >
                  <option value="hotel">🏨 Eco Hotel / Stay</option>
                  <option value="flight">✈️ Carbon-Offset Flight</option>
                  <option value="bus">🚌 EV Bus Route</option>
                  <option value="tour">🌲 Nature Tour</option>
                </select>
              </div>

              {newItemType === 'hotel' && (
                <>
                  <input type="text" placeholder="Hotel Name" required onChange={e => setNewItemData({...newItemData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" required onChange={e => setNewItemData({...newItemData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Address" required onChange={e => setNewItemData({...newItemData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <textarea placeholder="Property Description (e.g. 100% solar powered, zero-waste dining)" required rows={3} onChange={e => setNewItemData({...newItemData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Price per night ($)" required min="1" onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="number" placeholder="Rooms Available" required min="1" onChange={e => setNewItemData({...newItemData, availableQuantity: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Image Upload</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  </div>
                </>
              )}

              {newItemType === 'flight' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Airline Name (e.g. EcoAir)" required onChange={e => setNewItemData({...newItemData, airline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Flight # (e.g. EA-204)" required onChange={e => setNewItemData({...newItemData, flightNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Origin (e.g. New York)" required onChange={e => setNewItemData({...newItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Destination (e.g. London)" required onChange={e => setNewItemData({...newItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <input type="number" placeholder="Fare Price ($)" required min="1" onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Departure Time</label>
                      <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, departureTime: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Arrival Time</label>
                      <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, arrivalTime: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Image Upload</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  </div>
                </>
              )}

              {newItemType === 'bus' && (
                <>
                  <input type="text" placeholder="Bus Operator (e.g. GreenLine Express)" required onChange={e => setNewItemData({...newItemData, operator: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Origin" required onChange={e => setNewItemData({...newItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Destination" required onChange={e => setNewItemData({...newItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Fare ($)" required min="1" onChange={e => setNewItemData({...newItemData, fare: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="number" placeholder="Total Seats" required min="1" onChange={e => setNewItemData({...newItemData, totalSeats: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Departure Time</label>
                      <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, departureTime: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Arrival Time</label>
                      <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, arrivalTime: e.target.value})} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Image Upload</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  </div>
                </>
              )}

              {newItemType === 'tour' && (
                <>
                  <input type="text" placeholder="Tour Title" required onChange={e => setNewItemData({...newItemData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Duration (Days)" required min="1" onChange={e => setNewItemData({...newItemData, durationDays: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Pickup Point" required onChange={e => setNewItemData({...newItemData, pickupPoint: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <input type="number" placeholder="Price ($)" required min="1" onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Image Upload</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-sm">Publish Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Edit Listing</h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold">✕</button>
            </div>
            
            <form onSubmit={handleUpdateInventorySubmit} className="space-y-4">
              {editItemType === 'hotel' && (
                <>
                  <input type="text" placeholder="Hotel Name" value={editItemData.name || ''} required onChange={e => setEditItemData({...editItemData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="City" value={editItemData.city || ''} required onChange={e => setEditItemData({...editItemData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Address" value={editItemData.address || ''} required onChange={e => setEditItemData({...editItemData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <textarea placeholder="Description" value={editItemData.description || ''} required rows={3} onChange={e => setEditItemData({...editItemData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Price per night ($)" value={editItemData.price || ''} required onChange={e => setEditItemData({...editItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="number" placeholder="Rooms Available" value={editItemData.availableQuantity || ''} required onChange={e => setEditItemData({...editItemData, availableQuantity: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Update Image (optional)</label>
                    <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700" />
                  </div>
                </>
              )}

              {editItemType === 'flight' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Airline Name" value={editItemData.airline || ''} required onChange={e => setEditItemData({...editItemData, airline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Flight Number" value={editItemData.flightNumber || ''} required onChange={e => setEditItemData({...editItemData, flightNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Origin" value={editItemData.origin || ''} required onChange={e => setEditItemData({...editItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Destination" value={editItemData.destination || ''} required onChange={e => setEditItemData({...editItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <input type="number" placeholder="Price ($)" value={editItemData.price || ''} required onChange={e => setEditItemData({...editItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Update Image</label>
                    <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700" />
                  </div>
                </>
              )}

              {editItemType === 'bus' && (
                <>
                  <input type="text" placeholder="Operator Name" value={editItemData.operator || ''} required onChange={e => setEditItemData({...editItemData, operator: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Origin" value={editItemData.origin || ''} required onChange={e => setEditItemData({...editItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Destination" value={editItemData.destination || ''} required onChange={e => setEditItemData({...editItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Ticket Fare ($)" value={editItemData.fare || ''} required onChange={e => setEditItemData({...editItemData, fare: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="number" placeholder="Total Seats" value={editItemData.totalSeats || ''} required onChange={e => setEditItemData({...editItemData, totalSeats: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Update Image</label>
                    <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700" />
                  </div>
                </>
              )}

              {editItemType === 'tour' && (
                <>
                  <input type="text" placeholder="Tour Title" value={editItemData.title || ''} required onChange={e => setEditItemData({...editItemData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Duration (Days)" value={editItemData.durationDays || ''} required onChange={e => setEditItemData({...editItemData, durationDays: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                    <input type="text" placeholder="Pickup Point" value={editItemData.pickupPoint || ''} required onChange={e => setEditItemData({...editItemData, pickupPoint: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <input type="number" placeholder="Price ($)" value={editItemData.price || ''} required onChange={e => setEditItemData({...editItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Update Image</label>
                    <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl text-sm">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-sm">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
