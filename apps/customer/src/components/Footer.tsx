import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-emerald-950 via-gray-900 to-emerald-950 text-white mt-20 border-t border-emerald-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
                🍃
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                Eco<span className="text-emerald-400">Travel.</span>
              </span>
            </Link>
            <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              EcoTravel makes sustainable adventures accessible, zero-emission, and transparent for travelers worldwide.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs font-bold text-emerald-300">🌍 Certified Green Travel Network</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Book Adventures</h3>
            <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
              <li><Link href="/search?type=hotel" className="hover:text-emerald-300 transition-colors">🏨 Eco Hotels & Lodges</Link></li>
              <li><Link href="/search?type=bus" className="hover:text-emerald-300 transition-colors">🚌 EV Bus Corridors</Link></li>
              <li><Link href="/search?type=tour" className="hover:text-emerald-300 transition-colors">🌲 Nature Tours</Link></li>
              <li><Link href="/search?type=flight" className="hover:text-emerald-300 transition-colors">✈️ Carbon-Offset Flights</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Traveler Portals</h3>
            <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
              <li><Link href="/bookings" className="hover:text-emerald-300 transition-colors">🎫 My Bookings & Tickets</Link></li>
              <li><Link href="/profile" className="hover:text-emerald-300 transition-colors">👤 Profile & Carbon Badges</Link></li>
              <li><Link href="/login" className="hover:text-emerald-300 transition-colors">🔐 Account Sign In</Link></li>
              <li><Link href="/register" className="hover:text-emerald-300 transition-colors">✨ Join Green Circle</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4">Partners & Safety</h3>
            <ul className="space-y-2.5 text-xs text-emerald-100/70 font-medium">
              <li><Link href="/supplier" className="hover:text-emerald-300 transition-colors">📦 Supplier Workspace</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-300 transition-colors">📊 Admin Control Panel</Link></li>
              <li><span className="text-emerald-300/80">🔒 256-Bit SSL Protection</span></li>
              <li><span className="text-emerald-300/80">🍃 Zero Single-Use Guarantee</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom / Copyright */}
        <div className="border-t border-emerald-900/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-emerald-200/50 text-xs font-medium">
            &copy; 2026 EcoTravel Reservation System. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-emerald-200/50 font-medium">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Sustainability Charter</span>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
