"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getDarkModeFromStorage, setDarkModeInStorage } from "@/lib/dark-mode";

interface DarkModeContextType {
  isDark: boolean;
  toggle: () => void;
}

export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client side after hydration
    const dark = getDarkModeFromStorage();
    setIsDark(dark);
    setDarkModeInStorage(dark);
    setIsHydrated(true);
  }, []);

  const toggle = () => {
    const newState = !isDark;
    setIsDark(newState);
    setDarkModeInStorage(newState);
  };

  // During SSR/prerendering, return children without provider to avoid errors
  if (!isHydrated) {
    return <>{children}</>;
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    // Return default values during SSR
    if (typeof window === 'undefined') {
      return { isDark: false, toggle: () => {} };
    }
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
}
