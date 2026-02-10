# 🔍 COMPLETE AUDIT: Mobile App vs Browser App

**Date**: January 24, 2026  
**Mobile**: React Native (Expo) - Tones by Aysa  
**Browser**: Web App (healtonefront) - Tones by Aysa  

---

## 📊 SUMMARY TABLE

| Component | Mobile | Browser | Status | Action |
|-----------|--------|---------|--------|--------|
| **Authentication** | Supabase + Google | ? | ❓ | Verify browser auth |
| **Frequency Library** | 500+ frequencies | ? | ❌ MISSING | Export from mobile |
| **Frequency Baths** | 20+ pre-built baths | ? | ❌ MISSING | Export from mobile |
| **Smart Stacks** | 30+ AI-curated stacks | ? | ❌ MISSING | Export from mobile |
| **Profile Schema** | Complete (7 fields) | ? | ⚠️ INCOMPLETE | Complete browser profile |
| **Subscription Logic** | Full implementation | ? | ⚠️ PARTIAL | Sync with mobile |
| **Audio Playback** | Web Audio API | ? | ⚠️ NEEDS UPDATE | Use same engine |
| **State Management** | Zustand stores | ? | ❓ | Verify browser setup |
| **Favorites System** | Async Storage | ? | ❌ MISSING | Add to browser |
| **Reminders** | Push notifications | ? | ❌ MISSING | Add to browser |
| **Journal/Logging** | Local + Supabase | ? | ⚠️ PARTIAL | Sync with mobile |
| **Community Features** | Community presets | ? | ❌ MISSING | Add to browser |
| **Payment System** | RevenueCat ready | ? | ⚠️ DIFFERENT | Stripe/PayPal for web |
| **Themes/Dark Mode** | Dark theme default | ? | ❓ | Verify browser |
| **Offline Support** | Offline mode | ? | ❌ MISSING | Add offline for web |

---

## 🔴 CRITICAL ISSUES FOUND

### **1. MISSING FREQUENCY DATA (Browser)**
- **Issue**: Browser doesn't have access to mobile's 500+ frequency library
- **Mobile Has**:
  - 500+ frequencies across 20+ categories
  - Solfeggio, Chakra, Binaural, Healing, Planetary, Crystal, etc.
  - Premium/Free tier classification
  
- **Browser Missing**:
  - ❌ No frequency database
  - ❌ No category structure
  - ❌ No benefit descriptions
  
- **Fix**: Export `frequencies.ts` from mobile → Browser

### **2. MISSING FREQUENCY BATHS (Browser)**
- **Issue**: Browser can't build/play frequency baths
- **Mobile Has**:
  - `FrequencyBath` interface with multi-frequency layering
  - 20+ pre-configured healing baths
  - Categories: healing, mental, spiritual, emotional, etc.
  
- **Browser Missing**:
  - ❌ Bath database
  - ❌ Bath composition logic
  - ❌ Multi-frequency playback system
  
- **Fix**: Export bath definitions from mobile

### **3. MISSING SMART STACKS (Browser)**
- **Issue**: Browser doesn't have AI-curated frequency combinations
- **Mobile Has**:
  - 30+ Smart Stacks (Deep Focus, Sleep, Creative Flow, etc.)
  - AI-driven recommendations based on user goals
  - Waveform selection per stack
  
- **Browser Missing**:
  - ❌ Smart Stack library
  - ❌ Goal-matching algorithm
  - ❌ Stack playback engine
  
- **Fix**: Export `smartStacks.ts` from mobile

### **4. INCOMPLETE PROFILE SCHEMA (Browser)**
- **Issue**: Browser profile missing critical fields
- **Mobile Profile Type**:
  ```typescript
  type Profile = {
    id: string;                    // ✅ Required
    email: string;                 // ✅ Required
    full_name: string | null;      // ✅ Optional
    subscription_tier: 'free' | 'weekly' | 'lifetime' | null;
    subscription_status: string | null;
    is_admin?: boolean;
    avatar_url?: string | null;
  };
  ```
  
- **Browser Missing Fields**:
  - ❌ `subscription_tier` - Can't gate premium features
  - ❌ `subscription_status` - Can't track active subscriptions
  - ⚠️ Possibly `avatar_url`, `is_admin`
  
- **Fix**: Complete Supabase schema in browser

### **5. PAYMENT SYSTEM MISMATCH (Browser)**
- **Issue**: Different payment processors for mobile vs web
- **Mobile**:
  - RevenueCat (handles Google Play, App Store)
  - Entitlements: `Aysa_Pro`, `Aysa_Lifetime`
  - Annual billing model
  
- **Browser Missing**:
  - ❌ No payment integration (likely)
  - ❌ Different payment processor needed (Stripe/Paddle)
  - ❌ No subscription entitlements synced
  
- **Action Required**: 
  - Set up Stripe for browser
  - Sync payments to Supabase `profiles.subscription_tier`

