import { Image, Pressable, StyleSheet, Text, View, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabaseClient';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useState } from 'react';
import { RemindersScreen } from './RemindersScreen';
import { JournalScreen } from './JournalScreen';
import { OfflineScreen } from './OfflineScreen';

export function ProfileScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const email = profile?.email;
  const avatarUrl = profile?.avatar_url;
  
  const [showReminders, setShowReminders] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showOffline, setShowOffline] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}> 
            <Text style={styles.placeholderText}>{email?.charAt(0).toUpperCase() ?? 'U'}</Text>
          </View>
        )}
        <Text style={styles.name}>{profile?.full_name || 'Add your name'}</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.tierBadge}>{(profile?.subscription_tier ?? 'free').toUpperCase()}</Text>
      </View>

      {/* Quick Links */}
      <View style={styles.linksSection}>
        <Text style={styles.linksTitle}>Tools & Settings</Text>
        
        <Pressable style={styles.linkCard} onPress={() => Alert.alert('Coming Soon', 'Community Presets will be available in a future update! Stay tuned for shared frequency stacks from the HealTone community.')}>
          <Text style={styles.linkEmoji}>👥</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Community Presets</Text>
            <Text style={styles.linkSub}>Coming Soon - Share & discover stacks</Text>
          </View>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
        
        <Pressable style={styles.linkCard} onPress={() => setShowJournal(true)}>
          <Text style={styles.linkEmoji}>📔</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Frequency Journal</Text>
            <Text style={styles.linkSub}>Track your sessions and progress</Text>
          </View>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
        
        <Pressable style={styles.linkCard} onPress={() => setShowReminders(true)}>
          <Text style={styles.linkEmoji}>⏰</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Session Reminders</Text>
            <Text style={styles.linkSub}>Set daily practice notifications</Text>
          </View>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
        
        <Pressable style={styles.linkCard} onPress={() => setShowOffline(true)}>
          <Text style={styles.linkEmoji}>📲</Text>
          <View style={styles.linkInfo}>
            <Text style={styles.linkTitle}>Offline Mode</Text>
            <Text style={styles.linkSub}>Cache frequencies for offline use</Text>
          </View>
          <Text style={styles.linkArrow}>→</Text>
        </Pressable>
      </View>

      <View style={styles.signOutContainer}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      {/* Reminders Modal */}
      <Modal visible={showReminders} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.backButton} onPress={() => setShowReminders(false)}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back to Profile</Text>
            </Pressable>
          </View>
          <RemindersScreen />
        </SafeAreaView>
      </Modal>

      {/* Journal Modal */}
      <Modal visible={showJournal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.backButton} onPress={() => setShowJournal(false)}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back to Profile</Text>
            </Pressable>
          </View>
          <JournalScreen />
        </SafeAreaView>
      </Modal>

      {/* Offline Modal */}
      <Modal visible={showOffline} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable style={styles.backButton} onPress={() => setShowOffline(false)}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back to Profile</Text>
            </Pressable>
          </View>
          <OfflineScreen />
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12,
    marginBottom: 24
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    fontSize: 48,
    color: '#e0e7ff'
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc'
  },
  email: {
    color: '#94a3b8'
  },
  tierBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#a855f7',
    color: '#fff',
    fontWeight: '700',
    overflow: 'hidden'
  },
  linksSection: {
    marginBottom: 24
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12
  },
  linkEmoji: {
    fontSize: 28,
    marginRight: 14
  },
  linkInfo: {
    flex: 1
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc'
  },
  linkSub: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2
  },
  linkArrow: {
    fontSize: 20,
    color: '#a855f7',
    fontWeight: '700'
  },
  signOutContainer: {
    marginTop: 8
  },
  signOutButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  signOutText: {
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '700'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#030712'
  },
  modalHeader: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  backArrow: {
    fontSize: 24,
    color: '#a855f7',
    marginRight: 8,
    fontWeight: '700'
  },
  backText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600'
  },
  modalClose: {
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'flex-end'
  },
  modalCloseText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600'
  }
});
