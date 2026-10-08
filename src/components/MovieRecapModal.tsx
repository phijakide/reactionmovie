import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Clock,
  Tv,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Download,
  Check,
  Eye,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Film,
  Plus,
  Send,
} from 'lucide-react';
import { Movie, WatchlistStatus, WatchPriority } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { useOffline } from '../context/OfflineContext';
import { useReviews } from '../context/ReviewsContext';
import { useTheme } from '../context/ThemeContext';

interface MovieRecapModalProps {
  movie: Movie | null;
  onClose: () => void;
  onOpenShareModal: (movie: Movie) => void;
  onWriteReview: (movie: Movie) => void;
}

export const MovieRecapModal: React.FC<MovieRecapModalProps> = ({
  movie,
  onClose,
  onOpenShareModal,
  onWriteReview,
}) => {
  const { fontSize, setFontSize } = useTheme();
  const { isInWatchlist, getWatchlistEntry, updateWatchlistStatus, removeFromWatchlist, logWatchHistory, watchHistory } = useWatchlist();
  const { isMovieSavedOffline, saveMovieForOffline, removeMovieFromOffline } = useOffline();
  const { getReviewsForMovie, toggleLikeReview, likedReviewIds } = useReviews();

  // Spoilers reveal toggles
  const [revealedEnding, setRevealedEnding] = useState(false);
  const [revealedTwists, setRevealedTwists] = useState(false);

  // Audio Speech Narrator State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Watch history log popover
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPercent, setHistoryPercent] = useState<number>(100);
  const [historyDevice, setHistoryDevice] = useState<string>('Living Room Smart TV');
  const [historyLoggedSuccess, setHistoryLoggedSuccess] = useState(false);

  // Stop speech when closing or changing movie
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [movie]);

  if (!movie) return null;

  const isSaved = isInWatchlist(movie.id);
  const watchlistEntry = getWatchlistEntry(movie.id);
  const isDownloaded = isMovieSavedOffline(movie.id);
  const movieReviews = getReviewsForMovie(movie.id);
  const isAlreadyWatched = watchHistory.some((h) => h.movieId === movie.id);

  // Audio recap speech synthesizer
  const toggleAudioNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const narrativeText = `${movie.title}, directed by ${movie.director}. Summary: ${movie.recap.elevatorPitch}. Act 1: ${movie.recap.acts.act1.content}. Act 2: ${movie.recap.acts.act2.content}. Act 3: ${movie.recap.acts.act3.content}.`;
      const utterance = new SpeechSynthesisUtterance(narrativeText);
      utterance.rate = speechRate;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleOfflineToggle = () => {
    if (isDownloaded) {
      removeMovieFromOffline(movie.id);
    } else {
      saveMovieForOffline(movie.id);
    }
  };

  const handleWatchlistChange = (newStatus: WatchlistStatus) => {
    updateWatchlistStatus(movie.id, newStatus);
  };

  const handleHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logWatchHistory(movie.id, historyPercent, movie.imdbRating, historyDevice);
    setHistoryLoggedSuccess(true);
    setTimeout(() => {
      setShowHistoryModal(false);
      setHistoryLoggedSuccess(false);
    }, 1500);
  };

  const fontSizeClasses = {
    regular: 'text-sm sm:text-base leading-relaxed',
    large: 'text-base sm:text-lg leading-loose',
    xlarge: 'text-lg sm:text-xl leading-loose',
  }[fontSize];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-0 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Floating Top Controls Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-sm sm:text-base truncate">{movie.title}</span>
            <span className="text-xs text-zinc-500">({movie.year})</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Narrator Button */}
            <button
              onClick={toggleAudioNarration}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                isSpeaking
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold animate-pulse'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500'
              }`}
              title="Listen to audio narration"
            >
              {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? 'Pause Audio' : 'Listen Recap'}</span>
            </button>

            {/* Offline download toggle */}
            <button
              onClick={handleOfflineToggle}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                isDownloaded
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-emerald-500'
              }`}
              title={isDownloaded ? 'Saved for offline' : 'Download recap for offline'}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isDownloaded ? 'Downloaded' : 'Save Offline'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => onOpenShareModal(movie)}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition"
              title="Share recap & review"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Hero Section */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <div className="absolute inset-0 z-0">
              <img
                src={movie.backdropUrl}
                alt={movie.title}
                className="w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
            </div>

            <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-32 sm:w-44 rounded-xl shadow-2xl border-2 border-zinc-700/50 flex-shrink-0"
              />

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-black">
                    ★ {movie.imdbRating} IMDb
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600/20 text-rose-400 font-bold border border-rose-500/30">
                    🍅 {movie.rottenTomatoesScore}% Rotten Tomatoes
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
                    {movie.contentRating}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {movie.runtimeMinutes} min
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                    ⏱️ {movie.recap.readingTimeMinutes} min recap read
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {movie.title}
                </h1>
                <p className="text-xs sm:text-sm italic text-amber-400/90 font-medium">"{movie.tagline}"</p>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  {movie.synopsis}
                </p>

                <div className="pt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-400">
                  <div>
                    <strong className="text-zinc-200">Director:</strong> {movie.director}
                  </div>
                  <div>
                    <strong className="text-zinc-200">Cast:</strong> {movie.cast.slice(0, 4).join(', ')}
                  </div>
                  <div>
                    <strong className="text-zinc-200">Genres:</strong> {movie.genres.join(', ')}
                  </div>
                </div>

                {/* Watchlist & History Action Bar */}
                <div className="pt-4 flex flex-wrap items-center gap-2">
                  <select
                    value={isSaved ? watchlistEntry?.status : 'none'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'none') {
                        removeFromWatchlist(movie.id);
                      } else {
                        handleWatchlistChange(val as WatchlistStatus);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500 text-zinc-950 border-amber-400'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    <option value="none" className="bg-zinc-900 text-zinc-100">
                      + Add to Watchlist
                    </option>
                    <option value="want_to_watch" className="bg-zinc-900 text-zinc-100">
                      🔖 Want to Watch
                    </option>
                    <option value="watching" className="bg-zinc-900 text-zinc-100">
                      🍿 Currently Watching
                    </option>
                    <option value="completed" className="bg-zinc-900 text-zinc-100">
                      ✅ Completed
                    </option>
                    <option value="favorites" className="bg-zinc-900 text-zinc-100">
                      ❤️ Favorites
                    </option>
                  </select>

                  <button
                    onClick={() => setShowHistoryModal(!showHistoryModal)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                      isAlreadyWatched
                        ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAlreadyWatched ? 'Watched (Log Again)' : 'Log Watch Progress'}</span>
                  </button>

                  <button
                    onClick={() => onWriteReview(movie)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Write Review</span>
                  </button>
                </div>

                {/* History Log Modal / Popover */}
                {showHistoryModal && (
                  <form
                    onSubmit={handleHistorySubmit}
                    className="mt-3 p-4 rounded-xl bg-zinc-950/90 border border-zinc-700 space-y-3 max-w-md animate-in slide-in-from-top-2"
                  >
                    <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Track Watch History & Device Sync
                    </h4>
                    <div>
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span>Completion Rate:</span>
                        <strong className="text-amber-400">{historyPercent}%</strong>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={historyPercent}
                        onChange={(e) => setHistoryPercent(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Device Synced:</label>
                      <select
                        value={historyDevice}
                        onChange={(e) => setHistoryDevice(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs border border-zinc-700"
                      >
                        <option value="Living Room Apple TV 4K">Living Room Apple TV 4K</option>
                        <option value="Living Room Smart TV">Living Room Smart TV</option>
                        <option value="iPhone 16 Pro Max">iPhone 16 Pro Max</option>
                        <option value="MacBook Pro M3 Max">MacBook Pro M3 Max</option>
                        <option value="iPad Pro OLED">iPad Pro OLED</option>
                        <option value="Bedroom Chromecast">Bedroom Chromecast</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowHistoryModal(false)}
                        className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1"
                      >
                        {historyLoggedSuccess ? <Check className="w-3.5 h-3.5" /> : 'Save to History'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Major Streaming Platforms Integration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Tv className="w-5 h-5 text-amber-500" />
                Where to Stream Now
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Updated today</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {movie.streamingOptions.map((opt) => (
                <a
                  key={opt.platformId}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/60 dark:hover:border-amber-500/60 transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition">
                      {opt.platformName}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 transition" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400 capitalize">
                        {opt.type === 'subscription' ? 'Subscription' : opt.type}
                      </span>
                      {opt.price && <strong className="text-amber-600 dark:text-amber-400">{opt.price}</strong>}
                    </div>
                    <span className="inline-block text-[10px] font-black tracking-wide px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {opt.quality}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Reading Accessibility Controls */}
          <div className="flex items-center justify-between py-2 border-y border-zinc-200 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">Text Size:</span>
              <button
                onClick={() => setFontSize('regular')}
                className={`px-2 py-1 rounded font-bold ${fontSize === 'regular' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 rounded font-bold ${fontSize === 'large' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800'}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-1 rounded font-bold ${fontSize === 'xlarge' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800'}`}
              >
                A++
              </button>
            </div>

            <div className="text-zinc-500 dark:text-zinc-400">
              ⚡ Full recap cached in memory
            </div>
          </div>

          {/* 30-Second Elevator Pitch */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-xs uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
              ⚡ 30-Second Elevator Pitch
            </span>
            <p className={`font-medium text-zinc-800 dark:text-zinc-200 ${fontSizeClasses}`}>
              {movie.recap.elevatorPitch}
            </p>
          </div>

          {/* Detailed Act-By-Act Breakdown */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Film className="w-5 h-5 text-amber-500" />
              Full Narrative Recap (Act-by-Act)
            </h3>

            {/* Act 1 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  ACT 1
                </span>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  {movie.recap.acts.act1.title}
                </h4>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {movie.recap.acts.act1.subtitle}
              </p>
              <p className={`text-zinc-700 dark:text-zinc-300 ${fontSizeClasses}`}>
                {movie.recap.acts.act1.content}
              </p>
            </div>

            {/* Act 2 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  ACT 2
                </span>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  {movie.recap.acts.act2.title}
                </h4>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {movie.recap.acts.act2.subtitle}
              </p>
              <p className={`text-zinc-700 dark:text-zinc-300 ${fontSizeClasses}`}>
                {movie.recap.acts.act2.content}
              </p>
            </div>

            {/* Act 3 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-black px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                  ACT 3
                </span>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  {movie.recap.acts.act3.title}
                </h4>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                {movie.recap.acts.act3.subtitle}
              </p>
              <p className={`text-zinc-700 dark:text-zinc-300 ${fontSizeClasses}`}>
                {movie.recap.acts.act3.content}
              </p>
            </div>
          </div>

          {/* SPOILER GATE: Ending Explained */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black px-2.5 py-1 rounded bg-rose-500/20 text-rose-500 border border-rose-500/30 inline-block mb-1">
                  ⚠️ SPOILER WARNING
                </span>
                <h4 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {movie.recap.endingExplained.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {movie.recap.endingExplained.subtitle}
                </p>
              </div>

              <button
                onClick={() => setRevealedEnding(!revealedEnding)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition flex items-center gap-1.5 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                {revealedEnding ? 'Hide Ending' : 'Reveal Ending'}
              </button>
            </div>

            {revealedEnding ? (
              <div className="pt-2 animate-in fade-in duration-300">
                <p className={`text-zinc-800 dark:text-zinc-200 ${fontSizeClasses}`}>
                  {movie.recap.endingExplained.content}
                </p>
              </div>
            ) : (
              <div
                onClick={() => setRevealedEnding(true)}
                className="p-6 rounded-xl bg-zinc-200/50 dark:bg-zinc-950/50 border border-dashed border-zinc-400 dark:border-zinc-800 text-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-950 transition select-none"
              >
                <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Ending explanation is protected to prevent unwanted spoilers.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Click here or press "Reveal Ending" to uncover how the film concludes.
                </p>
              </div>
            )}
          </div>

          {/* SPOILER GATE: Twists & Hidden Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black px-2.5 py-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-block mb-1">
                  🔍 SECRET TWISTS & DETAILS
                </span>
                <h4 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {movie.recap.twistsAndTurns.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {movie.recap.twistsAndTurns.subtitle}
                </p>
              </div>

              <button
                onClick={() => setRevealedTwists(!revealedTwists)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition flex items-center gap-1.5 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                {revealedTwists ? 'Hide Twists' : 'Reveal Twists'}
              </button>
            </div>

            {revealedTwists ? (
              <div className="pt-2 animate-in fade-in duration-300">
                <p className={`text-zinc-800 dark:text-zinc-200 ${fontSizeClasses}`}>
                  {movie.recap.twistsAndTurns.content}
                </p>
              </div>
            ) : (
              <div
                onClick={() => setRevealedTwists(true)}
                className="p-6 rounded-xl bg-zinc-200/50 dark:bg-zinc-950/50 border border-dashed border-zinc-400 dark:border-zinc-800 text-center cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-950 transition select-none"
              >
                <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Twists, easter eggs, and secret foreshadowing.
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Click here to reveal the hidden plot details.
                </p>
              </div>
            )}
          </div>

          {/* Themes & Symbolism */}
          <div className="space-y-3">
            <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Core Themes & Symbolism
            </h4>
            <div className="grid gap-2">
              {movie.recap.themesAndSymbolism.map((theme, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{theme}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Questions Answered */}
          {movie.recap.keyQuestionsAnswered.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Frequently Asked Plot Questions
              </h4>
              <div className="space-y-3">
                {movie.recap.keyQuestionsAnswered.map((qa, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                  >
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span className="text-amber-500">Q:</span> {qa.question}
                    </h5>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 pl-4 border-l-2 border-amber-500/50">
                      {qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Reviews Section for This Movie */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  Community Reviews & Ratings ({movieReviews.length})
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Insights from verified cinema fans
                </p>
              </div>

              <button
                onClick={() => onWriteReview(movie)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Write a Review
              </button>
            </div>

            {movieReviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500">No reviews yet for this movie. Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {movieReviews.map((rev) => {
                  const isLiked = likedReviewIds.includes(rev.id);
                  return (
                    <div
                      key={rev.id}
                      className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt={rev.userName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700"
                          />
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 block">
                              {rev.userName}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs border border-amber-500/20">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{rev.rating}/10</span>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 mb-1">
                          {rev.headline}
                        </h5>
                        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {rev.content}
                        </p>
                      </div>

                      {rev.favoriteScene && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
                          <strong>Favorite Moment:</strong> {rev.favoriteScene}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
                        <button
                          onClick={() => toggleLikeReview(rev.id)}
                          className={`flex items-center gap-1.5 transition font-semibold ${
                            isLiked ? 'text-amber-500 font-bold' : 'hover:text-zinc-900 dark:hover:text-zinc-200'
                          }`}
                        >
                          👍 <span>Helpful ({rev.likesCount})</span>
                        </button>

                        <button
                          onClick={() => onOpenShareModal(movie)}
                          className="hover:text-amber-500 transition flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share Review
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
