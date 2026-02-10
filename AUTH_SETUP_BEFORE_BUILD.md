# ✅ Complete Setup Before Final APK Build

## 📋 Checklist (In Order)

### DONE ✅
- [x] MobilePaywall.tsx created (632 lines)
- [x] Trial system: Card required, not charged until day 7
- [x] Close button (X) added for Google Play compliance
- [x] ProfileScreen updated with subscription management
- [x] Supabase schema SQL provided
- [x] Google Sign-In integrated
- [x] Facebook Sign-In integrated

### TODO (Before APK Build)
- [ ] 1. Run Supabase SQL migration
- [ ] 2. Install required packages
- [ ] 3. Get Google & Facebook API keys
- [ ] 4. Update .env.local with keys
- [ ] 5. Test auth screens locally
- [ ] 6. Rebuild APK with all features

---

## 🔧 Step 1: Supabase SQL Migration

**SAFE TO RUN** - No dependencies on Google/Facebook keys.

### Instructions:
1. Open [Supabase Dashboard](https://supabase.com) → Your Project
2. Go to **SQL Editor** → **New Query**
3. Paste and run this SQL:

```sql
-- Add trial & Stripe tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_provider TEXT,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS facebook_id TEXT UNIQUE;

-- Create index for trial lookups (speeds up cron job)
CREATE INDEX IF NOT EXISTS idx_trial_ends_at ON profiles(trial_ends_at) 
WHERE trial_ends_at IS NOT NULL;
```

**Expected:** "Success - 9 rows"

---

## 📦 Step 2: Install Required Packages

These packages are needed for Google & Facebook auth:

```bash
npm install expo-auth-session expo-web-browser
npx expo install expo-auth-session expo-web-browser
```

These handle OAuth flow for both providers.

---

## 🔑 Step 3: Get API Keys

### Google OAuth
**Time:** 10 minutes

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Tones by Aysa"
3. Enable "Google+ API"
4. Create OAuth 2.0 Web Client credentials
5. Add redirect URIs:
   ```
   http://localhost:19000
   http://localhost:19001
   exp://localhost:19000
   ```
6. **Copy Client ID** → Will add to `.env.local`

### Facebook OAuth
**Time:** 10 minutes

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create App → "Consumer" type → Name: "Tones by Aysa"
3. Add "Facebook Login" product
4. Go to **Settings → Basic** and copy **App ID**
5. Go to **Products → Facebook Login → Settings**
6. Add OAuth Redirect URIs:
   ```
   http://localhost:19000
   http://localhost:19001
   ```
7. **Copy App ID** → Will add to `.env.local`

**Total time:** ~20 minutes for both

---

## 📝 Step 4: Update .env.local

Create file: `.env.local` (in project root, next to package.json)

Add these lines with YOUR keys:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_ID=283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei.apps.googleusercontent.com
GOOGLE_OAUTH_IOS_CLIENT_ID=283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei.apps.googleusercontent.com

# Facebook OAuth
EXPO_PUBLIC_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID_HERE

# Stripe (you already have these)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEEKLY_PRICE_ID=price_...
STRIPE_LIFETIME_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important:** 
- `.env.local` is already in `.gitignore` (won't be committed)
- Each developer gets their own `.env.local`
- Production values handled by EAS secrets

---

## ✅ Step 5: Test Locally

Before building for production:

```bash
npm start
```

Then:

1. **Sign In tab**
   - Try "🔵 Continue with Google"
   - Should open Google login
   - After login, user created in Supabase
   
2. **Sign Up tab**
   - Try "f Continue with Facebook"
   - Should open Facebook login
   - After login, user created with Facebook ID

3. **Check Supabase**
   - Go to SQL Editor
   - Run: `SELECT id, email, auth_provider FROM profiles ORDER BY created_at DESC LIMIT 5;`
   - Should see your test users with correct `auth_provider` values

---

## 🚀 Step 6: Rebuild APK

Once everything passes local testing:

```bash
eas build --platform android --profile production-apk --wait
```

This will include:
- ✅ MobilePaywall component
- ✅ Trial system (7 days free, then charges $4.99/week)
- ✅ Google Sign-In
- ✅ Facebook Sign-In
- ✅ Subscription management in Profile
- ✅ Close button on paywall
- ✅ ProfileScreen with upgrade banner
- ✅ All Supabase schema updates

**Build time:** ~15 minutes

**Output:** Download link for APK (ready for Play Store)

---

## 🎯 What Happens After Each Sign-In

### Google Sign-In ✅
```
User clicks "🔵 Continue with Google"
  ↓
Google login screen appears
  ↓
User logs in with Google account
  ↓
Supabase creates user (via auth trigger)
  ↓
Profile row created with:
  - auth_provider: 'google'
  - google_id: (their Google user ID)
  - full_name: (from Google profile)
  - avatar_url: (from Google profile)
  - subscription_tier: 'free'
  - trial_ends_at: (7 days from now)
  ↓
User redirected to main app
```

### Facebook Sign-In ✅
```
User clicks "f Continue with Facebook"
  ↓
Facebook login screen appears
  ↓
User logs in with Facebook account
  ↓
Supabase creates user (via auth trigger)
  ↓
Profile row created with:
  - auth_provider: 'facebook'
  - facebook_id: (their Facebook user ID)
  - full_name: (from Facebook profile)
  - avatar_url: (from Facebook profile)
  - subscription_tier: 'free'
  - trial_ends_at: (7 days from now)
  ↓
User redirected to main app
```

### Email/Password Sign-In ✅
```
User enters email & password
  ↓
Confirmation email sent
  ↓
User confirms email
  ↓
User can now sign in
```

---

## 📊 Timeline

| Task | Time | Status |
|------|------|--------|
| Run Supabase SQL | 2 min | Ready |
| Install packages | 2 min | Ready |
| Get Google key | 10 min | You |
| Get Facebook key | 10 min | You |
| Update .env.local | 3 min | You |
| Test locally | 10 min | You |
| **Rebuild APK** | 15 min | After tests pass |
| **TOTAL** | **52 min** | |

---

## ❓ FAQ

**Q: Do users need to set a password if they use Google/Facebook?**
A: No! If they sign in with social auth, they have an account. They can optionally set a password later in profile settings (feature can be added if needed).

**Q: What if a user signs in with Google first, then Facebook?**
A: Each creates separate accounts (unless you implement account linking, which we haven't). For MVP, this is fine.

**Q: Will this work on iOS?**
A: Google needs iOS Client ID (already in code). Facebook will work. Android/iOS behave same way.

**Q: Can I test without building APK?**
A: Yes! `npm start` will work locally with all auth methods.

**Q: What about production - will keys stay secret?**
A: Yes. Add keys to EAS secrets (separate from .env.local).

---

## 🔐 Security Checklist

- [ ] `.env.local` is in `.gitignore` (won't push to GitHub)
- [ ] Never commit `.env.local`
- [ ] Google Client ID is Web application (not Android/iOS)
- [ ] Facebook App Secret never shared in code (only on backend)
- [ ] Redirect URIs configured in Google & Facebook dashboards
- [ ] Test with test accounts (not personal accounts)

---

## Next Steps

1. **Now:** Run Supabase SQL (copy-paste takes 2 min)
2. **Get keys:** Google (10 min) + Facebook (10 min)
3. **Update .env.local:** Add your keys (3 min)
4. **Test locally:** `npm start` and try all auth methods (10 min)
5. **When ready:** Build final APK

**After build:** App ready for Play Store submission! 🎉
