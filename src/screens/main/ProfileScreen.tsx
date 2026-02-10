import { Image, Pressable, StyleSheet, Text, View, ScrollView, Modal, Alert, ActivityIndicator, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabaseClient';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { useThemeStore, useTheme } from '@/store/useThemeStore';
import { RemindersScreen } from './RemindersScreen';
import { JournalScreen } from './JournalScreen';
import { OfflineScreen } from './OfflineScreen';
import { DisclaimerScreen } from './DisclaimerScreen';
import { CommunityScreen } from './CommunityScreen';
import { PricingScreen } from './PricingScreen';

const MAX_AVATAR_SIZE = 4 * 1024 * 1024; // 4MB to match your bucket limit
const AVATAR_BUCKET = 'avatars';

export function ProfileScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const setProfile = useSessionStore((state: SessionState) => state.setProfile);
  const { colors, isDark } = useTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const email = profile?.email;
  const avatarUrl = profile?.avatar_url;
  
  const [showReminders, setShowReminders] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showOffline, setShowOffline] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // PAYWALL MODAL FIX: Ensure PricingScreen renders without crashes
  const handlePricingOpen = () => {
    try {
      setShowPricing(true);
    } catch (error) {
      console.error('Error opening pricing:', error);
      Alert.alert('Error', 'Could not open pricing screen');
    }
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to change your profile picture.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Good quality, reasonable file size
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Check file size (fileSize might be undefined on some platforms)
      if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE) {
        Alert.alert(
          'Image Too Large',
          `Please select an image under 5MB. Your image is ${(asset.fileSize / (1024 * 1024)).toFixed(1)}MB.`
        );
        return;
      }

      await uploadAvatar(asset.uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      console.log('📤 Starting avatar upload...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to update your profile picture.');
        return;
      }

      // Get file extension
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${ext}`;

      console.log('📄 Reading file as base64...');
      // Read file as base64 using expo-file-system (reliable in React Native)
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      console.log('📄 Base64 read complete, length:', base64.length);

      // Check size (base64 is ~33% larger than binary)
      const estimatedSize = (base64.length * 3) / 4;
      console.log('📊 Estimated file size:', (estimatedSize / 1024).toFixed(0), 'KB');
      
      if (estimatedSize > MAX_AVATAR_SIZE) {
        Alert.alert(
          'Image Too Large',
          `Please select an image under 4MB. Your image is ${(estimatedSize / (1024 * 1024)).toFixed(1)}MB.`
        );
        return;
      }

      console.log('☁️ Uploading to Supabase Storage...');
      // Convert base64 to ArrayBuffer and upload
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(fileName, decode(base64), {
          cacheControl: '3600',
          upsert: true,
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
        });

      if (uploadError) {
        console.log('❌ Upload error:', uploadError);
        throw uploadError;
      }
      console.log('✅ Upload complete!');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 Public URL:', publicUrl);

      // Update local state FIRST so UI updates immediately
      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }
      setUploading(false);
      Alert.alert('Success', 'Your profile picture has been updated!');

      // Update profile in database (non-blocking)
      console.log('💾 Updating profile in database...');
      supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) console.log('⚠️ Profile DB update failed:', error.message);
          else console.log('✅ Profile DB updated');
        });

      // Also update auth user metadata (non-blocking)
      console.log('🔐 Updating auth metadata...');
      supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
        .then(() => console.log('✅ Auth metadata updated'))
        .catch((e) => console.log('⚠️ Auth metadata update failed:', e.message));

      console.log('🎉 Upload complete!');
      return; // Exit early since we already handled success

    } catch (error: any) {
      console.error('Avatar upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Better error messages
      let hint = 'Failed to upload profile picture. Please try again.';
      if (error.message?.toLowerCase().includes('bucket')) {
        hint = 'The avatars storage bucket may not be set up. Please contact support.';
      } else if (error.message?.toLowerCase().includes('network')) {
        hint = 'Network error. Please check your internet connection and try again.';
      } else if (error.statusCode === 403 || error.message?.includes('403')) {
        hint = 'Permission denied. Storage policies may need to be configured.';
      } else if (error.message) {
        hint = error.message;
      }
      
      Alert.alert('Upload Failed', hint);
    } finally {
      setUploading(false);
    }
  };

  // Dynamic styles based on theme
  const themedStyles = {
    container: { backgroundColor: colors.background },
    card: { backgroundColor: colors.surface, borderColor: colors.border },
    placeholder: { backgroundColor: isDark ? '#1e1b4b' : colors.primaryLight },
    name: { color: colors.text },
    email: { color: colors.textSecondary },
    tierBadge: { backgroundColor: colors.primary },
    linksTitle: { color: colors.textSecondary },
    linkCard: { backgroundColor: colors.surface, borderColor: colors.border },
    linkTitle: { color: colors.text },
    linkSub: { color: colors.textSecondary },
    linkArrow: { color: colors.primary },
    modalContainer: { backgroundColor: colors.background },
    modalHeader: { backgroundColor: colors.surface, borderBottomColor: colors.border },
    backArrow: { color: colors.primary },
    backText: { color: colors.primary },
  };

  return (
    <ScrollView style={[styles.container, themedStyles.container]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.card, themedStyles.card]}>
        <Pressable onPress={pickImage} disabled={uploading} style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.placeholder, themedStyles.placeholder]}> 
              <Text style={styles.placeholderText}>{email?.charAt(0).toUpperCase() ?? 'U'}</Text>
            </View>
          )}
          {uploading ? (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
          )}
        </Pressable>
        <Text style={[styles.name, themedStyles.name]}>{profile?.full_name || 'Add your name'}</Text>
        <Text style={[styles.email, themedStyles.email]}>{email}</Text>
        <Text style={[styles.tierBadge, themedStyles.tierBadge]}>{(profile?.subscription_tier ?? 'free').toUpperCase()}</Text>
      </View>

      {/* Theme Toggle */}
      <View style={[styles.themeToggleCard, themedStyles.linkCard]}>
        <Text style={styles.linkEmoji}>{isDark ? '🌙' : '☀️'}</Text>
        <View style={styles.linkInfo}>
          <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Appearance</Text>
          <Text style={[styles.linkSub, themedStyles.linkSub]}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
        </View>
        <Switch
          value={!isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={isDark ? colors.textMuted : colors.primary}
        />
      </View>

      {/* Upgrade Banner - Show for free tier only */}
      {profile?.subscription_tier === 'free' && (
        <Pressable 
          style={[styles.upgradeBanner, { borderColor: colors.primary }]} 
          onPress={handlePricingOpen}
        >
          <View style={styles.upgradeBannerContent}>
            <Text style={styles.upgradeBannerEmoji}>🎁</Text>
            <View style={styles.upgradeBannerText}>
              <Text style={[styles.upgradeBannerTitle, { color: colors.primary }]}>Unlock Premium</Text>
              <Text style={[styles.upgradeBannerSub, { color: colors.textSecondary }]}>
                Get 500+ frequencies & 100+ wellness baths
              </Text>
            </View>
          </View>
          <Text style={[styles.linkArrow, { color: colors.primary }]}>→</Text>
        </Pressable>
      )}

      {/* Quick Links */}
      <View style={styles.linksSection}>
        <Text style={[styles.linksTitle, themedStyles.linksTitle]}>Tools & Settings</Text>
        
        <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={() => setShowCommunity(true)}>
          <Text style={styles.linkEmoji}>👥</Text>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Community Presets</Text>
            <Text style={[styles.linkSub, themedStyles.linkSub]}>Share & discover frequency stacks</Text>
          </View>
          <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
        </Pressable>
        
        {/* Premium Feature: Journal */}
        {profile?.subscription_tier !== 'free' && (
          <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={() => setShowJournal(true)}>
            <Text style={styles.linkEmoji}>📔</Text>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Frequency Journal</Text>
              <Text style={[styles.linkSub, themedStyles.linkSub]}>Track your sessions and progress</Text>
            </View>
            <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
          </Pressable>
        )}
        
        {/* Premium Feature: Reminders */}
        {profile?.subscription_tier !== 'free' && (
          <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={() => setShowReminders(true)}>
            <Text style={styles.linkEmoji}>⏰</Text>
            <View style={styles.linkInfo}>
              <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Session Reminders</Text>
              <Text style={[styles.linkSub, themedStyles.linkSub]}>Set daily practice notifications</Text>
            </View>
            <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
          </Pressable>
        )}
        
        {/* Manage Subscription */}
        <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={handlePricingOpen}>
          <Text style={styles.linkEmoji}>💳</Text>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkTitle, themedStyles.linkTitle]}>
              {profile?.subscription_tier === 'free' ? 'Get Premium' : 'Manage Subscription'}
            </Text>
            <Text style={[styles.linkSub, themedStyles.linkSub]}>
              {profile?.subscription_tier === 'free' 
                ? 'Upgrade to weekly or lifetime access'
                : profile?.subscription_tier === 'weekly'
                  ? 'Upgrade to lifetime, renew, or cancel'
                  : 'View your lifetime access details'}
            </Text>
          </View>
          <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
        </Pressable>
        
        <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={() => setShowOffline(true)}>
          <Text style={styles.linkEmoji}>📲</Text>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Offline Mode</Text>
            <Text style={[styles.linkSub, themedStyles.linkSub]}>Cache frequencies for offline use</Text>
          </View>
          <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
        </Pressable>
        
        <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={() => setShowDisclaimer(true)}>
          <Text style={styles.linkEmoji}>⚖️</Text>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Disclaimer & Legal</Text>
            <Text style={[styles.linkSub, themedStyles.linkSub]}>Wellness disclaimer and terms</Text>
          </View>
          <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
        </Pressable>
        
        <Pressable style={[styles.linkCard, themedStyles.linkCard]} onPress={() => {
          Alert.alert(
            'Privacy Policy',
            'View our complete Privacy Policy at:\n\nhttps://tones-by-aysa.netlify.app/privacy-policy.html\n\nThis covers all data collection, usage, and your rights regarding personal information in Tones by Aysa.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }}>
          <Text style={styles.linkEmoji}>🔒</Text>
          <View style={styles.linkInfo}>
            <Text style={[styles.linkTitle, themedStyles.linkTitle]}>Privacy Policy</Text>
            <Text style={[styles.linkSub, themedStyles.linkSub]}>Data usage and privacy information</Text>
          </View>
          <Text style={[styles.linkArrow, themedStyles.linkArrow]}>→</Text>
        </Pressable>
      </View>

      <View style={styles.signOutContainer}>
        <Pressable style={[styles.signOutButton, { borderColor: colors.error }]} onPress={handleSignOut}>
          <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
        </Pressable>
      </View>

      {/* Reminders Modal */}
      <Modal visible={showReminders} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, themedStyles.modalContainer]}>
          <View style={[styles.modalHeader, themedStyles.modalHeader]}>
            <Pressable style={styles.backButton} onPress={() => setShowReminders(false)}>
              <Text style={[styles.backArrow, themedStyles.backArrow]}>←</Text>
              <Text style={[styles.backText, themedStyles.backText]}>Back to Profile</Text>
            </Pressable>
          </View>
          <RemindersScreen />
        </SafeAreaView>
      </Modal>

      {/* Journal Modal */}
      <Modal visible={showJournal} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, themedStyles.modalContainer]}>
          <View style={[styles.modalHeader, themedStyles.modalHeader]}>
            <Pressable style={styles.backButton} onPress={() => setShowJournal(false)}>
              <Text style={[styles.backArrow, themedStyles.backArrow]}>←</Text>
              <Text style={[styles.backText, themedStyles.backText]}>Back to Profile</Text>
            </Pressable>
          </View>
          <JournalScreen />
        </SafeAreaView>
      </Modal>

      {/* Offline Modal */}
      <Modal visible={showOffline} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, themedStyles.modalContainer]}>
          <View style={[styles.modalHeader, themedStyles.modalHeader]}>
            <Pressable style={styles.backButton} onPress={() => setShowOffline(false)}>
              <Text style={[styles.backArrow, themedStyles.backArrow]}>←</Text>
              <Text style={[styles.backText, themedStyles.backText]}>Back to Profile</Text>
            </Pressable>
          </View>
          <OfflineScreen />
        </SafeAreaView>
      </Modal>

      {/* Disclaimer Modal */}
      <Modal visible={showDisclaimer} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, themedStyles.modalContainer]}>
          <View style={[styles.modalHeader, themedStyles.modalHeader]}>
            <Pressable style={styles.backButton} onPress={() => setShowDisclaimer(false)}>
              <Text style={[styles.backArrow, themedStyles.backArrow]}>←</Text>
              <Text style={[styles.backText, themedStyles.backText]}>Back to Profile</Text>
            </Pressable>
          </View>
          <DisclaimerScreen />
        </SafeAreaView>
      </Modal>

      {/* Community Presets Modal */}
      <Modal visible={showCommunity} animationType="slide">
        <SafeAreaView style={[styles.modalContainer, themedStyles.modalContainer]}>
          <View style={[styles.modalHeader, themedStyles.modalHeader]}>
            <Pressable style={styles.backButton} onPress={() => setShowCommunity(false)}>
              <Text style={[styles.backArrow, themedStyles.backArrow]}>←</Text>
              <Text style={[styles.backText, themedStyles.backText]}>Back to Profile</Text>
            </Pressable>
          </View>
          <CommunityScreen />
        </SafeAreaView>
      </Modal>

      {/* Pricing Modal */}
      <Modal visible={showPricing} animationType="slide" transparent={false}>
        <PricingScreen onDismiss={() => setShowPricing(false)} />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40
  },
  card: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24
  },
  themeToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0f172a'
  },
  editBadgeText: {
    fontSize: 16
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
  },
  // Upgrade Banner
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    justifyContent: 'space-between',
  },
  upgradeBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upgradeBannerEmoji: {
    fontSize: 28,
  },
  upgradeBannerText: {
    flex: 1,
  },
  upgradeBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  upgradeBannerSub: {
    fontSize: 12,
    lineHeight: 16,
  },
});
