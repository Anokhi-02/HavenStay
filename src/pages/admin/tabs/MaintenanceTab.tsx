import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Filter,
  UserCheck,
  Zap,
  Wifi,
  Droplets,
  Sparkles,
} from 'lucide-react';
import { MaintenanceRequest, MaintenanceStatus, MaintenancePriority } from '../../../types';

interface MaintenanceTabProps {
  requests: MaintenanceRequest[];
  onOpenAddTicket: () => void;
  onUpdateStatus: (id: string, status: MaintenanceStatus, assignedTo?: string) => void;
  onDeleteTicket: (id: string) => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  requests,
  onOpenAddTicket,
  onUpdateStatus,
  onDeleteTicket,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | MaintenanceStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | MaintenancePriority>('all');

  const filteredTickets = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-blue-600" />;
      case 'plumbing':
        return <Droplets className="w-4 h-4 text-teal-600" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Facility Operations & Maintenance Helpdesk
          </h2>
          <p className="text-xs text-slate-500">
            Track resident maintenance tickets, dispatch facility technicians, and record resolutions.
          </p>
        </div>

        <button
          onClick={onOpenAddTicket}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Maintenance Ticket</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Ticket Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {filteredTickets.length} of {requests.length} issues
        </span>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            No maintenance tickets in this view.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getCategoryIcon(ticket.category)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ticket.title}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        ticket.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : ticket.priority === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {ticket.roomNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{ticket.description}</p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                    <span>Resident: <strong className="text-slate-800">{ticket.tenantName}</strong> ({ticket.tenantPhone})</span>
                    <span>•</span>
                    <span>Assigned: <strong className="text-slate-800">{ticket.assignedTo || 'Unassigned'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Action Dropdown */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <select
                  value={ticket.status}
                  onChange={(e) => onUpdateStatus(ticket.id, e.target.value as any)}
                  className={`text-xs font-bold rounded-xl px-3 py-2 border outline-none cursor-pointer transition-colors shadow-2xs ${
                    ticket.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : ticket.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="open">Status: Open</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="resolved">Status: Resolved</option>
                </select>

                <button
                  onClick={() => onDeleteTicket(ticket.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
