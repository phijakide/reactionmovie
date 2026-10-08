import React, { useState } from 'react';
import { X, Star, AlertTriangle, Send, Film, Check } from 'lucide-react';
import { Movie } from '../types';
import { useReviews } from '../context/ReviewsContext';
import { MOVIES_DATA } from '../data/moviesData';

interface WriteReviewModalProps {
  initialMovie?: Movie | null;
  onClose: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ initialMovie, onClose }) => {
  const { addReview } = useReviews();

  const [selectedMovieId, setSelectedMovieId] = useState<string>(
    initialMovie?.id || MOVIES_DATA[0].id
  );
  const [rating, setRating] = useState<number>(9);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [headline, setHeadline] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(false);
  const [favoriteScene, setFavoriteScene] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const selectedMovie = MOVIES_DATA.find((m) => m.id === selectedMovieId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await addReview(selectedMovieId, rating, headline, content, containsSpoilers, favoriteScene);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Write Movie Review & Impression</h3>
            <p className="text-xs text-zinc-500">Share your analysis and ending take with the community</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Review Published!</h4>
            <p className="text-xs text-zinc-500">Your review is now live in the community feed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Movie Picker */}
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Select Film:
              </label>
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {MOVIES_DATA.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.year}) - Dir. {m.director}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Stars (1-10) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Rating:
                </label>
                <span className="text-sm font-black text-amber-500">{hoverRating || rating} / 10</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    onMouseEnter={() => setHoverRating(num)}
                    onMouseLeave={() => setHoverRating(null)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition ${
                      num <= (hoverRating || rating)
                        ? 'bg-amber-500 text-zinc-950 font-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Review Headline:
              </label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="e.g. Masterclass in suspense with a devastating ending..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Full Review Content */}
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Review Analysis & Thoughts:
              </label>
              <textarea
                required
                rows={4}
                maxLength={3000}
                placeholder="What did you think of the direction, the twists, and the emotional payoff?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 rounded-xl text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* Favorite Scene */}
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Favorite Scene or Moment (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. The revolving hallway duel or the final 5 minutes..."
                value={favoriteScene}
                onChange={(e) => setFavoriteScene(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Spoiler Checkbox */}
            <label className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 cursor-pointer">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 accent-rose-500"
              />
              <span className="text-xs font-bold text-rose-500">
                Mark this review as containing plot twists or ending spoilers
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Publishing...' : 'Publish Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
