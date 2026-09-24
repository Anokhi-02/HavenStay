import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Globe,
  LogOut,
  RefreshCw,
  SlidersHorizontal,
  Bell,
  ArrowLeft,
  Lock,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { NavigationPage } from '../../components/Navbar';
import { AdminSidebar, AdminTab } from '../../components/AdminSidebar';
import { AdminLoginGate } from './AdminLoginGate';

// Tab Views
import { OverviewTab } from './tabs/OverviewTab';
import { TenantsTab } from './tabs/TenantsTab';
import { InventoryTab } from './tabs/InventoryTab';
import { FinancesTab } from './tabs/FinancesTab';
import { MaintenanceTab } from './tabs/MaintenanceTab';
import { BookingsTab } from './tabs/BookingsTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { AuditLogsTab } from './tabs/AuditLogsTab';

// Modals
import { AddTenantModal } from './modals/AddTenantModal';
import { RecordPaymentModal } from './modals/RecordPaymentModal';
import { AddMaintenanceModal } from './modals/AddMaintenanceModal';
import { AddPGModal } from './modals/AddPGModal';
import { UpdateRoomDetailsModal } from './modals/UpdateRoomDetailsModal';
import { UpdatePricesModal } from './modals/UpdatePricesModal';
import { ManagePhotosModal } from './modals/ManagePhotosModal';
import { UpdateContactModal } from './modals/UpdateContactModal';
import { BulkImportRoomsModal } from './modals/BulkImportRoomsModal';

import {
  PG,
  Tenant,
  AdminProfile,
  AdminLog,
  MaintenanceRequest,
  Booking,
  VisitRequest,
  Review,
  RoomOption,
  KycStatus,
  MaintenanceStatus,
  MaintenanceCategory,
  MaintenancePriority,
} from '../../types';
import { api } from '../../services/api';

