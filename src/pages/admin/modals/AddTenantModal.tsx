import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck, Phone, Mail, Building, CreditCard } from 'lucide-react';
import { Tenant, RoomType } from '../../../types';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91 ');
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [bedNumber, setBedNumber] = useState('Bed A');
  const [roomType, setRoomType] = useState<RoomType>('single');
  const [monthlyRent, setMonthlyRent] = useState(13500);
  const [securityDeposit, setSecurityDeposit] = useState(13500);
  const [depositPaid, setDepositPaid] = useState(true);
  const [leaseStartDate, setLeaseStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaseEndDate, setLeaseEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [kycDocType, setKycDocType] = useState('Aadhaar Card (UIDAI Verified)');
  const [employmentType, setEmploymentType] = useState<'working_professional' | 'student'>('working_professional');
  const [companyOrCollege, setCompanyOrCollege] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      email,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      pgId: 'pg_1',
      pgName: 'Haven Stay Koramangala',
      roomNumber,
      bedNumber,
      roomType,
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit),
      depositPaid,
      leaseStartDate,
      leaseEndDate,
      kycStatus: 'verified',
      kycDocType,
      employmentType,
      companyOrCollege,
      pendingDue: 0,
      status: 'active',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 shadow-xl my-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Admit & Register New Resident</h3>
              <p className="text-[11px] text-slate-500">Stores directly to dedicated isolated Firestore collection: /tenants</p>
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
          {/* Section 1: Resident Personal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="resident@example.com"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Employment / Student *</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
              >
                <option value="working_professional">Working Professional</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Company or College / University Name</label>
            <input
              type="text"
              value={companyOrCollege}
              onChange={(e) => setCompanyOrCollege(e.target.value)}
              placeholder="e.g. Infosys / Christ University"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
            />
          </div>

          {/* Section 2: Room & Financial Allocation */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-2">
              ROOM ALLOCATION & LEASE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Room 101"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Bed Number *</label>
                <input
                  type="text"
                  required
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  placeholder="Bed A"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Room Category *</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                >
                  <option value="single">Single Private Studio</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Agreed Monthly Rent (₹) *</label>
                <input
                  type="number"
                  required
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Security Deposit (₹) *</label>
                <input
                  type="number"
                  required
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Lease Start Date</label>
                <input
                  type="date"
                  required
                  value={leaseStartDate}
                  onChange={(e) => setLeaseStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Lease End Date</label>
                <input
                  type="date"
                  required
                  value={leaseEndDate}
                  onChange={(e) => setLeaseEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency & KYC */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-2">
              EMERGENCY & VERIFICATION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  required
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Ramesh Malhotra (Father)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  required
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+91 98111 22334"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-blue-500 text-slate-900 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
              Save Resident into /tenants
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
