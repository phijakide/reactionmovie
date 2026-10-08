export type StreamingPlatformId = 
  | 'netflix'
  | 'prime'
  | 'disney'
  | 'max'
  | 'appletv'
  | 'hulu'
  | 'paramount'
  | 'peacock';

export interface StreamingOption {
  platformId: StreamingPlatformId;
  platformName: string;
  type: 'subscription' | 'rent' | 'buy' | 'free_ads';
  quality: '4K UHD' | 'HD' | 'Dolby Vision' | 'HDR10';
  price?: string;
  url: string;
}

export interface RecapSection {
  title: string;
  subtitle?: string;
  content: string;
  isSpoiler?: boolean;
}

export interface MovieRecap {
  elevatorPitch: string;
  readingTimeMinutes: number;
  acts: {
    act1: RecapSection;
    act2: RecapSection;
    act3: RecapSection;
  };
  endingExplained: RecapSection;
  twistsAndTurns: RecapSection;
  themesAndSymbolism: string[];
  keyQuestionsAnswered: { question: string; answer: string }[];
  funTrivia: string[];
}

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtimeMinutes: number;
  contentRating: string;
  genres: string[];
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  tagline: string;
  synopsis: string;
  imdbRating: number;
  rottenTomatoesScore: number;
  metascore: number;
  streamingOptions: StreamingOption[];
  recap: MovieRecap;
  featured?: boolean;
}

export type WatchlistStatus = 'want_to_watch' | 'watching' | 'completed' | 'favorites';
export type WatchPriority = 'low' | 'medium' | 'high';

export interface WatchlistItem {
  id: string; // usually movieId
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  releaseYear: number;
  status: WatchlistStatus;
  priority: WatchPriority;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  releaseYear: number;
  watchedAt: string;
  completionPercentage: number;
  deviceName: string;
  rating?: number;
  createdAt: string;
}

export interface MovieReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  rating: number; // 1-10
  headline: string;
  content: string;
  containsSpoilers: boolean;
  favoriteScene?: string;
  likesCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  favoriteGenres?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedGenre: string;
  selectedPlatform: string;
  sortBy: 'popularity' | 'rating' | 'year' | 'recapTime';
  filterStatus: 'all' | 'watchlist' | 'watched' | 'offline';
}
