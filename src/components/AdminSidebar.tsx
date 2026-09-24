import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck2,
  IndianRupee,
  Wrench,
  ShieldCheck,
  ArrowLeft,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AdminTab =
  | 'overview'
  | 'tenants'
  | 'inventory'
  | 'finances'
  | 'maintenance'
  | 'bookings'
  | 'reviews'
  | 'audit-logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  pendingBookingsCount?: number;
  openTicketsCount?: number;
  defaultersCount?: number;
  reviewsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onExitAdmin,
  pendingBookingsCount = 0,
  openTicketsCount = 0,
  defaultersCount = 0,
  reviewsCount = 0,
}) => {
  const { user } = useAuth();

  const menuItems: {
    id: AdminTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    badgeClass?: string;
  }[] = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenant Registry', icon: Users },
    { id: 'inventory', label: 'Rooms & Bed Matrix', icon: Building2 },
    {
      id: 'finances',
      label: 'Rent & Ledger',
      icon: IndianRupee,
      badge: defaultersCount > 0 ? defaultersCount : undefined,
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-200',
    },
    {
      id: 'maintenance',
      label: 'Facility Helpdesk',
      icon: Wrench,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'bookings',
      label: 'Admissions & Tours',
      icon: CalendarCheck2,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
      badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    },
    {
      id: 'reviews',
      label: 'Resident Reviews',
      icon: MessageSquare,
      badge: reviewsCount > 0 ? reviewsCount : undefined,
      badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
    },
    { id: 'audit-logs', label: 'Personnel & Audit', icon: ShieldCheck },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs shrink-0 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Admin Clearance Badge */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white shrink-0 shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              PG OWNER CONSOLE
            </span>
            <h4 className="text-xs font-bold truncate text-slate-900">
              {user?.fullName || 'Nishi Rajput'}
            </h4>
            <span className="text-[10px] text-slate-500 block truncate">
              Super Admin
            </span>
          </div>
        </div>

        {/* Database Collection Indicator */}
        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>DATA SYNC:</span>
          <span className="text-emerald-700 font-bold">Online</span>
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeClass || 'bg-slate-200 text-slate-800'
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

      {/* Return to Public Resident Site button */}
      <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Exit to Resident Site</span>
        </button>
      </div>
    </aside>
  );
};
