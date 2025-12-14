import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '@/components/GradientView';
import { useJournalStore, type MoodRating, type JournalEntry, type FrequencyInsight } from '@/store/useJournalStore';

const { width } = Dimensions.get('window');

const MOOD_EMOJIS: Record<MoodRating, string> = {
  1: '😫',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊'
};

const ENERGY_EMOJIS: Record<MoodRating, string> = {
  1: '🔋',
  2: '🪫',
  3: '⚡',
  4: '💪',
  5: '🚀'
};

const COMMON_TAGS = [
  'Sleep', 'Focus', 'Meditation', 'Anxiety', 'Pain Relief',
  'Morning', 'Evening', 'Work', 'Exercise', 'Relaxation'
];

export function JournalScreen() {
  const {
    entries,
    pendingSession,
    startSession,
    completeSession,
    cancelSession,
    deleteEntry,
    getInsights,
    getStreak,
    getTotalSessions,
    getAverageImprovement
  } = useJournalStore();

  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'insights'>('log');
  const [showPreModal, setShowPreModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  
  // Pre-session state
  const [moodBefore, setMoodBefore] = useState<MoodRating>(3);
  const [energyBefore, setEnergyBefore] = useState<MoodRating>(3);
  const [notesBefore, setNotesBefore] = useState('');
  const [frequencyName, setFrequencyName] = useState('');
  
  // Post-session state
  const [moodAfter, setMoodAfter] = useState<MoodRating>(3);
  const [energyAfter, setEnergyAfter] = useState<MoodRating>(3);
  const [notesAfter, setNotesAfter] = useState('');
  const [duration, setDuration] = useState('15');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const streak = getStreak();
  const totalSessions = getTotalSessions();
  const avgImprovement = getAverageImprovement();
  const insights = getInsights();

  const handleStartSession = () => {
    startSession({
      frequencyName: frequencyName || 'General Session',
      moodBefore,
      energyBefore,
      notesBefore: notesBefore || undefined
    });
    setShowPreModal(false);
    setMoodBefore(3);
    setEnergyBefore(3);
    setNotesBefore('');
    setFrequencyName('');
  };

  const handleCompleteSession = () => {
    completeSession({
      moodAfter,
      energyAfter,
      notesAfter: notesAfter || undefined,
      duration: parseInt(duration) || 15,
      tags: selectedTags
    });
    setShowPostModal(false);
    setMoodAfter(3);
    setEnergyAfter(3);
    setNotesAfter('');
    setDuration('15');
    setSelectedTags([]);
    Alert.alert('Session Logged! 📝', 'Your journal entry has been saved.');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMoodSelector = (
    value: MoodRating, 
    onChange: (v: MoodRating) => void,
    emojis: Record<MoodRating, string>,
    label: string
  ) => (
    <View style={styles.moodSelector}>
      <Text style={styles.moodLabel}>{label}</Text>
      <View style={styles.moodRow}>
        {([1, 2, 3, 4, 5] as MoodRating[]).map(rating => (
          <TouchableOpacity
            key={rating}
            style={[styles.moodBtn, value === rating && styles.moodBtnActive]}
            onPress={() => onChange(rating)}
          >
            <Text style={styles.moodEmoji}>{emojis[rating]}</Text>
            <Text style={[styles.moodNum, value === rating && styles.moodNumActive]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLogTab = () => (
    <View style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>🔥 {streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>📊 {totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {avgImprovement >= 0 ? '📈' : '📉'} {avgImprovement > 0 ? '+' : ''}{avgImprovement}
          </Text>
          <Text style={styles.statLabel}>Avg Change</Text>
        </View>
      </View>

      {/* Current Session Status */}
      {pendingSession ? (
        <View style={styles.activeSessionCard}>
          <GradientView
            colors={['rgba(168, 85, 247, 0.3)', 'rgba(139, 92, 246, 0.2)']}
            style={styles.activeSessionGradient}
          >
            <Text style={styles.activeSessionTitle}>🎧 Session In Progress</Text>
            <Text style={styles.activeSessionFreq}>
              {pendingSession.frequencyName || pendingSession.bathName || 'Unknown'}
            </Text>
            <Text style={styles.activeSessionMood}>
              Started: Mood {MOOD_EMOJIS[pendingSession.moodBefore!]} | Energy {ENERGY_EMOJIS[pendingSession.energyBefore!]}
            </Text>
            <View style={styles.activeSessionBtns}>
              <TouchableOpacity 
                style={styles.completeBtn}
                onPress={() => setShowPostModal(true)}
              >
                <Text style={styles.completeBtnText}>✅ Complete Session</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={() => {
                  Alert.alert(
                    'Cancel Session?',
                    'This will discard the current session without logging.',
                    [
                      { text: 'Keep Going', style: 'cancel' },
                      { text: 'Cancel', style: 'destructive', onPress: cancelSession }
                    ]
                  );
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </GradientView>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.startSessionBtn}
          onPress={() => setShowPreModal(true)}
        >
          <GradientView
            colors={['#a855f7', '#7c3aed']}
            style={styles.startSessionGradient}
          >
            <Text style={styles.startSessionText}>📝 Log New Session</Text>
            <Text style={styles.startSessionSub}>Track your before & after state</Text>
          </GradientView>
        </TouchableOpacity>
      )}

      {/* Quick Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Journaling Tips</Text>
        <Text style={styles.tipText}>• Log before you start for accurate tracking</Text>
        <Text style={styles.tipText}>• Add tags to find patterns over time</Text>
        <Text style={styles.tipText}>• Check Insights to see what works best for you</Text>
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={styles.emptyText}>No journal entries yet</Text>
          <Text style={styles.emptySub}>Start logging sessions to track your progress</Text>
        </View>
      ) : (
        entries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert(
                    'Delete Entry?',
                    'This cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(entry.id) }
                    ]
                  );
                }}
              >
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.entryFreq}>
              {entry.frequencyName || entry.bathName || 'General Session'}
            </Text>
            <View style={styles.entryMoods}>
              <View style={styles.moodChange}>
                <Text style={styles.moodChangeLabel}>Mood</Text>
                <Text style={styles.moodChangeValue}>
                  {MOOD_EMOJIS[entry.moodBefore]} → {MOOD_EMOJIS[entry.moodAfter]}
                  <Text style={[
                    styles.changeNum,
                    entry.moodAfter > entry.moodBefore ? styles.positive : 
                    entry.moodAfter < entry.moodBefore ? styles.negative : styles.neutral
                  ]}>
                    {' '}({entry.moodAfter > entry.moodBefore ? '+' : ''}{entry.moodAfter - entry.moodBefore})
                  </Text>
                </Text>
              </View>
              <View style={styles.moodChange}>
                <Text style={styles.moodChangeLabel}>Energy</Text>
                <Text style={styles.moodChangeValue}>
                  {ENERGY_EMOJIS[entry.energyBefore]} → {ENERGY_EMOJIS[entry.energyAfter]}
                  <Text style={[
                    styles.changeNum,
                    entry.energyAfter > entry.energyBefore ? styles.positive : 
                    entry.energyAfter < entry.energyBefore ? styles.negative : styles.neutral
                  ]}>
                    {' '}({entry.energyAfter > entry.energyBefore ? '+' : ''}{entry.energyAfter - entry.energyBefore})
                  </Text>
                </Text>
              </View>
            </View>
            <Text style={styles.entryDuration}>⏱️ {entry.duration} min</Text>
            {entry.tags.length > 0 && (
              <View style={styles.entryTags}>
                {entry.tags.map(tag => (
                  <View key={tag} style={styles.entryTag}>
                    <Text style={styles.entryTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {(entry.notesBefore || entry.notesAfter) && (
              <View style={styles.entryNotes}>
                {entry.notesBefore && (
                  <Text style={styles.noteText}>Before: {entry.notesBefore}</Text>
                )}
                {entry.notesAfter && (
                  <Text style={styles.noteText}>After: {entry.notesAfter}</Text>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {insights.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔬</Text>
          <Text style={styles.emptyText}>Not enough data yet</Text>
          <Text style={styles.emptySub}>Log more sessions to discover your personal insights</Text>
        </View>
      ) : (
        <>
          <Text style={styles.insightsTitle}>🏆 Top Frequencies For You</Text>
          {insights.slice(0, 5).map((insight, index) => (
            <View key={insight.frequencyId} style={styles.insightCard}>
              <View style={styles.insightRank}>
                <Text style={styles.insightRankNum}>#{index + 1}</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightName}>{insight.frequencyName}</Text>
                <Text style={styles.insightStats}>
                  Used {insight.timesUsed}x • Best at {insight.bestTimeOfDay}
                </Text>
                <View style={styles.insightMetrics}>
                  <Text style={[styles.insightMetric, insight.avgMoodImprovement > 0 && styles.positive]}>
                    Mood: {insight.avgMoodImprovement > 0 ? '+' : ''}{insight.avgMoodImprovement}
                  </Text>
                  <Text style={[styles.insightMetric, insight.avgEnergyImprovement > 0 && styles.positive]}>
                    Energy: {insight.avgEnergyImprovement > 0 ? '+' : ''}{insight.avgEnergyImprovement}
                  </Text>
                </View>
                {insight.mostUsedTags.length > 0 && (
                  <Text style={styles.insightTags}>
                    Common tags: {insight.mostUsedTags.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          ))}
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Your Summary</Text>
            <Text style={styles.summaryText}>
              You've logged {totalSessions} sessions with an average improvement of{' '}
              <Text style={avgImprovement >= 0 ? styles.positive : styles.negative}>
                {avgImprovement > 0 ? '+' : ''}{avgImprovement}
              </Text> points.
            </Text>
            {streak > 0 && (
              <Text style={styles.summaryText}>
                🔥 You're on a {streak}-day journaling streak!
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );

  return (
    <GradientView colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>📔 Frequency Journal</Text>
          <Text style={styles.subtitle}>Track your healing journey</Text>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {(['log', 'history', 'insights'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'log' ? '📝 Log' : tab === 'history' ? '📖 History' : '🔬 Insights'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'log' && renderLogTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'insights' && renderInsightsTab()}

        {/* Pre-Session Modal */}
        <Modal visible={showPreModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>📝 Before Your Session</Text>
              
              <TextInput
                style={styles.input}
                placeholder="What frequency/bath are you using? (optional)"
                placeholderTextColor="#64748b"
                value={frequencyName}
                onChangeText={setFrequencyName}
              />

              {renderMoodSelector(moodBefore, setMoodBefore, MOOD_EMOJIS, 'Current Mood')}
              {renderMoodSelector(energyBefore, setEnergyBefore, ENERGY_EMOJIS, 'Current Energy')}

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How are you feeling? Any intentions? (optional)"
                placeholderTextColor="#64748b"
                value={notesBefore}
                onChangeText={setNotesBefore}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalBtns}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn}
                  onPress={() => setShowPreModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmBtn}
                  onPress={handleStartSession}
                >
                  <Text style={styles.modalConfirmText}>Start Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Post-Session Modal */}
        <Modal visible={showPostModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>✅ After Your Session</Text>

                {renderMoodSelector(moodAfter, setMoodAfter, MOOD_EMOJIS, 'Current Mood')}
                {renderMoodSelector(energyAfter, setEnergyAfter, ENERGY_EMOJIS, 'Current Energy')}

                <View style={styles.durationRow}>
                  <Text style={styles.durationLabel}>Session Duration (minutes)</Text>
                  <TextInput
                    style={styles.durationInput}
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>

                <Text style={styles.tagsLabel}>Tags (select all that apply)</Text>
                <View style={styles.tagsGrid}>
                  {COMMON_TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagBtn, selectedTags.includes(tag) && styles.tagBtnActive]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagBtnText, selectedTags.includes(tag) && styles.tagBtnTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="How do you feel now? Any observations? (optional)"
                  placeholderTextColor="#64748b"
                  value={notesAfter}
                  onChangeText={setNotesAfter}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalBtns}>
                  <TouchableOpacity 
                    style={styles.modalCancelBtn}
                    onPress={() => setShowPostModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalConfirmBtn}
                    onPress={handleCompleteSession}
                  >
                    <Text style={styles.modalConfirmText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  
  tabBar: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    padding: 4
  },
  tab: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center',
    borderRadius: 10
  },
  tabActive: { backgroundColor: 'rgba(168, 85, 247, 0.3)' },
  tabText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#a855f7' },
  
  tabContent: { flex: 1, padding: 20 },
  
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { 
    flex: 1, 
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  
  activeSessionCard: { marginBottom: 20 },
  activeSessionGradient: { borderRadius: 16, padding: 20 },
  activeSessionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  activeSessionFreq: { fontSize: 16, color: '#e0e7ff', marginBottom: 4 },
  activeSessionMood: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  activeSessionBtns: { flexDirection: 'row', gap: 12 },
  completeBtn: { 
    flex: 1, 
    backgroundColor: '#22c55e', 
    borderRadius: 10, 
    paddingVertical: 12,
    alignItems: 'center'
  },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBtn: { 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)'
  },
  cancelBtnText: { color: '#ef4444', fontWeight: '600' },
  
  startSessionBtn: { marginBottom: 20 },
  startSessionGradient: { borderRadius: 16, padding: 24, alignItems: 'center' },
  startSessionText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  startSessionSub: { fontSize: 14, color: '#e0e7ff', marginTop: 4 },
  
  tipsCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.6)', 
    borderRadius: 16, 
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#a855f7'
  },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  tipText: { fontSize: 14, color: '#cbd5e1', marginBottom: 6 },
  
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  emptySub: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  
  entryCard: { 
    backgroundColor: 'rgba(30, 41, 59, 0.6)', 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 12
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  entryDate: { fontSize: 12, color: '#94a3b8' },
  deleteBtn: { fontSize: 16 },
  entryFreq: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  entryMoods: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  moodChange: {},
  moodChangeLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
  moodChangeValue: { fontSize: 16, color: '#fff' },
  changeNum: { fontSize: 14, fontWeight: '600' },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
  neutral: { color: '#94a3b8' },
  entryDuration: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  entryTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  entryTag: { 
    backgroundColor: 'rgba(168, 85, 247, 0.2)', 
    borderRadius: 6, 
    paddingHorizontal: 8, 
    paddingVertical: 4 
  },
  entryTagText: { fontSize: 11, color: '#a855f7' },
  entryNotes: { 
    backgroundColor: 'rgba(15, 23, 42, 0.5)', 
    borderRadius: 8, 
    padding: 10,
    marginTop: 8
  },
  noteText: { fontSize: 13, color: '#cbd5e1', marginBottom: 4 },
  
  insightsTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  insightCard: { 
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)', 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 12
  },
  insightRank: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  insightRankNum: { fontSize: 16, fontWeight: '800', color: '#a855f7' },
  insightContent: { flex: 1 },
  insightName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  insightStats: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  insightMetrics: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  insightMetric: { fontSize: 13, color: '#fff', fontWeight: '600' },
  insightTags: { fontSize: 11, color: '#94a3b8' },
  
  summaryCard: { 
    backgroundColor: 'rgba(168, 85, 247, 0.15)', 
    borderRadius: 16, 
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)'
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  summaryText: { fontSize: 14, color: '#cbd5e1', marginBottom: 6, lineHeight: 22 },
  
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center',
    padding: 20
  },
  modal: { 
    backgroundColor: '#1e293b', 
    borderRadius: 20, 
    padding: 24,
    maxHeight: '90%'
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 20, textAlign: 'center' },
  
  input: { 
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  
  moodSelector: { marginBottom: 20 },
  moodLabel: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 10 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { 
    alignItems: 'center', 
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    minWidth: 52
  },
  moodBtnActive: { backgroundColor: 'rgba(168, 85, 247, 0.3)', borderWidth: 1, borderColor: '#a855f7' },
  moodEmoji: { fontSize: 24, marginBottom: 4 },
  moodNum: { fontSize: 12, color: '#94a3b8' },
  moodNumActive: { color: '#a855f7', fontWeight: '700' },
  
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  durationLabel: { fontSize: 14, fontWeight: '600', color: '#fff' },
  durationInput: { 
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  
  tagsLabel: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 10 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  tagBtnActive: { backgroundColor: 'rgba(168, 85, 247, 0.3)', borderColor: '#a855f7' },
  tagBtnText: { fontSize: 13, color: '#94a3b8' },
  tagBtnTextActive: { color: '#a855f7', fontWeight: '600' },
  
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.2)'
  },
  modalCancelText: { color: '#94a3b8', fontWeight: '600', fontSize: 15 },
  modalConfirmBtn: { 
    flex: 2, 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center',
    backgroundColor: '#a855f7'
  },
  modalConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});
