import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTheme } from '@/store/useThemeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREQUENCY_BATHS, type FrequencyBath } from '@/lib/frequencies';
import { stopAllFrequencies, playFrequencyBath } from '@/lib/audioEngineExpo';

// Types
interface Intention {
  title: string;
  category: 'abundance' | 'love' | 'health' | 'career' | 'spiritual' | 'creativity';
  description: string;
  intensity: number;
  updatedAt: string;
}

interface ManifestationStats {
  sessions: number;
  minutes: number;
  streak: number;
  intentions: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: ManifestationStats, intentions: number) => boolean;
}

interface CustomBath {
  id: string;
  name: string;
  mode: 'blend' | 'sequence';
  layers: Array<{ hz: number; duration: number; waveform: string }>;
  savedAt: string;
  isCustom: boolean;
}

interface ManifestationState {
  currentIntention: Intention | null;
  stats: ManifestationStats;
  achievements: Record<string, boolean>;
  lastSessionDate: string | null;
}

// Achievement catalog
const ACHIEVEMENT_CATALOG: Achievement[] = [
  {
    id: 'first-intention',
    name: 'Intention Initiate',
    description: 'Set your first manifestation target.',
    icon: '✨',
    check: (stats, intentions) => intentions > 0
  },
  {
    id: 'session-5',
    name: 'Momentum Builder',
    description: 'Complete 5 manifestation sessions.',
    icon: '⚡',
    check: (stats) => stats.sessions >= 5
  },
  {
    id: 'streak-3',
    name: 'Consistency Alchemist',
    description: 'Maintain a 3-day streak.',
    icon: '🔥',
    check: (stats) => stats.streak >= 3
  },
  {
    id: 'minutes-120',
    name: 'Time Investor',
    description: 'Spend 120 mindful minutes.',
    icon: '⏱️',
    check: (stats) => stats.minutes >= 120
  },
  {
    id: 'session-25',
    name: 'Master Manifestor',
    description: 'Complete 25 sessions.',
    icon: '👑',
    check: (stats) => stats.sessions >= 25
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: '7-day manifestation streak.',
    icon: '💫',
    check: (stats) => stats.streak >= 7
  }
];

// Intention categories
const INTENTION_CATEGORIES = [
  { key: 'abundance' as const, label: 'Abundance', emoji: '💰' },
  { key: 'love' as const, label: 'Love', emoji: '❤️' },
  { key: 'health' as const, label: 'Wellness', emoji: '🌿' },
  { key: 'career' as const, label: 'Career', emoji: '🎯' },
  { key: 'spiritual' as const, label: 'Spiritual', emoji: '🧘' },
  { key: 'creativity' as const, label: 'Creative', emoji: '🎨' },
];

// Recommended frequencies per category
const CATEGORY_RECOMMENDATIONS: Record<string, string[]> = {
  abundance: ['bath-abundance-flow', 'bath-infinite-prosperity', 'bath-opportunity-magnet'],
  love: ['bath-self-love', 'bath-heart-opening', 'bath-emotional-reset'],
  wellness: ['bath-deep-restoration', 'bath-comfort-support', 'bath-vitality-support'],
  career: ['bath-focus', 'bath-logic-reasoning', 'bath-mental-clarity'],
  spiritual: ['bath-awakening-gateway', 'bath-quantum-creation', 'bath-chakra-alignment'],
  creativity: ['bath-quantum-creation', 'bath-inspiration-flow', 'bath-creative-spark']
};

const STORAGE_KEY = 'manifestation_state';

