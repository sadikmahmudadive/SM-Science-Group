export const getDarkModeFromStorage = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem('theme-mode');
  if (stored === 'dark' || stored === 'light') {
    return stored === 'dark';
  }
  
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const setDarkModeInStorage = (isDark: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
