# 🎯 7-Day Trial → Paid Subscription Conversion Guide

## Overview
The trial-to-paid conversion works by:
1. User starts 7-day FREE trial (no card charged)
2. System sets `trial_ends_at` timestamp (7 days from now)
3. When trial expires → automatically converts to paid subscription
4. User's card is charged at conversion point

---

## Architecture Components

### 1. Stripe Subscription Configuration
**What you need from Stripe:**

```
Stripe Dashboard → Products & Prices

WEEKLY TIER:
- Product Name: "Tones by Aysa - Weekly"
- Price ID: price_xxxxx (REQUIRED - get this!)
- Billing Period: 7 days initial (trial), then weekly recurring
- Set up in: Stripe Dashboard

LIFETIME TIER:
- Product Name: "Tones by Aysa - Lifetime"
- Price ID: price_xxxxx (REQUIRED - get this!)
- One-time purchase (not subscription)
- Set up in: Stripe Dashboard
```

**How to get Stripe Price IDs:**
```
1. Go to https://dashboard.stripe.com/products
2. Create/select "Tones by Aysa - Weekly"
3. Add Price:
   - Amount: $4.99
   - Billing period: 7 days (custom)
   - Then: Weekly (7 days)
4. Copy Price ID (looks like: price_1FfRcFIEWz1sEFejf2zxxxxx)
5. Add to environment variables:
   STRIPE_WEEKLY_PRICE_ID=price_xxxxx
   STRIPE_LIFETIME_PRICE_ID=price_xxxxx
```

---

## 2. Supabase Database Schema

Your `profiles` table needs these columns:

```sql
-- Subscription tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS (
  subscription_tier varchar (50), -- 'free' | 'weekly' | 'lifetime'
  subscription_status varchar(50), -- 'active' | 'trial' | 'expired' | 'cancelled'
  trial_ends_at timestamp,         -- When 7-day trial ends
  subscription_expires_at timestamp, -- When current subscription ends
  stripe_customer_id varchar(255),   -- Stripe customer ID (for billing)
  stripe_subscription_id varchar(255), -- Stripe subscription ID
  last_payment_at timestamp
);

-- Example trial user after signup:
UPDATE profiles SET
  subscription_tier = 'weekly',
  subscription_status = 'trial',
  trial_ends_at = NOW() + INTERVAL '7 days',
  subscription_expires_at = NOW() + INTERVAL '7 days'
WHERE id = 'user-id';
```

---

## 3. Stripe Payment Intent Flow

### For Trial Start (7 days free):

```typescript
// Server-side (Backend API)
POST /api/payment/create-intent

Request Body:
{
  userId: "user-uuid",
  tierId: "weekly",        // or "lifetime"
  email: "user@example.com",
  isTrialStart: true       // Important flag!
}

Response:
{
  clientSecret: "pi_1Fxxxx_xxxxx",
  trialEndsAt: "2026-02-09T12:00:00Z",
  amount: 0,               // $0 for trial
  currency: "usd"
}

// Flow:
1. Create Stripe Customer (if new): stripe.customers.create()
2. Create Payment Intent with trial:
   - amount: 0 (FREE)
   - metadata: { userId, isTrialStart: true, trialEndsAt }
3. Save to Supabase:
   - subscription_tier = 'weekly'
   - subscription_status = 'trial'
   - trial_ends_at = 7 days from now
   - stripe_customer_id = customer.id
```

### For Paid Conversion (After Trial):

```typescript
// Server-side (Backend API)
POST /api/payment/confirm-trial-conversion

Request Body:
{
  userId: "user-uuid",
  paymentMethodId: "pm_xxxxx"  // Saved from trial
}

Response:
{
  subscriptionId: "sub_xxxxx",
  nextBillingDate: "2026-02-16T12:00:00Z",
  amount: 499                    // $4.99 in cents
}

// Flow:
1. Retrieve user's stripe_customer_id
2. Create subscription with trial already passed:
   - stripe.subscriptions.create({
       customer: stripe_customer_id,
       items: [{ price: STRIPE_WEEKLY_PRICE_ID }],
       payment_method: paymentMethodId,
       off_session: true  // Charge automatically
     })
3. Update Supabase:
   - subscription_status = 'active'
   - stripe_subscription_id = sub_xxxxx
   - subscription_expires_at = new billing date
```

