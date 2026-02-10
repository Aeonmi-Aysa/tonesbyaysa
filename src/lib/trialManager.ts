/**
 * Trial Management System
 * Handles free trial activation, tracking, and expiration
 */

import { supabase } from './supabaseClient';
import type { SubscriptionTier } from '@/store/useSessionStore';

export interface TrialStatus {
  hasActiveTrialUnitInDb: boolean;
  daysRemaining: number;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  isExpired: boolean;
}

/**
 * Check if user has an active trial
 */
export async function checkTrialStatus(userId: string): Promise<TrialStatus> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('trial_started_at, trial_ends_at, subscription_tier')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Trial] Error checking status:', error);
      return {
        hasActiveTrialUnitInDb: false,
        daysRemaining: 0,
        trialStartedAt: null,
        trialEndsAt: null,
        isExpired: false,
      };
    }

    if (!data?.trial_started_at) {
      return {
        hasActiveTrialUnitInDb: false,
        daysRemaining: 0,
        trialStartedAt: null,
        trialEndsAt: null,
        isExpired: false,
      };
    }

    const now = new Date();
    const trialEndsAt = new Date(data.trial_ends_at);
    const isExpired = now > trialEndsAt;
    
    const timeRemaining = trialEndsAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    console.log('[Trial] Status:', {
      hasActiveTrialUnitInDb: !isExpired,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired,
      trialEndsAt: data.trial_ends_at
    });

    return {
      hasActiveTrialUnitInDb: !isExpired,
      daysRemaining: Math.max(0, daysRemaining),
      trialStartedAt: data.trial_started_at,
      trialEndsAt: data.trial_ends_at,
      isExpired,
    };
  } catch (error) {
    console.error('[Trial] Unexpected error:', error);
    return {
      hasActiveTrialUnitInDb: false,
      daysRemaining: 0,
      trialStartedAt: null,
      trialEndsAt: null,
      isExpired: false,
    };
  }
}

/**
 * Handle trial expiration - downgrade to free
 */
export async function handleExpiredTrial(userId: string): Promise<boolean> {
  try {
    console.log('[Trial] Handling expired trial for user:', userId);

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'free',
        subscription_status: 'inactive'
      })
      .eq('id', userId);

    if (error) {
      console.error('[Trial] Failed to downgrade:', error);
      return false;
    }

    console.log('[Trial] ✅ Trial expired - downgraded to free');
    return true;
  } catch (error) {
    console.error('[Trial] Error handling expiration:', error);
    return false;
  }
}

/**
 * Get subscription tier, considering trial status
 */
export async function getTierWithTrialCheck(userId: string): Promise<SubscriptionTier> {
  try {
    const trial = await checkTrialStatus(userId);

    if (trial.isExpired && trial.trialStartedAt) {
      // Trial has expired - downgrade
      console.log('[Trial] Trial expired, downgrading user');
      await handleExpiredTrial(userId);
      return 'free';
    }

    if (trial.hasActiveTrialUnitInDb) {
      console.log('[Trial] User has active trial, access as weekly tier');
      return 'weekly'; // Trial users get weekly access
    }

    // Get actual subscription tier
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    return (data?.subscription_tier || 'free') as SubscriptionTier;
  } catch (error) {
    console.error('[Trial] Error getting tier:', error);
    return 'free';
  }
}

/**
 * Format trial time remaining for display
 */
export function formatTrialTimeRemaining(daysRemaining: number): string {
  if (daysRemaining <= 0) {
    return 'Expired';
  }

  if (daysRemaining === 1) {
    return '1 day remaining';
  }

  return `${daysRemaining} days remaining`;
}

/**
 * Get trial status message for display
 */
export function getTrialMessage(trial: TrialStatus): string {
  if (trial.isExpired) {
    return '⏰ Trial expired - subscribe now to continue';
  }

  if (!trial.hasActiveTrialUnitInDb) {
    return '🎁 Start your 7-day free trial';
  }

  return `🎉 Trial active - ${formatTrialTimeRemaining(trial.daysRemaining)}`;
}
