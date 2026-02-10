# 📋 Stripe Values Integration Guide

**Once you get the 5 Stripe values from the setup checklist**, follow this step-by-step to integrate them.

---

## Your 5 Stripe Values

You will collect these:

```
1. STRIPE_PUBLISHABLE_KEY = pk_test_... (or pk_live_...)
2. STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)
3. STRIPE_WEEKLY_PRICE_ID = price_...
4. STRIPE_LIFETIME_PRICE_ID = price_...
5. STRIPE_WEBHOOK_SECRET = whsec_...
```

---

## Step-by-Step Integration

### Step 1: Update `.env.local` (Development)

Create or edit: `c:\Users\wlwil\Desktop\healtoneapp\.env.local`

```env
# Stripe API Keys (from Stripe Dashboard → Settings → API Keys)
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe Product Price IDs (from Stripe Dashboard → Products)
STRIPE_WEEKLY_PRICE_ID=price_xxxxx
STRIPE_LIFETIME_PRICE_ID=price_xxxxx

# Stripe Webhook Secret (from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Backend URLs
BACKEND_URL=http://localhost:3000
RAILWAY_API_BASE=https://your-backend-url.railway.app
```

### Step 2: Update `eas.json` (Production Build)

Edit: `c:\Users\wlwil\Desktop\healtoneapp\eas.json`

Find the `"production"` section and update:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "credentialsSource": "remote",
        "image": "latest"
      },
      "env": {
        "SUPABASE_URL": "https://qdnijmpcedgrpalnlojp.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmlqbXBjZWRncnBhbG5sb2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MTE2NDgsImV4cCI6MjA4NDI4NzY0OH0.3MXwffoZRvDBGLUCBrKSfy0F-O5ZCtMk-tSWyvFMpNo",
        "STRIPE_PUBLISHABLE_KEY": "pk_test_xxxxx",
        "STRIPE_WEEKLY_PRICE_ID": "price_xxxxx",
        "STRIPE_LIFETIME_PRICE_ID": "price_xxxxx",
        "REVENUECAT_API_KEY": "test_xfJvKnRDVTgVmDEERjBYTnOZExW",
        "REVENUECAT_APP_ID": "app3d2f00b322"
      }
    }
  }
}
```

### Step 3: Give Backend Team Secret Keys

**Send to backend team** (NOT in Git, send securely):
- `STRIPE_SECRET_KEY` = `sk_test_xxxxx`
- `STRIPE_WEBHOOK_SECRET` = `whsec_xxxxx`
- `STRIPE_WEEKLY_PRICE_ID` = `price_xxxxx`
- `STRIPE_LIFETIME_PRICE_ID` = `price_xxxxx`
- Webhook endpoint URL: `https://your-backend.com/api/webhook/stripe`

Backend team adds to their `.env`:
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_WEEKLY_PRICE_ID=price_xxxxx
STRIPE_LIFETIME_PRICE_ID=price_xxxxx
```

### Step 4: Verify Keys Are Loaded

Test in your app by adding temporary console.log:

```tsx
// In MobilePaywall.tsx, add at top of component
useEffect(() => {
  console.log('Stripe Key loaded:', process.env.STRIPE_PUBLISHABLE_KEY ? 'YES ✅' : 'NO ❌');
  console.log('Weekly Price ID:', process.env.STRIPE_WEEKLY_PRICE_ID ? 'YES ✅' : 'NO ❌');
  console.log('Lifetime Price ID:', process.env.STRIPE_LIFETIME_PRICE_ID ? 'YES ✅' : 'NO ❌');
}, []);
```

Run locally:
```bash
npx expo start
# Check console output - should show all YES ✅
```

### Step 5: Test Payment Flow (Local)

```bash
# Start Expo
npx expo start

# Open app on device/emulator

# Test Trial
1. Tap "START FREE TRIAL"
2. Should see success toast
3. Check Supabase → profiles table
   - subscription_status should be 'trial'
   - trial_ends_at should be ~7 days from now

# Test Weekly
1. Tap "SUBSCRIBE WEEKLY"
2. Stripe Payment Sheet appears
3. Use test card: 4242 4242 4242 4242
4. Any future date (e.g., 12/25)
5. Any CVC (e.g., 123)
6. Should see success
7. Check Supabase → subscription_status = 'active'

