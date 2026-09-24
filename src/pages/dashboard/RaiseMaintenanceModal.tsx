import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Wrench, AlertTriangle, CheckCircle2, Shield, Loader2 } from 'lucide-react';
import { MaintenanceCategory, MaintenancePriority, MaintenanceRequest } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface RaiseMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ticket: MaintenanceRequest) => void;
  defaultRoomNumber?: string;
}

export const RaiseMaintenanceModal: React.FC<RaiseMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  defaultRoomNumber = '204',
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [category, setCategory] = useState<MaintenanceCategory>('plumbing');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [roomNumber, setRoomNumber] = useState(defaultRoomNumber);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('error', 'Missing Information', 'Please provide a title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticket = await api.maintenance.create({
        tenantId: user?.id || 'tenant_current',
        tenantName: user?.fullName || 'Resident',
        tenantPhone: user?.phone || '+91 98765 43210',
        pgId: 'haven-stay-koramangala',
        roomNumber: roomNumber.trim() || '204',
        category,
        priority,
        status: 'open',
        title: title.trim(),
        description: description.trim(),
      });

      onCreated(ticket);
      showToast('success', 'Ticket Submitted', 'Staff & Warden have been notified. Ticket #' + ticket.id);
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not submit maintenance request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise Helpdesk & Repair Ticket"
      subtitle="Report room, bathroom, electrical, or Wi-Fi issues to on-site management"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Issue Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="plumbing">🚰 Plumbing & Water Leakage</option>
              <option value="electrical">⚡ Electrical & Power Points</option>
              <option value="wifi">📶 Wi-Fi & Internet Speed</option>
              <option value="cleaning">🧹 Housekeeping & Deep Clean</option>
              <option value="appliance">❄️ AC & Appliances</option>
              <option value="food">🍲 Food & Dining Mess</option>
              <option value="other">🔧 Other / Carpentry</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Urgency / Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Low (Routine check within 48h)</option>
              <option value="medium">🟡 Medium (Attended today within 12h)</option>
              <option value="urgent">🔴 Urgent (Immediate attention / critical)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Room / Bed Identifier
          </label>
          <input
            type="text"
            required
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 204 (Bed B)"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Summary / Headline
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bathroom hot water geyser not heating up"
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Detailed Description & Preferred Times
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail what happens, error signs, and when a technician may enter your room (e.g. between 2 PM to 5 PM)."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2 text-[11px] text-blue-800">
          <Wrench className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            HavenStay on-site maintenance operates 7 days a week from 8:30 AM to 8:00 PM. Emergency plumbing/electrical issues are attended round-the-clock.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              'Submit Request to Management'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
