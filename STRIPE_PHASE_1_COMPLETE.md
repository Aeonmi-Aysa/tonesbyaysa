# Stripe Migration - Phase 1 Complete ✅

## 📦 What Was Created

### 1. **`src/lib/stripeSetup.ts`** (Core Stripe SDK wrapper)
- `initializeStripe()` - Initialize Stripe SDK
- `createPaymentIntent()` - Create payment intent via backend
- `presentPaymentSheet()` - Show Stripe payment UI (placeholder)
- `confirmPayment()` - Confirm payment after sheet completes
- `checkSubscriptionStatus()` - Query Supabase for subscription
- `restoreSubscription()` - Restore on new device
- `cancelSubscription()` - User cancels recurring
- `handleStripeWebhook()` - Process Stripe webhooks (backend calls this)

### 2. **`src/lib/stripePaymentManager.ts`** (Wrapper functions)
- `purchaseSubscription()` - Main purchase entry point
- `confirmPurchase()` - Confirm after Payment Sheet
- `restoreUserSubscription()` - Restore on login
- `cancelUserSubscription()` - Cancel subscription
- `checkUserSubscription()` - Check status

### 3. **`src/lib/paymentToggle.ts`** (Safety switch)
- `ACTIVE_PAYMENT_PROVIDER` - Switch between 'stripe' | 'revenuecat'
- `handlePurchase()` - Routes to Stripe or RevenueCat based on flag
- `checkSubscription()` - Routes to Stripe or RevenueCat based on flag
- `restorePurchases()` - Routes based on flag
- **Toggle between providers without redeploying**

---

## 🎯 How It Works Now

```
User clicks "Buy" button
  ↓
handlePurchase() in paymentToggle.ts
  ↓
IF stripe is active:
  ├─ createPaymentIntent(tierId, userId, email)
  │  └─ Backend creates PaymentIntent via Stripe API
  │     └─ Returns clientSecret
  └─ Component uses clientSecret with usePaymentSheet hook
     └─ Shows Stripe Payment Sheet to user
        └─ User enters card
           └─ Stripe processes
              └─ Webhook to backend
                 └─ Backend confirms with Stripe
                    └─ Backend updates Supabase
                       └─ App queries Supabase for subscription
                          └─ UI updates

ELSE if revenuecat is active:
  └─ Falls back to old RevenueCat flow
```

---

## ⚙️ Configuration Needed

### **1. Environment Variables**
Add to `.env`:
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
BACKEND_API_URL=https://yourbackend.com
```

### **2. Backend API Endpoints** (You need to create these)

#### POST `/api/payment/create-intent`
```json
Request:
{
  "tierId": "weekly",
  "userId": "user123",
  "email": "user@example.com",
  "amount": 499,
  "currency": "usd"
}

Response:
{
  "clientSecret": "pi_test_1234...",
  "paymentIntentId": "pi_test_1234"
}
```

#### POST `/api/payment/confirm`
```json
Request:
{
  "paymentIntentId": "pi_test_1234",
  "tierId": "weekly",
  "userId": "user123"
}

Response:
{
  "success": true,
  "tier": "weekly"
}
```

#### POST `/api/payment/cancel`
```json
Request:
{
  "userId": "user123"
}

Response:
{
  "success": true
}
```

#### Webhook Handler: `/stripe-webhook`
```json
Events to handle:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed
```

---

## 🔄 How to Switch Providers

**To use Stripe (default):**
```typescript
// In paymentToggle.ts
export const ACTIVE_PAYMENT_PROVIDER: PaymentProvider = 'stripe'; ✅
```

**To fall back to RevenueCat (if issues):**
```typescript
// In paymentToggle.ts
export const ACTIVE_PAYMENT_PROVIDER: PaymentProvider = 'revenuecat'; ✅
```

**Flip it and redeploy** - No app reinstall needed!

---

## 📝 Database Schema Updates

Your `profiles` table needs these fields (verify they exist):

```sql
-- Existing
id (UUID)
subscription_tier ('free' | 'weekly' | 'lifetime')
subscription_status ('active' | 'cancelled' | 'payment_failed')

-- New for Stripe
stripe_customer_id (TEXT)
subscription_expires_at (TIMESTAMP)
```

**Migration:**
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
```

---

## 🚀 Next Steps

### **Phase 2: Update PricingScreen** (~30 mins)
```
1. Replace Purchases imports with Stripe imports
2. Replace Purchases.getCustomerInfo() with checkSubscriptionStatus()
3. Replace Purchases.purchasePackage() with handlePurchase()
4. Replace Purchases.restorePurchases() with restorePurchases()
5. Wire up Payment Sheet UI
```

### **Phase 3: Update PaywallScreen** (~30 mins)
```
Same changes as PricingScreen
```

### **Phase 4: Backend Setup** (~2-3 hours)
```
1. Create /api/payment/create-intent endpoint
2. Create /api/payment/confirm endpoint
3. Create /api/payment/cancel endpoint
4. Wire up Stripe webhook handler
5. Test with Stripe test cards
```

### **Phase 5: Testing** (~1 hour)
```
1. Test trial flow
2. Test weekly subscription
3. Test lifetime purchase
4. Test cancel subscription
5. Test with Stripe test cards
```

---

## 🧪 Stripe Test Cards

Use these while in test mode:

| Card | Number | Exp | CVC | Result |
|------|--------|-----|-----|--------|
| Success | 4242 4242 4242 4242 | 12/25 | 123 | ✅ |
| Decline | 4000 0000 0000 0002 | 12/25 | 123 | ❌ |
| 3D Secure | 4000 0025 0000 3155 | 12/25 | 123 | Prompt |

---

## 📊 Code Examples

### **Using handlePurchase (recommended)**
```typescript
import { handlePurchase } from '@/lib/paymentToggle';

const result = await handlePurchase('weekly', userId, email);
if (result.success) {
  // Subscription purchased
} else {
  // Show error
}
```

### **Checking subscription**
```typescript
import { checkSubscription } from '@/lib/paymentToggle';

const status = await checkSubscription(userId);
if (status.tier === 'weekly' || status.tier === 'lifetime') {
  // Show premium features
}
```

### **Manually forcing provider (debugging)**
```typescript
import { handlePurchase } from '@/lib/paymentToggle';

// Force Stripe
await handlePurchase('weekly', userId, email, 'stripe');

// Force RevenueCat fallback
await handlePurchase('weekly', userId, email, 'revenuecat');
```

---

## ✅ Checklist

- [x] Create stripeSetup.ts
- [x] Create stripePaymentManager.ts
- [x] Create paymentToggle.ts
- [ ] Update PricingScreen.tsx
- [ ] Update PaywallScreen.tsx
- [ ] Set up backend APIs
- [ ] Configure Supabase schema
- [ ] Test payment flow
- [ ] Deploy with toggle

---

## 🎯 Status: Phase 1 ✅ Complete

**Stripe SDK layer created and ready to integrate with screens!**

Next: Update PricingScreen to use Stripe instead of RevenueCat.

