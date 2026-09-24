import React from 'react';
import {
  Building2,
  Users,
  IndianRupee,
  Wrench,
  CalendarCheck2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Phone,
  Clock,
  Plus,
  ShieldCheck,
  Zap,
  Bed,
  Camera,
  MessageSquare,
  Sparkles,
  UserCheck,
  UserMinus,
  DoorOpen,
  FileSpreadsheet,
} from 'lucide-react';
import { PG, Tenant, Booking, MaintenanceRequest, AdminLog } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface OverviewTabProps {
  stats: any;
  pgs: PG[];
  tenants: Tenant[];
  bookings: Booking[];
  maintenance: MaintenanceRequest[];
  logs: AdminLog[];
  onOpenAddTenant: () => void;
  onOpenAddPG: () => void;
  onOpenAddMaintenance: () => void;
  onSwitchTab: (tabId: any) => void;
  onApproveBooking: (id: string) => void;
  onResolveTicket: (id: string) => void;
  onOpenUpdateRooms?: (pg?: PG) => void;
  onOpenUpdatePrices?: (pg?: PG) => void;
  onOpenManagePhotos?: (pg?: PG) => void;
  onOpenUpdateContact?: (pg?: PG) => void;
  onOpenBulkImport?: (pg?: PG) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  pgs,
  tenants,
  bookings,
  maintenance,
  logs,
  onOpenAddTenant,
  onOpenAddPG,
  onOpenAddMaintenance,
  onSwitchTab,
  onApproveBooking,
  onResolveTicket,
  onOpenUpdateRooms,
  onOpenUpdatePrices,
  onOpenManagePhotos,
  onOpenUpdateContact,
  onOpenBulkImport,
}) => {
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const urgentTickets = maintenance.filter((m) => m.status !== 'resolved' && m.priority === 'urgent');
  const defaulterTenants = tenants.filter((t) => (t.pendingDue || 0) > 0);

  // Resident stay calculations for PG Owner metrics
  const activeTenants = tenants.filter((t) => t.status === 'active');
  const noticePeriodTenants = tenants.filter((t) => t.status === 'notice_period');
  const vacatedTenants = tenants.filter((t) => t.status === 'vacated');
  const totalJoinedCount = tenants.length; // Lifetime residents joined

  const primaryPG = pgs[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Operations Alert Banner */}
      {(urgentTickets.length > 0 || pendingBookings.length > 0 || defaulterTenants.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Operations Requiring PG Owner Attention:</p>
              <p className="text-[11px] text-amber-700">
                {pendingBookings.length} booking request(s) awaiting approval • {urgentTickets.length} urgent maintenance ticket(s) • {defaulterTenants.length} rent payment(s) pending.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingBookings.length > 0 && (
              <button
                onClick={() => onSwitchTab('bookings')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Review Requests ({pendingBookings.length})
              </button>
            )}
            {urgentTickets.length > 0 && (
              <button
                onClick={() => onSwitchTab('maintenance')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-amber-800 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
              >
                View Helpdesk ({urgentTickets.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* PG Owner Resident Stats Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                PG Owner Resident Analytics
              </span>
              <span className="text-xs text-slate-400">• Live Property Matrix</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Resident Admission & Occupancy Record
            </h2>
            <p className="text-xs text-slate-500">
              Total residents onboarded into PG, active occupants currently staying, notice periods, and alumni history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddTenant}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Admit New Resident</span>
            </button>
            <button
              onClick={() => onSwitchTab('tenants')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              View Full Registry
            </button>
          </div>
        </div>

        {/* 4 Resident Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          {/* Tile 1: Total Users Joined */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Users Joined
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.totalJoined || totalJoinedCount}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">Residents</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Total lifetime admissions onboarded to PG
            </p>
          </div>

          {/* Tile 2: Currently Staying */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Currently Staying
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-blue-600">
                {stats?.currentlyStaying || activeTenants.length}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">Active In PG</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Residents currently living in rooms
            </p>
          </div>

          {/* Tile 3: Notice Period */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                On Notice Period
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">
                {stats?.noticePeriodCount || noticePeriodTenants.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Vacating Soon</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Serving 30-day lease departure notice
            </p>
          </div>

          {/* Tile 4: Vacated / Alumni */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Vacated Alumni
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                <DoorOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-800">
                {stats?.vacatedCount || vacatedTenants.length}
              </span>
              <span className="text-[11px] text-slate-500">Graduated</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Deposit settled & successfully moved out
            </p>
          </div>
        </div>
      </div>

      {/* PG Owner Management Command Suite (Room details, Prices, Photos, Contact, Reviews) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              PG Owner Property Controls
            </h3>
            <p className="text-xs text-slate-500">
              Quickly update rooms, tariffs, photos, contacts, booking approvals, and reviews for {primaryPG?.name || 'Haven Stay'}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenBulkImport?.(primaryPG || undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Bulk import room details & prices via CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Bulk CSV Import</span>
            </button>
            {primaryPG && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                Selected: <strong className="text-slate-900">{primaryPG.name}</strong>
              </span>
            )}
          </div>
        </div>

        {/* 7 Quick Action Tool Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* 1. Update Room Details */}
          <button
            type="button"
            onClick={() => onOpenUpdateRooms?.(primaryPG || undefined)}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <Bed className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Room Details
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Beds & amenities
              </span>
            </div>
          </button>

          {/* 2. Bulk CSV Import */}
          <button
            type="button"
            onClick={() => onOpenBulkImport?.(primaryPG || undefined)}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Bulk CSV Import
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Batch rooms & tariffs
              </span>
            </div>
          </button>

          {/* 3. Update Prices */}
          <button
            type="button"
            onClick={() => onOpenUpdatePrices?.(primaryPG || undefined)}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Update Prices
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Tariffs & deposits
              </span>
            </div>
          </button>

          {/* 4. Upload Photos */}
          <button
            type="button"
            onClick={() => onOpenManagePhotos?.(primaryPG || undefined)}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <Camera className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Upload Photos
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {primaryPG?.images?.length || 0} in gallery
              </span>
            </div>
          </button>

          {/* 5. Change Contact Details */}
          <button
            type="button"
            onClick={() => onOpenUpdateContact?.(primaryPG || undefined)}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <Phone className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Contact Details
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Warden & timings
              </span>
            </div>
          </button>

          {/* 6. Booking Requests */}
          <button
            type="button"
            onClick={() => onSwitchTab('bookings')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs relative">
              <CalendarCheck2 className="w-5 h-5 text-purple-600" />
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Booking Requests
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {pendingBookings.length} pending
              </span>
            </div>
          </button>

          {/* 7. Manage Reviews */}
          <button
            type="button"
            onClick={() => onSwitchTab('reviews')}
            className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center text-center gap-2 group transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-2xs">
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Manage Reviews
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Reply to feedback
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 4 Standard Administrative KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bed Occupancy */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bed Occupancy</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {stats?.occupancyRate || 80}% Full
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.occupiedBeds || 28}</span>
            <span className="text-xs text-slate-500 font-semibold">/ {stats?.totalBeds || 30} Total Beds</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats?.occupancyRate || 80)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
            <span className="text-emerald-700 font-semibold">{stats?.availableBeds || 2} Vacant Beds</span>
            <button
              onClick={() => onSwitchTab('inventory')}
              className="hover:text-slate-900 flex items-center gap-0.5 text-slate-500 cursor-pointer"
            >
              Bed Matrix <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Rent Intake</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900">
              {formatCurrency(stats?.monthlyRevenue || 46000)}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Pending Dues:</span>
            <span className="font-bold text-rose-600 font-mono">
              {formatCurrency(stats?.pendingRent || 9500)}
            </span>
          </div>
          <div className="flex justify-end mt-1">
            <button
              onClick={() => onSwitchTab('finances')}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
            >
              Rent Ledger <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Admissions Conversion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inquiry Conversion</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.conversionRate || 75}%</span>
            <span className="text-xs text-slate-500">Admitted</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Total Bookings:</span>
            <span className="font-bold text-purple-700 font-mono">
              {bookings.length} Requests
            </span>
          </div>
          <div className="flex justify-end mt-1">
            <button
              onClick={() => onSwitchTab('bookings')}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
            >
              Bookings Queue <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Facility Helpdesk */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Facility Helpdesk</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats?.openTicketsCount || 2}</span>
            <span className="text-xs text-slate-500">Open Tickets</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Urgent Attention:</span>
            <span className={`font-bold ${stats?.urgentTicketsCount > 0 ? 'text-rose-600 font-mono' : 'text-emerald-700'}`}>
              {stats?.urgentTicketsCount || 0} Critical
            </span>
          </div>
          <div className="flex justify-end mt-1">
            <button
              onClick={() => onSwitchTab('maintenance')}
              className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
            >
              View Helpdesk <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Action Queue vs Live Audit Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Urgent Operations Queue */}
        <div className="lg:col-span-7 space-y-4">
          {/* Pending Applications Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck2 className="w-4 h-4 text-blue-600" />
                  Prospective Resident Booking Requests
                </h3>
                <p className="text-[11px] text-slate-500">Incoming room reservations waiting for PG owner approval</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {pendingBookings.length} Pending
              </span>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                All resident booking applications are cleared.
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{b.userName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {b.roomTypeName || b.roomType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Move-in: {b.checkInDate} • {b.durationMonths || 3} months • {formatCurrency(b.monthlyRent)}/mo
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Phone: {b.userPhone || 'Not provided'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveBooking(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onSwitchTab('bookings')}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Defaulter / Rent Payment Follow-up Queue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-rose-600" />
                  Pending Rent Dues
                </h3>
                <p className="text-[11px] text-slate-500">Active tenants with unpaid balance for current period</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {defaulterTenants.length} Dues
              </span>
            </div>

            {defaulterTenants.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                100% of resident rents are up-to-date!
              </div>
            ) : (
              <div className="space-y-2.5">
                {defaulterTenants.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{t.fullName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {t.roomNumber} ({t.bedNumber})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Phone: {t.phone} • Rent: {formatCurrency(t.monthlyRent)}/mo
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-rose-600 block font-mono">
                        {formatCurrency(t.pendingDue)}
                      </span>
                      <button
                        onClick={() => onSwitchTab('finances')}
                        className="text-[10px] text-blue-600 hover:underline mt-0.5 block font-semibold cursor-pointer"
                      >
                        Send Reminder →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Real-Time Audit & Management Logs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Management Audit Trail
                </h3>
                <p className="text-[11px] text-slate-500">Live operational ledger of administrator actions</p>
              </div>
              <button
                onClick={() => onSwitchTab('audit-logs')}
                className="text-[11px] text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
              >
                All Logs →
              </button>
            </div>

            <div className="space-y-3">
              {logs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{log.details}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                    <span>By: {log.adminName}</span>
                    <span className="uppercase text-slate-700 font-bold">{log.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
