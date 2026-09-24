import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Star,
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Utensils,
  Wifi,
  Wind,
  Sparkles,
} from 'lucide-react';
import { PG } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PGCardProps {
  pg: PG;
  onSelect: (pgId: string) => void;
  onBookNow?: (pgId: string) => void;
}

export const PGCard: React.FC<PGCardProps> = ({ pg, onSelect, onBookNow }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, toggleFavorite, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const favorite = isFavorite(pg.id);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? pg.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === pg.images.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(pg.id);
    if (!favorite) {
      showToast('success', 'Saved to Favorites', `${pg.name} is now saved.`);
    } else {
      showToast('info', 'Removed from Favorites', `${pg.name} removed from saved list.`);
    }
  };

  const genderBadge = {
    girls: { label: 'Girls Only', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    boys: { label: 'Boys Only', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    unisex: { label: 'Co-Living / Unisex', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  }[pg.gender];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(pg.id)}
      className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={pg.images[currentImageIndex] || pg.images[0]}
          alt={pg.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-xs ${genderBadge.bg}`}
          >
            {genderBadge.label}
          </span>
          {pg.verified && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-600 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-white transition-all shadow-md active:scale-90"
          aria-label={favorite ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorite ? 'fill-rose-500 text-rose-500' : 'text-slate-700'
            }`}
          />
        </button>

        {/* Carousel Prev/Next Buttons (appear on hover) */}
        {pg.images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-md"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {pg.images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10">
            {pg.images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-white w-3' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
              {pg.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-slate-800">
                {pg.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400">
                ({pg.reviewCount})
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {pg.location.area}, {pg.location.city}
            </span>
          </div>

          {/* Facilities / Amenities Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {pg.foodProvided && (
              <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Utensils className="w-3 h-3 text-rose-500" />
                Food Inc.
              </span>
            )}
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Wifi className="w-3 h-3 text-sky-600" />
              Wi-Fi
            </span>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Wind className="w-3 h-3 text-teal-600" />
              AC
            </span>
            {pg.roomOptions.length > 0 && (
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {pg.roomOptions[0].availableBeds} beds left
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Actions footer */}
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Starts from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900">
                {formatCurrency(pg.startingPrice)}
              </span>
              <span className="text-xs text-slate-500">/ mo</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pg.id);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-800 transition-colors"
            >
              Details
            </button>
            {onBookNow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow(pg.id);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-xs transition-colors"
              >
                Book
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
