import React from 'react';
import { Modal } from '../../components/Modal';
import { Download, Printer, CheckCircle2, ShieldCheck, Building, Calendar, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export interface RentInvoice {
  id: string;
  month: string;
  amount: number;
  date: string;
  mode: string;
  transactionRef: string;
  status: 'paid' | 'pending';
}

interface RentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: RentInvoice | null;
  tenantName: string;
  roomNumber?: string;
}

export const RentReceiptModal: React.FC<RentReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  tenantName,
  roomNumber = '204',
}) => {
  const { showToast } = useToast();

  if (!invoice) return null;

  const handlePrint = () => {
    showToast('success', 'Print Receipt', 'Printing dialog initiated for ' + invoice.id);
  };

  const handleDownload = () => {
    showToast('success', 'Receipt Downloaded', `Receipt ${invoice.id}.pdf saved to your device.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Rent Payment Receipt"
      subtitle={`Receipt Reference: ${invoice.id}`}
    >
      <div className="space-y-5 text-slate-700 text-xs">
        {/* Receipt Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
              <Building className="w-3.5 h-3.5" />
              Haven Stay Co-Living
            </div>
            <h4 className="text-base font-black tracking-tight text-white mt-0.5">
              Rent Receipt • {invoice.month}
            </h4>
            <p className="text-[11px] text-blue-200">
              GSTIN: 29AABCU9603R1ZM • Bangalore Urban
            </p>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PAID IN FULL
            </span>
            <span className="block text-[11px] text-blue-200 mt-1 font-mono">{invoice.date}</span>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
          <div className="p-3.5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Tenant Details</span>
              <span className="font-bold text-slate-800 text-sm">{tenantName || 'Resident'}</span>
              <span className="text-[11px] text-slate-500 block">Room {roomNumber} • Haven Stay Koramangala</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Payment Method</span>
              <span className="font-semibold text-slate-700">{invoice.mode}</span>
              <span className="text-[10px] text-slate-400 font-mono block">Ref: {invoice.transactionRef}</span>
            </div>
          </div>

          <div className="p-3.5 space-y-2">
            <div className="flex justify-between items-center text-slate-600">
              <span>Monthly Room Accomodation Rent ({invoice.month})</span>
              <span className="font-semibold text-slate-800">₹{(invoice.amount - 1500).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>High-Speed Wi-Fi & Maintenance Charges</span>
              <span className="font-semibold text-slate-800">₹1,000</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Water, Power & Common Cleaning Subsidy</span>
              <span className="font-semibold text-slate-800">₹500</span>
            </div>
          </div>

          <div className="p-3.5 flex justify-between items-center bg-blue-50/60">
            <span className="font-black text-slate-800 text-sm uppercase">Total Settled Amount</span>
            <span className="text-base font-black text-blue-700">₹{invoice.amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          This is a computer-generated official receipt and does not require a physical signature.
          Maintained securely under HavenStay Resident Records.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF Slip
          </button>
        </div>
      </div>
    </Modal>
  );
};