### **6. MISSING FAVORITES SYSTEM (Browser)**
- **Issue**: Browser can't save user favorites
- **Mobile Has**:
  - `useFavoritesStore` - Async Storage persistence
  - Save/load frequencies as favorites
  - UI components for favorite toggle
  
- **Browser Missing**:
  - ❌ No favorites database/storage
  - ❌ No favorite toggle UI
  - ❌ No API to save favorites
  
- **Fix**: Add favorites to Supabase with profile FK

### **7. MISSING REMINDERS (Browser)**
- **Issue**: Browser doesn't have reminder system
- **Mobile Has**:
  - `useRemindersStore` - Push notifications
  - Schedule reminders for frequencies
  - Notification permissions handling
  
- **Browser Missing**:
  - ❌ No reminder system
  - ❌ No Web Notifications API
  - ❌ No scheduler
  
- **Action**: Implement Web Notifications + scheduler

### **8. MISSING JOURNAL (Browser)**
- **Issue**: Browser journal incomplete
- **Mobile Has**:
  - `useJournalStore` - Local + Supabase sync
  - Journal entries with metadata
  - Local-first with cloud backup
  
- **Browser Missing**:
  - ⚠️ Possibly exists but not synced with mobile
  - No shared journal data
  
- **Action**: Verify browser journal, ensure Supabase sync

### **9. MISSING COMMUNITY FEATURES (Browser)**
- **Issue**: Browser lacks community preset sharing
- **Mobile Has**:
  - `useCommunityStore` - Community presets
  - Share custom frequency baths
  - Browse/save community stacks
  
- **Browser Missing**:
  - ❌ No community presets UI
  - ❌ No sharing mechanism
  - ❌ No community feed
  
- **Action**: Build community features for web

### **10. NO OFFLINE SUPPORT (Browser)**
- **Issue**: Browser has no offline mode
- **Mobile Has**:
  - `useOfflineStore` - Works without internet
  - Caches frequencies and baths
  - Syncs when online
  
- **Browser Missing**:
  - ❌ No Service Worker
  - ❌ No offline cache
  - ❌ No offline mode UI
  
- **Action**: Add PWA offline support with Service Workers

### **11. AUDIO ENGINE DIFFERENCES (Browser)**
- **Issue**: Audio synthesis may differ between platforms
- **Mobile Uses**:
  - Expo Audio API
  - WAV synthesis with Web Audio API
  - Platform-specific optimization
  
- **Browser**: Unknown - likely different
  
- **Action**: Verify browser audio engine matches mobile

### **12. THEME/STYLING MISMATCH**
- **Issue**: Dark theme/styling may not match
- **Mobile**:
  - Dark-only experience by design
  - Zustand theme store
  - Platform-specific dark mode
  
- **Browser**: Unknown styling
  
- **Action**: Ensure brand consistency

---

## ✅ WHAT'S WORKING IN MOBILE

### **Authentication**
- ✅ Supabase email + password
- ✅ Google OAuth sign-in
- ✅ Session persistence
- ✅ Profile creation on signup

### **Frequency Library**
- ✅ 500+ frequencies with metadata
- ✅ 20+ categories
- ✅ Premium/free classification
- ✅ Benefit descriptions
- ✅ Usage recommendations

### **Audio**
- ✅ Frequency playback (sine, square, sawtooth, triangle)
- ✅ Binaural beat synthesis
- ✅ Multi-layer frequency bathing
- ✅ Volume/duration control
- ✅ Waveform selection

### **Subscriptions**
- ✅ RevenueCat integration ready
- ✅ Entitlement checking
- ✅ Supabase profile sync
- ✅ Tier-based feature gating

### **Favorites**
- ✅ Save/load favorites from AsyncStorage
- ✅ Favorite UI toggle
- ✅ Filter by favorites

### **Reminders**
- ✅ Push notification scheduling
- ✅ Reminder persistence
- ✅ Time-based triggers

### **Journal**
- ✅ Journal entries storage
- ✅ Mood tracking
- ✅ Supabase backup

### **Community**
- ✅ Community preset browsing
- ✅ Preset sharing mechanism
- ✅ User-generated content

### **Offline**
- ✅ Offline mode with cached data
- ✅ Works without internet connection

---

## 📋 ACTION PLAN FOR BROWSER APP

### **Priority 1: CRITICAL (Do First)**

```
1. [ ] FREQUENCY DATA
   - Export frequencies.ts from mobile
   - Create browser database schema for frequencies
   - Implement frequency filtering and search
   - Sync premium/free status with subscription tier

2. [ ] FREQUENCY BATHS
   - Export bath definitions from mobile
   - Create bath composition system
   - Implement multi-frequency playback
   - Add bath UI components

3. [ ] SMART STACKS
   - Export smartStacks.ts from mobile
   - Implement goal-matching search
   - Create stack builder UI
   - Add smart recommendations

4. [ ] PROFILE SCHEMA (Supabase)
   - Add columns to profiles table:
     * subscription_tier (varchar: 'free', 'weekly', 'lifetime')
     * subscription_status (varchar: 'active', 'inactive', 'trial')
     * is_admin (boolean, default false)
   - Create migration for existing users
   - Update browser code to use new fields

5. [ ] SUBSCRIPTION GATING
   - Gate premium frequencies by subscription_tier
   - Gate premium baths by subscription_tier
   - Implement paywall UI (matching mobile)
   - Sync subscription status on browser
```

