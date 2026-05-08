import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE_CONFIG, isFirebaseConfigured } from "./config";

// Lazy initialize Firebase to avoid top-level code execution during build
let app: any;
let db: any;
let auth: any;

const getFirebase = () => {
  if (app) return { app, db, auth };
  
  // Validate Firebase configuration
  if (!isFirebaseConfigured()) {
    console.warn(
      "Firebase configuration is incomplete. Check your .env.local file for NEXT_PUBLIC_FIREBASE_* variables."
    );
  }

  if (FIREBASE_CONFIG.projectId && getApps().length === 0) {
    try {
      app = initializeApp(FIREBASE_CONFIG);
      console.log("✓ Firebase initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
    }
  } else if (getApps().length > 0) {
    app = getApps()[0];
  }

  if (app) {
    db = getFirestore(app);
    auth = getAuth(app);
  }
  
  return { app, db, auth };
};

export const getDb = () => getFirebase().db;
export const getAuthInstance = () => getFirebase().auth;

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseReady = () => {
  const { app: firebaseApp } = getFirebase();
  return firebaseApp !== undefined && isFirebaseConfigured();
};
