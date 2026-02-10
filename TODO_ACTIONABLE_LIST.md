# ✅ ACTIONABLE TODO LIST - Mobile ↔ Browser Feature Parity

**Project**: Tones by Aysa  
**Unified Payment**: Stripe + RevenueCat  
**Total Items**: 150+ subtasks across 25 phases  

---

## 📋 PHASE 0: FOUNDATION (Weeks 1-2)

### Task 0.1: Create Shared Library Package
- [ ] Extract frequencies.ts from mobile app
- [ ] Convert to JSON format for sharing
- [ ] Create @healtone/shared npm package
- [ ] Export frequency interfaces and data
- [ ] Test mobile still works with shared library
- [ ] Add to both package.json files
- [ ] Create version strategy for updates
- [ ] Document frequency data format

### Task 0.2: Standardize Supabase Schema
- [ ] Create migration file for new columns
- [ ] Add subscription_tier column (varchar)
- [ ] Add subscription_status column (varchar)
- [ ] Add trial_started_at column (timestamp)
- [ ] Add stripe_customer_id column (varchar)
- [ ] Add revenuecat_customer_id column (varchar)
- [ ] Add payment_provider column (varchar)
- [ ] Create indexes for performance
- [ ] Test migration on staging database
- [ ] Backup production database before migration
- [ ] Run migration on production
- [ ] Verify all existing profiles still work

### Task 0.3: Create Stripe + RevenueCat Bridge
- [ ] Set up Stripe test account
- [ ] Set up Stripe products (weekly, lifetime)
- [ ] Create Stripe webhooks
- [ ] Set up RevenueCat test environment
- [ ] Create Supabase Edge Functions directory
- [ ] Write webhook handler for Stripe
- [ ] Write webhook handler for RevenueCat
- [ ] Create subscription sync logic
- [ ] Test webhook delivery
- [ ] Implement error handling and retries
- [ ] Create logging/monitoring
- [ ] Document webhook setup

---

## 💳 PHASE 1: PAYMENT UNIFICATION (Weeks 3-4)

### Task 1.1: Mobile Stripe Integration
- [ ] Install @stripe/stripe-react-native package
- [ ] Create Stripe configuration in app.config.ts
- [ ] Add Stripe test keys to environment
- [ ] Update PaywallScreen.tsx with Stripe option
- [ ] Create stripePaymentHandler.ts utility
- [ ] Implement Stripe customer creation
- [ ] Create payment intent flow
- [ ] Add card input component
- [ ] Handle 3D Secure authentication
- [ ] Update profile on successful payment
- [ ] Add error handling for declined cards
- [ ] Test in mobile emulator
- [ ] Test on physical device

### Task 1.2: Browser Stripe Checkout
- [ ] Install @stripe/react-stripe-js
- [ ] Create Stripe configuration
- [ ] Build /pricing page component
- [ ] Create Stripe checkout element
- [ ] Implement checkout form
- [ ] Handle successful payment redirect
- [ ] Add error handling
- [ ] Create /checkout page
- [ ] Implement /profile/billing page
- [ ] Add payment method management UI
- [ ] Build invoice history view
- [ ] Test checkout flow end-to-end

### Task 1.3: Payment Webhook System
- [ ] Create Supabase function directory
- [ ] Write Stripe webhook handler
- [ ] Write RevenueCat webhook handler
- [ ] Implement subscription tier mapping
- [ ] Create customer ID lookup logic
- [ ] Write transaction logging
- [ ] Implement webhook signature verification
- [ ] Add retry logic for failures
- [ ] Create error notification system
- [ ] Test Stripe webhook delivery
- [ ] Test RevenueCat webhook delivery
- [ ] Monitor webhook logs

### Task 1.4: Cross-Platform Sync
- [ ] Update PaywallScreen to show sync status
- [ ] Update browser profile to show sync status
- [ ] Create sync verification check
- [ ] Implement cache invalidation
- [ ] Add profile refresh on payment
- [ ] Test subscription visible in mobile after web purchase
- [ ] Test subscription visible in browser after mobile purchase
- [ ] Verify payment history consistency
- [ ] Test with multiple subscriptions (edge case)
- [ ] Document sync architecture

