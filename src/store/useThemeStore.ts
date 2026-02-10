import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'dark' | 'light';

// Beautiful, soothing color palettes
export const colors = {
  dark: {
    // Backgrounds
    background: '#030712',        // Deep space black
    surface: '#0f172a',           // Card backgrounds
    surfaceElevated: '#1e293b',   // Elevated elements
    
    // Text
    text: '#f8fafc',              // Primary text
    textSecondary: '#94a3b8',     // Secondary text
    textMuted: '#64748b',         // Muted text
    
    // Accents
    primary: '#a855f7',           // Purple accent
    primaryLight: '#c084fc',      // Light purple
    primaryDark: '#7c3aed',       // Dark purple
    accent: '#fde68a',            // Golden yellow accent for titles
    
    // Semantic
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Gradients
    gradientStart: '#7c3aed',
    gradientEnd: '#a855f7',
    
    // Card glow (favorites)
    favoriteGlow: 'rgba(168, 85, 247, 0.3)',
    favoriteGlowIntense: 'rgba(168, 85, 247, 0.5)',
    
    // Borders
    border: '#1e293b',
    borderLight: '#334155',
    
    // Special
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
  
  light: {
    // Backgrounds - soft, warm whites
    background: '#faf8f5',        // Warm off-white
    surface: '#ffffff',           // Pure white cards
    surfaceElevated: '#f5f3f0',   // Slightly warm elevated
    
    // Text
    text: '#1e1b4b',              // Deep indigo text
    textSecondary: '#475569',     // Darker slate for better contrast
    textMuted: '#64748b',         // Muted slate
    
    // Accents - soothing lavender/violet
    primary: '#0ea5e9',           // Crystal sky blue
    accent: '#1e1b4b',            // Deep indigo for titles in light mode
    primaryLight: '#38bdf8',      // Light sky blue
    primaryDark: '#0284c7',       // Deeper sky blue
    
    // Semantic - softer versions
    success: '#10b981',           // Emerald
    warning: '#f59e0b',           // Amber
    error: '#f43f5e',             // Rose
    info: '#6366f1',              // Indigo
    
    // Gradients - soothing pastels
    gradientStart: '#c4b5fd',     // Soft violet
    gradientEnd: '#a78bfa',       // Medium violet
    
    // Card glow (favorites) - soft golden/violet
    favoriteGlow: 'rgba(139, 92, 246, 0.15)',
    favoriteGlowIntense: 'rgba(139, 92, 246, 0.25)',
    
    // Borders - subtle
    border: '#e2e8f0',            // Slate border
    borderLight: '#f1f5f9',       // Very light border
    
    // Special
    overlay: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(100, 116, 139, 0.1)',
  },
};

// Category colors for both themes
export const categoryColors = {
  dark: {
    solfeggio: '#a855f7',
    chakra: '#f59e0b', 
    binaural: '#3b82f6',
    healing: '#22c55e',
    planetary: '#8b5cf6',
    crystal: '#ec4899',
    organ: '#ef4444',
    emotion: '#f97316',
    brain: '#06b6d4',
    sleep: '#6366f1',
    energy: '#eab308',
    manifestation: '#d946ef',
  },
  light: {
    solfeggio: '#8b5cf6',
    chakra: '#d97706',
    binaural: '#2563eb',
    healing: '#059669',
    planetary: '#7c3aed',
    crystal: '#db2777',
    organ: '#dc2626',
    emotion: '#ea580c',
    brain: '#0891b2',
    sleep: '#4f46e5',
    energy: '#ca8a04',
    manifestation: '#c026d3',
  },
};

interface ThemeState {
  mode: ThemeMode;
  colors: typeof colors.dark;
  categoryColors: typeof categoryColors.dark;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      colors: colors.dark,
      categoryColors: categoryColors.dark,
      
      toggleTheme: () => {
        const newMode = get().mode === 'dark' ? 'light' : 'dark';
        set({
          mode: newMode,
          colors: colors[newMode],
          categoryColors: categoryColors[newMode],
        });
      },
      
      setTheme: (mode: ThemeMode) => {
        set({
          mode,
          colors: colors[mode],
          categoryColors: categoryColors[mode],
        });
      },
    }),
    {
      name: 'healtone-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore full colors based on persisted mode
          state.colors = colors[state.mode];
          state.categoryColors = categoryColors[state.mode];
        }
      },
    }
  )
);

// Convenience hook for getting theme colors
export const useTheme = () => {
  const { colors, categoryColors, mode } = useThemeStore();
  return { colors, categoryColors, mode, isDark: mode === 'dark' };
};
