import { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { frequencyPlayer, playHealingFrequency, stopAllFrequencies } from '@/lib/audioEngine';

interface CustomFrequency {
  id: string;
  name: string;
  frequency: number;
  duration: number;
  isPlaying: boolean;
}

export function ComposerScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const [customFreqs, setCustomFreqs] = useState<CustomFrequency[]>([]);
  const [newFreqName, setNewFreqName] = useState('');
  const [newFreqValue, setNewFreqValue] = useState('');
  const [newDuration, setNewDuration] = useState('300'); // 5 minutes default

  const createFrequency = () => {
    if (!newFreqName.trim()) {
      Alert.alert('Error', 'Please enter a name for your frequency.');
      return;
    }
    
    const frequency = parseFloat(newFreqValue);
    if (isNaN(frequency) || frequency < 1 || frequency > 20000) {
      Alert.alert('Error', 'Please enter a valid frequency between 1-20000 Hz.');
      return;
    }

    const duration = parseInt(newDuration);
    if (isNaN(duration) || duration < 30) {
      Alert.alert('Error', 'Duration must be at least 30 seconds.');
      return;
    }

    const newFreq: CustomFrequency = {
      id: Date.now().toString(),
      name: newFreqName.trim(),
      frequency,
      duration,
      isPlaying: false,
    };

    setCustomFreqs(prev => [newFreq, ...prev]);
    setNewFreqName('');
    setNewFreqValue('');
    setNewDuration('300');
    Alert.alert('Success', `Created "${newFreq.name}" at ${frequency}Hz`);
  };

  const togglePlay = async (id: string) => {
    const freq = customFreqs.find(f => f.id === id);
    if (!freq) return;

    try {
      if (freq.isPlaying) {
        // Stop the frequency
        await stopAllFrequencies();
        setCustomFreqs(prev => 
          prev.map(f => f.id === id ? { ...f, isPlaying: false } : f)
        );
      } else {
        // Stop all others first
        await stopAllFrequencies();
        setCustomFreqs(prev => prev.map(f => ({ ...f, isPlaying: false })));
        
        // Start this frequency
        await playHealingFrequency(freq.frequency, freq.duration);
        setCustomFreqs(prev => 
          prev.map(f => f.id === id ? { ...f, isPlaying: true } : f)
        );

        // Auto-stop after duration
        setTimeout(() => {
          setCustomFreqs(prev => 
            prev.map(f => f.id === id ? { ...f, isPlaying: false } : f)
          );
        }, freq.duration * 1000);
      }
    } catch (error) {
      console.error('Error playing custom frequency:', error);
      setCustomFreqs(prev => prev.map(f => ({ ...f, isPlaying: false })));
    }
  };

  const deleteFrequency = (id: string) => {
    Alert.alert(
      'Delete Frequency',
      'Are you sure you want to delete this custom frequency?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setCustomFreqs(prev => prev.filter(f => f.id !== id))
        }
      ]
    );
  };

  const renderFrequencyItem = ({ item }: { item: CustomFrequency }) => (
    <View style={styles.freqCard}>
      <View style={styles.freqInfo}>
        <Text style={styles.freqName}>{item.name}</Text>
        <Text style={styles.freqDetails}>{item.frequency}Hz • {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</Text>
      </View>
      <View style={styles.freqControls}>
        <Pressable
          style={[styles.controlBtn, styles.playBtn, item.isPlaying && styles.playBtnActive]}
          onPress={() => togglePlay(item.id)}
        >
          <Text style={styles.controlBtnText}>
            {item.isPlaying ? '⏸' : '▶️'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.controlBtn, styles.deleteBtn]}
          onPress={() => deleteFrequency(item.id)}
        >
          <Text style={styles.controlBtnText}>🗑</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Frequency Composer</Text>
        <Text style={styles.subheading}>Create custom healing frequencies</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create New Frequency</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Frequency Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Deep Relaxation"
            placeholderTextColor="#64748b"
            value={newFreqName}
            onChangeText={setNewFreqName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Frequency (Hz)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 528"
            placeholderTextColor="#64748b"
            value={newFreqValue}
            onChangeText={setNewFreqValue}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Duration (seconds)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 300"
            placeholderTextColor="#64748b"
            value={newDuration}
            onChangeText={setNewDuration}
            keyboardType="numeric"
          />
        </View>

        <Pressable style={styles.createBtn} onPress={createFrequency}>
          <Text style={styles.createBtnText}>Create Frequency</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Custom Frequencies ({customFreqs.length})</Text>
        
        {customFreqs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🎵</Text>
            <Text style={styles.emptyTitle}>No custom frequencies yet</Text>
            <Text style={styles.emptySubtitle}>Create your first custom healing frequency above</Text>
          </View>
        ) : (
          <FlatList
            data={customFreqs}
            renderItem={renderFrequencyItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            style={styles.freqList}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Popular Frequency Ranges</Text>
        <Text style={styles.tipText}>• 1-4 Hz: Delta waves (deep sleep)</Text>
        <Text style={styles.tipText}>• 4-8 Hz: Theta waves (meditation)</Text>
        <Text style={styles.tipText}>• 8-13 Hz: Alpha waves (relaxation)</Text>
        <Text style={styles.tipText}>• 13-30 Hz: Beta waves (focus)</Text>
        <Text style={styles.tipText}>• 30-100 Hz: Gamma waves (awareness)</Text>
        <Text style={styles.tipText}>• 174-963 Hz: Solfeggio frequencies</Text>
      </View>
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
  card: {
    backgroundColor: '#0b1120',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#bfdbfe',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  createBtn: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  freqList: {
    maxHeight: 300,
  },
  freqCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
  },
  freqInfo: {
    flex: 1,
  },
  freqName: {
    color: '#fde68a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  freqDetails: {
    color: '#94a3b8',
    fontSize: 14,
  },
  freqControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    backgroundColor: '#10b981',
  },
  playBtnActive: {
    backgroundColor: '#ef4444',
  },
  deleteBtn: {
    backgroundColor: '#64748b',
  },
  controlBtnText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#cbd5f5',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  tipText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});