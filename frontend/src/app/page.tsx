"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hotel' | 'bus' | 'tour' | 'flight'>('hotel');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      router.push(`/search?type=${activeTab}&location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div className="min-h-screen -mt-6">
      {/* Hero Section */}
      <div className="relative bg-emerald-900 overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 h-[500px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518182170546-076616fdcd80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
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
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
          {/* Tabs */}
          <div className="flex space-x-2 sm:space-x-4 mb-6 border-b border-gray-100 pb-4 overflow-x-auto">
            {['hotel', 'bus', 'tour', 'flight'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap capitalize
                  ${activeTab === tab 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                {tab === 'hotel' ? 'Eco Hotels' : tab === 'bus' ? 'EV Buses' : tab === 'tour' ? 'Nature Tours' : 'Flights'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Destination
              </label>
              <input
                type="text"
                placeholder="Where are you going?"
                className="w-full text-lg text-gray-900 placeholder-gray-400 bg-transparent border-b-2 border-gray-200 focus:border-emerald-500 focus:outline-none py-2 transition-colors"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200"
              >
                Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s
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
