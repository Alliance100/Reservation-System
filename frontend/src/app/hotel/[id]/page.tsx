"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function HotelDetail() {
  const params = useParams();
  const id = params.id as string;
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/hotels/${id}`);
        const data = await res.json();
        if (data.success) {
          setHotel(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch hotel", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🏨</div>
          <div className="text-xl font-bold text-emerald-800">Preparing your stay...</div>
        </div>
      </div>
    );
  }

  if (!hotel) return <div className="text-center py-32 text-gray-500 font-bold text-xl">Hotel not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-emerald-900">
        <img 
          src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"} 
          alt={hotel.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FBF9] via-black/20 to-black/40"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 translate-y-8 z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">🍃</span> Eco-Certified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">⭐</span> {hotel.rating} Rating
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 drop-shadow-sm">
            {hotel.name}
          </h1>
          <p className="text-xl font-bold text-gray-800 drop-shadow-md">
            📍 {hotel.location?.city}, {hotel.location?.country}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Highlights */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">About this Hotel</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10">
                Experience unparalleled comfort while staying true to your eco-friendly values. This property operates on 100% renewable energy and features zero-waste dining options.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🌿', label: 'Energy', value: '100% Solar' },
                  { icon: '♻️', label: 'Waste', value: 'Zero Waste' },
                  { icon: '📶', label: 'Wi-Fi', value: 'Ultra Fast' },
                  { icon: '🏊', label: 'Pool', value: 'Chemical Free' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Amenities</h2>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {hotel.amenities?.map((amenity: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">✓</div>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Booking Widget (Right) */}
          <div className="lg:col-span-5 xl:col-span-4 mt-16 lg:mt-0 relative">
            <div className="sticky top-32">
              
              {/* Trust/AI Badge */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 w-max bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Highly Rated by EcoTravelers
              </div>

              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-black text-gray-900 tracking-tight">${hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0].price : 'N/A'}</p>
                    <p className="text-sm font-bold text-gray-400 mb-1">/ night</p>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Includes all taxes and eco-fees.</p>
                </div>

                <div className="p-8">
                  {/* Room options UI */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">Available Rooms</h3>
                    {hotel.rooms?.map((room: any, i: number) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-emerald-300 transition-colors cursor-pointer group">
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-emerald-700">{room.type}</div>
                          <div className="text-xs text-gray-500 font-medium mt-1">Capacity: {room.capacity}</div>
                        </div>
                        <div className="font-black text-gray-900">${room.price}</div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all hover:-translate-y-1 active:scale-95 text-lg">
                    Reserve Now
                  </button>
                  <p className="text-center text-xs text-gray-400 font-bold mt-4">Free cancellation for 48 hours</p>
                </div>
              </div>
              
              {/* Extra Trust Indicator */}
              <div className="mt-6 flex items-center justify-center gap-3 text-gray-500">
                <span className="text-xl">🛡️</span>
                <span className="text-xs font-bold uppercase tracking-wider">Verified Sustainable</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
