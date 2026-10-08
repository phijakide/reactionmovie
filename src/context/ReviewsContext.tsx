import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { useOffline } from './OfflineContext';
import { MovieReview } from '../types';
import { INITIAL_REVIEWS } from '../data/initialReviews';

interface ReviewsContextType {
  reviews: MovieReview[];
  userReviews: MovieReview[];
  likedReviewIds: string[];
  addReview: (
    movieId: string,
    rating: number,
    headline: string,
    content: string,
    containsSpoilers: boolean,
    favoriteScene?: string
  ) => Promise<void>;
  updateReview: (
    reviewId: string,
    data: { rating: number; headline: string; content: string; containsSpoilers: boolean; favoriteScene?: string }
  ) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  toggleLikeReview: (reviewId: string) => Promise<void>;
  getReviewsForMovie: (movieId: string) => MovieReview[];
  hasUserReviewedMovie: (movieId: string) => boolean;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isGuest } = useAuth();
  const { isOnline, queueOfflineAction } = useOffline();

  const [reviews, setReviews] = useState<MovieReview[]>(() => {
    try {
      const saved = localStorage.getItem('cinerecap_local_reviews');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [likedReviewIds, setLikedReviewIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cinerecap_liked_reviews');
      return saved ? JSON.parse(saved) : ['rev-inception-1'];
    } catch {
      return ['rev-inception-1'];
    }
  });

  // Save to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem('cinerecap_local_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.warn('Reviews storage cache error', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem('cinerecap_liked_reviews', JSON.stringify(likedReviewIds));
    } catch (e) {
      console.warn('Liked reviews storage cache error', e);
    }
  }, [likedReviewIds]);

  // Real-time Firestore sync
  useEffect(() => {
    if (!isOnline) return;

    const reviewsRef = collection(db, 'reviews');
    const unsub = onSnapshot(
      reviewsRef,
      (snapshot) => {
        const fetched: MovieReview[] = [];
        snapshot.forEach((d) => {
          fetched.push(d.data() as MovieReview);
        });

        if (fetched.length > 0) {
          // Merge with initial reviews to preserve richness
          const mergedMap = new Map<string, MovieReview>();
          INITIAL_REVIEWS.forEach((r) => mergedMap.set(r.id, r));
          fetched.forEach((r) => mergedMap.set(r.id, r));
          setReviews(Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      },
      (error) => {
        console.warn('Reviews onSnapshot fallback to local state', error);
      }
    );

    return () => unsub();
  }, [isOnline]);

  const addReview = async (
    movieId: string,
    rating: number,
    headline: string,
    content: string,
    containsSpoilers: boolean,
    favoriteScene?: string
  ) => {
    const currentUserId = user?.uid || userProfile?.id || 'guest-user';
    const currentUserName = userProfile?.displayName || user?.displayName || 'Cinephile';
    const currentUserAvatar = userProfile?.photoURL || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

    const reviewId = `rev-${movieId}-${Date.now().toString(36)}`;

    // Find movie details
    const { MOVIES_DATA } = await import('../data/moviesData');
    const movie = MOVIES_DATA.find((m) => m.id === movieId);
    const movieTitle = movie ? movie.title : 'Movie';
    const moviePoster = movie ? movie.posterUrl : '';

    const newReview: MovieReview = {
      id: reviewId,
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      movieId,
      movieTitle,
      moviePoster,
      rating,
      headline,
      content,
      containsSpoilers,
      favoriteScene,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    if (user && !isGuest && isOnline) {
      try {
        const reviewDoc = doc(db, 'reviews', reviewId);
        await setDoc(reviewDoc, newReview);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `reviews/${reviewId}`);
      }
    } else if (!isOnline) {
      queueOfflineAction({
        type: 'REVIEW_ADD',
        payload: newReview,
      });
    }
  };

  const updateReview = async (
    reviewId: string,
    data: { rating: number; headline: string; content: string; containsSpoilers: boolean; favoriteScene?: string }
  ) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );

    if (user && !isGuest && isOnline) {
      try {
        const reviewDoc = doc(db, 'reviews', reviewId);
        await updateDoc(reviewDoc, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `reviews/${reviewId}`);
      }
    }
  };

  const deleteReview = async (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));

    if (user && !isGuest && isOnline) {
      try {
        const reviewDoc = doc(db, 'reviews', reviewId);
        await deleteDoc(reviewDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `reviews/${reviewId}`);
      }
    }
  };

  const toggleLikeReview = async (reviewId: string) => {
    const isLiked = likedReviewIds.includes(reviewId);
    const updatedLiked = isLiked
      ? likedReviewIds.filter((id) => id !== reviewId)
      : [...likedReviewIds, reviewId];
    setLikedReviewIds(updatedLiked);

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            likesCount: Math.max(0, r.likesCount + (isLiked ? -1 : 1)),
          };
        }
        return r;
      })
    );

    if (user && !isGuest && isOnline) {
      try {
        const reviewDoc = doc(db, 'reviews', reviewId);
        await updateDoc(reviewDoc, {
          likesCount: increment(isLiked ? -1 : 1),
        });
      } catch (err) {
        // Non-blocking like increment
        console.warn('Like update error', err);
      }
    }
  };

  const getReviewsForMovie = (movieId: string) => {
    return reviews.filter((r) => r.movieId === movieId);
  };

  const currentUserId = user?.uid || userProfile?.id;
  const userReviews = reviews.filter((r) => r.userId === currentUserId);

  const hasUserReviewedMovie = (movieId: string) => {
    return userReviews.some((r) => r.movieId === movieId);
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        userReviews,
        likedReviewIds,
        addReview,
        updateReview,
        deleteReview,
        toggleLikeReview,
        getReviewsForMovie,
        hasUserReviewedMovie,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};
