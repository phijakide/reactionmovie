import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { OfflineProvider, useOffline } from './context/OfflineContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import { ReviewsProvider, useReviews } from './context/ReviewsContext';

import { Navbar, NavTab } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { StreamingFilterBar } from './components/StreamingFilterBar';
import { MovieCard } from './components/MovieCard';
import { MovieRecapModal } from './components/MovieRecapModal';
import { WatchlistTab } from './components/WatchlistTab';
import { HistoryTab } from './components/HistoryTab';
import { SocialTab } from './components/SocialTab';
import { ShareModal } from './components/ShareModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { UserProfileModal } from './components/UserProfileModal';

import { MOVIES_DATA } from './data/moviesData';
import { Movie, MovieReview } from './types';
import { Film, Play, Star, Sparkles, Clock, Tv, Bookmark, Search } from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'year' | 'recapTime'>('popularity');
  const [quickFilter, setQuickFilter] = useState<'all' | 'watchlist' | 'watched' | 'offline'>('all');

  // Modals state
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [shareMovie, setShareMovie] = useState<Movie | null>(null);
  const [shareReview, setShareReview] = useState<MovieReview | null>(null);
  const [writeReviewMovie, setWriteReviewMovie] = useState<Movie | null>(null);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const { cachedMovieIds } = useOffline();
  const { watchlist, watchHistory } = useWatchlist();

  // Check URL params for direct shared links (e.g., ?movie=inception-2010)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const movieId = params.get('movie');
      if (movieId) {
        const found = MOVIES_DATA.find((m) => m.id === movieId);
        if (found) setSelectedMovie(found);
      }
    }
  }, []);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return MOVIES_DATA.filter((movie) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = movie.title.toLowerCase().includes(q);
        const matchesDirector = movie.director.toLowerCase().includes(q);
        const matchesCast = movie.cast.some((c) => c.toLowerCase().includes(q));
        const matchesGenre = movie.genres.some((g) => g.toLowerCase().includes(q));
        const matchesRecap = movie.recap.elevatorPitch.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDirector && !matchesCast && !matchesGenre && !matchesRecap) {
          return false;
        }
      }

      // Platform filter
      if (selectedPlatform !== 'all') {
        const hasPlatform = movie.streamingOptions.some((s) => s.platformId === selectedPlatform);
        if (!hasPlatform) return false;
      }

      // Genre filter
      if (selectedGenre !== 'All') {
        if (!movie.genres.includes(selectedGenre)) return false;
      }

      // Quick filter
      if (quickFilter === 'watchlist') {
        if (!watchlist.some((w) => w.movieId === movie.id)) return false;
      } else if (quickFilter === 'watched') {
        if (!watchHistory.some((h) => h.movieId === movie.id)) return false;
      } else if (quickFilter === 'offline') {
        if (!cachedMovieIds.includes(movie.id)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.imdbRating - a.imdbRating;
      if (sortBy === 'year') return b.year - a.year;
      if (sortBy === 'recapTime') return a.recap.readingTimeMinutes - b.recap.readingTimeMinutes;
      // Popularity default
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.imdbRating - a.imdbRating;
    });
  }, [searchQuery, selectedPlatform, selectedGenre, sortBy, quickFilter, watchlist, watchHistory, cachedMovieIds]);

  const featuredMovie = MOVIES_DATA[0]; // Inception or first featured

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans pb-20 lg:pb-12">
      <OfflineBanner />

      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: EXPLORE RECAPS */}
        {activeTab === 'explore' && (
          <div className="space-y-8">
            
            {/* Featured Hero Banner (shown when no heavy search filter) */}
            {!searchQuery && selectedGenre === 'All' && selectedPlatform === 'all' && quickFilter === 'all' && (
              <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white border border-zinc-800 shadow-2xl">
                <div className="absolute inset-0">
                  <img
                    src={featuredMovie.backdropUrl}
                    alt={featuredMovie.title}
                    className="w-full h-full object-cover opacity-35 filter blur-xs"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

                <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-zinc-950 font-black text-[11px] uppercase tracking-wider">
                      Featured Recap of the Week
                    </span>
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {featuredMovie.imdbRating} IMDb
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                    {featuredMovie.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-3">
                    {featuredMovie.recap.elevatorPitch}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => setSelectedMovie(featuredMovie)}
                      className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Film className="w-4 h-4" />
                      Read Full Recap & Ending Explained
                    </button>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        ⏱️ {featuredMovie.recap.readingTimeMinutes} min read
                      </span>
                      <span className="bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                        {featuredMovie.genres.slice(0, 2).join(' • ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <StreamingFilterBar
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              selectedGenre={selectedGenre}
              onSelectGenre={setSelectedGenre}
              sortBy={sortBy}
              onSortChange={setSortBy}
              quickFilter={quickFilter}
              onQuickFilterChange={setQuickFilter}
              offlineCount={cachedMovieIds.length}
              watchlistCount={watchlist.length}
            />

            {/* Movie Catalog Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Cinema Recap Database</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {filteredMovies.length} movies
                </span>
              </h2>

              {(searchQuery || selectedPlatform !== 'all' || selectedGenre !== 'All' || quickFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPlatform('all');
                    setSelectedGenre('All');
                    setQuickFilter('all');
                  }}
                  className="text-xs font-semibold text-amber-500 hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Movie Cards Grid */}
            {filteredMovies.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
                <Search className="w-12 h-12 text-zinc-400 mx-auto" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  No movie recaps match your search
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto">
                  Try adjusting your streaming service filter or search for directors, actors, or genres.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPlatform('all');
                    setSelectedGenre('All');
                    setQuickFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelectMovie={setSelectedMovie}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY WATCHLIST */}
        {activeTab === 'watchlist' && (
          <WatchlistTab
            onSelectMovie={setSelectedMovie}
            onExplore={() => setActiveTab('explore')}
          />
        )}

        {/* TAB 3: WATCH HISTORY */}
        {activeTab === 'history' && (
          <HistoryTab onSelectMovie={setSelectedMovie} />
        )}

        {/* TAB 4: SOCIAL REVIEWS & SHARING */}
        {activeTab === 'social' && (
          <SocialTab
            onSelectMovie={setSelectedMovie}
            onOpenShareModal={(movie, review) => {
              setShareMovie(movie);
              setShareReview(review || null);
            }}
            onWriteReview={(movie) => {
              setWriteReviewMovie(movie || null);
              setIsWriteReviewOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-bold">
              <Film className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">CineRecap</span>
            <span>— The Ultimate Movie Recap, Streaming & Social Platform</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>Offline Capable</span>
            <span>•</span>
            <span>Multi-Device Sync</span>
            <span>•</span>
            <span>Spoiler Protection</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedMovie && (
        <MovieRecapModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onOpenShareModal={(movie) => {
            setShareMovie(movie);
            setShareReview(null);
          }}
          onWriteReview={(movie) => {
            setWriteReviewMovie(movie);
            setIsWriteReviewOpen(true);
          }}
        />
      )}

      {shareMovie && (
        <ShareModal
          movie={shareMovie}
          review={shareReview}
          onClose={() => {
            setShareMovie(null);
            setShareReview(null);
          }}
        />
      )}

      {isWriteReviewOpen && (
        <WriteReviewModal
          initialMovie={writeReviewMovie}
          onClose={() => {
            setIsWriteReviewOpen(false);
            setWriteReviewMovie(null);
          }}
        />
      )}

      {isProfileOpen && (
        <UserProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <OfflineProvider>
        <AuthProvider>
          <WatchlistProvider>
            <ReviewsProvider>
              <MainContent />
            </ReviewsProvider>
          </WatchlistProvider>
        </AuthProvider>
      </OfflineProvider>
    </ThemeProvider>
  );
}
