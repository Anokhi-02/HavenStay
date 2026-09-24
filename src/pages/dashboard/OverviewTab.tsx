import React, { useState } from 'react';
import {
  Home,
  Wifi,
  Copy,
  Check,
  Phone,
  Clock,
  Utensils,
  CreditCard,
  Wrench,
  FileText,
  ShieldCheck,
  User,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface OverviewTabProps {
  tenantName: string;
  onNavigateToTab: (tab: any) => void;
  onOpenAgreement: () => void;
  onOpenRaiseTicket: () => void;
  onOpenPayRent: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  tenantName,
  onNavigateToTab,
  onOpenAgreement,
  onOpenRaiseTicket,
  onOpenPayRent,
}) => {
  const { showToast } = useToast();
  const [copiedWifi, setCopiedWifi] = useState(false);

  const handleCopyWifi = () => {
    navigator.clipboard.writeText('haven@koramangala5g');
    setCopiedWifi(true);
    showToast('success', 'Copied Wi-Fi Password', 'Connected to HavenStay_Resident_5G');
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Active Room Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                Active Resident Stay
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: HST-RES-8842</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Room 204 • Bed B
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Double Sharing Premium AC • Haven Stay Co-Living, Koramangala 4th Block
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenPayRent}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Pay Rent Online
            </button>
            <button
              onClick={onOpenRaiseTicket}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              Report Issue
            </button>
            <button
              onClick={onOpenAgreement}
              className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="View Digital Rental Agreement"
            >
              <FileText className="w-3.5 h-3.5" />
              Agreement
            </button>
          </div>
        </div>

        {/* Room Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Rent</span>
            <span className="text-base font-black text-slate-900">₹12,500</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">● Paid (₹0 Due)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Security Deposit</span>
            <span className="text-base font-black text-slate-900">₹25,000</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Refundable in Escrow</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Curfew / Gate</span>
            <span className="text-base font-black text-slate-900">11:30 PM</span>
            <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">Biometric Sensor</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Wi-Fi Network</span>
            <span className="text-xs font-bold text-slate-900 truncate block">HavenStay_5G</span>
            <button
              onClick={handleCopyWifi}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 mt-0.5 cursor-pointer"
            >
              {copiedWifi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copiedWifi ? 'Password Copied' : 'Copy Password'}
            </button>
          </div>
        </div>

        {/* Caretaker & Contact Strip */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              RG
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Rajesh Gowda • On-Duty Property Warden
              </p>
              <p className="text-[11px] text-slate-500">
                Available at Ground Floor Reception Desk (8:00 AM – 10:00 PM)
              </p>
            </div>
          </div>
          <a
            href="tel:+919876543210"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            +91 98765 43210
          </a>
        </div>
      </div>

      {/* Today's Meals Menu */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Today's Dining Mess Schedule</h3>
              <p className="text-xs text-slate-500">Included in your monthly subscription package</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            All 3 Meals Included
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
              <span>Breakfast</span>
              <span className="text-[10px] font-mono text-amber-700">07:30 - 09:30 AM</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Steamed Idli Sambar, Medu Vada, Coconut Chutney, Hot Filter Coffee & Masala Chai
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
              <span>Lunch</span>
              <span className="text-[10px] font-mono text-emerald-700">12:30 - 02:30 PM</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Paneer Butter Masala, Dal Tadka, Steamed Basmati Rice, Phulka Rotis, Papad, Fresh Curd
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-indigo-900 font-bold text-xs">
              <span>Dinner</span>
              <span className="text-[10px] font-mono text-indigo-700">08:00 - 10:00 PM</span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Mix Veg Kolhapuri, Tawa Roti, Jeera Rice, Cucumber Raita, Warm Gulab Jamun
            </p>
          </div>
        </div>
      </div>

      {/* Community Notices & Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Resident Community Noticeboard
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Sunday Rooftop Acoustic & Movie Night</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Join fellow residents this Sunday at 7:00 PM on the 4th floor open terrace. Popcorn & cold drinks provided!
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-800">High-Speed Fiber Upgrade Completed</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  All floor routers now operate on dual-band 300 Mbps symmetrical fiber connectivity with UPS backup.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Helpful Resident Shortcuts
          </div>
          <div className="space-y-2 text-xs">
            <button
              onClick={() => onNavigateToTab('payments')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors font-bold text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>View Rent Slips & Invoices</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab('maintenance')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors font-bold text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Track Active Maintenance Requests</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateToTab('profile')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors font-bold text-slate-700 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>Check Aadhaar KYC & Identity Status</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
