import { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';

interface Affirmation {
  id: string;
  text: string;
  category: 'health' | 'wealth' | 'love' | 'success' | 'custom';
  isActive: boolean;
}

const PRESET_AFFIRMATIONS: Omit<Affirmation, 'id' | 'isActive'>[] = [
  { text: "I am perfectly healthy and full of vibrant energy", category: 'health' },
  { text: "Every cell in my body radiates health and wellness", category: 'health' },
  { text: "I attract abundance and prosperity into my life", category: 'wealth' },
  { text: "Money flows to me easily and effortlessly", category: 'wealth' },
  { text: "I am worthy of love and I give love freely", category: 'love' },
  { text: "I attract loving, supportive relationships", category: 'love' },
  { text: "I achieve my goals with ease and grace", category: 'success' },
  { text: "Success comes naturally to me in all areas of life", category: 'success' },
];

export function ManifestationScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const [affirmations, setAffirmations] = useState<Affirmation[]>(
    PRESET_AFFIRMATIONS.map((aff, index) => ({
      ...aff,
      id: index.toString(),
      isActive: false,
    }))
  );
  const [newAffirmation, setNewAffirmation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'health' | 'wealth' | 'love' | 'success'>('health');
  const [isSessionActive, setIsSessionActive] = useState(false);

  const categories = [
    { key: 'health' as const, label: 'Health', emoji: '🌿' },
    { key: 'wealth' as const, label: 'Wealth', emoji: '💰' },
    { key: 'love' as const, label: 'Love', emoji: '❤️' },
    { key: 'success' as const, label: 'Success', emoji: '🎯' },
  ];

  const addCustomAffirmation = () => {
    if (!newAffirmation.trim()) {
      Alert.alert('Error', 'Please enter an affirmation.');
      return;
    }

    const newAff: Affirmation = {
      id: Date.now().toString(),
      text: newAffirmation.trim(),
      category: 'custom',
      isActive: false,
    };

    setAffirmations(prev => [newAff, ...prev]);
    setNewAffirmation('');
    Alert.alert('Success', 'Custom affirmation added!');
  };

  const toggleAffirmation = (id: string) => {
    setAffirmations(prev =>
      prev.map(aff => ({
        ...aff,
        isActive: aff.id === id ? !aff.isActive : aff.isActive,
      }))
    );
  };

  const startManifestationSession = () => {
    const activeAffirmations = affirmations.filter(aff => aff.isActive);
    if (activeAffirmations.length === 0) {
      Alert.alert('No Affirmations', 'Please select at least one affirmation to start a session.');
      return;
    }

    setIsSessionActive(true);
    Alert.alert(
      'Manifestation Session Started',
      `Beginning session with ${activeAffirmations.length} affirmations. Find a quiet space and focus on your intentions.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // In a real implementation, this would start the manifestation audio/timer
            setTimeout(() => {
              setIsSessionActive(false);
              Alert.alert('Session Complete', 'Your manifestation session is complete. Trust in the process!');
            }, 5000); // Demo: 5 seconds
          }
        }
      ]
    );
  };

  const filteredAffirmations = affirmations.filter(aff => 
    selectedCategory === 'health' ? aff.category === 'health' :
    selectedCategory === 'wealth' ? aff.category === 'wealth' :
    selectedCategory === 'love' ? aff.category === 'love' :
    selectedCategory === 'success' ? aff.category === 'success' :
    false
  );

  const customAffirmations = affirmations.filter(aff => aff.category === 'custom');

  const renderAffirmationItem = ({ item }: { item: Affirmation }) => (
    <Pressable
      style={[styles.affirmationCard, item.isActive && styles.affirmationCardActive]}
      onPress={() => toggleAffirmation(item.id)}
    >
      <View style={styles.affirmationHeader}>
        <Text style={[styles.affirmationText, item.isActive && styles.affirmationTextActive]}>
          {item.text}
        </Text>
        <View style={[styles.checkbox, item.isActive && styles.checkboxActive]}>
          {item.isActive && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Manifestation Hub</Text>
        <Text style={styles.subheading}>Program your subconscious for success</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Session</Text>
        <Text style={styles.sessionStatus}>
          {isSessionActive ? '🟢 Session in progress...' : '⭕ Ready to manifest'}
        </Text>
        <Pressable 
          style={[styles.sessionBtn, isSessionActive && styles.sessionBtnActive]} 
          onPress={startManifestationSession}
          disabled={isSessionActive}
        >
          <Text style={styles.sessionBtnText}>
            {isSessionActive ? 'Manifesting...' : 'Start Manifestation Session'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Choose Affirmation Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {categories.map(cat => (
            <Pressable
              key={cat.key}
              style={[styles.categoryBtn, selectedCategory === cat.key && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {categories.find(c => c.key === selectedCategory)?.emoji} {categories.find(c => c.key === selectedCategory)?.label} Affirmations
        </Text>
        <FlatList
          data={filteredAffirmations}
          renderItem={renderAffirmationItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.affirmationsList}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Custom Affirmation</Text>
        <TextInput
          style={styles.textInput}
          placeholder="I am grateful for..."
          placeholderTextColor="#64748b"
          value={newAffirmation}
          onChangeText={setNewAffirmation}
          multiline
        />
        <Pressable style={styles.addBtn} onPress={addCustomAffirmation}>
          <Text style={styles.addBtnText}>Add Custom Affirmation</Text>
        </Pressable>
      </View>

      {customAffirmations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>✨ Your Custom Affirmations</Text>
          <FlatList
            data={customAffirmations}
            renderItem={renderAffirmationItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Manifestation Tips</Text>
        <Text style={styles.tipText}>• Use present tense ("I am" not "I will be")</Text>
        <Text style={styles.tipText}>• Feel the emotions of already having what you want</Text>
        <Text style={styles.tipText}>• Repeat affirmations daily for best results</Text>
        <Text style={styles.tipText}>• Combine with healing frequencies for deeper impact</Text>
        <Text style={styles.tipText}>• Visualize your goals while listening</Text>
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
  sessionStatus: {
    color: '#cbd5f5',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  sessionBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  sessionBtnActive: {
    backgroundColor: '#ef4444',
  },
  sessionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#475569',
  },
  categoryBtnActive: {
    backgroundColor: '#4338ca',
    borderColor: '#6366f1',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  affirmationsList: {
    maxHeight: 400,
  },
  affirmationCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  affirmationCardActive: {
    backgroundColor: '#4338ca',
    borderColor: '#6366f1',
  },
  affirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  affirmationText: {
    color: '#cbd5f5',
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    marginRight: 12,
  },
  affirmationTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#475569',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: '#4338ca',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});