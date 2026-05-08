import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuthInstance, getDb } from './firebase';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super-admin';
  createdAt: Date;
  lastLogin: Date;
}

/**
 * Register a new admin user
 */
export async function registerAdmin(
  email: string,
  password: string,
  displayName: string,
  role: 'admin' | 'super-admin' = 'admin'
): Promise<{ user: AdminUser; idToken: string }> {
  try {
    const auth = getAuthInstance();
    const db = getDb();
    
    if (!auth || !db) {
      throw new Error('Firebase not configured properly');
    }

    // Set persistence to LOCAL (stay logged in)
    await setPersistence(auth, browserLocalPersistence);

    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Store admin metadata in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      role,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: 'active'
    });

    // Get ID token for session
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
 * Login admin user with email and password
 */
export async function loginAdmin(email: string, password: string): Promise<{ user: AdminUser; idToken: string }> {
  try {
    const auth = getAuthInstance();
    const db = getDb();
    
    if (!auth || !db) {
      throw new Error('Firebase not configured properly');
    }

    // Set persistence to LOCAL
    await setPersistence(auth, browserLocalPersistence);

    // Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Try to fetch admin metadata from Firestore
    let adminData: any = null;
    try {
      const adminDocSnap = await getDoc(doc(db, 'admins', user.uid));
      adminData = adminDocSnap.data();
    } catch (err) {
      // If we can't fetch admin data, that's okay during development
      console.warn('Could not fetch admin data:', err);
    }

    // Update last login
    try {
      await setDoc(doc(db, 'admins', user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not update last login:', err);
    }

    // Get ID token for session
    const idToken = await user.getIdToken();

    return {
      user: {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || adminData?.displayName || 'Admin',
        role: adminData?.role || 'admin',
        createdAt: adminData?.createdAt?.toDate?.() || new Date(),
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
export async function logoutAdmin(): Promise<void> {
  try {
    const auth = getAuthInstance();
    if (!auth) {
      throw new Error('Firebase not configured');
    }
    await signOut(auth);
    // Clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  } catch (error: any) {
    throw new Error(`Logout failed: ${error.message}`);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    const auth = getAuthInstance();
    if (!auth) {
      throw new Error('Firebase not configured');
    }
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(`Password reset failed: ${error.message}`);
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const auth = getAuthInstance();
    const db = getDb();
    
    if (!auth || !db) {
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    // Fetch from Firestore
    const adminDocSnap = await getDoc(doc(db, 'admins', user.uid));
    
    if (!adminDocSnap.exists()) {
      return null;
    }

    const adminData = adminDocSnap.data();

    return {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || adminData.displayName || 'Admin',
      role: adminData.role || 'admin',
      createdAt: adminData.createdAt?.toDate?.() || new Date(),
      lastLogin: adminData.lastLogin?.toDate?.() || new Date()
    };
  } catch {
    return null;
  }
}

/**
 * Store auth token in session storage
 */
export function storeAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('adminToken', token);
  }
}

/**
 * Retrieve auth token from session storage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('adminToken');
  }
  return null;
}

/**
 * Clear auth token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('adminToken');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}