---

## 4. Backend API Endpoints (Required)

### Endpoint 1: Create Trial/Purchase
```typescript
// POST /api/payment/create-intent
// Called when user clicks "Start Free Trial" or "Subscribe"

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

app.post('/api/payment/create-intent', async (req, res) => {
  const { userId, tierId, email, isTrialStart } = req.body;

  try {
    // 1. Get or create Stripe customer
    let customer = await stripe.customers.search({
      query: `metadata["userId"]:"${userId}"`
    });

    let customerId: string;
    if (customer.data.length > 0) {
      customerId = customer.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email,
        metadata: { userId }
      });
      customerId = newCustomer.id;
    }

    // 2. Determine amount and trial days
    let amount = 0;
    let trialDays = 7;
    let priceId = tierId === 'weekly' 
      ? process.env.STRIPE_WEEKLY_PRICE_ID 
      : process.env.STRIPE_LIFETIME_PRICE_ID;

    if (!isTrialStart && tierId !== 'lifetime') {
      // Not trial start = immediate charge
      amount = 499; // $4.99 in cents
    }

    // 3. Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerId,
      amount,
      currency: 'usd',
      metadata: {
        userId,
        tierId,
        isTrialStart: isTrialStart ? 'true' : 'false',
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    // 4. Save to Supabase
    await supabase
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        subscription_tier: tierId,
        subscription_status: isTrialStart ? 'trial' : 'active',
        trial_ends_at: isTrialStart 
          ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
          : null,
        subscription_expires_at: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000)
      })
      .eq('id', userId);

    res.json({
      clientSecret: paymentIntent.client_secret,
      customerId,
      amount: paymentIntent.amount,
      trialDays: isTrialStart ? trialDays : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Endpoint 2: Confirm Payment
```typescript
// POST /api/payment/confirm
// Called after Payment Sheet completes

app.post('/api/payment/confirm', async (req, res) => {
  const { userId, paymentIntentId, paymentMethodId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const { userId: metaUserId, tierId, isTrialStart, trialEndsAt } = paymentIntent.metadata;

      // Update Supabase with successful payment
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          stripe_subscription_id: paymentIntent.id,
          last_payment_at: new Date()
        })
        .eq('id', metaUserId);

      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ error: 'Payment not confirmed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Endpoint 3: Stripe Webhook
```typescript
// POST /api/webhook/stripe
// Stripe calls this when events happen

app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        // Recurring payment succeeded
        const invoice = event.data.object;
        const customerId = invoice.customer;

        // Find user with this customer ID
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profiles) {
          // Update next billing date
          const daysUntilRenewal = invoice.period_end 
            ? (invoice.period_end - Math.floor(Date.now() / 1000)) / 86400
            : 7;

          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_expires_at: new Date(invoice.period_end * 1000),
              last_payment_at: new Date()
            })
            .eq('id', profiles.id);
        }
        break;

      case 'invoice.payment_failed':
        // Payment failed - mark subscription as at risk
        // Send email to user
        break;

      case 'customer.subscription.deleted':
        // User cancelled subscription
        const subscription = event.data.object;
        const deletedCustomerId = subscription.customer;

        const { data: cancelledProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', deletedCustomerId)
          .single();

        if (cancelledProfiles) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'cancelled',
              subscription_tier: 'free'
            })
            .eq('id', cancelledProfiles.id);
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

## 5. Client-Side Flow (React Native)

### Updated stripeSetup.ts

```typescript
// src/lib/stripeSetup.ts

export const initiateTrialSubscription = async (
  userId: string,
  email: string
): Promise<{ clientSecret: string; trialEndsAt: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payment/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        tierId: 'weekly',
        isTrialStart: true
      })
    });

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const confirmTrialConversion = async (
  userId: string,
  paymentMethodId: string
): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payment/confirm-trial-conversion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        paymentMethodId
      })
    });

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const checkTrialStatus = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('trial_ends_at, subscription_status')
    .eq('id', userId)
    .single();

  if (data?.trial_ends_at) {
    const trialEnds = new Date(data.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isTrialActive: now < trialEnds && data.subscription_status === 'trial',
      daysLeft: Math.max(0, daysLeft),
      trialEndsAt: trialEnds
    };
  }

  return { isTrialActive: false, daysLeft: 0 };
};
```

---

## 6. Trial Expiry Job (Server-Side Cron)

You need a background job to convert trials to paid when they expire:

```typescript
// Server: Runs every hour
import cron from 'node-cron';