---

## 📱 PHASE 2: DATA SYNC (Weeks 5-6)

### Task 2.1: Frequencies API Sync
- [ ] Create GET /api/frequencies endpoint
- [ ] Add filtering by category
- [ ] Add filtering by subscription tier
- [ ] Implement search functionality
- [ ] Add pagination
- [ ] Create response caching strategy
- [ ] Update mobile to fetch from API (optional)
- [ ] Update browser to fetch frequencies
- [ ] Implement offline caching
- [ ] Add frequency browser UI to browser
- [ ] Test frequency loading performance
- [ ] Add frequency detail page

### Task 2.2: Frequency Baths Sync
- [ ] Export FREQUENCY_BATHS from mobile
- [ ] Create GET /api/baths endpoint
- [ ] Create POST /api/baths for custom baths
- [ ] Create PUT /api/baths/:id for updates
- [ ] Create DELETE /api/baths/:id
- [ ] Add filtering by category
- [ ] Add filtering by subscription tier
- [ ] Create bath validation logic
- [ ] Update browser bath builder UI
- [ ] Implement bath playback in browser
- [ ] Add bath history/favorites
- [ ] Test bath creation and playback

### Task 2.3: Smart Stacks Sync
- [ ] Export SMART_STACKS from mobile
- [ ] Create GET /api/stacks endpoint
- [ ] Create smart search algorithm
- [ ] Create GET /api/stacks/search?goal endpoint
- [ ] Create POST /api/stacks for custom stacks
- [ ] Create PUT /api/stacks/:id
- [ ] Create DELETE /api/stacks/:id
- [ ] Add stack recommendations to browser
- [ ] Build browser stack builder UI
- [ ] Implement stack-based playback
- [ ] Add stack saving feature
- [ ] Test stack search accuracy

### Task 2.4: Favorites Sync
- [ ] Create favorites table in Supabase
- [ ] Create GET /api/favorites endpoint
- [ ] Create POST /api/favorites/:frequency_id
- [ ] Create DELETE /api/favorites/:frequency_id
- [ ] Update mobile to sync favorites to Supabase
- [ ] Update mobile AsyncStorage → Supabase migration
- [ ] Update browser to load favorites from Supabase
- [ ] Add favorite toggle UI to browser
- [ ] Add favorite indicator in both apps
- [ ] Create favorite filtering
- [ ] Test sync between mobile and browser
- [ ] Test favorite persistence

### Task 2.5: Journal Sync
- [ ] Verify journal table exists in Supabase
- [ ] Create GET /api/journal endpoint
- [ ] Create POST /api/journal for new entries
- [ ] Create PUT /api/journal/:id for updates
- [ ] Create DELETE /api/journal/:id
- [ ] Update mobile journal to sync to Supabase
- [ ] Build browser journal UI
- [ ] Add mood tracking to browser
- [ ] Add date filtering to journal
- [ ] Create journal analytics/insights
- [ ] Test journal sync between platforms
- [ ] Add journal privacy controls

---

## 🔔 PHASE 3: FEATURES PARITY (Weeks 7-8)

### Task 3.1: Reminders/Notifications
- [ ] Create reminders table in Supabase
- [ ] Create GET /api/reminders endpoint
- [ ] Create POST /api/reminders endpoint
- [ ] Create PUT /api/reminders/:id endpoint
- [ ] Create DELETE /api/reminders/:id endpoint
- [ ] Implement Web Notifications API for browser
- [ ] Create Service Worker for browser
- [ ] Implement reminder scheduler
- [ ] Add browser reminder permissions request
- [ ] Create browser reminder UI
- [ ] Sync mobile reminders to Supabase
- [ ] Test reminders in both platforms
- [ ] Add reminder snooze feature
- [ ] Create reminder history

