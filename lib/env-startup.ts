/**
 * Environment Startup Hook
 * This file is imported by layout.tsx to validate environment on application start
 */

// Only run validation on server-side during development
if (typeof window === "undefined" && process.env.NODE_ENV === "development") {
  const { logEnvironmentValidation } = require("./validate-env");
  
  // Run validation on startup
  try {
    logEnvironmentValidation();
  } catch (error) {
    console.error("Failed to validate environment:", error);
  }
}

const environmentStartup = {};

export default environmentStartup;
