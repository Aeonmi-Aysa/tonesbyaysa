# 🔐 Environment Variables Setup Guide

## Required Environment Variables

### 1. RevenueCat API Key
**File:** RevenueCat Dashboard → Settings → API Keys → Public Key

```env
REVENUECAT_API_KEY=pk_prod_XXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANT**: Use the **PUBLIC** key (pk_prod_*), NOT the secret key

**Where to find it:**
1. Log in to https://app.revenuecat.com
2. Click your account → Settings → API Keys
3. Copy the "Public App Specific API Key" (starts with `pk_`)

---

### 2. Google OAuth Credentials

**File:** Google Cloud Console → Credentials

#### 2a. Web Client ID
```env
GOOGLE_OAUTH_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

**Where to find it:**
1. Go to https://console.cloud.google.com
2. Select your project
3. Go to Credentials
4. Find "OAuth 2.0 Client IDs" → Web Client
5. Copy the Client ID

#### 2b. Android Client ID  
```env
GOOGLE_OAUTH_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

**Where to find it:**
1. In Google Cloud Console Credentials
2. Find "OAuth 2.0 Client IDs" → Android Client
3. Copy the Client ID

**Note:** You need to add your app's SHA-1 fingerprint:
```bash
# Get your SHA-1 fingerprint
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Then add this fingerprint to the Android OAuth credentials in Google Cloud Console.

#### 2c. iOS Client ID
```env
GOOGLE_OAUTH_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
```

**Where to find it:**
1. In Google Cloud Console Credentials
2. Find "OAuth 2.0 Client IDs" → iOS Client
3. Copy the Client ID

**Note:** You need to configure your iOS app's bundle ID in the credentials.

---

### 3. Stripe Publishable Key

**File:** Stripe Dashboard → Developers → API Keys

```env
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXX
```

⚠️ **IMPORTANT**: Use the **LIVE** key for production, **TEST** key for development

**Where to find it:**
1. Go to https://dashboard.stripe.com
2. Click Developers (or Settings → API Keys)
3. Copy the "Publishable Key"

**For Development:**
- Use the "Test mode" publishable key (starts with `pk_test_`)

**For Production:**
- Use the "Live mode" publishable key (starts with `pk_live_`)

---

### 4. Supabase Credentials

**File:** Supabase Dashboard → Project Settings → API

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**Where to find it:**
1. Go to https://app.supabase.com
2. Select your project
3. Click Settings → API
4. Copy the "Project URL" and "anon public" key

---

### 5. Optional: Railway API Base

```env
RAILWAY_API_BASE=https://your-api.railway.app
```

Only needed if you have a custom backend API.

---

## Complete .env File Template

```env
# RevenueCat (Required)
REVENUECAT_API_KEY=pk_prod_XXXXXXXXXXXXXXXXXXXXX

# Google OAuth (Required for Google Sign-In)
GOOGLE_OAUTH_WEB_CLIENT_ID=XXXXXXXXXXXXX.apps.googleusercontent.com
GOOGLE_OAUTH_ANDROID_CLIENT_ID=XXXXXXXXXXXXX.apps.googleusercontent.com
GOOGLE_OAUTH_IOS_CLIENT_ID=XXXXXXXXXXXXX.apps.googleusercontent.com

# Stripe (Required for payments)
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXX

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Optional
RAILWAY_API_BASE=https://your-api.railway.app
```

---

## Configuration Checklist

### RevenueCat Setup
- [ ] RevenueCat account created
- [ ] Stripe connected to RevenueCat
- [ ] Products created:
  - [ ] `aysa_weekly_subscription` (Weekly, $4.99/week)
  - [ ] `aysa_lifetime_access` (Lifetime, $69.99 one-time)
- [ ] Entitlements created:
  - [ ] `Aysa Pro` (Weekly tier entitlement)
  - [ ] `Aysa Lifetime` (Lifetime tier entitlement)
- [ ] Products linked to entitlements
- [ ] API key copied to .env

### Google Cloud Setup
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created (Web)
- [ ] OAuth 2.0 credentials created (Android)
  - [ ] Package name: `com.aysa.tones`
  - [ ] SHA-1 fingerprint added
- [ ] OAuth 2.0 credentials created (iOS)
  - [ ] Bundle ID configured
