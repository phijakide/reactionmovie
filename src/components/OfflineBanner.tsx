import React from 'react';
import { WifiOff, Wifi, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';
import { useWatchlist } from '../context/WatchlistContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, cachedMovieIds, pendingActions, clearPendingActions } = useOffline();
  const { syncState, lastSyncedAt } = useWatchlist();

  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className={`px-4 py-2.5 text-sm transition-all duration-300 ${
      !isOnline
        ? 'bg-amber-600 text-white font-medium shadow-md'
        : 'bg-emerald-700 text-white font-medium'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 animate-pulse flex-shrink-0" />
              <span>
                <strong>Offline Mode Active</strong> — Browsing {cachedMovieIds.length} cached recaps & local watchlists. Changes will sync once reconnected.
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Back online! {pendingActions.length} pending action{pendingActions.length > 1 ? 's' : ''} synced with cloud database.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {!isOnline ? (
            <span className="bg-black/25 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              {cachedMovieIds.length} Recaps Downloaded
            </span>
          ) : (
            <button
              onClick={clearPendingActions}
              className="bg-black/25 hover:bg-black/40 px-2.5 py-1 rounded-full transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
