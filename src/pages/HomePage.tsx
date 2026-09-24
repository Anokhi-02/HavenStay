import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Wifi,
  Utensils,
  Zap,
  Award,
  ChevronRight,
  Compass,
  ArrowRight,
  Heart,
  Star,
  Clock,
  Building,
} from 'lucide-react';
import { PG, GenderType, RoomType } from '../types';
import { api } from '../services/api';
import { SearchBar } from '../components/SearchBar';
import { PGCard } from '../components/PGCard';
import { PGSkeletonCard } from '../components/Loader';
import { NavigationPage } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectPG: (pgId: string) => void;
  onBookNow: (pgId: string) => void;
  onApplySearchFilters: (filters: any) => void;
}

const CITY_PILLS = [
  { name: 'All Cities', image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=200&q=80' },
  { name: 'Bengaluru', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=200&q=80' },
  { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=200&q=80' },
  { name: 'Delhi NCR', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=200&q=80' },
  { name: 'Pune', image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=200&q=80' },
  { name: 'Hyderabad', image: 'https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?auto=format&fit=crop&w=200&q=80' },
];

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectPG,
  onBookNow,
  onApplySearchFilters,
}) => {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | GenderType | 'budget'>('all');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api.pgs.getAll().then((data) => {
      if (isMounted) {
        setPgs(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (filters: {
    city: string;
    searchQuery: string;
    roomType: 'all' | RoomType;
    gender: 'all' | GenderType;
    maxPrice?: number;
  }) => {
    onApplySearchFilters(filters);
    onNavigate('explore');
  };

  const handleCityPillClick = (cityName: string) => {
    setSelectedCity(cityName);
    onApplySearchFilters({
      city: cityName === 'All Cities' ? '' : cityName,
    });
    onNavigate('explore');
  };

  // Filter featured cards by tab
  const filteredPGs = pgs.filter((pg) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'budget') return pg.startingPrice <= 12000;
    return pg.gender === activeTab || pg.gender === 'unisex';
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-rose-50/50 via-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-6">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              India's Premier Co-Living & PG Network
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 tracking-tight leading-none max-w-4xl mx-auto"
          >
            Find your next haven with{' '}
            <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              zero brokerage.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium"
          >
            Fully serviced private rooms and co-living spaces for students and professionals. High-speed Wi-Fi, 3-times fresh food, daily housekeeping, and vibrant tech communities.
          </motion.p>

          {/* Airbnb style Pill Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4"
          >
            <SearchBar onSearch={handleSearch} />
          </motion.div>

          {/* City Explorer Pills */}
          <div className="pt-6 flex items-center justify-center gap-3 overflow-x-auto no-scrollbar py-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              Top Cities:
            </span>
            {CITY_PILLS.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityPillClick(city.name)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-rose-400 text-slate-700 text-xs font-semibold shrink-0 shadow-xs transition-all hover:scale-105"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Zero Brokerage
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Connect directly with property managers. No commission cuts or hidden agency charges.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                100% Verified Properties
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Every single room, washroom, and kitchen is physically verified and photographed.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Gigabit High-Speed Wi-Fi
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Dual redundant broadband lines with 300+ Mbps for uninterrupted Zoom and gaming.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Chef-Curated Meals
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fresh breakfast, lunch, and dinner cooked in hygienic commercial kitchens daily.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured PGs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                Top Rated Accommodations
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
              Featured Co-Living Stays
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Handpicked PGs located near top tech parks, universities, and metro stations.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar border border-slate-200/50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Stays
            </button>
            <button
              onClick={() => setActiveTab('girls')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'girls'
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-600 hover:text-pink-600'
              }`}
            >
              Girls PGs
            </button>
            <button
              onClick={() => setActiveTab('boys')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'boys'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Boys PGs
            </button>
            <button
              onClick={() => setActiveTab('unisex')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'unisex'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Co-Living / Unisex
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'budget'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Under ₹12k
            </button>
          </div>
        </div>

        {/* PG Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <PGSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPGs.map((pg) => (
              <PGCard
                key={pg.id}
                pg={pg}
                onSelect={onSelectPG}
                onBookNow={onBookNow}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center pt-10">
          <button
            onClick={() => onNavigate('explore')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            <span>Explore All 10,000+ Verified Stays</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Banner Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              Instant Check-in Available
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Moving to a new city for college or your new job?
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Skip greedy brokers, hefty 6-month deposits, and sketchy landlords. Lock in your verified room with a 100% refundable token.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('explore')}
                className="px-6 py-3 rounded-xl bg-white text-rose-600 font-bold text-sm shadow-lg hover:bg-neutral-50 transition-colors"
              >
                Browse Available PGs
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-6 py-3 rounded-xl bg-rose-700/60 hover:bg-rose-700 text-white font-bold text-sm border border-white/20 transition-colors"
              >
                Join as Resident
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
