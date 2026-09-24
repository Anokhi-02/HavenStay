import React from 'react';
import {
  Building2,
  Bed,
  Plus,
  Edit2,
  Trash2,
  IndianRupee,
  Camera,
  Phone,
  CheckCircle2,
  Layers,
  Sparkles,
  MapPin,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { PG, Tenant } from '../../../types';
import { formatCurrency } from '../../../lib/utils';

interface InventoryTabProps {
  pgs: PG[];
  tenants: Tenant[];
  onOpenAddPG: () => void;
  onOpenAddTenant: () => void;
  onEditPG: (pg: PG) => void;
  onDeletePG: (id: string) => void;
  onOpenUpdateRooms?: (pg: PG) => void;
  onOpenUpdatePrices?: (pg: PG) => void;
  onOpenManagePhotos?: (pg: PG) => void;
  onOpenUpdateContact?: (pg: PG) => void;
  onOpenBulkImport?: (pg?: PG) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  pgs,
  tenants,
  onOpenAddPG,
  onOpenAddTenant,
  onEditPG,
  onDeletePG,
  onOpenUpdateRooms,
  onOpenUpdatePrices,
  onOpenManagePhotos,
  onOpenUpdateContact,
  onOpenBulkImport,
}) => {
  const sampleRooms = [
    { roomNumber: 'Room 101', floor: '1st Floor', type: 'single', price: 13500, beds: [{ bed: 'Bed A', occupiedBy: null }] },
    { roomNumber: 'Room 102', floor: '1st Floor', type: 'double', price: 9500, beds: [{ bed: 'Bed A', occupiedBy: null }, { bed: 'Bed B', occupiedBy: 'Ananya Sen' }] },
    { roomNumber: 'Room 201', floor: '2nd Floor', type: 'single', price: 13500, beds: [{ bed: 'Bed A', occupiedBy: 'Priya Nair' }] },
    { roomNumber: 'Room 204', floor: '2nd Floor', type: 'single', price: 13500, beds: [{ bed: 'Bed A', occupiedBy: 'Rahul Sharma' }] },
    { roomNumber: 'Room 301', floor: '3rd Floor', type: 'triple', price: 7500, beds: [{ bed: 'Bed A', occupiedBy: null }, { bed: 'Bed B', occupiedBy: null }, { bed: 'Bed C', occupiedBy: null }] },
    { roomNumber: 'Room 305', floor: '3rd Floor', type: 'double', price: 9500, beds: [{ bed: 'Bed A', occupiedBy: 'Karthik Verma' }, { bed: 'Bed B', occupiedBy: null }] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Property Inventory & Room Management
          </h2>
          <p className="text-xs text-slate-500">
            Configure room sharing tiers, update tariffs, upload property photos, and manage contact numbers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onOpenBulkImport?.(pgs[0])}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            title="Upload CSV to batch configure room details and pricing"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={onOpenAddPG}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property Wing</span>
          </button>
        </div>
      </div>

      {/* Property Wings List with Owner Management Actions */}
      <div className="space-y-5">
        {pgs.map((pg) => (
          <div
            key={pg.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5 text-slate-900"
          >
            {/* Top Property Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{pg.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ACTIVE PROPERTY
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {pg.gender} PG
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {pg.location?.address || pg.location?.area || 'Koramangala'} • {pg.location?.city || 'Bengaluru'} ({pg.location?.pincode || '560034'})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Starting from <strong className="text-slate-900 font-mono">₹{pg.startingPrice?.toLocaleString('en-IN')}/mo</strong> • {pg.totalBeds || 30} Total Beds ({pg.availableBeds ?? 2} Vacant)
                  </p>
                </div>
              </div>

              {/* General Edit & Delete */}
              <div className="flex items-center gap-2 self-start lg:self-auto">
                <button
                  onClick={() => onEditPG(pg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>General Info</span>
                </button>
                {pgs.length > 1 && (
                  <button
                    onClick={() => onDeletePG(pg.id)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Delete property"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 4 Dedicated PG Owner Action Toolbars */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                PG Owner Controls for {pg.name}:
              </span>

              <div className="flex flex-wrap gap-2">
                {/* 1. Update Room Details */}
                <button
                  onClick={() => onOpenUpdateRooms?.(pg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Bed className="w-3.5 h-3.5 text-blue-600" />
                  <span>Update Room Details & Beds</span>
                </button>

                {/* Bulk CSV Import */}
                <button
                  onClick={() => onOpenBulkImport?.(pg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Bulk upload room tiers and pricing from spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
                  <span>Bulk CSV Import</span>
                </button>

                {/* 2. Update Prices */}
                <button
                  onClick={() => onOpenUpdatePrices?.(pg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Update Prices & Tariffs</span>
                </button>

                {/* 3. Manage Photos */}
                <button
                  onClick={() => onOpenManagePhotos?.(pg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-rose-600" />
                  <span>Manage Photos ({pg.images?.length || 0})</span>
                </button>

                {/* 4. Change Contact Details */}
                <button
                  onClick={() => onOpenUpdateContact?.(pg)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Owner Contact Details</span>
                </button>
              </div>
            </div>

            {/* Room Options & Tiers Grid Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Configured Room Categories & Tariffs
                </span>
                <button
                  onClick={() => onOpenUpdateRooms?.(pg)}
                  className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  + Add / Edit Categories
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {(pg.roomOptions || []).map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        ₹{opt.price?.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{opt.totalBeds} total beds</span>
                      <span className="text-emerald-700 font-semibold">{opt.availableBeds} vacant</span>
                    </div>
                    {opt.features && opt.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {opt.features.slice(0, 3).map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200"
                          >
                            {feat}
                          </span>
                        ))}
                        {opt.features.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{opt.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery Thumbnails Strip */}
            {pg.images && pg.images.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-rose-500" />
                    Property Photo Gallery ({pg.images.length})
                  </span>
                  <button
                    onClick={() => onOpenManagePhotos?.(pg)}
                    className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    Upload / Rearrange Photos →
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {pg.images.map((img, i) => (
                    <div
                      key={i}
                      className="w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative group"
                    >
                      <img
                        src={img}
                        alt="Property thumbnail"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[8px] font-bold text-center py-0.5">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Owner & Caretaker Summary Card */}
            {pg.owner && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-500">License Owner:</span>
                  <strong className="text-slate-900">{pg.owner.name}</strong>
                  <span className="text-slate-500 font-mono">({pg.owner.phone})</span>
                </div>
                {pg.owner.caretakerName && (
                  <div className="text-slate-500 text-[11px]">
                    Caretaker: <strong className="text-slate-800">{pg.owner.caretakerName}</strong> ({pg.owner.caretakerPhone})
                  </div>
                )}
                <button
                  onClick={() => onOpenUpdateContact?.(pg)}
                  className="text-[11px] text-blue-600 hover:underline cursor-pointer font-semibold"
                >
                  Edit Contacts →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Room & Bed Allocation Matrix */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Floor Plan & Bed Allocation
          </h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Occupied
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Vacant
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleRooms.map((rm) => (
            <div
              key={rm.roomNumber}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{rm.roomNumber}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{rm.floor}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 font-mono block">
                    {formatCurrency(rm.price)}/mo
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {rm.type}
                  </span>
                </div>
              </div>

              {/* Beds in this room */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {rm.beds.map((b) => (
                  <div
                    key={b.bed}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      b.occupiedBy
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-slate-500" />
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{b.bed}</span>
                        {b.occupiedBy ? (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Occupied by {b.occupiedBy}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Available / Ready</span>
                        )}
                      </div>
                    </div>

                    {!b.occupiedBy && (
                      <button
                        onClick={onOpenAddTenant}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] shadow-2xs cursor-pointer transition-colors"
                      >
                        + Assign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
