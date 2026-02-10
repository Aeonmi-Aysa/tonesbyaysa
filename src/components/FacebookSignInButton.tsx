/**
 * Facebook Sign-In Component
 * Handles Facebook OAuth using Expo
 */

import React, { useState } from 'react';
import { Pressable, Text, Alert, ActivityIndicator } from 'react-native';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { signInWithFacebook } from '@/lib/socialAuthManager';

WebBrowser.maybeCompleteAuthSession();

interface FacebookSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
  textColor?: string;
  backgroundColor?: string;
}

/**
 * SETUP REQUIRED:
 * 1. Go to Facebook Developers: https://developers.facebook.com/
 * 2. Create an app or select existing
 * 3. Go to Settings → Basic and copy App ID
 * 4. Add "Facebook Login" product to your app
 * 5. In Facebook Login Settings, add these OAuth URIs:
 *    - https://auth.expo.io/@yourexpouser/yourappname
 *    - http://localhost:19000
 *    - http://localhost:19001
 * 6. Add to .env.local:
 *    EXPO_PUBLIC_FACEBOOK_APP_ID=your_app_id
 */

export function FacebookSignInButton({
  onSuccess,
  onError,
  style,
  textColor = '#fff',
  backgroundColor = '#1877F2',
}: FacebookSignInButtonProps) {
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: appId,
  });

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const accessToken = result.params.access_token;
        const signInResult = await signInWithFacebook(accessToken);
        
        if (signInResult.success) {
          onSuccess?.();
        } else {
          Alert.alert('Error', signInResult.error || 'Facebook sign-in failed');
          onError?.(signInResult.error || 'Facebook sign-in failed');
        }
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
      onPress={handleFacebookSignIn}
      style={[
        {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: backgroundColor,
          borderWidth: 1,
          borderColor: '#1877F2',
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
          <Text style={{ fontSize: 20, marginRight: 8 }}>f</Text>
          <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>
            Sign in with Facebook
          </Text>
        </>
      )}
    </Pressable>
  );
}
