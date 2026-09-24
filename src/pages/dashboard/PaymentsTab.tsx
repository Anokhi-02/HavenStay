import React from 'react';
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Building,
  ShieldCheck,
  Calendar,
  Plus,
} from 'lucide-react';
import { RentInvoice } from './RentReceiptModal';

interface PaymentsTabProps {
  invoices: RentInvoice[];
  onOpenPayRent: () => void;
  onViewReceipt: (invoice: RentInvoice) => void;
  currentDue?: number;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  invoices,
  onOpenPayRent,
  onViewReceipt,
  currentDue = 0,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Rent & Payment Slips
          </h2>
          <p className="text-xs text-slate-500">
            Digital receipts, monthly invoicing, and security deposit ledger.
          </p>
        </div>

        <button
          onClick={onOpenPayRent}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Pay Rent Online
        </button>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Outstanding</span>
            <h4 className="text-2xl font-black text-emerald-600 mt-0.5">
              ₹{currentDue.toLocaleString('en-IN')}
            </h4>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              ✓ All dues cleared up to date
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Accommodation Rent</span>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">
              ₹12,500
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Billed on 1st of every month
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Refundable Security Deposit</span>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">
              ₹25,000
            </h4>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">
              Safe in Escrow Account
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment History & Tax Invoices</h3>
            <p className="text-xs text-slate-500">Every rent payment generates an official GST-compliant receipt.</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {invoices.length} Receipts Found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-5">Receipt ID</th>
                <th className="py-3.5 px-4">Billing Month</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Paid Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {inv.month}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {inv.mode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onViewReceipt(inv)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      Slip
                    </button>
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
