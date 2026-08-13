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

  if (loading) return <div className="text-center py-20 text-emerald-600 font-bold">Loading Flight...</div>;
  if (!flight) return <div className="text-center py-20 text-gray-500">Flight not found.</div>;

  return (
    <div className="py-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
              ✈️
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{flight.airline}</h2>
              <p className="text-sm text-gray-500">Flight {flight.flightNumber} • {flight.fareClass}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600">${flight.price}</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 py-4">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">{flight.origin}</div>
            <div className="text-sm font-medium text-emerald-700 mt-2">
              {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-gray-500">{new Date(flight.departureTime).toLocaleDateString()}</div>
          </div>
          
          <div className="flex-1 px-8 text-center relative">
             <p className="text-sm text-gray-500 mb-2 font-medium">{flight.duration}</p>
             <div className="h-0.5 w-full bg-gray-200 relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-300">
                 ✈️
               </div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-bold uppercase tracking-wider">Direct Flight</p>
          </div>

          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">{flight.destination}</div>
            <div className="text-sm font-medium text-emerald-700 mt-2">
              {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-gray-500">{new Date(flight.arrivalTime).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between mb-8">
          <div className="flex items-center text-emerald-800">
            <span className="mr-3 text-lg">🧳</span>
            <span className="font-medium">Baggage Allowance:</span>
          </div>
          <span className="font-bold text-emerald-900">{flight.baggageAllowance}</span>
        </div>

        <button className="w-full py-4 bg-gray-900 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg">
          Continue to Passenger Details
        </button>
      </div>
    </div>
  );
}
