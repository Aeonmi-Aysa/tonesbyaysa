import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityPreset {
  id: string;
  name: string;
  description: string;
  category: 'focus' | 'relaxation' | 'sleep' | 'energy' | 'healing' | 'creativity' | 'meditation' | 'manifestation' | 'other';
  frequencies: {
    hz: number;
    name: string;
    volume: number;
  }[];
  authorId: string;
  authorName: string;
  likes: number;
  downloads: number;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MySharedPreset {
  id: string;
  name: string;
  description: string;
  category: CommunityPreset['category'];
  frequencies: CommunityPreset['frequencies'];
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  likes: number;
  downloads: number;
}

interface CommunityState {
  // Browse
  communityPresets: CommunityPreset[];
  featuredPresets: CommunityPreset[];
  trendingPresets: CommunityPreset[];
  
  // My shared presets
  mySharedPresets: MySharedPreset[];
  
  // Saved from community
  savedPresets: CommunityPreset[];
  
  // Liked presets
  likedPresetIds: string[];
  
  // Loading states
  isLoading: boolean;
  lastFetched: string | null;
  
  // Actions
  fetchCommunityPresets: () => Promise<void>;
  sharePreset: (preset: Omit<MySharedPreset, 'id' | 'createdAt' | 'likes' | 'downloads'>) => Promise<void>;
  unsharePreset: (presetId: string) => void;
  updateSharedPreset: (presetId: string, updates: Partial<MySharedPreset>) => void;
  savePreset: (preset: CommunityPreset) => void;
  unsavePreset: (presetId: string) => void;
  likePreset: (presetId: string) => void;
  unlikePreset: (presetId: string) => void;
  searchPresets: (query: string, category?: CommunityPreset['category']) => CommunityPreset[];
  getPresetsByCategory: (category: CommunityPreset['category']) => CommunityPreset[];
}

// Sample community presets (in production, these would come from Supabase)
const SAMPLE_COMMUNITY_PRESETS: CommunityPreset[] = [
  {
    id: 'comm-1',
    name: 'Deep Focus Stack',
    description: 'Perfect for coding or studying. Combines beta waves with Schumann resonance for grounded concentration.',
    category: 'focus',
    frequencies: [
      { hz: 14, name: 'Beta Focus', volume: 0.7 },
      { hz: 7.83, name: 'Schumann Resonance', volume: 0.5 },
      { hz: 40, name: 'Gamma Clarity', volume: 0.3 }
    ],
    authorId: 'user-1',
    authorName: 'FrequencyMaster',
    likes: 234,
    downloads: 567,
    isPublic: true,
    tags: ['work', 'study', 'concentration'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'comm-2',
    name: 'Anxiety Relief Blend',
    description: 'Gentle frequencies to calm anxious thoughts and promote inner peace.',
    category: 'relaxation',
    frequencies: [
      { hz: 396, name: 'Liberation from Fear', volume: 0.6 },
      { hz: 4, name: 'Theta Calm', volume: 0.7 },
      { hz: 10, name: 'Alpha Peace', volume: 0.5 }
    ],
    authorId: 'user-2',
    authorName: 'HealingVibes',
    likes: 456,
    downloads: 891,
    isPublic: true,
    tags: ['anxiety', 'calm', 'peace'],
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-12T09:00:00Z'
  },
  {
    id: 'comm-3',
    name: 'Ultimate Sleep Inducer',
    description: 'Fall asleep in minutes with this powerful delta wave combination.',
    category: 'sleep',
    frequencies: [
      { hz: 2.5, name: 'Deep Delta', volume: 0.8 },
      { hz: 174, name: 'Pain Relief', volume: 0.4 },
      { hz: 3.5, name: 'Delta Sleep', volume: 0.6 }
    ],
    authorId: 'user-3',
    authorName: 'DreamWeaver',
    likes: 789,
    downloads: 1234,
    isPublic: true,
    tags: ['sleep', 'insomnia', 'rest'],
    createdAt: '2024-01-08T22:00:00Z',
    updatedAt: '2024-01-08T22:00:00Z'
  },
  {
    id: 'comm-4',
    name: 'Morning Energy Boost',
    description: 'Start your day with elevated energy and positive vibrations.',
    category: 'energy',
    frequencies: [
      { hz: 528, name: 'Miracle Tone', volume: 0.7 },
      { hz: 18, name: 'High Beta', volume: 0.6 },
      { hz: 639, name: 'Relationships', volume: 0.4 }
    ],
    authorId: 'user-4',
    authorName: 'SunriseSound',
    likes: 345,
    downloads: 678,
    isPublic: true,
    tags: ['morning', 'energy', 'motivation'],
    createdAt: '2024-01-12T06:00:00Z',
    updatedAt: '2024-01-12T06:00:00Z'
  },
  {
    id: 'comm-5',
    name: 'Creative Flow State',
    description: 'Unlock your creative potential with this alpha-theta combination.',
    category: 'creativity',
    frequencies: [
      { hz: 7.5, name: 'Alpha-Theta Border', volume: 0.7 },
      { hz: 741, name: 'Expression', volume: 0.5 },
      { hz: 12, name: 'Creative Alpha', volume: 0.6 }
    ],
    authorId: 'user-5',
    authorName: 'ArtistMind',
    likes: 234,
    downloads: 456,
    isPublic: true,
    tags: ['creativity', 'art', 'flow'],
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z'
  },
  {
    id: 'comm-6',
    name: 'DNA Repair Protocol',
    description: 'Sacred Solfeggio frequencies for cellular healing and DNA repair.',
    category: 'healing',
    frequencies: [
      { hz: 528, name: 'DNA Repair', volume: 0.8 },
      { hz: 174, name: 'Foundation', volume: 0.5 },
      { hz: 285, name: 'Quantum Healing', volume: 0.6 }
    ],
    authorId: 'user-6',
    authorName: 'QuantumHealer',
    likes: 567,
    downloads: 890,
    isPublic: true,
    tags: ['healing', 'dna', 'solfeggio'],
    createdAt: '2024-01-11T11:11:00Z',
    updatedAt: '2024-01-11T11:11:00Z'
  },
  {
    id: 'comm-7',
    name: 'Transcendent Meditation',
    description: 'Deep meditation stack for spiritual exploration and inner journeys.',
    category: 'meditation',
    frequencies: [
      { hz: 3.5, name: 'Deep Theta', volume: 0.7 },
      { hz: 963, name: 'Divine Connection', volume: 0.6 },
      { hz: 852, name: 'Intuition', volume: 0.5 }
    ],
    authorId: 'user-7',
    authorName: 'ZenMaster',
    likes: 678,
    downloads: 1012,
    isPublic: true,
    tags: ['meditation', 'spiritual', 'transcendence'],
    createdAt: '2024-01-09T05:00:00Z',
    updatedAt: '2024-01-09T05:00:00Z'
  },
  {
    id: 'comm-8',
    name: 'Abundance Manifestation',
    description: 'Align with prosperity and abundance frequencies.',
    category: 'manifestation',
    frequencies: [
      { hz: 888, name: 'Abundance', volume: 0.7 },
      { hz: 639, name: 'Harmonious Relationships', volume: 0.5 },
      { hz: 528, name: 'Transformation', volume: 0.6 }
    ],
    authorId: 'user-8',
    authorName: 'ManifestPro',
    likes: 890,
    downloads: 1567,
    isPublic: true,
    tags: ['abundance', 'money', 'prosperity'],
    createdAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-13T13:00:00Z'
  }
];

const generateId = () => `my-preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      communityPresets: [],
      featuredPresets: [],
      trendingPresets: [],
      mySharedPresets: [],
      savedPresets: [],
      likedPresetIds: [],
      isLoading: false,
      lastFetched: null,

      fetchCommunityPresets: async () => {
        set({ isLoading: true });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In production, this would fetch from Supabase
        // For now, use sample data
        const presets = SAMPLE_COMMUNITY_PRESETS;
        
        const featured = presets.filter(p => p.likes > 500);
        const trending = [...presets].sort((a, b) => b.downloads - a.downloads).slice(0, 5);
        
        set({
          communityPresets: presets,
          featuredPresets: featured,
          trendingPresets: trending,
          isLoading: false,
          lastFetched: new Date().toISOString()
        });
      },

      sharePreset: async (preset) => {
        const newPreset: MySharedPreset = {
          ...preset,
          id: generateId(),
          createdAt: new Date().toISOString(),
          likes: 0,
          downloads: 0
        };
        
        // In production, this would upload to Supabase
        set(state => ({
          mySharedPresets: [...state.mySharedPresets, newPreset]
        }));
      },

      unsharePreset: (presetId) => {
        set(state => ({
          mySharedPresets: state.mySharedPresets.filter(p => p.id !== presetId)
        }));
      },

      updateSharedPreset: (presetId, updates) => {
        set(state => ({
          mySharedPresets: state.mySharedPresets.map(p =>
            p.id === presetId ? { ...p, ...updates } : p
          )
        }));
      },

      savePreset: (preset) => {
        const { savedPresets } = get();
        if (!savedPresets.find(p => p.id === preset.id)) {
          set({ savedPresets: [...savedPresets, preset] });
        }
      },

      unsavePreset: (presetId) => {
        set(state => ({
          savedPresets: state.savedPresets.filter(p => p.id !== presetId)
        }));
      },

      likePreset: (presetId) => {
        const { likedPresetIds, communityPresets } = get();
        if (!likedPresetIds.includes(presetId)) {
          set({
            likedPresetIds: [...likedPresetIds, presetId],
            communityPresets: communityPresets.map(p =>
              p.id === presetId ? { ...p, likes: p.likes + 1 } : p
            )
          });
        }
      },

      unlikePreset: (presetId) => {
        const { communityPresets } = get();
        set(state => ({
          likedPresetIds: state.likedPresetIds.filter(id => id !== presetId),
          communityPresets: communityPresets.map(p =>
            p.id === presetId ? { ...p, likes: Math.max(0, p.likes - 1) } : p
          )
        }));
      },

      searchPresets: (query, category) => {
        const { communityPresets } = get();
        const searchLower = query.toLowerCase();
        
        return communityPresets.filter(preset => {
          const matchesQuery = !query || 
            preset.name.toLowerCase().includes(searchLower) ||
            preset.description.toLowerCase().includes(searchLower) ||
            preset.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
            preset.authorName.toLowerCase().includes(searchLower);
          
          const matchesCategory = !category || preset.category === category;
          
          return matchesQuery && matchesCategory;
        });
      },

      getPresetsByCategory: (category) => {
        const { communityPresets } = get();
        return communityPresets.filter(p => p.category === category);
      }
    }),
    {
      name: 'healtone-community',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mySharedPresets: state.mySharedPresets,
        savedPresets: state.savedPresets,
        likedPresetIds: state.likedPresetIds
      })
    }
  )
);

// Category display info
export const CATEGORY_INFO: Record<CommunityPreset['category'], { label: string; icon: string; color: string }> = {
  focus: { label: 'Focus', icon: '🎯', color: '#3b82f6' },
  relaxation: { label: 'Relaxation', icon: '🌊', color: '#06b6d4' },
  sleep: { label: 'Sleep', icon: '🌙', color: '#6366f1' },
  energy: { label: 'Energy', icon: '⚡', color: '#f59e0b' },
  healing: { label: 'Healing', icon: '💚', color: '#10b981' },
  creativity: { label: 'Creativity', icon: '🎨', color: '#ec4899' },
  meditation: { label: 'Meditation', icon: '🧘', color: '#8b5cf6' },
  manifestation: { label: 'Manifestation', icon: '✨', color: '#f97316' },
  other: { label: 'Other', icon: '📦', color: '#64748b' }
};
