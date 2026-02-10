import { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTheme } from '@/store/useThemeStore';
import { FREQUENCIES, FREQUENCY_BATHS, type Frequency, type FrequencyBath } from '@/lib/frequencies';

// Custom bath interface (from composer)
interface CustomBath {
  id: string;
  name: string;
  mode: 'blend' | 'sequence';
  layers: Array<{ hz: number; duration: number; waveform: string }>;
  savedAt: string;
  isCustom: true;
}

export function FavoritesScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const { favorites, loadFavorites, isFavorite, removeFavorite } = useFavoritesStore();
  const { colors, isDark } = useTheme();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [customBaths, setCustomBaths] = useState<CustomBath[]>([]);
  const [activeSection, setActiveSection] = useState<'tones' | 'baths' | 'custom'>('tones');
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomBaths = useCallback(async () => {
    try {
      const key = profile?.id ? `customBaths:${profile.id}` : 'customBaths';
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 Loaded custom baths:', parsed.length);
        setCustomBaths(parsed);
      } else {
        setCustomBaths([]);
      }
    } catch (error) {
      console.error('Failed to load custom baths:', error);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadFavorites(profile?.id);
    loadCustomBaths();
  }, [profile?.id, loadCustomBaths]);

  // Refresh when tab comes into focus or when switching to custom tab
  useEffect(() => {
    if (activeSection === 'custom') {
      loadCustomBaths();
    }
  }, [activeSection, loadCustomBaths]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites(profile?.id);
    await loadCustomBaths();
    setRefreshing(false);
  }, [profile?.id, loadFavorites, loadCustomBaths]);

  // Get favorited frequencies
  const favoritedFrequencies = FREQUENCIES.filter(f => 
    favorites.some(fav => fav.id === f.id && fav.type === 'frequency')
  );

  // Get favorited baths
  const favoritedBaths = FREQUENCY_BATHS.filter(b => 
    favorites.some(fav => fav.id === b.id && fav.type === 'bath')
  );

  // Show ALL custom baths (user's creations) - not just favorited ones
  // This makes more sense UX-wise since they created these baths
  const allCustomBaths = customBaths;

  const handlePlayFrequency = async (freq: Frequency) => {
    if (playingId === freq.id) {
      // Stop current
      try {
        const { stopAllFrequencies } = await import('@/lib/audioEngineExpo');
        await stopAllFrequencies();
      } catch (error) {
        console.error('Stop failed:', error);
      }
      setPlayingId(null);
      return;
    }
    
    // Stop any current and play new
    try {
      const { stopAllFrequencies, frequencyPlayerExpo } = await import('@/lib/audioEngineExpo');
      await stopAllFrequencies();
      await frequencyPlayerExpo.initialize();
      
      setPlayingId(freq.id);
      
      if (freq.hz < 20) {
        await frequencyPlayerExpo.playBinauralBeat(200, freq.hz, 30000);
      } else {
        await frequencyPlayerExpo.playFrequency(freq.hz, 30000, 'sine');
      }
    } catch (error) {
      console.error('Play failed:', error);
      Alert.alert('Audio Error', String(error));
      setPlayingId(null);
    }
  };

  const handlePlayBath = async (bath: FrequencyBath) => {
    if (playingId === bath.id) {
      // Stop current
      try {
        const { stopAllFrequencies } = await import('@/lib/audioEngineExpo');
        await stopAllFrequencies();
      } catch (error) {
        console.error('Stop failed:', error);
      }
      setPlayingId(null);
      return;
    }
    
    // Stop any current and play new
    try {
      const { stopAllFrequencies, playFrequencyBath } = await import('@/lib/audioEngineExpo');
      await stopAllFrequencies();
      
      setPlayingId(bath.id);
      
      // USE PROGRESSIVE BATH FUNCTION FOR FULL LAYERED EXPERIENCE
      console.log('🛁 FAVORITES BATH PLAY:', bath.name, 'with', bath.frequencies.length, 'frequencies');
      await playFrequencyBath(bath.frequencies, 30000);
      console.log('✅ Favorites bath started with full progressive layering');
    } catch (error) {
      console.error('Bath play failed:', error);
      Alert.alert('Audio Error', String(error));
      setPlayingId(null);
    }
  };

  const handlePlayCustomBath = async (bath: CustomBath) => {
    if (playingId === bath.id) {
      // Stop current
      try {
        const { stopAllFrequencies } = await import('@/lib/audioEngineExpo');
        await stopAllFrequencies();
      } catch (error) {
        console.error('Stop failed:', error);
      }
      setPlayingId(null);
      return;
    }
    
    // Stop any current and play new
    try {
      const { stopAllFrequencies, playFrequencyBath } = await import('@/lib/audioEngineExpo');
      await stopAllFrequencies();
      
      setPlayingId(bath.id);
      
      // USE PROGRESSIVE BATH FUNCTION FOR FULL LAYERED EXPERIENCE
      const frequencies = bath.layers.map(layer => layer.hz);
      console.log('🛁 FAVORITES CUSTOM BATH PLAY:', bath.title, 'with', frequencies.length, 'frequencies');
      await playFrequencyBath(frequencies, 30000);
      console.log('✅ Favorites custom bath started with full progressive layering');
    } catch (error) {
      console.error('Custom bath play failed:', error);
      Alert.alert('Audio Error', String(error));
      setPlayingId(null);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    removeFavorite(id, profile?.id);
  };

  const handleDeleteCustomBath = async (bathId: string) => {
    const updated = customBaths.filter(b => b.id !== bathId);
    setCustomBaths(updated);
    try {
      const key = profile?.id ? `customBaths:${profile.id}` : 'customBaths';
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete bath:', error);
    }
  };

  const renderFrequencyItem = ({ item }: { item: Frequency }) => {
    const isPlaying = playingId === item.id;
    
    return (
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: isDark ? '#be185d' : '#ec4899',
          shadowColor: isDark ? '#be185d' : '#ec4899',
        }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, { color: colors.accent }]}>{item.name}</Text>
          <Text style={[styles.cardHz, { color: colors.primary, backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
            {item.hz}Hz
          </Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
        <View style={styles.cardActions}>
          <Pressable 
            style={[styles.playBtn, isPlaying && styles.stopBtn]}
            onPress={() => handlePlayFrequency(item)}
          >
            <Text style={styles.playBtnText}>{isPlaying ? '⏹️ Stop' : '▶️ Play'}</Text>
          </Pressable>
          <Pressable 
            style={[styles.unfavBtn, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Text style={styles.unfavBtnText}>💔</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderBathItem = ({ item }: { item: FrequencyBath }) => {
    const isPlaying = playingId === item.id;
    const hasLowFreq = item.frequencies.some(f => f < 80);
    
    return (
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: isDark ? '#0891b2' : '#0d9488',
          shadowColor: isDark ? '#0891b2' : '#0d9488',
        }
      ]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, { color: colors.accent }]}>🛁 {item.name}</Text>
          <Text style={[styles.cardHz, { color: colors.primary, backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
            {item.frequencies.length} tones
          </Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{item.description}</Text>
        <Text style={[styles.freqList, { color: isDark ? '#c084fc' : '#9333ea' }]}>
          {item.frequencies.map(f => `${f}Hz`).join(' + ')}
        </Text>
        {hasLowFreq && (
          <Text style={[styles.headphoneNote, { color: isDark ? '#c4b5fd' : '#7c3aed' }]}>🎧 Use headphones for best experience</Text>
        )}
        <View style={styles.cardActions}>
          <Pressable 
            style={[styles.playBtn, isPlaying && styles.stopBtn]}
            onPress={() => handlePlayBath(item)}
          >
            <Text style={styles.playBtnText}>{isPlaying ? '⏹️ Stop' : '▶️ Play'}</Text>
          </Pressable>
          <Pressable 
            style={[styles.unfavBtn, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Text style={styles.unfavBtnText}>💔</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderCustomBathItem = ({ item }: { item: CustomBath }) => {
    const isPlaying = playingId === item.id;
    const hasLowFreq = item.layers.some(l => l.hz < 80);
    
    return (
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: isDark ? '#7c3aed' : '#8b5cf6',
          shadowColor: isDark ? '#7c3aed' : '#8b5cf6',
          shadowOpacity: 0.6,
          shadowRadius: 12,
        }
      ]}>
        <View style={[styles.customIndicator, { backgroundColor: colors.primary }]}>
          <Text style={styles.customIndicatorText}>✨ Custom</Text>
        </View>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, { color: colors.accent }]}>{item.name}</Text>
          <Text style={[styles.cardHz, { color: colors.primary, backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
            {item.layers.length} layers
          </Text>
        </View>
        <Text style={[styles.freqList, { color: isDark ? '#c084fc' : '#9333ea' }]}>
          {item.layers.map(l => `${l.hz}Hz`).join(' + ')}
        </Text>
        {hasLowFreq && (
          <Text style={[styles.headphoneNote, { color: isDark ? '#c4b5fd' : '#7c3aed' }]}>🎧 Use headphones for best experience</Text>
        )}
        <View style={styles.cardActions}>
          <Pressable 
            style={[styles.playBtn, isPlaying && styles.stopBtn]}
            onPress={() => handlePlayCustomBath(item)}
          >
            <Text style={styles.playBtnText}>{isPlaying ? '⏹️ Stop' : '▶️ Play'}</Text>
          </Pressable>
          <Pressable 
            style={styles.manifestBtn}
            onPress={() => Alert.alert('✨ Ready!', `"${item.name}" is already available in your Manifestation Hub baths tab.`)}
          >
            <Text style={styles.manifestBtnText}>🎯</Text>
          </Pressable>
          <Pressable 
            style={styles.deleteBtn}
            onPress={() => handleDeleteCustomBath(item.id)}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const totalFavorites = favoritedFrequencies.length + favoritedBaths.length + allCustomBaths.length;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>💜 Favorites</Text>
        <Text style={[styles.subheading, { color: colors.textMuted }]}>{totalFavorites} saved items • Pull to refresh</Text>
      </View>

      {/* Section Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        <Pressable 
          style={[styles.tab, activeSection === 'tones' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveSection('tones')}
        >
          <Text style={[styles.tabText, { color: activeSection === 'tones' ? '#ffffff' : colors.textSecondary }]}>
            🎵 Tones ({favoritedFrequencies.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeSection === 'baths' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveSection('baths')}
        >
          <Text style={[styles.tabText, { color: activeSection === 'baths' ? '#ffffff' : colors.textSecondary }]}>
            🛁 Baths ({favoritedBaths.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeSection === 'custom' && { backgroundColor: colors.primary }]}
          onPress={() => setActiveSection('custom')}
        >
          <Text style={[styles.tabText, { color: activeSection === 'custom' ? '#ffffff' : colors.textSecondary }]}>
            ✨ Custom ({allCustomBaths.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeSection === 'tones' && (
        <View style={styles.section}>
          {favoritedFrequencies.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No favorite tones yet</Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Tap the heart on any tone in the Library to add it here</Text>
            </View>
          ) : (
            <FlatList
              data={favoritedFrequencies}
              renderItem={renderFrequencyItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {activeSection === 'baths' && (
        <View style={styles.section}>
          {favoritedBaths.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🛁</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No favorite baths yet</Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Tap the heart on any bath in the Library to add it here</Text>
            </View>
          ) : (
            <FlatList
              data={favoritedBaths}
              renderItem={renderBathItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      )}

      {activeSection === 'custom' && (
        <View style={styles.section}>
          {allCustomBaths.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No custom baths yet</Text>
              <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Create custom baths in the Composer tab</Text>
            </View>
          ) : (
            <FlatList
              data={allCustomBaths}
              renderItem={renderCustomBathItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      )}
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
    color: '#f8fafc',
    marginBottom: 4,
  },
  subheading: {
    color: '#94a3b8',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#7c3aed',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  favoriteGlow: {
    borderColor: '#be185d',
    // Deep dark neon magenta glow effect
    shadowColor: '#be185d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  customBathGlow: {
    borderColor: '#7c3aed',
    // Deep neon purple glow for custom baths
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  customIndicator: {
    backgroundColor: '#7c3aed',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  customIndicatorText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardHz: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: '#1e1b4b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardDesc: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 8,
  },
  freqList: {
    color: '#c084fc',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  headphoneNote: {
    color: '#c4b5fd',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  playBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#ef4444',
  },
  playBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  unfavBtn: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  unfavBtnText: {
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
  },
  manifestBtn: {
    backgroundColor: '#fbbf24',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  manifestBtnText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
