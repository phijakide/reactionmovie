import React from 'react';
import { History, Tv, Smartphone, Laptop, Clock, Star, Trash2, CheckCircle2, ShieldCheck, Film, BarChart3 } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { Movie } from '../types';
import { MOVIES_DATA } from '../data/moviesData';

interface HistoryTabProps {
  onSelectMovie: (movie: Movie) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onSelectMovie }) => {
  const { watchHistory, removeFromHistory, historyStats, syncState, lastSyncedAt } = useWatchlist();

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes('tv') || deviceName.toLowerCase().includes('chromecast')) {
      return <Tv className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (deviceName.toLowerCase().includes('iphone') || deviceName.toLowerCase().includes('mobile')) {
      return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header & Multi-Device Sync Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-6 h-6 text-amber-500" />
            Watch History & Device Sync ({watchHistory.length})
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Secure cross-device tracking syncing your viewing sessions and progress across TV, mobile, and laptop.
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-zinc-700 dark:text-zinc-300">
            {syncState === 'synced' ? 'Multi-Device Cloud Synced' : 'Syncing in Progress'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>
      </div>

      {/* Analytics & Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Movies Watched</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-500" />
            {historyStats.totalWatched}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Total Watch Time</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            {historyStats.totalHours} hrs
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Avg Completion</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            {historyStats.completionRateAvg}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Top Genre</span>
          <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" />
            {historyStats.topGenres[0]?.genre || 'Sci-Fi'}
          </div>
        </div>
      </div>

      {/* Top Genres Breakdown */}
      {historyStats.topGenres.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
            Favorite Viewing Genres
          </span>
          <div className="flex flex-wrap gap-2">
            {historyStats.topGenres.map((g) => (
              <span
                key={g.genre}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5"
              >
                <span>{g.genre}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                  {g.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* History Timeline List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Viewing Activity Log
        </h3>

        {watchHistory.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">No watch history logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchHistory.map((item) => {
              const movie = MOVIES_DATA.find((m) => m.id === item.movieId);

              return (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/30 transition flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.moviePoster}
                      alt={item.movieTitle}
                      onClick={() => movie && onSelectMovie(movie)}
                      className="w-12 h-16 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition flex-shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                      <h4
                        onClick={() => movie && onSelectMovie(movie)}
                        className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition cursor-pointer truncate"
                      >
                        {item.movieTitle}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{new Date(item.watchedAt).toLocaleDateString()}</span>
                        
                        {/* Device Badge */}
                        <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                          {getDeviceIcon(item.deviceName)}
                          {item.deviceName}
                        </span>

                        {item.rating && (
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {item.rating}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-28 sm:w-44 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full"
                          style={{ width: `${item.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => movie && onSelectMovie(movie)}
                      className="hidden sm:inline-block px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition"
                    >
                      Recap
                    </button>
                    <button
                      onClick={() => removeFromHistory(item.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500 transition rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
