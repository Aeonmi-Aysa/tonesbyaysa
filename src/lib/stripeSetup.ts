// Real Stripe SDK - updated to use actual package
import { initStripe } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Backend URL - Netlify Functions
const BACKEND_URL = 'https://tonesbyaysa.netlify.app/.netlify/functions';

interface StripeConfig {
  publishableKey: string;
  merchantIdentifier?: string;
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  subscriptionId?: string;
  customerId: string;
}

interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'weekly' | 'lifetime';
  hasWeekly: boolean;
  hasLifetime: boolean;
  expiresAt?: string;
}

/**
 * Initialize Stripe SDK
 */
export async function initializeStripe(config: Partial<StripeConfig> = {}) {
  try {
    const finalConfig: StripeConfig = {
      publishableKey: config.publishableKey || STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: config.merchantIdentifier || 'com.aysa.tones',
    };

    console.log('[Stripe] Initializing with publishable key:', finalConfig.publishableKey.substring(0, 15) + '...');

    // Initialize Stripe SDK
    await initStripe({
      publishableKey: finalConfig.publishableKey,
      merchantIdentifier: finalConfig.merchantIdentifier,
    });

    console.log('[Stripe] ✅ Initialized successfully');
    return true;
  } catch (error) {
    console.error('[Stripe] ❌ Initialization failed:', error);
    return false;
  }
}

/**
 * Create a PaymentIntent via Netlify backend
 * This tells Stripe to prepare for a payment
 */
export async function createPaymentIntent(
  tierId: string,
  userId: string,
  email: string,
  priceId?: string,
  isTrialStart: boolean = false
): Promise<PaymentIntentResponse> {
  try {
    console.log('[Stripe] Creating PaymentIntent for tier:', tierId, 'isTrialStart:', isTrialStart);

    const response = await fetch(`${BACKEND_URL}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tierId,
        userId,
        email,
        priceId,
        isTrialStart,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend error: ${response.status}`);
    }

    const data = await response.json();

    console.log('[Stripe] ✅ PaymentIntent created:', data.paymentIntentId);

    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
      subscriptionId: data.subscriptionId,
      customerId: data.customerId,
    };
  } catch (error) {
    console.error('[Stripe] ❌ Failed to create PaymentIntent:', error);
    throw error;
  }
}

/**
 * Confirm payment intent (called after Payment Sheet succeeds)
 * This tells your backend the payment is complete
 */
export async function confirmPayment(
  paymentIntentId: string,
  tierId: string,
  userId: string
): Promise<{ success: boolean; tier: 'weekly' | 'lifetime' }> {
  try {
    console.log('[Stripe] Confirming payment for intent:', paymentIntentId);

    const response = await fetch(`${BACKEND_URL}/confirm-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
        tierId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Confirmation failed: ${response.status}`);
    }

    const data = await response.json();

    console.log('[Stripe] ✅ Payment confirmed');

    return {
      success: true,
      tier: data.tier as 'weekly' | 'lifetime',
    };
  } catch (error) {
    console.error('[Stripe] ❌ Payment confirmation failed:', error);
    throw error;
  }
}

/**
 * Check user's subscription status from Supabase
 * This is now server-side instead of SDK entitlements
 */
export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    console.log('[Stripe] Checking subscription status for user:', userId);

    // Query Supabase for subscription info
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, subscription_expires_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('[Stripe] Unable to load subscription status:', error.message);
      return {
        isActive: false,
        tier: 'free',
        hasWeekly: false,
        hasLifetime: false,
      };
    }

    const hasWeekly = data.subscription_tier === 'weekly' && data.subscription_status === 'active';
    const hasLifetime = data.subscription_tier === 'lifetime' && data.subscription_status === 'active';

    console.log('[Stripe] Subscription status:', {
      tier: data.subscription_tier,
      status: data.subscription_status,
      hasWeekly,
      hasLifetime,
    });

    let tier: 'free' | 'weekly' | 'lifetime' = 'free';
    if (hasLifetime) {
      tier = 'lifetime';
    } else if (hasWeekly) {
      tier = 'weekly';
    }

    return {
      isActive: hasWeekly || hasLifetime,
      tier,
      hasWeekly,
      hasLifetime,
      expiresAt: data.subscription_expires_at,
    };
  } catch (error) {
    console.error('[Stripe] Error checking subscription:', error);
    return {
      isActive: false,
      tier: 'free',
      hasWeekly: false,
      hasLifetime: false,
    };
  }
}

/**
 * Restore subscription (when user logs in on new device)
 * Queries Supabase for their subscription
 */
export async function restoreSubscription(userId: string): Promise<SubscriptionStatus> {
  try {
    console.log('[Stripe] Restoring subscription for user:', userId);

    // Simply check current status - subscription is server-side
    const status = await checkSubscriptionStatus(userId);

    console.log('[Stripe] ✅ Subscription restored:', status.tier);

    return status;
  } catch (error) {
    console.error('[Stripe] ❌ Restore failed:', error);
    throw error;
  }
}

/**
 * Cancel subscription (user wants to stop recurring)
 */
export async function cancelSubscription(userId: string): Promise<{ success: boolean }> {
  try {
    console.log('[Stripe] Cancelling subscription for user:', userId);

    // TODO: Add cancel endpoint to backend
    // For now, user can cancel via Stripe customer portal
    console.warn('[Stripe] Cancel endpoint not implemented yet');

    return { success: false };
  } catch (error) {
    console.error('[Stripe] ❌ Cancellation failed:', error);
    throw error;
  }
}
