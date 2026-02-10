# SYSTEM ARCHITECTURE & INTEGRATION MAP

## APPLICATION FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                      APP.TSX (ROOT)                     │
│  ├─ ErrorBoundary (Catches all errors)                 │
│  ├─ useAuthBootstrap (Session recovery)                │
│  ├─ useStoreHydration (AsyncStorage load)              │
│  └─ DeepLinking (Route handling)                        │
└─────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │    Has Active Session?               │
        └──────────────────────────────────────┘
         ↙                                    ↘
    ✅ YES                                    ❌ NO
        ↓                                      ↓
   ┌─────────────┐               ┌──────────────────────┐
   │ MAIN TABS   │               │  LOGIN SCREEN        │
   │ (Dashboard) │               │  ├─ Sign In Tab      │
   └─────────────┘               │  │  (Email/Google)   │
        ↓                        │  ├─ Sign Up Tab      │
   ┌─────────────────────────┐  │  │  (Email/Google)   │
   │ Dashboard Features:     │  │  └─ Auth Logic       │
   │ ├─ Browse Frequencies   │  └──────────────────────┘
   │ ├─ View Available Baths │           ↓
   │ ├─ Check Tier/Features  │  ┌──────────────────────┐
   │ └─ "Upgrade" Button     │  │  SUPABASE AUTH       │
   └─────────────────────────┘  │  ├─ SignUp           │
        ↓                        │  ├─ SignIn           │
   ┌─────────────────────────┐  │  └─ Google OAuth     │
   │ Premium Features Locked?│  └──────────────────────┘
   │ ├─ Free: 60 freqs      │           ↓
   │ ├─ Weekly: 500 freqs   │  ┌──────────────────────┐
   │ ├─ Lifetime: All freqs │  │ PROFILE CREATION     │
   └─────────────────────────┘  │ ├─ Auto from signup  │
        ↓                        │ ├─ Auto from Google  │
   ┌─────────────────────────┐  │ └─ Stored in Supabase
   │ Tap "Upgrade" Button    │  └──────────────────────┘
   └─────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │   PRICING SCREEN             │
   │   ├─ Free (locked)           │
   │   ├─ Weekly ($4.99/wk)       │
   │   └─ Lifetime ($69.99)       │
   └──────────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │   REVENUECAT PAYMENT         │
   │   ├─ Get offerings           │
   │   ├─ Process purchase        │
   │   ├─ Check entitlements      │
   │   └─ Update profile          │
   └──────────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │   STRIPE PROCESSING          │
   │   (Behind RevenueCat)        │
   │   ├─ Weekly charge           │
   │   ├─ Lifetime one-time       │
   │   └─ Subscription mgmt       │
   └──────────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │   PROFILE UPDATE             │
   │   ├─ Set tier: weekly        │
   │   ├─ Persist in store        │
   │   └─ Update Supabase         │
   └──────────────────────────────┘
        ↓
   ┌──────────────────────────────┐
   │   FEATURE UNLOCK             │
   │   ├─ 500+ frequencies now    │
   │   │   available              │
   │   ├─ Composer enabled        │
   │   ├─ Custom baths enabled    │
   │   └─ Manifestation unlocked  │
   └──────────────────────────────┘
```

---

## STATE MANAGEMENT ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│                    ZUSTAND STORES                        │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │ useSessionStore                     │                │
│  │ ├─ session: Session | null          │                │
│  │ ├─ profile: Profile | null          │                │
│  │ ├─ setSession()                     │                │
│  │ └─ setProfile()                     │                │
│  │                                     │                │
│  │ Persisted via AsyncStorage          │                │
│  │ Hydrated on app startup             │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │ useThemeStore                       │                │
│  │ ├─ isDark: boolean                  │                │
│  │ ├─ colors: ColorScheme              │                │
│  │ └─ toggleTheme()                    │                │
│  │                                     │                │
│  │ Persisted via AsyncStorage          │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │ useFavoritesStore                   │                │
│  │ ├─ favorites: Favorite[]            │                │
│  │ ├─ addFavorite()                    │                │
│  │ ├─ removeFavorite()                 │                │
│  │ └─ isFavorite()                     │                │
│  │                                     │                │
│  │ Persisted via AsyncStorage          │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │ useJournalStore                     │                │
│  │ ├─ entries: JournalEntry[]          │                │
│  │ ├─ addEntry()                       │                │
│  │ └─ getEntries()                     │                │
│  │                                     │                │
│  │ Persisted via AsyncStorage          │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │ useRemindersStore                   │                │
│  │ ├─ reminders: Reminder[]            │                │
│  │ ├─ addReminder()                    │                │
│  │ └─ scheduleReminder()               │                │
│  │                                     │                │
│  │ Persisted via AsyncStorage          │                │
│  └─────────────────────────────────────┘                │
│                                                          │
│  ┌─────────────────────────────────────┐                │
│  │ + 2 more stores (Offline, Community)│                │
│  │ All with AsyncStorage persistence   │                │
│  └─────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

---

## DATABASE SCHEMA (SUPABASE)

```
┌─────────────────────────────────────┐
│  auth.users (Supabase Auth)        │
│  ├─ id: UUID (PK)                  │
│  ├─ email: string (unique)         │
│  ├─ email_confirmed_at: timestamp  │
│  └─ created_at: timestamp          │
└─────────────────────────────────────┘
           ↓ (FK)
