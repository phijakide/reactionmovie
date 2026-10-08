import React, { useState } from 'react';
import { Bookmark, Star, Clock, Check, Trash2, Edit3, Heart, Play, Film, AlertCircle } from 'lucide-react';
import { WatchlistItem, WatchlistStatus, WatchPriority, Movie } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { MOVIES_DATA } from '../data/moviesData';

interface WatchlistTabProps {
  onSelectMovie: (movie: Movie) => void;
  onExplore: () => void;
}

export const WatchlistTab: React.FC<WatchlistTabProps> = ({ onSelectMovie, onExplore }) => {
  const { watchlist, updateWatchlistStatus, removeFromWatchlist } = useWatchlist();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');

  const filteredItems = watchlist.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    return true;
  });

  const handleStartEdit = (item: WatchlistItem) => {
    setEditingItemId(item.movieId);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = (movieId: string, item: WatchlistItem) => {
    updateWatchlistStatus(movieId, item.status, item.priority, editNotes);
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-500" />
            My Personalized Watchlist ({watchlist.length})
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Personal queues synced across your mobile, tablet, and TV sessions.
          </p>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500">Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <option value="all">All Priorities</option>
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium</option>
            <option value="low">🌱 Low</option>
          </select>
        </div>
      </div>

      {/* Status Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        {[
          { id: 'all', label: 'All Items', count: watchlist.length },
          { id: 'want_to_watch', label: 'Want to Watch', count: watchlist.filter((w) => w.status === 'want_to_watch').length },
          { id: 'watching', label: 'Currently Watching', count: watchlist.filter((w) => w.status === 'watching').length },
          { id: 'completed', label: 'Completed', count: watchlist.filter((w) => w.status === 'completed').length },
          { id: 'favorites', label: 'Favorites', count: watchlist.filter((w) => w.status === 'favorites').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
              filterStatus === tab.id
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterStatus === tab.id ? 'bg-zinc-950 text-amber-400 font-black' : 'bg-zinc-200 dark:bg-zinc-800'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Watchlist Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
          <Bookmark className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Your watchlist is empty here</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            Discover mind-bending recaps, plot twists, and endings, then add them to your personalized queues!
          </p>
          <button
            onClick={onExplore}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs transition"
          >
            Browse Movie Recaps
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const movie = MOVIES_DATA.find((m) => m.id === item.movieId);
            const isEditing = editingItemId === item.movieId;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 transition flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="flex gap-3">
                  <img
                    src={item.moviePoster}
                    alt={item.movieTitle}
                    onClick={() => movie && onSelectMovie(movie)}
                    className="w-20 h-28 object-cover rounded-xl shadow-md cursor-pointer flex-shrink-0 hover:opacity-90 transition"
                  />

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">{item.releaseYear}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          item.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <h4
                      onClick={() => movie && onSelectMovie(movie)}
                      className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-amber-500 transition cursor-pointer line-clamp-1"
                    >
                      {item.movieTitle}
                    </h4>

                    {/* Status Pill Switcher */}
                    <div className="pt-1">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateWatchlistStatus(item.movieId, e.target.value as WatchlistStatus)
                        }
                        className="px-2 py-1 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                      >
                        <option value="want_to_watch">Want to Watch</option>
                        <option value="watching">Watching Now</option>
                        <option value="completed">Completed</option>
                        <option value="favorites">Favorites</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add personal note (e.g., Recommended by friend, stream on Max)..."
                      className="w-full p-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="px-2.5 py-1 text-zinc-500 hover:text-zinc-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.movieId, item)}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-zinc-950 font-bold"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  item.notes && (
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 italic flex items-start justify-between gap-2">
                      <span className="line-clamp-2">"{item.notes}"</span>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-zinc-400 hover:text-amber-500"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )
                )}

                {/* Footer Action Icons */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
                  <button
                    onClick={() => movie && onSelectMovie(movie)}
                    className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Film className="w-3.5 h-3.5" /> Read Full Recap
                  </button>

                  <div className="flex items-center gap-2">
                    {!item.notes && !isEditing && (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-zinc-400 hover:text-zinc-200 transition"
                        title="Add note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromWatchlist(item.movieId)}
                      className="text-zinc-400 hover:text-rose-500 transition"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
