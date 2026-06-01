import { create } from 'zustand';
import { useEffect } from 'react';
import type { ThemeMode } from '../types';

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  updateSystemTheme: () => void;
}

function getSystemTheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('theme') as ThemeMode) || 'system',
  isDark: (() => {
    const stored = localStorage.getItem('theme') as ThemeMode;
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return getSystemTheme();
  })(),
  
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    const isDark = theme === 'system' ? getSystemTheme() : theme === 'dark';
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ theme, isDark });
  },
  
  updateSystemTheme: () => {
    if (get().theme === 'system') {
      const isDark = getSystemTheme();
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ isDark });
    }
  }
}));

// Utility hook to run on app mount to handle system theme changes and initial load
export function useThemeInit() {
  const updateSystemTheme = useTheme((state) => state.updateSystemTheme);
  const isDark = useTheme((state) => state.isDark);
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => updateSystemTheme();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [updateSystemTheme]);
}
