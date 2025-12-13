import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';

export function ProfileScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const email = profile?.email;
  const avatarUrl = profile?.avatar_url;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
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

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    padding: 24,
    justifyContent: 'center'
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 12
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
    fontWeight: '700'
  },
  signOutButton: {
    marginTop: 16,
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
  }
});
