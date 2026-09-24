import React, { useState, useEffect } from 'react';
import { X, IndianRupee, TrendingUp, ShieldCheck, Clock, Check, Utensils } from 'lucide-react';
import { PG, RoomOption } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface UpdatePricesModalProps {
  isOpen: boolean;
  pg: PG | null;
  onClose: () => void;
  onSubmit: (
    pgId: string,
    pricingData: {
      startingPrice: number;
      roomOptions: RoomOption[];
      depositMonths: number;
      noticePeriodDays: number;
      foodProvided: boolean;
      foodDetails?: string;
    }
  ) => Promise<void>;
}

export const UpdatePricesModal: React.FC<UpdatePricesModalProps> = ({
  isOpen,
  pg,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !pg) return null;

  const [startingPrice, setStartingPrice] = useState<number>(pg.startingPrice || 7500);
  const [depositMonths, setDepositMonths] = useState<number>(pg.depositMonths || 2);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(pg.noticePeriodDays || 30);
  const [foodProvided, setFoodProvided] = useState<boolean>(pg.foodProvided ?? true);
  const [foodDetails, setFoodDetails] = useState<string>(
    pg.foodDetails || 'Breakfast, Lunch & Dinner included with Sunday Special menu.'
  );
  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pg) {
      setStartingPrice(pg.startingPrice || 7500);
      setDepositMonths(pg.depositMonths || 2);
      setNoticePeriodDays(pg.noticePeriodDays || 30);
      setFoodProvided(pg.foodProvided ?? true);
      setFoodDetails(pg.foodDetails || 'Breakfast, Lunch & Dinner included with Sunday Special menu.');
      if (pg.roomOptions && pg.roomOptions.length > 0) {
        setRoomOptions(JSON.parse(JSON.stringify(pg.roomOptions)));
      } else {
        setRoomOptions([
          {
            type: 'single',
            name: 'Single Room',
            price: 13500,
            securityDeposit: 27000,
            totalBeds: 6,
            availableBeds: 2,
            features: ['Attached Washroom', 'AC', 'Wi-Fi'],
          },
          {
            type: 'double',
            name: 'Double Sharing',
            price: 9500,
            securityDeposit: 19000,
            totalBeds: 16,
            availableBeds: 4,
            features: ['Attached Washroom', 'Wi-Fi'],
          },
          {
            type: 'triple',
            name: 'Triple Sharing',
            price: 7500,
            securityDeposit: 15000,
            totalBeds: 8,
            availableBeds: 1,
            features: ['High-Speed Wi-Fi'],
          },
        ]);
      }
    }
  }, [pg]);

  const handleRoomPriceChange = (index: number, newPrice: number) => {
    setRoomOptions((prev) => {
      const copy = [...prev];
      copy[index].price = newPrice;
      copy[index].securityDeposit = newPrice * depositMonths;
      return copy;
    });

    // Auto-update lowest price
    const lowest = Math.min(newPrice, ...roomOptions.filter((_, i) => i !== index).map((r) => r.price));
    if (lowest > 0 && lowest !== startingPrice) {
      setStartingPrice(lowest);
    }
  };

  const handleRoomDepositChange = (index: number, newDeposit: number) => {
    setRoomOptions((prev) => {
      const copy = [...prev];
      copy[index].securityDeposit = newDeposit;
      return copy;
    });
  };

  const handleDepositMonthsChange = (months: number) => {
    setDepositMonths(months);
    setRoomOptions((prev) =>
      prev.map((r) => ({
        ...r,
        securityDeposit: r.price * months,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(pg.id, {
        startingPrice,
        roomOptions,
        depositMonths,
        noticePeriodDays,
        foodProvided,
        foodDetails: foodProvided ? foodDetails : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update pricing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl my-8 p-5 sm:p-6 shadow-xl space-y-5 text-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Update Prices & Security Deposit</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                  {pg.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Adjust room tariffs, lease security deposits, and notice periods for residents.
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Base Advertised Starting Price */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-900 font-bold text-xs sm:text-sm">
                  Advertised Starting Monthly Rent
                </label>
                <p className="text-[11px] text-slate-500">
                  Headline "Starting from" price shown on public cards and Google search listings.
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1000"
                  step="100"
                  required
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="w-36 pl-7 pr-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 font-mono text-base font-bold outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* Room-by-Room Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Room Category Tariffs & Deposits
              </h4>
              <span className="text-[11px] text-slate-500">Per Bed / Resident</span>
            </div>

            <div className="space-y-2.5">
              {roomOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                        {opt.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {opt.totalBeds} total beds • {opt.availableBeds} available slots
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold mb-0.5">
                        Monthly Rent (₹)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        required
                        value={opt.price}
                        onChange={(e) => handleRoomPriceChange(idx, Number(e.target.value))}
                        className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:border-blue-500 text-slate-900 font-mono font-bold text-xs outline-none text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-600 font-bold mb-0.5">
                        Security Deposit (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={opt.securityDeposit}
                        onChange={(e) => handleRoomDepositChange(idx, Number(e.target.value))}
                        className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 focus:border-blue-500 text-slate-700 font-mono text-xs outline-none text-right"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lease Terms & Policies */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Lease Terms & Notice Rules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Default Security Deposit Rule
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => handleDepositMonthsChange(months)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        depositMonths === months
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {months} Month{months > 1 ? 's' : ''} Rent
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mandatory Notice Period
                </label>
                <div className="flex gap-2">
                  {[15, 30, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setNoticePeriodDays(days)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        noticePeriodDays === days
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Food & Meals Policy */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Food & Mess Inclusions</span>
                  <span className="text-[11px] text-slate-500">
                    Are meals included in the monthly tariff?
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFoodProvided(!foodProvided)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  foodProvided
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {foodProvided ? 'Meals Included' : 'No Food'}
              </button>
            </div>

            {foodProvided && (
              <div>
                <label className="block text-slate-600 text-[11px] mb-1 font-medium">Meal Details & Timings</label>
                <input
                  type="text"
                  value={foodDetails}
                  onChange={(e) => setFoodDetails(e.target.value)}
                  placeholder="e.g. Breakfast, Lunch & Dinner included with weekend specials"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 text-xs outline-none"
                />
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Tariffs...' : 'Save & Publish Price Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
