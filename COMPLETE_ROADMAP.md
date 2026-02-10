# 🗺️ COMPLETE ROADMAP: Mobile ↔ Browser Parity

**Project**: Tones by Aysa (Frequency Wellness App)  
**Timeline**: Phase-based implementation  
**Goal**: Achieve 100% feature parity between mobile and browser  
**Payment**: Stripe + RevenueCat (unified across platforms)  

---

## 🎯 ROADMAP PHASES

### **PHASE 0: FOUNDATION (WEEKS 1-2)**

#### 0.1 Create Shared Library Package
```
Goal: Single source of truth for frequencies, baths, stacks
Deliverables:
  - Export frequencies.ts → frequencies.json or TS module
  - Export frequency baths → baths.json or TS module
  - Export smartStacks.ts → stacks.json or TS module
  - Create @healtone/shared package
  - Version control for data updates
  
Browser Impact:
  - Can now load all frequencies
  - Can display all categories
  - Can build frequency baths
  - Can access smart stacks
```

#### 0.2 Standardize Database Schema
```
Goal: Both apps use identical Supabase structure
Deliverables:
  - Update profiles table schema
  - Add subscription fields
  - Create favorites table
  - Create reminders table (for both platforms)
  - Create journal table (unified)
  - Create community_presets table
  
New Supabase Fields:
  profiles:
    + subscription_tier (free|weekly|lifetime)
    + subscription_status (active|inactive|trial|cancelled)
    + trial_started_at (timestamp)
    + stripe_customer_id (for web)
    + revenuecat_customer_id (for mobile)
    + payment_provider (stripe|revenuecat)
```

#### 0.3 Create Stripe + RevenueCat Bridge
```
Goal: Unified subscription management across platforms
Deliverables:
  - Supabase function to sync Stripe → profiles
  - Supabase function to sync RevenueCat → profiles
  - Webhook handlers for both platforms
  - Customer ID mapping system
  - Subscription status normalizer
  
Architecture:
  Mobile Purchase → RevenueCat → Webhook → Supabase
  Web Purchase → Stripe → Webhook → Supabase
  Both update same profiles.subscription_tier
```

---

### **PHASE 1: PAYMENT UNIFICATION (WEEKS 3-4)**

#### 1.1 Mobile: Stripe + RevenueCat Integration
```
Goal: Mobile supports both payment methods
Status: RevenueCat ready, need Stripe fallback
Deliverables:
  - Add Stripe integration to mobile
  - Create payment method selector UI
  - Implement Stripe checkout
  - Map Stripe subscriptions → entitlements
  - Webhook to update profile
  
Code Changes:
  - Update PaywallScreen.tsx
  - Create stripePaymentHandler.ts
  - Add Stripe customer creation
  - Sync Stripe status to Supabase
```

#### 1.2 Browser: Stripe Integration
```
Goal: Browser accepts Stripe payments
Status: Must be implemented
Deliverables:
  - Create Stripe checkout flow
  - Build payment form components
  - Implement 3D Secure
  - Subscription management UI
  - Payment history view
  
Browser Pages:
  - /pricing → Shows plans
  - /checkout → Stripe form
  - /profile/billing → Payment methods + history
  - /subscription → Manage subscription
```

#### 1.3 Payment Webhook System
```
Goal: Any purchase updates both apps immediately
Deliverables:
  - Supabase Edge Functions
  - stripe.payment_intent webhook handler
  - revenuecat.purchase webhook handler
  - Customer sync logic
  - Error handling + retries
  
Webhooks:
  POST /webhooks/stripe → Update subscription_tier
  POST /webhooks/revenuecat → Update subscription_tier
  Both trigger profile update
```

#### 1.4 Cross-Platform Sync
```
Goal: User on mobile can see web subscription + vice versa
Deliverables:
  - Unified subscription state
  - Payment history visible in both apps
  - Manage subscription from either platform
  - Customer support tools in admin panel
  
Implementation:
  - profiles table has single subscription_tier
  - Last updated timestamp tracks currency
  - Both apps query same source of truth
  - Cache invalidation on purchase
```

---

### **PHASE 2: DATA SYNC (WEEKS 5-6)**

#### 2.1 Frequencies Sync
```
Goal: Browser loads all 500+ frequencies
Status: Mobile has complete library
Deliverables:
  - Create frequencies API endpoint
  - Browser fetches and caches
  - Filter by subscription_tier
  - Search/category filtering
  - Offline caching
  
API:
  GET /api/frequencies (cached)
  GET /api/frequencies/:id
  GET /api/frequencies?category=solfeggio&tier=free
```

