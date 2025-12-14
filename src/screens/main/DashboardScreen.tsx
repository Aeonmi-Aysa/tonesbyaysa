import { ScrollView, StyleSheet, Text, View, Pressable, FlatList, Modal, Alert } from 'react-native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { FREQUENCIES, getAvailableFrequencies, FREQUENCY_BATHS, getAvailableBaths, type Frequency, type FrequencyBath } from '@/lib/frequencies';
import { frequencyPlayer, playHealingFrequency, playSolfeggioFrequency, playChakraFrequency, playBinauralBeat, stopAllFrequencies, testAudio, playFrequencyBath } from '@/lib/audioEngine';
import { useState, useEffect, useRef } from 'react';
import { SpectrumVisualizer } from '@/components/WaveformVisualizer';

// Time-based frequency recommendations
const getTimeBasedRecommendation = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 9) {
    return { 
      mood: 'Morning Energy', 
      emoji: '🌅',
      freq: FREQUENCIES.find(f => f.hz === 528) || FREQUENCIES[0],
      bath: FREQUENCY_BATHS.find(b => b.id === 'bath-chakra-alignment'),
      tip: 'Start your day with heart-opening 528Hz'
    };
  } else if (hour >= 9 && hour < 12) {
    return { 
      mood: 'Focus & Clarity', 
      emoji: '🧠',
      freq: FREQUENCIES.find(f => f.hz === 40) || FREQUENCIES.find(f => f.category === 'binaural'),
      bath: FREQUENCY_BATHS.find(b => b.id === 'bath-focus'),
      tip: 'Gamma waves boost concentration and memory'
    };
  } else if (hour >= 12 && hour < 17) {
    return { 
      mood: 'Afternoon Boost', 
      emoji: '⚡',
      freq: FREQUENCIES.find(f => f.hz === 741),
      bath: FREQUENCY_BATHS.find(b => b.id === 'bath-mental-clarity'),
      tip: 'Clear mental fog and enhance problem-solving'
    };
  } else if (hour >= 17 && hour < 21) {
    return { 
      mood: 'Evening Wind Down', 
      emoji: '🌆',
      freq: FREQUENCIES.find(f => f.hz === 639),
      bath: FREQUENCY_BATHS.find(b => b.id === 'bath-stress-release'),
      tip: 'Harmonize emotions and release daily stress'
    };
  } else {
    return { 
      mood: 'Sleep Preparation', 
      emoji: '🌙',
      freq: FREQUENCIES.find(f => f.hz === 174) || FREQUENCIES.find(f => f.category === 'healing'),
      bath: FREQUENCY_BATHS.find(b => b.id === 'bath-deep-sleep'),
      tip: 'Deep relaxation for restorative sleep'
    };
  }
};

