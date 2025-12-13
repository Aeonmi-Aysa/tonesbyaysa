import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '@/lib/supabaseClient';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter both email and password.');
      return;
    }

    console.log('Attempting sign in with email:', email);
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log('Sign in response:', { data: !!data, error: error?.message });
      
      if (error) {
        console.error('Sign-in error details:', error);
        Alert.alert('Sign-in failed', error.message);
      } else {
        console.log('Sign-in successful for:', data.user?.email);
      }
    } catch (err) {
      console.error('Unexpected sign-in error:', err);
      Alert.alert('Sign-in failed', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.signUp({ email: email.trim(), password });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Sign-up failed', error.message);
      return;
    }

    Alert.alert('Almost there!', 'Check your inbox to confirm your account.');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to HealTone™</Text>
        <Text style={styles.subtitle}>Sign in to access your healing library.</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Pressable style={[styles.button, styles.primaryButton]} onPress={handleSignIn} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Signing in…' : 'Sign In'}</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleSignUp} disabled={isSubmitting}>
          <Text style={styles.secondaryText}>Create Account</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f1f5f9'
  },
  subtitle: {
    color: '#94a3b8'
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#334155'
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#a855f7'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#475569'
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: '700'
  },
  secondaryText: {
    color: '#cbd5f5',
    fontWeight: '600'
  }
});
