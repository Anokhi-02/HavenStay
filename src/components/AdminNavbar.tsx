import React from 'react';
import { Building2, Shield, ArrowLeft, LogOut, Bell, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavigationPage } from './Navbar';

interface AdminNavbarProps {
  onNavigate: (page: NavigationPage) => void;
  pendingBookingsCount?: number;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onNavigate, pendingBookingsCount = 0 }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Admin Brand / Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-white">
                  Haven<span className="text-amber-400">Stay</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Haven Coliving & Suites • Internal Management
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* View Resident Website button */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Resident App</span>
            </button>

            {/* Admin Profile Info */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                alt="Admin avatar"
                className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
              />
              <div className="text-left text-xs leading-tight">
                <p className="font-bold text-slate-200">{user?.fullName || 'Nishi Rajput (Admin)'}</p>
                <p className="text-[10px] text-amber-400">Property Owner & Manager</p>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              title="Sign out of Admin"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
