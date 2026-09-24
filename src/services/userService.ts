import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  FieldValue,
  Timestamp,
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { db, aiStudioDb, defaultDb, handleFirestoreError, OperationType } from '../firebase';
import { UserRole } from '../types';

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt?: Timestamp | FieldValue | string | any;
  updatedAt: Timestamp | FieldValue | string | any;
}

/**
 * Creates or updates the user profile document in Cloud Firestore at `users/{firebaseUser.uid}`.
 * Adheres strictly to the user profile requirements:
 * 1. Document path: users/{firebaseUser.uid}
 * 2. Stored fields: uid, name, email, photoURL, role, createdAt, updatedAt
 * 3. If user already exists, does NOT overwrite createdAt
 * 4. Uses serverTimestamp() for createdAt (new documents) and updatedAt (every update)
 * 5. Uses setDoc(..., { merge: true }) to preserve existing profile fields
 * 6. Never stores passwords or sensitive OAuth tokens
 */
export async function syncUserProfileToFirestore(fbUser: FirebaseUser): Promise<FirestoreUserProfile> {
  if (!fbUser || !fbUser.uid) {
    throw new Error('A valid authenticated Firebase user is required.');
  }

  // Check existing data across target databases (checking primary db and aiStudioDb)
  let existingData: any = null;
  let docExists = false;

  for (const targetDb of [db, aiStudioDb, defaultDb]) {
    try {
      const snap = await getDoc(doc(targetDb, 'users', fbUser.uid));
      if (snap.exists()) {
        existingData = snap.data();
        docExists = true;
        break;
      }
    } catch {
      // Continue to next DB if permissions on unconfigured DB fail
    }
  }

  // Determine user role (maintains admin role for authorized email or previously assigned role)
  const isAdmin =
    fbUser.email?.toLowerCase() === 'nishirajput296@gmail.com' ||
    existingData?.role === 'admin';
  const role: UserRole = isAdmin ? 'admin' : (existingData?.role || 'user');

  // Build profile object containing strictly: uid, name, email, photoURL, role, updatedAt
  const profilePayload: {
    uid: string;
    name: string;
    email: string;
    photoURL: string;
    role: UserRole;
    createdAt?: FieldValue;
    updatedAt: FieldValue;
  } = {
    uid: fbUser.uid,
    name: fbUser.displayName || existingData?.name || existingData?.fullName || 'Resident',
    email: fbUser.email || existingData?.email || '',
    photoURL: fbUser.photoURL || existingData?.photoURL || existingData?.avatar || '',
    role: role,
    updatedAt: serverTimestamp(),
  };

  // If the document does not exist or has no createdAt yet, assign serverTimestamp()
  if (!docExists || !existingData?.createdAt) {
    profilePayload.createdAt = serverTimestamp();
  }

  // Write to available Firestore instances with merge: true
  // Target databases: primary db, aiStudioDb (where deployed rules are active), and defaultDb
  const targetDbs = Array.from(new Set([db, aiStudioDb, defaultDb]));
  let successfulWrites = 0;
  let lastError: any = null;

  for (const targetDb of targetDbs) {
    try {
      const userDocRef = doc(targetDb, 'users', fbUser.uid);
      await setDoc(userDocRef, profilePayload, { merge: true });
      successfulWrites++;
    } catch (writeErr: any) {
      lastError = writeErr;
      // If a database (e.g. (default)) rejects because rules haven't been published in console yet,
      // log debug warning without blocking the app if at least one target succeeds.
      console.warn('Target database write skipped or pending rule publish:', writeErr?.message || writeErr);
    }
  }

  if (successfulWrites === 0 && lastError) {
    console.error(`Error syncing user profile at users/${fbUser.uid}:`, lastError);
    handleFirestoreError(lastError, OperationType.WRITE, `users/${fbUser.uid}`);
    throw lastError;
  }

  return {
    uid: profilePayload.uid,
    name: profilePayload.name,
    email: profilePayload.email,
    photoURL: profilePayload.photoURL,
    role: profilePayload.role,
    createdAt: existingData?.createdAt || profilePayload.createdAt,
    updatedAt: profilePayload.updatedAt,
  };
}

/**
 * Reads a user profile document from `users/{uid}` in Cloud Firestore
 */
export async function getUserProfileFromFirestore(uid: string): Promise<FirestoreUserProfile | null> {
  if (!uid) return null;

  for (const targetDb of [db, aiStudioDb, defaultDb]) {
    try {
      const userDocRef = doc(targetDb, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data() as FirestoreUserProfile;
      }
    } catch {
      // Continue checking next database
    }
  }
  return null;
}
