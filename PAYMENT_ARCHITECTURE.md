# 💳 UNIFIED PAYMENT ARCHITECTURE - Stripe + RevenueCat

**Project**: Tones by Aysa  
**Goal**: Single subscription system across mobile and web  
**Status**: Ready for implementation  

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                   TONES BY AYSA APP                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  MOBILE (React Native)          BROWSER (React/Next.js)      │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  PaywallScreen   │           │  /pricing        │        │
│  │  - RevenueCat ✅ │           │  - Stripe        │        │
│  │  - Stripe 🆕     │           │  - Web form      │        │
│  └────────┬─────────┘           └────────┬─────────┘        │
│           │                              │                   │
│           └──────────────────┬───────────┘                   │
│                              │                               │
│                    ┌─────────▼────────┐                     │
│                    │   SUPABASE       │                     │
│                    │  Edge Functions  │                     │
│                    │  (Webhooks)      │                     │
│                    └─────────┬────────┘                     │
│                              │                               │
│           ┌──────────────────┼──────────────────┐            │
│           │                  │                  │            │
│    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐    │
│    │   STRIPE    │   │ REVENUECAT  │   │  SUPABASE   │    │
│    │  (Web)      │   │  (Mobile)   │   │  Database   │    │
│    │             │   │             │   │             │    │
│    │ Webhooks:   │   │ Webhooks:   │   │ profiles    │    │
│    │ - charge    │   │ - purchase  │   │ - tier      │    │
│    │ - invoice   │   │ - renewal   │   │ - status    │    │
│    │ - refund    │   │ - cancellation  │ - stripe_id │    │
│    └─────────────┘   └─────────────┘   └─────────────┘    │
│           │                  │                  │            │
│           └──────────────────┼──────────────────┘            │
│                              │                               │
│                    ┌─────────▼────────┐                     │
│                    │  WEBHOOK HANDLER │                     │
│                    │  Updates Profile │                     │
│                    └──────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 MOBILE FLOW (RevenueCat Primary + Stripe Fallback)

### **User Journey: Subscribe on Mobile**

```
1. USER OPENS APP
   │
   ├─ Dashboard → Sees "Upgrade" button
   │
2. CLICKS "UPGRADE"
   │
   ├─ Opens PaywallScreen
   ├─ Shows 3 options:
   │  ├─ 7-Day Free Trial
   │  ├─ $4.99/week (Weekly)
   │  └─ $69.99 (Lifetime)
   │
3. SELECTS PLAN (e.g., "Weekly")
   │
   ├─ Option A: RevenueCat (Preferred)
   │  ├─ Purchases.purchasePackage()
   │  ├─ Google Play Store handles payment
   │  ├─ RevenueCat webhook fires
   │  └─ Updates Supabase profile
   │
   └─ Option B: Stripe (Fallback)
      ├─ Stripe.presentPaymentSheet()
      ├─ User enters card details
      ├─ Stripe webhook fires
      └─ Updates Supabase profile
   │
4. SUCCESSFUL PURCHASE
   │
   ├─ Webhook received by Supabase
   ├─ Profile updated:
   │  - subscription_tier = 'weekly'
   │  - subscription_status = 'active'
   │  - stripe_customer_id or revenuecat_customer_id
   │
5. APP UPDATED
   │
   ├─ Local store refreshed
   ├─ Premium features unlocked
   ├─ UI shows "Welcome to Weekly!"
   └─ User can now access premium content

6. DATA VISIBLE EVERYWHERE
   │
   ├─ Open Browser → Subscription shows "Active"
   ├─ Go to Admin → User shows "Premium"
   └─ Check Supabase → profiles table updated
```

---

## 💻 BROWSER FLOW (Stripe Only)

### **User Journey: Subscribe on Web**

```
1. USER VISITS /PRICING
   │
   ├─ Shows pricing tiers
   ├─ Three options displayed:
   │  ├─ Free (with call-to-action)
   │  ├─ $4.99/week Weekly
   │  └─ $69.99 one-time Lifetime
   │
2. CLICKS "SUBSCRIBE"
   │
   ├─ Redirected to /checkout
   ├─ Stripe checkout form loads
   │
3. STRIPE ELEMENTS FORM
   │
   ├─ Card number input
   ├─ Expiration date
   ├─ CVC
   ├─ Billing address (optional)
   │
4. USER SUBMITS PAYMENT
   │
   ├─ Stripe processes payment
   ├─ 3D Secure authentication (if needed)
   ├─ Payment succeeds or fails
   │
5. ON SUCCESS
   │
   ├─ Stripe sends webhook to Supabase
   ├─ Supabase function processes:
   │  - Creates/updates Stripe customer
   │  - Creates subscription record
   │  - Updates profiles table
   │  - subscription_tier = 'weekly'
   │  - stripe_customer_id = 'cus_...'
   │
6. BROWSER UPDATED
   │
   ├─ Redirected to /profile/subscription
   ├─ Shows "Subscription Active"
   ├─ Displays next billing date
   ├─ Premium features unlocked
   │
7. DATA VISIBLE EVERYWHERE
   │
   ├─ Open Mobile → Subscription shows "Active"
   ├─ Go to Admin → User shows "Premium"
   └─ Check Supabase → profiles table updated
```