export function DashboardScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const { favorites, loadFavorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingFrequency, setPlayingFrequency] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'frequencies' | 'baths'>('frequencies');
  
  // Sleep timer state
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number>(0);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Daily recommendation
  const dailyRec = getTimeBasedRecommendation();
  
  const subscriptionTier = profile?.subscription_tier || 'free';
  const availableFrequencies = getAvailableFrequencies(subscriptionTier);
  const availableBaths = getAvailableBaths(subscriptionTier);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites(profile?.id);
  }, [profile?.id]);
  
  // Sleep timer effect
  useEffect(() => {
    if (sleepTimerMinutes !== null && sleepTimerRemaining > 0) {
      sleepTimerRef.current = setInterval(() => {
        setSleepTimerRemaining(prev => {
          if (prev <= 1) {
            // Timer finished - stop audio
            stopAllFrequencies();
            setPlayingFrequency(null);
            setSleepTimerMinutes(null);
            Alert.alert('⏰ Sleep Timer', 'Audio stopped. Sweet dreams!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepTimerMinutes, sleepTimerRemaining]);

  const startSleepTimer = (minutes: number) => {
    setSleepTimerMinutes(minutes);
    setSleepTimerRemaining(minutes * 60);
    setShowSleepTimerModal(false);
    Alert.alert('⏰ Sleep Timer Set', `Audio will stop in ${minutes} minutes`);
  };

  const cancelSleepTimer = () => {
    setSleepTimerMinutes(null);
    setSleepTimerRemaining(0);
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
  };

  const formatSleepTimerRemaining = () => {
    const mins = Math.floor(sleepTimerRemaining / 60);
    const secs = sleepTimerRemaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get frequencies currently being played for visualizer
  const getPlayingFrequencies = (): number[] => {
    if (!playingFrequency) return [];
    
    // Check if it's a bath
    const bath = FREQUENCY_BATHS.find(b => b.id === playingFrequency);
    if (bath) return bath.frequencies;
    
    // Check if it's a single frequency
    const freq = FREQUENCIES.find(f => f.id === playingFrequency);
    if (freq) return [freq.hz];
    
    return [];
  };

  const handleToggleFavorite = (id: string, type: 'frequency' | 'bath') => {
    if (isFavorite(id)) {
      removeFavorite(id, profile?.id);
    } else {
      addFavorite(id, type, profile?.id);
    }
  };
  
  const filteredFrequencies = selectedCategory === 'all' 
    ? availableFrequencies 
    : availableFrequencies.filter(f => f.category === selectedCategory);

  const filteredBaths = selectedCategory === 'all'
    ? availableBaths
    : availableBaths.filter(b => b.category === selectedCategory);

  const frequencyCategories = [
    { id: 'all', name: 'All', count: availableFrequencies.length },
    { id: 'solfeggio', name: 'Solfeggio', count: availableFrequencies.filter(f => f.category === 'solfeggio').length },
    { id: 'chakra', name: 'Chakra', count: availableFrequencies.filter(f => f.category === 'chakra').length },
    { id: 'binaural', name: 'Binaural', count: availableFrequencies.filter(f => f.category === 'binaural').length },
    { id: 'healing', name: 'Healing', count: availableFrequencies.filter(f => f.category === 'healing').length }
  ];

  const bathCategories = [
    { id: 'all', name: 'All', count: availableBaths.length },
    { id: 'healing', name: 'Healing', count: availableBaths.filter(b => b.category === 'healing').length },
    { id: 'mental', name: 'Mental', count: availableBaths.filter(b => b.category === 'mental').length },
    { id: 'spiritual', name: 'Spiritual', count: availableBaths.filter(b => b.category === 'spiritual').length },
    { id: 'emotional', name: 'Emotional', count: availableBaths.filter(b => b.category === 'emotional').length },
    { id: 'psychic', name: 'Psychic', count: availableBaths.filter(b => b.category === 'psychic').length },
    { id: 'manifestation', name: 'Manifest', count: availableBaths.filter(b => b.category === 'manifestation').length },
    { id: 'metaphysical', name: 'Meta', count: availableBaths.filter(b => b.category === 'metaphysical').length }
  ];

  const categories = viewMode === 'frequencies' ? frequencyCategories : bathCategories;

  const handlePlayFrequency = async (frequency: Frequency) => {
    try {
      // Stop any currently playing frequency
      if (playingFrequency) {
        await stopAllFrequencies();
        if (playingFrequency === frequency.id) {
          setPlayingFrequency(null);
          return; // Toggle off if same frequency
        }
      }

      setPlayingFrequency(frequency.id);
      
      // Convert duration from seconds to milliseconds
      // Use a long duration (30 minutes) for continuous playback until user stops
      const durationMs = 30 * 60 * 1000; // 30 minutes - effectively continuous
      
      // Determine playback method based on ACTUAL frequency Hz value, not just category
      // Sub-20Hz frequencies need isochronic/binaural beats (they're below audible range)
      // 20Hz and above are audible and should play as regular tones
      const isSubAudible = frequency.hz < 20;
      
      if (isSubAudible && frequency.category === 'binaural') {
        // For sub-audible brainwave entrainment (0.5Hz - 19Hz)
        // Use isochronic tones with a carrier frequency
        const carrierHz = 200; // Audible carrier tone
        const brainwaveHz = frequency.hz; // Target brainwave frequency
        await playBinauralBeat(carrierHz, brainwaveHz, durationMs);
      } else {
        // For audible frequencies (20Hz+), play the actual tone directly
        switch (frequency.category) {
          case 'solfeggio':
            await playSolfeggioFrequency(frequency.hz, durationMs);
            break;
          case 'chakra':
            await playChakraFrequency(frequency.hz, durationMs);
            break;
          case 'binaural':
            // 20Hz+ "binaural" frequencies like Gamma 40Hz are actually audible
            // Play them as regular healing tones
            await playHealingFrequency(frequency.hz, durationMs);
            break;
          case 'healing':
          default:
            await playHealingFrequency(frequency.hz, durationMs);
            break;
        }
      }

      // Note: User manually stops by tapping again or selecting another frequency
      // No auto-stop timeout needed for continuous playback

    } catch (error) {
      console.error('Error playing frequency:', error);
      setPlayingFrequency(null);
    }
  };

  const handlePlayBath = async (bath: FrequencyBath) => {
    try {
      // Stop any currently playing audio
      if (playingFrequency) {
        await stopAllFrequencies();
        if (playingFrequency === bath.id) {
          setPlayingFrequency(null);
          return; // Toggle off if same bath
        }
      }

      setPlayingFrequency(bath.id);
      
      // Play the bath (layered frequencies)
      const durationMs = 30 * 60 * 1000; // 30 minutes
      await playFrequencyBath(bath.frequencies, durationMs);

    } catch (error) {
      console.error('Error playing bath:', error);
      setPlayingFrequency(null);
    }
  };

  const renderFrequencyCard = ({ item }: { item: Frequency }) => {
    const isPlaying = playingFrequency === item.id;
    const isFav = isFavorite(item.id);
    
    return (
      <View style={[styles.frequencyCard, isFav && styles.favoriteGlow]}>
        <View style={styles.frequencyHeader}>
          <Text style={styles.frequencyName}>{item.name}</Text>
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.favoriteBtn}
              onPress={() => handleToggleFavorite(item.id, 'frequency')}
            >
              <Text style={[styles.favoriteIcon, isFav && styles.favoriteIconActive]}>
                {isFav ? '💜' : '🤍'}
              </Text>
            </Pressable>
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyHz}>{item.hz}Hz</Text>
            </View>
          </View>
        </View>
        <Text style={styles.frequencyDescription}>{item.description}</Text>
        <View style={styles.benefitsContainer}>
          {item.benefits.slice(0, 3).map((benefit, index) => (
            <Text key={index} style={styles.benefit}>• {benefit}</Text>
          ))}
        </View>
        <Pressable 
          style={[
            styles.playButton, 
            isPlaying && styles.playButtonPlaying,
            item.isPremium && subscriptionTier === 'free' && styles.playButtonDisabled
          ]}
          onPress={() => handlePlayFrequency(item)}
          disabled={item.isPremium && subscriptionTier === 'free'}
        >
          <Text style={[
            styles.playButtonText, 
            item.isPremium && subscriptionTier === 'free' && styles.playButtonTextDisabled
          ]}>
            {item.isPremium && subscriptionTier === 'free' 
              ? 'Premium' 
              : isPlaying 
              ? '⏸️ Stop' 
              : '▶️ Play'
            }
          </Text>
        </Pressable>
      </View>
    );
  };

  // Helper to check if bath has low frequencies that benefit from headphones
  const hasLowFrequencies = (frequencies: number[]) => {
    return frequencies.some(f => f < 80);
  };

  const renderBathCard = ({ item }: { item: FrequencyBath }) => {
    const isPlaying = playingFrequency === item.id;
    const needsHeadphones = hasLowFrequencies(item.frequencies);
    const isFav = isFavorite(item.id);
    
    return (
      <View style={[styles.frequencyCard, styles.bathCard, isFav && styles.favoriteGlow]}>
        <View style={styles.frequencyHeader}>
          <Text style={styles.frequencyName}>🛁 {item.name}</Text>
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.favoriteBtn}
              onPress={() => handleToggleFavorite(item.id, 'bath')}
            >
              <Text style={[styles.favoriteIcon, isFav && styles.favoriteIconActive]}>
                {isFav ? '💜' : '🤍'}
              </Text>
            </Pressable>
            <View style={[styles.frequencyBadge, styles.bathBadge]}>
              <Text style={styles.frequencyHz}>{item.frequencies.length} tones</Text>
            </View>
          </View>
        </View>
        <Text style={styles.frequencyDescription}>{item.description}</Text>
        <Text style={styles.bathFrequencies}>
          Frequencies: {item.frequencies.map(f => `${f}Hz`).join(' + ')}
        </Text>
        {needsHeadphones && (
          <View style={styles.headphoneNote}>
            <Text style={styles.headphoneNoteText}>
              🎧 For optimal experience with low frequencies, use headphones
            </Text>
          </View>
        )}
        <View style={styles.benefitsContainer}>
          {item.benefits.slice(0, 3).map((benefit, index) => (
            <Text key={index} style={styles.benefit}>• {benefit}</Text>
          ))}
        </View>
        <Pressable 
          style={[
            styles.playButton, 
            isPlaying && styles.playButtonPlaying,
            item.isPremium && subscriptionTier === 'free' && styles.playButtonDisabled
          ]}
          onPress={() => handlePlayBath(item)}
          disabled={item.isPremium && subscriptionTier === 'free'}
        >
          <Text style={[
            styles.playButtonText, 
            item.isPremium && subscriptionTier === 'free' && styles.playButtonTextDisabled
          ]}>
            {item.isPremium && subscriptionTier === 'free' 
              ? 'Premium' 
              : isPlaying 
              ? '⏸️ Stop' 
              : '▶️ Play Bath'
            }
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Healing Library</Text>
        <Text style={styles.subheading}>Welcome back, {profile?.full_name || 'friend'}</Text>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Subscription</Text>
          <Text style={styles.statusValue}>{subscriptionTier.toUpperCase()}</Text>
          <Text style={styles.statusHint}>
            {subscriptionTier === 'free' 
              ? `${availableFrequencies.length} frequencies + ${availableBaths.filter(b => !b.isPremium).length} baths` 
              : `${availableFrequencies.length} frequencies + ${availableBaths.length} baths`}
          </Text>
        </View>
      </View>

      {/* Daily Recommendation Card */}
      <View style={styles.dailyRecCard}>
        <View style={styles.dailyRecHeader}>
          <Text style={styles.dailyRecEmoji}>{dailyRec.emoji}</Text>
          <View style={styles.dailyRecInfo}>
            <Text style={styles.dailyRecMood}>{dailyRec.mood}</Text>
            <Text style={styles.dailyRecTip}>{dailyRec.tip}</Text>
          </View>
        </View>
        <View style={styles.dailyRecButtons}>
          {dailyRec.freq && (
            <Pressable 
              style={[styles.dailyRecBtn, playingFrequency === dailyRec.freq.id && styles.dailyRecBtnPlaying]}
              onPress={() => dailyRec.freq && handlePlayFrequency(dailyRec.freq)}
            >
              <Text style={styles.dailyRecBtnText}>
                {playingFrequency === dailyRec.freq?.id ? '⏹️' : '▶️'} {dailyRec.freq.hz}Hz
              </Text>
            </Pressable>
          )}
          {dailyRec.bath && (
            <Pressable 
              style={[styles.dailyRecBtn, styles.dailyRecBtnBath, playingFrequency === dailyRec.bath.id && styles.dailyRecBtnPlaying]}
              onPress={() => dailyRec.bath && handlePlayBath(dailyRec.bath)}
            >
              <Text style={styles.dailyRecBtnText}>
                {playingFrequency === dailyRec.bath?.id ? '⏹️' : '🛁'} Bath
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Sleep Timer */}
      {playingFrequency && (
        <View style={styles.sleepTimerBar}>
          {sleepTimerMinutes ? (
            <View style={styles.sleepTimerActive}>
              <Text style={styles.sleepTimerText}>⏰ Sleep Timer: {formatSleepTimerRemaining()}</Text>
              <Pressable style={styles.sleepTimerCancel} onPress={cancelSleepTimer}>
                <Text style={styles.sleepTimerCancelText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.sleepTimerBtn} onPress={() => setShowSleepTimerModal(true)}>
              <Text style={styles.sleepTimerBtnText}>⏰ Set Sleep Timer</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Sleep Timer Modal */}
      <Modal visible={showSleepTimerModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSleepTimerModal(false)}>
          <View style={styles.sleepTimerModal}>
            <Text style={styles.sleepTimerModalTitle}>⏰ Sleep Timer</Text>
            <Text style={styles.sleepTimerModalSubtitle}>Stop audio after:</Text>
            <View style={styles.sleepTimerOptions}>
              {[5, 10, 15, 30, 45, 60].map(mins => (
                <Pressable key={mins} style={styles.sleepTimerOption} onPress={() => startSleepTimer(mins)}>
                  <Text style={styles.sleepTimerOptionText}>{mins} min</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.sleepTimerModalClose} onPress={() => setShowSleepTimerModal(false)}>
              <Text style={styles.sleepTimerModalCloseText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Real-time Visualizer - shows when playing */}
      {playingFrequency && (
        <View style={styles.visualizerSection}>
          <Text style={styles.visualizerLabel}>🎵 Now Playing</Text>
          <SpectrumVisualizer 
            isPlaying={!!playingFrequency}
            frequencies={getPlayingFrequencies()}
            height={50}
            barCount={20}
          />
        </View>
      )}

      {/* View Mode Toggle */}
      <View style={styles.modeToggle}>
        <Pressable
          style={[styles.modeButton, viewMode === 'frequencies' && styles.modeButtonActive]}
          onPress={() => { setViewMode('frequencies'); setSelectedCategory('all'); }}
        >
          <Text style={[styles.modeButtonText, viewMode === 'frequencies' && styles.modeButtonTextActive]}>
            🎵 Single Frequencies
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, viewMode === 'baths' && styles.modeButtonActive]}
          onPress={() => { setViewMode('baths'); setSelectedCategory('all'); }}
        >
          <Text style={[styles.modeButtonText, viewMode === 'baths' && styles.modeButtonTextActive]}>
            🛁 Healing Baths
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
              {category.name} ({category.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Audio Test Button */}
      <Pressable 
        style={styles.testButton}
        onPress={() => testAudio()}
      >
        <Text style={styles.testButtonText}>🧪 Test Audio System</Text>
      </Pressable>

      {viewMode === 'frequencies' ? (
        <FlatList
          data={filteredFrequencies}
          renderItem={renderFrequencyCard}
          keyExtractor={(item) => item.id}
          numColumns={1}
          scrollEnabled={false}
          contentContainerStyle={styles.frequenciesList}
        />
      ) : (
        <FlatList
          data={filteredBaths}
          renderItem={renderBathCard}
          keyExtractor={(item) => item.id}
          numColumns={1}
          scrollEnabled={false}
          contentContainerStyle={styles.frequenciesList}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712'
  },
  header: {
    padding: 24,
    gap: 12
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9'
  },
  subheading: {
    color: '#94a3b8',
    fontSize: 16
  },
  statusCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  statusLabel: {
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 4
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 4
  },
  statusHint: {
    color: '#64748b',
    fontSize: 14
  },
  categoryContainer: {
    paddingHorizontal: 24,
    marginBottom: 16
  },
  categoryButton: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryButtonActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7'
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600'
  },
  categoryTextActive: {
    color: '#ffffff'
  },
  frequenciesList: {
    paddingHorizontal: 24,
    gap: 16
  },
  frequencyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12
  },
  frequencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  favoriteBtn: {
    padding: 6
  },
  favoriteIcon: {
    fontSize: 18
  },
  favoriteIconActive: {
    transform: [{ scale: 1.1 }]
  },
  favoriteGlow: {
    borderColor: '#be185d',
    borderWidth: 2,
    // Deep dark neon magenta glow effect
    shadowColor: '#be185d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
    backgroundColor: 'rgba(190, 24, 93, 0.08)'
  },
  frequencyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1
  },
  frequencyBadge: {
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  frequencyHz: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600'
  },
  frequencyDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20
  },
  benefitsContainer: {
    gap: 4
  },
  benefit: {
    color: '#94a3b8',
    fontSize: 13
  },
  playButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  playButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6
  },
  playButtonPlaying: {
    backgroundColor: '#ef4444', // Red color when playing
    transform: [{ scale: 0.98 }], // Slightly smaller when active
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  playButtonTextDisabled: {
    color: '#9ca3af'
  },
  testButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center'
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  modeButtonActive: {
    backgroundColor: '#a855f7'
  },
  modeButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600'
  },
  modeButtonTextActive: {
    color: '#ffffff'
  },
  bathCard: {
    borderColor: '#3b0764',
    borderWidth: 2
  },
  bathBadge: {
    backgroundColor: '#3b0764'
  },
  bathFrequencies: {
    color: '#c084fc',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -4
  },
  headphoneNote: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#a855f7'
  },
  headphoneNoteText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontStyle: 'italic'
  },
  // Daily Recommendation
  dailyRecCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  dailyRecHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  dailyRecEmoji: {
    fontSize: 40,
    marginRight: 12
  },
  dailyRecInfo: {
    flex: 1
  },
  dailyRecMood: {
    color: '#fde68a',
    fontSize: 18,
    fontWeight: '700'
  },
  dailyRecTip: {
    color: '#a5b4fc',
    fontSize: 13,
    marginTop: 2
  },
  dailyRecButtons: {
    flexDirection: 'row',
    gap: 10
  },
  dailyRecBtn: {
    backgroundColor: '#4338ca',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center'
  },
  dailyRecBtnBath: {
    backgroundColor: '#7c3aed'
  },
  dailyRecBtnPlaying: {
    backgroundColor: '#ef4444'
  },
  dailyRecBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  // Sleep Timer
  sleepTimerBar: {
    marginHorizontal: 24,
    marginBottom: 16
  },
  sleepTimerBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  sleepTimerBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600'
  },
  sleepTimerActive: {
    backgroundColor: '#1e1b4b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#4338ca'
  },
  sleepTimerText: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '600'
  },
  sleepTimerCancel: {
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sleepTimerCancelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sleepTimerModal: {
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sleepTimerModalTitle: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8
  },
  sleepTimerModalSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20
  },
  sleepTimerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center'
  },
  sleepTimerOption: {
    backgroundColor: '#4338ca',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center'
  },
  sleepTimerOptionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  sleepTimerModalClose: {
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center'
  },
  sleepTimerModalCloseText: {
    color: '#94a3b8',
    fontSize: 16
  },
  // Visualizer
  visualizerSection: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)'
  },
  visualizerLabel: {
    color: '#a855f7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  }
});
