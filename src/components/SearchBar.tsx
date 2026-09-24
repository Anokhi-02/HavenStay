import React, { useState } from 'react';
import { Search, MapPin, BedDouble, Users, IndianRupee, Sparkles } from 'lucide-react';
import { RoomType, GenderType } from '../types';

interface SearchBarProps {
  initialCity?: string;
  initialRoomType?: string;
  initialGender?: string;
  initialMaxPrice?: number;
  onSearch: (filters: {
    city: string;
    searchQuery: string;
    roomType: 'all' | RoomType;
    gender: 'all' | GenderType;
    maxPrice?: number;
  }) => void;
  compact?: boolean;
}

const CITIES = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad'];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialCity = 'All Cities',
  initialRoomType = 'all',
  initialGender = 'all',
  initialMaxPrice,
  onSearch,
  compact = false,
}) => {
  const [city, setCity] = useState(initialCity === 'All Cities' ? '' : initialCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [roomType, setRoomType] = useState<'all' | RoomType>(
    (initialRoomType as 'all' | RoomType) || 'all'
  );
  const [gender, setGender] = useState<'all' | GenderType>(
    (initialGender as 'all' | GenderType) || 'all'
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialMaxPrice ? String(initialMaxPrice) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      city: city === 'All Cities' ? '' : city,
      searchQuery,
      roomType,
      gender,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-full shadow-md max-w-2xl w-full"
      >
        <div className="flex-1 flex items-center pl-4 gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area, college, or PG name..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="text-xs font-medium px-3 py-2 bg-slate-100 text-slate-700 rounded-full border-none focus:ring-0 cursor-pointer"
        >
          {CITIES.map((c) => (
            <option key={c} value={c === 'All Cities' ? '' : c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full transition-colors flex items-center justify-center shrink-0 shadow-xs"
          aria-label="Search PGs"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl md:rounded-full p-2.5 md:p-2 border border-slate-200 shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-5xl mx-auto divide-y md:divide-y-0 md:divide-x divide-slate-100"
    >
      {/* City / Area */}
      <div className="flex-1 px-4 py-2 hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors group cursor-pointer">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          Location
        </label>
        <div className="flex items-center gap-2 mt-0.5">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c === 'All Cities' ? '' : c}>
                {c === 'All Cities' ? 'All Popular Cities' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Type */}
      <div className="flex-1 px-4 py-2 hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors group cursor-pointer">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <BedDouble className="w-3.5 h-3.5 text-rose-500" />
          Room Type
        </label>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as 'all' | RoomType)}
          className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer mt-0.5"
        >
          <option value="all">Any Room Type</option>
          <option value="single">Private Single Room</option>
          <option value="double">Double / Twin Sharing</option>
          <option value="triple">Triple Sharing</option>
        </select>
      </div>

      {/* Gender / Tenant Type */}
      <div className="flex-1 px-4 py-2 hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors group cursor-pointer">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-rose-500" />
          Occupancy
        </label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as 'all' | GenderType)}
          className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer mt-0.5"
        >
          <option value="all">All (Boys / Girls / Unisex)</option>
          <option value="girls">Girls Only PG</option>
          <option value="boys">Boys Only PG</option>
          <option value="unisex">Unisex / Co-Living</option>
        </select>
      </div>

      {/* Max Budget */}
      <div className="flex-1 px-4 py-2 hover:bg-slate-50 rounded-2xl md:rounded-full transition-colors group cursor-pointer">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <IndianRupee className="w-3.5 h-3.5 text-rose-500" />
          Budget Limit
        </label>
        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer mt-0.5"
        >
          <option value="">Any Budget</option>
          <option value="10000">Under ₹10,000 / mo</option>
          <option value="15000">Under ₹15,000 / mo</option>
          <option value="20000">Under ₹20,000 / mo</option>
          <option value="30000">Under ₹30,000 / mo</option>
        </select>
      </div>

      {/* Search Button */}
      <div className="p-1 shrink-0 flex items-center justify-end">
        <button
          type="submit"
          className="w-full md:w-auto bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold px-6 py-3.5 rounded-xl md:rounded-full shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <Search className="w-4 h-4" />
          <span>Find Stays</span>
        </button>
      </div>
    </form>
  );
};
