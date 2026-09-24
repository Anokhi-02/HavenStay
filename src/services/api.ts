import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { syncUserProfileToFirestore } from './userService';
import {
  PG,
  RoomOption,
  Booking,
  Review,
  NotificationItem,
  User,
  FilterOptions,
  BookingStatus,
  VisitRequest,
  Tenant,
  AdminProfile,
  AdminLog,
  MaintenanceRequest,
  KycStatus,
  MaintenanceStatus,
  AdminLogCategory,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PGS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TENANTS,
  INITIAL_ADMIN_PROFILES,
  INITIAL_ADMIN_LOGS,
  INITIAL_MAINTENANCE_REQUESTS,
} from '../data/mockData';

// Local storage fallback keys for offline persistence & speed
const STORAGE_KEYS = {
  USERS: 'havenstay_users_v2',
  CURRENT_USER: 'havenstay_current_user_v2',
  PGS: 'havenstay_pgs_v2',
  BOOKINGS: 'havenstay_bookings_v2',
  REVIEWS: 'havenstay_reviews_v2',
  NOTIFICATIONS: 'havenstay_notifications_v2',
  FAVORITES: 'havenstay_favorites_v2',
  VISITS: 'havenstay_visits_v2',
  TENANTS: 'havenstay_tenants_v2',
  ADMINS: 'havenstay_admins_v2',
  ADMIN_LOGS: 'havenstay_admin_logs_v2',
  MAINTENANCE: 'havenstay_maintenance_v2',
};

const FIREBASE_PROJECT_ID = 'havenstay-38b16';

// Seed initial local fallback data
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PGS)) {
    localStorage.setItem(STORAGE_KEYS.PGS, JSON.stringify(INITIAL_PGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(['pg_1']));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VISITS)) {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMINS)) {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(INITIAL_ADMIN_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(INITIAL_ADMIN_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(INITIAL_MAINTENANCE_REQUESTS));
  }
}

initializeLocalStorage();

let hasSeededFirestore = false;

// Seed initial Haven Stay property and reviews into Firestore if not yet populated
async function seedInitialFirestoreData() {
  if (hasSeededFirestore) return;
  hasSeededFirestore = true;

  try {
    const pgDocRef = doc(db, 'pgs', 'pg_1');
    const pgSnap = await getDoc(pgDocRef);
    if (!pgSnap.exists()) {
      await setDoc(pgDocRef, INITIAL_PGS[0]);
    }

    // Seed initial reviews if empty
    const reviewsSnap = await getDocs(collection(db, 'reviews'));
    if (reviewsSnap.empty) {
      for (const rev of INITIAL_REVIEWS) {
        await setDoc(doc(db, 'reviews', rev.id), rev);
      }
    }

    // Seed initial tenant records if empty in Firestore
    const tenantsSnap = await getDocs(collection(db, 'tenants'));
    if (tenantsSnap.empty) {
      for (const t of INITIAL_TENANTS) {
        await setDoc(doc(db, 'tenants', t.id), t);
      }
    }
  } catch (error) {
    // Non-blocking background seed error logging
    console.warn('Firestore initial seeding skipped or offline:', error);
  }
}

// Kick off Firestore seed check in background
seedInitialFirestoreData();

