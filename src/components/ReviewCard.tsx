import React from 'react';
import { Star, ShieldCheck, Edit2, Trash2 } from 'lucide-react';
import { Review } from '../types';
import { formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, onDelete }) => {
  const { user, isAdmin } = useAuth();
  const isOwner = user?.id === review.userId || isAdmin;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img
            src={review.userAvatar}
            alt={review.userName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-800">
                {review.userName}
              </h4>
              {review.verifiedStay && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Resident
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(review.date)}
            </p>
          </div>
        </div>

        {/* Rating and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{review.rating}.0</span>
          </div>

          {isOwner && (
            <div className="flex items-center gap-1 ml-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit Review"
                  aria-label="Edit review"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(review.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Review"
                  aria-label="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Comment */}
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
        {review.comment}
      </p>

      {/* Breakdown Pills */}
      {review.categories && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] text-slate-500">
          <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            Cleanliness: <b>{review.categories.cleanliness}★</b>
          </span>
          <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            Food: <b>{review.categories.food}★</b>
          </span>
          <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            Wi-Fi: <b>{review.categories.wifi}★</b>
          </span>
          <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
            Location: <b>{review.categories.location}★</b>
          </span>
        </div>
      )}
    </div>
  );
};