### Task 3.2: Community Features
- [ ] Create community_presets table
- [ ] Create GET /api/community/presets endpoint
- [ ] Create POST /api/community/presets endpoint
- [ ] Create GET /api/community/presets/:id endpoint
- [ ] Create POST /api/community/presets/:id/like
- [ ] Create POST /api/community/presets/:id/comment (optional)
- [ ] Build community browser page
- [ ] Implement preset sharing UI
- [ ] Add preset search/filter
- [ ] Create preset rating system
- [ ] Implement preset comments
- [ ] Add preset save to favorites
- [ ] Test community features

### Task 3.3: Offline Support
- [ ] Create Service Worker for browser
- [ ] Implement IndexedDB caching
- [ ] Cache frequency data offline
- [ ] Cache bath data offline
- [ ] Cache user profiles offline
- [ ] Implement offline detection
- [ ] Create offline UI indicator
- [ ] Build sync queue for offline actions
- [ ] Implement auto-sync when online
- [ ] Test offline functionality
- [ ] Test offline → online transitions
- [ ] Document offline limitations

### Task 3.4: Theme/Styling Parity
- [ ] Audit mobile color palette
- [ ] Audit mobile typography
- [ ] Audit mobile component styles
- [ ] Verify browser uses same colors
- [ ] Verify browser typography matches
- [ ] Ensure dark theme is default in browser
- [ ] Test responsive design on all devices
- [ ] Check accessibility standards
- [ ] Verify WCAG compliance
- [ ] Test in dark mode
- [ ] Test in light mode (if available)
- [ ] Create design system documentation

---

## 🛠️ PHASE 4: ADMIN & OPERATIONS (Weeks 9-10)

### Task 4.1: Admin Panel
- [ ] Create /admin/dashboard page
- [ ] Build user search functionality
- [ ] Add user detail view
- [ ] Create subscription status view
- [ ] Implement refund tool
- [ ] Create community moderation tools
- [ ] Add system analytics dashboard
- [ ] Build user activity logs
- [ ] Create revenue analytics
- [ ] Add subscription status filters
- [ ] Implement admin audit logs
- [ ] Test admin access controls

### Task 4.2: Subscription Management
- [ ] Create /profile/subscription page
- [ ] Add subscription details display
- [ ] Build plan upgrade UI
- [ ] Build plan downgrade UI
- [ ] Create cancel subscription flow
- [ ] Add confirmation dialogs
- [ ] Implement refund on cancellation
- [ ] Create subscription pause feature (optional)
- [ ] Add next billing date display
- [ ] Show usage stats
- [ ] Create subscription change history
- [ ] Test all subscription changes

### Task 4.3: Payment Methods
- [ ] Create /profile/billing page
- [ ] Add card display
- [ ] Build add payment method form
- [ ] Create update card flow
- [ ] Build delete payment method option
- [ ] Add default payment selector
- [ ] Create payment method validation
- [ ] Implement 3D Secure handling
- [ ] Add payment failure handling
- [ ] Create retry logic for failed payments
- [ ] Build payment method history
- [ ] Test payment method operations

### Task 4.4: Customer Support Tools
- [ ] Create /admin/support page
- [ ] Build user lookup tool
- [ ] Add subscription history view
- [ ] Create manual refund tool
- [ ] Build trial reset feature
- [ ] Add payment retry feature
- [ ] Create support ticket system (optional)
- [ ] Build customer communication templates
- [ ] Add support ticket tracking
- [ ] Create support metrics dashboard
- [ ] Implement support logging
- [ ] Test support tools

---

## 🚀 PHASE 5: OPTIMIZATION & LAUNCH (Weeks 11-12)

### Task 5.1: Performance Optimization
- [ ] Measure mobile bundle size
- [ ] Implement code splitting on browser
- [ ] Optimize database queries
- [ ] Implement query result caching
- [ ] Optimize API response times
- [ ] Add CDN for static assets
- [ ] Compress images across both apps
- [ ] Optimize font loading
- [ ] Implement lazy loading
- [ ] Test mobile load time
- [ ] Test browser load time
- [ ] Create performance monitoring