interface AdminPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Core Separated Data states
  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [pgs, setPgs] = useState<PG[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentTargetTenant, setPaymentTargetTenant] = useState<Tenant | null>(null);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [isAddPGOpen, setIsAddPGOpen] = useState(false);
  const [editingPG, setEditingPG] = useState<PG | null>(null);

  // PG Owner Specific Modals
  const [targetPGForEdit, setTargetPGForEdit] = useState<PG | null>(null);
  const [isUpdateRoomsOpen, setIsUpdateRoomsOpen] = useState(false);
  const [isUpdatePricesOpen, setIsUpdatePricesOpen] = useState(false);
  const [isManagePhotosOpen, setIsManagePhotosOpen] = useState(false);
  const [isUpdateContactOpen, setIsUpdateContactOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Strict Authorization Check: Only nishirajput296@gmail.com or role 'admin'
  const isAdmin =
    user?.email?.toLowerCase() === 'nishirajput296@gmail.com' || user?.role === 'admin';

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        dashboardStats,
        tenantsList,
        adminsList,
        logsList,
        maintList,
        pgsList,
        bookingsList,
        visitsList,
        reviewsList,
      ] = await Promise.all([
        api.admin.getDashboardStats(),
        api.tenants.getAll(),
        api.admins.getAll(),
        api.admins.getLogs(),
        api.maintenance.getAll(),
        api.pgs.getAll(),
        api.bookings.getAll(),
        api.visits.getAll(),
        api.reviews.getAll(),
      ]);

      setStats(dashboardStats);
      setTenants(tenantsList);
      setAdmins(adminsList);
      setLogs(logsList);
      setMaintenance(maintList);
      setPgs(pgsList);
      setBookings(bookingsList);
      setVisits(visitsList);
      setReviews(reviewsList);
    } catch (err: any) {
      console.error('Admin data fetch error:', err);
      showToast('error', 'Sync Failed', 'Failed to synchronize administrative cluster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAdminData();
    }
  }, [isAuthenticated, isAdmin]);

  // Access Control Gates
  if (!isAuthenticated) {
    return <AdminLoginGate onNavigate={onNavigate} isAccessDenied={false} />;
  }

  if (!isAdmin) {
    return <AdminLoginGate onNavigate={onNavigate} isAccessDenied={true} />;
  }

  // ================= ACTION HANDLERS =================
  const handleCreateTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    try {
      const newTenant = await api.tenants.create(tenantData);
      setTenants((prev) => [newTenant, ...prev]);
      showToast('success', 'Resident Admitted', `${newTenant.fullName} admitted to ${newTenant.roomNumber}.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Admission Error', 'Could not register tenant.');
    }
  };

  const handleVerifyKyc = async (id: string, status: KycStatus) => {
    try {
      const updated = await api.tenants.verifyKyc(id, status);
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('info', 'KYC Status Updated', `Tenant status set to ${status}.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'KYC Update Failed', 'Failed to change verification status.');
    }
  };

  const handleRecordPayment = (tenant: Tenant) => {
    setPaymentTargetTenant(tenant);
    setIsRecordPaymentOpen(true);
  };

  const handleSubmitPayment = async (
    tenantId: string,
    amount: number,
    method: string,
    transactionId?: string
  ) => {
    try {
      const updated = await api.tenants.recordPayment(tenantId, amount, method, transactionId);
      setTenants((prev) => prev.map((t) => (t.id === tenantId ? updated : t)));
      showToast('success', 'Payment Recorded', `Received ₹${amount.toLocaleString('en-IN')} via ${method}.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Payment Failed', 'Could not write ledger entry.');
    }
  };

  const handleVacateTenant = async (id: string) => {
    if (!window.confirm('Initiate resident departure and release room inventory?')) return;
    try {
      const updated = await api.tenants.vacateTenant(id);
      setTenants((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('info', 'Tenant Departed', 'Room bed returned to available inventory.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Action Failed', 'Could not process tenant move-out.');
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!window.confirm('Permanently erase resident file from database?')) return;
    try {
      await api.tenants.delete(id);
      setTenants((prev) => prev.filter((t) => t.id !== id));
      showToast('info', 'Record Deleted', 'Tenant file erased from cloud registry.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not delete tenant record.');
    }
  };

  const handleCreateMaintenance = async (data: {
    roomNumber: string;
    tenantName: string;
    tenantPhone: string;
    category: MaintenanceCategory;
    priority: MaintenancePriority;
    title: string;
    description: string;
    assignedTo: string;
  }) => {
    try {
      const matchedTenant = tenants.find(
        (t) => t.fullName.toLowerCase() === data.tenantName.toLowerCase()
      );
      const newTicket = await api.maintenance.create({
        ...data,
        pgId: pgs[0]?.id || 'pg_1',
        tenantId: matchedTenant?.id || `tenant_guest_${Date.now()}`,
        status: 'open',
      });
      setMaintenance((prev) => [newTicket, ...prev]);
      showToast('success', 'Ticket Dispatched', `Work order logged for room.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Ticket Creation Error', 'Could not submit maintenance order.');
    }
  };

  const handleUpdateMaintenanceStatus = async (id: string, status: MaintenanceStatus) => {
    try {
      const updated = await api.maintenance.updateStatus(id, status);
      setMaintenance((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast('info', 'Status Updated', `Maintenance ticket is now ${status}.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not update ticket status.');
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    try {
      await api.maintenance.delete(id);
      setMaintenance((prev) => prev.filter((m) => m.id !== id));
      showToast('info', 'Ticket Removed', 'Maintenance ticket deleted.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not remove ticket.');
    }
  };

  const handleApproveBooking = async (id: string) => {
    try {
      await api.bookings.updateStatus(id, 'confirmed');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'confirmed' } : b))
      );
      showToast('success', 'Booking Confirmed', 'Resident reservation approved.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Approval Error', 'Could not approve booking.');
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      await api.bookings.updateStatus(id, 'cancelled');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
      );
      showToast('info', 'Booking Declined', 'Application marked as cancelled.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Decline Error', 'Could not decline booking.');
    }
  };

  const handleConvertToTenant = (booking: Booking) => {
    setIsAddTenantOpen(true);
  };

  const handleSavePG = async (data: any) => {
    try {
      if (editingPG) {
        const updated = await api.admin.updatePG(editingPG.id, data);
        setPgs((prev) => prev.map((p) => (p.id === editingPG.id ? updated : p)));
        showToast('success', 'Property Updated', 'Residency settings saved.');
      } else {
        const created = await api.admin.createPG(data);
        setPgs((prev) => [created, ...prev]);
        showToast('success', 'Property Added', 'New property wing added.');
      }
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Save Failed', 'Could not update property.');
    }
  };

  const handleDeletePG = async (id: string) => {
    if (!window.confirm('Delete this property wing?')) return;
    try {
      await api.admin.deletePG(id);
      setPgs((prev) => prev.filter((p) => p.id !== id));
      showToast('info', 'Property Removed', 'Property removed from inventory.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Delete Error', 'Could not remove property.');
    }
  };

  // ================= PG OWNER SPECIFIC HANDLERS =================
  const handleOpenUpdateRooms = (pg?: PG) => {
    setTargetPGForEdit(pg || pgs[0] || null);
    setIsUpdateRoomsOpen(true);
  };

  const handleOpenUpdatePrices = (pg?: PG) => {
    setTargetPGForEdit(pg || pgs[0] || null);
    setIsUpdatePricesOpen(true);
  };

  const handleOpenManagePhotos = (pg?: PG) => {
    setTargetPGForEdit(pg || pgs[0] || null);
    setIsManagePhotosOpen(true);
  };

  const handleOpenUpdateContact = (pg?: PG) => {
    setTargetPGForEdit(pg || pgs[0] || null);
    setIsUpdateContactOpen(true);
  };

  const handleOpenBulkImport = (pg?: PG) => {
    setTargetPGForEdit(pg || pgs[0] || null);
    setIsBulkImportOpen(true);
  };

  const handleSubmitBulkImport = async (
    pgId: string,
    importedRoomOptions: RoomOption[],
    mode: 'replace' | 'append'
  ) => {
    try {
      const updated = await api.admin.bulkImportRooms(pgId, importedRoomOptions, mode);
      setPgs((prev) => prev.map((p) => (p.id === pgId ? updated : p)));
      showToast(
        'success',
        'Bulk Import Completed',
        `Successfully imported ${importedRoomOptions.length} room tier(s) for ${updated.name}.`
      );
      fetchAdminData();
    } catch (err) {
      console.error('Bulk import error:', err);
      showToast('error', 'Import Failed', 'Could not persist bulk room details to database.');
    }
  };

  const handleSubmitUpdateRooms = async (
    pgId: string,
    roomOptions: RoomOption[],
    totalBeds: number,
    availableBeds: number
  ) => {
    try {
      const updated = await api.admin.updateRoomDetails(pgId, roomOptions, totalBeds, availableBeds);
      setPgs((prev) => prev.map((p) => (p.id === pgId ? updated : p)));
      showToast('success', 'Room Details Saved', 'Room categories and bed inventory updated.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not save room details.');
    }
  };

  const handleSubmitUpdatePrices = async (
    pgId: string,
    pricingData: {
      startingPrice: number;
      roomOptions: RoomOption[];
      depositMonths: number;
      noticePeriodDays: number;
      foodProvided: boolean;
      foodDetails?: string;
    }
  ) => {
    try {
      const updated = await api.admin.updatePrices(pgId, pricingData);
      setPgs((prev) => prev.map((p) => (p.id === pgId ? updated : p)));
      showToast('success', 'Prices Updated', `Starting price set to ₹${pricingData.startingPrice.toLocaleString('en-IN')}/mo.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not update pricing tiers.');
    }
  };

  const handleSubmitUpdatePhotos = async (pgId: string, images: string[]) => {
    try {
      const updated = await api.admin.updatePhotos(pgId, images);
      setPgs((prev) => prev.map((p) => (p.id === pgId ? updated : p)));
      showToast('success', 'Photos Saved', `Gallery updated with ${images.length} photos.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Upload Failed', 'Could not save photos.');
    }
  };

  const handleSubmitUpdateContact = async (pgId: string, contactData: Partial<PG['owner']>) => {
    try {
      const updated = await api.admin.updateOwnerContact(pgId, contactData);
      setPgs((prev) => prev.map((p) => (p.id === pgId ? updated : p)));
      showToast('success', 'Contacts Saved', `Owner and caretaker details updated.`);
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Save Failed', 'Could not save contact details.');
    }
  };

  // Reviews handlers
  const handleReplyReview = async (reviewId: string, replyText: string) => {
    try {
      const updated = await api.admin.replyToReview(reviewId, replyText, user?.fullName || 'Haven Stay Owner');
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      showToast('success', 'Reply Published', 'Official owner response posted to resident review.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Reply Failed', 'Could not submit response.');
    }
  };

  const handleToggleHighlightReview = async (reviewId: string) => {
    try {
      const updated = await api.admin.toggleHighlightReview(reviewId);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
      showToast('info', 'Status Updated', `Review highlight toggled.`);
    } catch (err) {
      showToast('error', 'Action Failed', 'Could not highlight review.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await api.reviews.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      showToast('info', 'Review Deleted', 'Review removed from records.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not remove review.');
    }
  };

  const handleAddReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
    try {
      const created = await api.reviews.create(reviewData);
      setReviews((prev) => [created, ...prev]);
      showToast('success', 'Review Added', 'Offline guestbook feedback logged.');
      fetchAdminData();
    } catch (err) {
      showToast('error', 'Creation Failed', 'Could not save review.');
    }
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;
  const openTicketsCount = maintenance.filter((m) => m.status !== 'resolved').length;
  const defaultersCount = tenants.filter((t) => (t.pendingDue || 0) > 0).length;
  const reviewsCount = reviews.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ================= SEPARATED EXECUTIVE TOP COMMAND BAR ================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                HavenStay Admin Portal
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                PG Owner
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All Systems Operational • Live Database</span>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            title="Refresh All Database Records"
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('user-dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
            title="Open Resident / User Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">User Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Switch to Resident Public Website"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Public Website</span>
          </button>

          {/* Admin Profile & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-slate-900 block">
                {user?.fullName || 'Nishi Rajput'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                PG Owner / Super Admin
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              title="Sign Out Admin Session"
              className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN APPLICATION WORKSPACE ================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6">
        {/* Left Admin Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onExitAdmin={() => onNavigate('home')}
          pendingBookingsCount={pendingBookingsCount}
          openTicketsCount={openTicketsCount}
          defaultersCount={defaultersCount}
          reviewsCount={reviewsCount}
        />

        {/* Right Active Tab Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              pgs={pgs}
              tenants={tenants}
              bookings={bookings}
              maintenance={maintenance}
              logs={logs}
              onOpenAddTenant={() => setIsAddTenantOpen(true)}
              onOpenAddPG={() => {
                setEditingPG(null);
                setIsAddPGOpen(true);
              }}
              onOpenAddMaintenance={() => setIsAddMaintenanceOpen(true)}
              onSwitchTab={setActiveTab}
              onApproveBooking={handleApproveBooking}
              onResolveTicket={(id) => handleUpdateMaintenanceStatus(id, 'resolved')}
              onOpenUpdateRooms={handleOpenUpdateRooms}
              onOpenUpdatePrices={handleOpenUpdatePrices}
              onOpenManagePhotos={handleOpenManagePhotos}
              onOpenUpdateContact={handleOpenUpdateContact}
              onOpenBulkImport={handleOpenBulkImport}
            />
          )}

          {activeTab === 'tenants' && (
            <TenantsTab
              tenants={tenants}
              onOpenAddTenant={() => setIsAddTenantOpen(true)}
              onVerifyKyc={handleVerifyKyc}
              onRecordPayment={handleRecordPayment}
              onVacateTenant={handleVacateTenant}
              onDeleteTenant={handleDeleteTenant}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              pgs={pgs}
              tenants={tenants}
              onOpenAddPG={() => {
                setEditingPG(null);
                setIsAddPGOpen(true);
              }}
              onOpenAddTenant={() => setIsAddTenantOpen(true)}
              onEditPG={(pg) => {
                setEditingPG(pg);
                setIsAddPGOpen(true);
              }}
              onDeletePG={handleDeletePG}
              onOpenUpdateRooms={handleOpenUpdateRooms}
              onOpenUpdatePrices={handleOpenUpdatePrices}
              onOpenManagePhotos={handleOpenManagePhotos}
              onOpenUpdateContact={handleOpenUpdateContact}
              onOpenBulkImport={handleOpenBulkImport}
            />
          )}

          {activeTab === 'finances' && (
            <FinancesTab
              tenants={tenants}
              onRecordPayment={handleRecordPayment}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceTab
              requests={maintenance}
              onOpenAddTicket={() => setIsAddMaintenanceOpen(true)}
              onUpdateStatus={handleUpdateMaintenanceStatus}
              onDeleteTicket={handleDeleteMaintenance}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              visits={visits}
              onApproveBooking={handleApproveBooking}
              onRejectBooking={handleRejectBooking}
              onConvertToTenant={handleConvertToTenant}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              onReplyReview={handleReplyReview}
              onToggleHighlight={handleToggleHighlightReview}
              onDeleteReview={handleDeleteReview}
              onAddReview={handleAddReview}
            />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogsTab
              admins={admins}
              logs={logs}
            />
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onSubmit={handleCreateTenant}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        tenant={paymentTargetTenant}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPaymentTargetTenant(null);
        }}
        onSubmit={handleSubmitPayment}
      />

      <AddMaintenanceModal
        isOpen={isAddMaintenanceOpen}
        onClose={() => setIsAddMaintenanceOpen(false)}
        onSubmit={handleCreateMaintenance}
      />

      <AddPGModal
        isOpen={isAddPGOpen}
        editingPG={editingPG}
        onClose={() => {
          setIsAddPGOpen(false);
          setEditingPG(null);
        }}
        onSubmit={handleSavePG}
      />

      {/* PG Owner Specific Modals */}
      <UpdateRoomDetailsModal
        isOpen={isUpdateRoomsOpen}
        pg={targetPGForEdit}
        onClose={() => {
          setIsUpdateRoomsOpen(false);
          setTargetPGForEdit(null);
        }}
        onSubmit={handleSubmitUpdateRooms}
        onOpenBulkImport={handleOpenBulkImport}
      />

      <UpdatePricesModal
        isOpen={isUpdatePricesOpen}
        pg={targetPGForEdit}
        onClose={() => {
          setIsUpdatePricesOpen(false);
          setTargetPGForEdit(null);
        }}
        onSubmit={handleSubmitUpdatePrices}
      />

      <ManagePhotosModal
        isOpen={isManagePhotosOpen}
        pg={targetPGForEdit}
        onClose={() => {
          setIsManagePhotosOpen(false);
          setTargetPGForEdit(null);
        }}
        onSubmit={handleSubmitUpdatePhotos}
      />

      <UpdateContactModal
        isOpen={isUpdateContactOpen}
        pg={targetPGForEdit}
        onClose={() => {
          setIsUpdateContactOpen(false);
          setTargetPGForEdit(null);
        }}
        onSubmit={handleSubmitUpdateContact}
      />

      <BulkImportRoomsModal
        isOpen={isBulkImportOpen}
        pgs={pgs}
        selectedPG={targetPGForEdit}
        onClose={() => {
          setIsBulkImportOpen(false);
          setTargetPGForEdit(null);
        }}
        onSubmit={handleSubmitBulkImport}
      />
    </div>
  );
};
