import React, { useState } from 'react';
import { X, User, LogOut, Check, Edit2, ShieldCheck, Bookmark, History, MessageSquare, Download, Sparkles, Smartphone, Tv, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useReviews } from '../context/ReviewsContext';
import { useOffline } from '../context/OfflineContext';

interface UserProfileModalProps {
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const { user, userProfile, isGuest, signInWithGoogle, signInAsGuest, signOutUser, updateUserProfile } = useAuth();
  const { watchlist, watchHistory } = useWatchlist();
  const { userReviews } = useReviews();
  const { cachedMovieIds } = useOffline();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || 'Movie Buff');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [favoriteGenresText, setFavoriteGenresText] = useState(
    userProfile?.favoriteGenres?.join(', ') || 'Sci-Fi, Psychological Thriller, Mystery'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const genres = favoriteGenresText.split(',').map((g) => g.trim()).filter(Boolean);
    await updateUserProfile({
      displayName,
      bio,
      favoriteGenres: genres,
    });
    setSavedSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg">User Profile & Account Sync</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <img
            src={user?.photoURL || userProfile?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/50 shadow-md"
          />

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-lg text-zinc-900 dark:text-zinc-100">
                {userProfile?.displayName || user?.displayName || 'Cinephile'}
              </h4>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                user && !isGuest
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
              }`}>
                {user && !isGuest ? 'Cloud Verified' : 'Local Guest'}
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              {user?.email || 'Syncing sessions locally & cloud storage'}
            </p>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 italic pt-1">
              "{userProfile?.bio || 'Streaming enthusiast exploring twists and movie endings.'}"
            </p>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Display Name:
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Bio / Cinema Taste:
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Favorite Genres (comma separated):
              </label>
              <input
                type="text"
                value={favoriteGenresText}
                onChange={(e) => setFavoriteGenresText(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile & Bio
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-base font-black text-amber-500 block">{watchlist.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Watchlist</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-base font-black text-indigo-500 block">{watchHistory.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">History</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-base font-black text-emerald-500 block">{userReviews.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Reviews</span>
          </div>

          <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="text-base font-black text-rose-500 block">{cachedMovieIds.length}</span>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">Offline</span>
          </div>
        </div>

        {/* Multi-Device Synchronized Sessions */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Synchronized Devices Active
          </span>
          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-amber-400" /> Current Session (Browser)
              </span>
              <span className="text-emerald-500 font-semibold">🟢 Active Now</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-indigo-400" /> Living Room Apple TV 4K
              </span>
              <span className="text-zinc-400">Synced 2h ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> iPhone 16 Pro Max
              </span>
              <span className="text-zinc-400">Synced 1d ago</span>
            </div>
          </div>
        </div>

        {/* Authentication Controls */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          {(!user || isGuest) ? (
            <button
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs border border-zinc-300 shadow-md hover:bg-zinc-100 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google for Cloud Multi-Device Sync</span>
            </button>
          ) : (
            <button
              onClick={() => signOutUser()}
              className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-500/10 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 font-bold text-xs border border-zinc-200 dark:border-zinc-800 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          )}

          {isGuest && (
            <p className="text-[11px] text-zinc-500 text-center">
              Currently operating in Guest Mode. Your recaps, watchlists, and history are cached locally in your browser.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
