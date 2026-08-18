"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RevealOnScroll from '@/components/RevealOnScroll';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'hotel' | 'bus' | 'tour' | 'flight'>('hotel');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const router = useRouter();

  // Interactive Carbon Calculator State
  const [distanceKm, setDistanceKm] = useState<number>(450);
  const [travelMode, setTravelMode] = useState<'bus' | 'flight' | 'car'>('bus');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Email Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/suggestions?type=${activeTab}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setDynamicSuggestions(data.data);
        }
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    };
    fetchSuggestions();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      let searchQuery = location;
      if (searchQuery.includes('(')) {
        searchQuery = searchQuery.split(' (')[0];
      }
      router.push(`/search?type=${activeTab}&location=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/search?type=${activeTab}`);
    }
  };

  // Carbon calculator logic
  const standardCarCO2 = Math.round(distanceKm * 0.17);
  const flightCO2 = Math.round(distanceKm * 0.25);
  const evBusCO2 = Math.round(distanceKm * 0.03);
  const co2Saved = travelMode === 'bus' ? (standardCarCO2 - evBusCO2) : (flightCO2 - Math.round(distanceKm * 0.08));
  const treesEquivalent = (co2Saved / 15).toFixed(1);

  const faqs = [
    {
      q: "How does EcoTravel certify sustainable properties and transit?",
      a: "Every listing undergoes a rigorous 24-point audit verifying 100% renewable energy reliance, zero single-use plastics, local organic sourcing, and ethical employment practices."
    },
    {
      q: "How does the Carbon Offset Travel Voucher work?",
      a: "After completing your booking, your account generates an official downloadable travel voucher with a QR code and verified carbon savings certificate based on the exact distance traveled."
    },
    {
      q: "Can I use promotional coupons on all categories?",
      a: "Yes! Promotional coupons (such as ECOSUMMER) can be applied directly in the slide-over checkout cart for instant discounts on Eco Hotels, EV Buses, Nature Tours, and Flights."
    },
    {
      q: "Are the EV buses and nature guides locally operated?",
      a: "100% of our ground transport and eco-tours are operated by certified local green partners, ensuring money directly supports local nature conservation and communities."
    },
  ];

  return (
    <div className="min-h-screen -mt-6 space-y-28 pb-28 overflow-x-hidden">

      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <div className="relative mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 py-12 sm:py-16 md:py-20 flex items-center justify-center shadow-xl shadow-emerald-950/20 border border-emerald-500/20">

          {/* Ambient Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=2200&q=80"
              alt="Pristine Forest Landscape"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover opacity-25 filter saturate-[1.2] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl pb-12 sm:pb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              🌿 Next-Gen Sustainable Travel Experience
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-[1.1] drop-shadow-sm">
              Discover the World, <br />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-100 bg-clip-text text-transparent">
                Without the Footprint.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 font-medium max-w-xl mx-auto leading-relaxed drop-shadow-sm">
              Book certified eco-lodges, electric bus corridors, immersive nature sanctuaries, and carbon-neutral flights in one unified journey.
            </p>
          </div>
        </div>

        {/* ── SEARCH WIDGET FLOATING CARD ────────────────────────── */}
        <div className="relative z-30 max-w-4xl mx-auto -mt-10 sm:-mt-12 px-4 sm:px-6">
          <RevealOnScroll direction="up" delay={80}>
            <div className="bg-white/95 dark:bg-[#13201b]/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-emerald-950/20 p-4 sm:p-5 border border-emerald-100/80 dark:border-emerald-500/20 card-interactive">

              {/* Category Tabs */}
              <div className="flex space-x-1.5 mb-3 px-1 pt-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'hotel', label: 'Eco Hotels & Lodges', icon: '🏨' },
                  { id: 'bus', label: 'EV Buses', icon: '🚌' },
                  { id: 'tour', label: 'Nature Tours', icon: '🌲' },
                  { id: 'flight', label: 'Carbon-Offset Flights', icon: '✈️' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-[#1c3029]'
                    }`}
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Input Form */}
              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col sm:flex-row items-center bg-gray-50/90 dark:bg-[#162620] hover:bg-gray-100/80 dark:hover:bg-[#1a2d26] border border-gray-200/80 dark:border-[#274238] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl p-2.5 transition-all gap-2.5">

                  {/* Search Bar Icon & Input */}
                  <div className="flex items-center flex-1 w-full pl-3">
                    <div className="text-emerald-600 dark:text-emerald-400 mr-3 text-xl">🔍</div>
                    <div className="flex-1 relative">
                      <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                        Destination / Departure
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="e.g. Switzerland, Costa Rica, Oslo, Paris..."
                        className="w-full text-base sm:text-lg font-black text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none pb-1"
                      />

                      {/* Auto-suggestions Dropdown */}
                      {showSuggestions && dynamicSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 mt-3 w-full sm:w-96 bg-white dark:bg-[#13201b] rounded-2xl shadow-2xl border border-gray-100 dark:border-emerald-500/20 overflow-hidden z-50 py-2 animate-in fade-in zoom-in-95">
                          {dynamicSuggestions
                            .filter(s => s.toLowerCase().includes(location.toLowerCase()))
                            .map((sug, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setLocation(sug);
                                  setShowSuggestions(false);
                                }}
                                className="px-4 py-3 hover:bg-emerald-50 dark:hover:bg-[#1c3029] cursor-pointer flex items-center group transition-colors"
                              >
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-[#162620] group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 flex items-center justify-center mr-3 transition-colors text-emerald-700 dark:text-emerald-400 font-bold">
                                  📍
                                </div>
                                <span className="text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white font-bold text-sm">{sug}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search Action Button */}
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 text-sm flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Explore Listings</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </form>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      {/* ── INTERACTIVE CARBON CALCULATOR WIDGET ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll direction="up" delay={120}>
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-900 via-teal-950 to-gray-950 p-8 sm:p-14 text-white shadow-2xl border border-emerald-400/20 card-interactive">
            
            {/* Background Glow Mesh */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-inner">
                  ⚡ Dynamic Eco Tool
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Calculate Your Real Carbon Savings Before Booking
                </h2>
                <p className="text-emerald-100/80 text-sm sm:text-base font-medium leading-relaxed">
                  Experience immediate environmental impact. See how much $CO_2$ and tree equivalents you save when choosing an EV bus or eco-certified accommodation over traditional travel.
                </p>

                {/* Slider for Distance */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-emerald-200">Trip Distance:</span>
                    <span className="text-2xl font-black text-white font-mono bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/30">{distanceKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2500"
                    step="50"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full h-3 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-400 shadow-inner"
                  />
                  <div className="flex justify-between text-[11px] text-emerald-300/70 font-bold">
                    <span>50 km (Short Hop)</span>
                    <span>1,000 km</span>
                    <span>2,500 km (Cross-Country)</span>
                  </div>
                </div>
              </div>

              {/* Live Comparison Gauge */}
              <div className="lg:col-span-6 bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300">Emissions Comparison</span>
                  <span className="text-xs font-bold text-gray-300 font-mono">{distanceKm} km Journey</span>
                </div>

                {/* Comparative Emission Bars */}
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-red-300 flex items-center gap-1.5"><span>🚗</span> Standard Gas Car</span>
                      <span className="font-mono text-red-200 font-black">{standardCarCO2} kg CO₂</span>
                    </div>
                    <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-emerald-300 flex items-center gap-1.5"><span>🚌</span> EcoTravel Electric Bus</span>
                      <span className="font-mono text-emerald-200 font-black">{evBusCO2} kg CO₂</span>
                    </div>
                    <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-300 shadow-sm" style={{ width: `${Math.max(6, Math.round((evBusCO2 / standardCarCO2) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Highlight Result Card */}
                <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-lg shadow-emerald-950/40">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-emerald-300">Your Net CO₂ Saved</p>
                    <p className="text-3xl font-black text-white">{co2Saved} kg CO₂</p>
                    <p className="text-xs text-emerald-200 font-medium mt-0.5">Equivalent to planting ~<span className="font-bold text-white">{treesEquivalent}</span> mature trees</p>
                  </div>
                  <button
                    onClick={() => router.push(`/search?type=bus`)}
                    className="w-full sm:w-auto px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-black rounded-xl text-xs transition-all hover:scale-105 shadow-md whitespace-nowrap cursor-pointer"
                  >
                    Book EV Routes →
                  </button>
                </div>
              </div>

            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* ── SUSTAINABILITY CERTIFICATION PILLARS ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Guaranteed Standards</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Why EcoTravel is Trusted Globally</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
              We eliminate greenwashing by enforcing verified environmental audits across every host and transit corridor.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '☀️', title: '100% Renewable Power', desc: 'Properties powered exclusively by solar arrays, geothermal energy, or regional clean hydro grids.' },
            { icon: '♻️', title: 'Zero Single-Use Plastic', desc: 'Filtered hydration stations, organic compostable toiletries, and circular waste systems.' },
            { icon: '🥕', title: 'Farm-to-Table Food', desc: 'Hyper-local organic dining sourced within 20km from regenerative local agriculture.' },
            { icon: '⚡', title: 'Clean Mobility Network', desc: 'Certified electric bus routes, solar bike shares, and high-speed EV charging hubs.' },
          ].map((pillar, i) => (
            <RevealOnScroll key={i} direction="up" delay={i * 90}>
              <div className="h-full p-7 bg-white dark:bg-[#13201b] rounded-3xl border border-gray-100 dark:border-[#1f332b] shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/40 card-interactive flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-[#162620] text-emerald-800 dark:text-emerald-400 text-3xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {pillar.icon}
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-base mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{pillar.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* ── VERIFIED TRAVELER EXPERIENCES ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <RevealOnScroll direction="up">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Verified Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Loved by Conscious Travelers</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Stories from travelers exploring the planet with verifiable zero guilt.</p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "The Swiss Solar Sanctuary blew my mind. Waking up to the Matterhorn powered 100% by solar panels, zero waste dining, and downloadable carbon offset proof on my phone was incredible.",
              author: "Sophia L.",
              trip: "Zermatt Eco Stay",
              saved: "64 kg CO₂ saved"
            },
            {
              quote: "Riding the EV Express bus across Norway was so quiet, smooth, and panoramic. The onboard Wi-Fi worked flawlessly and booking took less than a minute.",
              author: "Liam M.",
              trip: "Nordic Clean Corridor",
              saved: "112 kg CO₂ saved"
            },
            {
              quote: "Our Costa Rica rainforest tour was the highlight of our year. Our guide was a local biologist and we saw toucans, sloths, and organic coffee plantations.",
              author: "Elena & Marcus",
              trip: "Monteverde Canopy Tour",
              saved: "88 kg CO₂ saved"
            },
          ].map((t, i) => (
            <RevealOnScroll key={i} direction="up" delay={i * 120}>
              <div className="h-full p-8 bg-white dark:bg-[#13201b] rounded-3xl border border-gray-100 dark:border-[#1f332b] shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/40 card-interactive flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-amber-400 text-lg tracking-wider">★★★★★</div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#1f332b]">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-sm">{t.author}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t.trip}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 dark:bg-[#162620] text-emerald-700 dark:text-emerald-400 font-bold text-[11px] rounded-xl border border-emerald-200/50 dark:border-emerald-500/20">
                    {t.saved}
                  </span>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>

      {/* ── FAQ ACCORDION ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <RevealOnScroll direction="up">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Everything you need to know about booking sustainable travel</p>
          </div>
        </RevealOnScroll>

        <div className="space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <RevealOnScroll key={i} direction="up" delay={i * 60}>
                <div
                  className="bg-white dark:bg-[#13201b] rounded-2xl border border-gray-100 dark:border-[#1f332b] overflow-hidden shadow-sm transition-all duration-200 hover:border-emerald-200 dark:hover:border-emerald-500/30"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left flex justify-between items-center font-bold text-gray-900 dark:text-white text-base hover:bg-gray-50/60 dark:hover:bg-[#162620] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed border-t border-gray-50 dark:border-[#1f332b] pt-3 animate-in fade-in slide-in-from-top-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>

      {/* ── GREEN NEWSLETTER & PROMO BANNER ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll direction="up" delay={100}>
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-900 p-8 sm:p-14 text-white shadow-2xl border border-emerald-500/20 card-interactive">
            
            {/* Glowing backdrop orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-inner">
                🎁 Exclusive Welcome Offer
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Get $25 Off Your First Eco-Friendly Adventure
              </h2>
              <p className="text-emerald-100/80 text-sm sm:text-base font-medium">
                Subscribe to the Green Traveler Digest and receive seasonal discounts, verified zero-carbon itineraries, and promo codes.
              </p>

              {newsletterSubmitted ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 font-bold text-sm">
                  🎉 Thank you for subscribing! Use promo code <span className="underline font-mono text-white">ECOSUMMER</span> at checkout.
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubmitted(true);
                  }}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                  >
                    Get Promo Code
                  </button>
                </form>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </div>

    </div>
  );
}
