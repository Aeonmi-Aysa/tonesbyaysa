# 🚀 RevenueCat Setup: Quick Action Guide

## The Bottom Line
Your app code is ready, but **RevenueCat products and entitlements are not created**. That's why purchases fail.

---

## ⚡ Quick Fix (30 minutes)

### Step 1: Go to RevenueCat Dashboard
→ https://app.revenuecat.com

### Step 2: Create Products
1. Click **Products** in left menu
2. Click **Add Product**
3. Enter first product:
   - **Product ID:** `aysa_weekly_subscription` (copy exactly)
   - **Type:** Subscription
   - **Billing Cycle:** Weekly
   - **Price:** $4.99/week
   - **Click Save**

4. Repeat for second product:
   - **Product ID:** `aysa_lifetime_access`
   - **Type:** Non-consumable (one-time purchase)
   - **Price:** $69.99
   - **Click Save**

### Step 3: Create Entitlements
1. Click **Entitlements** in left menu
2. Click **Add Entitlement**
3. Create first entitlement:
   - **Name:** `Aysa Pro`
   - **ID:** `Aysa Pro` (match exactly)
   - **Click Save**

4. Create second entitlement:
   - **Name:** `Aysa Lifetime`
   - **ID:** `Aysa Lifetime`
   - **Click Save**

### Step 4: Link Products to Entitlements
1. Go back to **Products**
2. Click on `aysa_weekly_subscription`
3. Under "Entitlements", select `Aysa Pro`
4. **Click Save**

5. Repeat for `aysa_lifetime_access`:
   - Link to `Aysa Lifetime`
   - **Click Save**

---

## 🔄 Update Your App

```bash
cd c:\Users\wlwil\Desktop\healtoneapp
npm install
npx expo run:android
```

The app will now:
1. ✅ Find products in RevenueCat
2. ✅ Process purchases  
3. ✅ Grant entitlements
4. ✅ Unlock premium features

---

## 🧪 Testing After Setup

1. **Open app** on emulator/phone
2. **Tap Pricing**
3. **Try to purchase "Weekly"**
4. Watch console logs - you should see:
   ```
   📦 Available packages: aysa_weekly_subscription
   ✓ Found package: aysa_weekly_subscription
   🛒 Proceeding with purchase...
   ✅ Purchase successful!
   ✓ Aysa Pro entitlement: true
   ```

---

## 🟢 For Production Later

When ready to launch:

1. Get **LIVE API Key** from RevenueCat Settings
2. Update `eas.json` production profile:
   ```json
   "REVENUECAT_API_KEY": "YOUR_LIVE_API_KEY_HERE"
   ```
3. Build production: `eas build --platform android --profile production`

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| "No packages available" | Products not created in RevenueCat |
| "Product not found" | Product ID doesn't match exactly (case-sensitive) |
| "No entitlement" | Entitlements not created or not linked to products |
| Purchase seems stuck | Wait 5-15 minutes for RevenueCat to propagate changes |
| Test payment method rejected | Using wrong test account (use test sandbox method) |

---

## 📞 Need Help?

- **RevenueCat Docs:** https://www.revenuecat.com/docs/reactnative
- **Test Payment Methods:** https://www.revenuecat.com/docs/testing
- **Debugging Guide:** https://www.revenuecat.com/docs/debugging

---

**Estimated time to working purchases: 30-45 minutes** ⏱️
