"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Helper formatters for comprehensive booking and schedule details
function formatItemDates(item: any, createdAt: string) {
  if (item.selectedDate) return item.selectedDate;
  if (item.details?.selectedDate) return item.details.selectedDate;
  if (item.details?.checkInDate && item.details?.checkOutDate) {
    return `${item.details.checkInDate} to ${item.details.checkOutDate} (${item.details.nights || 1} night${(item.details.nights || 1) > 1 ? 's' : ''})`;
  }
  if (item.details?.travelDate) return item.details.travelDate;
  if (item.details?.tourDate) return item.details.tourDate;
  
  const d = new Date(createdAt || Date.now());
  const tomorrow = new Date(d.getTime() + 86400000).toISOString().split('T')[0];
  const end = new Date(d.getTime() + 3 * 86400000).toISOString().split('T')[0];
  if (item.itemType === 'hotel') return `${tomorrow} to ${end} (2 nights)`;
  return tomorrow;
}

function formatItemTime(item: any) {
  if (item.selectedTime) return item.selectedTime;
  if (item.details?.selectedTime) return item.details.selectedTime;
  if (item.details?.checkInTime) return item.details.checkInTime;
  if (item.details?.departureTimeSlot) return item.details.departureTimeSlot;
  if (item.details?.flightTimeWindow) return item.details.flightTimeWindow;
  if (item.details?.tourTimeSlot) return item.details.tourTimeSlot;
  
  if (item.itemType === 'hotel') return "02:00 PM - 04:00 PM (Standard Check-in)";
  if (item.itemType === 'bus') return "Morning Departure (08:30 AM)";
  if (item.itemType === 'flight') return "Morning Flight (07:30 AM)";
  if (item.itemType === 'tour') return "Morning Expedition (08:30 AM)";
  return "Standard Time Slot";
}

function getItemSpecification(item: any) {
  if (item.details?.roomType) return `Room: ${item.details.roomType}`;
  if (item.details?.operator) return `Operator: ${item.details.operator}`;
  if (item.details?.airline) return `Airline: ${item.details.airline} ${item.details.flightNumber ? `• Flight #${item.details.flightNumber}` : ''}`;
  if (item.details?.pickupPoint) return `Pickup: ${item.details.pickupPoint}`;
  return null;
}

function getItemOccupancy(item: any) {
  if (item.details?.guests) return `${item.details.guests} Guests`;
  if (item.details?.seats) return `${item.details.seats} Seat(s)`;
  if (item.details?.participants) return `${item.details.participants} Guest(s)`;
  if (item.details?.passengers) return `${item.details.passengers} Passenger(s)`;
  return `Quantity: ${item.quantity}`;
}

