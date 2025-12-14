import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedFrequency {
  hz: number;
  name: string;
  category: string;
  cachedAt: string;
  sizeBytes: number; // Estimated size
}

export interface CachedStack {
  id: string;
  name: string;
  frequencies: { hz: number; name: string; volume: number }[];
  cachedAt: string;
  totalSizeBytes: number;
}

interface OfflineState {
  // Cached individual frequencies
  cachedFrequencies: CachedFrequency[];
  
  // Cached stacks (multiple frequencies together)
  cachedStacks: CachedStack[];
  
  // Settings
  autoCache: boolean; // Auto-cache favorites
  maxCacheSizeMB: number;
  
  // Stats
  totalCachedBytes: number;
  lastSyncDate: string | null;
  
  // Status
  isDownloading: boolean;
  downloadProgress: number;
  currentDownload: string | null;
  
  // Actions
  cacheFrequency: (hz: number, name: string, category: string) => Promise<void>;
  cacheStack: (id: string, name: string, frequencies: CachedStack['frequencies']) => Promise<void>;
  removeFrequency: (hz: number) => void;
  removeStack: (id: string) => void;
  clearAllCache: () => void;
  setAutoCache: (enabled: boolean) => void;
  setMaxCacheSize: (sizeMB: number) => void;
  isFrequencyCached: (hz: number) => boolean;
  isStackCached: (id: string) => boolean;
  getCacheStats: () => { usedMB: number; maxMB: number; frequencyCount: number; stackCount: number };
  downloadAllFavorites: (favorites: { hz: number; name: string; category: string }[]) => Promise<void>;
}

// Estimate audio buffer size (44.1kHz, 16-bit, 10 seconds of audio)
const estimateFrequencySize = (hz: number): number => {
  // Base size for all frequencies + complexity factor
  const baseSize = 50000; // ~50KB base
  const complexityFactor = hz > 1000 ? 1.2 : 1;
  return Math.round(baseSize * complexityFactor);
};

const generateId = () => `stack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      cachedFrequencies: [],
      cachedStacks: [],
      autoCache: false,
      maxCacheSizeMB: 100, // 100MB default
      totalCachedBytes: 0,
      lastSyncDate: null,
      isDownloading: false,
      downloadProgress: 0,
      currentDownload: null,

      cacheFrequency: async (hz, name, category) => {
        const { cachedFrequencies, maxCacheSizeMB, totalCachedBytes } = get();
        
        // Check if already cached
        if (cachedFrequencies.find(f => f.hz === hz)) {
          return;
        }
        
        const sizeBytes = estimateFrequencySize(hz);
        const newTotalBytes = totalCachedBytes + sizeBytes;
        
        // Check cache limit
        if (newTotalBytes > maxCacheSizeMB * 1024 * 1024) {
          console.warn('Cache limit reached');
          return;
        }
        
        set({ 
          isDownloading: true, 
          currentDownload: name,
          downloadProgress: 0 
        });
        
        // Simulate download (in real app, this would pre-generate audio buffer)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          downloadProgress: 50
        }));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newFrequency: CachedFrequency = {
          hz,
          name,
          category,
          cachedAt: new Date().toISOString(),
          sizeBytes
        };
        
        set(state => ({
          cachedFrequencies: [...state.cachedFrequencies, newFrequency],
          totalCachedBytes: state.totalCachedBytes + sizeBytes,
          lastSyncDate: new Date().toISOString(),
          isDownloading: false,
          downloadProgress: 100,
          currentDownload: null
        }));
      },

      cacheStack: async (id, name, frequencies) => {
        const { cachedStacks, maxCacheSizeMB, totalCachedBytes } = get();
        
        // Check if already cached
        if (cachedStacks.find(s => s.id === id)) {
          return;
        }
        
        const totalSizeBytes = frequencies.reduce((sum, f) => sum + estimateFrequencySize(f.hz), 0);
        const newTotalBytes = totalCachedBytes + totalSizeBytes;
        
        // Check cache limit
        if (newTotalBytes > maxCacheSizeMB * 1024 * 1024) {
          console.warn('Cache limit reached');
          return;
        }
        
        set({ 
          isDownloading: true, 
          currentDownload: name,
          downloadProgress: 0 
        });
        
        // Simulate download
        for (let i = 0; i < frequencies.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          set({ downloadProgress: ((i + 1) / frequencies.length) * 100 });
        }
        
        const newStack: CachedStack = {
          id: id || generateId(),
          name,
          frequencies,
          cachedAt: new Date().toISOString(),
          totalSizeBytes
        };
        
        set(state => ({
          cachedStacks: [...state.cachedStacks, newStack],
          totalCachedBytes: state.totalCachedBytes + totalSizeBytes,
          lastSyncDate: new Date().toISOString(),
          isDownloading: false,
          downloadProgress: 100,
          currentDownload: null
        }));
      },

      removeFrequency: (hz) => {
        set(state => {
          const freq = state.cachedFrequencies.find(f => f.hz === hz);
          const sizeToRemove = freq?.sizeBytes || 0;
          return {
            cachedFrequencies: state.cachedFrequencies.filter(f => f.hz !== hz),
            totalCachedBytes: Math.max(0, state.totalCachedBytes - sizeToRemove)
          };
        });
      },

      removeStack: (id) => {
        set(state => {
          const stack = state.cachedStacks.find(s => s.id === id);
          const sizeToRemove = stack?.totalSizeBytes || 0;
          return {
            cachedStacks: state.cachedStacks.filter(s => s.id !== id),
            totalCachedBytes: Math.max(0, state.totalCachedBytes - sizeToRemove)
          };
        });
      },

      clearAllCache: () => {
        set({
          cachedFrequencies: [],
          cachedStacks: [],
          totalCachedBytes: 0,
          lastSyncDate: null
        });
      },

      setAutoCache: (enabled) => {
        set({ autoCache: enabled });
      },

      setMaxCacheSize: (sizeMB) => {
        set({ maxCacheSizeMB: sizeMB });
      },

      isFrequencyCached: (hz) => {
        return get().cachedFrequencies.some(f => f.hz === hz);
      },

      isStackCached: (id) => {
        return get().cachedStacks.some(s => s.id === id);
      },

      getCacheStats: () => {
        const { cachedFrequencies, cachedStacks, totalCachedBytes, maxCacheSizeMB } = get();
        return {
          usedMB: Math.round(totalCachedBytes / (1024 * 1024) * 100) / 100,
          maxMB: maxCacheSizeMB,
          frequencyCount: cachedFrequencies.length,
          stackCount: cachedStacks.length
        };
      },

      downloadAllFavorites: async (favorites) => {
        set({ isDownloading: true, downloadProgress: 0 });
        
        for (let i = 0; i < favorites.length; i++) {
          const fav = favorites[i];
          set({ 
            currentDownload: fav.name,
            downloadProgress: (i / favorites.length) * 100
          });
          
          await get().cacheFrequency(fav.hz, fav.name, fav.category);
        }
        
        set({ 
          isDownloading: false, 
          downloadProgress: 100,
          currentDownload: null 
        });
      }
    }),
    {
      name: 'healtone-offline',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

// Helper to format bytes
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
