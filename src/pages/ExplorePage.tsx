import React, { useState, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Search,
  RotateCcw,
  MapPin,
  IndianRupee,
  Check,
} from 'lucide-react';
import { PG, FilterOptions, GenderType, RoomType } from '../types';
import { api } from '../services/api';
import { PGCard } from '../components/PGCard';
import { PGSkeletonCard } from '../components/Loader';
import { Pagination } from '../components/Pagination';
import { formatCurrency } from '../lib/utils';

interface ExplorePageProps {
  onSelectPG: (pgId: string) => void;
  onBookNow: (pgId: string) => void;
  initialFilters?: Partial<FilterOptions>;
}

const ALL_AMENITIES = [
  'High-Speed Wi-Fi',
  '3-Times Homely Meals',
  'Air Conditioning',
  'Daily Housekeeping',
  'Washing Machine',
  'Power Backup',
  'Biometric & CCTV',
  'Gym',
];

const ITEMS_PER_PAGE = 8;

export const ExplorePage: React.FC<ExplorePageProps> = ({
  onSelectPG,
  onBookNow,
  initialFilters,
}) => {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters State
  const [city, setCity] = useState(initialFilters?.city || '');
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [gender, setGender] = useState<'all' | GenderType>(initialFilters?.gender || 'all');
  const [roomType, setRoomType] = useState<'all' | RoomType>(initialFilters?.roomType || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice || 30000);
  const [foodIncluded, setFoodIncluded] = useState<boolean>(initialFilters?.foodIncluded || false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters?.amenities || []);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating'>(
    initialFilters?.sortBy || 'recommended'
  );

  const fetchPGs = async () => {
    setIsLoading(true);
    try {
      const data = await api.pgs.getAll({
        city,
        searchQuery,
        gender,
        roomType,
        maxPrice,
        foodIncluded,
        amenities: selectedAmenities,
        sortBy,
      });
      setPgs(data);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPGs();
  }, [city, searchQuery, gender, roomType, maxPrice, foodIncluded, selectedAmenities, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setCity('');
    setSearchQuery('');
    setGender('all');
    setRoomType('all');
    setMaxPrice(30000);
    setFoodIncluded(false);
    setSelectedAmenities([]);
    setSortBy('recommended');
  };

  // Pagination slicing
  const totalPages = Math.ceil(pgs.length / ITEMS_PER_PAGE);
  const paginatedPGs = pgs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area, college, or PG name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-rose-500" />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="recommended">Featured / Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar (Desktop) */}
        <aside
          className={`${
            isMobileFilterOpen ? 'block' : 'hidden'
          } lg:block lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6 sticky top-24`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-800">
                Filter Stays
              </h3>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              City
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">All Popular Cities</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune">Pune</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Gender / Tenant Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Gender / Residence Type
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'girls', label: 'Girls Only' },
                { id: 'boys', label: 'Boys Only' },
                { id: 'unisex', label: 'Co-Living' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGender(g.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    gender === g.id
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Room Sharing Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">Any Room Sharing</option>
              <option value="single">Private Single Room</option>
              <option value="double">Double / Twin Sharing</option>
              <option value="triple">Triple Sharing</option>
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Max Monthly Rent
              </label>
              <span className="text-xs font-black text-rose-600">
                {formatCurrency(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min={7000}
              max={30000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹7,000</span>
              <span>₹30,000+</span>
            </div>
          </div>

          {/* Food Included Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700">
                3-Times Meals Included
              </span>
              <input
                type="checkbox"
                checked={foodIncluded}
                onChange={(e) => setFoodIncluded(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 border-slate-300"
              />
            </label>
          </div>

          {/* Key Amenities */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Must-Have Amenities
            </label>
            <div className="space-y-2">
              {ALL_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-3.5 h-3.5 rounded text-rose-500 focus:ring-rose-500 border-slate-300"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right PG Grid */}
        <div className="lg:col-span-9 space-y-6">
          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2">
            <span>
              Showing <b className="text-slate-800">{pgs.length}</b> verified co-living properties
              {city && ` in ${city}`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <PGSkeletonCard key={i} />
              ))}
            </div>
          ) : paginatedPGs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
              <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                No matching PGs found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your budget range, changing the selected city, or resetting the filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPGs.map((pg) => (
                <PGCard
                  key={pg.id}
                  pg={pg}
                  onSelect={onSelectPG}
                  onBookNow={onBookNow}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
