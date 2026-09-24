import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { QrCode, CreditCard, Building2, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { RentInvoice } from './RentReceiptModal';

interface PayRentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  month: string;
  onPaymentSuccess: (invoiceData: RentInvoice) => void;
}

export const PayRentModal: React.FC<PayRentModalProps> = ({
  isOpen,
  onClose,
  amount,
  month,
  onPaymentSuccess,
}) => {
  const { showToast } = useToast();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const invoiceData: RentInvoice = {
        id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        month,
        amount,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        mode: method === 'upi' ? `UPI (${upiId})` : method === 'card' ? 'Visa / Mastercard Debit' : 'Net Banking (HDFC/ICICI)',
        transactionRef: `TXN${Date.now().toString().slice(-8)}`,
        status: 'paid',
      };

      onPaymentSuccess(invoiceData);
      showToast('success', 'Rent Payment Successful!', `Settled ₹${amount.toLocaleString('en-IN')} for ${month}. Digital receipt generated.`);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Monthly Residence Rent"
      subtitle={`Billing Cycle: ${month} • Due Amount: ₹${amount.toLocaleString('en-IN')}`}
    >
      <form onSubmit={handlePay} className="space-y-4 text-xs text-slate-700">
        {/* Payment Methods Pill Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMethod('upi')}
            className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
              method === 'upi'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            UPI / QR Scan
          </button>

          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
              method === 'card'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            Debit / Credit Card
          </button>

          <button
            type="button"
            onClick={() => setMethod('netbanking')}
            className={`p-3 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
              method === 'netbanking'
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            Net Banking
          </button>
        </div>

        {/* Method Details */}
        {method === 'upi' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Enter VPA / UPI ID
              </label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="mobilenumber@upi or name@okaxis"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              A collect request will be sent to your Google Pay, PhonePe, or Paytm app.
            </p>
          </div>
        )}

        {method === 'card' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Card Number
              </label>
              <input
                type="text"
                required
                defaultValue="4242 •••• •••• 4242"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  required
                  defaultValue="08/28"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  CVV
                </label>
                <input
                  type="password"
                  required
                  defaultValue="882"
                  maxLength={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {method === 'netbanking' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <p className="font-semibold text-slate-700">Supported Primary Banks:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input type="radio" name="bank" defaultChecked className="accent-blue-600" />
                HDFC Bank
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input type="radio" name="bank" className="accent-blue-600" />
                ICICI Bank
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input type="radio" name="bank" className="accent-blue-600" />
                State Bank of India
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                <input type="radio" name="bank" className="accent-blue-600" />
                Axis Bank
              </label>
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="flex justify-between items-center p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Total Payable</span>
            <span className="text-lg font-black text-blue-900">₹{amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            256-Bit SSL Encrypted
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authorizing Payment...
              </>
            ) : (
              `Authorize Payment (₹${amount.toLocaleString('en-IN')})`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
