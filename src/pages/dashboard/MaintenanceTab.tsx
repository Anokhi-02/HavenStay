import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Filter,
  UserCheck,
} from 'lucide-react';
import { MaintenanceRequest, MaintenanceStatus } from '../../types';

interface MaintenanceTabProps {
  tickets: MaintenanceRequest[];
  onOpenRaiseModal: () => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  tickets,
  onOpenRaiseModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | MaintenanceStatus>('all');

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'open':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">Urgent</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">Routine</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Helpdesk & Room Maintenance
          </h2>
          <p className="text-xs text-slate-500">
            Directly raise repairs, electrical, Wi-Fi, or cleaning tickets with on-site staff.
          </p>
        </div>

        <button
          onClick={onOpenRaiseModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Raise Maintenance Request
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          All Requests ({tickets.length})
        </button>
        <button
          onClick={() => setStatusFilter('open')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            statusFilter === 'open'
              ? 'bg-amber-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Pending ({tickets.filter((t) => t.status === 'open').length})
        </button>
        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-blue-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          In Progress ({tickets.filter((t) => t.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Resolved ({tickets.filter((t) => t.status === 'resolved').length})
        </button>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Tickets Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Everything is running smoothly! If you need any electrical, plumbing, or Wi-Fi assistance, click "Raise Maintenance Request".
          </p>
          <button
            onClick={onOpenRaiseModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Create New Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                    {t.category.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      Ticket #{t.id} • Room {t.roomNumber} • Category: {t.category.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getPriorityBadge(t.priority)}
                  {getStatusBadge(t.status)}
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {t.description}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Reported on {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {t.assignedTo ? (
                  <span className="flex items-center gap-1 text-blue-600 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    Assigned: {t.assignedTo}
                  </span>
                ) : (
                  <span className="text-slate-400">Awaiting technician assignment</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
