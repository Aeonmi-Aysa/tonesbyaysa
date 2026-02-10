# RevenueCat → Stripe Migration Audit

## 🎯 Executive Summary (ELI5)

**What we're doing:**
- Taking out RevenueCat (the middleman payment processor)
- Plugging Stripe directly into your app
- Keeping the UI/UX identical
- Adding a safety toggle so we can flip back if things break

**Why Stripe instead of RevenueCat?**
- RevenueCat takes 15% cut (RevenueCat fee + payment processor fee)
- Stripe = direct payment processor, you own the relationship
- Stripe webhooks handle subscription validation server-side
- Same features, cheaper long-term

---

## 📍 RevenueCat Footprint (All Locations Found)

### **Files Using RevenueCat:**

```
1. src/lib/revenueCatSetup.ts (254 lines)
   ├─ import Purchases from 'react-native-purchases'
   ├─ Functions:
   │  ├─ initializeRevenueCat() - App init
   │  ├─ checkSubscriptionStatus() - Check entitlements
   │  ├─ getOfferingsWithRetry() - Fetch packages
   │  ├─ performPurchase() - Trigger purchase
   │  ├─ restorePurchases() - Restore on new device
   │  └─ setupRevenueCatListeners() - Listen for changes

2. src/lib/paymentManager.ts (187 lines)
   ├─ Imports revenueCatSetup functions
   ├─ Functions:
   │  ├─ purchaseSubscription() - Wrapper for purchase
   │  ├─ restoreSubscription() - Wrapper for restore
   │  └─ determineSubscriptionTier() - Map entitlements → tiers

3. src/screens/main/PricingScreen.tsx (547 lines)
   ├─ import Purchases from 'react-native-purchases'
   ├─ import CustomerInfo type
   ├─ Uses:
   │  ├─ Purchases.getCustomerInfo() - Line 92
   │  ├─ Purchases.getOfferings() - Line 176
   │  ├─ Purchases.purchasePackage() - Line 217
   │  ├─ Purchases.restorePurchases() - Line 266
   │  └─ checkSubscriptionStatus() - Line 87, 272

4. src/screens/main/PaywallScreen.tsx (732 lines)
   ├─ import Purchases from 'react-native-purchases'
   ├─ Same patterns as PricingScreen (160+ lines of RevenueCat)

5. src/hooks/useAuthBootstrap.ts (100 lines)
   ├─ Profile sync (will need to sync subscription status differently)
   ├─ No direct RevenueCat calls but stores subscription_tier

6. app.config.ts
   ├─ REVENUECAT_API_KEY in env (will remove)

7. src/store/useSessionStore.ts
   ├─ Profile includes subscription_tier (stays, no changes)
```

---

## 🔧 What Needs to Happen

### **Step 1: Create Stripe Setup Module**
Replace `revenueCatSetup.ts` with `stripeSetup.ts`:

```typescript
// NEW: src/lib/stripeSetup.ts
import { initStripe, useStripe, usePaymentSheet } from '@stripe/react-native';

export async function initializeStripe(publishableKey: string) {
  // Initialize Stripe SDK
}

export async function createPaymentIntent(tierId: string, userId: string) {
  // Call YOUR backend API to create PaymentIntent
  // Backend returns client_secret
}

export async function presentPaymentSheet(clientSecret: string) {
  // Show Stripe Payment Sheet
  // Return: { success: true, sessionId: string }
}

export async function checkSubscriptionStatus(userId: string) {
  // Query Supabase for user's subscription_tier + status
  // Return: { isActive, tier, hasWeekly, hasLifetime }
}
```

---

### **Step 2: Swap Imports in Files**

**PricingScreen.tsx changes:**
```typescript
// OLD
import Purchases from 'react-native-purchases';

// NEW
import { presentPaymentSheet, checkSubscriptionStatus } from '@/lib/stripeSetup';
```

**PaywallScreen.tsx changes:**
```typescript
// Same pattern
```

---

### **Step 3: Replace Purchase Flow**

**Current Flow (RevenueCat):**
```
User clicks button
  ↓
Purchases.getOfferings() [RevenueCat fetches packages]
  ↓
Purchases.purchasePackage() [Opens RevenueCat UI]
  ↓
RevenueCat validates on its servers
  ↓
Entitlements updated in app
```

