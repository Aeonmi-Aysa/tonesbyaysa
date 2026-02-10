# ⚡ QUICK REFERENCE CARD

**Print this and post it!**

---

## 🎯 THE 8-STEP MISSION

1. **Phase 0**: Build foundation (weeks 1-2)
   - Shared library ✓
   - Supabase schema ✓
   - Payment bridge ✓

2. **Phase 1**: Unify payments (weeks 3-4)
   - Mobile: RevenueCat + Stripe ✓
   - Browser: Stripe ✓
   - Webhooks sync → Supabase ✓

3. **Phase 2**: Sync data (weeks 5-6)
   - Frequencies API ✓
   - Baths API ✓
   - Stacks API ✓
   - Favorites sync ✓
   - Journal sync ✓

4. **Phase 3**: Feature parity (weeks 7-8)
   - Reminders ✓
   - Community ✓
   - Offline ✓
   - Themes ✓

5. **Phase 4**: Operations (weeks 9-10)
   - Admin panel ✓
   - Billing management ✓
   - Support tools ✓

6. **Phase 5**: Launch (weeks 11-12)
   - Performance ✓
   - Security ✓
   - Testing ✓
   - Documentation ✓

**Timeline: 12 weeks = ~3 months**

---

## 📱 PAYMENT FLOW (In 30 Seconds)

```
MOBILE:
  User → PaywallScreen → RevenueCat/Stripe → 
  Webhook → Supabase → Profile updated

WEB:
  User → /pricing → Stripe → 
  Webhook → Supabase → Profile updated

RESULT:
  profiles.subscription_tier = 'weekly' or 'lifetime'
  Both apps query same table
  ✨ SYNCED INSTANTLY ✨
```

---

## 📚 YOUR 4 DOCUMENTS

| Document | Use For | Read Time |
|----------|---------|-----------|
| **PROJECT_SUMMARY.md** | Overview & big picture | 10 min |
| **COMPLETE_ROADMAP.md** | Strategic planning | 20 min |
| **TODO_ACTIONABLE_LIST.md** | Daily execution | Daily |
| **PAYMENT_ARCHITECTURE.md** | Payment implementation | Reference |
| **MOBILE_VS_BROWSER_AUDIT.md** | Current state analysis | 15 min |

---

## 🔑 KEY DATABASES

```
PROFILES (already exists):
  + subscription_tier (new)
  + subscription_status (new)
  + stripe_customer_id (new)
  + revenuecat_customer_id (new)

NEW TABLES:
  - favorites
  - journal_entries
  - reminders
  - community_presets
  - transactions (optional, for audit)
```

---

## 🚀 THIS WEEK DO:

```
Day 1-2: Read COMPLETE_ROADMAP.md
Day 3-5: Extract frequencies.ts → shared library
Day 5-10: Update Supabase schema
End of week: Deploy webhook handlers

DELIVERABLE: Phase 0 complete ✓
```

---

## 💰 PAYMENT CHECKLIST

**Before Month 2 starts:**

- [ ] Stripe account (test + prod)
- [ ] RevenueCat account (test + prod)
- [ ] Test products created
- [ ] API keys obtained
- [ ] Webhooks configured
- [ ] Supabase functions deployed
- [ ] Tested end-to-end

---

## ✅ SUCCESS LOOKS LIKE:

- [ ] User pays on mobile → See premium on web instantly
- [ ] User pays on web → See premium on mobile instantly
- [ ] All 500+ frequencies accessible
- [ ] All baths playable
- [ ] Smart stacks searchable
- [ ] Favorites sync across devices
- [ ] Reminders work everywhere
- [ ] Community features live
- [ ] Offline mode active
- [ ] Theme/UI consistent

---

## 🔗 CRITICAL DEPENDENCIES

