import React, { useState, useEffect } from 'react';
import { X, Bed, Plus, Trash2, Check, Sparkles, Layers, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { PG, RoomOption, RoomType } from '../../../types';

interface UpdateRoomDetailsModalProps {
  isOpen: boolean;
  pg: PG | null;
  onClose: () => void;
  onSubmit: (pgId: string, roomOptions: RoomOption[], totalBeds: number, availableBeds: number) => Promise<void>;
  onOpenBulkImport?: (pg: PG) => void;
}

const COMMON_FEATURES = [
  'Attached Washroom',
  'Air Conditioner',
  'High-Speed Wi-Fi',
  'Balcony View',
  'Ergonomic Work Desk',
  'Custom Wardrobe',
  'Water Geyser',
  'Mini Fridge',
  'Smart Android TV',
  'Daily Housekeeping',
];

export const UpdateRoomDetailsModal: React.FC<UpdateRoomDetailsModalProps> = ({
  isOpen,
  pg,
  onClose,
  onSubmit,
  onOpenBulkImport,
}) => {
  if (!isOpen || !pg) return null;

  const [roomOptions, setRoomOptions] = useState<RoomOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureInput, setFeatureInput] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (pg.roomOptions && pg.roomOptions.length > 0) {
      setRoomOptions(JSON.parse(JSON.stringify(pg.roomOptions)));
    } else {
      // Default initial tiers if none configured
      setRoomOptions([
        {
          type: 'single',
          name: 'Executive Single Studio',
          price: pg.startingPrice || 14000,
          securityDeposit: (pg.startingPrice || 14000) * 2,
          totalBeds: 6,
          availableBeds: 2,
          features: ['Attached Washroom', 'Air Conditioner', 'Ergonomic Work Desk', 'High-Speed Wi-Fi'],
        },
        {
          type: 'double',
          name: 'Premium Double Sharing',
          price: Math.round((pg.startingPrice || 14000) * 0.75),
          securityDeposit: Math.round((pg.startingPrice || 14000) * 1.5),
          totalBeds: 16,
          availableBeds: 4,
          features: ['Attached Washroom', 'Custom Wardrobe', 'High-Speed Wi-Fi'],
        },
        {
          type: 'triple',
          name: 'Comfort Triple Sharing',
          price: Math.round((pg.startingPrice || 14000) * 0.6),
          securityDeposit: Math.round((pg.startingPrice || 14000) * 1.2),
          totalBeds: 8,
          availableBeds: 1,
          features: ['Attached Washroom', 'High-Speed Wi-Fi', 'Daily Housekeeping'],
        },
      ]);
    }
  }, [pg]);

  const totalBedsCalculated = roomOptions.reduce((acc, r) => acc + (Number(r.totalBeds) || 0), 0);
  const availableBedsCalculated = roomOptions.reduce((acc, r) => acc + (Number(r.availableBeds) || 0), 0);

  const handleUpdateOption = (index: number, field: keyof RoomOption, value: any) => {
    setRoomOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddFeature = (index: number) => {
    const text = (featureInput[index] || '').trim();
    if (!text) return;
    setRoomOptions((prev) => {
      const copy = [...prev];
      if (!copy[index].features.includes(text)) {
        copy[index].features = [...copy[index].features, text];
      }
      return copy;
    });
    setFeatureInput({ ...featureInput, [index]: '' });
  };

  const handleRemoveFeature = (optionIndex: number, featureIndex: number) => {
    setRoomOptions((prev) => {
      const copy = [...prev];
      copy[optionIndex].features = copy[optionIndex].features.filter((_, i) => i !== featureIndex);
      return copy;
    });
  };

  const handleTogglePresetFeature = (optionIndex: number, feature: string) => {
    setRoomOptions((prev) => {
      const copy = [...prev];
      if (copy[optionIndex].features.includes(feature)) {
        copy[optionIndex].features = copy[optionIndex].features.filter((f) => f !== feature);
      } else {
        copy[optionIndex].features = [...copy[optionIndex].features, feature];
      }
      return copy;
    });
  };

  const handleAddNewTier = () => {
    setRoomOptions((prev) => [
      ...prev,
      {
        type: 'double',
        name: `Sharing Tier #${prev.length + 1}`,
        price: 9000,
        securityDeposit: 18000,
        totalBeds: 4,
        availableBeds: 2,
        features: ['Attached Washroom', 'High-Speed Wi-Fi'],
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (roomOptions.length <= 1) {
      alert('You must have at least one room category configuration.');
      return;
    }
    setRoomOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(pg.id, roomOptions, totalBedsCalculated, availableBedsCalculated);
      onClose();
    } catch (err) {
      console.error('Failed to update room details:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl my-8 p-5 sm:p-6 shadow-xl space-y-5 text-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Bed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Update Room Details & Bed Specs</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                  {pg.name}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure room categories, bed capacities, amenities, and available slots.
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

        {/* Bulk CSV Import Quick Switch Banner */}
        {onOpenBulkImport && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  Need to bulk import room categories & prices?
                </span>
                <span className="text-[11px] text-slate-500">
                  Upload an Excel/CSV spreadsheet to populate sharing types, rents, and deposits at once.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBulkImport(pg);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-2xs"
            >
              <span>Bulk CSV Import</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Capacity Summary Badge Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">Total Calculated Beds:</span>
            <span className="font-bold text-slate-900 text-sm">{totalBedsCalculated}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500">Available Slots:</span>
            <span className="font-bold text-emerald-700 text-sm">{availableBedsCalculated} Vacant</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {roomOptions.length} Room Tier Categories Configured
          </div>
        </div>

        {/* Scrollable Room Option Configuration Cards */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {roomOptions.map((option, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 relative"
            >
              {/* Category Header & Delete */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-blue-600" /> Room Category #{idx + 1}
                </span>
                {roomOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    title="Delete this room tier"
                    className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Category</span>
                  </button>
                )}
              </div>

              {/* Title & Sharing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Room Display Title *</label>
                  <input
                    type="text"
                    required
                    value={option.name}
                    onChange={(e) => handleUpdateOption(idx, 'name', e.target.value)}
                    placeholder="e.g. Executive Single Studio"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Room Type / Occupancy *</label>
                  <select
                    value={option.type}
                    onChange={(e) => handleUpdateOption(idx, 'type', e.target.value as RoomType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                  >
                    <option value="single">Single Sharing (1 Bed)</option>
                    <option value="double">Double Sharing (2 Beds)</option>
                    <option value="triple">Triple Sharing (3 Beds)</option>
                    <option value="four_sharing">Four Sharing (4 Beds)</option>
                  </select>
                </div>
              </div>

              {/* Beds & Availability */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total Beds</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={option.totalBeds}
                    onChange={(e) => handleUpdateOption(idx, 'totalBeds', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Available Beds</label>
                  <input
                    type="number"
                    min="0"
                    max={option.totalBeds}
                    required
                    value={option.availableBeds}
                    onChange={(e) => handleUpdateOption(idx, 'availableBeds', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-emerald-700 font-bold outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rent / Bed / Mo (₹)</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={option.price}
                    onChange={(e) => handleUpdateOption(idx, 'price', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={option.securityDeposit}
                    onChange={(e) => handleUpdateOption(idx, 'securityDeposit', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-700 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Room Amenities & Features */}
              <div className="space-y-2 pt-1">
                <label className="block text-slate-700 font-bold">Room Features & Amenities</label>
                
                {/* Active Feature Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {option.features.map((feat, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 text-[11px] shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx, fIdx)}
                        className="hover:text-rose-600 ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preset Quick-Click Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {COMMON_FEATURES.map((feat) => {
                    const isSelected = option.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        type="button"
                        onClick={() => handleTogglePresetFeature(idx, feat)}
                        className={`text-[10px] px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {feat}
                      </button>
                    );
                  })}
                </div>

                {/* Custom feature input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Type custom amenity (e.g. Smart Keyless Lock, Private Terrace)..."
                    value={featureInput[idx] || ''}
                    onChange={(e) => setFeatureInput({ ...featureInput, [idx]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature(idx);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFeature(idx)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Room Category Button */}
          <button
            type="button"
            onClick={handleAddNewTier}
            className="w-full py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-dashed border-slate-300 hover:border-slate-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Room Category / Tier</span>
          </button>

          {/* Action buttons */}
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
              {isSubmitting ? 'Saving Room Details...' : 'Save Room Specifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
