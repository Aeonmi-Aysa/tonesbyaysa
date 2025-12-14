import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientView } from '@/components/GradientView';
import { 
  useRemindersStore, 
  REMINDER_PRESETS, 
  formatTime, 
  formatDays,
  type SessionReminder 
} from '@/store/useRemindersStore';

const DAYS = [
  { id: 1, short: 'S', name: 'Sunday' },
  { id: 2, short: 'M', name: 'Monday' },
  { id: 3, short: 'T', name: 'Tuesday' },
  { id: 4, short: 'W', name: 'Wednesday' },
  { id: 5, short: 'T', name: 'Thursday' },
  { id: 6, short: 'F', name: 'Friday' },
  { id: 7, short: 'S', name: 'Saturday' },
];

export function RemindersScreen() {
  const { 
    reminders, 
    permissionGranted,
    requestPermissions,
    addReminder,
    deleteReminder,
    toggleReminder 
  } = useRemindersStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  
  // New reminder form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [selectedDays, setSelectedDays] = useState<number[]>([2, 3, 4, 5, 6]); // Weekdays default

  useEffect(() => {
    // Request permissions on mount
    if (!permissionGranted) {
      requestPermissions();
    }
  }, []);

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  const adjustHour = (delta: number) => {
    setHour(prev => {
      const newVal = prev + delta;
      if (newVal < 0) return 23;
      if (newVal > 23) return 0;
      return newVal;
    });
  };

  const adjustMinute = (delta: number) => {
    setMinute(prev => {
      const newVal = prev + delta;
      if (newVal < 0) return 55;
      if (newVal > 59) return 0;
      return newVal;
    });
  };

  const handleCreateReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your reminder.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one day for the reminder.');
      return;
    }

    await addReminder({
      title: title.trim(),
      body: body.trim() || 'Time for your healing session!',
      hour,
      minute,
      days: selectedDays,
      enabled: true
    });

    setShowCreateModal(false);
    resetForm();
    Alert.alert('✅ Reminder Created', `You'll be reminded at ${formatTime(hour, minute)}`);
  };

  const handleUsePreset = async (preset: typeof REMINDER_PRESETS[0]) => {
    await addReminder({
      title: preset.title,
      body: preset.body,
      hour: preset.defaultHour,
      minute: preset.defaultMinute,
      days: [1, 2, 3, 4, 5, 6, 7], // Every day
      enabled: true
    });
    
    setShowPresetsModal(false);
    Alert.alert('✅ Reminder Created', `${preset.title} set for ${formatTime(preset.defaultHour, preset.defaultMinute)}`);
  };

  const handleDeleteReminder = (id: string, title: string) => {
    Alert.alert(
      'Delete Reminder?',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteReminder(id) 
        }
      ]
    );
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setHour(8);
    setMinute(0);
    setSelectedDays([2, 3, 4, 5, 6]);
  };

  const renderReminderCard = (reminder: SessionReminder) => (
    <View key={reminder.id} style={styles.reminderCard}>
      <View style={styles.reminderMain}>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderTitle}>{reminder.title}</Text>
          <Text style={styles.reminderTime}>{formatTime(reminder.hour, reminder.minute)}</Text>
          <Text style={styles.reminderDays}>{formatDays(reminder.days)}</Text>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={() => toggleReminder(reminder.id)}
          trackColor={{ false: '#334155', true: '#7c3aed' }}
          thumbColor={reminder.enabled ? '#a855f7' : '#64748b'}
        />
      </View>
      {reminder.body && (
        <Text style={styles.reminderBody}>{reminder.body}</Text>
      )}
      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => handleDeleteReminder(reminder.id, reminder.title)}
      >
        <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GradientView colors={['#0f172a', '#1e1b4b', '#0f172a']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>⏰ Session Reminders</Text>
            <Text style={styles.subtitle}>Never miss your healing practice</Text>
          </View>

          {/* Permission Status */}
          {!permissionGranted && (
            <TouchableOpacity style={styles.permissionCard} onPress={requestPermissions}>
              <Text style={styles.permissionText}>
                🔔 Tap to enable notifications
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => setShowPresetsModal(true)}
            >
              <Text style={styles.actionBtnEmoji}>✨</Text>
              <Text style={styles.actionBtnText}>Use Preset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.actionBtnEmoji}>➕</Text>
              <Text style={styles.actionBtnText}>Create Custom</Text>
            </TouchableOpacity>
          </View>

          {/* Reminders List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Your Reminders ({reminders.length})
            </Text>
            
            {reminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={styles.emptyText}>No reminders yet</Text>
                <Text style={styles.emptySub}>
                  Create a reminder to build your healing habit
                </Text>
              </View>
            ) : (
              reminders.map(renderReminderCard)
            )}
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for Building a Practice</Text>
            <Text style={styles.tipText}>• Start with just one reminder at a consistent time</Text>
            <Text style={styles.tipText}>• Morning and evening are powerful times for frequency work</Text>
            <Text style={styles.tipText}>• Stack reminders with existing habits for better adherence</Text>
          </View>
        </ScrollView>

        {/* Create Reminder Modal */}
        <Modal visible={showCreateModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Create Reminder</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Reminder title"
                placeholderTextColor="#64748b"
                value={title}
                onChangeText={setTitle}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Message (optional)"
                placeholderTextColor="#64748b"
                value={body}
                onChangeText={setBody}
                multiline
              />

              {/* Time Picker */}
              <Text style={styles.inputLabel}>Time</Text>
              <View style={styles.timePicker}>
                <View style={styles.timeUnit}>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => adjustHour(1)}>
                    <Text style={styles.timeBtnText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{hour.toString().padStart(2, '0')}</Text>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => adjustHour(-1)}>
                    <Text style={styles.timeBtnText}>▼</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeUnit}>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => adjustMinute(5)}>
                    <Text style={styles.timeBtnText}>▲</Text>
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>{minute.toString().padStart(2, '0')}</Text>
                  <TouchableOpacity style={styles.timeBtn} onPress={() => adjustMinute(-5)}>
                    <Text style={styles.timeBtnText}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Day Selector */}
              <Text style={styles.inputLabel}>Repeat</Text>
              <View style={styles.daysRow}>
                {DAYS.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[styles.dayBtn, selectedDays.includes(day.id) && styles.dayBtnActive]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={[styles.dayBtnText, selectedDays.includes(day.id) && styles.dayBtnTextActive]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.daysHint}>{formatDays(selectedDays)}</Text>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelBtn}
                  onPress={() => { setShowCreateModal(false); resetForm(); }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmBtn}
                  onPress={handleCreateReminder}
                >
                  <Text style={styles.modalConfirmText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Presets Modal */}
        <Modal visible={showPresetsModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>✨ Quick Presets</Text>
              <Text style={styles.presetsSubtitle}>
                One-tap reminders for common wellness routines
              </Text>
              
              <ScrollView style={styles.presetsList}>
                {REMINDER_PRESETS.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.presetCard}
                    onPress={() => handleUsePreset(preset)}
                  >
                    <Text style={styles.presetTitle}>{preset.title}</Text>
                    <Text style={styles.presetTime}>
                      {formatTime(preset.defaultHour, preset.defaultMinute)}
                    </Text>
                    <Text style={styles.presetBody}>{preset.body}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setShowPresetsModal(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
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
  
  permissionCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center'
  },
  permissionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#334155'
  },
  actionBtnPrimary: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  actionBtnEmoji: { fontSize: 18 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 12 },
  
  reminderCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12
  },
  reminderMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  reminderTime: { fontSize: 24, fontWeight: '800', color: '#a855f7', marginVertical: 4 },
  reminderDays: { fontSize: 13, color: '#94a3b8' },
  reminderBody: { fontSize: 13, color: '#cbd5e1', marginBottom: 12 },
  deleteBtn: { alignSelf: 'flex-start' },
  deleteBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  emptySub: { fontSize: 13, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
  
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#a855f7'
  },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 10 },
  tipText: { fontSize: 13, color: '#cbd5e1', marginBottom: 6 },
  
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
    maxHeight: '85%'
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16, textAlign: 'center' },
  
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, marginTop: 8 },
  
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  timeUnit: { alignItems: 'center' },
  timeBtn: {
    padding: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 8
  },
  timeBtnText: { color: '#a855f7', fontSize: 18 },
  timeValue: { fontSize: 36, fontWeight: '800', color: '#fff', marginVertical: 8 },
  timeSeparator: { fontSize: 36, fontWeight: '800', color: '#fff', marginHorizontal: 12 },
  
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)'
  },
  dayBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  dayBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  dayBtnTextActive: { color: '#fff' },
  daysHint: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
    backgroundColor: '#7c3aed'
  },
  modalConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  
  presetsSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16
  },
  presetsList: { maxHeight: 350 },
  presetCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)'
  },
  presetTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  presetTime: { fontSize: 14, color: '#a855f7', fontWeight: '600', marginVertical: 4 },
  presetBody: { fontSize: 13, color: '#94a3b8' }
});
