"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    travelerName: "",
    travelerPassport: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        fetchProfile();
      }
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFormData({
          name: data.data.name || "",
          phone: data.data.phone || "",
          travelerName: data.data.savedTraveler?.name || "",
          travelerPassport: data.data.savedTraveler?.passport || ""
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        phone: formData.phone,
        savedTraveler: {
          name: formData.travelerName,
          passport: formData.travelerPassport
        }
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess("Profile settings updated successfully!");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError("Network error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7FBF9] pt-32 flex justify-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBF9] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-8 sm:p-10 text-white shadow-xl shadow-emerald-950/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner font-black text-emerald-300">
                {user?.name?.[0]?.toUpperCase() || "🌱"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {user?.role?.toUpperCase() || "TRAVELER"}
                  </span>
                  <span className="text-xs font-bold text-emerald-200">🌿 Level 3 Eco-Voyager</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">{user?.name || "Eco Explorer"}</h1>
                <p className="text-emerald-100/80 text-xs sm:text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
              >
                <span>🎫</span> My Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* Eco Impact Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-2xl">🌍</span>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mt-2">Carbon Offset</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">85.4 kg CO₂</p>
            <p className="text-xs text-gray-400 font-medium mt-1">Offset via EV bus & eco-stays</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-2xl">🌱</span>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mt-2">Trees Equivalent</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">~6 Trees</p>
            <p className="text-xs text-gray-400 font-medium mt-1">Lifetime green contribution</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-2xl">🏅</span>
            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mt-2">Eco Badge Tier</p>
            <p className="text-2xl font-black text-purple-700 mt-0.5">Earth Guardian</p>
            <p className="text-xs text-gray-400 font-medium mt-1">Top 5% sustainable traveler</p>
          </div>
        </div>

        {/* Settings & Form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl font-medium text-sm border border-red-100">⚠️ {error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-medium text-sm border border-emerald-100">✓ {success}</div>}
          
          <form onSubmit={handleUpdate} className="space-y-8">
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-400 font-medium">Update your account credentials and contact info</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
                  <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Account Role</label>
                  <input type="text" value={user?.role?.toUpperCase() || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-sm font-bold cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900">Saved Passenger & Traveler Info</h3>
                <p className="text-xs text-gray-400 font-medium">Auto-populates your details at checkout for instant 1-click booking</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Primary Traveler Name</label>
                  <input type="text" placeholder="As shown on Passport / ID" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Passport / ID Number</label>
                  <input type="text" placeholder="e.g. A12345678" value={formData.travelerPassport} onChange={e => setFormData({...formData, travelerPassport: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] text-sm disabled:opacity-50">
                {loading ? "Saving Details..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
