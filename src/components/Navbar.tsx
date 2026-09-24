import React, { useState } from 'react';
import {
  Home,
  Heart,
  CalendarCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  Bell,
  Menu,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type NavigationPage =
  | 'home'
  | 'explore'
  | 'pg-details'
  | 'favorites'
  | 'my-bookings'
  | 'profile'
  | 'notifications'
  | 'user-dashboard'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'admin';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  unreadNotificationsCount?: number;
  onBookNow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  unreadNotificationsCount = 0,
  onBookNow,
}) => {
  const { user, isAuthenticated, favorites, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleNav = (page: NavigationPage) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isUserDashboardActive =
    currentPage === 'user-dashboard' ||
    currentPage === 'profile' ||
    currentPage === 'my-bookings' ||
    currentPage === 'favorites' ||
    currentPage === 'notifications';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Contact & Portal Switcher Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>+91 98765 43210</span>
            </a>
            <a
              href="mailto:care@havenstay.in"
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>care@havenstay.in</span>
            </a>
            <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>4th Block, Koramangala, Bengaluru</span>
            </div>
          </div>

          {/* DUAL DASHBOARD SELECTOR STRIP */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-0.5 rounded-full border border-slate-700/80 shadow-inner">
            <button
              onClick={() => handleNav(isAuthenticated ? 'user-dashboard' : 'login')}
              title="Open Resident / Tenant Portal"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                isUserDashboardActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserIcon className="w-3 h-3 text-blue-300" />
              <span>User Dashboard</span>
            </button>

            <button
              onClick={() => handleNav('admin')}
              title="Open PG Owner / Super Admin Console"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3 h-3 text-rose-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div
            onClick={() => {
              handleNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Haven<span className="text-blue-600">Stay</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase block -mt-1">
                Comfortable Living & PG
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <button
              onClick={() => {
                handleNav('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                currentPage === 'home'
                  ? 'text-blue-600 font-bold bg-blue-50/70'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection('rooms')}
              className="px-3 py-2 rounded-xl transition-all hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              Rooms & Rent
            </button>

            <button
              onClick={() => scrollToSection('facilities')}
              className="px-3 py-2 rounded-xl transition-all hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              Facilities
            </button>

            <button
              onClick={() => scrollToSection('reviews')}
              className="px-3 py-2 rounded-xl transition-all hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              Reviews
            </button>

            {/* DEDICATED USER DASHBOARD BUTTON */}
            <button
              onClick={() => handleNav(isAuthenticated ? 'user-dashboard' : 'login')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                isUserDashboardActive
                  ? 'text-blue-600 font-bold bg-blue-50/80 ring-1 ring-blue-500/30'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>User Dashboard</span>
            </button>

            {/* DEDICATED ADMIN PORTAL BUTTON */}
            <button
              onClick={() => handleNav('admin')}
              className={`ml-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-white shadow-xs'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Portal</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Book a Room Button */}
            <button
              onClick={() => {
                if (onBookNow) {
                  onBookNow();
                } else {
                  scrollToSection('rooms');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book a Room</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <button
                  onClick={() => handleNav('notifications')}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors relative cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {/* Profile Pill Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-3 border border-slate-200 rounded-full hover:shadow-md transition-shadow bg-white cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-700 max-w-28 truncate">
                      {user?.fullName?.split(' ')[0] || 'Account'}
                    </span>
                    <img
                      src={user?.photoURL || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt="User avatar"
                      className="w-7 h-7 rounded-full object-cover border border-blue-500/40"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {user?.role === 'admin' ? 'Owner / Admin' : 'Resident Member'}
                        </span>
                      </div>

                      {/* Explicit Portal Links */}
                      <button
                        onClick={() => handleNav('user-dashboard')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 flex items-center gap-2.5"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                        <span>User Dashboard</span>
                      </button>

                      <button
                        onClick={() => handleNav('admin')}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                      >
                        <Shield className="w-3.5 h-3.5 text-rose-600" />
                        <span>Admin Portal (Owner)</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => handleNav('my-bookings')}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        My Bookings
                      </button>

                      <button
                        onClick={() => handleNav('profile')}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        My Profile & KYC
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => {
                if (onBookNow) onBookNow();
                else scrollToSection('rooms');
              }}
              className="px-3 py-1.5 rounded-full bg-blue-600 text-white font-bold text-xs"
            >
              Book
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              aria-label="Open navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          {/* Mobile Dual Dashboards Highlight */}
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => handleNav(isAuthenticated ? 'user-dashboard' : 'login')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>User Dashboard</span>
            </button>
            <button
              onClick={() => handleNav('admin')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-rose-300 font-bold text-xs"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin Portal</span>
            </button>
          </div>

          <button
            onClick={() => {
              handleNav('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('rooms')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Rooms & Rent
          </button>
          <button
            onClick={() => scrollToSection('facilities')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Facilities
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reviews
          </button>

          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('my-bookings')}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" /> My Bookings
              </button>

              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" /> My Profile & KYC
              </button>

              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-rose-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => handleNav('login')}
                className="flex-1 py-2 text-center text-sm font-bold border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
