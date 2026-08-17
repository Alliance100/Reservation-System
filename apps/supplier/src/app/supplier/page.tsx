"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function SupplierDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview"); // overview, inventory, bookings
  const [stats, setStats] = useState<any>(null);
  
  const [inventory, setInventory] = useState<any>({ hotels: [], buses: [], tours: [], flights: [] });
  const [bookings, setBookings] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Create Inventory Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemType, setNewItemType] = useState('hotel');
  const [newItemData, setNewItemData] = useState<any>({});

  // Edit Inventory Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItemType, setEditItemType] = useState('hotel');
  const [editItemData, setEditItemData] = useState<any>({});

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
        fetchSupplierData();
      }
    }
  }, [user, authLoading, router]);

  const fetchSupplierData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, invRes, bookingsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/stats`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/inventory`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/supplier/bookings`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
      ]);
      
      const statsData = await statsRes.json();
      const invData = await invRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (invData.success) setInventory(invData.data);
      if (bookingsData.success) setBookings(bookingsData.data);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
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
        fetchSupplierData(); // refresh to keep it simple
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
      
      // Formatting data correctly based on schema structures
      let payload = { ...newItemData, type: newItemType };
      
      // Basic formatting for location (expected as object in models)
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
        fetchSupplierData();
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
        fetchSupplierData();
      } else {
        alert(data.message || "Validation Error");
      }
    } catch (err: any) {
      alert("Error updating inventory");
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
            <h2 className="text-xl font-black text-gray-900 mb-6">Supplier Panel</h2>
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                📊 Overview
              </button>
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                📦 Inventory
              </button>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                🎫 Bookings
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
                <p className="text-gray-500 font-medium">Manage your specific inventory and track bookings.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-4">📈</div>
                  <p className="text-gray-500 text-sm font-bold mb-1">Your Total Revenue</p>
                  <h3 className="text-3xl font-black text-gray-900">${stats?.totalRevenue.toFixed(2) || '0.00'}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl mb-4">🎫</div>
                  <p className="text-gray-500 text-sm font-bold mb-1">Orders for your items</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats?.totalBookings || 0}</h3>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl mb-4">📦</div>
                  <p className="text-gray-500 text-sm font-bold mb-1">Active Listings</p>
                  <h3 className="text-3xl font-black text-gray-900">{stats?.totalInventoryCount || 0}</h3>
                </div>
              </div>
            </>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Your Inventory</h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-colors"
                >
                  + Add Listing
                </button>
              </div>

              {/* Combine all inventory into one list for simplicity */}
              <div className="space-y-4">
                {[...inventory.hotels, ...inventory.buses, ...inventory.flights, ...inventory.tours].length === 0 && (
                  <p className="text-gray-500 text-center py-8">You haven't listed any items yet.</p>
                )}

                {/* Properties */}
                {inventory.hotels.map((item: any) => (
                  <div key={item._id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-gray-50/50">
                    <div>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-1 inline-block">HOTEL</span>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-gray-500 text-sm">{item.location?.city}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => openEditModal('hotel', item)} className="text-blue-500 font-bold text-sm hover:underline">Edit</button>
                      <button onClick={() => handleDeleteInventory('hotel', item._id)} className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                    </div>
                  </div>
                ))}

                {/* Flights */}
                {inventory.flights.map((item: any) => (
                  <div key={item._id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-gray-50/50">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md mb-1 inline-block">FLIGHT</span>
                      <h4 className="font-bold text-gray-900">{item.airline} - {item.flightNumber}</h4>
                      <p className="text-gray-500 text-sm">{item.origin} to {item.destination}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => openEditModal('flight', item)} className="text-blue-500 font-bold text-sm hover:underline">Edit</button>
                      <button onClick={() => handleDeleteInventory('flight', item._id)} className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                    </div>
                  </div>
                ))}

                {/* Buses */}
                {inventory.buses.map((item: any) => (
                  <div key={item._id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-gray-50/50">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1 inline-block">BUS</span>
                      <h4 className="font-bold text-gray-900">{item.operator}</h4>
                      <p className="text-gray-500 text-sm">{item.origin} to {item.destination}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => openEditModal('bus', item)} className="text-blue-500 font-bold text-sm hover:underline">Edit</button>
                      <button onClick={() => handleDeleteInventory('bus', item._id)} className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                    </div>
                  </div>
                ))}

                {/* Tours */}
                {inventory.tours.map((item: any) => (
                  <div key={item._id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-center bg-gray-50/50">
                    <div>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md mb-1 inline-block">TOUR</span>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-gray-500 text-sm">{item.durationDays} Days • {item.pickupPoint}</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => openEditModal('tour', item)} className="text-blue-500 font-bold text-sm hover:underline">Edit</button>
                      <button onClick={() => handleDeleteInventory('tour', item._id)} className="text-red-500 font-bold text-sm hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Booking Requests</h2>
              <div className="space-y-4">
                {bookings.length === 0 && <p className="text-gray-500">No bookings for your items yet.</p>}
                
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
                      
                      {/* Show only the items the supplier owns */}
                      <div className="mt-2 pl-3 border-l-2 border-emerald-200">
                        {booking.items.map((item: any, idx: number) => (
                          <p key={idx} className="text-sm font-medium text-gray-600">{item.name} (Qty: {item.quantity})</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                        disabled={booking.status === 'confirmed' || booking.status === 'cancelled'}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                        disabled={booking.status === 'cancelled'}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Create New Listing</h3>
            
            <form onSubmit={handleCreateInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select 
                  value={newItemType} 
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="hotel">Hotel</option>
                  <option value="flight">Flight</option>
                  <option value="bus">Bus</option>
                  <option value="tour">Tour</option>
                </select>
              </div>

              {newItemType === 'hotel' && (
                <>
                  <input type="text" placeholder="Hotel Name" required onChange={e => setNewItemData({...newItemData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="City" required onChange={e => setNewItemData({...newItemData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Address" required onChange={e => setNewItemData({...newItemData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <textarea placeholder="Description" required onChange={e => setNewItemData({...newItemData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Price per night ($)" required onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Rooms Available" required onChange={e => setNewItemData({...newItemData, availableQuantity: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </>
              )}

              {newItemType === 'flight' && (
                <>
                  <input type="text" placeholder="Airline Name" required onChange={e => setNewItemData({...newItemData, airline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Flight Number" required onChange={e => setNewItemData({...newItemData, flightNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Origin" required onChange={e => setNewItemData({...newItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Destination" required onChange={e => setNewItemData({...newItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Price ($)" required onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700">Departure Time</label>
                  <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, departureTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700">Arrival Time</label>
                  <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, arrivalTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  {newItemData.image && <img src={newItemData.image} alt="preview" className="w-full h-36 object-cover rounded-xl border border-gray-200" />}
                </>
              )}

              {newItemType === 'bus' && (
                <>
                  <input type="text" placeholder="Operator Name" required onChange={e => setNewItemData({...newItemData, operator: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Origin" required onChange={e => setNewItemData({...newItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Destination" required onChange={e => setNewItemData({...newItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Ticket Fare ($)" required onChange={e => setNewItemData({...newItemData, fare: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Total Seats" required onChange={e => setNewItemData({...newItemData, totalSeats: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700">Departure Time</label>
                  <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, departureTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700">Arrival Time</label>
                  <input type="datetime-local" required onChange={e => setNewItemData({...newItemData, arrivalTime: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  {newItemData.image && <img src={newItemData.image} alt="preview" className="w-full h-36 object-cover rounded-xl border border-gray-200" />}
                </>
              )}

              {newItemType === 'tour' && (
                <>
                  <input type="text" placeholder="Tour Title" required onChange={e => setNewItemData({...newItemData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Duration (Days)" required onChange={e => setNewItemData({...newItemData, durationDays: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Pickup Point" required onChange={e => setNewItemData({...newItemData, pickupPoint: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Price ($)" required onChange={e => setNewItemData({...newItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Edit Listing</h3>
            
            <form onSubmit={handleUpdateInventorySubmit} className="space-y-4">
              {editItemType === 'hotel' && (
                <>
                  <input type="text" placeholder="Hotel Name" value={editItemData.name || ''} required onChange={e => setEditItemData({...editItemData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="City" value={editItemData.city || ''} required onChange={e => setEditItemData({...editItemData, city: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Address" value={editItemData.address || ''} required onChange={e => setEditItemData({...editItemData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <textarea placeholder="Description" value={editItemData.description || ''} required onChange={e => setEditItemData({...editItemData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Price per night ($)" value={editItemData.price || ''} required onChange={e => setEditItemData({...editItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Rooms Available" value={editItemData.availableQuantity || ''} required onChange={e => setEditItemData({...editItemData, availableQuantity: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image (Leave empty to keep existing)</label>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </>
              )}

              {editItemType === 'flight' && (
                <>
                  <input type="text" placeholder="Airline Name" value={editItemData.airline || ''} required onChange={e => setEditItemData({...editItemData, airline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Flight Number" value={editItemData.flightNumber || ''} required onChange={e => setEditItemData({...editItemData, flightNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Origin" value={editItemData.origin || ''} required onChange={e => setEditItemData({...editItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Destination" value={editItemData.destination || ''} required onChange={e => setEditItemData({...editItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Price ($)" value={editItemData.price || ''} required onChange={e => setEditItemData({...editItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </>
              )}

              {editItemType === 'bus' && (
                <>
                  <input type="text" placeholder="Operator Name" value={editItemData.operator || ''} required onChange={e => setEditItemData({...editItemData, operator: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Origin" value={editItemData.origin || ''} required onChange={e => setEditItemData({...editItemData, origin: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Destination" value={editItemData.destination || ''} required onChange={e => setEditItemData({...editItemData, destination: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Ticket Fare ($)" value={editItemData.fare || ''} required onChange={e => setEditItemData({...editItemData, fare: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Total Seats" value={editItemData.totalSeats || ''} required onChange={e => setEditItemData({...editItemData, totalSeats: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </>
              )}

              {editItemType === 'tour' && (
                <>
                  <input type="text" placeholder="Tour Title" value={editItemData.title || ''} required onChange={e => setEditItemData({...editItemData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Duration (Days)" value={editItemData.durationDays || ''} required onChange={e => setEditItemData({...editItemData, durationDays: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="text" placeholder="Pickup Point" value={editItemData.pickupPoint || ''} required onChange={e => setEditItemData({...editItemData, pickupPoint: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <input type="number" placeholder="Price ($)" value={editItemData.price || ''} required onChange={e => setEditItemData({...editItemData, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                  <label className="block text-sm font-bold text-gray-700 mt-2">Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleEditImageChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