#### 2.2 Frequency Baths Sync
```
Goal: Browser can create and play baths
Status: Mobile has baths, browser missing
Deliverables:
  - Export bath definitions
  - Create baths API endpoint
  - Browser bath builder UI
  - Multi-frequency playback
  - Bath history/favorites
  
API:
  GET /api/baths (all)
  POST /api/baths (create custom)
  GET /api/baths/:id
```

#### 2.3 Smart Stacks Sync
```
Goal: Browser recommends frequency stacks
Status: Mobile has 30+ stacks, browser missing
Deliverables:
  - Export smart stacks
  - Create stacks API endpoint
  - Goal-matching search
  - Browser stack builder UI
  - Save custom stacks
  
API:
  GET /api/stacks
  GET /api/stacks/search?goal="deep focus"
  POST /api/stacks (save custom)
```

#### 2.4 Favorites Sync
```
Goal: Favorites sync between mobile and browser
Status: Mobile has AsyncStorage, browser has nothing
Deliverables:
  - Create favorites table in Supabase
  - API endpoints for favorites
  - Mobile: Sync AsyncStorage → Supabase
  - Browser: Load/sync from Supabase
  - Favorite indicator in both apps
  
Table: favorites (user_id, frequency_id, created_at)
API:
  GET /api/favorites
  POST /api/favorites/:id
  DELETE /api/favorites/:id
```

#### 2.5 Journal Sync
```
Goal: Journal entries visible in both apps
Status: Mobile has journal, browser might be partial
Deliverables:
  - Verify Supabase journal table
  - Ensure mobile syncs all entries
  - Build browser journal UI
  - Mood tracking visualization
  - Entry search/filter
  
Table: journal_entries (user_id, content, mood, date, frequency_used)
Both apps sync bidirectionally
```

---

### **PHASE 3: FEATURES PARITY (WEEKS 7-8)**

#### 3.1 Reminders/Notifications
```
Goal: Both platforms support frequency reminders
Status: Mobile has push notifications, browser needs Web Notifications

Browser Implementation:
  - Web Notifications API
  - Background Service Worker
  - Reminder scheduler
  - User permission handling
  
Mobile Improvements:
  - Sync reminders to Supabase
  - Edit reminders from browser
  - Shared reminder history

Table: reminders (user_id, frequency_id, scheduled_time)
API:
  POST /api/reminders
  GET /api/reminders
  PUT /api/reminders/:id
  DELETE /api/reminders/:id
```

#### 3.2 Community Features
```
Goal: Share custom stacks between mobile and browser
Status: Mobile has community, browser missing

Browser Implementation:
  - Community preset browsing
  - Browse community library
  - Save community presets
  - Create shareable links
  - Rating/review system

Table: community_presets (user_id, bath_config, title, description, likes)
API:
  GET /api/community/presets
  GET /api/community/presets/:id
  POST /api/community/presets (create)
  POST /api/community/presets/:id/like
```

#### 3.3 Offline Support
```
Goal: Browser works offline like mobile
Status: Mobile has offline mode, browser missing

Browser Implementation:
  - Service Worker registration
  - IndexedDB caching
  - Offline frequency playback
  - Sync queue for actions
  - Offline indicator UI

PWA Features:
  - Installable app
  - Works offline
  - Auto-sync when online
  - Background sync
```

#### 3.4 Theme/Styling Parity
```
Goal: Visual consistency across platforms
Status: Mobile has dark theme, verify browser

Both Apps:
  - Same color palette
  - Same typography
  - Same component designs
  - Responsive/mobile-friendly
  - Accessibility standards

Browser: Ensure dark mode by default
Mobile: Maintain current dark theme
```

---

### **PHASE 4: ADMIN & OPERATIONS (WEEKS 9-10)**

#### 4.1 Admin Panel
```
Goal: Manage users and subscriptions from one place
Status: Mobile has admin screen, browser needs expansion

Features:
  - User search and management
  - Subscription status view
  - Refund processing
  - Community moderation
  - System analytics

Admin Table Routes:
  GET /admin/users
  GET /admin/users/:id
  PUT /admin/users/:id/subscription
  GET /admin/transactions
  POST /admin/refunds
```

#### 4.2 Subscription Management
```
Goal: Users can manage subscriptions from either app
Status: Mobile partial, browser missing

Features:
  - View subscription details
  - Change plan (upgrade/downgrade)
  - Cancel subscription
  - Billing history
  - Invoice downloads
  - Update payment method

UI:
  - Profile → Subscription section
  - Settings → Billing
  - Invoice archive
```

