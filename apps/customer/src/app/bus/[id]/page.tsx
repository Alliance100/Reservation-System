"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';

export default function BusDetail() {
  const params = useParams();
  const id = params.id as string;
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  // Date & Time Requirements State
  const [travelDate, setTravelDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [departureTimeSlot, setDepartureTimeSlot] = useState("Morning Departure (08:30 AM)");
  const [seats, setSeats] = useState(1);

  const handleReserve = () => {
    if (!bus) return;
    addToCart({
      id: Date.now().toString(),
      itemModel: 'bus',
      itemId: bus._id,
      name: `${bus.origin} to ${bus.destination}`,
      price: bus.fare,
      quantity: seats,
      selectedDate: travelDate,
      selectedTime: departureTimeSlot,
      details: {
        travelDate,
        departureTimeSlot,
        operator: bus.operator,
        origin: bus.origin,
        destination: bus.destination,
        seats
      },
      image: bus.images && bus.images.length > 0 ? bus.images[0] : ''
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/buses/${id}`);
        const data = await res.json();
        if (data.success) {
          setBus(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch bus", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBus();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🚌</div>
          <div className="text-xl font-bold text-emerald-800">Finding your route...</div>
        </div>
      </div>
    );
  }

  if (!bus) return <div className="text-center py-32 text-gray-500 font-bold text-xl">Bus not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-emerald-900">
        <img 
          src={bus.images && bus.images.length > 0 ? bus.images[0] : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80"} 
          alt="EV Bus" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FBF9] via-black/20 to-black/40"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 translate-y-8 z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">⚡</span> 100% Electric
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">🚌</span> {bus.operator}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 drop-shadow-sm">
            {bus.origin} to {bus.destination}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Route Details */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Journey Details</h2>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 relative overflow-hidden">
                <div className="absolute left-12 top-14 bottom-14 w-1 bg-emerald-100 rounded-full"></div>
                
                <div className="flex items-start mb-10 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex-shrink-0 relative z-10 mt-1"></div>
                  <div className="ml-6">
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">Departure</div>
                    <div className="text-2xl font-bold text-gray-900">{new Date(bus.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-gray-500 font-medium">{new Date(bus.departureTime).toLocaleDateString()} • {bus.origin}</div>
                  </div>
                </div>

                <div className="flex items-start relative">
                  <div className="w-8 h-8 rounded-full bg-gray-900 border-4 border-white shadow-sm flex-shrink-0 relative z-10 mt-1"></div>
                  <div className="ml-6">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Arrival</div>
                    <div className="text-2xl font-bold text-gray-900">{new Date(bus.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-gray-500 font-medium">{new Date(bus.arrivalTime).toLocaleDateString()} • {bus.destination}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { icon: '💺', label: 'Seats', value: `${bus.availableSeats} Left` },
                  { icon: '📶', label: 'Wi-Fi', value: 'Free Onboard' },
                  { icon: '🔌', label: 'Power', value: 'At Every Seat' },
                  { icon: '🌿', label: 'Emissions', value: 'Zero' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Boarding and Drop Points */}
              <div className="grid md:grid-cols-2 gap-8">
                {bus.boardingPoints && bus.boardingPoints.length > 0 && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Boarding Points</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 font-medium">
                      {bus.boardingPoints.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {bus.dropPoints && bus.dropPoints.length > 0 && (
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Drop Points</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 font-medium">
                      {bus.dropPoints.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sticky Booking Widget (Right) */}
          <div className="lg:col-span-5 xl:col-span-4 mt-16 lg:mt-0 relative">
            <div className="sticky top-32">
              
              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-black text-gray-900 tracking-tight">${bus.fare}</p>
                    <p className="text-sm font-bold text-gray-400 mb-1">/ seat</p>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Includes all taxes and eco-fees.</p>
                </div>

                <div className="p-8">
                  {/* Select Travel Date & Time */}
                  <div className="space-y-4 mb-6 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">Your Travel Requirements</h3>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Travel Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Boarding / Departure Slot</label>
                      <select
                        value={departureTimeSlot}
                        onChange={(e) => setDepartureTimeSlot(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      >
                        <option value="Morning Departure (08:30 AM)">Morning Departure (08:30 AM)</option>
                        <option value="Mid-Day Departure (01:00 PM)">Mid-Day Departure (01:00 PM)</option>
                        <option value="Evening Departure (06:30 PM)">Evening Departure (06:30 PM)</option>
                        <option value="Night Express (10:00 PM)">Night Express (10:00 PM)</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-emerald-100/60 text-xs">
                      <span className="text-gray-500 font-medium">Seats Selected:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSeats(s => Math.max(1, s - 1))}
                          className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 font-black text-xs flex items-center justify-center"
                        >-</button>
                        <span className="font-black text-sm text-gray-900 w-4 text-center">{seats}</span>
                        <button
                          type="button"
                          onClick={() => setSeats(s => Math.min(bus.availableSeats || 10, s + 1))}
                          className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleReserve}
                    disabled={added}
                    className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg ${added ? 'bg-gray-900 shadow-gray-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
                  >
                    {added ? 'Added to Cart ✓' : `Book ${seats} Seat${seats > 1 ? 's' : ''} • $${bus.fare * seats}`}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-bold mt-4">E-ticket delivered instantly</p>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
