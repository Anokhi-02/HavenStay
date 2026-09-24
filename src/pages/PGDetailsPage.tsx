import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  ShieldCheck,
  BedDouble,
  Utensils,
  Wifi,
  Wind,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  X,
  Plus,
  AlertCircle,
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

interface PGDetailsPageProps {
  pgId: string;
  onBack: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export const PGDetailsPage: React.FC<PGDetailsPageProps> = ({
  pgId,
  onBack,
  onNavigate,
}) => {
  const { user, isAuthenticated, isFavorite, toggleFavorite } = useAuth();
  const { showToast } = useToast();

  const [pg, setPg] = useState<PG | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('single');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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

  const favorite = pg ? isFavorite(pg.id) : false;

  const loadPG = async () => {
    setIsLoading(true);
    try {
      const data = await api.pgs.getById(pgId);
      if (data) {
        setPg(data);
        if (data.roomOptions.length > 0) {
          setSelectedRoomType(data.roomOptions[0].type);
        }
      }
      const reviewList = await api.reviews.getAll(pgId);
      setReviews(reviewList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPG();
  }, [pgId]);

  const handleFavoriteClick = async () => {
    if (!pg) return;
    await toggleFavorite(pg.id);
    if (!favorite) {
      showToast('success', 'Added to Saved PGs', `${pg.name} is saved to your wishlist.`);
    } else {
      showToast('info', 'Removed from Saved PGs', `${pg.name} removed from your wishlist.`);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast('success', 'Link Copied', 'Property link copied to clipboard.');
  };

  const openAddReviewModal = () => {
    if (!isAuthenticated) {
      showToast('error', 'Login Required', 'Please log in to write a review.');
      return;
    }
    setEditingReview(null);
    setReviewRating(5);
    setReviewCleanliness(5);
    setReviewFood(5);
    setReviewWifi(5);
    setReviewLocation(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const openEditReviewModal = (review: Review) => {
    setEditingReview(review);
    setReviewRating(review.rating);
    setReviewCleanliness(review.categories.cleanliness);
    setReviewFood(review.categories.food);
    setReviewWifi(review.categories.wifi);
    setReviewLocation(review.categories.location);
    setReviewComment(review.comment);
    setIsReviewModalOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await api.reviews.delete(reviewId);
      showToast('success', 'Review Removed', 'Your review has been deleted.');
      loadPG();
    } catch (err: any) {
      showToast('error', 'Failed to Delete', err.message);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pg || !user) return;

    if (!reviewComment.trim()) {
      showToast('error', 'Comment Required', 'Please share your thoughts in the review.');
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
        showToast('success', 'Review Updated', 'Your changes have been saved.');
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
        showToast('success', 'Review Published!', 'Thank you for helping fellow residents.');
      }
      setIsReviewModalOpen(false);
      loadPG();
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <Loader size="lg" message="Loading property details and room plans..." />
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Property Not Found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl"
        >
          Return to Explore
        </button>
      </div>
    );
  }

  const activeRoom =
    pg.roomOptions.find((r) => r.type === selectedRoomType) || pg.roomOptions[0];

  const genderBadge = {
    girls: { label: 'Girls Only Residence', bg: 'bg-pink-100 text-pink-700 border-pink-200' },
    boys: { label: 'Boys Only Residence', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
    unisex: { label: 'Co-Living / Unisex', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  }[pg.gender];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & quick action row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={handleFavoriteClick}
            className={`px-3.5 py-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              favorite
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`}
            />
            <span>{favorite ? 'Saved' : 'Save to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Property Title & Meta */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${genderBadge.bg}`}>
            {genderBadge.label}
          </span>
          {pg.verified && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500 text-white flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Physically Verified
            </span>
          )}
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            Zero Brokerage
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
          {pg.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 mt-2">
          <div className="flex items-center gap-1 text-slate-800 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{pg.rating.toFixed(2)}</span>
            <span className="text-slate-400 font-normal">({pg.reviewCount} verified reviews)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              {pg.location.address}, {pg.location.area}, {pg.location.city} - {pg.location.pincode}
            </span>
          </div>
        </div>
      </div>

      {/* Airbnb Style Mosaic Image Gallery */}
      <div className="relative rounded-3xl overflow-hidden shadow-xs border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-72 sm:h-96 lg:h-[450px]">
          {/* Main Large Photo */}
          <div
            onClick={() => setIsGalleryOpen(true)}
            className="md:col-span-2 relative h-full overflow-hidden cursor-pointer group bg-slate-100"
          >
            <img
              src={pg.images[0]}
              alt={pg.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* 2nd and 3rd photo */}
          <div className="hidden md:flex flex-col gap-2 h-full">
            <div
              onClick={() => setIsGalleryOpen(true)}
              className="flex-1 overflow-hidden cursor-pointer group bg-slate-100"
            >
              <img
                src={pg.images[1] || pg.images[0]}
                alt={`${pg.name} interior`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div
              onClick={() => setIsGalleryOpen(true)}
              className="flex-1 overflow-hidden cursor-pointer group bg-slate-100"
            >
              <img
                src={pg.images[2] || pg.images[0]}
                alt={`${pg.name} amenities`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* 4th and 5th photo */}
          <div className="hidden md:flex flex-col gap-2 h-full">
            <div
              onClick={() => setIsGalleryOpen(true)}
              className="flex-1 overflow-hidden cursor-pointer group bg-slate-100"
            >
              <img
                src={pg.images[3] || pg.images[0]}
                alt={`${pg.name} lounge`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div
              onClick={() => setIsGalleryOpen(true)}
              className="flex-1 overflow-hidden cursor-pointer group bg-slate-100 relative"
            >
              <img
                src={pg.images[4] || pg.images[0]}
                alt={`${pg.name} dining`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => setIsGalleryOpen(true)}
                className="absolute inset-0 bg-slate-900/40 hover:bg-slate-900/60 text-white font-bold text-xs flex items-center justify-center gap-1.5 backdrop-blur-[2px] transition-colors"
              >
                <span>View all {pg.images.length} photos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details & Booking Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 8 cols: Description, Room Types, Amenities, Rules, Host, Reviews */}
        <div className="lg:col-span-8 space-y-10">
          {/* Quick Highlight Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Homely Food</p>
                <p className="text-[11px] text-slate-400">3 meals included</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">300 Mbps Wi-Fi</p>
                <p className="text-[11px] text-slate-400">Fiber broadband</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center shrink-0">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Air Conditioned</p>
                <p className="text-[11px] text-slate-400">Inverter units</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">24/7 Security</p>
                <p className="text-[11px] text-slate-400">Biometric & CCTV</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-800">
              About This Co-Living Residence
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {pg.description}
            </p>
            {pg.foodDetails && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <Utensils className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Meal Service Details: </span>
                  <span>{pg.foodDetails}</span>
                </div>
              </div>
            )}
          </div>

          {/* Room Types & Pricing Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Available Room Options & Pricing
                </h3>
                <p className="text-xs text-slate-500">
                  Select a room type to reserve your bed with zero brokerage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pg.roomOptions.map((room) => {
                const isSelected = selectedRoomType === room.type;
                const isSoldOut = room.availableBeds <= 0;

                return (
                  <div
                    key={room.type}
                    onClick={() => !isSoldOut && setSelectedRoomType(room.type)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-800">
                          {room.name}
                        </h4>
                        {isSoldOut ? (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                            Sold Out
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {room.availableBeds} beds left
                          </span>
                        )}
                      </div>

                      <div className="my-3">
                        <span className="text-xl font-extrabold text-slate-800">
                          {formatCurrency(room.price)}
                        </span>
                        <span className="text-xs text-slate-500 block">/ month</span>
                      </div>

                      <ul className="text-xs text-slate-500 space-y-1 mb-4">
                        {room.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      disabled={isSoldOut}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Choose Room'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              All Amenities & Inclusions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pg.amenities.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              House Rules & Community Guidelines
            </h3>
            <div className="space-y-2">
              {pg.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner / Host Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={pg.owner.avatar}
                alt={pg.owner.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-rose-500/50"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-800">
                    Hosted by {pg.owner.name}
                  </h4>
                  {pg.owner.verified && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      Verified Host
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {pg.owner.responseTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => showToast('info', 'Host Contact', `Direct phone: ${pg.owner.phone}`)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call Host
              </button>
              <button
                onClick={() => showToast('info', 'WhatsApp Inquiries', 'Connecting to property manager on WhatsApp...')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-2xl font-black text-slate-800">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    <span>{pg.rating.toFixed(2)}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    • {reviews.length} Verified Resident Review{reviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={openAddReviewModal}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Write a Review
              </button>
            </div>

            {/* Review Cards List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <ReviewCard
                  key={rev.id}
                  review={rev}
                  onEdit={openEditReviewModal}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Sticky Booking Summary Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-2xl font-black text-slate-800">
                  {formatCurrency(activeRoom.price)}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{pg.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({pg.reviewCount})</span>
              </div>
            </div>

            {/* Selected Room Option dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Room Sharing Type
              </label>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value as RoomType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {pg.roomOptions.map((r) => (
                  <option key={r.type} value={r.type} disabled={r.availableBeds <= 0}>
                    {r.name} - {formatCurrency(r.price)} ({r.availableBeds} beds left)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick breakdown */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Monthly Rent</span>
                <span className="font-semibold">{formatCurrency(activeRoom.price)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Security Deposit
                  <span className="text-[10px] text-emerald-600">(100% Refundable)</span>
                </span>
                <span className="font-semibold">{formatCurrency(activeRoom.securityDeposit)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Notice Period</span>
                <span className="font-semibold">{pg.noticePeriodDays} Days</span>
              </div>
            </div>

            {/* Main CTA */}
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-500/25 transition-all transform active:scale-95 text-sm"
            >
              Book Now (Zero Brokerage)
            </button>

            <p className="text-[11px] text-center text-slate-400">
              You won't be charged yet. Token refundable within 24h.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>HavenStay Verified & Covered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking System Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        pg={pg}
        defaultRoomType={selectedRoomType}
        onBookingSuccess={(bookingId) => {
          onNavigate('my-bookings');
        }}
      />

      {/* Write / Edit Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={editingReview ? 'Edit Your Review' : 'Write Resident Review'}
        subtitle={pg.name}
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overall Rating ({reviewRating} / 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Cleanliness ({reviewCleanliness}★)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={reviewCleanliness}
                onChange={(e) => setReviewCleanliness(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Food Quality ({reviewFood}★)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={reviewFood}
                onChange={(e) => setReviewFood(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Wi-Fi & Internet ({reviewWifi}★)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={reviewWifi}
                onChange={(e) => setReviewWifi(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Neighborhood ({reviewLocation}★)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={reviewLocation}
                onChange={(e) => setReviewLocation(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Review Details
            </label>
            <textarea
              rows={4}
              required
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="How was the food, cleanliness, roommates, and manager responsiveness? Share specifics to help others."
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : editingReview ? 'Save Changes' : 'Publish Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Full Photo Lightbox Modal */}
      <Modal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title={`${pg.name} Photo Gallery`}
        maxWidth="4xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
          {pg.images.map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100">
              <img
                src={img}
                alt={`${pg.name} photo ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
