import React, { useState } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { Booking, VisitRequest } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface BookingsTabProps {
  bookings: Booking[];
  visits: VisitRequest[];
  onApproveBooking: (id: string) => void;
  onRejectBooking: (id: string) => void;
  onConvertToTenant: (booking: Booking) => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  visits,
  onApproveBooking,
  onRejectBooking,
  onConvertToTenant,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'visits'>('bookings');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-600" />
            Prospective Resident Admissions & Tour Visits
          </h2>
          <p className="text-xs text-slate-500">
            Review room booking requests, convert applicants directly into tenant contracts, and manage property tour visits.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'bookings'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Applications ({bookings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('visits')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'visits'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Physical Tours ({visits.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'bookings' ? (
        /* Bookings Applications Table */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Applicant Name</th>
                  <th className="py-3.5 px-4 font-bold">Room Category</th>
                  <th className="py-3.5 px-4 font-bold">Check-in Date</th>
                  <th className="py-3.5 px-4 font-bold">Duration</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No prospective applicant bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block text-xs">{b.userName}</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {b.userPhone || '+91 98765 43210'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block capitalize">
                          {b.roomTypeName || b.roomType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatCurrency(b.monthlyRent)}/mo
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-700">{b.checkInDate}</td>

                      <td className="py-4 px-4 text-slate-700">
                        {b.durationMonths ? `${b.durationMonths} Months` : 'Flexible'}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : b.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status === 'confirmed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : b.status === 'cancelled' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span className="uppercase">{b.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {b.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onApproveBooking(b.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => onRejectBooking(b.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs border border-slate-200 transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        ) : b.status === 'confirmed' ? (
                          <button
                            onClick={() => onConvertToTenant(b)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Admit into Registry</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visit Tour Requests */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Scheduled Physical Property Visits</h3>
          {visits.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              No pending property visits scheduled.
            </div>
          ) : (
            <div className="space-y-2">
              {visits.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{v.name}</span>
                    <span className="text-slate-500 ml-2">Phone: {v.phone}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tour Date: <strong className="text-blue-600">{v.date}</strong> • Preference: {v.roomType}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