export function ManifestationScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const { addFavorite, isFavorite } = useFavoritesStore();
  const { colors, isDark } = useTheme();
  
  // Core state
  const [state, setState] = useState<ManifestationState>({
    currentIntention: null,
    stats: { sessions: 0, minutes: 0, streak: 0, intentions: 0 },
    achievements: {},
    lastSessionDate: null
  });
  
  // Form state
  const [intentionTitle, setIntentionTitle] = useState('');
  const [intentionCategory, setIntentionCategory] = useState<Intention['category']>('abundance');
  const [intentionDescription, setIntentionDescription] = useState('');
  const [intentionIntensity, setIntensityValue] = useState(5);
  
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedOffset, setPausedOffset] = useState(0);
  
  // Audio state
  const [playingBathId, setPlayingBathId] = useState<string | null>(null);
  
  // Imported baths from Composer/Favorites
  const [composerBaths, setComposerBaths] = useState<CustomBath[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'intention' | 'session' | 'baths' | 'progress'>('intention');
  
  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load state on mount
  useEffect(() => {
    // Stop any playing audio when entering manifestation screen
    const cleanup = async () => {
      try {
        await stopAllFrequencies();
        setPlayingBathId(null);
        console.log('🧘 ManifestationScreen: Stopped any lingering audio');
      } catch (error) {
        console.error('Error stopping audio on mount:', error);
      }
    };
    
    cleanup();
    loadState();
    loadComposerBaths();
  }, [profile?.id]);
  
  // Timer effect
  useEffect(() => {
    if (isSessionActive && !isPaused && sessionStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - sessionStartTime);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSessionActive, isPaused, sessionStartTime]);
  
  // Pulse animation for active session
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSessionActive, isPaused]);

  // Stop audio when switching away from baths tab
  useEffect(() => {
    if (activeTab !== 'baths' && playingBathId) {
      console.log('🧘 Stopping bath audio - switched away from baths tab');
      stopAllFrequencies().catch(e => console.error('Failed to stop audio on tab switch:', e));
      setPlayingBathId(null);
    }
  }, [activeTab, playingBathId]);

  const loadState = async () => {
    try {
      const key = profile?.id ? `${STORAGE_KEY}:${profile.id}` : STORAGE_KEY;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
        if (parsed.currentIntention) {
          setIntentionTitle(parsed.currentIntention.title || '');
          setIntentionCategory(parsed.currentIntention.category || 'abundance');
          setIntentionDescription(parsed.currentIntention.description || '');
          setIntensityValue(parsed.currentIntention.intensity || 5);
        }
      }
    } catch (error) {
      console.error('Failed to load manifestation state:', error);
    }
  };

  const saveState = async (newState: ManifestationState) => {
    try {
      const key = profile?.id ? `${STORAGE_KEY}:${profile.id}` : STORAGE_KEY;
      await AsyncStorage.setItem(key, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save manifestation state:', error);
    }
  };

  const loadComposerBaths = async () => {
    try {
      const key = profile?.id ? `customBaths:${profile.id}` : 'customBaths';
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setComposerBaths(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load composer baths:', error);
    }
  };

  // BATH SYNC FIX: Refresh baths when screen regains focus
  useFocusEffect(
    useCallback(() => {
      loadComposerBaths();
    }, [profile?.id])
  );

  const deleteCustomBath = async (bathId: string) => {
    Alert.alert(
      'Delete Custom Bath',
      'Are you sure you want to delete this custom bath?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = composerBaths.filter(b => b.id !== bathId);
              setComposerBaths(updated);
              const key = profile?.id ? `customBaths:${profile.id}` : 'customBaths';
              await AsyncStorage.setItem(key, JSON.stringify(updated));
              console.log('🗑️ Custom bath deleted from Manifestation');
            } catch (error) {
              console.error('Failed to delete bath:', error);
              Alert.alert('Error', 'Failed to delete bath');
            }
          }
        }
      ]
    );
  };

  // Set intention
  const setIntention = () => {
    if (!intentionTitle.trim()) {
      Alert.alert('Name Required', 'Give your intention a name to focus your energy.');
      return;
    }

    const newIntention: Intention = {
      title: intentionTitle.trim(),
      category: intentionCategory,
      description: intentionDescription.trim(),
      intensity: intentionIntensity,
      updatedAt: new Date().toISOString()
    };

    const newStats = {
      ...state.stats,
      intentions: state.stats.intentions + 1
    };

    const newState = {
      ...state,
      currentIntention: newIntention,
      stats: newStats,
      achievements: checkAchievements(newStats, state.achievements)
    };

    saveState(newState);
    Alert.alert('✨ Intention Set!', `"${intentionTitle}" locked in. Your recommended frequencies have been updated.`);
  };

  // Session management
  const startSession = () => {
    if (!state.currentIntention) {
      Alert.alert('Set Intention First', 'Define your manifestation target before starting a session.');
      return;
    }

    const start = Date.now() - pausedOffset;
    setSessionStartTime(start);
    setIsSessionActive(true);
    setIsPaused(false);
  };

  const pauseSession = () => {
    if (isSessionActive) {
      setPausedOffset(elapsedTime);
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeSession = () => {
    if (isPaused) {
      const start = Date.now() - pausedOffset;
      setSessionStartTime(start);
      setIsPaused(false);
    }
  };

  // Check achievements safely
  const checkAchievements = (stats: ManifestationStats, currentAchievements: Record<string, boolean>) => {
    const updated = { ...currentAchievements };
    
    ACHIEVEMENT_CATALOG.forEach(achievement => {
      if (!updated[achievement.id]) {
        try {
          if (achievement.check(stats, state.stats.intentions)) {
            updated[achievement.id] = true;
            console.log('🏆 Achievement unlocked:', achievement.name);
          }
        } catch (error) {
          console.error('Achievement check failed:', achievement.id, error);
        }
      }
    });
    
    return updated;
  };

  const stopSession = (markComplete = false) => {
    console.log('🧘 Stopping session, markComplete:', markComplete);
    
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      const minutes = Math.max(1, Math.round(elapsedTime / 60000));

      if (markComplete && elapsedTime > 30000) { // At least 30 seconds
        console.log('🧘 Marking session as complete, duration:', minutes, 'minutes');
        
        const newStats = {
          ...state.stats,
          sessions: state.stats.sessions + 1,
          minutes: state.stats.minutes + minutes
        };
        
        // Update streak
        const today = new Date().toISOString().slice(0, 10);
        if (state.lastSessionDate !== today) {
          if (state.lastSessionDate) {
            const prev = new Date(state.lastSessionDate);
            const diff = Math.round((new Date(today).getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              newStats.streak = state.stats.streak + 1;
            } else {
              newStats.streak = 1;
            }
          } else {
            newStats.streak = 1;
          }
        }

        const newState = {
          ...state,
          stats: newStats,
          lastSessionDate: today,
          achievements: checkAchievements(newStats, state.achievements)
        };

        console.log('🧘 Saving session state:', newState);
        saveState(newState);
        
        setTimeout(() => {
          Alert.alert('🎉 Session Complete!', `${minutes} minutes of focused manifestation energy. Keep going!`);
        }, 100);
      }

      // Stop audio and reset session state
      stopAllFrequencies().catch(e => console.error('Stop audio failed:', e));
      setPlayingBathId(null);
      setIsSessionActive(false);
      setIsPaused(false);
      setSessionStartTime(null);
      setElapsedTime(0);
      setPausedOffset(0);
      
      console.log('🧘 Session stopped successfully');
    } catch (error) {
      console.error('❌ Session stop failed:', error);
      // Force reset even if there's an error
      setIsSessionActive(false);
      setIsPaused(false);
      setSessionStartTime(null);
      setElapsedTime(0);
      setPausedOffset(0);
      Alert.alert('Session Stopped', 'Session ended with some issues, but progress was saved.');
    }
  };

  // Format timer display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Get recommended baths based on intention category
  const getRecommendedBaths = useCallback(() => {
    if (!state.currentIntention) return [];
    
    const bathIds = CATEGORY_RECOMMENDATIONS[state.currentIntention.category] || [];
    const catalogBaths = FREQUENCY_BATHS.filter(b => 
      bathIds.includes(b.id) || b.category === 'manifestation'
    ).slice(0, 6);
    
    return catalogBaths;
  }, [state.currentIntention]);

  // Play bath
  const handlePlayBath = async (bath: FrequencyBath | CustomBath) => {
    try {
      if (playingBathId === bath.id) {
        await stopAllFrequencies();
        setPlayingBathId(null);
        return;
      }

      await stopAllFrequencies();
      setPlayingBathId(bath.id);

      const durationMs = 30 * 60 * 1000;
      
      if ('frequencies' in bath) {
        // Catalog bath
        await playFrequencyBath(bath.frequencies, durationMs);
      } else if ('layers' in bath) {
        // Custom bath from composer
        const frequencies = bath.layers.map(l => l.hz);
        await playFrequencyBath(frequencies, durationMs);
      }
    } catch (error) {
      console.error('Failed to play bath:', error);
      setPlayingBathId(null);
    }
  };

  // Render intention form
  const renderIntentionTab = () => (
    <View>
      {/* Current Intention Display */}
      {state.currentIntention && (
        <View style={[styles.card, styles.intentionCard, { backgroundColor: colors.surface, borderColor: isDark ? '#fbbf24' : '#f59e0b' }]}>
          <View style={styles.intentionHeader}>
            <Text style={styles.intentionEmoji}>
              {INTENTION_CATEGORIES.find(c => c.key === state.currentIntention?.category)?.emoji}
            </Text>
            <View style={styles.intentionInfo}>
              <Text style={[styles.intentionTitle, { color: colors.accent }]}>{state.currentIntention.title}</Text>
              <Text style={[styles.intentionCategory, { color: colors.textSecondary }]}>
                {INTENTION_CATEGORIES.find(c => c.key === state.currentIntention?.category)?.label} • Intensity {state.currentIntention.intensity}/10
              </Text>
            </View>
          </View>
          {state.currentIntention.description ? (
            <Text style={[styles.intentionDescription, { color: colors.textSecondary }]}>{state.currentIntention.description}</Text>
          ) : null}
        </View>
      )}

      {/* Intention Form */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🎯 Set Your Intention</Text>
        
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>What do you want to manifest?</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="e.g., Financial freedom, Vibrant wellness..."
          placeholderTextColor={colors.textMuted}
          value={intentionTitle}
          onChangeText={setIntentionTitle}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {INTENTION_CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={[
                styles.categoryBtn, 
                { backgroundColor: intentionCategory === cat.key ? colors.primary : colors.background, borderColor: colors.border }
              ]}
              onPress={() => setIntentionCategory(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabel, { color: intentionCategory === cat.key ? '#ffffff' : colors.textSecondary }]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description (optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="Describe your intention in detail..."
          placeholderTextColor={colors.textMuted}
          value={intentionDescription}
          onChangeText={setIntentionDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Intensity: {intentionIntensity}/10</Text>
        <View style={styles.intensityRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <Pressable
              key={n}
              style={[
                styles.intensityBtn, 
                { 
                  backgroundColor: intentionIntensity >= n ? colors.primary : colors.background,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setIntensityValue(n)}
            >
              <Text style={[styles.intensityText, { color: intentionIntensity >= n ? '#ffffff' : colors.textMuted }]}>{n}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={[styles.setBtn, { backgroundColor: colors.primary }]} onPress={setIntention}>
          <Text style={styles.setBtnText}>✨ Lock In Intention</Text>
        </Pressable>
      </View>
    </View>
  );

  // Render session tab
  const renderSessionTab = () => (
    <View>
      {/* Timer Card */}
      <Animated.View style={[
        styles.card, 
        styles.timerCard, 
        { 
          backgroundColor: colors.surface, 
          borderColor: isSessionActive ? (isDark ? '#10b981' : '#059669') : colors.border,
          transform: [{ scale: pulseAnim }] 
        }
      ]}>
        <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>
          {isSessionActive 
            ? (isPaused ? '⏸️ Paused' : '🟢 Session Active') 
            : '⭕ Ready to Manifest'}
        </Text>
        <Text style={[styles.timerDisplay, { color: colors.text }]}>{formatTime(elapsedTime)}</Text>
        
        <View style={styles.timerButtons}>
          {!isSessionActive ? (
            <Pressable style={[styles.startBtn, { backgroundColor: '#10b981' }]} onPress={startSession}>
              <Text style={styles.startBtnText}>▶️ Start Session</Text>
            </Pressable>
          ) : (
            <>
              {isPaused ? (
                <Pressable style={[styles.resumeBtn, { backgroundColor: '#10b981' }]} onPress={resumeSession}>
                  <Text style={styles.resumeBtnText}>▶️ Resume</Text>
                </Pressable>
              ) : (
                <Pressable style={[styles.pauseBtn, { backgroundColor: '#f59e0b' }]} onPress={pauseSession}>
                  <Text style={styles.pauseBtnText}>⏸️ Pause</Text>
                </Pressable>
              )}
              <Pressable style={[styles.stopBtn, { backgroundColor: colors.primary }]} onPress={() => stopSession(true)}>
                <Text style={styles.stopBtnText}>⏹️ Complete</Text>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>

      {/* Session Tips */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>💡 Session Guide</Text>
        <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Find a quiet, comfortable space</Text>
        <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Use headphones for best experience</Text>
        <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Visualize your intention clearly</Text>
        <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Feel the emotions of achievement</Text>
        <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Breathe deeply and stay present</Text>
        <Text style={[styles.tipItem, { color: colors.textSecondary }]}>• Trust the process completely</Text>
      </View>

      {/* Current Intention Reminder */}
      {state.currentIntention && (
        <View style={[styles.card, styles.reminderCard, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', borderColor: colors.primary }]}>
          <Text style={[styles.reminderLabel, { color: colors.textSecondary }]}>Current Focus:</Text>
          <Text style={[styles.reminderTitle, { color: colors.accent }]}>{state.currentIntention.title}</Text>
        </View>
      )}
    </View>
  );

  // Render baths tab
  const renderBathsTab = () => {
    const recommendedBaths = getRecommendedBaths();
    
    return (
      <View>
        {/* Recommended Baths */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🎵 Recommended Frequencies</Text>
          {!state.currentIntention && (
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Set an intention to unlock personalized recommendations</Text>
          )}
          {recommendedBaths.map(bath => (
            <View key={bath.id} style={[styles.bathItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.bathInfo}>
                <Text style={[styles.bathName, { color: colors.accent }]}>{bath.name}</Text>
                <Text style={[styles.bathFreqs, { color: colors.primary }]}>
                  {bath.frequencies.map(f => `${f}Hz`).join(' + ')}
                </Text>
              </View>
              <View style={styles.bathActions}>
                <Pressable
                  style={[styles.bathPlayBtn, { backgroundColor: playingBathId === bath.id ? '#ef4444' : '#10b981' }]}
                  onPress={() => handlePlayBath(bath)}
                >
                  <Text style={styles.bathPlayBtnText}>
                    {playingBathId === bath.id ? '⏹️' : '▶️'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.bathFavBtn, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => addFavorite(bath.id, 'bath', profile?.id)}
                >
                  <Text style={styles.bathFavBtnText}>
                    {isFavorite(bath.id) ? '💜' : '🤍'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Composer Baths */}
        {composerBaths.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>🎨 Your Custom Baths</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>From Composer & Favorites</Text>
            {composerBaths.map(bath => (
              <View key={bath.id} style={[styles.bathItem, { backgroundColor: colors.background, borderColor: colors.primary }]}>
                <View style={styles.bathInfo}>
                  <View style={styles.bathNameRow}>
                    <Text style={[styles.bathName, { color: colors.accent }]}>{bath.name}</Text>
                    <View style={[styles.customBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.customBadgeText}>Custom</Text>
                    </View>
                  </View>
                  <Text style={[styles.bathFreqs, { color: colors.primary }]}>
                    {bath.layers.map(l => `${l.hz}Hz`).join(' + ')}
                  </Text>
                </View>
                <View style={styles.bathActions}>
                  <Pressable
                    style={[styles.bathPlayBtn, { backgroundColor: playingBathId === bath.id ? '#ef4444' : '#10b981' }]}
                    onPress={() => handlePlayBath(bath)}
                  >
                    <Text style={styles.bathPlayBtnText}>
                      {playingBathId === bath.id ? '⏹️' : '▶️'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.deleteBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]}
                    onPress={() => deleteCustomBath(bath.id)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Manifestation Category Baths */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>🌟 Manifestation Collection</Text>
          {FREQUENCY_BATHS.filter(b => b.category === 'manifestation').slice(0, 8).map(bath => (
            <View key={bath.id} style={[styles.bathItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.bathInfo}>
                <Text style={[styles.bathName, { color: colors.accent }]}>{bath.name}</Text>
                <Text style={[styles.bathFreqs, { color: colors.primary }]}>
                  {bath.frequencies.map(f => `${f}Hz`).join(' + ')}
                </Text>
                <Text style={[styles.bathDescription, { color: colors.textMuted }]} numberOfLines={2}>
                  {bath.description}
                </Text>
              </View>
              <View style={styles.bathActions}>
                <Pressable
                  style={[styles.bathPlayBtn, playingBathId === bath.id && styles.bathPlayBtnActive]}
                  onPress={() => handlePlayBath(bath)}
                >
                  <Text style={styles.bathPlayBtnText}>
                    {playingBathId === bath.id ? '⏹️' : '▶️'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.bathFavBtn, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => addFavorite(bath.id, 'bath', profile?.id)}
                >
                  <Text style={styles.bathFavBtnText}>
                    {isFavorite(bath.id) ? '💜' : '🤍'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render progress tab
  const renderProgressTab = () => (
    <View>
      {/* Stats Overview */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>📊 Your Journey</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{state.stats.sessions}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{state.stats.minutes}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Minutes</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{state.stats.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{state.stats.intentions}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Intentions</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🏆 Achievements</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENT_CATALOG.map(achievement => {
            const unlocked = state.achievements[achievement.id];
            return (
              <View key={achievement.id} style={[
                styles.achievementItem, 
                { 
                  backgroundColor: unlocked ? (isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)') : colors.background,
                  borderColor: unlocked ? colors.primary : colors.border,
                }
              ]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[styles.achievementName, { color: unlocked ? colors.primary : colors.textMuted }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDesc, { color: colors.textMuted }]}>{achievement.description}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Motivation */}
      <View style={[styles.card, styles.motivationCard, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', borderColor: colors.primary }]}>
        <Text style={[styles.motivationQuote, { color: colors.text }]}>
          "Your thoughts become things. Choose the good ones."
        </Text>
        <Text style={[styles.motivationAuthor, { color: colors.textSecondary }]}>— Mike Dooley</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.accent }]}>Manifestation Hub</Text>
        <Text style={[styles.subheading, { color: isDark ? '#fef3c7' : '#92400e' }]}>Program your reality with intention</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        {[
          { key: 'intention' as const, label: '🎯 Intent' },
          { key: 'session' as const, label: '⏱️ Session' },
          { key: 'baths' as const, label: '🎵 Baths' },
          { key: 'progress' as const, label: '📊 Progress' },
        ].map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { backgroundColor: colors.primary }]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#ffffff' : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'intention' && renderIntentionTab()}
      {activeTab === 'session' && renderSessionTab()}
      {activeTab === 'baths' && renderBathsTab()}
      {activeTab === 'progress' && renderProgressTab()}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fde68a',
    marginBottom: 4,
  },
  subheading: {
    color: '#fef3c7',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0b1120',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#4338ca',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e7ff',
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: -12,
    marginBottom: 16,
  },
  intentionCard: {
    borderColor: '#4338ca',
    backgroundColor: '#1e1b4b',
  },
  intentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  intentionEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  intentionInfo: {
    flex: 1,
  },
  intentionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fde68a',
  },
  intentionCategory: {
    color: '#a5b4fc',
    fontSize: 14,
  },
  intentionDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginVertical: 8,
  },
  categoryBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryBtnActive: {
    backgroundColor: '#4338ca',
    borderColor: '#6366f1',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  intensityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  intensityBtnActive: {
    backgroundColor: '#4338ca',
    borderColor: '#6366f1',
  },
  intensityText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  intensityTextActive: {
    color: '#ffffff',
  },
  setBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  setBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  timerCard: {
    alignItems: 'center',
    borderColor: '#4338ca',
  },
  timerLabel: {
    color: '#a5b4fc',
    fontSize: 16,
    marginBottom: 12,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '800',
    color: '#fde68a',
    fontVariant: ['tabular-nums'],
  },
  timerButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  startBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  pauseBtn: {
    backgroundColor: '#f59e0b',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  pauseBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resumeBtn: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  resumeBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  stopBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  stopBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  tipItem: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 24,
  },
  reminderCard: {
    backgroundColor: '#1e1b4b',
    borderColor: '#4338ca',
    alignItems: 'center',
  },
  reminderLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    marginBottom: 4,
  },
  reminderTitle: {
    color: '#fde68a',
    fontSize: 18,
    fontWeight: '700',
  },
  bathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  bathInfo: {
    flex: 1,
  },
  bathNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bathName: {
    color: '#e0e7ff',
    fontSize: 16,
    fontWeight: '600',
  },
  customBadge: {
    backgroundColor: '#4338ca',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  customBadgeText: {
    color: '#e0e7ff',
    fontSize: 10,
    fontWeight: '700',
  },
  bathFreqs: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  bathDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  bathActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bathPlayBtn: {
    backgroundColor: '#4338ca',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bathPlayBtnActive: {
    backgroundColor: '#ef4444',
  },
  bathPlayBtnText: {
    fontSize: 18,
  },
  bathFavBtn: {
    backgroundColor: '#374151',
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bathFavBtnText: {
    fontSize: 18,
  },
  deleteBtn: {
    borderRadius: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 18,
  },
  emptyHint: {
    color: '#64748b',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fde68a',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  achievementNameUnlocked: {
    color: '#fde68a',
  },
  achievementDesc: {
    color: '#475569',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  motivationCard: {
    backgroundColor: '#1e1b4b',
    borderColor: '#4338ca',
    alignItems: 'center',
  },
  motivationQuote: {
    color: '#e0e7ff',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 26,
  },
  motivationAuthor: {
    color: '#a5b4fc',
    fontSize: 14,
    marginTop: 12,
  },
});
