import React from 'react';
import { Filter, Tv, Sparkles, Clock, Star, Download, Bookmark, CheckCircle2 } from 'lucide-react';
import { StreamingPlatformId } from '../types';

interface StreamingFilterBarProps {
  selectedPlatform: string;
  onSelectPlatform: (platformId: string) => void;
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  sortBy: 'popularity' | 'rating' | 'year' | 'recapTime';
  onSortChange: (sort: 'popularity' | 'rating' | 'year' | 'recapTime') => void;
  quickFilter: 'all' | 'watchlist' | 'watched' | 'offline';
  onQuickFilterChange: (q: 'all' | 'watchlist' | 'watched' | 'offline') => void;
  offlineCount: number;
  watchlistCount: number;
}

const PLATFORMS: { id: string; name: string; iconBg: string; badge: string }[] = [
  { id: 'all', name: 'All Services', iconBg: 'bg-zinc-800', badge: '🌐' },
  { id: 'netflix', name: 'Netflix', iconBg: 'bg-red-600', badge: 'N' },
  { id: 'prime', name: 'Prime Video', iconBg: 'bg-blue-600', badge: 'Prime' },
  { id: 'max', name: 'Max', iconBg: 'bg-purple-700', badge: 'Max' },
  { id: 'appletv', name: 'Apple TV', iconBg: 'bg-zinc-700', badge: '' },
  { id: 'paramount', name: 'Paramount+', iconBg: 'bg-blue-500', badge: 'P+' },
  { id: 'hulu', name: 'Hulu', iconBg: 'bg-emerald-600', badge: 'Hulu' },
  { id: 'peacock', name: 'Peacock', iconBg: 'bg-teal-600', badge: 'Peacock' },
];

const GENRES = [
  'All',
  'Sci-Fi',
  'Psychological Thriller',
  'Mystery',
  'Drama',
  'Action',
  'Adventure',
  'Crime',
  'Comedy',
];

export const StreamingFilterBar: React.FC<StreamingFilterBarProps> = ({
  selectedPlatform,
  onSelectPlatform,
  selectedGenre,
  onSelectGenre,
  sortBy,
  onSortChange,
  quickFilter,
  onQuickFilterChange,
  offlineCount,
  watchlistCount,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Quick Status View Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => onQuickFilterChange('all')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
            quickFilter === 'all'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          All Recaps
        </button>

        <button
          onClick={() => onQuickFilterChange('watchlist')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
            quickFilter === 'watchlist'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          My Watchlist ({watchlistCount})
        </button>

        <button
          onClick={() => onQuickFilterChange('offline')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
            quickFilter === 'offline'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Downloaded for Offline ({offlineCount})
        </button>

        <button
          onClick={() => onQuickFilterChange('watched')}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap transition flex items-center gap-1.5 ${
            quickFilter === 'watched'
              ? 'bg-indigo-600 text-white font-bold shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Finished
        </button>
      </div>

      {/* Streaming Platform Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1 flex-shrink-0 mr-1">
            <Tv className="w-3.5 h-3.5 text-amber-500" /> Stream:
          </span>
          {PLATFORMS.map((platform) => {
            const isActive = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => onSelectPlatform(platform.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-600 dark:text-amber-300 font-bold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                <span className={`text-[10px] px-1 py-0.2 rounded font-black text-white ${platform.iconBg}`}>
                  {platform.badge}
                </span>
                <span>{platform.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest IMDb Rating</option>
            <option value="year">Newest Release</option>
            <option value="recapTime">Fastest Recap Read</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {GENRES.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onSelectGenre(genre)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
};
