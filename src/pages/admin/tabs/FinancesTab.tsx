import React, { useState } from 'react';
import {
  IndianRupee,
  CreditCard,
  AlertTriangle,
  Send,
  CheckCircle2,
  Lock,
  ArrowDownRight,
  TrendingUp,
  Receipt,
  FileCheck,
  Copy,
  Check,
} from 'lucide-react';
import { Tenant } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { useToast } from '../../../context/ToastContext';

interface FinancesTabProps {
  tenants: Tenant[];
  onRecordPayment: (tenant: Tenant) => void;
}

export const FinancesTab: React.FC<FinancesTabProps> = ({ tenants, onRecordPayment }) => {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeTenants = tenants.filter((t) => t.status === 'active');
  const totalMonthlyProjected = activeTenants.reduce((sum, t) => sum + (t.monthlyRent || 0), 0);
  const totalPendingDue = tenants.reduce((sum, t) => sum + (t.pendingDue || 0), 0);
  const totalCollected = Math.max(0, totalMonthlyProjected - totalPendingDue);
  const totalDepositEscrow = tenants.reduce((sum, t) => sum + (t.depositPaid ? t.securityDeposit : 0), 0);

  const defaulters = tenants.filter((t) => (t.pendingDue || 0) > 0);

  const handleCopyReminder = (tenant: Tenant) => {
    const text = `Hi ${tenant.fullName}, this is a gentle reminder from HavenStay Coliving regarding your pending room rent balance of ${formatCurrency(tenant.pendingDue)} for ${tenant.roomNumber} (${tenant.bedNumber}). Kindly clear it via UPI/Bank transfer at your earliest convenience to avoid late fee penalties. Thank you! - HavenStay Management`;
    navigator.clipboard.writeText(text);
    setCopiedId(tenant.id);
    showToast('info', 'Reminder Copied', `Payment reminder message for ${tenant.fullName} copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-blue-600" />
          Rent Collection & Financial Ledger
        </h2>
        <p className="text-xs text-slate-500">
          Monthly billing reconciliation, pending tenant receivables, and security deposit escrow.
        </p>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Projected Monthly Rent
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono block">
            {formatCurrency(totalMonthlyProjected)}
          </span>
          <span className="text-[11px] text-slate-500 mt-2 block">
            From {activeTenants.length} active room contracts
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Realized Collections
          </span>
          <span className="text-2xl font-bold text-emerald-700 font-mono block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-emerald-600 mt-2 block">
            {totalMonthlyProjected > 0 ? Math.round((totalCollected / totalMonthlyProjected) * 100) : 0}% settled
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Outstanding Due
          </span>
          <span className="text-2xl font-bold text-rose-600 font-mono block">
            {formatCurrency(totalPendingDue)}
          </span>
          <span className="text-[11px] text-rose-600 mt-2 block">
            Across {defaulters.length} pending resident accounts
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Deposit Escrow Held
          </span>
          <span className="text-2xl font-bold text-purple-700 font-mono block">
            {formatCurrency(totalDepositEscrow)}
          </span>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Held in refundable security escrow
          </span>
        </div>
      </div>

      {/* Pending Rent Defaulters Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Pending Receivables & Notice Generator
            </h3>
            <p className="text-[11px] text-slate-500">Tenants with unpaid rent balances for the active cycle</p>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            {defaulters.length} Accounts
          </span>
        </div>

        {defaulters.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            Zero outstanding rent arrears. All active tenants are up to date!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">Resident & Room</th>
                  <th className="py-2.5 px-3">Monthly Rent</th>
                  <th className="py-2.5 px-3">Pending Balance</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaulters.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{t.fullName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {t.roomNumber} • {t.bedNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{formatCurrency(t.monthlyRent)}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-rose-600 text-sm">
                        {formatCurrency(t.pendingDue)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{t.phone}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyReminder(t)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          {copiedId === t.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Reminder</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => onRecordPayment(t)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Deposit Escrow Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Security Deposit Escrow Ledger
            </h3>
            <p className="text-[11px] text-slate-500">Refundable deposits collected during move-in admission</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-2.5 px-3">Resident</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Escrow Held</th>
                <th className="py-2.5 px-3">Admission Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{t.fullName}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{t.roomNumber}</td>
                  <td className="py-3 px-3 font-mono font-bold text-purple-700">
                    {formatCurrency(t.securityDeposit)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{t.leaseStartDate}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      In Escrow Account
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
