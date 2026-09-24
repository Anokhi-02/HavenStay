import React, { useState, useEffect } from 'react';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Check,
  ChevronRight,
  Shield,
  Utensils,
  Wifi,
  Wind,
  Sparkles,
  Users,
  Clock,
  Coffee,
  Tv,
  Zap,
  Lock,
  ArrowRight,
  Activity,
  ThumbsUp,
  Award,
} from 'lucide-react';
import { PG, Review, RoomType } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ReviewCard } from '../components/ReviewCard';
import { Modal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { BookingModal } from '../components/BookingModal';
import { NavigationPage } from '../components/Navbar';
import roommatesSharingRoomImg from '../assets/images/roommates_working_friendly_1789888845950.jpg';

interface SinglePGPageProps {
  onNavigate: (page: NavigationPage) => void;
  onBookNow: (pgId: string) => void;
}

export const SinglePGPage: React.FC<SinglePGPageProps> = ({
  onNavigate,
  onBookNow,
}) => {
  const { user, isAuthenticated, isFavorite, toggleFavorite } = useAuth();
  const { showToast } = useToast();

  const [pg, setPg] = useState<PG | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('single');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Visit Booking Form state
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitRoomType, setVisitRoomType] = useState('single');
  const [isVisitBooked, setIsVisitBooked] = useState(false);

  // Review Form Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewCleanliness, setReviewCleanliness] = useState(5);
  const [reviewFood, setReviewFood] = useState(5);
  const [reviewWifi, setReviewWifi] = useState(5);
  const [reviewLocation, setReviewLocation] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadPropertyData = async () => {
    setIsLoading(true);
    try {
      const allPGs = await api.pgs.getAll();
      const targetPG = allPGs[0] || (await api.pgs.getById('pg_1'));
      if (targetPG) {
        setPg(targetPG);
        if (targetPG.roomOptions.length > 0) {
          setSelectedRoomType(targetPG.roomOptions[0].type);
        }
        try {
          const reviewList = await api.reviews.getAll(targetPG.id);
          setReviews(reviewList);
        } catch (revErr) {
          console.warn('Reviews load fallback:', revErr);
          const localRev = JSON.parse(localStorage.getItem('havenstay_reviews_v2') || '[]');
          setReviews(localRev.filter((r: any) => r.pgId === targetPG.id));
        }
      }
    } catch (err) {
      console.error('Failed to load property data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyData();
  }, []);

  const favorite = pg ? isFavorite(pg.id) : false;

  const handleFavoriteClick = async () => {
    if (!pg) return;
    await toggleFavorite(pg.id);
    if (!favorite) {
      showToast('success', 'Saved', 'Added to your saved list.');
    } else {
      showToast('info', 'Removed', 'Removed from your saved list.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pg?.name || 'Haven Stay',
          text: 'Check out Haven Stay - clean rooms with home food and fast Wi-Fi in Koramangala!',
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Link Copied', 'Page link copied to clipboard.');
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitName.trim() || !visitPhone.trim() || !visitDate) {
      showToast('error', 'Missing Details', 'Please fill in your name, phone number, and visit date.');
      return;
    }
    try {
      await api.visits.create({
        pgId: pg?.id || 'pg_1',
        name: visitName.trim(),
        phone: visitPhone.trim(),
        date: visitDate,
        roomType: visitRoomType,
        userId: user?.id,
      });
      setIsVisitBooked(true);
      showToast(
        'success',
        'Visit Scheduled!',
        `We look forward to seeing you on ${visitDate}. Our warden will call you to confirm.`
      );
    } catch (err: any) {
      showToast('error', 'Could not schedule visit', err?.message || 'Please try again.');
    }
  };

  const handleOpenReviewModal = (rev?: Review) => {
    if (!isAuthenticated) {
      showToast('info', 'Sign in Required', 'Please sign in to write a review.');
      onNavigate('login');
      return;
    }
    if (rev) {
      setEditingReview(rev);
      setReviewRating(rev.rating);
      setReviewCleanliness(rev.categories.cleanliness);
      setReviewFood(rev.categories.food);
      setReviewWifi(rev.categories.wifi);
      setReviewLocation(rev.categories.location);
      setReviewComment(rev.comment);
    } else {
      setEditingReview(null);
      setReviewRating(5);
      setReviewCleanliness(5);
      setReviewFood(5);
      setReviewWifi(5);
      setReviewLocation(5);
      setReviewComment('');
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pg || !user) return;

    if (!reviewComment.trim()) {
      showToast('error', 'Comment Required', 'Please write a few words about your stay.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (editingReview) {
        await api.reviews.update(editingReview.id, {
          rating: reviewRating,
          categories: {
            cleanliness: reviewCleanliness,
            food: reviewFood,
            wifi: reviewWifi,
            location: reviewLocation,
            value: Number(((reviewCleanliness + reviewFood + reviewWifi + reviewLocation) / 4).toFixed(1)),
          },
          comment: reviewComment,
        });
        showToast('success', 'Review Updated', 'Your review has been updated.');
      } else {
        await api.reviews.create({
          pgId: pg.id,
          userId: user.id,
          userName: user.fullName,
          userAvatar: user.avatar,
          rating: reviewRating,
          categories: {
            cleanliness: reviewCleanliness,
            food: reviewFood,
            wifi: reviewWifi,
            location: reviewLocation,
            value: Number(((reviewCleanliness + reviewFood + reviewWifi + reviewLocation) / 4).toFixed(1)),
          },
          comment: reviewComment,
          verifiedStay: true,
        });
        showToast('success', 'Thank You!', 'Your review is now live.');
      }
      setIsReviewModalOpen(false);
      const reviewList = await api.reviews.getAll(pg.id);
      setReviews(reviewList);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <Loader size="lg" message="Loading Haven Stay..." />
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-slate-600">Could not load details right now.</p>
        <button
          onClick={() => loadPropertyData()}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* HERO SECTION - Styled directly after user screenshot */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pill badge matching screenshot */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide">
                <span>Welcome to Haven Stay</span>
              </div>

              {/* Headline matching screenshot */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Your Comfort Is Our{' '}
                <span className="text-blue-600 block sm:inline">Top Priority</span>
              </h1>

              {/* Simple description without difficult words */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Clean rooms, tasty home-cooked food, high-speed Wi-Fi, and a safe place to stay in Koramangala. Perfect for students and working professionals. No broker fees.
              </p>

              {/* Action Buttons matching screenshot */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => onBookNow(pg.id)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book a Room</span>
                </button>

                <a
                  href="#our-story"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-xs transition-all"
                >
                  <span>Our Story</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">₹0</p>
                  <p className="text-xs text-slate-500 font-medium">Broker Fees</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">3 Meals</p>
                  <p className="text-xs text-slate-500 font-medium">Fresh Daily Food</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-900">4.9 ★</p>
                  <p className="text-xs text-slate-500 font-medium">180+ Residents</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card - Matching Screenshot */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image Frame */}
                <div
                  onClick={() => setIsGalleryOpen(true)}
                  className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 cursor-pointer group"
                >
                  <img
                    src={pg.images[0]}
                    alt="Haven Stay Bedroom"
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  
                  {/* Bottom Image Tag */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Clean & Bright</p>
                      <p className="text-sm font-bold">Furnished Room with Attached Balcony</p>
                    </div>
                    <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-medium">
                      View Photos ({pg.images.length})
                    </span>
                  </div>
                </div>

                {/* Floating Highlight Card: Happy Residents (like screenshot) */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Happy Residents
                    </p>
                    <p className="text-lg font-black text-slate-900">99.9%</p>
                  </div>
                </div>

                {/* Floating Highlight Card: Fresh Food */}
                <div className="hidden sm:flex absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">3 Fresh Meals</p>
                    <p className="text-[10px] text-slate-400">Included Every Day</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 1: INTRO (Why Stay With Us) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              Why Stay With Us
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Everything You Need For A Peaceful Stay
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              We take care of your food, cleaning, and internet so you can focus on your studies and work.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Fresh Daily Meals</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hot breakfast, lunch, and dinner cooked fresh every day. Tasty North and South Indian food with clean drinking water.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Super Fast Wi-Fi</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                300 Mbps fiber internet on every floor. Join work calls, watch videos, and study without any buffering.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Daily Room Cleaning</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our friendly cleaning staff cleans your room, washes the bathroom, and empties trash bins every single morning.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Safe & Secure 24/7</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A caring warden lives on-site to help you anytime. CCTV cameras and digital lock access keep you safe always.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR STORY (Explicitly Requested) */}
      <section id="our-story" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Story Visual Left */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-200">
                <img
                  src={roommatesSharingRoomImg}
                  alt="Friendly professionals sharing a room and working together in Haven Stay PG"
                  className="w-full h-80 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide">Our Haven Community</p>
                  <p className="text-sm font-bold">Good food, friendly roommates, and peaceful living</p>
                </div>
              </div>

              {/* Founder quote box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
                <img
                  src={pg.owner.avatar}
                  alt="Nishi Rajput"
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Nishi Rajput</p>
                  <p className="text-[11px] text-blue-600 font-medium">Founder & Property Manager</p>
                  <p className="text-xs text-slate-600 italic mt-1.5">
                    "I built Haven Stay to be the home I wished I had when I first came to Bengaluru."
                  </p>
                </div>
              </div>
            </div>

            {/* Story Text Right */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  How Haven Stay Started
                </h2>
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>
                  When our founder Nishi first moved to Bengaluru for her first job, finding a good place to stay was very stressful.
                </p>
                <p>
                  Brokers asked for huge fees, rooms were dark and dirty, and getting a warm, home-cooked meal was almost impossible. It felt lonely and difficult.
                </p>
                <p>
                  She started <strong>Haven Stay</strong> with one simple goal: to give every student and young working professional a clean, safe, and warm home they can truly call their own.
                </p>
                <p>
                  We are not an impersonal building. We are a caring home. Our warden knows each resident by name, our cooks prepare warm rotis and fresh dal with care, and our rooms are cleaned every day.
                </p>
              </div>

              {/* 3 Core Promises */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Honest Pricing</h4>
                  <p className="text-[11px] text-slate-500 mt-1">No broker fees. No surprise charges on your bill.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Like Family</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Caring warden and staff always ready to help you.</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Quiet & Peaceful</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Calm study spaces and good sleep every night.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: ROOMS & SIMPLE RENT */}
      <section id="rooms" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              Rooms & Prices
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Choose The Room That Fits You Best
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              All rooms include 3 daily meals, high-speed Wi-Fi, room cleaning, and electricity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pg.roomOptions.map((room) => {
              const isSelected = selectedRoomType === room.type;
              return (
                <div
                  key={room.type}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white ${
                    isSelected
                      ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Top image for room */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={
                        room.type === 'single'
                          ? pg.images[0]
                          : room.type === 'double'
                          ? pg.images[1]
                          : pg.images[2]
                      }
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {room.type === 'single'
                          ? '1 Bed (Private)'
                          : room.type === 'double'
                          ? '2 Beds (Twin Sharing)'
                          : '3 Beds (Triple Sharing)'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
                        {room.availableBeds} beds open
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {room.type === 'single'
                            ? 'Complete privacy with attached balcony and desk'
                            : room.type === 'double'
                            ? 'Spacious sharing with one friendly roommate'
                            : 'Budget friendly with personal lockable cupboard'}
                        </p>
                      </div>

                      {/* Price display */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">
                            {formatCurrency(room.price)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium"> / month</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Food Included
                        </span>
                      </div>

                      {/* Room features */}
                      <ul className="space-y-2 text-xs text-slate-600 pt-2">
                        {room.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>3 Fresh Daily Meals Included</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Daily Cleaning & Laundry Access</span>
                        </li>
                      </ul>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => {
                        setSelectedRoomType(room.type);
                        onBookNow(pg.id);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book {room.name}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: FACILITIES & COMFORTS */}
      <section id="facilities" className="py-16 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              Facilities
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Comfortable Facilities For Daily Living
            </h2>
            <p className="text-slate-600 text-sm">
              We make sure you never have to worry about power cuts, laundry, or drinking water.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Utensils, label: '3 Daily Meals', sub: 'North & South Indian' },
              { icon: Wifi, label: '300 Mbps Wi-Fi', sub: 'Work from home' },
              { icon: Zap, label: 'Power Backup', sub: '24/7 electricity' },
              { icon: Sparkles, label: 'Daily Cleaning', sub: 'Rooms & washrooms' },
              { icon: Lock, label: 'Safe Building', sub: 'CCTV & warden on site' },
              { icon: Coffee, label: 'Rooftop Terrace', sub: 'Open air & tea space' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-2 flex flex-col items-center justify-center"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">{item.label}</p>
                <p className="text-[10px] text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: REVIEWS (What Our Residents Say) */}
      <section id="reviews" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                Resident Reviews
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
                What People Say About Living Here
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-slate-900 ml-1">4.9</span>
                </div>
                <span>•</span>
                <span>Based on real resident reviews</span>
              </div>
            </div>

            <button
              onClick={() => handleOpenReviewModal()}
              className="px-5 py-2.5 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={rev.userName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.userName}</p>
                      <p className="text-[10px] text-slate-500">Verified Resident</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-800">{rev.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Stayed in Koramangala</span>
                  <span>{formatDate(rev.createdAt || new Date().toISOString())}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: SCHEDULE A FREE VISIT FORM */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-900/60 rounded-full border border-blue-700">
                Come See For Yourself
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Book A Free Visit Today
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Want to check the room, meet the warden, and taste the food before deciding? Come by anytime! Visits are 100% free with no obligation.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Plot 48, 80 Feet Road, 4th Block, Koramangala, Bengaluru</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Call Warden: +91 98765 43210 (9:00 AM - 8:00 PM)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Visiting Hours: 7 Days a week, 9:00 AM to 8:30 PM</span>
                </div>
              </div>
            </div>

            {/* Visit Form Card */}
            <div className="lg:col-span-6">
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl">
                {isVisitBooked ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Visit Scheduled!</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Thank you, {visitName}! We have saved your visit for {visitDate}. Our warden will call you to confirm directions.
                    </p>
                    <button
                      onClick={() => setIsVisitBooked(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                    >
                      Schedule Another Visit
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVisitSubmit} className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Schedule a Free Property Visit</h3>
                    <p className="text-xs text-slate-500">Pick a date and our staff will keep the rooms ready for you to view.</p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={visitName}
                        onChange={(e) => setVisitName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={visitPhone}
                          onChange={(e) => setVisitPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
                        <input
                          type="date"
                          required
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Room You Want To See</label>
                      <select
                        value={visitRoomType}
                        onChange={(e) => setVisitRoomType(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="single">Single Private Room (₹16,500/mo)</option>
                        <option value="double">Double Sharing Room (₹11,500/mo)</option>
                        <option value="triple">Triple Sharing Room (₹9,500/mo)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      Confirm Free Visit
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FULL PHOTO GALLERY MODAL */}
      <Modal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title="Haven Stay Photos"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Real photos of our rooms, study lounges, dining space, and rooftop terrace.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
            {pg.images.map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={img} alt={`Haven Stay view ${i + 1}`} className="w-full h-56 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* WRITE REVIEW MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={editingReview ? 'Edit Your Review' : 'Write a Review'}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setReviewRating(s)}
                  className="p-1 text-slate-300 hover:text-amber-400"
                >
                  <Star
                    className={`w-6 h-6 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating} out of 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Review</label>
            <textarea
              rows={4}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell others about the food, cleanliness, staff, and your overall stay..."
              className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isSubmittingReview ? 'Saving...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
