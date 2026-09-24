import React from 'react';
import { Building2, ShieldCheck, Heart, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { NavigationPage } from './Navbar';

interface FooterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollTo = (id: string) => {
    onNavigate('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-white border-t border-slate-200">
      {/* Top 4 Trust Highlights */}
      <div className="border-b border-slate-100 py-8 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Verified & Safe</p>
              <p className="text-[11px] text-slate-500">Warden & CCTV 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <span className="text-base font-black">₹0</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">No Broker Fees</p>
              <p className="text-[11px] text-slate-500">Direct booking with owner</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Koramangala 4th Block</p>
              <p className="text-[11px] text-slate-500">Walk to offices & bus stop</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">3 Fresh Meals</p>
              <p className="text-[11px] text-slate-500">Home food every day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Haven<span className="text-blue-600">Stay</span>
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              A clean, comfortable, and friendly home for students and working professionals in Koramangala. High-speed Wi-Fi, 3 daily meals, daily room cleaning, and caring on-site staff.
            </p>

            <div className="text-xs text-slate-500 space-y-1.5 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Plot 48, 80 Feet Road, 4th Block, Koramangala, Bengaluru - 560034
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                nishirajput296@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                +91 98765 43210
              </p>
            </div>
          </div>

          {/* Quick Navigation (Simple words) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Explore Haven Stay
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-600 transition-colors"
                >
                  Home Page
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('our-story')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Our Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('rooms')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Rooms & Rent
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('facilities')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Facilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('reviews')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Resident Reviews
                </button>
              </li>
            </ul>
          </div>

          {/* Resident & Owner Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Resident & Owner Portal
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <button
                  onClick={() => onNavigate('my-bookings')}
                  className="hover:text-blue-600 transition-colors"
                >
                  My Bookings
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-blue-600 transition-colors"
                >
                  My Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-blue-800 transition-colors text-xs font-bold text-blue-700 block pt-1"
                >
                  Owner Portal →
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Haven Stay Co-Living. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Zero Brokerage Guarantee</span>
            <span>Simple Rules & Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
