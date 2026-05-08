/**
 * Environment Validation
 * Checks for missing or invalid environment configuration on startup
 * Provides helpful error messages to guide setup
 */

import { CONFIG, isFirebaseConfigured, isCloudinaryConfigured, isAnalyticsEnabled } from "./config";

/**
 * Check for required environment variables
 * Logs warnings for missing optional variables
 */
export function validateEnvironment(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Firebase (usually required)
  if (!isFirebaseConfigured()) {
    warnings.push(
      "⚠️  Firebase is not fully configured. Set NEXT_PUBLIC_FIREBASE_* in .env.local if you need Firestore functionality."
    );
  }

  // Check Cloudinary (optional)
  if (!isCloudinaryConfigured()) {
    warnings.push("ℹ️  Cloudinary is not configured. Images will load without optimization. (Optional)");
  }

  // Check Analytics (optional)
  if (!isAnalyticsEnabled()) {
    warnings.push("ℹ️  Google Analytics is not configured. (Optional)");
  }

  // Check NODE_ENV
  if (!CONFIG.app.nodeEnv) {
    errors.push("❌ NODE_ENV is not set. Please set NODE_ENV in .env.local.");
  }

  // Check APP_URL
  if (!CONFIG.app.appUrl) {
    errors.push("❌ APP_URL is not set. Please set APP_URL in .env.local.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Log environment validation results
 */
export function logEnvironmentValidation(): void {
  const validation = validateEnvironment();

  console.log("\n" + "=".repeat(60));
  console.log("📋 ENVIRONMENT CONFIGURATION CHECK");
  console.log("=".repeat(60));

  if (validation.errors.length > 0) {
    console.error("\n❌ ERRORS:");
    validation.errors.forEach((error) => console.error(error));
  }

  if (validation.warnings.length > 0) {
    console.warn("\n⚠️  WARNINGS:");
    validation.warnings.forEach((warning) => console.warn(warning));
  }

  if (validation.isValid && validation.warnings.length === 0) {
    console.log("\n✅ All required environment variables are configured correctly!");
  }

  console.log("\n📊 CURRENT CONFIGURATION:");
  console.log(`   Environment: ${CONFIG.app.nodeEnv}`);
  console.log(`   App URL: ${CONFIG.app.appUrl}`);
  console.log(`   Firebase: ${isFirebaseConfigured() ? "✓ Configured" : "✗ Not configured"}`);
  console.log(`   Cloudinary: ${isCloudinaryConfigured() ? "✓ Configured" : "✗ Not configured"}`);
  console.log(`   Dark Mode: ${CONFIG.features.darkMode ? "✓ Enabled" : "✗ Disabled"}`);
  console.log(`   Analytics: ${isAnalyticsEnabled() ? "✓ Enabled" : "✗ Disabled"}`);
  console.log("=".repeat(60) + "\n");
}

/**
 * Validate environment and throw on errors (for critical validations)
 */
export function validateEnvironmentOrThrow(): void {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    throw new Error(
      `Environment validation failed:\n${validation.errors.join("\n")}\n\nPlease check your .env.local file.`
    );
  }
}

/**
 * Get human-readable configuration summary
 */
export function getConfigurationSummary(): string {
  const firebaseStatus = isFirebaseConfigured() ? "✓" : "✗";
  const cloudinaryStatus = isCloudinaryConfigured() ? "✓" : "✗";
  const analyticsStatus = isAnalyticsEnabled() ? "✓" : "✗";

  return `
Configuration Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment:     ${CONFIG.app.nodeEnv}
App URL:         ${CONFIG.app.appUrl}
Firebase:        ${firebaseStatus}
Cloudinary:      ${cloudinaryStatus}
Analytics:       ${analyticsStatus}
Dark Mode:       ${CONFIG.features.darkMode ? "✓" : "✗"}
Notifications:   ${CONFIG.features.notifications ? "✓" : "✗"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;
}

const validationHelpers = {
  validateEnvironment,
  logEnvironmentValidation,
  validateEnvironmentOrThrow,
  getConfigurationSummary,
};

export default validationHelpers;
