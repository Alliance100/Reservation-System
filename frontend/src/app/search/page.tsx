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

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/search?type=${type}&location=${encodeURIComponent(location)}`);
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
  }, [type, location]);

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Found <span className="font-semibold text-emerald-600">{results.length}</span> {type}s matching "{location}"
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <ProductCard key={item._id} item={item} type={type} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No results found</h2>
          <p className="text-gray-500">Try adjusting your search destination or category.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ item, type }: { item: any, type: string }) {
  let title = '';
  let subtitle = '';
  let price = 0;
  let image = '';
  let href = `/${type}/${item._id}`;

  if (type === 'hotel') {
    title = item.name;
    subtitle = `${item.location.city} • ★ ${item.rating}`;
    price = item.rooms && item.rooms.length > 0 ? item.rooms[0].price : 0;
    image = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  } else if (type === 'bus') {
    title = `${item.origin} to ${item.destination}`;
    subtitle = `${item.operator} • ${new Date(item.departureTime).toLocaleDateString()}`;
    price = item.fare;
    image = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  } else if (type === 'tour') {
    title = item.title;
    subtitle = `${item.durationDays} Days • Max ${item.maxGroupSize} people`;
    price = item.price;
    image = item.images && item.images[0] ? item.images[0] : 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  } else if (type === 'flight') {
    title = `${item.origin} to ${item.destination}`;
    subtitle = `${item.airline} • ${item.flightNumber} • ${item.duration}`;
    price = item.price;
    image = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Mock flight image
  }

  return (
    <Link href={href} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-gray-900 shadow-sm">
          ${price}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-1">{subtitle}</p>
        
        <div className="mt-auto">
          <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-center rounded-xl font-semibold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            View Details
          </div>
        </div>
      </div>
    </Link>
  );
}
