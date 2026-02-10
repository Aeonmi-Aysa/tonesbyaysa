import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabaseClient';

interface GoogleAuthConfig {
  iosClientId?: string;
  androidClientId?: string;
  webClientId?: string;
}

/**
 * Initialize Google Sign-In
 */
export async function initializeGoogleSignIn(config: Partial<GoogleAuthConfig> = {}) {
  try {
    const extra = Constants?.expoConfig?.extra ?? {};

    const finalConfig: GoogleAuthConfig = {
      webClientId: config.webClientId || extra.googleOAuthClientId,
      iosClientId: config.iosClientId || extra.GOOGLE_OAUTH_IOS_CLIENT_ID,
      androidClientId: config.androidClientId || extra.GOOGLE_OAUTH_ANDROID_CLIENT_ID,
    };

    if (!finalConfig.webClientId) {
      console.warn('[GoogleAuth] ⚠️ Web client ID not configured');
      return false;
    }

    GoogleSignin.configure({
      webClientId: finalConfig.webClientId,
      iosClientId: finalConfig.iosClientId,
      androidClientId: finalConfig.androidClientId,
      offlineAccess: true,
      hostedDomain: undefined,
      forceCodeForRefreshToken: true,
      accountName: '',
      profileImageSize: 120,
    });

    console.log('[GoogleAuth] ✅ Google Sign-In initialized');
    return true;
  } catch (error) {
    console.error('[GoogleAuth] ❌ Initialization failed:', error);
    return false;
  }
}

/**
 * Check if user is currently signed in with Google
 */
export async function isGoogleSignedIn(): Promise<boolean> {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    return isSignedIn;
  } catch (error) {
    console.error('[GoogleAuth] Error checking sign-in status:', error);
    return false;
  }
}

/**
 * Get current Google user info
 */
export async function getCurrentGoogleUser() {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    console.error('[GoogleAuth] Error getting user info:', error);
    return null;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    console.log('[GoogleAuth] Starting Google sign-in...');
    
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    console.log('[GoogleAuth] ✅ Google sign-in successful');
    console.log('[GoogleAuth] User:', {
      id: userInfo.user.id,
      email: userInfo.user.email,
      name: userInfo.user.name,
    });

    // Sign in to Supabase with Google token
    const response = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken!,
    });

    if (response.error) {
      throw response.error;
    }

    console.log('[GoogleAuth] ✅ Supabase authentication successful');

    return {
      success: true,
      user: response.data.user,
      session: response.data.session,
      googleUser: userInfo.user,
    };
  } catch (error: any) {
    console.error('[GoogleAuth] ❌ Sign-in failed:', error);

    // Map error codes to user-friendly messages
    let userMessage = 'Google sign-in failed. Please try again.';

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      userMessage = 'Sign-in cancelled';
    } else if (error.code === statusCodes.IN_PROGRESS) {
      userMessage = 'Sign-in already in progress';
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      userMessage = 'Google Play Services not available';
    }

    return {
      success: false,
      error: error.message || userMessage,
      code: error.code,
    };
  }
}

/**
 * Sign up with Google (new user)
 */
export async function signUpWithGoogle() {
  try {
    const signInResult = await signInWithGoogle();

    if (!signInResult.success) {
      return signInResult;
    }

    const user = signInResult.user;
    const googleUser = signInResult.googleUser;

    // Create profile for new user
    const { data, error } = await supabase.from('profiles').insert([
      {
        id: user?.id,
        email: user?.email || googleUser?.email,
        full_name: googleUser?.name || null,
        avatar_url: googleUser?.photo || null,
        subscription_tier: 'free',
        subscription_status: 'inactive',
      },
    ]).select();

    if (error) {
      console.error('[GoogleAuth] ❌ Profile creation failed:', error);
      // Note: User is authenticated but profile creation failed
      return {
        success: true,
        user,
        session: signInResult.session,
        profileError: error.message,
      };
    }

    console.log('[GoogleAuth] ✅ Profile created');

    return {
      success: true,
      user,
      session: signInResult.session,
      profile: data?.[0],
    };
  } catch (error: any) {
    console.error('[GoogleAuth] ❌ Sign-up failed:', error);
    return {
      success: false,
      error: error.message || 'Sign-up failed',
    };
  }
}

/**
 * Sign out from Google and Supabase
 */
export async function signOutGoogle() {
  try {
    console.log('[GoogleAuth] Signing out...');

    // Sign out from Supabase
    const { error: supabaseError } = await supabase.auth.signOut();
    if (supabaseError) {
      console.error('[GoogleAuth] Supabase sign-out error:', supabaseError);
    }

    // Sign out from Google
    await GoogleSignin.signOut();

    console.log('[GoogleAuth] ✅ Sign-out successful');
    return { success: true };
  } catch (error: any) {
    console.error('[GoogleAuth] ❌ Sign-out failed:', error);
    return {
      success: false,
      error: error.message || 'Sign-out failed',
    };
  }
}

/**
 * Revoke Google access
 */
export async function revokeGoogleAccess() {
  try {
    console.log('[GoogleAuth] Revoking access...');

    await GoogleSignin.revokeAccess();

    console.log('[GoogleAuth] ✅ Access revoked');
    return { success: true };
  } catch (error: any) {
    console.error('[GoogleAuth] ❌ Revoke failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to revoke access',
    };
  }
}

/**
 * Get Google user tokens
 */
export async function getGoogleTokens() {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens;
  } catch (error) {
    console.error('[GoogleAuth] Error getting tokens:', error);
    return null;
  }
}

/**
 * Refresh Google ID token
 */
export async function refreshGoogleToken() {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo.idToken;
  } catch (error) {
    console.error('[GoogleAuth] Error refreshing token:', error);
    return null;
  }
}