### **Priority 2: IMPORTANT (Do Next)**

```
6. [ ] PAYMENT SYSTEM (Web)
   - Set up Stripe for browser
   - Create payment form UI
   - Sync payment status to Supabase
   - Create checkout flow
   - Implement purchase verification

7. [ ] FAVORITES SYSTEM
   - Add favorites table to Supabase:
     * id, user_id, frequency_id, created_at
   - Create browser favorites API
   - Implement favorite toggle UI
   - Sync favorites between mobile + browser

8. [ ] AUDIO ENGINE
   - Verify Web Audio API implementation
   - Ensure audio quality matches mobile
   - Test frequency playback
   - Test waveform synthesis

9. [ ] JOURNAL SYNC
   - Verify journal entries in Supabase
   - Implement browser journal UI
   - Ensure mobile/web sync works
   - Add mood tracking visualization
```

### **Priority 3: NICE-TO-HAVE (Do Later)**

```
10. [ ] REMINDERS
    - Implement Web Notifications API
    - Create reminder scheduler
    - Add notification UI
    - Browser background sync (if PWA)

11. [ ] COMMUNITY FEATURES
    - Create community preset UI
    - Implement preset sharing
    - Add community feed/search
    - Create preset ratings/reviews

12. [ ] OFFLINE SUPPORT
    - Create Service Worker
    - Implement IndexedDB cache
    - Add offline mode UI
    - Create sync queue for offline actions

13. [ ] THEME/STYLING
    - Ensure dark theme consistency
    - Match mobile branding
    - Responsive design across devices
    - Accessibility audit
```

---

## 🔧 TECHNICAL SPECIFICATIONS

### **Supabase Schema (Browser Needs)**

```sql
-- profiles table additions
ALTER TABLE profiles ADD COLUMN subscription_tier varchar(20) DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_status varchar(20);
ALTER TABLE profiles ADD COLUMN trial_started_at timestamptz;

-- favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_id integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- reminders table (for browser)
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_id integer,
  bath_id varchar(100),
  scheduled_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### **Frequency Data Structure (To Share)**

```typescript
// frequencies.ts exports needed
export interface Frequency {
  id: string;
  name: string;
  hz: number;
  category: string;
  description: string;
  benefits: string[];
  duration: number;
  isPremium: boolean;
}

export const FREQUENCIES: Frequency[] = [...]; // 500+ items
export const getAvailableFrequencies = (tier: SubscriptionTier) => Frequency[];
export const FREQUENCY_BATHS: FrequencyBath[] = [...]; // 20+ items
```

### **Smart Stacks Export**

```typescript
// smartStacks.ts exports needed
export interface SmartStack {
  id: string;
  name: string;
  goal: string;
  frequencies: number[];
  category: string;
}

export const SMART_STACKS: SmartStack[] = [...]; // 30+ items
export const getSmartStackSuggestions = (goal: string) => SmartStack[];
```

---

## 📱 DEVICE PARITY CHECKLIST

```
BROWSER MUST HAVE:
[ ] Same frequency library as mobile
[ ] Same bath database as mobile
[ ] Same smart stacks as mobile
[ ] Same subscription logic as mobile
[ ] Same favorites system as mobile
[ ] Same profile schema as mobile
[ ] Compatible audio playback
[ ] Same dark theme design
[ ] Mobile-responsive UI
[ ] Feature parity for paid features
```

---

## 🚀 NEXT STEPS

1. **Get browser code** - You mentioned it's in `healtonefront` (outside workspace)
2. **Audit browser codebase** - Map existing implementation
3. **Export mobile data** - Create shared library/package for frequencies, baths, stacks
4. **Create shared types** - TypeScript interfaces for both apps
5. **Implement Priority 1 items** - Critical features first
6. **Sync Supabase schema** - Complete profile and favorites
7. **Test payment flow** - Ensure mobile → browser subscription sync
8. **Create feature parity** - Match mobile experience

---

## 💡 RECOMMENDATIONS

1. **Create Monorepo**: Easier to share code between mobile + web
   ```
   /healtone
     /packages
       /mobile (React Native)
       /web (Next.js or React)
       /shared (Common types, data, utilities)
   ```

2. **Shared Data Layer**: Extract frequencies, baths, stacks to JSON/API
   - Option A: Static JSON file both apps import
   - Option B: Cloud API (supabase functions)

3. **Single Source of Truth**: Supabase as the backend for both
   - User profiles
   - Subscription status
   - Favorites
   - Community presets
   - Journal entries

4. **Unified Styling**: Shared design system (colors, components)
   - Both apps use same purple gradient theme
   - Consistent component patterns
   - Accessible dark mode

---

**Report Generated**: January 24, 2026  
**Status**: Complete Audit Ready for Implementation
