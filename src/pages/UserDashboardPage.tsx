import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  CalendarCheck,
  Bell,
  Settings,
  Shield,
  Edit3,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Camera,
  Compass,
  Home,
  CreditCard,
  Wrench,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserSidebar, UserDashboardTab } from '../components/UserSidebar';
import { BookingCard } from '../components/BookingCard';
import { PGCard } from '../components/PGCard';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { Booking, PG, Notification, MaintenanceRequest } from '../types';
import { api } from '../services/api';
import { NavigationPage } from '../components/Navbar';

// Subcomponents for Modular Tabs & Modals
import { OverviewTab } from './dashboard/OverviewTab';
import { PaymentsTab } from './dashboard/PaymentsTab';
import { MaintenanceTab } from './dashboard/MaintenanceTab';
import { StayAgreementModal } from './dashboard/StayAgreementModal';
import { RentReceiptModal, RentInvoice } from './dashboard/RentReceiptModal';
import { PayRentModal } from './dashboard/PayRentModal';
import { RaiseMaintenanceModal } from './dashboard/RaiseMaintenanceModal';

interface UserDashboardPageProps {
  initialTab?: UserDashboardTab;
  onNavigate: (page: NavigationPage) => void;
  onSelectPG: (pgId: string) => void;
  onBookNow: (pgId: string) => void;
}

