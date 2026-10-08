import React from 'react';
import { Star, Clock, Bookmark, Check, Download, Eye, Play } from 'lucide-react';
import { Movie } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { useOffline } from '../context/OfflineContext';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelectMovie }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, logWatchHistory, watchHistory } = useWatchlist();
  const { isMovieSavedOffline, saveMovieForOffline, removeMovieFromOffline } = useOffline();

  const isSaved = isInWatchlist(movie.id);
  const isDownloaded = isMovieSavedOffline(movie.id);
  const isWatched = watchHistory.some((h) => h.movieId === movie.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie.id, 'want_to_watch', 'medium');
    }
  };

  const handleWatchedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logWatchHistory(movie.id, 100);
  };

  const handleOfflineToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded) {
      removeMovieFromOffline(movie.id);
    } else {
      saveMovieForOffline(movie.id);
    }
  };

  return (
    <div
      onClick={() => onSelectMovie(movie)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-950">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* IMDb Rating */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-700/50 text-amber-400 font-black text-xs pointer-events-auto">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.imdbRating.toFixed(1)}</span>
          </div>

          {/* Quick Action Buttons on Top Right */}
          <div className="flex items-center gap-1 pointer-events-auto">
            {/* Offline indicator / button */}
            <button
              onClick={handleOfflineToggle}
              title={isDownloaded ? 'Downloaded for offline reading' : 'Save recap for offline'}
              className={`p-1.5 rounded-lg backdrop-blur-md border transition ${
                isDownloaded
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Watchlist button */}
            <button
              onClick={handleWatchlistClick}
              title={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
              className={`p-1.5 rounded-lg backdrop-blur-md border transition ${
                isSaved
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                  : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-amber-400'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Poster Info: Streaming Badges & Recap Reading Time */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-300">
            <span className="flex items-center gap-1 font-semibold text-amber-400 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
              <Clock className="w-3 h-3" />
              {movie.recap.readingTimeMinutes} min recap
            </span>

            {isWatched && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold text-[10px]">
                <Check className="w-3 h-3" /> Watched
              </span>
            )}
          </div>

          {/* Streaming Platforms */}
          <div className="flex items-center gap-1 overflow-hidden">
            {movie.streamingOptions.slice(0, 3).map((opt) => (
              <span
                key={opt.platformId}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900/90 text-zinc-200 border border-zinc-700/60 backdrop-blur-sm truncate max-w-[80px]"
              >
                {opt.platformName}
              </span>
            ))}
            {movie.streamingOptions.length > 3 && (
              <span className="text-[10px] px-1 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-zinc-700/60 font-semibold">
                +{movie.streamingOptions.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>{movie.year} • {movie.runtimeMinutes} min</span>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{movie.contentRating}</span>
          </div>

          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-500 transition-colors">
            {movie.title}
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {movie.recap.elevatorPitch}
          </p>
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold">
          <span className="text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-1">
            Read Recap & Twists →
          </span>
          <button
            onClick={handleWatchedClick}
            className="text-[11px] text-zinc-500 hover:text-emerald-500 transition flex items-center gap-1"
            title="Log to history"
          >
            <Eye className="w-3 h-3" /> Log
          </button>
        </div>
      </div>
    </div>
  );
};
