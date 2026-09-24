/**
 * Firebase Configuration Architecture
 * 
 * This file serves as the drop-in integration bridge for Firebase.
 * To connect your live Firebase project, install firebase (`npm i firebase`)
 * and configure your environment variables:
 * 
 * import { initializeApp } from 'firebase/app';
 * import { getAuth, GoogleAuthProvider } from 'firebase/auth';
 * import { getFirestore } from 'firebase/firestore';
 * 
 * const firebaseConfig = {
 *   apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy...",
 *   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "havenstay.firebaseapp.com",
 *   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "havenstay",
 *   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "havenstay.appspot.com",
 *   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "...",
 *   appId: import.meta.env.VITE_FIREBASE_APP_ID || "..."
 * };
 * 
 * export const app = initializeApp(firebaseConfig);
 * export const auth = getAuth(app);
 * export const db = getFirestore(app);
 * export const googleProvider = new GoogleAuthProvider();
 */

export const isFirebaseConfigured = false;

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  PGS: 'pgs',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  FAVORITES: 'favorites',
} as const;
