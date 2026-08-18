"use client";

import { useEffect } from 'react';

export default function CustomerAdminRedirect() {
  useEffect(() => {
    // Redirect to the dedicated Admin Portal running on port 3002
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002/admin';
    window.location.href = adminUrl;
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 text-2xl flex items-center justify-center mb-4 animate-bounce">
        🛡️
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Redirecting to Admin Portal...</h2>
      <p className="text-gray-500 text-sm max-w-md mb-6 font-medium">
        The Admin Dashboard runs in a dedicated micro-portal on port 3002. Redirecting you automatically...
      </p>
      <a
        href={process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002/admin'}
        className="px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-black text-sm rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:scale-105"
      >
        Open Admin Portal (Port 3002) →
      </a>
    </div>
  );
}
