import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MoodRating = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  frequencyId?: string;
  frequencyName?: string;
  bathName?: string; // For custom baths
  bathFrequencies?: number[]; // Frequencies used in bath
  moodBefore: MoodRating;
  moodAfter: MoodRating;
  energyBefore: MoodRating;
  energyAfter: MoodRating;
  notesBefore?: string;
  notesAfter?: string;
  duration: number; // minutes
  tags: string[];
  improvement: number; // calculated: (moodAfter + energyAfter) - (moodBefore + energyBefore)
}

export interface FrequencyInsight {
  frequencyId: string;
  frequencyName: string;
  timesUsed: number;
  avgMoodImprovement: number;
  avgEnergyImprovement: number;
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  mostUsedTags: string[];
}

interface JournalState {
  entries: JournalEntry[];
  pendingSession: {
    frequencyId?: string;
    frequencyName?: string;
    bathName?: string;
    bathFrequencies?: number[];
    moodBefore?: MoodRating;
    energyBefore?: MoodRating;
    notesBefore?: string;
    startTime?: string;
  } | null;
  
  // Actions
  startSession: (data: {
    frequencyId?: string;
    frequencyName?: string;
    bathName?: string;
    bathFrequencies?: number[];
    moodBefore: MoodRating;
    energyBefore: MoodRating;
    notesBefore?: string;
  }) => void;
  
  completeSession: (data: {
    moodAfter: MoodRating;
    energyAfter: MoodRating;
    notesAfter?: string;
    duration: number;
    tags: string[];
  }) => void;
  
  cancelSession: () => void;
  
  addEntry: (entry: Omit<JournalEntry, 'id' | 'improvement'>) => void;
  deleteEntry: (id: string) => void;
  
  getInsights: () => FrequencyInsight[];
  getEntriesForFrequency: (frequencyId: string) => JournalEntry[];
  getRecentEntries: (limit?: number) => JournalEntry[];
  getStreak: () => number;
  getTotalSessions: () => number;
  getAverageImprovement: () => number;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      pendingSession: null,
      
      startSession: (data) => {
        set({
          pendingSession: {
            ...data,
            startTime: new Date().toISOString()
          }
        });
      },
      
      completeSession: (data) => {
        const { pendingSession, entries } = get();
        if (!pendingSession || !pendingSession.moodBefore || !pendingSession.energyBefore) return;
        
        const improvement = (data.moodAfter + data.energyAfter) - 
                          (pendingSession.moodBefore + pendingSession.energyBefore);
        
        const newEntry: JournalEntry = {
          id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: new Date().toISOString(),
          frequencyId: pendingSession.frequencyId,
          frequencyName: pendingSession.frequencyName,
          bathName: pendingSession.bathName,
          bathFrequencies: pendingSession.bathFrequencies,
          moodBefore: pendingSession.moodBefore,
          moodAfter: data.moodAfter,
          energyBefore: pendingSession.energyBefore,
          energyAfter: data.energyAfter,
          notesBefore: pendingSession.notesBefore,
          notesAfter: data.notesAfter,
          duration: data.duration,
          tags: data.tags,
          improvement
        };
        
        set({
          entries: [newEntry, ...entries],
          pendingSession: null
        });
      },
      
      cancelSession: () => {
        set({ pendingSession: null });
      },
      
      addEntry: (entryData) => {
        const improvement = (entryData.moodAfter + entryData.energyAfter) - 
                          (entryData.moodBefore + entryData.energyBefore);
        
        const newEntry: JournalEntry = {
          ...entryData,
          id: `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          improvement
        };
        
        set((state) => ({
          entries: [newEntry, ...state.entries]
        }));
      },
      
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter(e => e.id !== id)
        }));
      },
      
      getInsights: () => {
        const { entries } = get();
        const frequencyMap = new Map<string, JournalEntry[]>();
        
        entries.forEach(entry => {
          if (entry.frequencyId) {
            const existing = frequencyMap.get(entry.frequencyId) || [];
            frequencyMap.set(entry.frequencyId, [...existing, entry]);
          }
        });
        
        const insights: FrequencyInsight[] = [];
        
        frequencyMap.forEach((freqEntries, frequencyId) => {
          const avgMoodImprovement = freqEntries.reduce((sum, e) => 
            sum + (e.moodAfter - e.moodBefore), 0) / freqEntries.length;
          const avgEnergyImprovement = freqEntries.reduce((sum, e) => 
            sum + (e.energyAfter - e.energyBefore), 0) / freqEntries.length;
          
          // Determine best time of day
          const timeCount = { morning: 0, afternoon: 0, evening: 0, night: 0 };
          freqEntries.forEach(e => {
            const hour = new Date(e.date).getHours();
            if (hour >= 5 && hour < 12) timeCount.morning++;
            else if (hour >= 12 && hour < 17) timeCount.afternoon++;
            else if (hour >= 17 && hour < 21) timeCount.evening++;
            else timeCount.night++;
          });
          const bestTimeOfDay = (Object.entries(timeCount)
            .sort((a, b) => b[1] - a[1])[0][0]) as FrequencyInsight['bestTimeOfDay'];
          
          // Most used tags
          const tagCount = new Map<string, number>();
          freqEntries.forEach(e => {
            e.tags.forEach(tag => {
              tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
            });
          });
          const mostUsedTags = Array.from(tagCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([tag]) => tag);
          
          insights.push({
            frequencyId,
            frequencyName: freqEntries[0].frequencyName || 'Unknown',
            timesUsed: freqEntries.length,
            avgMoodImprovement: Math.round(avgMoodImprovement * 10) / 10,
            avgEnergyImprovement: Math.round(avgEnergyImprovement * 10) / 10,
            bestTimeOfDay,
            mostUsedTags
          });
        });
        
        return insights.sort((a, b) => 
          (b.avgMoodImprovement + b.avgEnergyImprovement) - 
          (a.avgMoodImprovement + a.avgEnergyImprovement)
        );
      },
      
      getEntriesForFrequency: (frequencyId) => {
        return get().entries.filter(e => e.frequencyId === frequencyId);
      },
      
      getRecentEntries: (limit = 10) => {
        return get().entries.slice(0, limit);
      },
      
      getStreak: () => {
        const { entries } = get();
        if (entries.length === 0) return 0;
        
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          const hasEntry = entries.some(e => 
            e.date.split('T')[0] === dateStr
          );
          
          if (hasEntry) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
        
        return streak;
      },
      
      getTotalSessions: () => get().entries.length,
      
      getAverageImprovement: () => {
        const { entries } = get();
        if (entries.length === 0) return 0;
        const total = entries.reduce((sum, e) => sum + e.improvement, 0);
        return Math.round((total / entries.length) * 10) / 10;
      }
    }),
    {
      name: 'healtone-journal',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
