import {
  checkSubscriptionStatus,
  confirmPayment,
  createPaymentIntent,
  cancelSubscription,
  restoreSubscription,
} from './stripeSetup';
import type { Profile, SubscriptionTier } from '@/store/useSessionStore';

export interface PurchaseResult {
  success: boolean;
  tier: SubscriptionTier;
  message: string;
  error?: string;
}

/**
 * Purchase a subscription tier using Stripe
 * This creates a PaymentIntent and handles the flow
 * 
 * @param tierId - 'trial', 'weekly', or 'lifetime'
 * @param userId - User ID
 * @param email - User email
 * @param priceId - Stripe Price ID (optional)
 * @param isTrialStart - Whether this is starting a trial (charges $0)
 */
export async function purchaseSubscription(
  tierId: string,
  userId: string,
  email: string,
  priceId?: string,
  isTrialStart: boolean = tierId === 'trial'
): Promise<PurchaseResult> {
  try {
    // Validate tier
    if (!['trial', 'weekly', 'lifetime'].includes(tierId)) {
      return {
        success: false,
        tier: 'free',
        message: `Invalid tier: ${tierId}`,
        error: 'INVALID_TIER',
      };
    }

    console.log('[StripePaymentManager] Purchasing tier:', tierId, { isTrialStart, priceId });

    // Step 1: Create PaymentIntent on backend
    const intentResult = await createPaymentIntent(tierId, userId, email, priceId, isTrialStart);

    // Step 2: Present Stripe Payment Sheet to user
    // NOTE: For trial, this might be just a confirmation
    // For paid, this presents the full Payment Sheet
    console.log('[StripePaymentManager] Present payment sheet with intent:', intentResult.paymentIntentId);

    return {
      success: true,
      tier: tierId as SubscriptionTier,
      message: `Ready to process ${isTrialStart ? 'FREE trial' : 'payment'} for ${tierId}`,
    };
  } catch (error: any) {
    console.error('[StripePaymentManager] ❌ Purchase failed:', error);

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Purchase failed',
      error: error.code || 'PURCHASE_ERROR',
    };
  }
}

/**
 * Confirm payment after user completes Stripe Payment Sheet
 */
export async function confirmPurchase(
  paymentIntentId: string,
  tierId: string,
  userId: string
): Promise<PurchaseResult> {
  try {
    console.log('[StripePaymentManager] Confirming payment:', paymentIntentId);

    // Confirm with backend (backend confirms with Stripe)
    const result = await confirmPayment(paymentIntentId, tierId, userId);

    console.log('[StripePaymentManager] ✅ Payment confirmed, tier:', result.tier);

    return {
      success: true,
      tier: result.tier,
      message: `Successfully subscribed to ${result.tier}`,
    };
  } catch (error: any) {
    console.error('[StripePaymentManager] ❌ Confirmation failed:', error);

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Payment confirmation failed',
      error: 'CONFIRMATION_ERROR',
    };
  }
}

/**
 * Restore subscription when user logs in
 */
export async function restoreUserSubscription(userId: string): Promise<PurchaseResult> {
  try {
    console.log('[StripePaymentManager] Restoring subscription');

    const result = await restoreSubscription(userId);

    console.log('[StripePaymentManager] ✅ Subscription restored:', result.tier);

    return {
      success: true,
      tier: result.tier,
      message: 'Subscription restored',
    };
  } catch (error: any) {
    console.error('[StripePaymentManager] ❌ Restore failed:', error);

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Failed to restore subscription',
      error: 'RESTORE_ERROR',
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelUserSubscription(userId: string): Promise<PurchaseResult> {
  try {
    console.log('[StripePaymentManager] Cancelling subscription');

    await cancelSubscription(userId);

    console.log('[StripePaymentManager] ✅ Subscription cancelled');

    return {
      success: true,
      tier: 'free',
      message: 'Subscription cancelled',
    };
  } catch (error: any) {
    console.error('[StripePaymentManager] ❌ Cancellation failed:', error);

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Failed to cancel subscription',
      error: 'CANCEL_ERROR',
    };
  }
}

/**
 * Check current subscription status
 */
export async function checkUserSubscription(userId: string): Promise<PurchaseResult> {
  try {
    console.log('[StripePaymentManager] Checking subscription status');

    const result = await checkSubscriptionStatus(userId);

    return {
      success: true,
      tier: result.tier,
      message: `Current tier: ${result.tier}`,
    };
  } catch (error: any) {
    console.error('[StripePaymentManager] ❌ Status check failed:', error);

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Failed to check subscription',
      error: 'STATUS_ERROR',
    };
  }
}
