import { useState, useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { supabase } from '@/lib/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  is_admin: boolean | null;
}

export function AdminScreen() {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState<'free' | 'weekly' | 'lifetime'>('lifetime');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);

  const searchUser = useCallback(async () => {
    if (!searchEmail.trim()) {
      Alert.alert('Error', 'Enter an email address to search.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', searchEmail.trim())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          Alert.alert('User not found', 'No user exists with that email address.');
        } else {
          Alert.alert('Search failed', error.message);
        }
        setSearchResult(null);
      } else {
        setSearchResult(data as UserProfile);
      }
    } catch (err) {
      Alert.alert('Search failed', 'An unexpected error occurred.');
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchEmail]);

  const grantTier = useCallback(async () => {
    if (!searchResult) {
      Alert.alert('Error', 'Search for a user first.');
      return;
    }

    setIsLoading(true);
    try {
      const status = selectedTier === 'free' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: selectedTier,
          subscription_status: status
        })
        .eq('id', searchResult.id);

      if (error) {
        Alert.alert('Update failed', error.message);
      } else {
        Alert.alert('Success', `${searchResult.email} now has ${selectedTier.toUpperCase()} access.`);
        // Refresh the search result
        setSearchResult({
          ...searchResult,
          subscription_tier: selectedTier,
          subscription_status: status
        });
      }
    } catch (err) {
      Alert.alert('Update failed', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [searchResult, selectedTier]);

  const toggleAdminStatus = useCallback(async () => {
    if (!searchResult) {
      Alert.alert('Error', 'Search for a user first.');
      return;
    }

    const newAdminStatus = !searchResult.is_admin;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: newAdminStatus })
        .eq('id', searchResult.id);

      if (error) {
        Alert.alert('Update failed', error.message);
      } else {
        Alert.alert('Success', `${searchResult.email} is ${newAdminStatus ? 'now' : 'no longer'} an admin.`);
        setSearchResult({
          ...searchResult,
          is_admin: newAdminStatus
        });
      }
    } catch (err) {
      Alert.alert('Update failed', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [searchResult]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Admin Console</Text>
        <Text style={styles.subheading}>Signed in as {profile?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Management</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter user email..."
            placeholderTextColor="#64748b"
            value={searchEmail}
            onChangeText={setSearchEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Pressable 
            style={[styles.button, styles.searchButton]} 
            onPress={searchUser}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Searching...' : 'Search'}</Text>
          </Pressable>
        </View>

        {searchResult && (
          <View style={styles.userResult}>
            <Text style={styles.userEmail}>{searchResult.email}</Text>
            <Text style={styles.userName}>{searchResult.full_name || 'No name set'}</Text>
            <View style={styles.userStatus}>
              <Text style={styles.statusLabel}>
                Tier: <Text style={styles.statusValue}>{searchResult.subscription_tier || 'free'}</Text>
              </Text>
              <Text style={styles.statusLabel}>
                Admin: <Text style={styles.statusValue}>{searchResult.is_admin ? 'Yes' : 'No'}</Text>
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tier Management</Text>
        
        <View style={styles.tierContainer}>
          {(['free', 'weekly', 'lifetime'] as const).map((tier) => (
            <Pressable
              key={tier}
              style={[styles.tierButton, selectedTier === tier && styles.tierButtonActive]}
              onPress={() => setSelectedTier(tier)}
            >
              <Text style={[styles.tierText, selectedTier === tier && styles.tierTextActive]}>
                {tier.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable 
          style={[styles.button, styles.grantButton, !searchResult && styles.buttonDisabled]} 
          onPress={grantTier}
          disabled={!searchResult || isLoading}
        >
          <Text style={[styles.buttonText, !searchResult && styles.buttonTextDisabled]}>
            Grant {selectedTier.toUpperCase()} Access
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Admin Controls</Text>
        
        <Pressable 
          style={[styles.button, styles.adminButton, !searchResult && styles.buttonDisabled]} 
          onPress={toggleAdminStatus}
          disabled={!searchResult || isLoading}
        >
          <Text style={[styles.buttonText, !searchResult && styles.buttonTextDisabled]}>
            {searchResult?.is_admin ? 'Revoke Admin' : 'Grant Admin'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Debug Information</Text>
        <Text style={styles.debugText}>Environment: {__DEV__ ? 'Development' : 'Production'}</Text>
        <Text style={styles.debugText}>Your Profile ID: {profile?.id?.slice(0, 8) || 'Unknown'}...</Text>
        <Text style={styles.debugText}>Your Admin Status: {profile?.is_admin ? 'Active' : 'None'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#030712',
    gap: 16
  },
  header: {
    marginBottom: 10,
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
    gap: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#bfdbfe',
    marginBottom: 8,
  },
  searchContainer: {
    gap: 12,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
  },
  grantButton: {
    backgroundColor: '#10b981',
  },
  adminButton: {
    backgroundColor: '#f59e0b',
  },
  buttonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#6b7280',
  },
  userResult: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  userEmail: {
    color: '#fde68a',
    fontSize: 18,
    fontWeight: '600',
  },
  userName: {
    color: '#cbd5f5',
    fontSize: 16,
  },
  userStatus: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 14,
  },
  statusValue: {
    color: '#bfdbfe',
    fontWeight: '600',
  },
  tierContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tierButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
  },
  tierButtonActive: {
    backgroundColor: '#4338ca',
    borderColor: '#6366f1',
  },
  tierText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  tierTextActive: {
    color: '#ffffff',
  },
  debugText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
});