#### 4.3 Payment Methods
```
Goal: Users can manage payment methods
Status: Mobile limited, browser missing

Features:
  - Add/edit card
  - Multiple payment methods
  - Set default payment
  - Payment history
  - Refund tracking

Stripe Integration:
  - Create payment method
  - Update default
  - Delete payment method
  - Auto-retry logic
```

#### 4.4 Customer Support Tools
```
Goal: Support team can help customers
Status: Not implemented

Features:
  - Lookup user by email
  - View subscription history
  - Issue refunds
  - Reset trial
  - View logs

Admin Pages:
  - /admin/support → Support tools
  - /admin/users/:id → User details
  - /admin/transactions → Payment history
```

---

### **PHASE 5: OPTIMIZATION & LAUNCH (WEEKS 11-12)**

#### 5.1 Performance
```
Goal: Both apps load fast and smooth
Tasks:
  - Mobile: Minimize bundle size
  - Browser: Code splitting
  - Database: Optimize queries
  - CDN: Cache static assets
  - Images: Optimize and compress
  
Metrics:
  - Mobile: < 2s to interactive
  - Browser: < 3s to interactive
  - Frequency playback: < 100ms latency
```

#### 5.2 Security
```
Goal: Protect user data and payments
Tasks:
  - SSL/TLS everywhere
  - Payment PCI compliance
  - Rate limiting on APIs
  - Input validation
  - CORS configuration
  - Secure headers
  
Audit:
  - Security headers
  - Auth token rotation
  - API key rotation
  - Webhook verification
```

#### 5.3 Testing
```
Goal: All features tested across platforms
Tasks:
  - Unit tests (critical paths)
  - Integration tests (payment flow)
  - E2E tests (user journeys)
  - Cross-platform testing
  - Payment testing (sandbox)
  
Coverage Target: 80%+
```

#### 5.4 Documentation
```
Goal: Clear docs for users and developers
Tasks:
  - User guides
  - API documentation
  - Deployment guides
  - Troubleshooting
  - FAQ
  
Outputs:
  - User manual
  - Developer wiki
  - API docs (OpenAPI)
  - Runbooks
```

#### 5.5 Launch Prep
```
Goal: Ready for production release
Tasks:
  - Staging deployment
  - Production setup
  - Monitoring/alerts
  - Backup strategy
  - Rollback plan
  - Support runbooks
  
Pre-launch:
  - [ ] Data migration tested
  - [ ] Backups verified
  - [ ] Monitoring active
  - [ ] Team trained
  - [ ] Support ready
```

---

## 📊 DETAILED TECHNICAL SPECS

### **Payment Architecture**

```
USER ON MOBILE:
  1. Opens PaywallScreen
  2. Chooses plan (Weekly or Lifetime)
  3. Clicks "Subscribe"
  4. Either:
     a) RevenueCat flow (preferred on mobile)
     b) Stripe flow (for web users on app)
  5. Payment processed
  6. Webhook triggers:
     POST /webhooks/revenuecat or /webhooks/stripe
  7. Supabase updates:
     profiles.subscription_tier = 'weekly' | 'lifetime'
     profiles.stripe_customer_id or revenuecat_customer_id
     profiles.subscription_status = 'active'
  8. Local store updates
  9. UI shows "Upgrade successful"

USER ON BROWSER:
  1. Opens /pricing
  2. Chooses plan
  3. Clicks "Subscribe"
  4. Redirected to Stripe checkout
  5. Enters card details (Stripe handles)
  6. Returns to /profile/subscription
  7. Webhook triggers:
     POST /webhooks/stripe
  8. Supabase updates:
     profiles.subscription_tier = 'weekly' | 'lifetime'
     profiles.stripe_customer_id
     profiles.subscription_status = 'active'
  9. Browser refreshes profile
  10. UI shows premium features

CROSS-PLATFORM:
  - User on mobile sees web subscription ✅
  - User on web sees mobile subscription ✅
  - Subscription syncs instantly
  - Single subscription tier across platforms
  - Payment info visible in both apps
```

### **Database Schema Evolution**