// Every hour at minute 0
cron.schedule('0 * * * *', async () => {
  try {
    // Find all trials that have ended
    const { data: expiredTrials } = await supabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('subscription_status', 'trial')
      .lt('trial_ends_at', new Date().toISOString());

    for (const user of expiredTrials || []) {
      // Create subscription for this customer
      const subscription = await stripe.subscriptions.create({
        customer: user.stripe_customer_id,
        items: [{
          price: process.env.STRIPE_WEEKLY_PRICE_ID
        }]
      });

      // Update Supabase
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          stripe_subscription_id: subscription.id,
          subscription_expires_at: new Date(subscription.current_period_end * 1000)
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Trial conversion cron error:', error);
  }
});
```

---

## 7. Environment Variables Needed

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx (or pk_live_xxxxx for production)
STRIPE_SECRET_KEY=sk_test_xxxxx (or sk_live_xxxxx for production)
STRIPE_WEEKLY_PRICE_ID=price_xxxxx
STRIPE_LIFETIME_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Backend
BACKEND_URL=http://localhost:3000 (or your production URL)
DATABASE_URL=your-supabase-url
```

---

## 8. Testing the Flow

### Test Scenario 1: Start Free Trial
```
1. Open MobilePaywall
2. Click "START FREE TRIAL"
3. Check Supabase → profiles table:
   - subscription_status should be 'trial'
   - trial_ends_at should be ~7 days from now
4. Check Stripe Dashboard → Customers:
   - New customer should appear
```

### Test Scenario 2: Convert Trial to Paid
```
1. Manually update Supabase trial_ends_at to NOW
2. Run cron job (or wait 1 hour)
3. Check Supabase:
   - subscription_status should be 'active'
   - stripe_subscription_id should be set
4. Check Stripe:
   - Subscription should be created
   - Next invoice should be scheduled for 7 days later
```

### Test Scenario 3: Failed Payment
```
1. Use test card: 4000 0000 0000 0002
2. Try to purchase
3. Should see error
4. Webhook should update subscription_status to failed
```

---

## 9. Checklist for Full Implementation

- [ ] Create Stripe products & prices (get Price IDs)
- [ ] Update Supabase schema with trial columns
- [ ] Add environment variables to eas.json
- [ ] Implement backend create-intent endpoint
- [ ] Implement backend confirm endpoint
- [ ] Implement backend webhook handler
- [ ] Set up Stripe webhook (https://yourdomain.com/api/webhook/stripe)
- [ ] Create trial expiry cron job
- [ ] Test trial start → Supabase update
- [ ] Test trial conversion → subscription created
- [ ] Test payment failure flow
- [ ] Test webhook event handling
- [ ] Deploy backend
- [ ] Deploy app with MobilePaywall component

---

## Quick Start: What You Need From Stripe Right Now

1. **Log in to Stripe Dashboard**
2. **Go to Products & Prices**
3. **Create Product:**
   - Name: "Tones by Aysa - Weekly"
   - Description: "Weekly subscription with 7-day free trial"
4. **Add Price:**
   - Amount: 4.99 USD
   - Billing period: 7 days (then weekly recurring)
5. **Copy Price ID** → Add to .env
6. **Repeat for Lifetime product**
7. **Get Webhook Secret** → Settings → Webhooks → Add endpoint
8. **Share these with the backend team**

Once you have the Stripe Price IDs, the app is ready to go!
