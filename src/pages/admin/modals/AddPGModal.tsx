import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { PG, GenderType } from '../../../types';

interface AddPGModalProps {
  isOpen: boolean;
  editingPG: PG | null;
  onClose: () => void;
  onSubmit: (pgData: any) => void;
}

export const AddPGModal: React.FC<AddPGModalProps> = ({
  isOpen,
  editingPG,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(editingPG ? editingPG.name : 'Haven Stay Koramangala');
  const [gender, setGender] = useState<GenderType>(editingPG ? editingPG.gender : 'unisex');
  const [city, setCity] = useState(editingPG ? (editingPG.location?.city || 'Bengaluru') : 'Bengaluru');
  const [area, setArea] = useState(editingPG ? (editingPG.location?.area || 'Koramangala 4th Block') : 'Koramangala 4th Block');
  const [address, setAddress] = useState(editingPG ? (editingPG.location?.address || '80 Feet Road, Koramangala 4th Block') : '80 Feet Road, Koramangala 4th Block');
  const [price, setPrice] = useState(editingPG ? editingPG.startingPrice : 13500);
  const [totalBeds, setTotalBeds] = useState(editingPG ? editingPG.totalBeds : 30);
  const [description, setDescription] = useState(editingPG ? editingPG.description : 'Premium executive coliving residency with high-speed fiber, chef-prepared meals, and biometric security.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      gender,
      location: {
        address,
        area,
        city,
        state: 'Karnataka',
        pincode: '560034',
        coordinates: { lat: 12.9352, lng: 77.6245 },
      },
      startingPrice: Number(price),
      totalBeds: Number(totalBeds),
      availableBeds: Number(totalBeds) - 4,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingPG ? 'Edit Property Wing' : 'Add Property Wing / Residency'}
              </h3>
              <p className="text-[11px] text-slate-500">Inventory configuration</p>
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
          <div>
            <label className="block text-slate-700 font-bold mb-1">Property Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Residency Type *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              >
                <option value="unisex">Unisex / Coed</option>
                <option value="female">Women Only</option>
                <option value="male">Men Only</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Total Bed Capacity *</label>
              <input
                type="number"
                required
                value={totalBeds}
                onChange={(e) => setTotalBeds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Area / Neighborhood *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Physical Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Starting Monthly Rent (₹)</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none resize-none"
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
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