```sql
-- Phase 0.2: New columns
ALTER TABLE profiles ADD COLUMN subscription_tier varchar(20) DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_status varchar(20) DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN trial_started_at timestamptz;
ALTER TABLE profiles ADD COLUMN stripe_customer_id varchar(100) UNIQUE;
ALTER TABLE profiles ADD COLUMN revenuecat_customer_id varchar(100) UNIQUE;
ALTER TABLE profiles ADD COLUMN payment_provider varchar(50);

-- Phase 2.4: Favorites table
CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_id integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, frequency_id)
);

-- Phase 2.5: Journal entries table
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  mood varchar(50),
  frequency_used integer,
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Phase 3.1: Reminders table
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency_id integer,
  bath_id varchar(100),
  scheduled_time timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Phase 3.2: Community presets table
CREATE TABLE community_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title varchar(200) NOT NULL,
  description text,
  bath_config jsonb NOT NULL,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_community_created_at ON community_presets(created_at DESC);
```

### **API Endpoints Overview**

```
FREQUENCIES:
  GET    /api/frequencies                  - List all
  GET    /api/frequencies/:id              - Get one
  GET    /api/frequencies?category=...&tier=...  - Filter

BATHS:
  GET    /api/baths                        - List all
  GET    /api/baths/:id                    - Get one
  POST   /api/baths                        - Create custom
  PUT    /api/baths/:id                    - Update
  DELETE /api/baths/:id                    - Delete

STACKS:
  GET    /api/stacks                       - List all
  GET    /api/stacks/search?goal=...       - Search
  POST   /api/stacks                       - Create custom
  PUT    /api/stacks/:id                   - Update
  DELETE /api/stacks/:id                   - Delete

FAVORITES:
  GET    /api/favorites                    - List user's favorites
  POST   /api/favorites/:frequency_id      - Add favorite
  DELETE /api/favorites/:frequency_id      - Remove favorite

REMINDERS:
  GET    /api/reminders                    - List reminders
  POST   /api/reminders                    - Create reminder
  PUT    /api/reminders/:id                - Update reminder
  DELETE /api/reminders/:id                - Delete reminder

JOURNAL:
  GET    /api/journal                      - List entries
  GET    /api/journal/:id                  - Get one
  POST   /api/journal                      - Create entry
  PUT    /api/journal/:id                  - Update entry
  DELETE /api/journal/:id                  - Delete entry

COMMUNITY:
  GET    /api/community/presets            - Browse presets
  GET    /api/community/presets/:id        - Get preset
  POST   /api/community/presets            - Create preset
  POST   /api/community/presets/:id/like   - Like preset

PAYMENTS:
  POST   /api/stripe/checkout              - Create Stripe session
  GET    /api/subscriptions/status         - Get user subscription
  PUT    /api/subscriptions                - Update subscription
  DELETE /api/subscriptions                - Cancel subscription
  GET    /api/billing/history              - Get invoices

WEBHOOKS:
  POST   /webhooks/stripe                  - Stripe events
  POST   /webhooks/revenuecat              - RevenueCat events

ADMIN:
  GET    /admin/users                      - List users
  GET    /admin/users/:id                  - Get user
  PUT    /admin/users/:id                  - Update user
  GET    /admin/transactions               - List transactions
  POST   /admin/refunds                    - Issue refund
```

---

## 🎯 SUCCESS METRICS

```
COMPLETION:
  ✅ Both apps have identical features
  ✅ Users see same content on mobile + web
  ✅ Subscriptions sync instantly
  ✅ Favorites sync across devices
  ✅ Payment methods unified

PERFORMANCE:
  ✅ Mobile load time < 2s
  ✅ Browser load time < 3s
  ✅ API response < 200ms
  ✅ Audio latency < 100ms
  ✅ Frequency playback smooth

QUALITY:
  ✅ Zero payment failures
  ✅ 99.9% uptime
  ✅ < 1% error rate
  ✅ All tests passing
  ✅ Security audit passed

USER SATISFACTION:
  ✅ Feature parity achieved
  ✅ Cross-device sync working
  ✅ Payments reliable
  ✅ Support response < 24h
  ✅ 4.5+ star rating
```

---

## 📅 TIMELINE SUMMARY

| Phase | Weeks | Focus | Deliverable |
|-------|-------|-------|-------------|
| 0 | 1-2 | Foundation | Shared library, unified schema |
| 1 | 3-4 | Payments | Stripe + RevenueCat unified |
| 2 | 5-6 | Data Sync | Frequencies, baths, stacks, favorites |
| 3 | 7-8 | Features | Reminders, community, offline |
| 4 | 9-10 | Admin | Management tools, billing |
| 5 | 11-12 | Launch | Testing, optimization, deployment |

**Total**: 12 weeks (~3 months) to full parity

---

**Status**: Ready for implementation  
**Next Step**: Execute Phase 0 immediately to unblock other phases
