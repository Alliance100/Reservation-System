"use client";

import { useState } from "react";

interface EcoMapProps {
  locationName: string;
  address?: string;
  city?: string;
  category?: string;
}

export default function EcoMap({ locationName, address, city, category = "Eco Destination" }: EcoMapProps) {
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  const query = encodeURIComponent(`${locationName}, ${city || address || ""}`);
  // OpenStreetMap embed URL
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=${mapType === "satellite" ? "H" : "mapnik"}&marker=0%2C0`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  const nearbyEcoPoints = [
    { name: "EV Charging & Clean Transit Station", distance: "120m away", icon: "⚡" },
    { name: "Solar-Powered Bike Share Station", distance: "250m away", icon: "🚲" },
    { name: "Organic Farm-to-Table Market", distance: "450m away", icon: "🥕" },
    { name: "Protected Nature Reserve Trailhead", distance: "800m away", icon: "🌲" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>📍</span> Verified Eco-Location
          </div>
          <h3 className="text-2xl font-black text-gray-900">{locationName}</h3>
          <p className="text-gray-500 text-xs font-medium mt-0.5">
            {address ? `${address}, ` : ""}{city || "Eco Destination"}
          </p>
        </div>

        <a
          href={externalMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5"
        >
          <span>🗺️</span> Open Live Navigation
        </a>
      </div>

      {/* Interactive Map Visual */}
      <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 group shadow-inner">
        {/* Real OpenStreetMap embed or styled interactive canvas */}
        <iframe
          title="EcoMap View"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full filter saturate-[1.1]"
        />

        {/* Floating Verified Pin Card */}
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-emerald-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            🍃
          </div>
          <div>
            <p className="text-xs font-black text-gray-900 leading-none">{category}</p>
            <p className="text-[10px] text-emerald-700 font-bold mt-0.5">100% Green Certified Zone</p>
          </div>
        </div>
      </div>

      {/* Nearby Eco Infrastructure */}
      <div>
        <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Nearby Green Transit & Amenities</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nearbyEcoPoints.map((pt, i) => (
            <div key={i} className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{pt.icon}</span>
                <span className="text-xs font-bold text-gray-800">{pt.name}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">{pt.distance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
