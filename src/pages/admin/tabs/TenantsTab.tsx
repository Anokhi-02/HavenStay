import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  ShieldCheck,
  CreditCard,
  UserMinus,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { Tenant } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface TenantsTabProps {
  tenants: Tenant[];
  onOpenAddTenant: () => void;
  onVerifyKyc: (tenantId: string, status: 'verified' | 'rejected') => void;
  onRecordPayment: (tenant: Tenant) => void;
  onVacateTenant: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
}

export const TenantsTab: React.FC<TenantsTabProps> = ({
  tenants,
  onOpenAddTenant,
  onVerifyKyc,
  onRecordPayment,
  onVacateTenant,
  onDeleteTenant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'notice_period' | 'vacated'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesKyc = kycFilter === 'all' || t.kycStatus === kycFilter;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Resident Registry & Leases
          </h2>
          <p className="text-xs text-slate-500">
            Dedicated records managing all active occupants, leases, KYC, and rent dues.
          </p>
        </div>

        <button
          onClick={onOpenAddTenant}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Admit New Resident</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tenant name, room number, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Lease Status</option>
              <option value="active">Active Resident</option>
              <option value="notice_period">Notice Period</option>
              <option value="vacated">Vacated</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All KYC</option>
              <option value="verified">KYC Verified</option>
              <option value="pending">KYC Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
              <tr>
                <th className="py-3.5 px-4 font-bold">Resident Details</th>
                <th className="py-3.5 px-4 font-bold">Room & Bed</th>
                <th className="py-3.5 px-4 font-bold">Monthly Rent</th>
                <th className="py-3.5 px-4 font-bold">Dues Status</th>
                <th className="py-3.5 px-4 font-bold">KYC Status</th>
                <th className="py-3.5 px-4 font-bold">Lease Period</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No resident files found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isDue = (tenant.pendingDue || 0) > 0;
                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Resident Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {tenant.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block hover:text-blue-600 transition-colors">
                              {tenant.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {tenant.phone}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {tenant.companyOrCollege || tenant.employmentType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Room & Bed */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{tenant.roomNumber}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">{tenant.bedNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase border border-slate-200">
                          {tenant.roomType}
                        </span>
                      </td>

                      {/* Rent & Deposit */}
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">
                          {formatCurrency(tenant.monthlyRent)}/mo
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Dep: {formatCurrency(tenant.securityDeposit)} {tenant.depositPaid ? '(Paid)' : '(Unpaid)'}
                        </span>
                      </td>

                      {/* Dues */}
                      <td className="py-4 px-4 font-mono">
                        {isDue ? (
                          <div className="space-y-1">
                            <span className="font-bold text-rose-600 block text-xs">
                              {formatCurrency(tenant.pendingDue)} Due
                            </span>
                            <button
                              onClick={() => onRecordPayment(tenant)}
                              className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 cursor-pointer"
                            >
                              Collect
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                      </td>

                      {/* KYC Status */}
                      <td className="py-4 px-4">
                        {tenant.kycStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                            <button
                              onClick={() => onVerifyKyc(tenant.id, 'verified')}
                              className="block text-[10px] text-blue-600 hover:underline cursor-pointer"
                            >
                              Approve KYC →
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">{tenant.kycDocType}</span>
                      </td>

                      {/* Lease Status & Dates */}
                      <td className="py-4 px-4 text-[11px]">
                        <span
                          className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                            tenant.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tenant.status === 'notice_period'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {tenant.status === 'notice_period' ? 'On Notice' : tenant.status}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {tenant.leaseStartDate} to {tenant.leaseEndDate}
                        </p>
                      </td>

                      {/* Action Menu */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            title="View Full File"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRecordPayment(tenant)}
                            title="Record Offline Payment"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-600 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          {tenant.status === 'active' && (
                            <button
                              onClick={() => onVacateTenant(tenant.id)}
                              title="Checkout / Vacate Room"
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-amber-700 border border-slate-200 transition-colors cursor-pointer"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteTenant(tenant.id)}
                            title="Delete Resident"
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  {selectedTenant.fullName.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedTenant.fullName}</h3>
                  <p className="text-xs text-slate-500">Resident ID: {selectedTenant.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CONTACT NUMBER</span>
                <p className="font-bold text-slate-900">{selectedTenant.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">EMAIL ADDRESS</span>
                <p className="font-bold text-slate-900 truncate">{selectedTenant.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ALLOCATED ROOM & BED</span>
                <p className="font-bold text-slate-900">
                  {selectedTenant.roomNumber} ({selectedTenant.bedNumber})
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MONTHLY RENT</span>
                <p className="font-bold text-emerald-700 font-mono">
                  {formatCurrency(selectedTenant.monthlyRent)}/month
                </p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">EMERGENCY CONTACT PERSON</span>
                <p className="font-semibold text-slate-800">
                  {selectedTenant.emergencyContactName} • {selectedTenant.emergencyContactPhone}
                </p>
              </div>
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">GOVERNMENT KYC RECORD</span>
                <p className="font-semibold text-slate-800">
                  {selectedTenant.kycDocType} • Status:{' '}
                  <span className={selectedTenant.kycStatus === 'verified' ? 'text-emerald-700' : 'text-amber-700'}>
                    {selectedTenant.kycStatus.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onRecordPayment(selectedTenant);
                  setSelectedTenant(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Record Payment
              </button>
              <button
                onClick={() => setSelectedTenant(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