const INITIAL_INVOICES: RentInvoice[] = [
  {
    id: 'INV-2026-09',
    month: 'September 2026',
    amount: 12500,
    date: '03 Sep 2026',
    mode: 'UPI (Google Pay)',
    transactionRef: 'UPI88921094',
    status: 'paid',
  },
  {
    id: 'INV-2026-08',
    month: 'August 2026',
    amount: 12500,
    date: '02 Aug 2026',
    mode: 'Auto-Debit (HDFC Bank)',
    transactionRef: 'ACH22910481',
    status: 'paid',
  },
  {
    id: 'INV-2026-07',
    month: 'July 2026',
    amount: 12500,
    date: '04 Jul 2026',
    mode: 'UPI (PhonePe)',
    transactionRef: 'UPI77102941',
    status: 'paid',
  },
];

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({
  initialTab = 'overview',
  onNavigate,
  onSelectPG,
  onBookNow,
}) => {
  const { user, updateProfile, favorites } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<UserDashboardTab>(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favoritePGs, setFavoritePGs] = useState<PG[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceRequest[]>([]);
  const [invoices, setInvoices] = useState<RentInvoice[]>(INITIAL_INVOICES);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isPayRentOpen, setIsPayRentOpen] = useState(false);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState<RentInvoice | null>(null);

  // Profile Edit Modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCollegeOrCompany, setEditCollegeOrCompany] = useState(user?.collegeOrCompany || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  // Change Password Modal state
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const [userBookings, allPGs, userNotifs, allTickets] = await Promise.all([
          api.bookings.getUserBookings(user.id),
          api.pgs.getAll(),
          api.notifications.getAll(user.id),
          api.maintenance.getAll(),
        ]);
        setBookings(userBookings);
        setFavoritePGs(allPGs.filter((p: PG) => favorites.includes(p.id)));
        setNotifications(userNotifs);

        // Filter or display maintenance tickets
        const userTickets = allTickets.filter(
          (t) =>
            t.tenantId === user.id ||
            t.tenantPhone === user.phone ||
            t.roomNumber === '204'
        );
        setMaintenanceTickets(userTickets.length > 0 ? userTickets : allTickets.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, favorites.length]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? Refund will be processed.')) return;
    try {
      await api.bookings.updateStatus(bookingId, 'cancelled');
      showToast('success', 'Booking Cancelled', 'Your booking has been cancelled and refunded.');
      loadData();
    } catch (err: any) {
      showToast('error', 'Cancellation Failed', err.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName: editName,
        phone: editPhone,
        collegeOrCompany: editCollegeOrCompany,
        address: editAddress,
        avatar: editAvatar,
      });
      showToast('success', 'Profile Updated', 'Your profile details have been saved.');
      setIsEditProfileOpen(false);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('error', 'Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Mismatch', 'New passwords do not match.');
      return;
    }

    try {
      await api.auth.resetPassword(newPassword);
      showToast('success', 'Password Changed', 'Your password has been updated securely.');
      setIsChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      showToast('error', 'Failed', err.message);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      await api.notifications.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('success', 'All Caught Up', 'All notifications marked as read.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRentPaymentSuccess = (invoiceData: RentInvoice) => {
    setInvoices((prev) => [invoiceData, ...prev]);
  };

  const handleTicketCreated = (ticket: MaintenanceRequest) => {
    setMaintenanceTickets((prev) => [ticket, ...prev]);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const openTicketsCount = maintenanceTickets.filter((t) => t.status !== 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Dedicated Resident Portal Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-blue-950/20 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-blue-300 font-bold">
                  RESIDENT DASHBOARD
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-300 font-bold">Room 204 Active</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Welcome, {user?.fullName?.split(' ')[0] || 'Resident'}!
              </h1>
              <p className="text-xs text-blue-200/80">
                Haven Stay Co-Living • Koramangala 4th Block, Bengaluru
              </p>
            </div>
          </div>

          {/* Quick Dual-Portal Switcher Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Switch to PG Owner Admin Portal"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Switch to Admin Portal</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Go to Public Residence Website"
            >
              <Globe className="w-4 h-4 text-blue-200" />
              <span>Public Website</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* User Dashboard Sidebar */}
        <UserSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onNavigate={onNavigate}
          unreadNotificationsCount={unreadNotifsCount}
          favoritesCount={favoritePGs.length}
          openTicketsCount={openTicketsCount}
        />

        {/* Tab Content Canvas */}
        <main className="flex-1 w-full min-w-0">
          {isLoading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW (MY STAY & ROOM) */}
              {activeTab === 'overview' && (
                <OverviewTab
                  tenantName={user?.fullName || 'Resident'}
                  onNavigateToTab={setActiveTab}
                  onOpenAgreement={() => setIsAgreementOpen(true)}
                  onOpenRaiseTicket={() => setIsRaiseTicketOpen(true)}
                  onOpenPayRent={() => setIsPayRentOpen(true)}
                />
              )}

              {/* TAB 2: MY BOOKINGS */}
              {activeTab === 'my-bookings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        My Bookings History
                      </h2>
                      <p className="text-xs text-slate-500">
                        Track reservations, check-in dates, and digital booking confirmations.
                      </p>
                    </div>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs">
                      <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-lg font-bold text-slate-800">No Prior Bookings</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You are currently an active resident. If you wish to reserve an additional room or bed, explore our listings.
                      </p>
                      <button
                        onClick={() => onNavigate('home')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Explore Available Rooms
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((b) => (
                        <BookingCard
                          key={b.id}
                          booking={b}
                          onCancel={handleCancelBooking}
                          onViewPG={onSelectPG}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RENT & PAYMENTS */}
              {activeTab === 'payments' && (
                <PaymentsTab
                  invoices={invoices}
                  onOpenPayRent={() => setIsPayRentOpen(true)}
                  onViewReceipt={(inv) => setSelectedReceiptInvoice(inv)}
                  currentDue={0}
                />
              )}

              {/* TAB 4: HELPDESK & REPAIRS */}
              {activeTab === 'maintenance' && (
                <MaintenanceTab
                  tickets={maintenanceTickets}
                  onOpenRaiseModal={() => setIsRaiseTicketOpen(true)}
                />
              )}

              {/* TAB 5: PROFILE & KYC */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                      <div className="flex items-center gap-5">
                        <div className="relative group">
                          <img
                            src={
                              user?.photoURL ||
                              user?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={user?.fullName}
                            className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/20 shadow-xs"
                          />
                          <button
                            onClick={() => setIsEditProfileOpen(true)}
                            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
                            title="Change photo"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                              {user?.fullName || 'Resident Member'}
                            </h2>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Verified Resident
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Member since{' '}
                            {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                              'en-IN',
                              { month: 'short', year: 'numeric' }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setIsEditProfileOpen(true)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit Profile
                        </button>
                        <button
                          onClick={() => setIsChangePasswordOpen(true)}
                          className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Change Password
                        </button>
                      </div>
                    </div>

                    {/* Profile Data Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Email Address
                          </span>
                          <p className="text-sm font-semibold text-slate-800">
                            {user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Phone Number
                          </span>
                          <p className="text-sm font-semibold text-slate-800">
                            {user?.phone || '+91 98765 43210'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <GraduationCap className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            College / Organization
                          </span>
                          <p className="text-sm font-semibold text-slate-800">
                            {user?.collegeOrCompany || 'Infosys Ltd. / Bengaluru'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                            Permanent Address
                          </span>
                          <p className="text-sm font-semibold text-slate-800">
                            {user?.address || 'Koramangala, Bengaluru, Karnataka'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* KYC Status Details */}
                    <div className="mt-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-emerald-900 block">
                            Government ID & KYC Cleared (Aadhaar Card ending in •••• 8492)
                          </span>
                          <span className="text-[11px] text-emerald-700">
                            Verified by PG On-Site Management on move-in. Police verification submitted.
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase">
                        Verified 100%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SAVED / WISHLIST */}
              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Saved Property ({favoritePGs.length})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Your bookmarked residence for direct reservation and review.
                      </p>
                    </div>
                  </div>

                  {favoritePGs.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-xs">
                      <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-lg font-bold text-slate-800">No Saved Property</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Tap the heart icon on the residence header to bookmark it.
                      </p>
                      <button
                        onClick={() => onNavigate('home')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        View The Residence
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {favoritePGs.map((pg) => (
                        <PGCard
                          key={pg.id}
                          pg={pg}
                          onSelect={onSelectPG}
                          onBookNow={onBookNow}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Notifications & Alerts
                      </h2>
                      <p className="text-xs text-slate-500">
                        Updates on your booking confirmations, rent receipts, and community notices.
                      </p>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-3 shadow-xs">
                      <Bell className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-lg font-bold text-slate-800">All caught up!</h3>
                      <p className="text-xs text-slate-500">No new alerts at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                            n.read
                              ? 'bg-white border-slate-200 opacity-70'
                              : 'bg-blue-50/50 border-blue-200 shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-800">
                                  {n.title}
                                </h4>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1.5 block">
                                {n.timestamp ||
                                  (n.createdAt
                                    ? new Date(n.createdAt).toLocaleDateString()
                                    : 'Recently')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">
                        Account & Privacy Settings
                      </h2>
                      <p className="text-xs text-slate-500">
                        Manage communication preferences and account security.
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Notifications & Alerts
                      </h4>
                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            SMS & WhatsApp Rent Reminders
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Receive alerts 3 days before monthly billing
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Special Tenant Community Events
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Notified about weekend meetups, tournaments, and meals
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Stay Agreement Modal */}
      <StayAgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        tenantName={user?.fullName || 'Resident'}
        roomNumber="204 (Bed B)"
        monthlyRent={12500}
        securityDeposit={25000}
      />

      {/* 2. Rent Receipt Modal */}
      <RentReceiptModal
        isOpen={selectedReceiptInvoice !== null}
        onClose={() => setSelectedReceiptInvoice(null)}
        invoice={selectedReceiptInvoice}
        tenantName={user?.fullName || 'Resident'}
        roomNumber="204"
      />

      {/* 3. Pay Rent Online Modal */}
      <PayRentModal
        isOpen={isPayRentOpen}
        onClose={() => setIsPayRentOpen(false)}
        amount={12500}
        month="October 2026"
        onPaymentSuccess={handleRentPaymentSuccess}
      />

      {/* 4. Raise Maintenance Ticket Modal */}
      <RaiseMaintenanceModal
        isOpen={isRaiseTicketOpen}
        onClose={() => setIsRaiseTicketOpen(false)}
        onCreated={handleTicketCreated}
        defaultRoomNumber="204"
      />

      {/* 5. Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Personal Profile"
        subtitle="Keep your residence contact info up to date"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              College or Company Name
            </label>
            <input
              type="text"
              value={editCollegeOrCompany}
              onChange={(e) => setEditCollegeOrCompany(e.target.value)}
              placeholder="e.g. Infosys / RV College of Engineering"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Permanent Address
            </label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              placeholder="House, Street, City, State"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Profile Avatar Image URL
            </label>
            <input
              type="url"
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Change Password Modal */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Update Security Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              New Password (Min 6 chars)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
