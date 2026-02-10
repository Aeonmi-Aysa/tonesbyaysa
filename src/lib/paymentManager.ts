import { checkSubscriptionStatus, performPurchase, restorePurchases } from './revenueCatSetup';
import type { Profile, SubscriptionTier } from '@/store/useSessionStore';

export interface PurchaseResult {
  success: boolean;
  tier: SubscriptionTier;
  message: string;
  error?: string;
}

/**
 * Purchase a subscription tier
 */
export async function purchaseSubscription(tierId: string): Promise<PurchaseResult> {
  try {
    // Map tier ID to product identifier
    const productMap: Record<string, string> = {
      weekly: 'aysa_weekly_subscription',
      lifetime: 'aysa_lifetime_access',
    };

    const productId = productMap[tierId];
    if (!productId) {
      return {
        success: false,
        tier: 'free',
        message: `Invalid tier: ${tierId}`,
        error: 'INVALID_TIER',
      };
    }

    console.log('[PaymentManager] Purchasing tier:', tierId);

    const result = await performPurchase(tierId, productId);

    // Determine tier from entitlements
    const tier = determineSubscriptionTier(result.entitlements);

    console.log('[PaymentManager] ✅ Purchase successful, tier:', tier);

    return {
      success: true,
      tier,
      message: `Successfully subscribed to ${tierId}`,
    };
  } catch (error: any) {
    console.error('[PaymentManager] ❌ Purchase failed:', error);

    if (error.cancelled) {
      return {
        success: false,
        tier: 'free',
        message: 'Purchase cancelled',
      };
    }

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Purchase failed',
      error: error.code || 'PURCHASE_FAILED',
    };
  }
}

/**
 * Get current subscription status and update profile
 */
export async function syncSubscriptionStatus(
  profile: Profile | null,
  updateProfile: (profile: Profile) => void
): Promise<SubscriptionTier> {
  try {
    console.log('[PaymentManager] Syncing subscription status...');

    const status = await checkSubscriptionStatus();

    if (profile) {
      const updatedProfile: Profile = {
        ...profile,
        subscription_tier: status.tier,
        subscription_status: status.isActive ? 'active' : 'inactive',
      };
      updateProfile(updatedProfile);
    }

    console.log('[PaymentManager] ✅ Subscription synced, tier:', status.tier);
    return status.tier;
  } catch (error) {
    console.error('[PaymentManager] ❌ Sync failed:', error);
    return 'free';
  }
}

/**
 * Restore user's purchases
 */
export async function restoreUserPurchases(): Promise<PurchaseResult> {
  try {
    console.log('[PaymentManager] Restoring purchases...');

    const result = await restorePurchases();
    const tier = determineSubscriptionTier(result.entitlements);

    console.log('[PaymentManager] ✅ Purchases restored, tier:', tier);

    return {
      success: true,
      tier,
      message: 'Purchases restored successfully',
    };
  } catch (error: any) {
    console.error('[PaymentManager] ❌ Restore failed:', error);

    return {
      success: false,
      tier: 'free',
      message: error.message || 'Failed to restore purchases',
      error: error.code || 'RESTORE_FAILED',
    };
  }
}

/**
 * Determine subscription tier from entitlements
 */
function determineSubscriptionTier(entitlements: Record<string, any>): SubscriptionTier {
  if (entitlements['Aysa Lifetime']) {
    return 'lifetime';
  }
  if (entitlements['Aysa Pro']) {
    return 'weekly';
  }
  return 'free';
}

/**
 * Check if user has access to a feature based on their tier
 */
export function hasFeatureAccess(
  tier: SubscriptionTier | null | undefined,
  feature: 'core' | 'premium' | 'lifetime'
): boolean {
  if (!tier) return feature === 'core';

  switch (feature) {
    case 'core':
      return true; // All tiers have core access
    case 'premium':
      return tier === 'weekly' || tier === 'lifetime';
    case 'lifetime':
      return tier === 'lifetime';
    default:
      return false;
  }
}

/**
 * Format subscription tier for display
 */
export function formatTierName(tier: SubscriptionTier | null | undefined): string {
  switch (tier) {
    case 'weekly':
      return 'Weekly Subscription';
    case 'lifetime':
      return 'Lifetime Access';
    case 'free':
    default:
      return 'Free';
  }
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: SubscriptionTier | null | undefined): string {
  switch (tier) {
    case 'weekly':
      return '#ec4899'; // Pink
    case 'lifetime':
      return '#fbbf24'; // Gold
    case 'free':
    default:
      return '#9ca3af'; // Gray
  }
}
