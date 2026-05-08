/**
 * ENVIRONMENT VARIABLES SETUP GUIDE
 * 
 * This file explains how to configure your .env.local file
 * Copy this as reference when setting up your environment
 */

/*
 * ==========================================
 * FIREBASE SETUP
 * ==========================================
 * 
 * Get these values from your Firebase Console:
 * https://console.firebase.google.com/
 * 
 * 1. Go to Project Settings
 * 2. Under "Your apps" section, click your web app
 * 3. Copy the configuration values
 * 
 * These are PUBLIC variables (NEXT_PUBLIC_ prefix)
 * and will be exposed to browser clients
 * 
 * Required for:
 * - Authentication (login/register)
 * - Firestore database (announcements, assignments, notifications)
 * - File storage
 */
// NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."  // Firebase API Key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="yourapp.firebaseapp.com"
// NEXT_PUBLIC_FIREBASE_PROJECT_ID="yourapp"
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="yourapp.appspot.com"
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
// NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"

/*
 * ==========================================
 * CLOUDINARY SETUP (OPTIONAL)
 * ==========================================
 * 
 * For automatic image optimization and CDN delivery
 * Sign up at: https://cloudinary.com/
 * 
 * PUBLIC variable (NEXT_PUBLIC_ prefix) - safe for browser
 * Server variables are private (no prefix)
 * 
 * Used for:
 * - Automatic image resizing and optimization
 * - WebP format conversion
 * - Image transformations
 */
// NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"  // From Cloudinary Dashboard
// CLOUDINARY_API_KEY="your-api-key"                    // Server-only, not exposed to browser
// CLOUDINARY_API_SECRET="your-api-secret"              // Server-only, not exposed to browser

/*
 * ==========================================
 * APPLICATION CONFIGURATION
 * ==========================================
 */
// APP_URL="http://localhost:3000"               // Development
// NEXT_PUBLIC_APP_URL="http://localhost:3000"   // Public app URL
// NODE_ENV="development"                        // development | production | test

/*
 * ==========================================
 * GEMINI AI SETUP (OPTIONAL)
 * ==========================================
 * 
 * For AI-powered features
 * Get your API key from: https://ai.google.dev/
 * 
 * Used for:
 * - Smart recommendations
 * - Content generation
 * - Analysis features
 */
// GEMINI_API_KEY="your-gemini-api-key"

/*
 * ==========================================
 * EMAIL SERVICE SETUP (OPTIONAL)
 * ==========================================
 * 
 * For sending notifications, announcements, and password resets
 * 
 * Option 1: Gmail
 * - Create an App Password: https://myaccount.google.com/apppasswords
 * - Use your Gmail address and app password below
 * 
 * Option 2: SendGrid
 * - Sign up: https://sendgrid.com/
 * - Get API key from settings
 * 
 * Option 3: Resend
 * - Sign up: https://resend.com/
 * - Get API key from dashboard
 */
// SMTP_HOST="smtp.gmail.com"
// SMTP_PORT="587"
// SMTP_USER="your-email@gmail.com"
// SMTP_PASSWORD="your-app-password"  // Not your regular password!
// EMAIL_FROM="noreply@yourdomain.com"
// EMAIL_FROM_NAME="SM Science Group"
// SENDGRID_API_KEY="sg_..."  // Alternative to SMTP
// RESEND_API_KEY="re_..."    // Alternative to SMTP

/*
 * ==========================================
 * AUTHENTICATION SETUP (OPTIONAL)
 * ==========================================
 * 
 * For session management and NextAuth
 * 
 * Generate secret:
 * - npm i -g openssl
 * - openssl rand -base64 32
 * 
 * Or generate online: https://generate-secret.vercel.app/
 * Must be at least 32 characters for production
 */
// NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
// NEXTAUTH_URL="http://localhost:3000"

/*
 * ==========================================
 * DATABASE SETUP (OPTIONAL)
 * ==========================================
 * 
 * If using PostgreSQL instead of/alongside Firebase
 * Format: postgresql://user:password@host:port/dbname
 */
// DATABASE_URL="postgresql://user:password@localhost:5432/sm_science"

/*
 * ==========================================
 * ADMIN PROVISIONING (OPTIONAL)
 * ==========================================
 * 
 * Auto-create initial admin account on first deployment
 * Use strong, unique password for production
 */
// INITIAL_ADMIN_EMAIL="admin@sm-science-group.com"
// INITIAL_ADMIN_PASSWORD="StrongPassword!123"

/*
 * ==========================================
 * ANALYTICS & MONITORING (OPTIONAL)
 * ==========================================
 */
// NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"  // Google Analytics
// SENTRY_AUTH_TOKEN="your-sentry-token"        // Error tracking
// SENTRY_ORG="your-org"
// SENTRY_PROJECT="your-project"

/*
 * ==========================================
 * FEATURE FLAGS (OPTIONAL)
 * ==========================================
 * 
 * Toggle features on/off via environment
 */
// NEXT_PUBLIC_ENABLE_DARK_MODE="true"
// NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"
// NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS="true"

/*
 * ==========================================
 * SECURITY BEST PRACTICES
 * ==========================================
 * 
 * 1. NEVER commit .env.local to Git
 *    - Already in .gitignore
 * 
 * 2. NEVER share API keys publicly
 *    - Keep CLOUDINARY_API_SECRET, NEXTAUTH_SECRET private
 * 
 * 3. Use different values for each environment
 *    - Development: localhost values
 *    - Production: your-domain.com values
 * 
 * 4. NEXT_PUBLIC_* variables are exposed to browser
 *    - Only put non-sensitive values here
 *    - Put API keys and secrets without NEXT_PUBLIC_ prefix
 * 
 * 5. Rotate secrets regularly
 *    - Generate new NEXTAUTH_SECRET periodically
 *    - Create new Cloudinary API keys if compromised
 * 
 * 6. Monitor API usage
 *    - Set up billing alerts on Firebase, Cloudinary, SendGrid
 *    - Monitor for unexpected API calls
 * 
 * ==========================================
 * ACCESSING CONFIGURATION IN CODE
 * ==========================================
 * 
 * Use the centralized config file for type-safe access:
 * 
 * import { CONFIG, FIREBASE_CONFIG, APP_CONFIG } from '@/lib/config';
 * 
 * // Access Firebase config
 * const { projectId } = CONFIG.firebase;
 * 
 * // Check if features are enabled
 * if (CONFIG.features.darkMode) { ... }
 * 
 * // Get app URL
 * const baseUrl = CONFIG.app.appUrl;
 * 
 * ==========================================
 * TROUBLESHOOTING
 * ==========================================
 * 
 * "Firebase configuration is incomplete"
 * -> Check all NEXT_PUBLIC_FIREBASE_* variables are set in .env.local
 * 
 * "Images not loading"
 * -> Check NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
 * -> Or use image URLs that don't require Cloudinary
 * 
 * "API calls failing"
 * -> Check APP_URL is correct for your environment
 * -> Check CORS settings on your API
 * 
 * "Cannot find module config"
 * -> Make sure lib/config.ts exists
 * -> Run: npm install
 * 
 * "Build fails with .env.local missing"
 * -> Next.js requires .env.local for NEXT_PUBLIC_* variables
 * -> Create .env.local with placeholder values if needed
 */

export const SETUP_GUIDE = "See this file for environment setup instructions";
