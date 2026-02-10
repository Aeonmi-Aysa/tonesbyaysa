# Emulator Testing Checklist - January 8, 2026

## APP INITIALIZATION CHECKS

### ✅ Check 1: Environment Variables Loaded
**Expected**: App starts without "SUPABASE_URL missing" or similar errors
**Verification**: 
- Logs should show env vars loaded from eas.json
- No `process.env undefined` crashes
- supabaseClient initializes successfully
**Status**: READY TO VERIFY

### ✅ Check 2: Auth Bootstrap Completes
**Expected**: Initial session check completes without race conditions
**Verification**:
- Logs: `useAuthBootstrap starting session load`
- Session is checked and user is routed to Auth or Main based on session state
- No duplicate auth state updates
**Status**: READY TO VERIFY

### ✅ Check 3: AsyncStorage Hydration Completes
**Expected**: All Zustand stores hydrate from AsyncStorage before UI renders
**Verification**:
- Logs: `✅ All stores hydrated` message appears
- Splash screen shows while waiting for hydration (max 5 seconds)
- Stores complete within timeout and app proceeds
**Status**: READY TO VERIFY

### ✅ Check 4: ErrorBoundary Initialized
**Expected**: Error boundary wraps entire app
**Verification**:
- Logs: `✅ ErrorBoundary initialized`
- No unhandled errors cause white screen
- App shows error fallback UI if any error occurs
**Status**: READY TO VERIFY

### ✅ Check 5: RevenueCat Configured
**Expected**: RevenueCat SDK initializes successfully
**Verification**:
- Logs: `✅ RevenueCat initialized`
- Subscription features work without crashing
- Paywall can be displayed
**Status**: READY TO VERIFY

### ✅ Check 6: Platform Error Handler Ready
**Expected**: Platform-specific error logging active
**Verification**:
- Android: Verbose logging for debugging
- Error handler detects platform and logs appropriately
- No platform-specific crashes
**Status**: READY TO VERIFY

## BUG FIX VERIFICATION

### 🟢 Bug #1: Bath Sync
**Fix**: useFocusEffect hook reloads baths on tab focus
**Test Steps**:
1. Navigate to Manifest tab
2. Create or view a custom bath
3. Switch to another tab
4. Return to Manifest tab
**Expected**: Bath list refreshes, showing latest data
**Status**: READY TO TEST

### 🟢 Bug #2: Google Sign-In on Sign Up
**Fix**: Button added to Sign Up tab
**Test Steps**:
1. On Login screen
2. Click "Sign Up" tab
3. Look for Google Sign-In button
**Expected**: Button is visible and clickable (same as Sign In tab)
**Status**: READY TO TEST

### 🟢 Bug #3: Google OAuth Config
**Fix**: Client IDs added to eas.json and env.ts
**Test Steps**:
1. Tap Google Sign-In button on Login screen
2. OAuth flow should complete without errors
**Expected**: No "missing client ID" or "config error" messages
**Status**: READY TO TEST

### 🟢 Bug #4: Paywall Display
**Fix**: Error-handling wrappers on subscription button presses
**Test Steps**:
1. Navigate to Dashboard or Profile
2. Tap subscription/pricing button
3. RevenueCat paywall should appear
**Expected**: Paywall displays without throwing errors; can dismiss cleanly
**Status**: READY TO TEST

## STARTUP SEQUENCE (Expected Order)

```
1. ✅ App.tsx renders with ErrorBoundary
   └─ Logs: "🏠 App rendering, isBootstrapping: true, isHydrated: false"
   
2. ✅ Splash screen shows (Tones by Aysa logo)
   └─ App waits for: auth bootstrap + store hydration
   
3. ✅ useAuthBootstrap hook runs
   └─ Gets initial session from Supabase
   └─ Fetches user profile if session exists
   └─ Logs: "✅ Session loaded"
   
4. ✅ useStoreHydration hook runs
   └─ Waits for all AsyncStorage stores to hydrate
   └─ Timeout: max 5 seconds
   └─ Logs: "✅ All stores hydrated"
   
5. ✅ Deep linking configuration active
   └─ Ready to handle: healtone://dashboard, etc.
   
6. ✅ AppNavigator renders
   └─ Routes to Auth screen (no session) OR Main tabs (has session)
   
7. ✅ RevenueCat initialized
   └─ Logs: "✅ RevenueCat initialized"
   
8. ✅ App ready for interaction
   └─ All checks passed
   └─ Navigation works
   └─ Paywall available
   └─ Baths load and sync
```

## LOG CHECKLIST

Watch for these log messages in Expo terminal:

```
REQUIRED MESSAGES (Must see all):
[✓] "🏠 App rendering, isBootstrapping: true, isHydrated: false"
[✓] "✅ ErrorBoundary initialized"
[✓] "✅ RevenueCat initialized"
[✓] "✅ All stores hydrated"
[✓] "🏠 App rendering, isBootstrapping: false, isHydrated: true"

EXPECTED MESSAGES (Should see):
[✓] "[ENV DEBUG]" - shows env vars loaded
[✓] Session state changes
[✓] "[ASYNC STORAGE]" - store hydration progress

ERROR MESSAGES TO AVOID:
[✗] "Supabase env missing"
[✗] "Store hydration timeout"
[✗] "process.env undefined"
[✗] "Auth error" or "Auth failed"
[✗] "Native module failed"
[✗] Error stack traces
[✗] "Failed to load" messages
```

## POST-STARTUP ACTIONS

Once app is running (no errors seen):

1. **Test Bath Sync** - Go to Manifest tab, switch away, switch back → should refresh
2. **Test Google Sign-In** - Try signing in with Google → should work without errors
3. **Test Paywall** - Open subscription page → paywall should display
4. **Test Navigation** - Tap between tabs → should navigate smoothly
5. **Test Deep Linking** - Try: `exp+healtoneapp://dashboard` → should jump to Dashboard

## SUCCESS CRITERIA

✅ **ALL CHECKS PASS IF:**
- App starts without errors (no white screen)
- Splash screen shows during initialization
- App transitions to main UI in < 10 seconds
- All expected log messages appear
- No error messages in console
- Navigation works between tabs
- Bug fixes are verified to work

❌ **FAIL IF:**
- App crashes at startup
- White screen of death appears
- Error boundary catches an error
- Environment variables are undefined
- Auth doesn't work
- Stores fail to hydrate
- Paywall can't display

---

**Status**: Ready to run emulator test
**Commands**: 
- Expo running on http://192.168.1.158:8081
- QR code available in terminal
- Press 'a' to run on Android emulator
- Watch logs in Expo terminal output