┌─────────────────────────────────────┐
│  public.profiles                    │
│  ├─ id: UUID (PK)                  │
│  ├─ email: string                  │
│  ├─ full_name: string              │
│  ├─ subscription_tier: enum        │
│  │  ├─ 'free'                      │
│  │  ├─ 'weekly'                    │
│  │  └─ 'lifetime'                  │
│  ├─ subscription_status: string    │
│  ├─ is_admin: boolean              │
│  ├─ avatar_url: string             │
│  ├─ created_at: timestamp          │
│  └─ updated_at: timestamp          │
└─────────────────────────────────────┘

Row Level Security (RLS):
  ✅ Users can only read own profile
  ✅ Users can update own profile
  ✅ Admins have elevated access
```

---

## PAYMENT INTEGRATION

```
┌──────────────┐         ┌──────────────┐
│   APP        │         │ REVENUECAT   │
│              │         │              │
│ Purchases.   │------→  │ getOfferings │
│ configure()  │         │ purchasePackage
│              │←────    │ getCustomerInfo
└──────────────┘         └──────────────┘
                               ↓
                        ┌──────────────┐
                        │   STRIPE     │
                        │              │
                        │ • Process CC │
                        │ • Create sub │
                        │ • Charge fee │
                        └──────────────┘
                               ↓
                        ┌──────────────┐
                        │ RevenueCat   │
                        │ Entitlements │
                        │              │
                        │ 'Aysa Pro'   │
                        │ 'Aysa        │
                        │  Lifetime'   │
                        └──────────────┘
                               ↓
                        ┌──────────────┐
                        │   APP        │
                        │              │
                        │ Check        │
                        │ entitlements │
                        │ Update tier  │
                        │ Unlock       │
                        │ features     │
                        └──────────────┘

Flow:
1. App calls Purchases.getOfferings()
2. RevenueCat returns available packages
3. App calls Purchases.purchasePackage(pkg)
4. Stripe processes payment
5. RevenueCat updates entitlements
6. App receives customerInfo
7. App checks entitlements active
8. App updates profile tier
9. Features unlock for user
```

---

## AUTHENTICATION FLOWS

### Email/Password Sign Up Flow

```
User Input
├─ Email
├─ Password (8+ chars)
├─ Confirm Password
└─ Full Name
   ↓
Validation
├─ All fields present? ✅
├─ Password ≥ 8 chars? ✅
└─ Passwords match? ✅
   ↓
Supabase.auth.signUp()
├─ Email: trimmed & lowercased
├─ Password: sent to auth
└─ Data: { full_name: string }
   ↓
Supabase
├─ Hash password (bcrypt)
├─ Store user in auth.users
├─ Create profile in profiles table
└─ Send verification email
   ↓
App Response
├─ Success: "Check your email"
├─ Error: Show Supabase error
└─ User sees Sign In tab
   ↓
User verifies email (external flow)
   ↓
User can now sign in
```

### Email/Password Sign In Flow

```
User Input
├─ Email
└─ Password
   ↓
Validation
├─ Email present? ✅
└─ Password present? ✅
   ↓
Supabase.auth.signInWithPassword()
├─ Email: trimmed & lowercased
└─ Password: sent to auth
   ↓
Supabase
├─ Look up user by email
├─ Compare password hash (bcrypt)
├─ Create session
└─ Return JWT tokens
   ↓
App (useAuthBootstrap)
├─ Session stored in AsyncStorage
├─ Fetch user profile
├─ Update useSessionStore
└─ Route to Dashboard
   ↓
User authenticated ✅
```

### Google OAuth Flow

```
User Taps "Google Sign-In"
   ↓
GoogleSignin.signIn()
   ↓
Google Auth Dialog
├─ User logs in with Google
├─ User grants scopes
│  ├─ profile
│  └─ email
└─ Returns: idToken + userInfo
   ↓
App
├─ Extract idToken
└─ Call Supabase.auth.signInWithIdToken()
   ↓
Supabase
├─ Verify idToken with Google
├─ Look up or create user
├─ Create session
├─ Create/update profile
└─ Return session
   ↓
App (useAuthBootstrap)
├─ Session stored in AsyncStorage
├─ Profile loaded (auto-created from Google)
├─ Update useSessionStore
└─ Route to Dashboard
   ↓
User authenticated ✅
Profile auto-created from Google data ✅
```

---

## ERROR HANDLING ARCHITECTURE

```
┌──────────────────────────────────────────┐
│          ErrorBoundary Component         │
│  ├─ Catches React render errors         │
│  ├─ Shows error fallback UI             │
│  ├─ Logs error details                  │
│  └─ Provides "Try Again" + "Reload"    │
└──────────────────────────────────────────┘
                    ↑
        ┌───────────┴────────────┐
        ↑                        ↑
