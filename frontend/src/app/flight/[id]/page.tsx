"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function FlightDetail() {
  const params = useParams();
  const id = params.id as string;
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/flights/${id}`);
        const data = await res.json();
        if (data.success) {
          setFlight(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch flight", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFlight();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">✈️</div>
          <div className="text-xl font-bold text-emerald-800">Preparing for takeoff...</div>
        </div>
      </div>
    );
  }

  if (!flight) return <div className="text-center py-32 text-gray-500 font-bold text-xl">Flight not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-emerald-900">
        <img 
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80" 
          alt="Flight" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FBF9] via-black/20 to-black/40"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 translate-y-8 z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">✈️</span> {flight.airline}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">🎫</span> Flight {flight.flightNumber}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 drop-shadow-sm">
            {flight.origin} to {flight.destination}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Flight Details */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Flight Details</h2>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10 relative overflow-hidden">
                <div className="absolute left-12 top-14 bottom-14 w-1 border-l-2 border-dashed border-gray-200"></div>
                
                <div className="flex items-start mb-12 relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex-shrink-0 relative z-10 mt-1"></div>
                  <div className="ml-6">
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">Takeoff</div>
                    <div className="text-2xl font-bold text-gray-900">{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-gray-500 font-medium">{new Date(flight.departureTime).toLocaleDateString()} • {flight.origin} Airport</div>
                  </div>
                </div>

                <div className="flex items-start relative">
                  <div className="w-8 h-8 rounded-full bg-gray-900 border-4 border-white shadow-sm flex-shrink-0 relative z-10 mt-1"></div>
                  <div className="ml-6">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Landing</div>
                    <div className="text-2xl font-bold text-gray-900">{new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    <div className="text-gray-500 font-medium">{new Date(flight.arrivalTime).toLocaleDateString()} • {flight.destination} Airport</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '⏱️', label: 'Duration', value: flight.duration },
                  { icon: '💺', label: 'Seats', value: `${flight.availableSeats} Left` },
                  { icon: '🌍', label: 'Offset', value: '100% Carbon' },
                  { icon: '🧳', label: 'Luggage', value: '1 Checked Bag' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Booking Widget (Right) */}
          <div className="lg:col-span-5 xl:col-span-4 mt-16 lg:mt-0 relative">
            <div className="sticky top-32">
              
              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-black text-gray-900 tracking-tight">${flight.price}</p>
                    <p className="text-sm font-bold text-gray-400 mb-1">/ passenger</p>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Includes mandatory carbon offset fee.</p>
                </div>

                <div className="p-8">
                  <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-1 active:scale-95 text-lg">
                    Book Flight
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
