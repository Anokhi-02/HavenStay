import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { syncUserProfileToFirestore } from '../services/userService';
import { INITIAL_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  favorites: string[];
  isFavorite: (pgId: string) => boolean;
  toggleFavorite: (pgId: string) => Promise<void>;
  login: (credentials: { email: string; password?: string; rememberMe?: boolean }) => Promise<void>;
  signup: (data: { fullName: string; email: string; phone: string; password: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  switchUserRole: (role: UserRole) => void;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => api.auth.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Always ensure clean, light appearance without dark black class
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('havenstay_theme', 'light');
    }
  }, []);

  // Firebase auth state subscription with Cloud Firestore profile sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          let profile: any = null;
          try {
            profile = await syncUserProfileToFirestore(fbUser);
          } catch (syncErr) {
            console.warn('onAuthStateChanged profile sync warning:', syncErr);
          }

          const isAdmin =
            fbUser.email?.toLowerCase() === 'nishirajput296@gmail.com' ||
            profile?.role === 'admin';
          const role = isAdmin ? 'admin' : (profile?.role || 'user');

          const userObj: User = {
            id: fbUser.uid,
            uid: fbUser.uid,
            fullName: profile?.name || fbUser.displayName || 'Resident',
            name: profile?.name || fbUser.displayName || 'Resident',
            email: profile?.email || fbUser.email || '',
            phone: fbUser.phoneNumber || '+91 98765 43210',
            avatar: profile?.photoURL || fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            photoURL: profile?.photoURL || fbUser.photoURL || '',
            role: role,
            createdAt: typeof profile?.createdAt === 'string' ? profile.createdAt : new Date().toISOString(),
          };
          setUser(userObj);
          localStorage.setItem('havenstay_current_user_v2', JSON.stringify(userObj));
        }
      } catch (err) {
        console.warn('onAuthStateChanged auth handler warning:', err);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = useCallback(() => {
    // Kept as no-op to maintain interface without turning app black
  }, []);

  // Fetch initial favorites
  useEffect(() => {
    api.favorites.getAll().then((favs) => setFavorites(favs));
  }, [user]);

  const isFavorite = useCallback(
    (pgId: string) => {
      return favorites.includes(pgId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(async (pgId: string) => {
    const res = await api.favorites.toggle(pgId);
    setFavorites(res.favorites);
  }, []);

  const login = async (credentials: { email: string; password?: string; rememberMe?: boolean }) => {
    const loggedInUser = await api.auth.login(credentials);
    setUser(loggedInUser);
  };

  const signup = async (data: { fullName: string; email: string; phone: string; password: string }) => {
    const newUser = await api.auth.signup(data);
    setUser(newUser);
  };

  const googleLogin = async () => {
    const googleUser = await api.auth.googleLogin();
    setUser(googleUser);
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  const switchUserRole = (role: UserRole) => {
    if (role === 'admin') {
      setUser(INITIAL_USERS[1]);
      localStorage.setItem('havenstay_current_user_v2', JSON.stringify(INITIAL_USERS[1]));
    } else {
      setUser(INITIAL_USERS[0]);
      localStorage.setItem('havenstay_current_user_v2', JSON.stringify(INITIAL_USERS[0]));
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = await api.users.updateProfile(user.id, updatedData);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        darkMode,
        toggleDarkMode,
        favorites,
        isFavorite,
        toggleFavorite,
        login,
        signup,
        googleLogin,
        logout,
        switchUserRole,
        updateUser,
        updateProfile: updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
