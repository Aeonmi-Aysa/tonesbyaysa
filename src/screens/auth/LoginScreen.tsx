import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect } from 'react';

type AuthTab = 'signin' | 'signup';

export function LoginScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Google Sign-In
  useEffect(() => {
    const webClientId = process.env.GOOGLE_OAUTH_WEB_CLIENT_ID || '283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei.apps.googleusercontent.com';
    const iosClientId = process.env.GOOGLE_OAUTH_IOS_CLIENT_ID || '283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei.apps.googleusercontent.com';
    
    console.log('🔐 Configuring Google Sign-In with:');
    console.log('  webClientId:', webClientId);
    console.log('  iosClientId:', iosClientId);
    
    GoogleSignin.configure({
      webClientId,
      iosClientId,
      scopes: ['profile', 'email'],
      offlineAccess: false,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter your email and password.');
      return;
    }

    console.log('Signing in with:', email);
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        console.error('Sign-in error:', error);
        Alert.alert('Sign In Failed', error.message);
      } else {
        console.log('✓ Signed in:', data.user?.email);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      console.log('🚀 Starting Google Sign-In...');
      
      // Check if Play Services are available (Android only)
      await GoogleSignin.hasPlayServices();
      console.log('✓ Play Services available');
      
      const userInfo = await GoogleSignin.signIn();
      console.log('✓ Got user info from Google:', (userInfo as any)?.user?.email);
      console.log('📦 Full response:', userInfo);
      
      // Get the ID token from the userInfo response
      // userInfo structure: { user: {...}, data: { idToken, ... } }
      let idToken = userInfo?.data?.idToken;
      
      // Fallback for different response structures
      if (!idToken && (userInfo as any).idToken) {
        idToken = (userInfo as any).idToken;
      }
      
      // Additional fallback for different SDK versions
      if (!idToken && (userInfo as any).user?.data?.idToken) {
        idToken = (userInfo as any).user?.data?.idToken;
      }

      if (!idToken) {
        console.error('❌ No ID token found in response:', userInfo);
        Alert.alert('Error', 'Failed to get ID token from Google. Please try again.');
        setIsSubmitting(false);
        return;
      }

      console.log('🔑 Got ID token, signing in with Supabase...');
      
      // Sign in with Supabase using the Google ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error('❌ Google sign-in error with Supabase:', error);
        Alert.alert('Sign In Failed', error.message);
      } else {
        console.log('✅ Google sign-in successful:', data.user?.email);
      }
    } catch (error: any) {
      console.error('❌ Google sign-in exception:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available on this device');
      } else {
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        Alert.alert('Sign In Failed', error.message || 'An error occurred during Google sign-in');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }

    console.log('Signing up with:', email);
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Sign-up error:', error);
        Alert.alert('Sign Up Failed', error.message);
      } else {
        console.log('✓ Account created:', data.user?.email);
        Alert.alert('Almost there!', 'Check your email to verify your account.');
        // Reset form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setActiveTab('signin');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo & Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>💜</Text>
          <Text style={styles.appName}>Tones by Aysa</Text>
          <Text style={styles.tagline}>
            {activeTab === 'signin' ? 'Welcome Back' : 'Join Us'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable 
            style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
            onPress={() => {
              setActiveTab('signin');
              setConfirmPassword('');
              setFullName('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>
              Sign In
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
            onPress={() => {
              setActiveTab('signup');
              setConfirmPassword('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>
              Sign Up
            </Text>
          </Pressable>
        </View>

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <View style={styles.form}>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              editable={!isSubmitting}
            />
            <Pressable 
              style={styles.forgotLink}
              onPress={() => Alert.alert('Password Reset', 'Password reset not yet implemented for mobile.')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
            <Pressable 
              style={[styles.button, styles.primaryButton, isSubmitting && styles.buttonDisabled]} 
              onPress={handleSignIn}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </Text>
            </Pressable>

            {/* Google Sign-In Button */}
            <Pressable 
              style={[styles.button, styles.googleButton, isSubmitting && styles.buttonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#1f2937" size="small" />
              ) : (
                <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Sign Up Form */}
        {activeTab === 'signup' && activeTab === 'signup' && (
          <View style={styles.form}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Password (8+ characters)"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              editable={!isSubmitting}
            />
            <Pressable 
              style={[styles.button, styles.primaryButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </Text>
            </Pressable>

            {/* Google Sign-Up Button */}
            <Pressable 
              style={[styles.button, styles.googleButton, isSubmitting && styles.buttonDisabled]} 
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#1f2937" size="small" />
              ) : (
                <Text style={styles.googleButtonText}>🔵 Continue with Google</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tabs: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#daa520',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ccc',
  },
  activeTabText: {
    color: '#daa520',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    color: '#333',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotText: {
    color: '#daa520',
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#daa520',
  },
  googleButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 12,
  },
  googleButtonText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 15,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
    borderWidth: 1,
    borderColor: '#1877F2',
    marginTop: 8,
  },
  facebookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f1f5f9'
  },
  subtitle: {
    color: '#94a3b8'
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#475569'
  },
  secondaryText: {
    color: '#cbd5f5',
    fontWeight: '600'
  }
});