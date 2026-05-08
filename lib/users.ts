import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { getDb } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin' | 'super-admin';
  status: 'active' | 'pending';
  systemId: string;
  createdAt: any;
  updatedAt: any;
  phone?: string;
  address?: string;
  bio?: string;
  photoUrl?: string;
}

/**
 * Fetch a user's profile regardless of whether they are an admin or a student/teacher
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  // Try fetching from admins collection first
  const adminDoc = await getDoc(doc(db, 'admins', uid));
  if (adminDoc.exists()) {
    return {
      uid: adminDoc.id,
      ...adminDoc.data()
    } as UserProfile;
  }

  // Try fetching from users collection using UID as ID
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return {
      uid: userDoc.id,
      ...userDoc.data()
    } as UserProfile;
  }

  return null;
}

/**
 * Update any user profile in either collection
 */
export async function updateAnyUserProfile(uid: string, updates: Partial<UserProfile>) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  const adminDoc = await getDoc(doc(db, 'admins', uid));
  const userRef = adminDoc.exists()
    ? doc(db, 'admins', uid)
    : doc(db, 'users', uid);

  await updateDoc(userRef, {
    ...sanitizedUpdates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Check if an email is pre-approved by the admin
 * Returns the profile if approved, otherwise null
 */
export async function checkEmailApproval(email: string): Promise<UserProfile | null> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  return {
    uid: userDoc.id, // This might be the email for pending users
    ...userDoc.data()
  } as UserProfile;
}

/**
 * Create a new user profile in Firestore
 * For pre-approved users, we use email as the document ID initially
 */
export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  // Admin creates the profile. We use email as ID so checkEmailApproval works.
  const userRef = doc(db, 'users', profile.email);
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Transition a pending profile (email-based ID) to an active profile (UID-based ID)
 * Call this after successful registration
 */
export async function activateUserProfile(email: string, uid: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const emailRef = doc(db, 'users', email);
  const emailSnap = await getDoc(emailRef);

  if (emailSnap.exists()) {
    const data = emailSnap.data();
    // Create new doc with UID
    await setDoc(doc(db, 'users', uid), {
      ...data,
      uid: uid,
      status: 'active',
      updatedAt: serverTimestamp(),
    });
    // Delete the email-based document
    await deleteDoc(emailRef);
  }
}

/**
 * Fetch all users of a specific role
 */
export async function getUsers(role?: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const usersRef = collection(db, 'users');
  const q = role ? query(usersRef, where('role', '==', role)) : query(usersRef);

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  })) as UserProfile[];
}

/**
 * Subscribe to all users in real-time
 */
export function subscribeToUsers(callback: (users: UserProfile[]) => void) {
  const db = getDb();
  if (!db) {
    console.error('Firebase DB not ready for subscription');
    return () => {};
  }

  try {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      callback(users);
    }, (error) => {
      console.error('Firestore subscription error:', error);
    });
  } catch (e) {
    console.error('Failed to initialize user subscription:', e);
    return () => {};
  }
}

/**
 * Update user profile (e.g., change status or role)
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  return updateAnyUserProfile(uid, updates);
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(uid: string) {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const adminDoc = await getDoc(doc(db, 'admins', uid));
  const userRef = adminDoc.exists()
    ? doc(db, 'admins', uid)
    : doc(db, 'users', uid);

  await deleteDoc(userRef);
}

/**
 * Update user profile photo URL
 */
export async function uploadUserPhoto(uid: string, photoUrl: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('Firebase not configured');

  const adminDoc = await getDoc(doc(db, 'admins', uid));
  const userRef = adminDoc.exists()
    ? doc(db, 'admins', uid)
    : doc(db, 'users', uid);

  await updateDoc(userRef, {
    photoUrl: photoUrl,
    updatedAt: serverTimestamp(),
  });
}
