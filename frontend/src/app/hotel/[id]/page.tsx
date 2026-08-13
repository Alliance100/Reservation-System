"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function HotelDetail() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search/properties/${id}`);
        const data = await res.json();
        if (data.success) {
          setProperty(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch property", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-emerald-600 font-bold">Loading Eco Hotel...</div>;
  if (!property) return <div className="text-center py-20 text-gray-500">Property not found.</div>;

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        {/* Header Image */}
        <div className="h-[400px] w-full relative">
          <img 
            src={property.images && property.images.length > 0 ? property.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945"} 
            alt={property.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
            {property.type}
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">{property.name}</h1>
              <p className="text-lg text-emerald-700 flex items-center">
                <span className="mr-2">📍</span> {property.location?.city} - {property.location?.address}
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-emerald-50 px-6 py-4 rounded-2xl text-center min-w-[150px]">
              <div className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-1">Guest Rating</div>
              <div className="text-4xl font-black text-gray-900">{property.rating} <span className="text-xl text-gray-400">/5</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{property.description}</p>

              <h3 className="text-xl font-bold text-gray-900 mb-4">Sustainability Policies</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.policies?.map((policy: string, i: number) => (
                  <li key={i} className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <span className="text-emerald-500 mr-3">✓</span> {policy}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Available Rooms</h3>
                <div className="space-y-4">
                  {property.rooms?.map((room: any, i: number) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{room.roomType}</h4>
                        <span className="font-black text-emerald-600">${room.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">Capacity: {room.capacity} guests</p>
                      <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-md shadow-emerald-200">
                        Select Room
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
