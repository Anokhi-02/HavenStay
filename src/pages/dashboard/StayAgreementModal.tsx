import React from 'react';
import { Modal } from '../../components/Modal';
import { FileText, Download, CheckCircle2, Shield, Calendar, Building, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StayAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
  roomNumber?: string;
  monthlyRent?: number;
  securityDeposit?: number;
}

export const StayAgreementModal: React.FC<StayAgreementModalProps> = ({
  isOpen,
  onClose,
  tenantName,
  roomNumber = '204 (Bed B)',
  monthlyRent = 12500,
  securityDeposit = 25000,
}) => {
  const { showToast } = useToast();

  const handleDownload = () => {
    showToast('success', 'Agreement Downloaded', 'Digital Rental Agreement (PDF) saved to your device.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Tenancy Stay Agreement"
      subtitle="Document ID: HST-AGR-2026-00492 • Legally Signed & Verified"
    >
      <div className="space-y-5 text-slate-700 text-xs">
        {/* Verification Status Strip */}
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">E-Signed & Active Lease</p>
              <p className="text-[11px] text-emerald-700">Valid from 01-Jan-2026 to 31-Dec-2026</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider">
            Verified
          </span>
        </div>

        {/* Agreement Summary Table */}
        <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
          <div className="p-3 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Property</span>
              <span className="font-bold text-slate-800">Haven Stay Co-Living</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
              <span className="font-semibold text-slate-700">Koramangala 4th Block, Bengaluru</span>
            </div>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Resident Name</span>
              <span className="font-bold text-slate-800">{tenantName || 'Resident'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Allotted Room</span>
              <span className="font-semibold text-slate-700">Room {roomNumber}</span>
            </div>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Rent</span>
              <span className="font-bold text-slate-800">₹{monthlyRent.toLocaleString('en-IN')} (Due by 5th)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Security Deposit</span>
              <span className="font-semibold text-slate-700">₹{securityDeposit.toLocaleString('en-IN')} (Refundable)</span>
            </div>
          </div>

          <div className="p-3 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Notice Period</span>
              <span className="font-semibold text-slate-700">30 Calendar Days prior</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Curfew / Gate Timing</span>
              <span className="font-semibold text-slate-700">11:30 PM (Biometric entry)</span>
            </div>
          </div>
        </div>

        {/* Core Terms Excerpt */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Key Residence Policies:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
            <li>Rent must be settled on or before the 5th of each calendar month.</li>
            <li>Zero-tolerance policy on loud noise or disturbance past 10:30 PM in shared corridors.</li>
            <li>Guests are permitted in common lounge areas between 09:00 AM and 08:30 PM.</li>
            <li>Security deposit will be refunded within 7 working days following checkout inspection.</li>
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs text-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF Agreement
          </button>
        </div>
      </div>
    </Modal>
  );
};