```
Phase 0.2 (schema) → Needed by Phases 1,2,3,4,5
Phase 0.3 (bridge) → Needed by Phase 1
Phase 1 (payments) → Needed by Phases 2,3,4
Phase 2 (data) → Parallel with Phase 3
Phase 3 (features) → Parallel with Phase 2
Phase 4 (admin) → After Phase 1
Phase 5 (launch) → Final phase
```

**Start Phase 0 NOW to unblock everything!**

---

## 💡 PRO TIPS

1. **Test in sandbox first**
   - Stripe test mode is free
   - RevenueCat has test environment
   - Supabase has free tier

2. **Monitor webhooks**
   - Stripe dashboard shows webhooks
   - RevenueCat shows webhook status
   - Supabase functions have logs

3. **Keep database synced**
   - One source of truth: profiles table
   - Both apps query same tier
   - Webhooks keep it current

4. **User experience matters**
   - Show loading states
   - Clear error messages
   - Instant feedback on payment

---

## 🚨 RED FLAGS

❌ **NOT DOING THESE:**
- ❌ Building separate payment systems
- ❌ Manually syncing subscriptions
- ❌ Duplicate user databases
- ❌ Hardcoded product IDs
- ❌ Testing in production

✅ **DO THESE:**
- ✅ Use Stripe + RevenueCat together
- ✅ Webhook automation
- ✅ Single Supabase source
- ✅ Environment variables for IDs
- ✅ Sandbox testing first

---

## 📞 STUCK? CHECK HERE:

| Problem | Solution | Doc |
|---------|----------|-----|
| "How do payments work?" | Read payment flow | PAYMENT_ARCHITECTURE.md |
| "What's the timeline?" | Read phases | COMPLETE_ROADMAP.md |
| "What do I do today?" | Check todo list | TODO_ACTIONABLE_LIST.md |
| "What's missing in browser?" | Read audit | MOBILE_VS_BROWSER_AUDIT.md |
| "Big picture?" | Read summary | PROJECT_SUMMARY.md |

---

## 🎓 ONE CONCEPT: SUBSCRIPTION TIER

```
MOBILE CHECKS:
  if (profile.subscription_tier === 'free') → Show lock
  if (profile.subscription_tier === 'weekly') → Show premium
  if (profile.subscription_tier === 'lifetime') → Show premium

BROWSER CHECKS:
  Same logic!

WHERE IT COMES FROM:
  - Stripe payment → Webhook → Supabase → subscription_tier = 'weekly'
  - RevenueCat payment → Webhook → Supabase → subscription_tier = 'weekly'
  - Both apps read same field
  - ✨ MAGIC: User sees premium everywhere instantly
```

---

## ⏱️ WEEKLY CHECKLIST

**Week 1-2 (Phase 0):**
- [ ] Shared library extracted
- [ ] Schema updated
- [ ] Webhooks deployed

**Week 3-4 (Phase 1):**
- [ ] Mobile Stripe integrated
- [ ] Browser checkout working
- [ ] Webhook tests passing

**Week 5-6 (Phase 2):**
- [ ] Frequencies API live
- [ ] Baths/stacks APIs live
- [ ] Favorites syncing

**Week 7-8 (Phase 3):**
- [ ] Reminders working
- [ ] Community features live
- [ ] Offline mode active

**Week 9-10 (Phase 4):**
- [ ] Admin panel ready
- [ ] Billing management active
- [ ] Support tools configured

**Week 11-12 (Phase 5):**
- [ ] All tests passing
- [ ] Security audit done
- [ ] Documentation complete
- [ ] 🚀 LAUNCH!

---

## 🎯 MOST IMPORTANT

> **Single database (Supabase) + Two payment providers (Stripe + RevenueCat) + Webhooks = Unified experience**

That's it. Everything flows from there.

---

**Project Status**: 🟢 Ready to execute  
**Start**: This week  
**Duration**: 12 weeks  
**Goal**: Complete mobile ↔ browser parity with unified payments  

**Let's go! 🚀**
