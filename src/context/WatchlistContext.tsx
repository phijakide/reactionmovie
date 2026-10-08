import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';
import { WatchlistItem, WatchHistoryItem, WatchlistStatus, WatchPriority } from '../types';
import { MOVIES_DATA } from '../data/moviesData';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  watchHistory: WatchHistoryItem[];
  addToWatchlist: (
    movieId: string,
    status?: WatchlistStatus,
    priority?: WatchPriority,
    notes?: string
  ) => Promise<void>;
  updateWatchlistStatus: (
    movieId: string,
    status: WatchlistStatus,
    priority?: WatchPriority,
    notes?: string
  ) => Promise<void>;
  removeFromWatchlist: (movieId: string) => Promise<void>;
  isInWatchlist: (movieId: string) => boolean;
  getWatchlistEntry: (movieId: string) => WatchlistItem | undefined;
  logWatchHistory: (
    movieId: string,
    completionPercentage?: number,
    rating?: number,
    deviceName?: string
  ) => Promise<void>;
  removeFromHistory: (historyId: string) => Promise<void>;
  historyStats: {
    totalWatched: number;
    totalHours: number;
    completionRateAvg: number;
    topGenres: { genre: string; count: number }[];
  };
  lastSyncedAt: string | null;
  syncState: 'synced' | 'syncing' | 'offline';
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// Initial sample watchlist for rich out-of-the-box experience
const DEFAULT_INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    id: 'inception-2010',
    userId: 'default-user',
    movieId: 'inception-2010',
    movieTitle: 'Inception',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    releaseYear: 2010,
    status: 'favorites',
    priority: 'high',
    notes: 'Must read ending breakdown before Sunday movie night!',
    addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'interstellar-2014',
    userId: 'default-user',
    movieId: 'interstellar-2014',
    movieTitle: 'Interstellar',
    moviePoster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    releaseYear: 2014,
    status: 'completed',
    priority: 'high',
    notes: 'Hans Zimmer score is unreal.',
    addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'oppenheimer-2023',
    userId: 'default-user',
    movieId: 'oppenheimer-2023',
    movieTitle: 'Oppenheimer',
    moviePoster: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    releaseYear: 2023,
    status: 'want_to_watch',
    priority: 'medium',
    notes: 'Need to review historical timeline before watching.',
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_INITIAL_HISTORY: WatchHistoryItem[] = [
  {
    id: 'hist-1',
    userId: 'default-user',
    movieId: 'interstellar-2014',
    movieTitle: 'Interstellar',
    moviePoster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    releaseYear: 2014,
    watchedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completionPercentage: 100,
    deviceName: 'Living Room Apple TV 4K',
    rating: 10,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'hist-2',
    userId: 'default-user',
    movieId: 'parasite-2019',
    movieTitle: 'Parasite',
    moviePoster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    releaseYear: 2019,
    watchedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    completionPercentage: 100,
    deviceName: 'iPhone 15 Pro',
    rating: 9,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'hist-3',
    userId: 'default-user',
    movieId: 'dune-part-two-2024',
    movieTitle: 'Dune: Part Two',
    moviePoster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    releaseYear: 2024,
    watchedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    completionPercentage: 75,
    deviceName: 'MacBook Air M3',
    rating: 9,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isGuest } = useAuth();
  const { isOnline, queueOfflineAction } = useOffline();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinerecap_local_watchlist');
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_WATCHLIST;
    } catch {
      return DEFAULT_INITIAL_WATCHLIST;
    }
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('cinerecap_local_history');
      return saved ? JSON.parse(saved) : DEFAULT_INITIAL_HISTORY;
    } catch {
      return DEFAULT_INITIAL_HISTORY;
    }
  });

  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(new Date().toISOString());

  // Save to local storage as continuous fallback
  useEffect(() => {
    try {
      localStorage.setItem('cinerecap_local_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Watchlist cache storage error', e);
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem('cinerecap_local_history', JSON.stringify(watchHistory));
    } catch (e) {
      console.warn('History cache storage error', e);
    }
  }, [watchHistory]);

  // Sync with Firestore when real user is authenticated
  useEffect(() => {
    if (!user || isGuest || !isOnline) {
      if (!isOnline) setSyncState('offline');
      return;
    }

    setSyncState('syncing');

    // Subscribe to Watchlist
    const watchlistRef = collection(db, 'users', user.uid, 'watchlist');
    const unsubWatchlist = onSnapshot(
      watchlistRef,
      (snapshot) => {
        const items: WatchlistItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as WatchlistItem);
        });
        if (items.length > 0) {
          setWatchlist(items);
        }
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
      },
      (error) => {
        console.warn('Watchlist snapshot error', error);
        setSyncState('offline');
      }
    );

    // Subscribe to History
    const historyRef = collection(db, 'users', user.uid, 'history');
    const unsubHistory = onSnapshot(
      historyRef,
      (snapshot) => {
        const historyItems: WatchHistoryItem[] = [];
        snapshot.forEach((docSnap) => {
          historyItems.push(docSnap.data() as WatchHistoryItem);
        });
        if (historyItems.length > 0) {
          setWatchHistory(historyItems.sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()));
        }
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
      },
      (error) => {
        console.warn('History snapshot error', error);
      }
    );

    return () => {
      unsubWatchlist();
      unsubHistory();
    };
  }, [user, isGuest, isOnline]);

  const addToWatchlist = async (
    movieId: string,
    status: WatchlistStatus = 'want_to_watch',
    priority: WatchPriority = 'medium',
    notes: string = ''
  ) => {
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    if (!movie) return;

    const currentUserId = user?.uid || userProfile?.id || 'guest-user';
    const newItem: WatchlistItem = {
      id: movieId,
      userId: currentUserId,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      releaseYear: movie.year,
      status,
      priority,
      notes,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWatchlist((prev) => {
      const filtered = prev.filter((item) => item.movieId !== movieId);
      return [newItem, ...filtered];
    });

    if (user && !isGuest && isOnline) {
      try {
        setSyncState('syncing');
        const itemDoc = doc(db, 'users', user.uid, 'watchlist', movieId);
        await setDoc(itemDoc, newItem);
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/watchlist/${movieId}`);
      }
    } else if (!isOnline) {
      queueOfflineAction({
        type: 'WATCHLIST_ADD',
        payload: newItem,
      });
      setSyncState('offline');
    }
  };

  const updateWatchlistStatus = async (
    movieId: string,
    status: WatchlistStatus,
    priority?: WatchPriority,
    notes?: string
  ) => {
    const existing = watchlist.find((item) => item.movieId === movieId);
    if (!existing) {
      await addToWatchlist(movieId, status, priority, notes);
      return;
    }

    const updated: WatchlistItem = {
      ...existing,
      status,
      priority: priority !== undefined ? priority : existing.priority,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: new Date().toISOString(),
    };

    setWatchlist((prev) => prev.map((item) => (item.movieId === movieId ? updated : item)));

    if (user && !isGuest && isOnline) {
      try {
        setSyncState('syncing');
        const itemDoc = doc(db, 'users', user.uid, 'watchlist', movieId);
        await setDoc(itemDoc, updated);
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/watchlist/${movieId}`);
      }
    } else if (!isOnline) {
      queueOfflineAction({
        type: 'WATCHLIST_UPDATE',
        payload: updated,
      });
      setSyncState('offline');
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    setWatchlist((prev) => prev.filter((item) => item.movieId !== movieId));

    if (user && !isGuest && isOnline) {
      try {
        setSyncState('syncing');
        const itemDoc = doc(db, 'users', user.uid, 'watchlist', movieId);
        await deleteDoc(itemDoc);
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/watchlist/${movieId}`);
      }
    } else if (!isOnline) {
      queueOfflineAction({
        type: 'WATCHLIST_DELETE',
        payload: { movieId },
      });
      setSyncState('offline');
    }
  };

  const isInWatchlist = (movieId: string) => {
    return watchlist.some((item) => item.movieId === movieId);
  };

  const getWatchlistEntry = (movieId: string) => {
    return watchlist.find((item) => item.movieId === movieId);
  };

  const logWatchHistory = async (
    movieId: string,
    completionPercentage: number = 100,
    rating?: number,
    deviceName?: string
  ) => {
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    if (!movie) return;

    // Detect browser / device for multi-device sync representation
    const defaultDevice =
      deviceName ||
      (typeof navigator !== 'undefined'
        ? navigator.userAgent.includes('Mobile')
          ? 'Mobile Browser'
          : navigator.userAgent.includes('Mac')
          ? 'MacBook Pro'
          : 'Desktop PC'
        : 'Smart Device');

    const historyId = `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const currentUserId = user?.uid || userProfile?.id || 'guest-user';

    const historyEntry: WatchHistoryItem = {
      id: historyId,
      userId: currentUserId,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      releaseYear: movie.year,
      watchedAt: new Date().toISOString(),
      completionPercentage,
      deviceName: defaultDevice,
      rating: rating || movie.imdbRating,
      createdAt: new Date().toISOString(),
    };

    setWatchHistory((prev) => [historyEntry, ...prev]);

    // Also auto-update watchlist status to completed if present
    if (isInWatchlist(movieId)) {
      updateWatchlistStatus(movieId, 'completed');
    }

    if (user && !isGuest && isOnline) {
      try {
        setSyncState('syncing');
        const historyDoc = doc(db, 'users', user.uid, 'history', historyId);
        await setDoc(historyDoc, historyEntry);
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/history/${historyId}`);
      }
    } else if (!isOnline) {
      queueOfflineAction({
        type: 'HISTORY_LOG',
        payload: historyEntry,
      });
      setSyncState('offline');
    }
  };

  const removeFromHistory = async (historyId: string) => {
    setWatchHistory((prev) => prev.filter((item) => item.id !== historyId));

    if (user && !isGuest && isOnline) {
      try {
        const histDoc = doc(db, 'users', user.uid, 'history', historyId);
        await deleteDoc(histDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/history/${historyId}`);
      }
    }
  };

  // Compute viewing statistics for the user
  const historyStats = useMemo(() => {
    const totalWatched = watchHistory.length;
    let totalMinutes = 0;
    const genreCounts: Record<string, number> = {};

    watchHistory.forEach((h) => {
      const movie = MOVIES_DATA.find((m) => m.id === h.movieId);
      if (movie) {
        totalMinutes += (movie.runtimeMinutes * (h.completionPercentage || 100)) / 100;
        movie.genres.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const completionRateAvg =
      totalWatched > 0
        ? Math.round(watchHistory.reduce((acc, h) => acc + h.completionPercentage, 0) / totalWatched)
        : 100;

    return {
      totalWatched,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      completionRateAvg,
      topGenres,
    };
  }, [watchHistory]);

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watchHistory,
        addToWatchlist,
        updateWatchlistStatus,
        removeFromWatchlist,
        isInWatchlist,
        getWatchlistEntry,
        logWatchHistory,
        removeFromHistory,
        historyStats,
        lastSyncedAt,
        syncState,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
