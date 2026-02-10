# Google & Facebook Authentication Setup

## Environment Variables Needed

Create/update your `.env.local` file with these values:

```env
# Google OAuth - Get from Google Cloud Console
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_WEB_CLIENT_ID=283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei.apps.googleusercontent.com
GOOGLE_OAUTH_IOS_CLIENT_ID=283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei.apps.googleusercontent.com

# Facebook OAuth - Get from Facebook Developer Portal
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

---

## Google Sign-In Setup

### Step 1: Get Your Google OAuth Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing: "Tones by Aysa"
3. Enable "Google+ API" (search in APIs)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add Authorized redirect URIs:
   - `http://localhost:19000`
   - `http://localhost:19001`
   - `exp://localhost:19000`
   - Your production Expo URI (e.g., `exp://abc123xyz.exp.direct`)
7. **Copy "Client ID"** → Paste as `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

### Step 2: For Android (already configured in your code)

Already set in LoginScreen.tsx:
- `GOOGLE_OAUTH_WEB_CLIENT_ID=283475830868-...` (already there)
- `GOOGLE_OAUTH_IOS_CLIENT_ID=283475830868-...` (already there)

**Note:** These are YOUR existing credentials from your Google Cloud setup.

### Step 3: Test Google Sign-In

1. Update `.env.local` with your `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
2. Run app: `npm start`
3. Tap "Sign In" tab
4. Tap "🔵 Continue with Google"
5. Should see Google login screen
6. After login, user profile created in Supabase

---

## Facebook Sign-In Setup

### Step 1: Get Your Facebook App ID

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create App → Choose "Consumer" type
3. App name: "Tones by Aysa"
4. Add "Facebook Login" product
5. In Settings → Basic, copy your **App ID**
6. Paste as `EXPO_PUBLIC_FACEBOOK_APP_ID`

### Step 2: Configure OAuth URLs

1. Go to **Settings → Basic**
2. Under "App Domains", add:
   - `localhost`
   - Your production domain (if any)
3. Go to **Products → Facebook Login → Settings**
4. Under "Valid OAuth Redirect URIs", add:
   - `https://auth.expo.io/@yourexpouser/yourappname`
   - `http://localhost:19000`
   - `http://localhost:19001`
5. Save

### Step 3: Get App Secret (for backend)

1. Go to **Settings → Basic**
2. Copy **App Secret** (keep this private!)
3. Share with backend team for webhook verification

### Step 4: Test Facebook Sign-In

1. Update `.env.local` with your `EXPO_PUBLIC_FACEBOOK_APP_ID`
2. Run app: `npm start`
3. Tap "Sign Up" tab (or "Sign In")
4. Tap "f Continue with Facebook"
5. Should see Facebook login screen
6. After login, user profile created in Supabase

---

## What Happens After Sign-In/Sign-Up

### With Google/Facebook:
✅ Supabase creates user account
✅ User profile created in `profiles` table with:
   - `auth_provider`: 'google' or 'facebook'
   - `google_id` or `facebook_id`: OAuth provider's user ID
   - `subscription_tier`: 'free' (they can start 7-day trial)
   - `trial_started_at` & `trial_ends_at`: Set automatically
   - `full_name` & `avatar_url`: Pulled from their OAuth profile

### With Email/Password:
✅ Same as above but:
   - `auth_provider`: 'email'
   - Email confirmation required before sign-in works

---

## Testing Credentials (For Development)

### Google Test Account
- Create a Gmail account specifically for testing
- Use it to sign in during development

### Facebook Test Account
- In Facebook Developer Portal → Roles → Test Users
- Create test user
- Use to sign in during development

**Important:** Don't use real personal accounts in development to avoid polluting production data.

---

## Troubleshooting

### Google Sign-In Shows "Configuration Error"
- Check `GOOGLE_OAUTH_WEB_CLIENT_ID` in `.env.local`
- Make sure it's your actual Web Client ID (not Android/iOS)
- Restart Expo: `npm start` (clear cache if needed)

### Facebook Sign-In Shows "App Not Set Up"
- Check `EXPO_PUBLIC_FACEBOOK_APP_ID` in `.env.local`
- Verify you added correct OAuth redirect URIs in Facebook dashboard
- Check that Facebook Login product is added to app

### Profile Not Created After Sign-In
- Check Supabase Auth Triggers exist
- Should auto-create profile row in `profiles` table
- If missing, run migration SQL in SUPABASE_DETAILED_SETUP.txt

### Email Confirmation Not Arriving
- Check Supabase project settings → Auth → Email Templates
- Might be marked as spam
- In development, disable email confirmation: Auth → Providers → Email → Disable Email Confirmation (dev only!)

---

## Security Notes

🔒 **NEVER** share your Facebook App Secret
🔒 **NEVER** commit `.env.local` to Git (add to `.gitignore`)
🔒 Keep `GOOGLE_OAUTH_WEB_CLIENT_ID` private in production
🔒 Use environment variable encryption in EAS build

---

## Your Values (Fill In)

Once you collect the values, save them here temporarily:

```
EXPO_PUBLIC_GOOGLE_CLIENT_ID = ___________________
EXPO_PUBLIC_FACEBOOK_APP_ID = ___________________
Facebook App Secret (for backend) = ___________________
```

Then add to `.env.local` and we're ready to rebuild!
