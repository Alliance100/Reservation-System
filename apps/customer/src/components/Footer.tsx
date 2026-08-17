import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-emerald-900 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="xl:grid xl:grid-cols-3 xl:gap-8 items-center">
          {/* Brand */}
          <div className="xl:col-span-1 mb-8 xl:mb-0">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-900/20">
                🍃
              </div>
              <span className="text-2xl font-black text-white tracking-tighter">
                Eco<span className="text-emerald-400">Travel.</span>
              </span>
            </Link>
            <p className="text-emerald-100/80 text-sm leading-relaxed max-w-sm">
              Making sustainable travel accessible, seamless, and beautiful for everyone.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Explore</h3>
                <ul className="space-y-3">
                  <li><Link href="/" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Eco Hotels</Link></li>
                  <li><Link href="/" className="text-emerald-100/70 hover:text-white text-sm transition-colors">EV Buses</Link></li>
                  <li><Link href="/" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Nature Tours</Link></li>
                  <li><Link href="/" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Green Flights</Link></li>
                </ul>
              </div>
              <div className="mt-8 md:mt-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">About Us</Link></li>
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Mission</Link></li>
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Careers</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Help Center</Link></li>
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Contact Us</Link></li>
                </ul>
              </div>
              <div className="mt-8 md:mt-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                  <li><Link href="#" className="text-emerald-100/70 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom / Copyright */}
        <div className="mt-10 border-t border-emerald-800/60 pt-6 flex justify-center items-center">
          <p className="text-emerald-200/60 text-xs font-medium">
            &copy; 2026 EcoTravel Inc. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