- [ ] All 3 client IDs copied to .env

### Stripe Setup
- [ ] Stripe account created
- [ ] 2 products created:
  - [ ] Weekly subscription
  - [ ] Lifetime purchase
- [ ] Publishable key copied to .env
- [ ] Webhooks configured for:
  - [ ] `invoice.payment_succeeded`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`

### Supabase Setup
- [ ] Supabase project created
- [ ] Auth enabled (Supabase Auth)
- [ ] Google provider enabled in Auth settings
- [ ] Profiles table created with columns:
  - [ ] `id` (uuid, primary key)
  - [ ] `email` (text)
  - [ ] `full_name` (text)
  - [ ] `subscription_tier` (text: 'free', 'weekly', 'lifetime')
  - [ ] `subscription_status` (text: 'active', 'inactive')
  - [ ] `avatar_url` (text)
  - [ ] `created_at` (timestamp)
- [ ] RLS policies configured
- [ ] Project URL and anon key copied to .env

---

## Testing the Configuration

### 1. Check RevenueCat
```bash
# In app logs, you should see:
# [RevenueCat] ✅ Initialized successfully
# [RevenueCat] ✅ Offerings fetched successfully
```

### 2. Check Google Sign-In
```bash
# In app logs, you should see:
# [GoogleAuth] ✅ Google Sign-In initialized
# (after sign-in attempt)
# [GoogleAuth] ✅ Google sign-in successful
```

### 3. Check Stripe Integration
1. Open Paywall/Pricing screen
2. Should see Weekly and Lifetime options
3. Try a test purchase
4. Check Stripe Dashboard → Payments for transaction

---

## Troubleshooting

### Missing environment variable errors
**Problem:** App crashes or shows "undefined" values
**Solution:** 
1. Double-check all variables in .env
2. Restart the development server: `expo start --clear`
3. Verify formatting: no spaces around `=`

### RevenueCat shows "No packages available"
**Problem:** Products not loading
**Solution:**
1. Verify API key is correct
2. Check RevenueCat Dashboard → Products
3. Verify products are linked to Stripe products
4. Check app bundle ID matches RevenueCat configuration

### Google Sign-In shows blank screen
**Problem:** Google Sign-In not initializing
**Solution:**
1. Verify all 3 Google OAuth IDs are in .env
2. For Android: Verify package name and SHA-1 in Google Cloud
3. For iOS: Verify bundle ID in Google Cloud
4. Check Google Cloud OAuth consent screen is configured

### Stripe charges not going through
**Problem:** Purchase fails at Stripe
**Solution:**
1. Verify Stripe publishable key is correct (pk_live_ for prod)
2. Check Stripe Dashboard → Developers → Webhooks for failures
3. Verify Stripe products are linked in RevenueCat
4. Check Stripe test mode (for development)

---

## Security Notes

- ✅ Publishable keys (pk_*) are safe to commit to git
- ❌ Secret keys (sk_*) should NEVER be in .env files
- ❌ API keys should NEVER be hardcoded in app code
- ✅ Always use `.env` files and `.gitignore`
- ✅ Rotate keys periodically in production
- ✅ Use different keys for dev/staging/production environments

---

## Environment-Specific Keys

### Development
- Use Stripe TEST keys (pk_test_*)
- Use Google Cloud project credentials
- Can use same RevenueCat sandbox environment

### Staging
- Use Stripe TEST keys still
- Separate RevenueCat offering
- Same Google Cloud project or separate

### Production
- Use Stripe LIVE keys (pk_live_*)
- Use RevenueCat production offerings
- Separate Google Cloud OAuth credentials

---

## Quick Setup Checklist

- [ ] RevenueCat account + API key → REVENUECAT_API_KEY
- [ ] Google Cloud project + 3 OAuth IDs → GOOGLE_OAUTH_*_CLIENT_ID
- [ ] Stripe account + publishable key → STRIPE_PUBLISHABLE_KEY  
- [ ] Supabase project + credentials → SUPABASE_URL + SUPABASE_ANON_KEY
- [ ] All variables in .env file
- [ ] .env added to .gitignore
- [ ] App restarted with `expo start --clear`
- [ ] Console logs show ✅ initialization messages

That's it! You're ready to test the payment flow. 🎉
