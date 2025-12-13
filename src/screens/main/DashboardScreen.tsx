import { ScrollView, StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { FREQUENCIES, getAvailableFrequencies, type Frequency } from '@/lib/frequencies';
import { frequencyPlayer, playHealingFrequency, playSolfeggioFrequency, playChakraFrequency, playBinauralBeat, stopAllFrequencies, testAudio } from '@/lib/audioEngine';
import { useState, useEffect } from 'react';

export function DashboardScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingFrequency, setPlayingFrequency] = useState<string | null>(null);
  
  const subscriptionTier = profile?.subscription_tier || 'free';
  const availableFrequencies = getAvailableFrequencies(subscriptionTier);
  
  const filteredFrequencies = selectedCategory === 'all' 
    ? availableFrequencies 
    : availableFrequencies.filter(f => f.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', count: availableFrequencies.length },
    { id: 'solfeggio', name: 'Solfeggio', count: availableFrequencies.filter(f => f.category === 'solfeggio').length },
    { id: 'chakra', name: 'Chakra', count: availableFrequencies.filter(f => f.category === 'chakra').length },
    { id: 'binaural', name: 'Binaural', count: availableFrequencies.filter(f => f.category === 'binaural').length },
    { id: 'healing', name: 'Healing', count: availableFrequencies.filter(f => f.category === 'healing').length }
  ];

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
      
      // Play based on category
      switch (frequency.category) {
        case 'solfeggio':
          await playSolfeggioFrequency(frequency.hz, frequency.duration);
          break;
        case 'chakra':
          await playChakraFrequency(frequency.hz, frequency.duration);
          break;
        case 'binaural':
          // For binaural beats, use base frequency and beat frequency
          const beatFreq = frequency.hz < 40 ? frequency.hz : 10; // Most binaural beats are under 40Hz
          await playBinauralBeat(200, beatFreq, frequency.duration); // 200Hz base tone
          break;
        case 'healing':
        default:
          await playHealingFrequency(frequency.hz, frequency.duration);
          break;
      }

      // Auto-stop after duration
      setTimeout(() => {
        if (playingFrequency === frequency.id) {
          setPlayingFrequency(null);
        }
      }, (frequency.duration || 300) * 1000);

    } catch (error) {
      console.error('Error playing frequency:', error);
      setPlayingFrequency(null);
    }
  };

  const renderFrequencyCard = ({ item }: { item: Frequency }) => {
    const isPlaying = playingFrequency === item.id;
    
    return (
      <View style={styles.frequencyCard}>
        <View style={styles.frequencyHeader}>
          <Text style={styles.frequencyName}>{item.name}</Text>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyHz}>{item.hz}Hz</Text>
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
              ? `Access to ${availableFrequencies.length} free frequencies` 
              : 'Unlimited access to all frequencies'}
          </Text>
        </View>
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

      <FlatList
        data={filteredFrequencies}
        renderItem={renderFrequencyCard}
        keyExtractor={(item) => item.id}
        numColumns={1}
        scrollEnabled={false}
        contentContainerStyle={styles.frequenciesList}
      />
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
  }
});
