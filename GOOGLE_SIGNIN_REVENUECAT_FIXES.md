# Google Sign-In & RevenueCat Fixes - Jan 15, 2026

## Issues Fixed

### 1. Google Sign-In Token Failure
**Problem**: `handleGoogleSignIn` was failing to get ID token from Google

**Root Causes**:
- Missing `androidClientId` in `GoogleSignin.configure()`
- Hardcoded web client ID instead of using environment variables
- Insufficient error logging for debugging

**Solutions Applied**:
- ✅ Added `androidClientId` to GoogleSignin.configure() with fallback
- ✅ Now uses all three env vars: `GOOGLE_OAUTH_WEB_CLIENT_ID`, `GOOGLE_OAUTH_IOS_CLIENT_ID`, `GOOGLE_OAUTH_ANDROID_CLIENT_ID`
- ✅ Added comprehensive logging to identify token extraction issues
- ✅ Added multiple fallback checks for different response structures from Google SDK

**File Modified**: `src/screens/auth/LoginScreen.tsx`

**Code Changes**:
```typescript
GoogleSignin.configure({
  webClientId,        // From env var
  iosClientId,        // From env var
  androidClientId,    // From env var (NEWLY ADDED)
  scopes: ['profile', 'email'],
  offlineAccess: false,
  forceCodeForRefreshToken: true,
  accountName: '', // Required for Android
});
```

### 2. RevenueCat Purchase Failure
**Problem**: Purchase subscription flow not working - no products found or entitlements not verified

**Root Causes**:
- No detailed logging to identify where purchase flow fails
- Silent failures when products not found in offerings
- No visibility into customer info after purchase

**Solutions Applied**:
- ✅ Added extensive logging at each step of purchase flow
- ✅ Log all available products if requested product not found
- ✅ Show detailed customer info after successful purchase
- ✅ Better error messages with specific product ID
- ✅ Explicit entitlement checking with logging

**File Modified**: `src/screens/main/PricingScreen.tsx`

**Code Changes**:
```typescript
console.log('💳 Starting purchase for:', tier.name);
console.log('📦 Product ID:', tier.revenueCatProductId);
console.log('📋 Available offerings:', offerings);
// ... detailed logging throughout
console.log('✓ Aysa Pro entitlement:', hasAysaPro);
console.log('✓ Aysa Lifetime entitlement:', hasAysaLifetime);
```

## Testing Instructions

### For LG G8 ThinQ Phone:

1. **Make sure app is updated** - Should auto-reload via Expo
2. **Try Google Sign-Up again** and watch the console logs for:
   - ✅ "🚀 Starting Google Sign-In..."
   - ✅ "✓ Play Services available"
   - ✅ "✓ Got user info from Google:"
   - ✅ "🔑 Got ID token, signing in with Supabase..."
   - ✅ "✅ Google sign-in successful:"

3. **Try purchasing a subscription** and watch for:
   - ✅ "💳 Starting purchase for:"
   - ✅ "📋 Available offerings:" (shows all products)
   - ✅ "✓ Aysa Pro entitlement:" 
   - ✅ "✓ Aysa Lifetime entitlement:"

### For Android Emulator:

Same steps as above, but ensure:
- [ ] Google Play Services are installed on emulator
- [ ] Emulator has internet connection
- [ ] RevenueCat test mode working (using test_xfJvKnRDVTgVmDEERjBYTnOZExW key)

## Critical Info to Collect if Still Failing

### If Google Sign-In Still Fails:
1. Check console for exact error code (look for "Error code:")
2. Verify OAuth client IDs are correct in Google Cloud Console
3. Check if app signing certificate fingerprint matches in Google Cloud Console
4. Ensure Google Play Services available on device/emulator

### If RevenueCat Still Fails:
1. Check console for "No packages available" or "Product not found"
2. If product not found, check the list of "Available products:" in console
3. Verify RevenueCat AppID matches: `app3d2f00b322` 
4. Ensure products exist in RevenueCat dashboard:
   - `aysa_weekly_subscription` (Aysa Pro entitlement)
   - `aysa_lifetime_access` (Aysa Lifetime entitlement)
5. Check if entitlements are set up in RevenueCat dashboard

## Environment Variables Used

All configured in `.env` and embedded in `eas.json`:
- `GOOGLE_OAUTH_WEB_CLIENT_ID`
- `GOOGLE_OAUTH_IOS_CLIENT_ID`
- `GOOGLE_OAUTH_ANDROID_CLIENT_ID`
- `REVENUECAT_API_KEY` (currently using test mode)
- `REVENUECAT_APP_ID`

## Files Modified
1. `src/screens/auth/LoginScreen.tsx` - Enhanced Google Sign-In config and logging
2. `src/screens/main/PricingScreen.tsx` - Enhanced purchase flow logging

## Next Steps if Still Failing
1. Share console logs showing the exact error point
2. Share what appears in "Available products:" when trying to purchase
3. Verify Google Cloud Console has correct OAuth setup
4. Verify RevenueCat dashboard has products and entitlements configured