---

## 🔄 WEBHOOK PROCESSING

### **Stripe Webhook Flow**

```
Stripe sends: charge.succeeded
  ↓
Supabase receives: POST /webhooks/stripe
  ↓
Function executes:
  1. Verify webhook signature
  2. Extract customer_id and amount
  3. Look up Supabase user by stripe_customer_id
  4. Determine tier from amount:
     - $4.99 → 'weekly'
     - $69.99 → 'lifetime'
  5. Update profiles table:
     UPDATE profiles SET
       subscription_tier = 'weekly',
       subscription_status = 'active',
       stripe_customer_id = 'cus_...'
     WHERE id = user_id
  6. Log transaction
  7. Return 200 OK

Result: Mobile user sees subscription immediately!
```

### **RevenueCat Webhook Flow**

```
RevenueCat sends: INITIAL_PURCHASE
  ↓
Supabase receives: POST /webhooks/revenuecat
  ↓
Function executes:
  1. Verify webhook signature
  2. Extract user_id and product_id
  3. Match product to tier:
     - 'aysa_weekly_subscription' → 'weekly'
     - 'aysa_lifetime_access' → 'lifetime'
  4. Update profiles table:
     UPDATE profiles SET
       subscription_tier = 'weekly',
       subscription_status = 'active',
       revenuecat_customer_id = 'rc_...'
     WHERE id = user_id
  5. Log transaction
  6. Return 200 OK

Result: Browser user sees subscription immediately!
```

---

## 🗄️ DATABASE SCHEMA

### **Profiles Table**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  
  -- Subscription fields
  subscription_tier VARCHAR(20) DEFAULT 'free',  -- 'free', 'weekly', 'lifetime'
  subscription_status VARCHAR(20) DEFAULT 'inactive',  -- 'active', 'inactive', 'trial', 'cancelled'
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  
  -- Payment provider IDs
  stripe_customer_id VARCHAR(100) UNIQUE,  -- cus_...
  revenuecat_customer_id VARCHAR(100) UNIQUE,  -- rc_...
  payment_provider VARCHAR(50),  -- 'stripe' or 'revenuecat'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX idx_profiles_revenuecat_customer_id ON profiles(revenuecat_customer_id);
