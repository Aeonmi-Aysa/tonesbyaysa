# ⚡ QUICK REFERENCE: Admin Setup for origin@aeonmi.ai

## 🎯 ONE SQL FILE TO RULE THEM ALL

Run this in Supabase SQL Editor:
📄 **UNIFIED_ADMIN_SETUP.sql** (found in both app folders)

---

## 🚀 3-Step Setup

### 1️⃣ Open Supabase Dashboard
https://supabase.com/dashboard → Project: `qdnijmpcedgrpalnlojp`

### 2️⃣ Run SQL Migration
SQL Editor → New Query → Paste `UNIFIED_ADMIN_SETUP.sql` → Run ✅

### 3️⃣ Sign In & Test
- Browser: http://localhost:8080/admin.html
- Mobile: Admin tab (shield icon) in bottom nav

---

## ✨ What You Get

| Platform | Access Point | Features |
|----------|-------------|----------|
| 🌐 Browser | `/admin.html` | Full dashboard, stats, export, bulk ops |
| 📱 Mobile | Admin tab | User search, tier grants, quick actions |

**Both**: Same account, same privileges, instant sync!

---

## 🔑 Login Credentials

```
Email: origin@aeonmi.ai
Password: [your password]
Role: Super Admin
Tier: Lifetime
```

---

## 🎨 Browser Admin Features

✅ User table with search  
✅ Grant/modify tiers (dropdown per user)  
✅ Statistics dashboard  
✅ CSV export  
✅ Promote/demote admins  
✅ Recent activity feed

**URL**: `/admin.html`

---

## 📱 Mobile Admin Features

✅ Search users by email  
✅ Tier selector (free/weekly/lifetime)  
✅ Grant access button  
✅ Toggle admin status  
✅ Debug information

**Tab**: Shield icon in bottom navigation

---

## 🛠️ Admin Powers

### Grant Subscription
```javascript
// Browser OR Mobile
await supabase.rpc('admin_grant_tier', {
  target_email: 'user@example.com',
  new_tier: 'lifetime'
});
```

### Toggle Admin (Super Admin Only)
```javascript
await supabase.rpc('admin_toggle_admin_status', {
  target_user_id: 'uuid',
  should_be_admin: true
});
```

---

## 🔐 Security

- ✅ Database triggers (automatic)
- ✅ RLS policies (row-level security)
- ✅ Double-check in apps
- ✅ Super admin = origin@aeonmi.ai only

---

## 🧪 Quick Test

### Browser
1. Go to `/admin.html`
2. Sign in with origin@aeonmi.ai
3. See "Super Admin" badge ✅

### Mobile
1. Launch app
2. Sign in with origin@aeonmi.ai
3. Admin tab appears ✅

---

## 🐛 Troubleshooting

### Admin tab not showing?
```sql
-- Run in Supabase SQL Editor
UPDATE profiles 
SET is_admin = true, 
    subscription_tier = 'lifetime'
WHERE LOWER(email) = 'origin@aeonmi.ai';
```

Then sign out and back in.

---

## 📊 Verify Setup

```sql
SELECT email, is_admin, subscription_tier, subscription_status
FROM profiles 
WHERE LOWER(email) = 'origin@aeonmi.ai';
```

**Expected:**
- is_admin: `true`
- subscription_tier: `lifetime`
- subscription_status: `active`

---

## 📁 File Locations

```
healtonefront/
├── admin.html
├── UNIFIED_ADMIN_SETUP.sql  ← Run this
└── UNIFIED_ADMIN_GUIDE.md   ← Full docs

healtoneapp/
├── src/screens/main/AdminScreen.tsx
├── UNIFIED_ADMIN_SETUP.sql  ← Same file
└── UNIFIED_ADMIN_GUIDE.md   ← Same docs
```

---

## 💡 Tips

- **Browser**: Use for detailed management, exports
- **Mobile**: Use for quick lookups, on-the-go
- **Changes sync instantly** - same database!
- Only YOU can manage other admins

---

## ✅ Summary

1. Run `UNIFIED_ADMIN_SETUP.sql` once ⚡
2. Sign in with origin@aeonmi.ai 🔑
3. Access admin features in BOTH apps 🎯
4. Manage users anywhere, anytime 💪

**That's it! You're done!** 🚀
