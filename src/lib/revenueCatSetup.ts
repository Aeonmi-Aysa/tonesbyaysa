import Purchases, { CustomerInfo, PurchasesErrorCode } from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = process.env.REVENUECAT_API_KEY || 'test_xfJvKnRDVTgVmDEERjBYTnOZExW';

interface RevenueCatConfig {
  apiKey: string;
  observerMode?: boolean;
  networkTimeout?: number;
  shouldOnlyFetchIfOlderThanMs?: number;
}

/**
 * Initialize RevenueCat with proper platform-specific setup
 */
export async function initializeRevenueCat(config: Partial<RevenueCatConfig> = {}) {
  try {
    const finalConfig: RevenueCatConfig = {
      apiKey: config.apiKey || REVENUECAT_API_KEY,
      observerMode: config.observerMode ?? false,
      networkTimeout: config.networkTimeout ?? 5000,
      shouldOnlyFetchIfOlderThanMs: config.shouldOnlyFetchIfOlderThanMs ?? 0,
    };

    console.log('[RevenueCat] Initializing with API key:', finalConfig.apiKey.substring(0, 10) + '...');

    // Platform-specific setup
    if (Platform.OS === 'ios') {
      await Purchases.configure({
        apiKey: finalConfig.apiKey,
        observerMode: finalConfig.observerMode,
        networkTimeout: finalConfig.networkTimeout,
        shouldOnlyFetchIfOlderThanMs: finalConfig.shouldOnlyFetchIfOlderThanMs,
      });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({
        apiKey: finalConfig.apiKey,
        observerMode: finalConfig.observerMode,
        networkTimeout: finalConfig.networkTimeout,
        shouldOnlyFetchIfOlderThanMs: finalConfig.shouldOnlyFetchIfOlderThanMs,
      });
    }

    console.log('[RevenueCat] ✅ Initialized successfully');
    return true;
  } catch (error) {
    console.error('[RevenueCat] ❌ Initialization failed:', error);
    return false;
  }
}

/**
 * Check if user has active subscription
 */
export async function checkSubscriptionStatus(): Promise<{
  isActive: boolean;
  tier: 'free' | 'weekly' | 'lifetime';
  hasWeekly: boolean;
  hasLifetime: boolean;
}> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    
    const hasWeekly = customerInfo.entitlements.active['Aysa Pro'] !== undefined;
    const hasLifetime = customerInfo.entitlements.active['Aysa Lifetime'] !== undefined;

    console.log('[RevenueCat] Subscription status:', {
      hasWeekly,
      hasLifetime,
      activeEntitlements: Object.keys(customerInfo.entitlements.active),
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
    };
  } catch (error) {
    console.error('[RevenueCat] Error checking subscription:', error);
    return {
      isActive: false,
      tier: 'free',
      hasWeekly: false,
      hasLifetime: false,
    };
  }
}

/**
 * Get available offerings with retry logic
 */
export async function getOfferingsWithRetry(maxRetries = 3): Promise<any | null> {
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[RevenueCat] Fetching offerings (attempt ${i + 1}/${maxRetries})...`);
      
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.warn('[RevenueCat] ⚠️ No current offering available');
        lastError = new Error('No current offering');
        // Wait before retry (exponential backoff)
        if (i < maxRetries - 1) {
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        }
        continue;
      }

      console.log('[RevenueCat] ✅ Offerings fetched successfully');
      console.log('[RevenueCat] Available packages:', 
        offerings.current.availablePackages.map((p: any) => ({
          identifier: p.product.identifier,
          title: p.product.title,
          price: p.product.priceString,
        }))
      );

      return offerings.current;
    } catch (error) {
      console.error(`[RevenueCat] ❌ Attempt ${i + 1} failed:`, error);
      lastError = error;
      
      // Don't retry on certain errors
      if ((error as any)?.code === 'NetworkError' || (error as any)?.code === 'OfflineError') {
        if (i < maxRetries - 1) {
          // Exponential backoff for network errors
          await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
        }
      }
    }
  }

  console.error('[RevenueCat] Failed to get offerings after', maxRetries, 'attempts');
  throw lastError;
}

/**
 * Perform a purchase with proper error handling
 */
export async function performPurchase(packageId: string, productIdentifier: string) {
  try {
    console.log('[RevenueCat] Starting purchase:', { packageId, productIdentifier });

    // Get offerings
    const offerings = await getOfferingsWithRetry();

    if (!offerings || !offerings.availablePackages.length) {
      throw new Error('No packages available for purchase');
    }

    // Find package
    const pkg = offerings.availablePackages.find((p: any) =>
      p.product.identifier === productIdentifier
    );

    if (!pkg) {
      const availableIds = offerings.availablePackages.map((p: any) => p.product.identifier);
      throw new Error(`Product "${productIdentifier}" not found. Available: ${availableIds.join(', ')}`);
    }

    console.log('[RevenueCat] Found package, proceeding with purchase...');

    // Perform purchase
    const purchaseResult = await Purchases.purchasePackage(pkg);

    console.log('[RevenueCat] ✅ Purchase successful!');
    console.log('[RevenueCat] Customer info:', {
      activeEntitlements: Object.keys(purchaseResult.customerInfo.entitlements.active),
    });

    return {
      success: true,
      customerInfo: purchaseResult.customerInfo,
      entitlements: purchaseResult.customerInfo.entitlements.active,
    };
  } catch (error: any) {
    if (error.code === PurchasesErrorCode.PurchaseCancelledError) {
      console.log('[RevenueCat] User cancelled purchase');
      throw {
        cancelled: true,
        message: 'Purchase cancelled',
      };
    }

    console.error('[RevenueCat] ❌ Purchase failed:', error);
    throw {
      cancelled: false,
      message: error.message || 'Purchase failed',
      code: error.code,
    };
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases() {
  try {
    console.log('[RevenueCat] Restoring purchases...');
    
    const customerInfo = await Purchases.restorePurchases();
    
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    console.log('[RevenueCat] ✅ Purchases restored:', activeEntitlements);

    return {
      success: true,
      customerInfo,
      entitlements: customerInfo.entitlements.active,
    };
  } catch (error: any) {
    console.error('[RevenueCat] ❌ Restore failed:', error);
    throw {
      message: error.message || 'Failed to restore purchases',
      code: error.code,
    };
  }
}

/**
 * Set up RevenueCat listeners
 */
export function setupRevenueCatListeners(
  onPurchaseUpdate?: (customerInfo: CustomerInfo) => void,
  onError?: (error: any) => void
) {
  try {
    // Listen for purchase updates
    const purchaseUpdateListener = Purchases.addCustomerInfoUpdateListener(
      (customerInfo: CustomerInfo) => {
        console.log('[RevenueCat] Customer info updated');
        onPurchaseUpdate?.(customerInfo);
      }
    );

    console.log('[RevenueCat] ✅ Listeners set up');
    return purchaseUpdateListener;
  } catch (error) {
    console.error('[RevenueCat] ❌ Failed to set up listeners:', error);
    onError?.(error);
    return null;
  }
}
