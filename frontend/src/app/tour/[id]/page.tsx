"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/components/CartProvider';

export default function TourDetail() {
  const params = useParams();
  const id = params.id as string;
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleReserve = () => {
    if (!tour) return;
    addToCart({
      id: Date.now().toString(),
      itemModel: 'tour',
      itemId: tour._id,
      name: tour.title,
      price: tour.price,
      quantity: 1,
      image: tour.images && tour.images.length > 0 ? tour.images[0] : ''
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/tours/${id}`);
        const data = await res.json();
        if (data.success) {
          setTour(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch tour", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTour();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🍃</div>
          <div className="text-xl font-bold text-emerald-800">Preparing your adventure...</div>
        </div>
      </div>
    );
  }

  if (!tour) return <div className="text-center py-32 text-gray-500 font-bold text-xl">Tour not found.</div>;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-32">
      {/* Immersive Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] w-full bg-emerald-900">
        <img 
          src={tour.images && tour.images.length > 0 ? tour.images[0] : "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1920&q=80"} 
          alt={tour.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F7FBF9] via-black/20 to-black/40"></div>
        
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 translate-y-8 z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">✓</span> Carbon Neutral
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-emerald-800 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              <span className="text-emerald-500">👥</span> Max {tour.maxGroupSize} People
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-4 drop-shadow-sm">
            {tour.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* Highlights */}
            <section>
              <h2 className="text-3xl font-black text-gray-900 mb-8">Tour Overview</h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-10">
                Immerse yourself in nature with our {tour.durationDays}-day eco-certified adventure. Every aspect of this tour has been designed to minimize environmental impact while maximizing your connection to the local ecosystem.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '⏱️', label: 'Duration', value: `${tour.durationDays} Days` },
                  { icon: '🥾', label: 'Activity Level', value: 'Moderate' },
                  { icon: '🗣️', label: 'Languages', value: 'English, Spanish' },
                  { icon: '🌱', label: 'Eco Impact', value: 'Positive' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary Timeline */}
            <section>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-900">Your Itinerary</h2>
                <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-colors">
                  Download PDF
                </button>
              </div>

              <div className="relative border-l-4 border-emerald-100/50 ml-6 space-y-12 pb-4">
                {tour.itinerary?.map((item: any, i: number) => (
                  <div key={i} className="relative pl-10 group">
                    {/* Organic Dot */}
                    <div className="absolute -left-5 top-1 w-9 h-9 bg-white border-4 border-emerald-200 rounded-full flex items-center justify-center shadow-sm group-hover:border-emerald-500 group-hover:scale-110 transition-all">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:shadow-emerald-900/5 transition-all">
                      <div className="text-xs font-black text-emerald-600 uppercase tracking-wider mb-2">Day {item.day}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-4">{item.description.split('.')[0] || `Exploring the Wild`}</h4>
                      <p className="text-gray-600 leading-relaxed font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
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
                High Demand: 4 people looking now
              </div>

              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gradient-to-b from-gray-50 to-white">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-4xl font-black text-gray-900 tracking-tight">${tour.price}</p>
                    <p className="text-sm font-bold text-gray-400 mb-1">/ person</p>
                  </div>
                  <p className="text-sm font-medium text-gray-500">Includes all taxes and eco-fees.</p>
                </div>

                <div className="p-8">
                  {/* Includes / Excludes UI */}
                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">What's Included</h3>
                      <ul className="space-y-2">
                        {tour.inclusions?.map((inc: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-gray-600 font-medium">
                            <span className="text-emerald-500 mr-2.5 mt-0.5">✓</span> {inc}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Not Included</h3>
                      <ul className="space-y-2">
                        {tour.exclusions?.map((exc: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-gray-400 font-medium line-through">
                            <span className="mr-2.5 mt-0.5 opacity-50">✗</span> {exc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button 
                    onClick={handleReserve}
                    disabled={added}
                    className={`w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 text-lg ${added ? 'bg-gray-900 shadow-gray-900/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'}`}
                  >
                    {added ? 'Added to Cart ✓' : 'Book Tour'}
                  </button>
                  <p className="text-center text-xs text-gray-400 font-bold mt-4">No charge until confirmed</p>
                </div>
              </div>
              
              {/* Extra Trust Indicator */}
              <div className="mt-6 flex items-center justify-center gap-3 text-gray-500">
                <span className="text-xl">🔒</span>
                <span className="text-xs font-bold uppercase tracking-wider">Bank-Level Security</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
