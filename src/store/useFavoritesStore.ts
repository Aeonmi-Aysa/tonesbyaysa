import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteItem {
  id: string;
  type: 'frequency' | 'bath' | 'custom-bath';
  addedAt: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  isLoaded: boolean;
  loadFavorites: (userId?: string) => Promise<void>;
  addFavorite: (id: string, type: FavoriteItem['type'], userId?: string) => Promise<void>;
  removeFavorite: (id: string, userId?: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  clearFavorites: (userId?: string) => Promise<void>;
}

const STORAGE_KEY = 'healtone_favorites';

const getStorageKey = (userId?: string) => userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY;

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoaded: false,

  loadFavorites: async (userId?: string) => {
    try {
      const key = getStorageKey(userId);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        set({ favorites: JSON.parse(stored), isLoaded: true });
      } else {
        set({ favorites: [], isLoaded: true });
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      set({ isLoaded: true });
    }
  },

  addFavorite: async (id: string, type: FavoriteItem['type'], userId?: string) => {
    const newFavorite: FavoriteItem = {
      id,
      type,
      addedAt: new Date().toISOString(),
    };

    const updated = [newFavorite, ...get().favorites.filter(f => f.id !== id)];
    set({ favorites: updated });

    try {
      const key = getStorageKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save favorite:', error);
    }
  },

  removeFavorite: async (id: string, userId?: string) => {
    const updated = get().favorites.filter(f => f.id !== id);
    set({ favorites: updated });

    try {
      const key = getStorageKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  },

  isFavorite: (id: string) => {
    return get().favorites.some(f => f.id === id);
  },

  clearFavorites: async (userId?: string) => {
    set({ favorites: [] });
    try {
      const key = getStorageKey(userId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  },
}));
