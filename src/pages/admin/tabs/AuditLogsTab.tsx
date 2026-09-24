import React, { useState } from 'react';
import {
  ShieldCheck,
  History,
  UserCheck,
  Filter,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
  Key,
} from 'lucide-react';
import { AdminProfile, AdminLog, AdminLogCategory } from '../../../types';

interface AuditLogsTabProps {
  admins: AdminProfile[];
  logs: AdminLog[];
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ admins, logs }) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | AdminLogCategory>('all');

  const filteredLogs = logs.filter((l) => {
    return categoryFilter === 'all' || l.category === categoryFilter;
  });

  const getCategoryBadge = (cat: AdminLogCategory) => {
    switch (cat) {
      case 'tenant':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'billing':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'inventory':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Admin Personnel & System Audit Ledger
        </h2>
        <p className="text-xs text-slate-500">
          Dedicated collection (<span className="font-mono text-emerald-700">/admins</span> &{' '}
          <span className="font-mono text-emerald-700">/admin_logs</span>) with strict security isolation.
        </p>
      </div>

      {/* Admin Profiles Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Authorized Administrative Staff
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map((adm) => (
            <div
              key={adm.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {adm.fullName.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{adm.fullName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {adm.role === 'super_admin' ? 'OWNER / SUPER ADMIN' : 'FACILITY MANAGER'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">{adm.email}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600">{adm.designation}</p>

              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                <span>Phone: <strong className="text-slate-800">{adm.phone}</strong></span>
                <span className="font-mono">Last Active: {adm.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Immutable Operations Audit Trail
            </h3>
            <p className="text-[11px] text-slate-500">Chronological verification log of all administrator operations</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-transparent text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="tenant">Tenant Operations</option>
              <option value="billing">Billing & Rent</option>
              <option value="inventory">Inventory & Rooms</option>
              <option value="maintenance">Maintenance Tickets</option>
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getCategoryBadge(log.category)}`}>
                    {log.category}
                  </span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{log.details}</p>
              </div>

              <div className="text-left sm:text-right shrink-0 text-[11px] font-mono text-slate-500">
                <span className="block text-slate-800 font-medium">{log.adminName}</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