```

### **Transactions Table (for record-keeping)**

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Payment info
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  product_tier VARCHAR(20),  -- 'weekly', 'lifetime'
  
  -- Provider info
  provider VARCHAR(50),  -- 'stripe', 'revenuecat'
  provider_transaction_id VARCHAR(255),  -- Stripe: pi_..., RevenueCat: event_id
  payment_method VARCHAR(50),  -- 'card', 'apple_pay', 'google_pay'
  
  -- Status
  status VARCHAR(50),  -- 'completed', 'failed', 'refunded'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔧 SUPABASE EDGE FUNCTIONS

### **Function: sync-stripe-webhook**

```typescript
// POST /webhooks/stripe
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function handler(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  // Verify webhook signature
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle charge.succeeded
  if (event.type === 'charge.succeeded') {
    const charge = event.data.object;
    const customer_id = charge.customer;
    const amount = charge.amount / 100; // Convert from cents

    // Determine tier from amount
    let tier = 'free';
    if (amount === 4.99) tier = 'weekly';
    if (amount === 69.99) tier = 'lifetime';

    // Update Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        stripe_customer_id: customer_id,
        payment_provider: 'stripe'
      })
      .eq('stripe_customer_id', customer_id);

    if (error) {
      console.error('Update failed:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.json({ received: true });
}
```

### **Function: sync-revenuecat-webhook**

```typescript
// POST /webhooks/revenuecat
import { createClient } from '@supabase/supabase-js';

export async function handler(req, res) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const event = req.body;

  // Verify signature
  const signature = req.headers['x-revenuecat-signature'];
  // TODO: Implement signature verification

  // Handle INITIAL_PURCHASE
  if (event.type === 'INITIAL_PURCHASE') {
    const user_id = event.subscriber_attributes?.['$appsflyer_id']; // Adjust based on your setup
    const product_id = event.product_identifier;

    // Map product to tier
    let tier = 'free';
    if (product_id === 'aysa_weekly_subscription') tier = 'weekly';
    if (product_id === 'aysa_lifetime_access') tier = 'lifetime';

    // Update Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        revenuecat_customer_id: event.subscriber_id,
        payment_provider: 'revenuecat'
      })
      .eq('id', user_id);

    if (error) {
      console.error('Update failed:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.json({ received: true });
}
```

---

## 🎯 PRODUCT CONFIGURATION

### **Stripe Products**

```
Stripe Dashboard:
  Products → Add Product

Product 1: Weekly Subscription
  - Name: "Tones Weekly Subscription"
  - Price: $4.99/month
  - Billing: Recurring, Monthly
  - Tax: Included

Product 2: Lifetime Access
  - Name: "Tones Lifetime Access"
  - Price: $69.99
  - Billing: One-time
  - Tax: Included
```

### **RevenueCat Products**

```
RevenueCat Dashboard:
  Products → Add Product

Product 1: Weekly Subscription
  - Identifier: aysa_weekly_subscription
  - Type: Subscription
  - Platform: iOS, Android
  - Price: $4.99/month
  - Trial: 7 days (optional)

Product 2: Lifetime Access
  - Identifier: aysa_lifetime_access
  - Type: Non-consumable
  - Platform: iOS, Android
  - Price: $69.99
```

### **Entitlements**

```
RevenueCat Dashboard:
  Entitlements → Add Entitlement

Entitlement 1: Aysa_Pro
  - Products: aysa_weekly_subscription
  - Grants access to premium features

Entitlement 2: Aysa_Lifetime
  - Products: aysa_lifetime_access
  - Grants lifetime access
```

---

## ✅ CHECKLIST: PAYMENT SETUP

### **Phase 1: Stripe Setup**
- [ ] Create Stripe account (test mode first)
- [ ] Create test products (Weekly, Lifetime)
- [ ] Create test prices
- [ ] Generate API keys (pk_test_, sk_test_)
- [ ] Enable webhooks
- [ ] Add webhook endpoint: https://yourapp.com/webhooks/stripe
- [ ] Add events: charge.succeeded, charge.refunded
- [ ] Get webhook signing secret
- [ ] Configure in environment variables

### **Phase 2: RevenueCat Setup**
- [ ] Create RevenueCat project
- [ ] Add iOS app
- [ ] Add Android app
- [ ] Create test products
- [ ] Create entitlements
- [ ] Get API key (goog_... or appl_...)
- [ ] Enable webhooks
- [ ] Add webhook endpoint: https://yourapp.com/webhooks/revenuecat
- [ ] Test webhook delivery
- [ ] Configure in environment variables

### **Phase 3: Supabase Edge Functions**
- [ ] Create functions directory
- [ ] Deploy sync-stripe-webhook function
- [ ] Deploy sync-revenuecat-webhook function
- [ ] Test webhook delivery
- [ ] Verify profile updates
- [ ] Check error logs
- [ ] Monitor webhook performance

### **Phase 4: Integration Testing**
- [ ] Test Stripe payment flow on browser
- [ ] Test RevenueCat flow on mobile
- [ ] Verify Supabase updates immediately
- [ ] Check cross-platform visibility
- [ ] Test payment failure scenarios
- [ ] Test refund flow
- [ ] Test subscription changes
- [ ] Verify webhook retries

---

## 📊 MONITORING & DEBUGGING

### **Key Metrics**

```
Track these in dashboard:
  - Payment success rate (target: 99.5%+)
  - Webhook delivery rate (target: 100%)
  - Sync latency (target: <2s)
  - Failed webhook count (target: 0)
  - Customer dispute rate (target: <0.5%)
```

### **Logging**

```
Log these for debugging:
  - Webhook receipt (with timestamp)
  - Signature verification (pass/fail)
  - Supabase query result
  - Update confirmation
  - Any errors or exceptions
```

### **Debugging Steps**

```
If subscription not updating:
  1. Check webhook delivery (Stripe/RevenueCat dashboard)
  2. Check Supabase logs for function execution
  3. Check database: SELECT * FROM profiles WHERE id = '...'
  4. Manual update if needed: UPDATE profiles SET subscription_tier = 'weekly' WHERE id = '...'
  5. Clear cache/refresh apps

If customer reports issue:
  1. Look up customer in Stripe
  2. Check transaction history
  3. Check Supabase profile
  4. Check mobile and browser
  5. Manually sync if needed
```

---

## 🚀 ENVIRONMENT VARIABLES

```
.env.local (Development):
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_test_...
  
  REVENUECAT_API_KEY=test_...
  REVENUECAT_WEBHOOK_SECRET=...
  
  SUPABASE_URL=https://...supabase.co
  SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_KEY=...

.env.production:
  STRIPE_PUBLISHABLE_KEY=pk_live_...
  STRIPE_SECRET_KEY=sk_live_...
  STRIPE_WEBHOOK_SECRET=whsec_live_...
  
  REVENUECAT_API_KEY=appl_... or goog_...
  REVENUECAT_WEBHOOK_SECRET=...
  
  SUPABASE_URL=https://...supabase.co
  SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_KEY=...
```

---

## 🎓 QUICK REFERENCE

| Scenario | Handler | Result |
|----------|---------|--------|
| User pays on mobile via RevenueCat | revenuecat-webhook | profiles.subscription_tier = 'weekly' |
| User pays on mobile via Stripe | stripe-webhook | profiles.subscription_tier = 'weekly' |
| User pays on browser via Stripe | stripe-webhook | profiles.subscription_tier = 'weekly' |
| User upgrades plan | Webhook | profiles.subscription_tier updated |
| User cancels subscription | Webhook | profiles.subscription_status = 'cancelled' |
| Refund issued | Webhook | profiles.subscription_status = 'inactive' |

---

**Status**: Ready for implementation  
**Last Updated**: January 24, 2026  
**Next Step**: Set up Stripe & RevenueCat accounts, then implement Phase 1
