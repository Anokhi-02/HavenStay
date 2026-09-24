import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, Clock, UserCheck, ShieldCheck, Check } from 'lucide-react';
import { PG } from '../../../types';

interface UpdateContactModalProps {
  isOpen: boolean;
  pg: PG | null;
  onClose: () => void;
  onSubmit: (pgId: string, contactData: Partial<PG['owner']>) => Promise<void>;
}

export const UpdateContactModal: React.FC<UpdateContactModalProps> = ({
  isOpen,
  pg,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !pg) return null;

  const [name, setName] = useState(pg.owner?.name || 'Nishi Rajput');
  const [phone, setPhone] = useState(pg.owner?.phone || '+91 98765 43210');
  const [alternatePhone, setAlternatePhone] = useState(pg.owner?.alternatePhone || '+91 87654 32109');
  const [email, setEmail] = useState(pg.owner?.email || 'nishirajput296@gmail.com');
  const [responseTime, setResponseTime] = useState(pg.owner?.responseTime || 'Within 15 mins');
  const [caretakerName, setCaretakerName] = useState(pg.owner?.caretakerName || 'Ramesh Kumar');
  const [caretakerPhone, setCaretakerPhone] = useState(pg.owner?.caretakerPhone || '+91 91234 56789');
  const [officeHours, setOfficeHours] = useState(pg.owner?.officeHours || '9:00 AM - 8:30 PM (Mon-Sun)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pg && pg.owner) {
      setName(pg.owner.name || 'Nishi Rajput');
      setPhone(pg.owner.phone || '+91 98765 43210');
      setAlternatePhone(pg.owner.alternatePhone || '+91 87654 32109');
      setEmail(pg.owner.email || 'nishirajput296@gmail.com');
      setResponseTime(pg.owner.responseTime || 'Within 15 mins');
      setCaretakerName(pg.owner.caretakerName || 'Ramesh Kumar');
      setCaretakerPhone(pg.owner.caretakerPhone || '+91 91234 56789');
      setOfficeHours(pg.owner.officeHours || '9:00 AM - 8:30 PM (Mon-Sun)');
    }
  }, [pg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(pg.id, {
        name,
        phone,
        alternatePhone,
        email,
        responseTime,
        caretakerName,
        caretakerPhone,
        officeHours,
        verified: true,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update owner contacts:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl my-8 p-5 sm:p-6 shadow-xl space-y-5 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Change Owner Contact Details</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                  {pg.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Update phone numbers, WhatsApp, caretaker info, and inquiry response times.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Primary Owner Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Primary PG Owner / License Holder
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Owner Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Phone (Call & WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Alternate / WhatsApp Phone</label>
                <input
                  type="tel"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Inquiry Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Response Time Promise</label>
              <div className="flex gap-2">
                {['Within 10 mins', 'Within 30 mins', 'Within 1 hour', 'Same day'].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setResponseTime(time)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      responseTime === time
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* On-Site Caretaker & Support */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              On-Site Property Warden / Caretaker
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Caretaker / Warden Name</label>
                <input
                  type="text"
                  value={caretakerName}
                  onChange={(e) => setCaretakerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Caretaker Direct Phone</label>
                <input
                  type="tel"
                  value={caretakerPhone}
                  onChange={(e) => setCaretakerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Property Tour & Visit Timings</label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                placeholder="e.g. 9:00 AM - 8:30 PM (Mon-Sun)"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Contacts...' : 'Update & Save Contacts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