### Task 5.2: Security Audit
- [ ] Enable HTTPS everywhere
- [ ] Verify SSL certificate
- [ ] Configure security headers
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Add CORS configuration
- [ ] Rotate API keys
- [ ] Verify webhook signatures
- [ ] Audit Stripe integration
- [ ] Audit RevenueCat integration
- [ ] Create security runbook
- [ ] Schedule security review

### Task 5.3: Testing & QA
- [ ] Write unit tests for payment flow
- [ ] Write integration tests
- [ ] Write E2E tests for critical paths
- [ ] Test subscription upgrade flow
- [ ] Test subscription downgrade flow
- [ ] Test subscription cancellation
- [ ] Test trial start/end
- [ ] Test payment failure scenarios
- [ ] Test cross-platform sync
- [ ] Test offline mode
- [ ] Run full regression testing
- [ ] Create test documentation

### Task 5.4: Documentation
- [ ] Write user guide for mobile
- [ ] Write user guide for browser
- [ ] Create FAQ document
- [ ] Write troubleshooting guide
- [ ] Create API documentation
- [ ] Document deployment process
- [ ] Create runbooks for operations
- [ ] Document payment flow
- [ ] Create admin manual
- [ ] Write developer setup guide
- [ ] Create architecture documentation
- [ ] Create runbook for common issues

### Task 5.5: Launch Preparation
- [ ] Set up production database
- [ ] Set up production Stripe account
- [ ] Set up production RevenueCat account
- [ ] Configure production monitoring
- [ ] Set up alerts and notifications
- [ ] Create backup strategy
- [ ] Test backup/restore process
- [ ] Create rollback plan
- [ ] Train support team
- [ ] Create launch checklist
- [ ] Schedule production deployment
- [ ] Verify all systems ready

---

## 🎯 QUICK START (First Week)

**Start here immediately:**

1. **Day 1-2**: Complete Task 0.1 (Shared Library)
2. **Day 3-4**: Complete Task 0.2 (Database Schema)
3. **Day 5**: Complete Task 0.3 (Bridge Setup)
4. **Week 2**: Start Task 1.1 (Mobile Stripe)

---

## 📊 COMPLETION TRACKER

| Phase | Tasks | Status | ETA |
|-------|-------|--------|-----|
| 0 | 12 | Not Started | Week 2 |
| 1 | 16 | Not Started | Week 4 |
| 2 | 22 | Not Started | Week 6 |
| 3 | 20 | Not Started | Week 8 |
| 4 | 16 | Not Started | Week 10 |
| 5 | 18 | Not Started | Week 12 |
| **TOTAL** | **104** | **0%** | **12 weeks** |

---

## 🚨 CRITICAL PATH (Do These First)

```
BLOCKING OTHERS:
  1. Phase 0.1 (Shared Library) → Unblocks Phase 2
  2. Phase 0.2 (DB Schema) → Unblocks Phase 1, 2, 4
  3. Phase 0.3 (Bridge) → Unblocks Phase 1
  4. Phase 1 (Payments) → Unblocks Phases 2, 3, 4

CAN RUN PARALLEL:
  - Phase 2 (Data Sync) after Phase 0.1
  - Phase 3 (Features) after Phase 0.2
  - Phase 4 (Admin) after Phase 1
  - Phase 5 (Launch) last
```

---

## ✨ SUCCESS CRITERIA

- [ ] All 104+ tasks completed
- [ ] Mobile and browser have identical features
- [ ] Payment system unified (Stripe + RevenueCat)
- [ ] All data syncs between platforms
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Team trained
- [ ] Ready for production launch

---

**Start Date**: [Your start date]  
**Target Launch**: 12 weeks later  
**Last Updated**: January 24, 2026
