# 📋 Stripe Setup Checklist - Get These Values NOW

Complete this checklist to get everything you need for the payment system to work.

---

## ✅ Step 1: Stripe Account
- [ ] Create/login to Stripe account at https://dashboard.stripe.com
- [ ] Navigate to API Keys section
- [ ] Copy **Publishable Key** (starts with `pk_`)
  - **Test**: `pk_test_xxxxx`
  - **Live**: `pk_live_xxxxx` (for production)

---

## ✅ Step 2: Stripe Secret Key
- [ ] In Stripe Dashboard → Settings → API Keys
- [ ] Copy **Secret Key** (starts with `sk_`)
  - **IMPORTANT**: Never share this key!
  - **Test**: `sk_test_xxxxx`
  - **Live**: `sk_live_xxxxx` (for production)

---

## ✅ Step 3: Create Products & Get Price IDs

### Weekly Subscription Product
1. Go to: https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Tones by Aysa - Weekly`
   - **Description**: `Weekly subscription with 7-day free trial`
   - **Billing**: Recurring
4. Click **"Create product"**
5. Go to **"Pricing"** section
6. Click **"+ Add price"**
7. Set pricing:
   - **Amount**: `4.99`
   - **Currency**: `USD`
   - **Billing period**: `Every 7 days` (custom - for trial)
   - **Recurring**: `Weekly (7 days)` ← This determines trial length
8. **COPY PRICE ID** → Looks like `price_1FfRcF...`
   - Save as: `STRIPE_WEEKLY_PRICE_ID`

### Lifetime Purchase Product
1. Go to: https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Tones by Aysa - Lifetime`
   - **Description**: `One-time lifetime access to all frequencies`
   - **Billing**: One-time
4. Click **"Create product"**
5. Go to **"Pricing"** section
6. Click **"+ Add price"**
7. Set pricing:
   - **Amount**: `69.99`
   - **Currency**: `USD`
   - **Billing**: One-time purchase
8. **COPY PRICE ID** → Looks like `price_2GgSdG...`
   - Save as: `STRIPE_LIFETIME_PRICE_ID`

---

## ✅ Step 4: Stripe Webhook Secret

### Create Webhook Endpoint
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. **Endpoint URL**: `https://yourbackend.com/api/webhook/stripe`
   - Replace `yourbackend.com` with your actual backend domain
4. **Select events to listen to**:
   - [ ] `invoice.payment_succeeded`
   - [ ] `invoice.payment_failed`
   - [ ] `customer.subscription.updated`
   - [ ] `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. You'll see a **Webhook signing secret** (starts with `whsec_`)
7. **COPY THIS** → Save as: `STRIPE_WEBHOOK_SECRET`
   - **WARNING**: This is also secret - don't commit to git!

---

## ✅ Step 5: Environment Variables

Create `.env.local` file in project root:

```env
# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe Product Price IDs
STRIPE_WEEKLY_PRICE_ID=price_xxxxx
STRIPE_LIFETIME_PRICE_ID=price_xxxxx

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Backend URL
BACKEND_URL=http://localhost:3000
RAILWAY_API_BASE=your-railway-url (if using Railway)
```

---

## ✅ Step 6: Add to eas.json Production

Update `eas.json` production environment:

```json
{
  "build": {
    "production": {
      "env": {
        "STRIPE_PUBLISHABLE_KEY": "pk_test_xxxxx",
        "STRIPE_WEEKLY_PRICE_ID": "price_xxxxx",
        "STRIPE_LIFETIME_PRICE_ID": "price_xxxxx"
      }
    }
  }
}
```

---

## ✅ Step 7: Backend Configuration

Give backend team these values:
1. `STRIPE_SECRET_KEY`
2. `STRIPE_WEBHOOK_SECRET`
3. `STRIPE_WEEKLY_PRICE_ID`
4. `STRIPE_LIFETIME_PRICE_ID`
5. Your webhook endpoint URL (for step 4 above)

---

## ✅ Step 8: Test Mode vs Live Mode

### During Development (Use TEST Keys)
- Keys start with `pk_test_` and `sk_test_`
- Use test credit cards:
  - **Success**: `4242 4242 4242 4242`
  - **Decline**: `4000 0000 0000 0002`
  - Any future date for expiry
  - Any CVC

### For Production (Use LIVE Keys)
- Keys start with `pk_live_` and `sk_live_`
- **WARNING**: Real money will be charged!
- Only use after testing thoroughly
- Requires Stripe account verification

---

## ✅ Step 9: Verify Setup

Run these checks:

```bash
# Test if keys are valid
curl https://api.stripe.com/v1/account \
  -u sk_test_YOUR_KEY:

# Should return your account info (not an error)
```

---

## 🎯 Summary: What You Need to Provide Me

Provide these 5 values to complete integration:

1. **`STRIPE_PUBLISHABLE_KEY`** = `pk_test_...`
2. **`STRIPE_WEEKLY_PRICE_ID`** = `price_...` (from Step 3a)
3. **`STRIPE_LIFETIME_PRICE_ID`** = `price_...` (from Step 3b)
4. **`STRIPE_SECRET_KEY`** = `sk_test_...` (KEEP SECRET!)
5. **`STRIPE_WEBHOOK_SECRET`** = `whsec_...` (KEEP SECRET!)

---

## ⚠️ Security Notes

**DO NOT:**
- Commit secret keys to Git
- Share `sk_test_` or `sk_live_` keys
- Share `whsec_` webhook secret
- Use live keys before testing with test mode

**DO:**
- Store secret keys in environment variables
- Use test keys during development
- Test payment flow completely before going live
- Rotate webhook secrets periodically

---

## 🚀 Next Steps After Setup

Once you have these values:
1. Update `.env.local` with all 5 values
2. Update `eas.json` with public keys
3. Give backend team the secret keys
4. Backend implements webhook handler
5. Test trial flow: Start trial → Check Supabase
6. Test paid flow: Complete payment → Check Supabase
7. Deploy to production

---

## 📞 Need Help?

If any step doesn't match the current Stripe UI:
1. Stripe updates their dashboard frequently
2. Go to https://support.stripe.com for latest docs
3. Look for "Products" or "Recurring Billing"
4. The 5 values above are what you always need

---

## ✅ Completion Checklist

When you've completed everything above:
- [ ] All 5 Stripe values copied and saved
- [ ] `.env.local` updated with all values
- [ ] Backend team has secret keys
- [ ] Webhook endpoint created
- [ ] eas.json production env updated
- [ ] Test mode verified with test card
- [ ] Ready to integrate into app!

Once ALL checked ✅, reply with the 5 values and I'll:
1. Verify they're correct
2. Complete the Stripe integration
3. Update all config files
4. Test the payment flow
5. You'll be ready to build & deploy!