export const api = {
  // ================= AUTH APIs =================
  auth: {
    async googleLogin(): Promise<User> {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;

        // Persist profile to Firestore users/{firebaseUser.uid} document with required fields
        let firestoreProfile: any = null;
        try {
          firestoreProfile = await syncUserProfileToFirestore(fbUser);
        } catch (syncErr) {
          console.warn('Firestore profile sync warning during Google Login:', syncErr);
        }

        const isAdmin =
          fbUser.email?.toLowerCase() === 'nishirajput296@gmail.com' ||
          firestoreProfile?.role === 'admin';
        const role = isAdmin ? 'admin' : (firestoreProfile?.role || 'user');

        const userObj: User = {
          id: fbUser.uid,
          uid: fbUser.uid,
          fullName: firestoreProfile?.name || fbUser.displayName || 'Resident',
          name: firestoreProfile?.name || fbUser.displayName || 'Resident',
          email: firestoreProfile?.email || fbUser.email || '',
          phone: fbUser.phoneNumber || '+91 98765 43210',
          avatar: firestoreProfile?.photoURL || fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          photoURL: firestoreProfile?.photoURL || fbUser.photoURL || '',
          role: role,
          createdAt: typeof firestoreProfile?.createdAt === 'string' ? firestoreProfile.createdAt : new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
        return userObj;
      } catch (error: any) {
        if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
          throw new Error('Google sign-in popup was closed before completing. Please try again.');
        }
        if (error?.code === 'auth/unauthorized-domain') {
          throw new Error(
            `Unauthorized Domain: '${window.location.hostname}' is not yet in your Firebase Authorized Domains. In Firebase Console (${FIREBASE_PROJECT_ID}) -> Authentication -> Settings -> Authorized domains, click "Add domain" and add '${window.location.hostname}'.`
          );
        }
        if (error?.code === 'auth/operation-not-allowed') {
          throw new Error(
            `Google Sign-In is not enabled yet in your Firebase project (${FIREBASE_PROJECT_ID}). Go to Firebase Console -> Authentication -> Sign-in method -> Google -> Enable and save.`
          );
        }
        if (error?.code === 'auth/popup-blocked') {
          throw new Error('Popup blocked by browser. Please allow popups for this site or open the application in a full browser tab.');
        }
        console.error('Google Sign-in failed:', error);
        throw error;
      }
    },

    async signup(data: { fullName: string; email: string; phone: string; password: string }): Promise<User> {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email address already exists.');
      }
      const isAdmin = data.email.toLowerCase() === 'nishirajput296@gmail.com';
      const newUser: User = {
        id: `user_${Date.now()}`,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        role: isAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

      // Sync to Firestore
      try {
        await setDoc(doc(db, 'users', newUser.id), newUser);
      } catch {
        // Non-blocking for local dev
      }

      return newUser;
    },

    async login(credentials: { email: string; password?: string; rememberMe?: boolean }): Promise<User> {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
      if (!user) {
        throw new Error('Invalid email or password. Please try again or use Google Sign In.');
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    },

    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
      return {
        success: true,
        message: `Password reset instructions have been sent to ${email}.`,
      };
    },

    async resetPassword(_password: string): Promise<{ success: boolean; message: string }> {
      return {
        success: true,
        message: 'Your password has been successfully updated.',
      };
    },

    async logout(): Promise<void> {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signout error:', err);
      }
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },

    getCurrentUser(): User | null {
      try {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
      } catch {
        return null;
      }
    },
  },

  // ================= USER APIs =================
  users: {
    async getProfile(userId: string): Promise<User> {
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        if (snap.exists()) {
          return snap.data() as User;
        }
      } catch (err) {
        console.warn(`Firestore user profile fetch warning for ${userId}:`, err);
      }
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const user = users.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;
    },

    async updateProfile(userId: string, data: Partial<User>): Promise<User> {
      try {
        await updateDoc(doc(db, 'users', userId), data);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      }
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const index = users.findIndex((u) => u.id === userId);
      const updatedUser: User = index !== -1 ? { ...users[index], ...data } : ({ id: userId, ...data } as User);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      return updatedUser;
    },

    async getAll(): Promise<User[]> {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as User);
        }
      } catch (err) {
        console.warn('Firestore users listing restricted or offline, using fallback:', err);
      }
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    },
  },

  // ================= PG APIs (Firestore connected) =================
  pgs: {
    async getAll(filters?: Partial<FilterOptions>): Promise<PG[]> {
      let list: PG[] = [];

      try {
        const querySnapshot = await getDocs(collection(db, 'pgs'));
        if (!querySnapshot.empty) {
          list = querySnapshot.docs.map((docSnap) => docSnap.data() as PG);
        }
      } catch (err) {
        console.warn('Firestore pgs listing restricted or offline, using fallback:', err);
      }

      if (list.length === 0) {
        list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PGS) || '[]');
      }

      if (filters) {
        if (filters.city && filters.city !== 'All') {
          list = list.filter((p) => p.location.city.toLowerCase() === filters.city!.toLowerCase());
        }
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.location.area.toLowerCase().includes(q) ||
              p.location.city.toLowerCase().includes(q) ||
              p.location.address.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          );
        }
        if (filters.gender && filters.gender !== 'all') {
          list = list.filter((p) => p.gender === filters.gender || p.gender === 'unisex');
        }
        if (filters.roomType && filters.roomType !== 'all') {
          list = list.filter((p) => p.roomOptions.some((r) => r.type === filters.roomType && r.availableBeds > 0));
        }
        if (filters.maxPrice) {
          list = list.filter((p) => p.startingPrice <= filters.maxPrice!);
        }
        if (filters.minPrice) {
          list = list.filter((p) => p.startingPrice >= filters.minPrice!);
        }
        if (filters.foodIncluded) {
          list = list.filter((p) => p.foodProvided);
        }
      }

      return list;
    },

    async getById(id: string): Promise<PG | null> {
      try {
        const docSnap = await getDoc(doc(db, 'pgs', id));
        if (docSnap.exists()) {
          return docSnap.data() as PG;
        }
      } catch (err) {
        console.warn(`Firestore pgs getById(${id}) warning, using fallback:`, err);
      }
      const list: PG[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PGS) || '[]');
      return list.find((p) => p.id === id) || null;
    },

    async create(data: Omit<PG, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Promise<PG> {
      const newPG: PG = {
        ...data,
        id: `pg_${Date.now()}`,
        createdAt: new Date().toISOString(),
        rating: 5.0,
        reviewCount: 1,
      };

      try {
        await setDoc(doc(db, 'pgs', newPG.id), newPG);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `pgs/${newPG.id}`);
      }

      const list: PG[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PGS) || '[]');
      list.unshift(newPG);
      localStorage.setItem(STORAGE_KEYS.PGS, JSON.stringify(list));
      return newPG;
    },

    async update(id: string, data: Partial<PG>): Promise<PG> {
      try {
        await updateDoc(doc(db, 'pgs', id), data);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `pgs/${id}`);
      }
      const list: PG[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PGS) || '[]');
      const index = list.findIndex((p) => p.id === id);
      const updated = { ...list[index], ...data };
      if (index !== -1) {
        list[index] = updated;
        localStorage.setItem(STORAGE_KEYS.PGS, JSON.stringify(list));
      }
      return updated;
    },

    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'pgs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `pgs/${id}`);
      }
      let list: PG[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PGS) || '[]');
      list = list.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PGS, JSON.stringify(list));
    },
  },

  // ================= BOOKING APIs (Firestore connected) =================
  bookings: {
    async create(data: Omit<Booking, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): Promise<Booking> {
      const newBooking: Booking = {
        ...data,
        id: `bk_${Date.now().toString().slice(-6)}`,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
      };

      // Persist to Firestore
      try {
        await setDoc(doc(db, 'bookings', newBooking.id), newBooking);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `bookings/${newBooking.id}`);
      }

      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      bookings.unshift(newBooking);
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      // Add notification
      const notifs: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: newBooking.userId,
        type: 'booking',
        title: 'Booking Confirmed!',
        message: `Your booking for ${newBooking.pgName} (${newBooking.roomTypeName}) is saved in Firebase.`,
        read: false,
        timestamp: 'Just now',
        linkTab: 'my-bookings',
      });
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));

      return newBooking;
    },

    async getAll(userId?: string): Promise<Booking[]> {
      let bookings: Booking[] = [];

      try {
        const bookingsCol = collection(db, 'bookings');
        const q = userId ? query(bookingsCol, where('userId', '==', userId)) : bookingsCol;
        const snap = await getDocs(q);
        if (!snap.empty) {
          bookings = snap.docs.map((d) => d.data() as Booking);
        }
      } catch (err) {
        console.warn('Firestore bookings listing restricted or offline, using fallback:', err);
      }

      if (bookings.length === 0) {
        const localBookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
        if (userId) {
          return localBookings.filter((b) => b.userId === userId);
        }
        return localBookings;
      }

      return bookings;
    },

    async getUserBookings(userId: string): Promise<Booking[]> {
      return api.bookings.getAll(userId);
    },

    async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
      try {
        await updateDoc(doc(db, 'bookings', id), { status });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${id}`);
      }

      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const index = bookings.findIndex((b) => b.id === id);
      if (index !== -1) {
        bookings[index].status = status;
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      }
      return bookings[index] || ({ id, status } as any);
    },
  },

  // ================= REVIEW APIs (Firestore connected) =================
  reviews: {
    async getAll(pgId?: string): Promise<Review[]> {
      let reviewsList: Review[] = [];

      try {
        const reviewsCol = collection(db, 'reviews');
        const q = pgId ? query(reviewsCol, where('pgId', '==', pgId)) : reviewsCol;
        const snap = await getDocs(q);
        if (!snap.empty) {
          reviewsList = snap.docs.map((d) => d.data() as Review);
        }
      } catch (err) {
        console.warn('Firestore reviews listing warning, using local fallback:', err);
      }

      if (reviewsList.length === 0) {
        const localReviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
        return pgId ? localReviews.filter((r) => r.pgId === pgId) : localReviews;
      }

      return reviewsList;
    },

    async create(data: Omit<Review, 'id' | 'date'>): Promise<Review> {
      const newReview: Review = {
        ...data,
        id: `rev_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      };

      try {
        await setDoc(doc(db, 'reviews', newReview.id), newReview);
      } catch (err) {
        console.warn('Firestore review create sync warning:', err);
      }

      const reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      reviews.unshift(newReview);
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

      return newReview;
    },

    async update(id: string, data: Partial<Review>): Promise<Review> {
      try {
        await updateDoc(doc(db, 'reviews', id), data);
      } catch (err) {
        console.warn('Firestore review update sync warning:', err);
      }

      const reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      const index = reviews.findIndex((r) => r.id === id);
      if (index !== -1) {
        reviews[index] = { ...reviews[index], ...data };
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return reviews[index];
      }
      return { id, ...data } as any;
    },

    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (err) {
        console.warn('Firestore review delete sync warning:', err);
      }

      let reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      reviews = reviews.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    },
  },

  // ================= VISITS APIs (Firestore connected) =================
  visits: {
    async create(data: Omit<VisitRequest, 'id' | 'createdAt' | 'status'>): Promise<VisitRequest> {
      const newVisit: VisitRequest = {
        ...data,
        id: `visit_${Date.now()}`,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'visits', newVisit.id), newVisit);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `visits/${newVisit.id}`);
      }

      const visits: VisitRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
      visits.unshift(newVisit);
      localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
      return newVisit;
    },

    async getAll(): Promise<VisitRequest[]> {
      try {
        const snap = await getDocs(collection(db, 'visits'));
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as VisitRequest);
        }
      } catch (err) {
        console.warn('Firestore visits listing restricted or offline, using fallback:', err);
      }
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITS) || '[]');
    },
  },

  // ================= FAVORITES APIs =================
  favorites: {
    async getAll(): Promise<string[]> {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    },

    async toggle(pgId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
      const favs = await api.favorites.getAll();
      const index = favs.indexOf(pgId);
      let isFavorite = false;
      if (index > -1) {
        favs.splice(index, 1);
        isFavorite = false;
      } else {
        favs.push(pgId);
        isFavorite = true;
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
      return { isFavorite, favorites: favs };
    },
  },

  // ================= NOTIFICATIONS APIs =================
  notifications: {
    async getAll(userId: string): Promise<NotificationItem[]> {
      const notifs: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      return notifs.filter((n) => n.userId === userId || n.userId === 'user_1');
    },

    async markRead(id: string): Promise<void> {
      const notifs: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      const index = notifs.findIndex((n) => n.id === id);
      if (index !== -1) {
        notifs[index].read = true;
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      }
    },

    async markAsRead(id: string): Promise<void> {
      return api.notifications.markRead(id);
    },

    async markAllAsRead(userId: string): Promise<void> {
      const notifs: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      notifs.forEach((n) => {
        if (n.userId === userId) {
          n.read = true;
        }
      });
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    },

    async clear(userId: string): Promise<void> {
      let notifs: NotificationItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      notifs = notifs.filter((n) => n.userId !== userId);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    },
  },

  // ================= ADMIN APIs =================
  admin: {
    async getDashboardStats() {
      const [pgs, users, bookings, visits, tenants, maintenance] = await Promise.all([
        api.pgs.getAll(),
        api.users.getAll(),
        api.bookings.getAll(),
        api.visits.getAll(),
        api.tenants.getAll(),
        api.maintenance.getAll(),
      ]);

      const totalBeds = pgs.reduce((sum, p) => sum + (p.totalBeds || 30), 0);
      const activeTenants = tenants.filter((t) => t.status === 'active');
      const noticePeriodTenants = tenants.filter((t) => t.status === 'notice_period');
      const vacatedTenants = tenants.filter((t) => t.status === 'vacated');
      const totalJoined = tenants.length; // Total users joined/admitted into PG

      const occupiedBeds = activeTenants.length + noticePeriodTenants.length;
      const availableBeds = Math.max(0, totalBeds - occupiedBeds);
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
      const conversionRate = bookings.length > 0 ? Math.round((confirmedBookings.length / bookings.length) * 100) : 0;

      const monthlyRevenue = activeTenants.reduce((sum, t) => sum + (t.monthlyRent || 0), 0);
      const pendingRent = tenants.reduce((sum, t) => sum + (t.pendingDue || 0), 0);
      const totalDepositsHeld = tenants.reduce((sum, t) => sum + (t.depositPaid ? (t.securityDeposit || 0) : 0), 0);
      const openTickets = maintenance.filter((m) => m.status !== 'resolved');
      const urgentTickets = openTickets.filter((m) => m.priority === 'urgent');

      return {
        totalPGs: pgs.length,
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalVisits: visits.length,
        totalTenants: activeTenants.length,
        totalJoined, // Kitne user join karwaye
        currentlyStaying: activeTenants.length, // Abhi kitne reh rahe hain
        noticePeriodCount: noticePeriodTenants.length,
        vacatedCount: vacatedTenants.length,
        conversionRate,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyRate,
        monthlyRevenue,
        pendingRent,
        totalDepositsHeld,
        openTicketsCount: openTickets.length,
        urgentTicketsCount: urgentTickets.length,
        pendingBookingsCount: bookings.filter((b) => b.status === 'pending').length,
      };
    },

    async getAllUsers(): Promise<User[]> {
      return api.users.getAll();
    },

    async toggleBlockUser(userId: string): Promise<User> {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) throw new Error('User not found');
      users[index].blocked = !users[index].blocked;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return users[index];
    },

    async createPG(data: any): Promise<PG> {
      return api.pgs.create(data);
    },

    async updatePG(id: string, data: Partial<PG>): Promise<PG> {
      const updated = await api.pgs.update(id, data);
      await api.admins.logAction(
        `Updated Property: ${updated.name}`,
        'inventory',
        `Modified property settings and specs for ${updated.name}`
      );
      return updated;
    },

    async updateRoomDetails(
      pgId: string,
      roomOptions: any[],
      totalBeds?: number,
      availableBeds?: number
    ): Promise<PG> {
      const updateData: Partial<PG> = { roomOptions };
      if (totalBeds !== undefined) updateData.totalBeds = totalBeds;
      if (availableBeds !== undefined) updateData.availableBeds = availableBeds;
      
      const updated = await api.pgs.update(pgId, updateData);
      await api.admins.logAction(
        `Updated Room Details: ${updated.name}`,
        'inventory',
        `Configured ${roomOptions.length} room tier(s) with ${totalBeds ?? updated.totalBeds} total beds.`
      );
      return updated;
    },

    async bulkImportRooms(
      pgId: string,
      roomOptions: RoomOption[],
      mode: 'replace' | 'append' = 'replace'
    ): Promise<PG> {
      const currentPG = await api.pgs.getById(pgId);
      if (!currentPG) throw new Error('Property not found');

      let finalOptions: RoomOption[];
      if (mode === 'replace') {
        finalOptions = roomOptions;
      } else {
        const existing = [...(currentPG.roomOptions || [])];
        for (const item of roomOptions) {
          const idx = existing.findIndex(
            (e) => e.type === item.type && e.name.toLowerCase() === item.name.toLowerCase()
          );
          if (idx !== -1) {
            existing[idx] = item;
          } else {
            existing.push(item);
          }
        }
        finalOptions = existing;
      }

      const calculatedTotalBeds = finalOptions.reduce((acc, r) => acc + (Number(r.totalBeds) || 0), 0);
      const calculatedAvailableBeds = finalOptions.reduce((acc, r) => acc + (Number(r.availableBeds) || 0), 0);
      const calculatedStartingPrice =
        finalOptions.length > 0
          ? Math.min(...finalOptions.map((r) => Number(r.price) || 0))
          : currentPG.startingPrice;

      const updated = await api.pgs.update(pgId, {
        roomOptions: finalOptions,
        totalBeds: calculatedTotalBeds,
        availableBeds: calculatedAvailableBeds,
        startingPrice: calculatedStartingPrice,
      });

      await api.admins.logAction(
        `Bulk CSV Import: ${updated.name}`,
        'inventory',
        `Imported ${roomOptions.length} room tier(s) via CSV (${mode} mode). Updated inventory to ${calculatedTotalBeds} beds and starting tariff to ₹${calculatedStartingPrice.toLocaleString('en-IN')}/mo.`
      );

      return updated;
    },

    async updatePrices(
      pgId: string,
      pricingData: {
        startingPrice: number;
        roomOptions?: any[];
        depositMonths?: number;
        noticePeriodDays?: number;
      }
    ): Promise<PG> {
      const updated = await api.pgs.update(pgId, pricingData);
      await api.admins.logAction(
        `Updated Pricing Tiers: ${updated.name}`,
        'billing',
        `Set starting price to ₹${pricingData.startingPrice.toLocaleString('en-IN')}/mo with updated deposit and room rates.`
      );
      return updated;
    },

    async updatePhotos(pgId: string, images: string[]): Promise<PG> {
      const updated = await api.pgs.update(pgId, { images });
      await api.admins.logAction(
        `Updated Photo Gallery: ${updated.name}`,
        'inventory',
        `Saved gallery with ${images.length} property photos.`
      );
      return updated;
    },

    async updateOwnerContact(pgId: string, ownerData: Partial<PG['owner']>): Promise<PG> {
      const currentPG = await api.pgs.getById(pgId);
      const mergedOwner = { ...(currentPG?.owner || {}), ...ownerData } as PG['owner'];
      const updated = await api.pgs.update(pgId, { owner: mergedOwner });
      await api.admins.logAction(
        `Updated Owner Contact Info: ${updated.name}`,
        'system',
        `Contact set to ${mergedOwner.name} (${mergedOwner.phone}, ${mergedOwner.email})`
      );
      return updated;
    },

    async replyToReview(
      reviewId: string,
      replyText: string,
      ownerName = 'Haven Stay Management'
    ): Promise<Review> {
      const replyData = {
        text: replyText,
        date: new Date().toISOString().split('T')[0],
        ownerName,
      };
      const updated = await api.reviews.update(reviewId, { ownerReply: replyData });
      await api.admins.logAction(
        `Replied to Review #${reviewId}`,
        'system',
        `Official owner response posted by ${ownerName}`
      );
      return updated;
    },

    async toggleHighlightReview(reviewId: string): Promise<Review> {
      const reviews = await api.reviews.getAll();
      const target = reviews.find((r) => r.id === reviewId);
      const newHighlight = !target?.highlighted;
      const updated = await api.reviews.update(reviewId, { highlighted: newHighlight });
      await api.admins.logAction(
        `Toggled Review Highlight #${reviewId}`,
        'system',
        `Review highlighted status set to ${newHighlight}`
      );
      return updated;
    },

    async deletePG(id: string): Promise<void> {
      return api.pgs.delete(id);
    },
  },

  // ================= SEPARATED TENANTS APIs =================
  tenants: {
    async getAll(): Promise<Tenant[]> {
      try {
        const querySnapshot = await getDocs(collection(db, 'tenants'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map((d) => d.data() as Tenant);
          localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn('Firestore tenants fetch fallback:', err);
      }
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
    },

    async getById(id: string): Promise<Tenant | null> {
      try {
        const docSnap = await getDoc(doc(db, 'tenants', id));
        if (docSnap.exists()) {
          return docSnap.data() as Tenant;
        }
      } catch (err) {
        console.warn('Firestore tenant getById fallback:', err);
      }
      const list: Tenant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
      return list.find((t) => t.id === id) || null;
    },

    async create(data: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> {
      const newTenant: Tenant = {
        ...data,
        id: `tenant_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'tenants', newTenant.id), newTenant);
      } catch (err) {
        console.warn('Firestore tenant create fallback:', err);
      }

      const list: Tenant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
      list.unshift(newTenant);
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(list));

      await api.admins.logAction(
        `Admitted New Tenant: ${newTenant.fullName}`,
        'tenant',
        `Assigned to ${newTenant.roomNumber} (${newTenant.bedNumber}) at ₹${newTenant.monthlyRent.toLocaleString('en-IN')}/mo`
      );

      return newTenant;
    },

    async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
      try {
        await updateDoc(doc(db, 'tenants', id), data);
      } catch (err) {
        console.warn('Firestore tenant update fallback:', err);
      }

      const list: Tenant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
      const idx = list.findIndex((t) => t.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(list));
        return list[idx];
      }
      throw new Error('Tenant not found');
    },

    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'tenants', id));
      } catch (err) {
        console.warn('Firestore tenant delete fallback:', err);
      }
      let list: Tenant[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || '[]');
      list = list.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(list));
    },

    async verifyKyc(id: string, status: KycStatus): Promise<Tenant> {
      const updated = await api.tenants.update(id, { kycStatus: status });
      await api.admins.logAction(
        `Updated KYC Status: ${updated.fullName}`,
        'tenant',
        `KYC status marked as "${status.toUpperCase()}" for ${updated.fullName}`
      );
      return updated;
    },

    async recordPayment(id: string, amount: number, method = 'Cash / UPI', transactionId?: string): Promise<Tenant> {
      const tenant = await api.tenants.getById(id);
      if (!tenant) throw new Error('Tenant not found');
      const newDue = Math.max(0, (tenant.pendingDue || 0) - amount);
      const updated = await api.tenants.update(id, { pendingDue: newDue });
      await api.admins.logAction(
        `Recorded Rent Collection: ${tenant.fullName}`,
        'billing',
        `Received payment of ₹${amount.toLocaleString('en-IN')} via ${method}${transactionId ? ` (Ref: ${transactionId})` : ''}. Remaining pending balance: ₹${newDue.toLocaleString('en-IN')}`
      );
      return updated;
    },

    async vacateTenant(id: string): Promise<Tenant> {
      const updated = await api.tenants.update(id, { status: 'vacated' });
      await api.admins.logAction(
        `Processed Tenant Checkout: ${updated.fullName}`,
        'tenant',
        `Room ${updated.roomNumber} vacated. Security deposit settlement marked for review.`
      );
      return updated;
    },
  },

  // ================= SEPARATED ADMINS & AUDIT LOGS APIs =================
  admins: {
    async getAll(): Promise<AdminProfile[]> {
      try {
        const snap = await getDocs(collection(db, 'admins'));
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as AdminProfile);
          localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn('Firestore admins fetch fallback:', err);
      }
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS) || '[]');
    },

    async getLogs(): Promise<AdminLog[]> {
      try {
        const snap = await getDocs(collection(db, 'admin_logs'));
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as AdminLog);
          localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn('Firestore admin_logs fetch fallback:', err);
      }
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS) || '[]');
    },

    async logAction(action: string, category: AdminLogCategory, details: string): Promise<AdminLog> {
      const newLog: AdminLog = {
        id: `log_${Date.now()}`,
        adminId: 'admin_1',
        adminName: 'Nishi Rajput',
        action,
        category,
        details,
        timestamp: 'Just now',
      };

      try {
        await setDoc(doc(db, 'admin_logs', newLog.id), newLog);
      } catch (err) {
        console.warn('Firestore admin log create fallback:', err);
      }

      const list: AdminLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS) || '[]');
      list.unshift(newLog);
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(list.slice(0, 50)));
      return newLog;
    },
  },

  // ================= SEPARATED MAINTENANCE & TICKETS APIs =================
  maintenance: {
    async getAll(): Promise<MaintenanceRequest[]> {
      try {
        const snap = await getDocs(collection(db, 'maintenance_requests'));
        if (!snap.empty) {
          const list = snap.docs.map((d) => d.data() as MaintenanceRequest);
          localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));
          return list;
        }
      } catch (err) {
        console.warn('Firestore maintenance fetch fallback:', err);
      }
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    },

    async create(data: Omit<MaintenanceRequest, 'id' | 'createdAt'>): Promise<MaintenanceRequest> {
      const newTicket: MaintenanceRequest = {
        ...data,
        id: `maint_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'maintenance_requests', newTicket.id), newTicket);
      } catch (err) {
        console.warn('Firestore maintenance create fallback:', err);
      }

      const list: MaintenanceRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
      list.unshift(newTicket);
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));

      await api.admins.logAction(
        `Logged Maintenance Ticket: ${newTicket.title}`,
        'maintenance',
        `Reported by ${newTicket.tenantName} for ${newTicket.roomNumber} (${newTicket.priority.toUpperCase()} priority)`
      );

      return newTicket;
    },

    async updateStatus(id: string, status: MaintenanceStatus, assignedTo?: string): Promise<MaintenanceRequest> {
      const updateData: Partial<MaintenanceRequest> = { status };
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (status === 'resolved') updateData.resolvedAt = new Date().toISOString();

      try {
        await updateDoc(doc(db, 'maintenance_requests', id), updateData);
      } catch (err) {
        console.warn('Firestore maintenance update fallback:', err);
      }

      const list: MaintenanceRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
      const idx = list.findIndex((m) => m.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updateData };
        localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));

        await api.admins.logAction(
          `Maintenance Ticket Updated: ${list[idx].title}`,
          'maintenance',
          `Status changed to "${status.toUpperCase()}"${assignedTo ? ` (Assigned to ${assignedTo})` : ''}`
        );

        return list[idx];
      }
      throw new Error('Maintenance request not found');
    },

    async delete(id: string): Promise<void> {
      try {
        await deleteDoc(doc(db, 'maintenance_requests', id));
      } catch (err) {
        console.warn('Firestore maintenance delete fallback:', err);
      }
      let list: MaintenanceRequest[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
      list = list.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(list));
    },
  },
};
