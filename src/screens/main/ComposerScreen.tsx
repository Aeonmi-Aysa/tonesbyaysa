import { useState, useEffect, useCallback } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useTheme } from '@/store/useThemeStore';
import { frequencyPlayer, stopAllFrequencies, playFrequencyBath, getIsPlaying, type WaveformType, WAVEFORM_OPTIONS } from '@/lib/audioEngine';
import { FREQUENCIES, type Frequency } from '@/lib/frequencies';
import { SMART_STACKS, getSmartStackSuggestions, convertStackToLayers, type SmartStack } from '@/lib/smartStacks';

// Layer interface matching browser version
interface BathLayer {
  uid: string;
  presetId: string;
  name: string;
  category: string;
  hz: number;
  waveform: WaveformType;
  duration: number;   // in seconds
  volume: number;     // 10-100
}

// Saved custom bath interface
interface CustomBath {
  id: string;
  name: string;
  mode: 'blend' | 'sequence';
  layers: BathLayer[];
  savedAt: string;
  isCustom: true;
}

const MAX_LAYERS = 6;

export function ComposerScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const profile = useSessionStore((state: SessionState) => state.profile);
  const subscriptionTier = profile?.subscription_tier || 'free';
  const { colors, isDark } = useTheme();
  
  // State for layers (multiple frequencies in custom bath)
  const [layers, setLayers] = useState<BathLayer[]>([]);
  const [bathName, setBathName] = useState('');
  const [playMode, setPlayMode] = useState<'blend' | 'sequence'>('blend');
  const [isPlaying, setIsPlaying] = useState(false);
  
  // State for saved custom baths
  const [savedBaths, setSavedBaths] = useState<CustomBath[]>([]);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Smart Stacking state
  const [showSmartStacking, setShowSmartStacking] = useState(false);
  const [smartGoal, setSmartGoal] = useState('');
  const [suggestedStacks, setSuggestedStacks] = useState<SmartStack[]>([]);
  const [selectedStackCategory, setSelectedStackCategory] = useState<SmartStack['category'] | 'all'>('all');
  
  // Load saved baths on mount
  useEffect(() => {
    loadSavedBaths();
  }, [profile?.id]);

  // Sync with global audio state
  useEffect(() => {
    const checkAudioState = () => {
      const globalIsPlaying = getIsPlaying();
      if (isPlaying !== globalIsPlaying) {
        console.log('🔄 Syncing composer audio state:', globalIsPlaying);
        setIsPlaying(globalIsPlaying);
      }
    };
    
    // Check immediately and then every 500ms
    checkAudioState();
    const interval = setInterval(checkAudioState, 500);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  const loadSavedBaths = async () => {
    try {
      const key = profile?.id ? `customBaths:${profile.id}` : 'customBaths';
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setSavedBaths(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load saved baths:', error);
    }
  };
  
  const saveBathsToStorage = async (baths: CustomBath[]) => {
    try {
      const key = profile?.id ? `customBaths:${profile.id}` : 'customBaths';
      await AsyncStorage.setItem(key, JSON.stringify(baths));
    } catch (error) {
      console.error('Failed to save baths:', error);
    }
  };
  
  // Get filterable frequency library
  const getFilteredFrequencies = useCallback(() => {
    let filtered = FREQUENCIES;
    
    // Filter by tier access
    if (subscriptionTier === 'free') {
      filtered = filtered.filter(f => !f.isPremium);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) || 
        f.hz.toString().includes(query)
      );
    }
    
    return filtered;
  }, [subscriptionTier, selectedCategory, searchQuery]);
  
  // Smart Stacking: Search for suggestions based on goal
  const handleSmartSearch = (goal: string) => {
    setSmartGoal(goal);
    if (goal.trim().length > 2) {
      const suggestions = getSmartStackSuggestions(goal);
      setSuggestedStacks(suggestions);
    } else {
      setSuggestedStacks([]);
    }
  };

  // Smart Stacking: Load a suggested stack
  const loadSmartStack = (stack: SmartStack) => {
    const newLayers = convertStackToLayers(stack);
    setLayers(newLayers as BathLayer[]);
    setBathName(stack.name);
    setPlayMode('blend');
    setShowSmartStacking(false);
    setSmartGoal('');
    setSuggestedStacks([]);
    Alert.alert(
      `✨ ${stack.name} Loaded!`,
      `${stack.reasoning}\n\nTip: Adjust volumes and durations to personalize.`
    );
  };

  // Get stacks filtered by category
  const getFilteredStacks = () => {
    if (selectedStackCategory === 'all') return SMART_STACKS;
    return SMART_STACKS.filter(s => s.category === selectedStackCategory);
  };

  // Add a frequency layer
  const addLayer = (frequency: Frequency) => {
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

    if (layers.length >= MAX_LAYERS) {
      Alert.alert('Layer Limit', 'Maximum 6 layers allowed per bath.');
      return;
    }
    
    const newLayer: BathLayer = {
      uid: `layer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      presetId: frequency.id,
      name: frequency.name,
      category: frequency.category,
      hz: frequency.hz,
      waveform: 'sine',
      duration: 120, // 2 minutes default
      volume: 80
    };
    
    setLayers(prev => [...prev, newLayer]);
    setShowFrequencyPicker(false);
  };
  
  // Remove a layer
  const removeLayer = (uid: string) => {
    setLayers(prev => prev.filter(l => l.uid !== uid));
  };
  
  // Update layer duration
  const updateLayerDuration = (uid: string, seconds: number) => {
    setLayers(prev => prev.map(l => 
      l.uid === uid ? { ...l, duration: Math.max(30, Math.min(900, seconds)) } : l
    ));
  };
  
  // Update layer volume
  const updateLayerVolume = (uid: string, volume: number) => {
    setLayers(prev => prev.map(l => 
      l.uid === uid ? { ...l, volume: Math.max(10, Math.min(100, volume)) } : l
    ));
  };
  
  // Clear all layers
  const clearLayers = () => {
    stopPlayback();
    setLayers([]);
    setBathName('');
  };
  
  // Play layered bath
  const playBath = async () => {
    if (!layers.length) {
      Alert.alert('Empty Bath', 'Add at least one frequency layer first.');
      return;
    }
    
    console.log('🎼 COMPOSER: Playing', layers.length, 'layers in', playMode, 'mode');
    setIsPlaying(true);
    
    try {
      if (playMode === 'blend') {
        // Play all frequencies simultaneously with progressive layering
        const hzList = layers.map(l => l.hz);
        const maxDuration = Math.max(...layers.map(l => l.duration)) * 1000;
        console.log('🎼 Playing blended bath:', hzList);
        await playFrequencyBath(hzList, maxDuration);
      } else {
        // Play frequencies in sequence
        console.log('🎼 Playing sequential layers');
        for (const layer of layers) {
          console.log('🎼 Playing layer:', layer.name, layer.hz + 'Hz');
          await frequencyPlayer.playFrequency(layer.hz, layer.duration * 1000, layer.waveform);
          // Wait for duration before next layer
          await new Promise(resolve => setTimeout(resolve, layer.duration * 1000));
        }
      }
      console.log('✅ Composer bath completed');
      setIsPlaying(false);
    } catch (error) {
      console.error('❌ Composer playback error:', error);
      setIsPlaying(false);
      Alert.alert('Playback Error', 'Failed to play the bath.');
    }
  };
  
  // Stop playback
  const stopPlayback = async () => {
    console.log('🛑 Composer stopping playback');
    try {
      await stopAllFrequencies();
      setIsPlaying(false);
      console.log('✅ Composer playback stopped');
    } catch (error) {
      console.error('❌ Composer stop failed:', error);
      setIsPlaying(false);
    }
  };
  
  // Save current bath design
  const saveBath = async () => {
    if (!layers.length) {
      Alert.alert('Empty Bath', 'Add at least one frequency layer first.');
      return;
    }
    
    const name = bathName.trim() || `Custom Bath ${savedBaths.length + 1}`;
    
    const newBath: CustomBath = {
      id: `custom-bath-${Date.now()}`,
      name,
      mode: playMode,
      layers: [...layers],
      savedAt: new Date().toISOString(),
      isCustom: true
    };
    
    const updatedBaths = [newBath, ...savedBaths];
    setSavedBaths(updatedBaths);
    await saveBathsToStorage(updatedBaths);
    
    Alert.alert('Saved!', `"${name}" saved to your custom baths library.`);
  };
  
  // Save and send to manifestation tab
  const saveAndSendToManifestation = async () => {
    if (!layers.length) {
      Alert.alert('Empty Bath', 'Add at least one frequency layer first.');
      return;
    }
    
    const name = bathName.trim() || `Manifestation Bath ${savedBaths.length + 1}`;
    
    const newBath: CustomBath = {
      id: `custom-bath-${Date.now()}`,
      name,
      mode: playMode,
      layers: [...layers],
      savedAt: new Date().toISOString(),
      isCustom: true
    };
    
    const updatedBaths = [newBath, ...savedBaths.filter(b => b.id !== newBath.id)];
    setSavedBaths(updatedBaths);
    await saveBathsToStorage(updatedBaths);
    
    Alert.alert(
      '✨ Ready for Manifestation!', 
      `"${name}" is saved and will appear in the Manifestation Hub's Baths tab.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };
  
  // Load a saved bath for editing
  const loadBath = (bath: CustomBath) => {
    setLayers([...bath.layers]);
    setBathName(bath.name);
    setPlayMode(bath.mode);
  };
  
  // Delete a saved bath
  const deleteBath = async (bathId: string) => {
    Alert.alert(
      'Delete Bath',
      'Are you sure you want to delete this custom bath?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedBaths = savedBaths.filter(b => b.id !== bathId);
            setSavedBaths(updatedBaths);
            await saveBathsToStorage(updatedBaths);
          }
        }
      ]
    );
  };
  
  // Check if bath has low frequencies (for headphone note)
  const hasLowFrequencies = layers.some(l => l.hz < 80);
  
  // Calculate total runtime
  const totalRuntime = playMode === 'sequence'
    ? layers.reduce((acc, l) => acc + l.duration, 0)
    : Math.max(...layers.map(l => l.duration), 0);
  
  // Get unique categories for filter
  const categories = ['all', ...new Set(FREQUENCIES.map(f => f.category))];
  
  // Render layer item
  const renderLayerItem = ({ item }: { item: BathLayer }) => (
    <View style={[styles.layerCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.layerHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.layerName, { color: colors.accent }]}>{item.name}</Text>
          <Text style={[styles.layerMeta, { color: colors.textSecondary }]}>{item.hz}Hz • {item.category}</Text>
        </View>
        <Pressable style={[styles.removeBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }]} onPress={() => removeLayer(item.uid)}>
          <Text style={styles.removeBtnText}>✕</Text>
        </Pressable>
      </View>
      
      <View style={styles.layerControls}>
        <View style={styles.controlRow}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Duration: {Math.round(item.duration / 60)} min</Text>
          <View style={styles.durationBtns}>
            <Pressable 
              style={[styles.adjustBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => updateLayerDuration(item.uid, item.duration - 30)}
            >
              <Text style={[styles.adjustBtnText, { color: colors.text }]}>−</Text>
            </Pressable>
            <Pressable 
              style={[styles.adjustBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => updateLayerDuration(item.uid, item.duration + 30)}
            >
              <Text style={[styles.adjustBtnText, { color: colors.text }]}>+</Text>
            </Pressable>
          </View>
        </View>
        
        <View style={styles.controlRow}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>Volume: {item.volume}%</Text>
          <View style={styles.durationBtns}>
            <Pressable 
              style={[styles.adjustBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => updateLayerVolume(item.uid, item.volume - 10)}
            >
              <Text style={[styles.adjustBtnText, { color: colors.text }]}>−</Text>
            </Pressable>
            <Pressable 
              style={[styles.adjustBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => updateLayerVolume(item.uid, item.volume + 10)}
            >
              <Text style={[styles.adjustBtnText, { color: colors.text }]}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
  
  // Render frequency picker item
  const renderFrequencyItem = ({ item }: { item: Frequency }) => (
    <Pressable style={[styles.freqPickerItem, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => addLayer(item)}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.freqPickerName, { color: colors.accent }]}>{item.name}</Text>
        <Text style={[styles.freqPickerHz, { color: colors.textSecondary }]}>{item.hz}Hz • {item.category}</Text>
      </View>
      <Text style={[styles.freqPickerAdd, { color: colors.primary }]}>+ Add</Text>
    </Pressable>
  );
  
  // Render saved bath item
  const renderSavedBathItem = ({ item }: { item: CustomBath }) => (
    <View style={[styles.savedBathCard, { backgroundColor: colors.background, borderColor: colors.primary }]}>
      <View style={[styles.customIndicator, { backgroundColor: colors.primary }]}>
        <Text style={styles.customIndicatorText}>✨ Custom</Text>
      </View>
      <Text style={[styles.savedBathName, { color: colors.accent }]}>{item.name}</Text>
      <Text style={[styles.savedBathMeta, { color: colors.textSecondary }]}>
        {item.layers.length} layers • {item.mode === 'blend' ? 'Blend' : 'Sequence'}
      </Text>
      <View style={styles.savedBathActions}>
        <Pressable style={[styles.loadBtn, { backgroundColor: colors.primary }]} onPress={() => loadBath(item)}>
          <Text style={styles.loadBtnText}>Load</Text>
        </Pressable>
        <Pressable style={styles.manifestBtn} onPress={() => {
          Alert.alert(
            '✨ Ready for Manifestation!',
            `"${item.name}" is available in the Manifestation Hub's Baths tab. Go to the Manifest tab to start a session.`,
            [{ text: 'Got it!', style: 'default' }]
          );
        }}>
          <Text style={styles.manifestBtnText}>Manifest</Text>
        </Pressable>
        <Pressable style={styles.deleteBtn} onPress={() => deleteBath(item.id)}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: colors.text }]}>Bath Composer</Text>
        <Text style={[styles.subheading, { color: colors.textMuted }]}>Create custom multi-frequency wellness baths</Text>
      </View>

      {/* Smart Stacking Button */}
      <Pressable 
        style={[styles.smartStackingBtn, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe', borderColor: colors.primary }]}
        onPress={() => setShowSmartStacking(true)}
      >
        <Text style={styles.smartStackingBtnEmoji}>🧠</Text>
        <View style={styles.smartStackingBtnContent}>
          <Text style={[styles.smartStackingBtnTitle, { color: colors.text }]}>Smart Stacking</Text>
          <Text style={[styles.smartStackingBtnSub, { color: colors.textSecondary }]}>AI-curated frequency combinations for your goals</Text>
        </View>
        <Text style={[styles.smartStackingBtnArrow, { color: colors.primary }]}>→</Text>
      </Pressable>

      {/* Bath Name Input */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Bath Name</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
          placeholder="My Custom Wellness Bath"
          placeholderTextColor={colors.textMuted}
          value={bathName}
          onChangeText={setBathName}
        />
      </View>

      {/* Play Mode Toggle */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Playback Mode</Text>
        <View style={[styles.modeToggle, { backgroundColor: colors.background }]}>
          <Pressable
            style={[styles.modeBtn, playMode === 'blend' && { backgroundColor: colors.primary }]}
            onPress={() => setPlayMode('blend')}
          >
            <Text style={[styles.modeBtnText, { color: playMode === 'blend' ? '#ffffff' : colors.textSecondary }]}>
              🔀 Blend
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeBtn, playMode === 'sequence' && { backgroundColor: colors.primary }]}
            onPress={() => setPlayMode('sequence')}
          >
            <Text style={[styles.modeBtnText, { color: playMode === 'sequence' ? '#ffffff' : colors.textSecondary }]}>
              ➡️ Sequence
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.modeHint, { color: colors.textMuted }]}>
          {playMode === 'blend' ? 'All frequencies play simultaneously (layered)' : 'Frequencies play one after another'}
        </Text>
      </View>

      {/* Frequency Layers */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Layers ({layers.length}/{MAX_LAYERS})</Text>
          <Pressable style={[styles.addLayerBtn, { backgroundColor: colors.primary }]} onPress={() => setShowFrequencyPicker(true)}>
            <Text style={styles.addLayerBtnText}>+ Add</Text>
          </Pressable>
        </View>
        
        {layers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No layers yet</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Add frequencies from library to compose</Text>
          </View>
        ) : (
          <FlatList
            data={layers}
            renderItem={renderLayerItem}
            keyExtractor={item => item.uid}
            scrollEnabled={false}
          />
        )}
        
        {hasLowFrequencies && layers.length > 0 && (
          <View style={[styles.headphoneNote, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
            <Text style={[styles.headphoneNoteText, { color: isDark ? '#c4b5fd' : '#7c3aed' }]}>
              🎧 Low frequencies detected. Use headphones for optimal experience.
            </Text>
          </View>
        )}
      </View>

      {/* Summary & Controls */}
      {layers.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Summary</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {layers.length} layer{layers.length !== 1 ? 's' : ''} • {playMode === 'blend' ? 'Blend' : 'Sequence'} • ~{Math.round(totalRuntime / 60)} min
          </Text>
          
          <View style={styles.controlButtons}>
            <Pressable 
              style={[styles.playBtn, isPlaying && styles.stopBtn]}
              onPress={isPlaying ? stopPlayback : playBath}
            >
              <Text style={styles.playBtnText}>
                {isPlaying ? '⏹️ Stop' : '▶️ Play'}
              </Text>
            </Pressable>
            
            <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={saveBath}>
              <Text style={styles.saveBtnText}>💾 Save</Text>
            </Pressable>
            
            <Pressable style={[styles.clearBtn, { backgroundColor: isDark ? '#374151' : '#e5e7eb' }]} onPress={clearLayers}>
              <Text style={styles.clearBtnText}>🗑️</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Saved Custom Baths */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Your Custom Baths ({savedBaths.length})</Text>
        
        {savedBaths.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>🛁</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved baths yet</Text>
            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>Create and save your first custom bath</Text>
          </View>
        ) : (
          <FlatList
            data={savedBaths}
            renderItem={renderSavedBathItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Frequency Picker Modal */}
      <Modal
        visible={showFrequencyPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Frequency</Text>
            <Pressable onPress={() => setShowFrequencyPicker(false)}>
              <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
            </Pressable>
          </View>
          
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Search frequencies..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryBtn, 
                  { backgroundColor: selectedCategory === cat ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryBtnText, { color: selectedCategory === cat ? '#ffffff' : colors.textSecondary }]}>
                  {cat === 'all' ? 'All' : cat === 'healing' ? 'Wellness' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          <FlatList
            data={getFilteredFrequencies()}
            renderItem={renderFrequencyItem}
            keyExtractor={item => item.id}
            style={styles.freqList}
          />
        </View>
      </Modal>

      {/* Smart Stacking Modal */}
      <Modal
        visible={showSmartStacking}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>🧠 Smart Stacking</Text>
            <Pressable onPress={() => {
              setShowSmartStacking(false);
              setSmartGoal('');
              setSuggestedStacks([]);
            }}>
              <Text style={[styles.modalClose, { color: colors.textMuted }]}>✕</Text>
            </Pressable>
          </View>
          
          <Text style={[styles.smartSubtitle, { color: colors.textSecondary }]}>
            Tell us your goal and we'll suggest the perfect frequency combination
          </Text>
          
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g., I want to focus better, I can't sleep, I feel anxious..."
            placeholderTextColor={colors.textMuted}
            value={smartGoal}
            onChangeText={handleSmartSearch}
            multiline
          />
          
          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {(['all', 'focus', 'relaxation', 'sleep', 'energy', 'healing', 'creativity', 'meditation', 'manifestation'] as const).map(cat => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryBtn, 
                  { backgroundColor: selectedStackCategory === cat ? colors.primary : colors.surface, borderColor: colors.border }
                ]}
                onPress={() => setSelectedStackCategory(cat)}
              >
                <Text style={[styles.categoryBtnText, { color: selectedStackCategory === cat ? '#ffffff' : colors.textSecondary }]}>
                  {cat === 'all' ? '✨ All' : cat === 'healing' ? 'Wellness' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          
          {/* Suggestions or Browse */}
          <FlatList
            data={suggestedStacks.length > 0 ? suggestedStacks : getFilteredStacks()}
            renderItem={({ item }) => (
              <Pressable 
                style={[styles.smartStackCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                onPress={() => loadSmartStack(item)}
              >
                <View style={styles.smartStackHeader}>
                  <Text style={styles.smartStackEmoji}>{item.emoji}</Text>
                  <View style={styles.smartStackInfo}>
                    <Text style={[styles.smartStackName, { color: colors.accent }]}>{item.name}</Text>
                    <Text style={[styles.smartStackGoal, { color: colors.textSecondary }]}>{item.goal}</Text>
                  </View>
                </View>
                <Text style={[styles.smartStackDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                <Text style={[styles.smartStackFreqs, { color: colors.primary }]}>
                  {item.frequencies.map(f => `${f}Hz`).join(' + ')}
                </Text>
                <View style={[styles.smartStackReasoning, { backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)' }]}>
                  <Text style={[styles.smartStackReasoningText, { color: isDark ? '#c4b5fd' : '#7c3aed' }]}>💡 {item.reasoning}</Text>
                </View>
                <View style={styles.smartStackAction}>
                  <Text style={[styles.smartStackActionText, { color: colors.primary }]}>Tap to Load →</Text>
                </View>
              </Pressable>
            )}
            keyExtractor={item => item.id}
            style={styles.freqList}
            ListHeaderComponent={
              suggestedStacks.length > 0 ? (
                <View style={[styles.suggestionsHeader, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }]}>
                  <Text style={[styles.suggestionsHeaderText, { color: isDark ? '#34d399' : '#059669' }]}>
                    🎯 Suggested for "{smartGoal}"
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </Modal>
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
    color: '#c084fc',
    marginBottom: 4,
  },
  subheading: {
    color: '#a78bfa',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#bfdbfe',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#312e81',
  },
  modeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: '#c4b5fd',
  },
  modeHint: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  addLayerBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addLayerBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  layerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  layerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  layerName: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '600',
  },
  layerMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  removeBtn: {
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  layerControls: {
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  durationBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    backgroundColor: '#4338ca',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
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
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  headphoneNote: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#a855f7',
  },
  headphoneNoteText: {
    color: '#c4b5fd',
    fontSize: 13,
    fontStyle: 'italic',
  },
  summaryText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 16,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  playBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  stopBtn: {
    backgroundColor: '#ef4444',
  },
  playBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  clearBtn: {
    backgroundColor: '#475569',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  manifestBtn: {
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  manifestBtnText: {
    color: '#1e1b4b',
    fontWeight: '700',
    fontSize: 15,
  },
  savedBathCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#7c3aed',
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
  savedBathName: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  savedBathMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 12,
  },
  savedBathActions: {
    flexDirection: 'row',
    gap: 8,
  },
  loadBtn: {
    backgroundColor: '#4338ca',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loadBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  manifestBtn: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  manifestBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#030712',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
  },
  modalClose: {
    fontSize: 24,
    color: '#94a3b8',
    padding: 8,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    color: '#f8fafc',
    fontSize: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  categoryBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  categoryBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  freqList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  freqPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  freqPickerName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  freqPickerHz: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  freqPickerAdd: {
    color: '#7c3aed',
    fontWeight: '700',
    fontSize: 14,
  },
  // Smart Stacking styles
  smartStackingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4338ca',
  },
  smartStackingBtnEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  smartStackingBtnContent: {
    flex: 1,
  },
  smartStackingBtnTitle: {
    color: '#c4b5fd',
    fontSize: 17,
    fontWeight: '700',
  },
  smartStackingBtnSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  smartStackingBtnArrow: {
    color: '#7c3aed',
    fontSize: 24,
    fontWeight: '700',
  },
  smartSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  smartStackCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  smartStackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  smartStackEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  smartStackInfo: {
    flex: 1,
  },
  smartStackName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  smartStackGoal: {
    color: '#a855f7',
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  smartStackDesc: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 8,
  },
  smartStackFreqs: {
    color: '#c084fc',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  smartStackReasoning: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  smartStackReasoningText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  smartStackAction: {
    alignItems: 'flex-end',
  },
  smartStackActionText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionsHeader: {
    backgroundColor: '#312e81',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  suggestionsHeaderText: {
    color: '#e0e7ff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});