**New Flow (Stripe):**
```
User clicks button
  ↓
YOUR backend creates PaymentIntent [Backend talks to Stripe]
  ↓
presentPaymentSheet() [Opens Stripe Payment Sheet]
  ↓
User enters card, Stripe processes
  ↓
Stripe webhook → YOUR backend → Supabase updated
  ↓
App queries Supabase for subscription_tier
```

---

### **Step 4: Webhook Handling (Backend)**

**Current:** RevenueCat webhooks → Your Supabase functions

**New:** Stripe webhooks → Your Supabase functions

Same structure, just different webhook source.

---

## 📊 Feature Mapping

| Feature | RevenueCat | Stripe | Status |
|---------|-----------|--------|---------|
| Trial periods | SDK manages | Payment method setup | ✅ Same experience |
| Subscription status | Entitlements | Supabase profile | ✅ Same data |
| Restore purchases | `restorePurchases()` | Query Supabase | ✅ Simpler |
| Cross-platform | Built-in | Handled via backend | ✅ Same result |
| Offline support | Limited | Sync on reconnect | ✅ Works |

---

## 🎛️ Safety Toggle (Feature Flag)

Add to `useSessionStore.ts`:

```typescript
// Feature flag for payment provider
export const PAYMENT_PROVIDER = 'stripe'; // or 'revenuecat'

export async function handlePurchase(tierId: string) {
  if (PAYMENT_PROVIDER === 'stripe') {
    return await stripeFlow(tierId);
  } else {
    return await revenuecatFlow(tierId); // Keep old code for fallback
  }
}
```

**If Stripe breaks:**
1. Change `PAYMENT_PROVIDER = 'revenuecat'`
2. App uses old RevenueCat code
3. Deploy hotfix

---

## 🚨 What We're NOT Changing

✅ UI/UX stays identical
✅ Profile data structure (subscription_tier field)
✅ Frequency access logic (still uses subscription_tier)
✅ Auth flow
✅ Supabase integration
✅ AppConfig (package name, etc)

❌ Nothing changes except payment provider

---

## 📋 Implementation Checklist

### **Phase 1: Setup (1 hour)**
- [ ] Install Stripe SDK: `npm install @stripe/react-native`
- [ ] Create `src/lib/stripeSetup.ts`
- [ ] Create `src/lib/stripePaymentManager.ts`
- [ ] Add Stripe publishable key to env

### **Phase 2: Update Screens (2 hours)**
- [ ] Update PricingScreen.tsx imports
- [ ] Replace Purchases.* calls with Stripe calls
- [ ] Update PaywallScreen.tsx same way
- [ ] Verify UI still looks identical

### **Phase 3: Backend Integration (2 hours)**
- [ ] Create API endpoint: POST `/api/payment/create-intent`
- [ ] Create API endpoint: POST `/api/payment/confirm-payment`
- [ ] Update Stripe webhook handler
- [ ] Add subscription status endpoint: GET `/api/subscription/status`

### **Phase 4: Testing (1 hour)**
- [ ] Test trial flow
- [ ] Test weekly subscription
- [ ] Test lifetime purchase
- [ ] Test restore/re-login

### **Phase 5: Rollout (with safety net)**
- [ ] Deploy feature flag set to `stripe`
- [ ] Monitor for errors
- [ ] If issues: flip flag to `revenuecat`

---

## 💰 Stripe Configuration Needed

```
Products Already Created (from earlier):
✓ Weekly: price_1SaZUKIJONruX42X6xjcLcMK (prod_TXenUIbf49rA45)
✓ Lifetime: price_1SaZa2IJONruX42XTjv6rInh (prod_TXetU989UOpLwo)

Stripe API Setup:
- Publishable key: pk_test_... (frontend)
- Secret key: sk_test_... (backend only)
- Webhook endpoint: https://yourbackend.com/stripe-webhook
```

---

## 🎯 Next Steps

1. **I'll create the Stripe setup module** (replace revenueCatSetup.ts)
2. **I'll show you the diffs** for PricingScreen + PaywallScreen
3. **You wire up backend** (create payment intent endpoint)
4. **I'll add safety toggle** (feature flag)
5. **Test and deploy**

---

## ❓ Questions?

- "What if user changes subscription mid-billing?" → Handled by Stripe
- "What if internet drops during payment?" → Stripe keeps trying, webhook confirms
- "Will trial still work?" → Yes, Stripe handles trial just like RevenueCat
- "Can we keep RevenueCat as fallback?" → YES, that's the toggle

**Ready to start Phase 1?** I'll create the Stripe setup module.

