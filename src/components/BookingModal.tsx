import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, BedDouble, Users, CheckCircle2, ShieldCheck, Clock, MapPin, IndianRupee } from 'lucide-react';
import { PG, RoomOption, RoomType } from '../types';
import { Modal } from './Modal';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pg: PG;
  defaultRoomType?: RoomType;
  onBookingSuccess: (bookingId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  pg,
  defaultRoomType,
  onBookingSuccess,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>(
    defaultRoomType || (pg.roomOptions[0]?.type || 'single')
  );
  
  // Set default check-in to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(defaultDateStr);
  const [durationMonths, setDurationMonths] = useState(3);
  const [occupants, setOccupants] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Find active room details
  const activeRoom: RoomOption =
    pg.roomOptions.find((r) => r.type === selectedRoomType) || pg.roomOptions[0];

  const monthlyRent = activeRoom.price;
  const securityDeposit = activeRoom.securityDeposit;
  const maintenanceFee = 1500;
  const totalAmount = monthlyRent + securityDeposit + maintenanceFee;

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      showToast('error', 'Login Required', 'Please sign in or create an account to complete your booking.');
      return;
    }

    if (activeRoom.availableBeds <= 0) {
      showToast('error', 'No Beds Available', 'This room type is currently fully booked. Please choose another option.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await api.bookings.create({
        pgId: pg.id,
        pgName: pg.name,
        pgImage: pg.images[0],
        pgLocation: `${pg.location.area}, ${pg.location.city}`,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        userPhone: user.phone,
        roomType: activeRoom.type,
        roomTypeName: activeRoom.name,
        occupants,
        checkInDate,
        durationMonths,
        monthlyRent,
        securityDeposit,
        maintenanceFee,
        totalAmount,
        notes,
      });

      setConfirmedBookingId(newBooking.id);
      showToast('success', 'Booking Confirmed!', `Your stay at ${pg.name} is reserved.`);
    } catch (err: any) {
      showToast('error', 'Booking Failed', err.message || 'Something went wrong. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setConfirmedBookingId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={confirmedBookingId ? 'Booking Confirmed!' : 'Reserve Your Stay'}
      subtitle={
        confirmedBookingId
          ? 'Your room has been reserved. Zero paperwork check-in enabled.'
          : `${pg.name} • ${pg.location.area}, ${pg.location.city}`
      }
      maxWidth="3xl"
    >
      {confirmedBookingId ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h4 className="text-2xl font-black text-slate-800">
              You are all set!
            </h4>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Booking ID <span className="font-mono font-bold text-slate-700">#{confirmedBookingId}</span> has been confirmed. The property manager will reach out via WhatsApp & Email.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Property:</span>
              <span className="font-semibold text-slate-800">{pg.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room Type:</span>
              <span className="font-semibold text-slate-800">{activeRoom.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Check-in:</span>
              <span className="font-semibold text-slate-800">{checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-slate-800">{durationMonths} Months</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => {
                resetAndClose();
                onBookingSuccess(confirmedBookingId);
              }}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all shadow-xs active:scale-95"
            >
              Go to My Bookings
            </button>
            <button
              onClick={resetAndClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Fields */}
          <div className="lg:col-span-7 space-y-5">
            {/* Room Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Room Type
              </label>
              <div className="space-y-2">
                {pg.roomOptions.map((room) => {
                  const isSelected = selectedRoomType === room.type;
                  const isSoldOut = room.availableBeds <= 0;

                  return (
                    <div
                      key={room.type}
                      onClick={() => !isSoldOut && setSelectedRoomType(room.type)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="roomTypeRadio"
                          checked={isSelected}
                          onChange={() => setSelectedRoomType(room.type)}
                          disabled={isSoldOut}
                          className="text-rose-500 focus:ring-rose-500"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {room.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isSoldOut ? (
                              <span className="text-rose-500 font-semibold">Sold Out</span>
                            ) : (
                              `${room.availableBeds} beds available`
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-800">
                          {formatCurrency(room.price)}
                        </span>
                        <span className="text-xs text-slate-500 block">/ month</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dates & Duration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  min={defaultDateStr}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  Stay Duration
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                >
                  <option value={1}>1 Month (Flexible)</option>
                  <option value={3}>3 Months (Standard)</option>
                  <option value={6}>6 Months (Recommended)</option>
                  <option value={11}>11 Months (Full Year)</option>
                </select>
              </div>
            </div>

            {/* Occupants & Special Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  Number of Occupants
                </label>
                <select
                  value={occupants}
                  onChange={(e) => setOccupants(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                >
                  <option value={1}>1 Person</option>
                  <option value={2}>2 Persons (Twin room)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Any Preference / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Higher floor, quiet desk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                <b>HavenStay Guarantee:</b> 100% refundable token within 24 hours of site visit. Zero brokerage.
              </span>
            </div>
          </div>

          {/* Booking Summary Card */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-200">
                Booking Summary Card
              </h4>

              <div className="pt-3 space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Property</p>
                  <p className="text-sm font-bold text-slate-800">{pg.name}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Selected Room</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {activeRoom.name}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Monthly Rent</span>
                    <span className="font-semibold">{formatCurrency(monthlyRent)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      Security Deposit
                      <span className="text-[10px] text-emerald-600 font-medium">(100% Refundable)</span>
                    </span>
                    <span className="font-semibold">{formatCurrency(securityDeposit)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>One-Time Maintenance & Onboarding</span>
                    <span className="font-semibold">{formatCurrency(maintenanceFee)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-dashed border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                      Total Due Now
                    </span>
                    <span className="text-[11px] text-slate-500">
                      (Includes first month + deposit)
                    </span>
                  </div>
                  <span className="text-xl font-extrabold text-rose-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Reservation...</span>
                  </>
                ) : (
                  <span>Confirm Booking</span>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 mt-2">
                By confirming, you agree to the standard House Rules and HavenStay Policies.
              </p>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
