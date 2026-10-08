import React, { createContext, useContext, useEffect, useState } from 'react';

interface OfflineAction {
  id: string;
  type: 'WATCHLIST_ADD' | 'WATCHLIST_UPDATE' | 'WATCHLIST_DELETE' | 'HISTORY_LOG' | 'REVIEW_ADD';
  payload: any;
  timestamp: string;
}

interface OfflineContextType {
  isOnline: boolean;
  cachedMovieIds: string[];
  saveMovieForOffline: (movieId: string) => void;
  removeMovieFromOffline: (movieId: string) => void;
  isMovieSavedOffline: (movieId: string) => boolean;
  pendingActions: OfflineAction[];
  queueOfflineAction: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => void;
  clearPendingActions: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [cachedMovieIds, setCachedMovieIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cinerecap_offline_movies');
      return stored ? JSON.parse(stored) : ['inception-2010', 'interstellar-2014']; // pre-cache 2 favorites for immediate offline test
    } catch {
      return ['inception-2010'];
    }
  });

  const [pendingActions, setPendingActions] = useState<OfflineAction[]>(() => {
    try {
      const stored = localStorage.getItem('cinerecap_pending_offline_actions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cinerecap_offline_movies', JSON.stringify(cachedMovieIds));
    } catch (e) {
      console.warn('Storage quota exceeded for offline movies', e);
    }
  }, [cachedMovieIds]);

  useEffect(() => {
    try {
      localStorage.setItem('cinerecap_pending_offline_actions', JSON.stringify(pendingActions));
    } catch (e) {
      console.warn('Storage quota error', e);
    }
  }, [pendingActions]);

  const saveMovieForOffline = (movieId: string) => {
    setCachedMovieIds(prev => (prev.includes(movieId) ? prev : [...prev, movieId]));
  };

  const removeMovieFromOffline = (movieId: string) => {
    setCachedMovieIds(prev => prev.filter(id => id !== movieId));
  };

  const isMovieSavedOffline = (movieId: string) => {
    return cachedMovieIds.includes(movieId);
  };

  const queueOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setPendingActions(prev => [...prev, newAction]);
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('cinerecap_pending_offline_actions');
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        cachedMovieIds,
        saveMovieForOffline,
        removeMovieFromOffline,
        isMovieSavedOffline,
        pendingActions,
        queueOfflineAction,
        clearPendingActions,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
