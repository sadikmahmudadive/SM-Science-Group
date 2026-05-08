"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get initial state from localStorage
    const stored = localStorage.getItem('theme-mode');
    setIsDark(stored === 'dark');
  }, []);

  const toggle = () => {
    const newState = !isDark;
    setIsDark(newState);
    localStorage.setItem('theme-mode', newState ? 'dark' : 'light');
    if (newState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <button
        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors"
        aria-label="Toggle dark mode"
        disabled
      >
        <Moon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
