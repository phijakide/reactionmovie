import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (customName?: string) => void;
  signOutUser: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('cinerecap_is_guest') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize or fetch user profile from Firestore or local storage
  const syncProfile = async (currentUser: User) => {
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      } else {
        const initialProfile: UserProfile = {
          id: currentUser.uid,
          email: currentUser.email || undefined,
          displayName: currentUser.displayName || 'Movie Buff',
          photoURL: currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          bio: 'Passionate cinephile dissecting plot twists, endings, and film direction.',
          favoriteGenres: ['Sci-Fi', 'Psychological Thriller', 'Mystery'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (err) {
      console.warn('Could not sync profile to Firestore, falling back to local state:', err);
      // Local fallback
      setUserProfile({
        id: currentUser.uid,
        email: currentUser.email || undefined,
        displayName: currentUser.displayName || 'Movie Buff',
        photoURL: currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        bio: 'Passionate cinephile dissecting plot twists, endings, and film direction.',
        favoriteGenres: ['Sci-Fi', 'Psychological Thriller', 'Mystery'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    // If guest mode was previously saved
    if (isGuest && !user) {
      const storedGuestProfile = localStorage.getItem('cinerecap_guest_profile');
      if (storedGuestProfile) {
        setUserProfile(JSON.parse(storedGuestProfile));
      } else {
        const defaultGuest: UserProfile = {
          id: 'guest-user-session',
          displayName: 'Cinema Explorer',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          bio: 'Streaming enthusiast & movie recap connoisseur.',
          favoriteGenres: ['Sci-Fi', 'Action', 'Mystery'],
          createdAt: new Date().toISOString(),
        };
        setUserProfile(defaultGuest);
        localStorage.setItem('cinerecap_guest_profile', JSON.stringify(defaultGuest));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuest(false);
        localStorage.removeItem('cinerecap_is_guest');
        await syncProfile(currentUser);
      } else if (!isGuest) {
        // Auto-initialize demo guest account on first load so users get immediate full rich experience!
        signInAsGuest('Movie Critic');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
      localStorage.removeItem('cinerecap_is_guest');
      if (res.user) {
        await syncProfile(res.user);
      }
    } catch (error) {
      console.error('Google Sign-In failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = (customName?: string) => {
    setIsGuest(true);
    localStorage.setItem('cinerecap_is_guest', 'true');
    const guestUser: UserProfile = {
      id: 'guest-user-session',
      displayName: customName || 'Movie Critic',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      bio: 'Lover of cerebral storytelling, plot twists, and multi-threaded cinema.',
      favoriteGenres: ['Sci-Fi', 'Psychological Thriller', 'Action'],
      createdAt: new Date().toISOString(),
    };
    setUserProfile(guestUser);
    localStorage.setItem('cinerecap_guest_profile', JSON.stringify(guestUser));
    setLoading(false);
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      if (!isGuest) {
        await fbSignOut(auth);
      }
      setIsGuest(false);
      localStorage.removeItem('cinerecap_is_guest');
      localStorage.removeItem('cinerecap_guest_profile');
      setUser(null);
      setUserProfile(null);
      // Re-sign in as guest cleanly
      signInAsGuest('Guest User');
    } catch (err) {
      console.error('Sign out error', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
    setUserProfile(updated);

    if (isGuest) {
      localStorage.setItem('cinerecap_guest_profile', JSON.stringify(updated));
      return;
    }

    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, updated, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isGuest,
        signInWithGoogle,
        signInAsGuest,
        signOutUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
