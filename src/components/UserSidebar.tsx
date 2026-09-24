import React from 'react';
import {
  User,
  Heart,
  CalendarCheck,
  Bell,
  Settings,
  LogOut,
  Shield,
  Home,
  CreditCard,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavigationPage } from './Navbar';

export type UserDashboardTab =
  | 'overview'
  | 'my-bookings'
  | 'payments'
  | 'maintenance'
  | 'profile'
  | 'favorites'
  | 'notifications'
  | 'settings';

interface UserSidebarProps {
  activeTab: UserDashboardTab;
  onSelectTab: (tab: UserDashboardTab) => void;
  onNavigate?: (page: NavigationPage) => void;
  unreadNotificationsCount?: number;
  favoritesCount?: number;
  openTicketsCount?: number;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  activeTab,
  onSelectTab,
  onNavigate,
  unreadNotificationsCount = 0,
  favoritesCount = 0,
  openTicketsCount = 0,
}) => {
  const { user, logout } = useAuth();

  const menuItems: {
    id: UserDashboardTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'My Stay & Room', icon: Home },
    { id: 'my-bookings', label: 'My Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Rent & Payments', icon: CreditCard },
    {
      id: 'maintenance',
      label: 'Helpdesk & Repairs',
      icon: Wrench,
      badge: openTicketsCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'profile', label: 'Profile & KYC', icon: User },
    { id: 'favorites', label: 'Saved Wishlist', icon: Heart, badge: favoritesCount },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: Bell,
      badge: unreadNotificationsCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm shrink-0 flex flex-col justify-between">
      <div>
        {/* User Mini Profile */}
        <div className="p-3.5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl mb-4 flex items-center gap-3 border border-slate-200/80">
          <img
            src={
              user?.photoURL ||
              user?.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
            }
            alt={user?.fullName}
            className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/40 shadow-xs"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {user?.fullName || 'Resident Member'}
            </h4>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Resident Portal
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-blue-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 mt-6 border-t border-slate-100 space-y-3">
        {/* Switch to Admin Portal Card */}
        {onNavigate && (
          <div className="p-3 bg-slate-950 rounded-2xl text-slate-300 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400">
              <span>ADMIN ACCESS</span>
              <span className="text-rose-400 font-bold">STAFF & OWNER</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Manage rooms, pricing, tenants, bookings, and operations.
            </p>
            <button
              onClick={() => onNavigate('admin')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer active:scale-98"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Go to Admin Portal</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
