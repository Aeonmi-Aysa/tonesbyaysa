/**
 * Social Authentication Manager
 * Handles Google, Facebook, and email/password authentication
 * All methods create/update user profile in Supabase
 */

import { supabase } from './supabaseClient';
import { useSessionStore } from '@/store/useSessionStore';
import type { Session } from '@supabase/supabase-js';

/**
 * Google Sign-In Handler
 * Requires: expo-auth-session, @react-native-google-signin/google-signin
 */
export async function signInWithGoogle(accessToken: string): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    // Exchange Google token for Supabase session
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: accessToken,
    });

    if (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }

    if (data.session?.user) {
      // Create/update profile with Google info
      await upsertSocialProfile(data.session.user.id, {
        email: data.session.user.email || '',
        full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'User',
        avatar_url: data.session.user.user_metadata?.picture,
        auth_provider: 'google',
        google_id: data.session.user.user_metadata?.sub, // Google's user ID
      });

      useSessionStore.getState().setSession(data.session);
      return { success: true, session: data.session };
    }

    return { success: false, error: 'No session created' };
  } catch (error) {
    console.error('Google auth error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Facebook Sign-In Handler
 * Requires: expo-auth-session, expo-facebook
 */
export async function signInWithFacebook(accessToken: string): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    // Exchange Facebook token for Supabase session
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'facebook',
      token: accessToken,
    });

    if (error) {
      console.error('Facebook sign-in error:', error);
      return { success: false, error: error.message };
    }

    if (data.session?.user) {
      // Create/update profile with Facebook info
      await upsertSocialProfile(data.session.user.id, {
        email: data.session.user.email || '',
        full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || 'User',
        avatar_url: data.session.user.user_metadata?.picture_url,
        auth_provider: 'facebook',
        facebook_id: data.session.user.user_metadata?.sub, // Facebook's user ID
      });

      useSessionStore.getState().setSession(data.session);
      return { success: true, session: data.session };
    }

    return { success: false, error: 'No session created' };
  } catch (error) {
    console.error('Facebook auth error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Email/Password Sign-Up
 * Standard authentication with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Email sign-up error:', error);
      return { success: false, error: error.message };
    }

    if (data.session?.user) {
      // Create profile
      await upsertEmailProfile(data.session.user.id, {
        email,
        full_name: fullName,
        auth_provider: 'email',
      });

      useSessionStore.getState().setSession(data.session);
      return { success: true, session: data.session };
    }

    // If no session, email confirmation may be required
    return { success: true, error: 'Please check your email to confirm your account' };
  } catch (error) {
    console.error('Email sign-up error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Email/Password Sign-In
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Email sign-in error:', error);
      return { success: false, error: error.message };
    }

    if (data.session?.user) {
      useSessionStore.getState().setSession(data.session);
      return { success: true, session: data.session };
    }

    return { success: false, error: 'No session created' };
  } catch (error) {
    console.error('Email sign-in error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Upsert (create or update) social profile
 * Automatically initializes free tier + trial
 */
async function upsertSocialProfile(
  userId: string,
  data: {
    email: string;
    full_name: string;
    avatar_url?: string;
    auth_provider: 'google' | 'facebook';
    google_id?: string;
    facebook_id?: string;
  }
) {
  try {
    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        auth_provider: data.auth_provider,
        google_id: data.google_id,
        facebook_id: data.facebook_id,
        subscription_tier: 'free', // Start with free tier (user can start trial)
        subscription_status: 'inactive',
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Profile upsert error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to create/update profile:', error);
    throw error;
  }
}

/**
 * Upsert email-based profile
 */
async function upsertEmailProfile(
  userId: string,
  data: {
    email: string;
    full_name: string;
    auth_provider: 'email';
  }
) {
  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: userId,
        email: data.email,
        full_name: data.full_name,
        auth_provider: data.auth_provider,
        subscription_tier: 'free',
        subscription_status: 'inactive',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Email profile upsert error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to create/update email profile:', error);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
    useSessionStore.getState().reset();
  } catch (error) {
    console.error('Sign-out error:', error);
  }
}
