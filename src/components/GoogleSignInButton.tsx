/**
 * Google Sign-In Component
 * Handles Google OAuth using Expo
 */

import React, { useEffect, useState } from 'react';
import { Pressable, Text, Alert, ActivityIndicator, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithGoogle } from '@/lib/socialAuthManager';

WebBrowser.maybeCompleteAuthSession();

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
  textColor?: string;
  backgroundColor?: string;
}

/**
 * SETUP REQUIRED:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com
 * 2. Create a new project or select existing
 * 3. Enable Google Sign-In API
 * 4. Create OAuth 2.0 Web Application credentials
 * 5. Add these URIs in "Authorized redirect URIs":
 *    - http://localhost:19000
 *    - http://localhost:19001
 *    - exp://localhost:19000
 *    - Your production Expo project URI (e.g., exp://abc123.exp.direct)
 * 6. Get your GOOGLE_CLIENT_ID (Web) from credentials
 * 7. Add to .env.local:
 *    EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
 */

export function GoogleSignInButton({
  onSuccess,
  onError,
  style,
  textColor = '#fff',
  backgroundColor = '#ffffff',
}: GoogleSignInButtonProps) {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: clientId,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleGoogleSignIn(access_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken: string) => {
    setLoading(true);
    try {
      const result = await signInWithGoogle(accessToken);
      if (result.success) {
        onSuccess?.();
      } else {
        Alert.alert('Error', result.error || 'Google sign-in failed');
        onError?.(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', message);
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      disabled={loading || !request}
      onPress={() => promptAsync()}
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: '#e5e7eb',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: loading || !request ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          <Text style={{ fontSize: 20, marginRight: 8 }}>🔍</Text>
          <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>
            Sign in with Google
          </Text>
        </>
      )}
    </Pressable>
  );
}
