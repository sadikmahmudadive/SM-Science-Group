import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getAuthInstance, getDb } from './firebase';
import { getUserProfile, UserProfile } from './users';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super-admin' | 'teacher' | 'student';
  createdAt: Date;
  lastLogin: Date;
}

export type AdminUser = AppUser;

/**
 * Register a new user with a specific role
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: 'admin' | 'super-admin' | 'teacher' | 'student' = 'admin'
): Promise<{ user: AppUser; idToken: string }> {
  try {
    const auth = getAuthInstance();
    const db = getDb();
    
    if (!auth || !db) {
      throw new Error('Firebase not configured properly');
    }

    // Set persistence to LOCAL
    await setPersistence(auth, browserLocalPersistence);

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name in Firebase Auth
    await updateProfile(user, { displayName });

    // Determine collection
    const collectionName = (role === 'admin' || role === 'super-admin') ? 'admins' : 'users';

    // Store user metadata in Firestore
    await setDoc(doc(db, collectionName, user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      role,
      status: 'active',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });

    const idToken = await user.getIdToken();

    return {
      user: {
        uid: user.uid,
        email: user.email!,
        displayName,
        role,
        createdAt: new Date(),
        lastLogin: new Date()
      },
      idToken
    };
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<{ user: AppUser; idToken: string }> {
  try {
    const auth = getAuthInstance();
    const db = getDb();
    
    if (!auth || !db) {
      throw new Error('Firebase not configured properly');
    }

    await setPersistence(auth, browserLocalPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Use our centralized getUserProfile to check both collections
    const profile = await getUserProfile(user.uid);
    
    if (!profile) {
      throw new Error('User profile not found. Please contact administrator.');
    }

    // Update last login in the correct collection
    const collectionName = (profile.role === 'admin' || profile.role === 'super-admin') ? 'admins' : 'users';
    await updateDoc(doc(db, collectionName, user.uid), {
      lastLogin: serverTimestamp()
    });

    const idToken = await user.getIdToken();

    return {
      user: {
        uid: user.uid,
        email: user.email!,
        displayName: profile.displayName || user.displayName || 'User',
        role: profile.role,
        createdAt: profile.createdAt?.toDate?.() || new Date(),
        lastLogin: new Date()
      },
      idToken
    };
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`);
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<void> {
  try {
    const auth = getAuthInstance();
    if (!auth) throw new Error('Firebase not configured');
    await signOut(auth);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

/**
 * Get current user session from Firebase Auth
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const auth = getAuthInstance();
  if (!auth || !auth.currentUser) return null;

  const profile = await getUserProfile(auth.currentUser.uid);
  if (!profile) return null;

  return {
    uid: auth.currentUser.uid,
    email: auth.currentUser.email!,
    displayName: profile.displayName || auth.currentUser.displayName || 'User',
    role: profile.role,
    createdAt: profile.createdAt?.toDate?.() || new Date(),
    lastLogin: profile.updatedAt?.toDate?.() || new Date()
  };
}

// Keep legacy exports for compatibility during refactor
export { 
  registerUser as registerAdmin, 
  loginUser as loginAdmin, 
  logoutUser as logoutAdmin,
  getCurrentUser as getCurrentAdmin
};

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getAuthInstance();
  if (!auth) throw new Error('Firebase not configured');
  await sendPasswordResetEmail(auth, email);
}

export function storeAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('adminToken', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('adminToken');
  }
}