# Test Error
1. Use decline card: 4000 0000 0000 0002
2. Should see error alert
3. No Supabase update
```

### Step 6: Build Production APK

```bash
# Build with EAS
eas build --platform android --profile production-apk --wait

# When complete, download APK and install on device
```

### Step 7: Production Configuration (When Live)

**DO THIS ONLY WHEN FULLY TESTED:**

1. Get live Stripe keys:
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_xxxxx` (note: `live` not `test`)
   - `STRIPE_SECRET_KEY` = `sk_live_xxxxx` (note: `live` not `test`)

2. Update `.env.local`:
   ```env
   STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   # Price IDs stay the same, just different tier IDs
   STRIPE_WEEKLY_PRICE_ID=price_live_xxxxx
   STRIPE_LIFETIME_PRICE_ID=price_live_xxxxx
   ```

3. Update `eas.json` production section with live keys

4. Update backend `.env` with live secret key

5. Create new Stripe webhook for production

6. Rebuild and deploy:
   ```bash
   eas build --platform android --profile production-apk
   ```

---

## Quick Reference: Where Each Value Goes

| Value | Dev Location | Prod Location | Used By |
|-------|--------------|---------------|---------|
| `STRIPE_PUBLISHABLE_KEY` | `.env.local` | `eas.json` | App (public) |
| `STRIPE_SECRET_KEY` | Backend `.env` | Backend `.env` | Backend ONLY |
| `STRIPE_WEEKLY_PRICE_ID` | `.env.local` | `eas.json` | App (public) |
| `STRIPE_LIFETIME_PRICE_ID` | `.env.local` | `eas.json` | App (public) |
| `STRIPE_WEBHOOK_SECRET` | Backend `.env` | Backend `.env` | Backend webhook handler |

---

## Troubleshooting

### Values not loading?

1. Check `.env.local` exists in project root
2. Restart Expo: `npx expo start` (full restart)
3. Clear Expo cache: `npx expo start -c`
4. Verify no typos in key names
5. Try printing to console:
   ```tsx
   console.log('PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY);
   ```

### Payment Sheet not appearing?

1. Verify `STRIPE_PUBLISHABLE_KEY` is set
2. Check backend can be reached:
   ```bash
   curl https://your-backend.com/api/health
   ```
3. Check network request in console
4. Verify price ID matches Stripe Dashboard

### Test mode not working?

1. Make sure you're using `pk_test_` key (not `pk_live_`)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC (e.g., 123)

### Production charging real money?

1. Double-check keys are still `sk_test_` (not `sk_live_`)
2. You're still in Stripe test mode
3. Real charges only with `pk_live_` keys

---

## Checklist: Stripe Values Integration

- [ ] Collected all 5 Stripe values
- [ ] Added to `.env.local` (development)
- [ ] Updated `eas.json` (production)
- [ ] Gave secret keys to backend team (securely)
- [ ] Verified keys load in app (console.log)
- [ ] Tested trial flow (→ Supabase updated)
- [ ] Tested weekly flow (test card accepted)
- [ ] Tested error flow (decline card rejected)
- [ ] Tested lifetime flow (one-time charge)
- [ ] Backend team tested endpoints
- [ ] Ready to build production APK

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Commit `.env.local` to Git (contains secret keys!)
- Use `pk_live_` keys during development
- Share `sk_test_` or `sk_live_` keys publicly
- Copy-paste wrong value for wrong field
- Use test card 4242... in production

✅ **DO:**
- Store secret keys in `.env.local` (add to `.gitignore`)
- Use `pk_test_` during development
- Share secret keys only with backend team (securely)
- Double-check each value before pasting
- Use real card only in live mode

---

## Next: Backend Setup

Once you've added all values and tested locally:

1. Backend team implements `/api/payment/create-intent`
2. Backend team implements `/api/payment/confirm`
3. Backend team implements `/api/webhook/stripe`

See: `TRIAL_TO_PAID_CONVERSION_GUIDE.md` for code examples

---

## You're Ready! 🎉

Once all values are integrated and tested:
1. Build production APK
2. Submit to Play Store
3. Monitor first transactions
4. Watch revenue come in! 💰

Good luck! 🚀
