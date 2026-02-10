/**
 * Payment Provider Toggle
 * 
 * This allows you to switch between Stripe and RevenueCat
 * without redeploying the entire app.
 * 
 * Set to 'stripe' for Stripe payments
 * Set to 'revenuecat' to fall back to RevenueCat
 */

export type PaymentProvider = 'stripe' | 'revenuecat';

// Current active payment provider
export const ACTIVE_PAYMENT_PROVIDER: PaymentProvider = 'stripe';

/**
 * Check if payment provider is Stripe
 */
export function isStripeActive(): boolean {
  return ACTIVE_PAYMENT_PROVIDER === 'stripe';
}

/**
 * Check if payment provider is RevenueCat
 */
export function isRevenueCatActive(): boolean {
  return ACTIVE_PAYMENT_PROVIDER === 'revenuecat';
}

/**
 * Get current payment provider
 */
export function getCurrentPaymentProvider(): PaymentProvider {
  return ACTIVE_PAYMENT_PROVIDER;
}

/**
 * Toggle payment provider (useful for debugging)
 * NOTE: This is for development only - change ACTIVE_PAYMENT_PROVIDER constant for prod
 */
export function togglePaymentProvider(): PaymentProvider {
  const newProvider: PaymentProvider = ACTIVE_PAYMENT_PROVIDER === 'stripe' ? 'revenuecat' : 'stripe';
  console.log(`[PaymentToggle] Switched from ${ACTIVE_PAYMENT_PROVIDER} to ${newProvider}`);
  return newProvider;
}

/**
 * Handle purchase based on active payment provider
 * This is the main entry point for all purchase flows
 * 
 * @param tierId - 'trial', 'weekly', or 'lifetime'
 * @param userId - User ID
 * @param email - User email
 * @param priceId - Stripe Price ID (optional, for Stripe only)
 * @param isTrialStart - Whether this is starting a trial (only charges $0)
 */
export async function handlePurchase(
  tierId: string,
  userId: string,
  email: string,
  priceId?: string,
  isTrialStart: boolean = tierId === 'trial'
) {
  const method = ACTIVE_PAYMENT_PROVIDER;
  console.log(`[PaymentToggle] Processing ${tierId} purchase with ${method} (isTrialStart: ${isTrialStart})`);

  if (method === 'stripe') {
    const { purchaseSubscription } = await import('./stripePaymentManager');
    return purchaseSubscription(tierId, userId, email, priceId, isTrialStart);
  } else {
    const { purchaseSubscription } = await import('@/lib/paymentManager');
    return purchaseSubscription(tierId);
  }
}

/**
 * Check subscription based on active payment provider
 */
export async function checkSubscription(
  userId: string,
  method: 'stripe' | 'revenuecat' = ACTIVE_PAYMENT_PROVIDER
) {
  console.log(`[PaymentToggle] Checking subscription with ${method}`);

  if (method === 'stripe') {
    const { checkSubscriptionStatus } = await import('./stripeSetup');
    return checkSubscriptionStatus(userId);
  } else {
    const { checkSubscriptionStatus } = await import('./revenueCatSetup');
    return checkSubscriptionStatus();
  }
}

/**
 * Restore purchases based on active payment provider
 */
export async function restorePurchases(
  userId: string,
  method: 'stripe' | 'revenuecat' = ACTIVE_PAYMENT_PROVIDER
) {
  console.log(`[PaymentToggle] Restoring purchases with ${method}`);

  if (method === 'stripe') {
    const { restoreUserSubscription } = await import('./stripePaymentManager');
    return restoreUserSubscription(userId);
  } else {
    const { restorePurchases } = await import('./revenueCatSetup');
    return restorePurchases();
  }
}