┌──────────────┐      ┌──────────────────┐
│ Auth Errors  │      │ Payment Errors   │
│              │      │                  │
│ ├─ Try/catch │      │ ├─ Try/catch     │
│ ├─ Alert UI  │      │ ├─ Alert UI      │
│ ├─ Console   │      │ ├─ Cancel check  │
│ └─ Fallback  │      │ └─ Retry logic   │
└──────────────┘      └──────────────────┘
        ↑                        ↑
┌──────────────┐      ┌──────────────────┐
│Session/State │      │ Platform Errors  │
│              │      │                  │
│ ├─ Null      │      │ ├─ Platform      │
│ │  session   │      │ │  detection     │
│ ├─ Failed    │      │ ├─ Verbose       │
│ │  load      │      │ │  Android logs  │
│ └─ Graceful  │      │ └─ Fallbacks     │
│    fallback  │      │                  │
└──────────────┘      └──────────────────┘

All paths lead to:
  ✅ User feedback (Alert/Toast)
  ✅ Console logging (for debugging)
  ✅ Graceful degradation (app doesn't crash)
```

---

## DATA FLOW: PROFILE SUBSCRIPTION UPDATE

```
1. User in Pricing Screen
   ├─ Current tier: FREE
   └─ Ready to purchase

2. User taps WEEKLY button
   ↓
3. RevenueCat Purchase Flow
   ├─ Get offerings
   ├─ Find package
   └─ Process purchase
   ↓
4. Payment Processed
   ├─ Stripe charges card
   └─ RevenueCat updated

5. App Receives Success
   ├─ customerInfo returned
   ├─ Entitlements checked
   └─ 'Aysa Pro' found ✅
   ↓
6. Local Profile Updated
   ├─ setProfile({
   │    ...profile,
   │    subscription_tier: 'weekly'
   │ })
   └─ Stored in Zustand
   ↓
7. AsyncStorage Persisted
   └─ Saved to device
   ↓
8. Supabase Updated (next sync)
   ├─ Profile tier: 'weekly'
   └─ Updated at: timestamp
   ↓
9. Features Unlock
   ├─ Dashboard shows 500+ freqs
   ├─ Composer enabled
   ├─ Custom baths enabled
   ├─ Manifestation unlocked
   └─ Profile shows badge: WEEKLY
```

---

## DEVICE DATA PERSISTENCE

```
┌─────────────────────────────────────────┐
│     DEVICE (AsyncStorage)              │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ Supabase Session                 │ │
│  │ ├─ access_token                  │ │
│  │ ├─ refresh_token                 │ │
│  │ ├─ user_id                       │ │
│  │ └─ expires_at                    │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ useSessionStore                  │ │
│  │ ├─ session object                │ │
│  │ └─ profile object                │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ useThemeStore                    │ │
│  │ └─ isDark: boolean               │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ useFavoritesStore                │ │
│  │ └─ favorites: Favorite[]         │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ useJournalStore                  │ │
│  │ └─ entries: JournalEntry[]       │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ useRemindersStore                │ │
│  │ └─ reminders: Reminder[]         │ │
│  └──────────────────────────────────┘ │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ App Starts            │
        │ useStoreHydration:    │
        │ Loads all stores      │
        │ Waits for each        │
        │ Max 5 seconds         │
        │ Then renders UI       │
        └───────────────────────┘
                    ↓
        ┌───────────────────────┐
        │ User has:             │
        │ ✅ Session restored   │
        │ ✅ Profile loaded     │
        │ ✅ Theme restored     │
        │ ✅ Favorites loaded   │
        │ ✅ Journal entries    │
        │ ✅ Reminders set      │
        └───────────────────────┘
```

---

## SUMMARY

**This is a complete, production-grade application with:**

✅ **Full Authentication**
- Email/password with validation
- Google OAuth on Android/iOS
- Proper error handling
- Session persistence

✅ **Account Management**
- User profiles stored in Supabase
- Profile data persists locally
- Email verification flow
- Google account auto-linking

✅ **Payment System**
- Three subscription tiers
- RevenueCat + Stripe integration
- Purchase flow with error handling
- Entitlement checking
- Restore purchases feature
- Feature gating per subscription

✅ **Data Persistence**
- Sessions: AsyncStorage + Supabase auto-refresh
- Profiles: Zustand + AsyncStorage
- App state: 6 Zustand stores with persistence
- No data loss on app restart

✅ **Error Handling**
- ErrorBoundary catches React errors
- Try/catch on all async operations
- User-friendly alerts for all errors
- Console logging for debugging
- Platform-specific error handling

✅ **Security**
- Passwords hashed by Supabase
- OAuth properly implemented
- API keys protected in eas.json
- Row Level Security on database
- No sensitive data in client code

**Ready for production deployment and user testing.**

