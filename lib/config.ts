/**
 * Application Configuration
 * Centralized environment variable management
 * All NEXT_PUBLIC_* variables are safe for browser access
 * Other variables are server-only and will cause errors if accessed in browser
 */

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

export const isFirebaseConfigured = () => {
  return Object.values(FIREBASE_CONFIG).every((value) => value && value.length > 0);
};

// ==========================================
// CLOUDINARY CONFIGURATION
// ==========================================
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
} as const;

export const isCloudinaryConfigured = () => {
  return CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.cloudName.length > 0;
};

// ==========================================
// APPLICATION CONFIGURATION
// ==========================================
export const APP_CONFIG = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// ==========================================
// FEATURE FLAGS (Client-side)
// ==========================================
export const FEATURES = {
  darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== "false", // true by default
  notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false", // true by default
  announcements: process.env.NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS !== "false", // true by default
  analytics: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? true : false,
} as const;

// ==========================================
// GOOGLE ANALYTICS (Client-side)
// ==========================================
export const ANALYTICS_CONFIG = {
  gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;

export const isAnalyticsEnabled = () => {
  return ANALYTICS_CONFIG.gaId && ANALYTICS_CONFIG.gaId.length > 0;
};

// ==========================================
// VALIDATION UTILITIES
// ==========================================

/**
 * Get a required environment variable or throw error
 * @param key - Environment variable key
 * @param message - Optional custom error message
 */
export function getRequiredEnv(key: string, message?: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      message || `Missing required environment variable: ${key}. Please check your .env.local file.`
    );
  }
  return value;
}

/**
 * Get an optional environment variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 */
export function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

// ==========================================
// EXPORT ALL CONFIG OBJECTS
// ==========================================
export const CONFIG = {
  firebase: FIREBASE_CONFIG,
  cloudinary: CLOUDINARY_CONFIG,
  app: APP_CONFIG,
  features: FEATURES,
  analytics: ANALYTICS_CONFIG,
} as const;

export default CONFIG;
