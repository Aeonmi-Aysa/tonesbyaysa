# 🎯 QUICK REFERENCE - DO THIS NOW

## ⏱️ Time to Revenue: ~1.5 hours

```
Step 1: Get API Keys         [10 min] ← YOU ARE HERE
Step 2: Run SQL Migration    [2 min]
Step 3: Update .env.local    [3 min]
Step 4: Test Locally         [15 min]
Step 5: Build APK            [15 min]
                            ________
                TOTAL:      [45 min]

Then upload to Play Store & LIVE! 🚀
```

---

## 🔑 API KEYS YOU NEED

### Google OAuth Client ID
**Get it:** [Google Cloud Console](https://console.cloud.google.com)
- Create project "Tones by Aysa"
- Create OAuth 2.0 Web Client ID
- Add redirect: `http://localhost:19000`
- Copy Client ID
- **Paste as:** `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

**Time:** 10 minutes

### Facebook App ID  
**Get it:** [Facebook Developers](https://developers.facebook.com)
- Create App → Consumer → "Tones by Aysa"
- Add "Facebook Login" product
- Go Settings → Basic
- Copy App ID
- **Paste as:** `EXPO_PUBLIC_FACEBOOK_APP_ID`

**Time:** 10 minutes

---

## ✏️ Create .env.local

File location: Project root (same folder as package.json)

Content:
```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# Facebook OAuth
EXPO_PUBLIC_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
```

**That's it!** (Don't commit this file - it's in .gitignore)

---

## 🗄️ Run Supabase SQL

1. Go to [Supabase Dashboard](https://supabase.com)
2. **SQL Editor** → **New Query**
3. Copy-paste this SQL:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_provider TEXT,
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS facebook_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_trial_ends_at ON profiles(trial_ends_at) 
WHERE trial_ends_at IS NOT NULL;
```

4. Click **Run**
5. Should see: "Success"

**Time:** 2 minutes

---

## 🧪 Test Locally

```bash
npm start
```

Then in Expo Go:

### Test Google Sign-In
1. Tap "Sign In"
2. Tap "🔵 Continue with Google"
3. Login with Google
4. ✅ Should see main app
5. Check Supabase: Profile created with `auth_provider: 'google'`

### Test Facebook Sign-In
1. Tap "Sign Up"
2. Tap "f Continue with Facebook"
3. Login with Facebook
4. ✅ Should see main app
5. Check Supabase: Profile created with `auth_provider: 'facebook'`

### Test Paywall
1. Tap "Profile"
2. Tap "💳 Manage Subscription"
3. Tap "🎁 Unlock Premium"
4. ✅ MobilePaywall appears with 3 tiers
5. Tap "START FREE TRIAL"
6. ✅ Payment Sheet appears

**Time:** 15 minutes (if all works first try)

---

## 🚀 Build Final APK

```bash
npm install expo-auth-session expo-web-browser
eas build --platform android --profile production-apk --wait
```

Wait ~15 minutes. Then:

```
✅ Build successful!
📱 Download APK: https://expo.dev/artifacts/...
```

Download APK to your phone and test.

---

## 📋 Checklist

Before building:
- [ ] Google Client ID obtained
- [ ] Facebook App ID obtained
- [ ] .env.local created with both keys
- [ ] Supabase SQL migration run
- [ ] Local test passed (all auth methods work)
- [ ] Paywall appears correctly
- [ ] App doesn't crash on payment flow

After build:
- [ ] APK downloaded
- [ ] Installed on phone
- [ ] Google Sign-In works
- [ ] Facebook Sign-In works
- [ ] Paywall UI looks good
- [ ] Can tap buttons without crashing
- [ ] Trial system shows "Start Free Trial"

Then:
- [ ] Ready for Play Store upload!

---

## 🆘 Issues?

**Google login doesn't appear:**
- Check `.env.local` has correct `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- Restart Expo: Kill `npm start` and run again

**Facebook login doesn't appear:**
- Check `.env.local` has correct `EXPO_PUBLIC_FACEBOOK_APP_ID`
- Restart Expo

**Paywall doesn't show:**
- Check you're authenticated (signed in)
- Tap Profile → Manage Subscription

**Build fails:**
- Make sure you ran: `npm install expo-auth-session expo-web-browser`
- Clear cache: `npm start -- -c`

---

## 💰 What Happens Next

After Play Store launches:

**Day 1-7:**
- Users download
- Users sign in (Google/Facebook/Email)
- Users start 7-day trial
- Zero charges (only card registered)

**Day 7:**
- Your backend cron job runs
- Auto-charges $4.99 from stored cards
- Revenue starts flowing 💰

**Day 14+:**
- Weekly charges continue
- Users with lifetime purchases don't get charged again
- Revenue continues 💰💰💰

---

## 📞 Summary

**Status:** 95% done
**You do:** Get 2 API keys + run 3 commands
**Time:** ~45 minutes
**Result:** Live app making money 🚀

---

**Let me know when you have the keys and we're DONE! 🎉**
