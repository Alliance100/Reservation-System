"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'hotel';
  const location = searchParams.get('location') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search`);
        url.searchParams.append('type', type);
        if (location) url.searchParams.append('location', location);
        if (sort) url.searchParams.append('sort', sort);
        
        const res = await fetch(url.toString(), { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [type, location, sort]);

  return (
    <div className="min-h-screen bg-[#F7FBF9] pb-24">
      {/* Header Section */}
      <div className="bg-emerald-900 pt-12 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/50 text-emerald-200 text-xs font-bold uppercase tracking-wide border border-emerald-700/50 mb-4 backdrop-blur-md">
            <span>✨</span> EcoTravel Smart Search
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            {type === 'hotel' ? 'Stays in' : type === 'flight' ? 'Flights to' : type === 'bus' ? 'Buses to' : 'Tours matching'} <span className="text-emerald-300">{location || 'Anywhere'}</span>
          </h1>
          <p className="text-emerald-100/80 text-lg max-w-2xl mx-auto font-medium">
            We found {results.length} sustainable {type} option{results.length !== 1 && 's'} curated just for you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        
        {/* AI Insight Box (2026 Trend: Zero-Click Readiness & Insights) */}
        {results.length > 0 && location && (
          <div className="mb-8 bg-white/70 backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-xl shadow-emerald-900/5 border border-white/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-12 h-12 shrink-0 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">AI Travel Insight</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                <span className="font-bold text-gray-900">{location}</span> is currently trending for eco-tourism! Expect excellent public transit options and a high density of green-certified accommodations. Booking now saves an average of 12% on carbon offsets.
              </p>
            </div>
          </div>
        )}

        {/* Filters and Sort Bar */}
        <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center gap-4">
          <div className="text-sm font-bold text-gray-700">
            {results.length} results found
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-500">Sort by:</label>
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 font-medium outline-none"
            >
              <option value="">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              {type === 'hotel' && <option value="rating_desc">Top Rated</option>}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 w-full bg-gray-100/80 rounded-3xl animate-pulse backdrop-blur-sm"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((item) => (
              <ProductCard key={item._id} item={item} type={type} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/50 backdrop-blur-xl rounded-3xl border border-white shadow-xl shadow-emerald-900/5">
            <div className="text-6xl mb-6">🏜️</div>
            <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No availability found</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto">
              We couldn't find any sustainable options for this search. Try adjusting your destination or dates.
            </p>
            <Link href="/" className="mt-8 inline-flex px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1">
              Start a new search
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ item, type }: { item: any, type: string }) {
  let title = '';
  let subtitle = '';
  let price = 0;
  let image = '';
  let href = `/${type}/${item._id}`;
  let features: string[] = [];

  if (type === 'hotel') {
    title = item.name;
    subtitle = `${item.location?.city || ''} • ★ ${item.rating || 'New'}`;
    price = item.rooms && item.rooms.length > 0 ? item.rooms[0].price : 0;
    image = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
    features = item.policies ? item.policies.slice(0, 2) : ['Eco-Friendly', 'Comfortable'];
  } else if (type === 'bus') {
    title = `${item.origin} to ${item.destination}`;
    subtitle = `${item.operator} • ${new Date(item.departureTime).toLocaleDateString()}`;
    price = item.fare;
    image = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80';
    features = ['Zero Emissions', item.boardingPoints && item.boardingPoints[0] ? `From ${item.boardingPoints[0]}` : 'Direct'];
  } else if (type === 'tour') {
    title = item.title;
    subtitle = `${item.durationDays} Days • Max ${item.maxGroupSize} people`;
    price = item.price;
    image = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80';
    features = ['Carbon Neutral', item.pickupPoint ? `Pickup: ${item.pickupPoint}` : 'Local Guide'];
  } else if (type === 'flight') {
    title = `${item.origin} to ${item.destination}`;
    subtitle = `${item.airline} • ${item.flightNumber}`;
    price = item.price;
    image = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80';
    features = [item.fareClass || 'Economy', item.baggageAllowance || '1 Checked Bag'];
  }

  return (
    <Link href={href} className="group block bg-white rounded-3xl shadow-sm hover:shadow-2xl shadow-emerald-900/5 hover:shadow-emerald-900/10 transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Large Image (Visual Storytelling Trend) */}
        <div className="sm:w-2/5 relative h-64 sm:h-auto overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden"></div>
        </div>
        
        {/* Content Area */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-lg mb-3">
                  Eco-Verified
                </span>
                <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-500 font-medium text-sm flex items-center gap-1.5">
                  <span className="text-emerald-600">📍</span> {subtitle}
                </p>
              </div>
              
              <div className="text-right ml-4">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">From</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">${price}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  {type === 'hotel' ? 'per night' : type === 'bus' ? 'per seat' : type === 'tour' ? 'per person' : 'per ticket'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600">
                  {f}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-end border-t border-gray-50 pt-6">
            <div className="inline-flex items-center justify-center px-6 py-3 bg-emerald-50 text-emerald-700 font-black rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-200">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
