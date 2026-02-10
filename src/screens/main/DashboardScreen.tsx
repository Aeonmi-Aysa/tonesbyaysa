import { ScrollView, StyleSheet, Text, View, Pressable, FlatList, Modal, Alert } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTheme } from '@/store/useThemeStore';
import { FREQUENCIES, getAvailableFrequencies, FREQUENCY_BATHS, getAvailableBaths, type Frequency, type FrequencyBath } from '@/lib/frequencies';
import { testAudio } from '@/lib/audioEngineExpo';
// REMOVED COMPLEX AUDIO ENGINE IMPORTS - USE DIRECT CALLS ONLY
import { useState, useEffect, useRef } from 'react';
import { SpectrumVisualizer } from '@/components/WaveformVisualizer';
import { PulsingBackground } from '@/components/PulsingBackground';
import { PricingScreen } from './PricingScreen';

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
  const navigation = useNavigation<NavigationProp<any>>();
  const profile = useSessionStore((state: SessionState) => state.profile);
  const { favorites, loadFavorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingFrequency, setPlayingFrequency] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'frequencies' | 'baths'>('frequencies');
  const [showPricing, setShowPricing] = useState(false);
  
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

  // PAYWALL MODAL FIX: Ensure PricingScreen renders without crashes
  const handlePricingOpen = () => {
    try {
      setShowPricing(true);
    } catch (error) {
      console.error('Error opening pricing:', error);
      Alert.alert('Error', 'Could not open pricing screen');
    }
  };

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

  // Get current frequency for pulsing background
  const getCurrentFrequency = (): number => {
    if (!playingFrequency) return 528; // Default
    
    // Check if it's a single frequency first
    const freq = FREQUENCIES.find(f => f.id === playingFrequency);
    if (freq) return freq.hz;
    
    // Check if it's a bath - use first frequency
    const bath = FREQUENCY_BATHS.find(b => b.id === playingFrequency);
    if (bath && bath.frequencies.length > 0) return bath.frequencies[0];
    
    return 528; // Default fallback
  };

  const handleToggleFavorite = (id: string, type: 'frequency' | 'bath') => {
    console.log('🔄 Toggle favorite:', id, type);
    if (isFavorite(id)) {
      console.log('❌ Removing favorite:', id);
      removeFavorite(id, profile?.id);
    } else {
      console.log('💜 Adding favorite:', id);
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
    { id: 'healing', name: 'Wellness', count: availableFrequencies.filter(f => f.category === 'healing').length },
    { id: 'rife', name: 'Rife', count: availableFrequencies.filter(f => f.category === 'rife').length },
    { id: 'angel', name: 'Angel', count: availableFrequencies.filter(f => f.category === 'angel').length },
    { id: 'crystal', name: 'Crystal', count: availableFrequencies.filter(f => f.category === 'crystal').length },
    { id: 'planetary', name: 'Planetary', count: availableFrequencies.filter(f => f.category === 'planetary').length },
    { id: 'organ', name: 'Organ', count: availableFrequencies.filter(f => f.category === 'organ').length },
    { id: 'emotion', name: 'Emotion', count: availableFrequencies.filter(f => f.category === 'emotion').length },
    { id: 'dna', name: 'DNA', count: availableFrequencies.filter(f => f.category === 'dna').length },
    { id: 'brain', name: 'Brain', count: availableFrequencies.filter(f => f.category === 'brain').length },
    { id: 'sleep', name: 'Sleep', count: availableFrequencies.filter(f => f.category === 'sleep').length },
    { id: 'energy', name: 'Energy', count: availableFrequencies.filter(f => f.category === 'energy').length },
    { id: 'manifestation', name: 'Manifest', count: availableFrequencies.filter(f => f.category === 'manifestation').length },
    { id: 'color', name: 'Color', count: availableFrequencies.filter(f => f.category === 'color').length },
    { id: 'schumann', name: 'Earth', count: availableFrequencies.filter(f => f.category === 'schumann').length },
    { id: 'tesla', name: 'Tesla', count: availableFrequencies.filter(f => f.category === 'tesla').length },
    { id: 'sacred', name: 'Sacred', count: availableFrequencies.filter(f => f.category === 'sacred').length },
    { id: 'tibetan', name: 'Tibetan', count: availableFrequencies.filter(f => f.category === 'tibetan').length },
    { id: 'vedic', name: 'Vedic', count: availableFrequencies.filter(f => f.category === 'vedic').length },
    { id: 'egyptian', name: 'Egyptian', count: availableFrequencies.filter(f => f.category === 'egyptian').length },
  ];

  const bathCategories = [
    { id: 'all', name: 'All', count: availableBaths.length },
    { id: 'healing', name: 'Wellness', count: availableBaths.filter(b => b.category === 'healing').length },
    { id: 'mental', name: 'Mental', count: availableBaths.filter(b => b.category === 'mental').length },
    { id: 'spiritual', name: 'Spiritual', count: availableBaths.filter(b => b.category === 'spiritual').length },
    { id: 'emotional', name: 'Emotional', count: availableBaths.filter(b => b.category === 'emotional').length },
    { id: 'psychic', name: 'Psychic', count: availableBaths.filter(b => b.category === 'psychic').length },
    { id: 'manifestation', name: 'Manifest', count: availableBaths.filter(b => b.category === 'manifestation').length },
    { id: 'metaphysical', name: 'Meta', count: availableBaths.filter(b => b.category === 'metaphysical').length },
    { id: 'sleep', name: 'Sleep', count: availableBaths.filter(b => b.category === 'sleep').length },
  ];

  const categories = viewMode === 'frequencies' ? frequencyCategories : bathCategories;

  // COMPREHENSIVE STOP FUNCTION
  const stopAllFrequencies = async () => {
    try {
      console.log('⏹️ STOPPING ALL AUDIO');
      
      // Import both the global player and Audio module
      const [audioModule, engineModule] = await Promise.all([
        import('expo-av'),
        import('@/lib/audioEngineExpo')
      ]);
      
      // Stop the global player
      await engineModule.frequencyPlayerExpo.stop();
      
      // Also stop all Audio instances globally (backup cleanup)
      try {
        await audioModule.Audio.stopAndUnloadAsync();
      } catch (e) {
        // May not be available, ignore
        console.log('🔇 Global audio stop not available');
      }
      
      console.log('✅ All audio stopped');
    } catch (error) {
      console.error('❌ Stop failed:', error);
    }
  };

  const handlePlayFrequency = async (frequency: Frequency) => {
    try {
      // Check if free user trying to access premium frequency
      if (subscriptionTier === 'free' && frequency.isPremium) {
        Alert.alert(
          '🔒 Premium Feature',
          'This frequency is only available with a paid subscription.\n\nUpgrade now to unlock all 500+ healing frequencies!',
          [
            { text: 'Cancel', onPress: () => {} },
            {
              text: 'Upgrade',
              onPress: () => {
                navigation.navigate('Paywall' as never);
              }
            }
          ]
        );
        return;
      }

      console.log('🎵 SIMPLE PLAY:', frequency.name, frequency.hz + 'Hz');
      
      // Check if same frequency is playing - stop it
      if (playingFrequency === frequency.id) {
        console.log('⏹️ Stopping same frequency');
        await stopAllFrequencies();
        setPlayingFrequency(null);
        console.log('🔄 Frequency stopped');
        return;
      }
      
      // Stop any currently playing frequency first
      if (playingFrequency) {
        console.log('⏹️ Stopping different frequency first');
        await stopAllFrequencies();
      }

      console.log('🎯 Starting new audio...');
      setPlayingFrequency(frequency.id);
      
      // USE GLOBAL PLAYER FOR CONSISTENT STATE
      const { frequencyPlayerExpo } = await import('@/lib/audioEngineExpo');
      await frequencyPlayerExpo.initialize();
      
      // Just play the frequency - simple and reliable
      if (frequency.hz < 20) {
        // Sub-audible -> binaural beat
        await frequencyPlayerExpo.playBinauralBeat(200, frequency.hz, 30000);
      } else {
        // Audible -> direct tone
        await frequencyPlayerExpo.playFrequency(frequency.hz, 30000, 'sine');
      }
      
      console.log('✅ Audio started successfully');
    } catch (error) {
      console.error('❌ Audio failed:', error);
      Alert.alert('Audio Error', String(error));
      setPlayingFrequency(null);
    }
  };

  const handlePlayBath = async (bath: FrequencyBath) => {
    try {
      // Check if free user trying to access premium bath
      if (subscriptionTier === 'free' && bath.isPremium) {
        Alert.alert(
          '🔒 Premium Feature',
          'This frequency bath is only available with a paid subscription.\n\nUpgrade now to unlock all healing experiences!',
          [
            { text: 'Cancel', onPress: () => {} },
            {
              text: 'Upgrade',
              onPress: () => {
                navigation.navigate('Paywall' as never);
              }
            }
          ]
        );
        return;
      }

      console.log('🛁 SIMPLE BATH PLAY:', bath.name);
      
      // Check if same bath is playing - stop it
      if (playingFrequency === bath.id) {
        console.log('⏹️ Stopping same bath');
        await stopAllFrequencies();
        setPlayingFrequency(null);
        console.log('🔄 Bath stopped');
        return;
      }

      // Stop any currently playing audio first
      if (playingFrequency) {
        console.log('⏹️ Stopping different audio first');
        await stopAllFrequencies();
      }

      console.log('🎯 Starting new bath...');
      setPlayingFrequency(bath.id);
      
      // USE PROGRESSIVE BATH FUNCTION FOR BEAUTIFUL LAYERING
      const { playFrequencyBath } = await import('@/lib/audioEngineExpo');
      await playFrequencyBath(bath.frequencies, 30000);
      
      console.log('✅ Bath audio started');
    } catch (error) {
      console.error('❌ Bath failed:', error);
      Alert.alert('Bath Error', String(error));
      setPlayingFrequency(null);
    }
  };

  const renderFrequencyCard = ({ item }: { item: Frequency }) => {
    const isPlaying = playingFrequency === item.id;
    const isFav = isFavorite(item.id);
    
    return (
      <View style={[
        styles.frequencyCard, 
        { backgroundColor: colors.surface, borderColor: colors.border },
        isFav && (isDark ? styles.favoriteGlow : {
          borderColor: '#ffff00',
          borderWidth: 3,
          shadowColor: '#ffff00',
          shadowOpacity: 0.9,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 0 },
          elevation: 12,
          backgroundColor: '#fffef0'
        })
      ]}>
        <View style={styles.frequencyHeader}>
          <Text style={[styles.frequencyName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.favoriteBtn}
              onPress={() => {
                console.log('💜 Favorite button pressed:', item.name);
                handleToggleFavorite(item.id, 'frequency');
              }}
            >
              <Text style={[styles.favoriteIcon, isFav && styles.favoriteIconActive]}>
                {isFav ? '💜' : '🤍'}
              </Text>
            </Pressable>
            <View style={[styles.frequencyBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.frequencyHz, { color: '#ffffff' }]}>{item.hz}Hz</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.frequencyDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        <View style={styles.benefitsContainer}>
          {item.benefits.slice(0, 3).map((benefit, index) => (
            <Text key={index} style={[styles.benefit, { color: colors.textMuted }]}>• {benefit}</Text>
          ))}
        </View>
        <Pressable 
          style={[
            styles.playButton,
            { 
              backgroundColor: isDark ? '#1e293b' : colors.surface, 
              borderColor: isDark ? colors.primary : '#000000',
              borderWidth: isDark ? 1 : 3,
              shadowColor: isDark ? colors.primary : '#ffff00',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isDark ? 0.3 : 0.8,
              shadowRadius: isDark ? 8 : 12,
              elevation: isDark ? 6 : 12
            },
            isPlaying && { 
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOpacity: 0.6
            },
            !isDark && {
              borderColor: '#ffff00',
              shadowColor: '#ffff00',
              backgroundColor: '#ffffff'
            }
          ]}
          onPress={() => {
            console.log('🎯 Regular play button pressed:', item.name);
            handlePlayFrequency(item);
          }}
          disabled={false}
        >
          <Text style={[
            styles.playButtonText,
            { 
              color: isPlaying ? '#fff' : (isDark ? colors.primary : '#000000'),
              fontWeight: '800',
              textShadowColor: isDark ? 'transparent' : '#ffff00',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isDark ? 0 : 3
            }
          ]}>
            {isPlaying ? '⏸️ Stop' : '▶️ Play'}
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
      <View style={[
        styles.frequencyCard, 
        styles.bathCard, 
        { backgroundColor: colors.surface, borderColor: colors.border },
        isFav && (isDark ? styles.favoriteGlow : { 
          borderColor: '#ffff00',
          borderWidth: 3,
          shadowColor: '#ffff00',
          shadowOpacity: 0.9,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 0 },
          elevation: 12,
          backgroundColor: '#fffef0'
        })
      ]}>
        <View style={styles.frequencyHeader}>
          <Text style={[styles.frequencyName, { color: colors.text }]}>🛁 {item.name}</Text>
          <View style={styles.headerRight}>
            <Pressable 
              style={styles.favoriteBtn}
              onPress={() => handleToggleFavorite(item.id, 'bath')}
            >
              <Text style={[styles.favoriteIcon, isFav && styles.favoriteIconActive]}>
                {isFav ? '💜' : '🤍'}
              </Text>
            </Pressable>
            <View style={[styles.frequencyBadge, styles.bathBadge, { backgroundColor: isDark ? '#0891b2' : '#0d9488' }]}>
              <Text style={[styles.frequencyHz, { color: '#ffffff' }]}>{item.frequencies.length} tones</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.frequencyDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        <Text style={[styles.bathFrequencies, { color: colors.textMuted }]}>
          Frequencies: {item.frequencies.map(f => `${f}Hz`).join(' + ')}
        </Text>
        {needsHeadphones && (
          <View style={[styles.headphoneNote, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.15)' }]}>
            <Text style={styles.headphoneNoteText}>
              🎧 For optimal experience with low frequencies, use headphones
            </Text>
          </View>
        )}
        <View style={styles.benefitsContainer}>
          {item.benefits.slice(0, 3).map((benefit, index) => (
            <Text key={index} style={[styles.benefit, { color: colors.textMuted }]}>• {benefit}</Text>
          ))}
        </View>
        <Pressable 
          style={[
            styles.playButton, 
            { 
              backgroundColor: isDark ? '#1e293b' : colors.surface, 
              borderColor: isDark ? '#0891b2' : '#000000',
              borderWidth: isDark ? 1 : 3,
              shadowColor: isDark ? '#0891b2' : '#ffff00',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isDark ? 0.3 : 0.8,
              shadowRadius: isDark ? 8 : 12,
              elevation: isDark ? 6 : 12
            },
            isPlaying && { 
              backgroundColor: isDark ? '#0891b2' : '#0d9488',
              shadowOpacity: 0.6
            },
            !isDark && {
              borderColor: '#ffff00',
              shadowColor: '#ffff00',
              backgroundColor: '#ffffff'
            },
            item.isPremium && subscriptionTier === 'free' && styles.playButtonDisabled
          ]}
          onPress={() => handlePlayBath(item)}
          disabled={item.isPremium && subscriptionTier === 'free'}
        >
          <Text style={[
            styles.playButtonText, 
            { 
              color: isPlaying ? '#fff' : (isDark ? '#0891b2' : '#000000'),
              fontWeight: '800',
              textShadowColor: isDark ? 'transparent' : '#ffff00',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: isDark ? 0 : 3
            },
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
    <PulsingBackground 
      isActive={!!playingFrequency} 
      frequency={getCurrentFrequency()}
      intensity="medium"
    >
      <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>Wellness Library</Text>
        <Text style={[styles.subheading, { color: colors.textSecondary }]}>Welcome back, {profile?.full_name || 'friend'}</Text>
        
        {/* Wellness Disclaimer Banner */}
        <View style={[styles.disclaimerBanner, { backgroundColor: isDark ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.15)', borderColor: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.4)' }]}>
          <Text style={styles.disclaimerBannerText}>
            🔔 For relaxation & wellness only • Not medical advice
          </Text>
        </View>
        
        <Pressable onPress={handlePricingOpen}>
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Subscription</Text>
            <Text style={[styles.statusValue, { color: colors.primary }]}>{subscriptionTier.toUpperCase()}</Text>
            <Text style={[styles.statusHint, { color: colors.textMuted }]}>
              {subscriptionTier === 'free' 
                ? `${availableFrequencies.length} frequencies + ${availableBaths.filter(b => !b.isPremium).length} baths` 
                : `${availableFrequencies.length} frequencies + ${availableBaths.length} baths`}
            </Text>
          </View>
        </Pressable>
        

      </View>

      {/* Daily Recommendation Card */}
      <View style={[styles.dailyRecCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.dailyRecHeader}>
          <Text style={styles.dailyRecEmoji}>{dailyRec.emoji}</Text>
          <View style={styles.dailyRecInfo}>
            <Text style={[styles.dailyRecMood, { color: colors.text }]}>{dailyRec.mood}</Text>
            <Text style={[styles.dailyRecTip, { color: colors.textSecondary }]}>{dailyRec.tip}</Text>
          </View>
        </View>
        <View style={styles.dailyRecButtons}>
          {dailyRec.freq && (
            <Pressable 
              style={[styles.dailyRecBtn, { backgroundColor: colors.primary }, playingFrequency === dailyRec.freq.id && styles.dailyRecBtnPlaying]}
              onPress={() => dailyRec.freq && handlePlayFrequency(dailyRec.freq)}
            >
              <Text style={styles.dailyRecBtnText}>
                {playingFrequency === dailyRec.freq?.id ? '⏹️' : '▶️'} {dailyRec.freq.hz}Hz
              </Text>
            </Pressable>
          )}
          {dailyRec.bath && (
            <Pressable 
              style={[styles.dailyRecBtn, styles.dailyRecBtnBath, { backgroundColor: isDark ? '#0891b2' : '#0d9488' }, playingFrequency === dailyRec.bath.id && styles.dailyRecBtnPlaying]}
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
        <View style={[styles.sleepTimerBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {sleepTimerMinutes ? (
            <View style={styles.sleepTimerActive}>
              <Text style={[styles.sleepTimerText, { color: colors.text }]}>⏰ Sleep Timer: {formatSleepTimerRemaining()}</Text>
              <Pressable style={[styles.sleepTimerCancel, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]} onPress={cancelSleepTimer}>
                <Text style={styles.sleepTimerCancelText}>✕</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.sleepTimerBtn} onPress={() => setShowSleepTimerModal(true)}>
              <Text style={[styles.sleepTimerBtnText, { color: colors.primary }]}>⏰ Set Sleep Timer</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Sleep Timer Modal */}
      <Modal visible={showSleepTimerModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSleepTimerModal(false)}>
          <View style={[styles.sleepTimerModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sleepTimerModalTitle, { color: colors.text }]}>⏰ Sleep Timer</Text>
            <Text style={[styles.sleepTimerModalSubtitle, { color: colors.textSecondary }]}>Stop audio after:</Text>
            <View style={styles.sleepTimerOptions}>
              {[5, 10, 15, 30, 45, 60].map(mins => (
                <Pressable 
                  key={mins} 
                  style={[styles.sleepTimerOption, { backgroundColor: colors.background, borderColor: colors.border }]} 
                  onPress={() => startSleepTimer(mins)}
                >
                  <Text style={[styles.sleepTimerOptionText, { color: colors.text }]}>{mins} min</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={[styles.sleepTimerModalClose, { borderTopColor: colors.border }]} onPress={() => setShowSleepTimerModal(false)}>
              <Text style={[styles.sleepTimerModalCloseText, { color: colors.textMuted }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Real-time Visualizer - shows when playing */}
      {playingFrequency && (
        <View style={[styles.visualizerSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.visualizerLabel, { color: colors.text }]}>🎵 Now Playing</Text>
          <SpectrumVisualizer 
            isPlaying={!!playingFrequency}
            frequencies={getPlayingFrequencies()}
            height={50}
            barCount={20}
          />
        </View>
      )}

      {/* View Mode Toggle */}
      <View style={[styles.modeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable
          style={[
            styles.modeButton, 
            { backgroundColor: viewMode === 'frequencies' ? colors.primary : 'transparent' }
          ]}
          onPress={() => { setViewMode('frequencies'); setSelectedCategory('all'); }}
        >
          <Text style={[
            styles.modeButtonText, 
            { color: viewMode === 'frequencies' ? '#ffffff' : colors.textSecondary }
          ]}>
            🎵 Single Frequencies
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.modeButton, 
            { backgroundColor: viewMode === 'baths' ? colors.primary : 'transparent' }
          ]}
          onPress={() => { setViewMode('baths'); setSelectedCategory('all'); }}
        >
          <Text style={[
            styles.modeButtonText, 
            { color: viewMode === 'baths' ? '#ffffff' : colors.textSecondary }
          ]}>
            🛁 Wellness Baths
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton, 
              { 
                backgroundColor: selectedCategory === category.id ? colors.primary : colors.surface,
                borderColor: selectedCategory === category.id ? colors.primary : colors.border,
              }
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText, 
              { color: selectedCategory === category.id ? '#ffffff' : colors.textSecondary }
            ]}>
              {category.name} ({category.count})
            </Text>
          </Pressable>
        ))}
      </ScrollView>



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

    {/* Pricing Modal */}
    <Modal 
      visible={showPricing} 
      animationType="slide" 
      transparent={false}
      onRequestClose={() => setShowPricing(false)}
    >
      <PricingScreen onDismiss={() => setShowPricing(false)} />
    </Modal>

    </PulsingBackground>
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
  disclaimerBanner: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)'
  },
  disclaimerBannerText: {
    color: '#fbbf24',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500'
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
    // Removed transform scale to prevent UI jumping
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
    color: '#ffffff',
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
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  playButtonTextDisabled: {
    color: '#9ca3af'
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
