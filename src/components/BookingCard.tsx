import React from 'react';
import { Calendar, MapPin, BedDouble, FileText, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Booking } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface BookingCardProps {
  booking: Booking;
  onViewPG?: (pgId: string) => void;
  onCancel?: (bookingId: string) => void;
  onStatusChange?: (bookingId: string, status: Booking['status']) => void;
  isAdminView?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewPG,
  onCancel,
  onStatusChange,
  isAdminView = false,
}) => {
  const { showToast } = useToast();

  const statusConfig = {
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle2,
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    pending: {
      label: 'Under Review',
      icon: Clock,
      class: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      class: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    rejected: {
      label: 'Declined',
      icon: XCircle,
      class: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    completed: {
      label: 'Completed Stay',
      icon: CheckCircle2,
      class: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  }[booking.status];

  const StatusIcon = statusConfig.icon;

  const handleDownloadInvoice = () => {
    showToast('success', 'Invoice Downloaded', `Booking receipt for ${booking.id} has been generated.`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-slate-400">
              #{booking.id}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.class}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Booked on {formatDate(booking.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleDownloadInvoice}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Receipt
          </button>
          {onViewPG && (
            <button
              onClick={() => onViewPG(booking.pgId)}
              className="text-xs font-medium text-rose-600 hover:underline flex items-center gap-0.5"
            >
              View PG <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4">
        {/* PG Info */}
        <div className="md:col-span-6 flex gap-3.5">
          <img
            src={booking.pgImage}
            alt={booking.pgName}
            className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
          />
          <div>
            <h4 className="text-base font-bold text-slate-800 line-clamp-1">
              {booking.pgName}
            </h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {booking.pgLocation}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-2 bg-slate-100 px-2 py-1 rounded-md w-fit">
              <BedDouble className="w-3.5 h-3.5 text-rose-500" />
              {booking.roomTypeName}
            </div>
          </div>
        </div>

        {/* Schedule & Duration */}
        <div className="md:col-span-3 space-y-1.5 text-xs border-l border-slate-100 pl-0 md:pl-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>Check-in Date</span>
          </div>
          <p className="font-semibold text-slate-700 text-sm">
            {formatDate(booking.checkInDate)}
          </p>
          <p className="text-slate-500">
            Stay Period: <span className="font-semibold text-slate-700">{booking.durationMonths} Month{booking.durationMonths > 1 ? 's' : ''}</span>
          </p>
          <p className="text-slate-500">
            Occupants: <span className="font-semibold text-slate-700">{booking.occupants} Person</span>
          </p>
        </div>

        {/* Financial Summary */}
        <div className="md:col-span-3 space-y-1 text-xs border-l border-slate-100 pl-0 md:pl-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between text-slate-500">
              <span>Monthly Rent</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(booking.monthlyRent)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Deposit (Refundable)</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(booking.securityDeposit)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>One-Time Maint.</span>
              <span className="font-medium text-slate-700">
                {formatCurrency(booking.maintenanceFee)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
            <span className="font-bold text-slate-800">Initial Total:</span>
            <span className="font-extrabold text-base text-rose-600">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Admin or Cancel Actions */}
      {(isAdminView || (booking.status === 'pending' || booking.status === 'confirmed')) && (
        <div className="pt-3 mt-1 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {isAdminView && onStatusChange ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Admin Controls:</span>
              {booking.status !== 'confirmed' && (
                <button
                  onClick={() => onStatusChange(booking.id, 'confirmed')}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Approve Booking
                </button>
              )}
              {booking.status !== 'rejected' && (
                <button
                  onClick={() => onStatusChange(booking.id, 'rejected')}
                  className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Decline Booking
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onCancel && (booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          )}

          <span className="text-[11px] text-slate-400">
            Tenant: {booking.userName} ({booking.userPhone})
          </span>
        </div>
      )}
    </div>
  );
};
