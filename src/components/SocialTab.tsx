import React, { useState } from 'react';
import { Users, Star, MessageSquare, Share2, ThumbsUp, Plus, Sparkles, Filter, Check, Eye } from 'lucide-react';
import { MovieReview, Movie } from '../types';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';
import { MOVIES_DATA } from '../data/moviesData';

interface SocialTabProps {
  onSelectMovie: (movie: Movie) => void;
  onOpenShareModal: (movie: Movie, review?: MovieReview) => void;
  onWriteReview: (movie?: Movie) => void;
}

export const SocialTab: React.FC<SocialTabProps> = ({
  onSelectMovie,
  onOpenShareModal,
  onWriteReview,
}) => {
  const { reviews, userReviews, toggleLikeReview, likedReviewIds } = useReviews();
  const { userProfile } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'spoilers_free' | 'top_rated' | 'mine'>('all');
  const [revealedSpoilersMap, setRevealedSpoilersMap] = useState<Record<string, boolean>>({});

  // Friend Match Feature Simulation
  const [selectedFriend, setSelectedFriend] = useState<string>('Elena Rostova');

  const friends = [
    { name: 'Elena Rostova', taste: 'Sci-Fi & Nolan', compatibility: 96, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
    { name: 'Marcus Chen', taste: 'Space & Soundtracks', compatibility: 91, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Dr. Sarah Vance', taste: 'Biopics & History', compatibility: 84, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (filterType === 'spoilers_free' && r.containsSpoilers) return false;
    if (filterType === 'top_rated' && r.rating < 9) return false;
    if (filterType === 'mine' && r.userId !== userProfile?.id) return false;
    return true;
  });

  const toggleSpoilerReveal = (id: string) => {
    setRevealedSpoilersMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Social Review Feed & Friend Shares
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Read member impressions, discuss endings, and generate shareable cards with your friends.
          </p>
        </div>

        <button
          onClick={() => onWriteReview()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Friend Taste Match Widget */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Friend Taste Compatibility Radar
          </span>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            Compare your watchlist genres with fellow cinephiles to discover matching recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {friends.map((f) => (
            <div
              key={f.name}
              onClick={() => setSelectedFriend(f.name)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                selectedFriend === f.name
                  ? 'bg-white dark:bg-zinc-900 border-amber-500 shadow-sm'
                  : 'bg-white/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500" />
              <div className="text-left">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">{f.name}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                  {f.compatibility}% Taste Match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: `All Reviews (${reviews.length})` },
          { id: 'spoilers_free', label: 'Spoiler-Free Only' },
          { id: 'top_rated', label: '10/10 Masterpieces' },
          { id: 'mine', label: `My Reviews (${userReviews.length})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id as any)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition ${
              filterType === f.id
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.map((rev) => {
          const isLiked = likedReviewIds.includes(rev.id);
          const isSpoilerRevealed = revealedSpoilersMap[rev.id];
          const movie = MOVIES_DATA.find((m) => m.id === rev.movieId);

          return (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-3">
                {/* Author & Rating Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={rev.userName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500/40"
                    />
                    <div>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rev.rating}/10</span>
                  </div>
                </div>

                {/* Movie Referenced */}
                {movie && (
                  <div
                    onClick={() => onSelectMovie(movie)}
                    className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/30 flex items-center gap-2.5 cursor-pointer transition group"
                  >
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-8 h-11 object-cover rounded-md"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition block truncate">
                        {movie.title} ({movie.year})
                      </span>
                      <span className="text-[10px] text-zinc-500 truncate block">
                        Dir. {movie.director}
                      </span>
                    </div>
                  </div>
                )}

                {/* Headline & Content */}
                <div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mb-1">
                    "{rev.headline}"
                  </h4>

                  {rev.containsSpoilers && !isSpoilerRevealed ? (
                    <div
                      onClick={() => toggleSpoilerReveal(rev.id)}
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center cursor-pointer hover:bg-rose-500/15 transition"
                    >
                      <span className="text-xs font-bold text-rose-500 block">
                        ⚠️ Review contains plot spoilers!
                      </span>
                      <span className="text-[10px] text-zinc-500">Click to reveal review text</span>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {rev.content}
                    </p>
                  )}
                </div>

                {rev.favoriteScene && (!rev.containsSpoilers || isSpoilerRevealed) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
                    <strong>Favorite Moment:</strong> {rev.favoriteScene}
                  </p>
                )}
              </div>

              {/* Social Footer Bar */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleLikeReview(rev.id)}
                  className={`flex items-center gap-1.5 transition font-semibold px-2 py-1 rounded-lg ${
                    isLiked
                      ? 'text-amber-500 font-bold bg-amber-500/10'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.likesCount})</span>
                </button>

                <button
                  onClick={() => movie && onOpenShareModal(movie, rev)}
                  className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 font-semibold text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share with Friends</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
