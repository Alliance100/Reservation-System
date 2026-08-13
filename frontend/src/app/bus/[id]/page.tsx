"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function BusDetail() {
  const params = useParams();
  const id = params.id as string;
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/bus/${id}`);
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

  if (loading) return <div className="text-center py-20 text-emerald-600 font-bold">Loading Route...</div>;
  if (!bus) return <div className="text-center py-20 text-gray-500">Bus not found.</div>;

  return (
    <div className="py-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-gray-100">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <div className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">{bus.operator} EV Bus</div>
            <h1 className="text-3xl font-black text-gray-900">{bus.origin} <span className="text-gray-300 mx-2">→</span> {bus.destination}</h1>
          </div>
          <div className="text-center md:text-right">
            <div className="text-4xl font-black text-emerald-600">${bus.fare}</div>
            <p className="text-sm text-gray-500 font-medium">per seat</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="text-center mb-4 md:mb-0">
            <div className="text-xl font-bold text-gray-900">{new Date(bus.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm text-gray-500">{new Date(bus.departureTime).toLocaleDateString()}</div>
            <div className="text-emerald-700 font-medium mt-1">{bus.origin}</div>
          </div>
          
          <div className="flex-1 px-8 relative hidden md:block">
            <div className="h-0.5 w-full bg-emerald-200"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-50 px-4 text-xs font-bold text-gray-400 uppercase">
              Direct Route
            </div>
            <div className="absolute -top-1.5 right-8 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            <div className="absolute -top-1.5 left-8 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="text-center mt-4 md:mt-0">
            <div className="text-xl font-bold text-gray-900">{new Date(bus.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm text-gray-500">{new Date(bus.arrivalTime).toLocaleDateString()}</div>
            <div className="text-emerald-700 font-medium mt-1">{bus.destination}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Boarding Points</h3>
            <ul className="space-y-2">
              {bus.boardingPoints?.map((pt: string, i: number) => (
                <li key={i} className="flex items-center text-gray-600"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-3"></span> {pt}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Drop-off Points</h3>
            <ul className="space-y-2">
              {bus.dropPoints?.map((pt: string, i: number) => (
                <li key={i} className="flex items-center text-gray-600"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-3"></span> {pt}</li>
              ))}
            </ul>
          </div>
        </div>

        <button className="w-full py-4 bg-gray-900 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg">
          Select Seats ({bus.availableSeats} available)
        </button>
      </div>
    </div>
  );
}
