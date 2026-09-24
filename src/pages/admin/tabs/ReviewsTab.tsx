import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  Trash2,
  Reply,
  Pin,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  Send,
  X,
  ThumbsUp,
  Clock,
} from 'lucide-react';
import { Review } from '../../../types';

interface ReviewsTabProps {
  reviews: Review[];
  onReplyReview: (reviewId: string, replyText: string) => Promise<void>;
  onToggleHighlight: (reviewId: string) => Promise<void>;
  onDeleteReview: (reviewId: string) => Promise<void>;
  onAddReview: (reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  onReplyReview,
  onToggleHighlight,
  onDeleteReview,
  onAddReview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // New offline review modal state
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [cleanlinessScore, setCleanlinessScore] = useState(5);
  const [foodScore, setFoodScore] = useState(5);
  const [wifiScore, setWifiScore] = useState(5);
  const [locationScore, setLocationScore] = useState(5);
  const [valueScore, setValueScore] = useState(5);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.userName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.ownerReply?.text && r.ownerReply.text.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      await onReplyReview(reviewId, replyText.trim());
      setReplyingToId(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to submit reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleCreateOfflineReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newComment.trim()) return;
    try {
      await onAddReview({
        pgId: 'pg_1',
        userId: `offline_${Date.now()}`,
        userName: newUserName.trim(),
        userAvatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        rating: Number(newRating),
        comment: newComment.trim(),
        verifiedStay: true,
        categories: {
          cleanliness: Number(cleanlinessScore),
          food: Number(foodScore),
          wifi: Number(wifiScore),
          location: Number(locationScore),
          value: Number(valueScore),
        },
      });
      setIsAddReviewOpen(false);
      setNewUserName('');
      setNewComment('');
    } catch (err) {
      console.error('Failed to add offline review:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Resident Reviews & Reputation Management
          </h2>
          <p className="text-xs text-slate-500">
            Monitor feedback, publish official owner replies, pin top testimonials, and maintain community standards.
          </p>
        </div>

        <button
          onClick={() => setIsAddReviewOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Record Guestbook Review</span>
        </button>
      </div>

      {/* Ratings Analytics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Average Rating */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Overall Rating
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-slate-900">{averageRating}</span>
              <div className="flex text-amber-500 text-xs">
                {'★'.repeat(Math.round(Number(averageRating)))}
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Based on {reviews.length} Verified Reviews
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* 5-Star Reviews */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              5-Star Exceptional
            </span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {fiveStarCount}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {reviews.length > 0 ? Math.round((fiveStarCount / reviews.length) * 100) : 0}% Positive Share
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ThumbsUp className="w-5 h-5" />
          </div>
        </div>

        {/* 4-Star Reviews */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              4-Star Satisfied
            </span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block">
              {fourStarCount}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {reviews.length > 0 ? Math.round((fourStarCount / reviews.length) * 100) : 0}% Satisfaction
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Owner Response Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Owner Reply Rate
            </span>
            <span className="text-2xl font-bold text-purple-700 mt-1 block">
              {reviews.filter((r) => r.ownerReply).length} / {reviews.length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Responses Published
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Reply className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reviews by resident or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              ratingFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setRatingFilter(5)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              ratingFilter === 5
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            5 ★ ({fiveStarCount})
          </button>
          <button
            onClick={() => setRatingFilter(4)}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              ratingFilter === 4
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            4 ★ ({fourStarCount})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
            No resident reviews found matching your search filters.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all ${
                rev.highlighted
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              {/* Review Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={rev.userName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{rev.userName}</h4>
                      {rev.verifiedStay && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" /> Verified Resident
                        </span>
                      )}
                      {rev.highlighted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <Pin className="w-3 h-3" /> Featured on Homepage
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Reviewed on {rev.date}
                    </span>
                  </div>
                </div>

                {/* Right controls: Rating & Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < rev.rating ? 'text-amber-500' : 'text-slate-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono ml-1">
                      {rev.rating}.0
                    </span>
                  </div>

                  {/* Pin/Highlight Toggle */}
                  <button
                    onClick={() => onToggleHighlight(rev.id)}
                    title={rev.highlighted ? 'Unpin from homepage' : 'Pin to top of homepage'}
                    className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                      rev.highlighted
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Review */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Permanently delete review by ${rev.userName}?`)) {
                        onDeleteReview(rev.id);
                      }
                    }}
                    title="Delete review"
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-700 leading-relaxed pl-1">
                "{rev.comment}"
              </p>

              {/* Category Scores breakdown pill list */}
              {rev.categories && (
                <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                  {Object.entries(rev.categories).map(([category, score]) => (
                    <span
                      key={category}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-mono capitalize"
                    >
                      {category}: <strong className="text-emerald-700">{score}/5</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Official Owner Reply Display */}
              {rev.ownerReply && (
                <div className="bg-amber-50/50 border-l-2 border-amber-500 rounded-r-xl p-3.5 space-y-1.5 text-xs ml-2 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <Reply className="w-3.5 h-3.5" />
                      Official Response from {rev.ownerReply.ownerName || 'Haven Stay Management'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rev.ownerReply.date}
                    </span>
                  </div>
                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    {rev.ownerReply.text}
                  </p>
                  <button
                    onClick={() => {
                      setReplyingToId(rev.id);
                      setReplyText(rev.ownerReply?.text || '');
                    }}
                    className="text-[10px] text-blue-600 hover:underline cursor-pointer pt-0.5 inline-block font-semibold"
                  >
                    Edit Response
                  </button>
                </div>
              )}

              {/* Reply Box / Trigger */}
              {replyingToId === rev.id ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Write Official Owner Response
                  </label>
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank the resident or explain steps taken to address feedback..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingToId(null);
                        setReplyText('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSubmittingReply}
                      onClick={() => handleSendReply(rev.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSubmittingReply ? 'Posting...' : 'Post Response'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                !rev.ownerReply && (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setReplyingToId(rev.id);
                        setReplyText('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Reply to {rev.userName}</span>
                    </button>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* Record Offline Guestbook Review Modal */}
      {isAddReviewOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Record Guestbook / Offline Review</h3>
                  <p className="text-[11px] text-slate-500">Add reviews from physical register or WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddReviewOpen(false)}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOfflineReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Resident Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Star Rating (1 to 5) *</label>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewRating(st)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        newRating === st
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {st} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Resident Review Comment *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste or write the resident's feedback..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 text-slate-900 outline-none resize-none"
                />
              </div>

              {/* Sub Category Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Cleanliness (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={cleanlinessScore}
                    onChange={(e) => setCleanlinessScore(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Food / Meals (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={foodScore}
                    onChange={(e) => setFoodScore(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 font-bold mb-0.5">Wi-Fi & Speed (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={wifiScore}
                    onChange={(e) => setWifiScore(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-center"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddReviewOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Publish Guest Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
