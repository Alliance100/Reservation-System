"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

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
        // Hydrate from context/api if available. We will just use the token to fetch details.
        fetchProfile();
      }
    }
  }, [user, authLoading]);

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
        setSuccess("Profile updated successfully!");
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError("Network error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F7FBF9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">My Profile</h1>
        
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl font-medium">{success}</div>}
          
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input type="email" value={user?.email || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                  <input type="text" value={user?.role?.toUpperCase() || ""} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Saved Traveler Info</h3>
              <p className="text-gray-500 text-sm mb-4">Save these details to check out faster.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Traveler Full Name</label>
                  <input type="text" value={formData.travelerName} onChange={e => setFormData({...formData, travelerName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Passport / ID Number</label>
                  <input type="text" value={formData.travelerPassport} onChange={e => setFormData({...formData, travelerPassport: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
