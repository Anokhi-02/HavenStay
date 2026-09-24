import React, { useState } from 'react';
import { X, CreditCard, IndianRupee, CheckCircle2 } from 'lucide-react';
import { Tenant } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSubmit: (tenantId: string, amount: number, mode: string, referenceId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  tenant,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !tenant) return null;

  const [amount, setAmount] = useState<number>(tenant.pendingDue > 0 ? tenant.pendingDue : tenant.monthlyRent);
  const [paymentMode, setPaymentMode] = useState('upi');
  const [referenceId, setReferenceId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tenant.id, Number(amount), paymentMode, referenceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Rent Receipt</h3>
              <p className="text-[11px] text-slate-500">Updates /tenants pending balance & records admin log</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resident Summary banner */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 block">{tenant.fullName}</span>
            <span className="text-slate-500 text-[11px]">
              {tenant.roomNumber} ({tenant.bedNumber}) • Rent: {formatCurrency(tenant.monthlyRent)}/mo
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-mono uppercase block">CURRENT DUE</span>
            <span className="font-bold text-rose-600 font-mono text-sm">
              {formatCurrency(tenant.pendingDue)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Payment Amount Received (₹) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Collection Channel *</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="net_banking">Direct Bank IMPS / NEFT Transfer</option>
              <option value="cash">Cash Payment at Desk</option>
              <option value="card">Debit / Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Transaction / UTR Reference No.</label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. UPI/402849102830"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
            >
              Confirm & Settle Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
