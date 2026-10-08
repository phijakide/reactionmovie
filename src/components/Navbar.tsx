import React from 'react';
import { Film, Search, Bookmark, History, Users, Sun, Moon, Cloud, CloudOff, RefreshCw, UserCheck, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useOffline } from '../context/OfflineContext';

export type NavTab = 'explore' | 'watchlist' | 'history' | 'social';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenProfile,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, userProfile, isGuest, signInWithGoogle } = useAuth();
  const { watchlist, watchHistory, syncState } = useWatchlist();
  const { isOnline } = useOffline();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 dark:bg-zinc-950/90 bg-white/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onTabChange('explore')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                CineRecap
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  PRO
                </span>
              </span>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400 hidden sm:block">Recaps • Streams • Watchlists</p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <input
                type="text"
                placeholder="Search movies, directors, actors, endings..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onTabChange('explore')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'explore'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Film className="w-4 h-4" />
              Recaps
            </button>

            <button
              onClick={() => onTabChange('watchlist')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 relative ${
                activeTab === 'watchlist'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Watchlist
              {watchlist.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950">
                  {watchlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <History className="w-4 h-4" />
              History
              {watchHistory.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-700 text-zinc-200">
                  {watchHistory.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('social')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'social'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Reviews & Social
            </button>
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Multi-Device Cloud Sync Status Indicator */}
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60"
              title={
                !isOnline
                  ? 'Offline Mode - Changes saved locally'
                  : syncState === 'synced'
                  ? 'Synced with Cloud across all devices'
                  : 'Syncing changes...'
              }
            >
              {!isOnline ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Offline</span>
                </>
              ) : syncState === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span className="text-indigo-400">Syncing...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Multi-Sync</span>
                </>
              )}
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition border border-zinc-200 dark:border-zinc-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* User Profile Avatar / Sign In */}
            {user ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:border-amber-500/40 transition group"
              >
                <img
                  src={user.photoURL || userProfile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt="avatar"
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-500/50"
                />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-400 transition hidden sm:inline max-w-[100px] truncate">
                  {user.displayName?.split(' ')[0] || userProfile?.displayName || 'User'}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isGuest ? 'Profile (Guest)' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search recaps, twists, endings..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 dark:bg-zinc-950/95 bg-white/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 shadow-2xl">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onTabChange('explore')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'explore'
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Film className="w-5 h-5" />
            <span>Recaps</span>
          </button>

          <button
            onClick={() => onTabChange('watchlist')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-xs font-semibold relative ${
              activeTab === 'watchlist'
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span>Watchlist</span>
            {watchlist.length > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-black flex items-center justify-center">
                {watchlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'history'
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>

          <button
            onClick={() => onTabChange('social')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'social'
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Reviews</span>
          </button>
        </div>
      </div>
    </header>
  );
};
