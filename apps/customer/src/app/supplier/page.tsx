"use client";

import { useEffect } from 'react';

export default function CustomerSupplierRedirect() {
  useEffect(() => {
    // Redirect to the dedicated Supplier Portal running on port 3001
    const supplierUrl = process.env.NEXT_PUBLIC_SUPPLIER_URL || 'http://localhost:3001/supplier';
    window.location.href = supplierUrl;
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 text-2xl flex items-center justify-center mb-4 animate-bounce">
        📦
      </div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">Redirecting to Supplier Workspace...</h2>
      <p className="text-gray-500 text-sm max-w-md mb-6 font-medium">
        The Supplier Workspace runs in a dedicated micro-portal on port 3001. Redirecting you automatically...
      </p>
      <a
        href={process.env.NEXT_PUBLIC_SUPPLIER_URL || 'http://localhost:3001/supplier'}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
      >
        Open Supplier Workspace (Port 3001) →
      </a>
    </div>
  );
}
