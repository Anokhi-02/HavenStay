import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, UserCheck } from 'lucide-react';
import { MaintenanceCategory, MaintenancePriority } from '../../../types';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    roomNumber: string;
    tenantName: string;
    tenantPhone: string;
    category: MaintenanceCategory;
    priority: MaintenancePriority;
    title: string;
    description: string;
    assignedTo: string;
  }) => void;
}

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [roomNumber, setRoomNumber] = useState('Room 204');
  const [tenantName, setTenantName] = useState('Rahul Sharma');
  const [tenantPhone, setTenantPhone] = useState('+91 98765 43210');
  const [category, setCategory] = useState<MaintenanceCategory>('plumbing');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('Ramesh (Facility Manager)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      roomNumber,
      tenantName,
      tenantPhone,
      category,
      priority,
      title,
      description,
      assignedTo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Log Maintenance / Complaint Ticket</h3>
              <p className="text-[11px] text-slate-500">Recorded into isolated /maintenance_requests collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Room 102"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Resident Full Name *</label>
              <input
                type="text"
                required
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              >
                <option value="wifi">Wi-Fi & Internet</option>
                <option value="plumbing">Plumbing / Water</option>
                <option value="electrical">Electrical / Power</option>
                <option value="cleaning">Housekeeping / Cleaning</option>
                <option value="appliance">Appliance / Geyser / AC</option>
                <option value="food">Dining / Food</option>
                <option value="other">Other Facility</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Urgency / Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              >
                <option value="urgent">Urgent (Immediate)</option>
                <option value="medium">Medium (Within 24h)</option>
                <option value="low">Low (Routine)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Ticket Subject / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Geyser thermostat not heating"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Detailed Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue reported by resident..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Assigned Technician / Staff</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Ramesh (Facility Manager) / Suresh (Electrician)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
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
              Dispatch Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
