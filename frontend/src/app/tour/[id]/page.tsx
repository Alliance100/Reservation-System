"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function TourDetail() {
  const params = useParams();
  const id = params.id as string;
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-20 text-emerald-600 font-bold">Loading Eco Tour...</div>;
  if (!tour) return <div className="text-center py-20 text-gray-500">Tour not found.</div>;

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-[400px] w-full relative">
          <img 
            src={tour.images && tour.images.length > 0 ? tour.images[0] : "https://images.unsplash.com/photo-1510312305653-8ed496efae75"} 
            alt={tour.title} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">{tour.title}</h1>
              <p className="text-lg text-emerald-700 font-medium">
                {tour.durationDays} Days • Max {tour.maxGroupSize} People
              </p>
            </div>
            <div className="mt-6 md:mt-0 text-right">
              <div className="text-4xl font-black text-emerald-600">${tour.price}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">per person</div>
              <button className="mt-4 px-8 py-3 bg-gray-900 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg">
                Book This Tour
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Itinerary</h2>
              <div className="space-y-6">
                {tour.itinerary?.map((item: any, i: number) => (
                  <div key={i} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        {item.day}
                      </div>
                      {i !== tour.itinerary.length - 1 && <div className="w-0.5 h-full bg-emerald-50 my-2"></div>}
                    </div>
                    <div className="pt-1">
                      <h4 className="font-bold text-gray-900">Day {item.day}</h4>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tour Includes</h3>
                <ul className="space-y-3 mb-8">
                  {tour.inclusions?.map((inc: string, i: number) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <span className="text-emerald-500 mr-3">✓</span> {inc}
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Not Included</h3>
                <ul className="space-y-3">
                  {tour.exclusions?.map((exc: string, i: number) => (
                    <li key={i} className="flex items-center text-gray-500 line-through">
                      <span className="text-gray-400 mr-3">✗</span> {exc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
