"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hotel' | 'bus' | 'tour' | 'flight'>('hotel');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const getSuggestions = () => {
    switch (activeTab) {
      case 'hotel': return ['New York', 'London', 'Paris', 'Tokyo'];
      case 'bus': return ['Boston', 'New York', 'Washington DC', 'Philadelphia'];
      case 'tour': return ['Forest Adventure', 'Mountain Trek', 'City Tour'];
      case 'flight': return ['LHR (London)', 'JFK (New York)', 'LAX (Los Angeles)', 'CDG (Paris)'];
      default: return [];
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      let searchQuery = location;
      if (searchQuery.includes('(')) {
        searchQuery = searchQuery.split(' (')[0];
      }
      router.push(`/search?type=${activeTab}&location=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen -mt-6">
      {/* Hero Section */}
      <div className="relative bg-emerald-900 overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 h-[500px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2000&q=80"
            alt="Forest Landscape"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
            Discover the World, <br/><span className="text-emerald-300">Sustainably.</span>
          </h1>
          <p className="text-lg sm:text-xl text-emerald-50 mb-10 font-light">
            Book eco-friendly hotels, electric buses, nature tours, and carbon-offset flights.
          </p>
        </div>
      </div>

      {/* Search Widget */}
      <div className="relative z-20 max-w-4xl mx-auto -mt-24 px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-900/10 p-2 sm:p-3 border border-gray-100">
          
          {/* Tabs */}
          <div className="flex space-x-1 mb-2 px-2 pt-2 overflow-x-auto no-scrollbar">
            {['hotel', 'bus', 'tour', 'flight'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab === 'hotel' ? 'Eco Hotels' : tab === 'bus' ? 'EV Buses' : tab === 'tour' ? 'Nature Tours' : 'Flights'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative mt-2">
            <div className="flex items-center bg-gray-50/80 hover:bg-gray-100/80 border border-transparent focus-within:border-emerald-200 focus-within:bg-white rounded-2xl p-2 transition-all">
              
              {/* Icon */}
              <div className="pl-4 pr-3 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Input */}
              <div className="flex-1 relative">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5 ml-1">Where to?</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search destinations..."
                  className="w-full text-lg font-bold text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none ml-1 pb-1"
                />
                
                {/* Auto-suggestions Dropdown */}
                {showSuggestions && getSuggestions().length > 0 && (
                  <div className="absolute top-full left-0 mt-4 w-full sm:w-96 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden z-50 py-2">
                    {getSuggestions()
                      .filter(s => s.toLowerCase().includes(location.toLowerCase()))
                      .map((sug, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setLocation(sug);
                          setShowSuggestions(false);
                        }}
                        className="px-5 py-3 hover:bg-emerald-50 cursor-pointer flex items-center group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-200 flex items-center justify-center mr-4 transition-colors">
                          <span className="text-gray-500 group-hover:text-emerald-700">📍</span>
                        </div>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium">{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Button */}
              <button
                type="submit"
                className="ml-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-50">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Eco-Friendly</h3>
            <p className="text-gray-500">Every listing on our platform passes strict sustainability criteria.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-50">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Booking</h3>
            <p className="text-gray-500">Secure your spot instantly with our real-time availability sync.</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-50">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-500">Your transactions are protected by bank-level security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