function formatFullBookingTimestamp(createdAt: string) {
  const d = new Date(createdAt || Date.now());
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${dateStr} at ${timeStr}`;
}

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);

  // Selected Booking for Travel Voucher & Invoice Modal
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);

  useEffect(() => {
    if (authLoading) return;

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

  // Calculate Total Carbon Offset
  const totalCarbonSaved = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.items?.length || 1) * 38.5, 0);
  }, [bookings]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500 text-sm">Loading your reservations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32 pt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Eco Impact & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🌿</span> Sustainable Travel Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">My Reservations</h1>
            <p className="text-gray-500 font-medium mt-1">Manage reservations, generate official travel vouchers, and track your scheduled dates & times.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">CO₂ Offset</p>
                <p className="text-lg font-black text-emerald-800">{totalCarbonSaved.toFixed(0)} kg</p>
              </div>
            </div>

            <div className="px-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
              <span className="text-2xl">🎫</span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Active Bookings</p>
                <p className="text-lg font-black text-gray-900">{bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}</p>
              </div>
            </div>

            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] text-sm"
            >
              <span>+</span> Book More
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-lg mx-auto">
            <div className="text-6xl mb-4">🍃</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-500 font-medium mb-8">You haven't booked any eco-friendly stays, buses, tours, or flights yet.</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
            >
              <span>🔍</span> Explore Experiences
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-emerald-100">
                <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400 text-xs font-mono font-bold">
                        #{booking._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs font-medium">
                        • Placed on <strong className="text-gray-800">{formatFullBookingTimestamp(booking.createdAt)}</strong>
                      </span>
                    </div>

                    <div className="space-y-3">
                      {booking.items.map((item: any, idx: number) => {
                        const spec = getItemSpecification(item);
                        const dates = formatItemDates(item, booking.createdAt);
                        const time = formatItemTime(item);
                        const occ = getItemOccupancy(item);

                        return (
                          <div key={idx} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100/80 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {item.itemType === 'hotel' ? '🏨' : item.itemType === 'bus' ? '🚌' : item.itemType === 'flight' ? '✈️' : '🌲'}
                                </span>
                                <div>
                                  <h4 className="font-black text-gray-900 text-base">{item.name}</h4>
                                  <p className="text-xs text-gray-500 font-medium">
                                    {item.itemType.toUpperCase()} • {occ} • ${item.price} each
                                    {spec && ` • ${spec}`}
                                  </p>
                                </div>
                              </div>
                              <span className="font-black text-gray-900 text-base">${item.price * item.quantity}</span>
                            </div>
                            
                            {/* Complete Schedule Badges */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                                <span>📅</span> Schedule: {dates}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200/60">
                                <span>⏰</span> Time: {time}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing & Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                      <p className="text-3xl font-black text-gray-900">${booking.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedVoucher(booking)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                      >
                        <span>📄</span> Official Voucher & PDF
                      </button>

                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <button 
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancelLoading === booking._id}
                          className="px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                        >
                          {cancelLoading === booking._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Printable Travel Voucher & Invoice Modal */}
      {selectedVoucher && (
        <div className="voucher-modal-container fixed inset-0 bg-gray-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="voucher-modal-inner bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 p-5 sm:p-6">
            
            {/* Modal Actions Bar (hidden when printing) */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌿</span>
                <span className="font-black text-gray-900 text-sm">Official Travel Voucher & Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>🖨️</span> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Ticket Area */}
            <div className="printable-ticket border-2 border-dashed border-emerald-300 rounded-3xl p-5 sm:p-6 bg-gradient-to-b from-[#f7fbf9] to-white space-y-4">
              
              {/* Ticket Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-base font-black shadow-sm">
                      🍃
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tight">EcoTravel.</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-bold mt-0.5">Verified Sustainable Itinerary • Official Document</p>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    selectedVoucher.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedVoucher.status === 'confirmed' ? 'CONFIRMED • PAID' : selectedVoucher.status.toUpperCase()}
                  </span>
                  <p className="font-mono text-xs font-black text-gray-900 mt-1">
                    Order Ref: #{selectedVoucher._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Comprehensive Booking Meta & Traveler Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3.5 bg-white rounded-2xl border border-gray-100 text-xs shadow-sm">
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">Lead Traveler</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">{user?.name || "Demo Customer"}</p>
                  <p className="text-gray-500 text-[10px] truncate">{user?.email || "customer@ecotravel.com"}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">Booking Placed</p>
                  <p className="font-black text-gray-900 text-xs mt-0.5">
                    {new Date(selectedVoucher.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-gray-500 text-[10px] font-medium">
                    {new Date(selectedVoucher.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">Payment Method</p>
                  <p className="font-black text-emerald-700 text-xs mt-0.5">EcoPay Secured</p>
                  <p className="text-gray-500 text-[10px]">Card ending in 4242</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase text-[9px]">Total Amount Paid</p>
                  <p className="font-black text-xl text-gray-900 mt-0.5">${selectedVoucher.totalAmount.toFixed(2)}</p>
                  <p className="text-emerald-600 text-[9px] font-bold">All taxes & fees included</p>
                </div>
              </div>

              {/* Reserved Items with Complete Dates, Times, and Specifications */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-black text-gray-700 uppercase tracking-wider">Itinerary & Schedule Breakdown</p>
                {selectedVoucher.items.map((item: any, idx: number) => {
                  const spec = getItemSpecification(item);
                  const dates = formatItemDates(item, selectedVoucher.createdAt);
                  const time = formatItemTime(item);
                  const occ = getItemOccupancy(item);

                  return (
                    <div key={idx} className="p-3.5 bg-white rounded-2xl border border-gray-100 space-y-2 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base font-bold">
                            {item.itemType === 'hotel' ? '🏨' : item.itemType === 'bus' ? '🚌' : item.itemType === 'flight' ? '✈️' : '🌲'}
                          </div>
                          <div>
                            <h4 className="font-black text-gray-900 text-sm">{item.name}</h4>
                            <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
                              Category: {item.itemType} • {occ} {spec ? `• ${spec}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-gray-900 text-base">${item.price * item.quantity}</span>
                          <p className="text-[9px] text-gray-400 font-bold">${item.price} × {item.quantity}</p>
                        </div>
                      </div>
                      
                      {/* Comprehensive Date & Time Schedule Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📅</span>
                          <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase">Scheduled Dates / Duration</p>
                            <p className="text-xs font-black text-emerald-950">{dates}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">⏰</span>
                          <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase">Check-in / Departure Time</p>
                            <p className="text-xs font-black text-emerald-950">{time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Important Check-in & Boarding Instructions */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] space-y-1 text-gray-600 leading-snug">
                <p className="font-black text-gray-900 text-[10px] uppercase tracking-wider">Important Instructions</p>
                <p>• <strong>Hotel Check-in:</strong> Front desk check-in commences during the arrival window. Valid photo ID required.</p>
                <p>• <strong>EV Transit & Flights:</strong> Please arrive 15 minutes before scheduled departure.</p>
                <p>• <strong>Cancellation:</strong> Free cancellation up to 48 hours before the scheduled service date.</p>
              </div>

              {/* QR Code & Eco Verification Stamp */}
              <div className="flex items-center justify-between pt-3 border-t border-dashed border-gray-200">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <span>🌱</span> 100% Carbon Neutral Certified (42kg CO₂ Saved)
                  </div>
                  <p className="text-[10px] text-gray-500">Scan QR barcode or present Order Ref <strong>#{selectedVoucher._id.slice(-8).toUpperCase()}</strong> at check-in desk.</p>
                  <p className="text-[9px] font-mono text-gray-400">AUTH-TOKEN: ECO-VCH-{selectedVoucher._id.slice(-8).toUpperCase()}-2026</p>
                </div>

                {/* SVG Simulated QR Code */}
                <div className="w-14 h-14 bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h3v3h-3v-3zm0 5h3v3h-3v-3zm-5-5h3v3h-3v-3zm0 5h3v3h-3v-3z"/>
                  </svg>
                </div>
              </div>

            </div>

            <div className="mt-4 flex justify-end print:hidden">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close Voucher
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
