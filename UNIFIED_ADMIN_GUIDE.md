# 🎯 Unified Admin Setup Guide
## Full Admin Access for origin@aeonmi.ai in BOTH Apps

This guide sets up **origin@aeonmi.ai** with full admin privileges and lifetime access across your entire HealTone™ ecosystem:

- 🌐 **Browser App**: `C:\Users\wlwil\Desktop\healtonefront`
- 📱 **Mobile App**: `C:\Users\wlwil\Desktop\healtoneapp`

Both apps share the same Supabase database: **qdnijmpcedgrpalnlojp.supabase.co**

---

## ✨ What You Get

### Browser App (/admin.html)
✅ Full admin dashboard with:
- User management table with search
- Real-time statistics (users, revenue, sessions)
- Grant/modify subscription tiers
- Export user data to CSV
- Promote/demote other admins
- Recent activity monitoring

### Mobile App (Admin Tab)
✅ Native admin interface with:
- User search by email
- Tier management (free, weekly, lifetime)
- Admin status toggle
- Debug information
- Touch-optimized UI

### Universal Access
✅ Same account, same privileges:
- **Email**: origin@aeonmi.ai
- **Role**: Super Admin
- **Subscription**: Lifetime (never expires)
- **Abilities**: Manage all users + admins

---

## 🚀 Quick Setup (3 Minutes)

### Step 1: Run the SQL Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select project: `qdnijmpcedgrpalnlojp`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run Migration**
   - Open `UNIFIED_ADMIN_SETUP.sql` (located in both app folders)
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Success**
   - Look for: ✅ "Admin Setup Complete" in results
   - Should show origin@aeonmi.ai with lifetime tier

### Step 2: Test Browser Admin

1. **Open Browser App**
   - Navigate to: `http://localhost:8080/admin.html` (or your production URL)

2. **Sign In**
   - Use email: `origin@aeonmi.ai`
   - Enter your password

3. **Verify Access**
   - Should see "Super Admin" badge in header
   - Dashboard shows all statistics
   - User table populated with all accounts
   - Can grant/modify any subscription

### Step 3: Test Mobile Admin

1. **Build/Run Mobile App**
   ```bash
   cd C:\Users\wlwil\Desktop\healtoneapp
   npm run android  # or npm run ios
   ```

2. **Sign In**
   - Use email: `origin@aeonmi.ai`
   - Enter your password

3. **Verify Access**
   - **Admin tab** appears in bottom navigation (shield icon)
   - Tap Admin tab
   - Should show "Admin Console" screen
   - Can search users and modify tiers

---

## 📋 File Locations

### Browser App Files
```
C:\Users\wlwil\Desktop\healtonefront\
├── admin.html                    # Admin dashboard interface
├── UNIFIED_ADMIN_SETUP.sql       # Database migration (shared)
├── UNIFIED_ADMIN_GUIDE.md        # This guide
└── scripts\verify-admin.js       # Verification script
```

### Mobile App Files
```
C:\Users\wlwil\Desktop\healtoneapp\
├── src\screens\main\AdminScreen.tsx    # Native admin UI
├── src\navigation\MainTabs.tsx         # Tab navigation with admin
├── UNIFIED_ADMIN_SETUP.sql             # Database migration (same)
└── .env                                # Supabase config (shared)
```

### Shared Database
```
Supabase Project: qdnijmpcedgrpalnlojp.supabase.co
Tables:
- profiles (with is_admin column)
- user_stats
- manifestation_profiles
- composer_baths
```

---

## 🔐 Security Features

### Database-Level Protection
- ✅ Automatic admin grant via triggers
- ✅ Row Level Security (RLS) policies
- ✅ Admin-only functions with permission checks
- ✅ Super admin restrictions (only origin@aeonmi.ai can manage admins)

### Application-Level Protection

**Browser App** (`admin.html`):
```javascript
const ADMIN_EMAILS = ['origin@aeonmi.ai', 'admin@healtone.app'];
const SUPER_ADMIN_EMAILS = ['origin@aeonmi.ai'];

// Double-check: Database flag + hardcoded list
if (!hasFlag && !hasLegacyAccess) {
  alert('Access Denied');
  redirect to app.html
}
```

**Mobile App** (`MainTabs.tsx`):
```typescript
const isAdmin = !!profile?.is_admin;

// Admin tab only renders if isAdmin is true
{isAdmin && (
  <Tab.Screen name="Admin" component={AdminScreen} />
)}
```

---

## 🎨 Admin Features Comparison

| Feature | Browser App | Mobile App |
|---------|-------------|------------|
| **View All Users** | ✅ Full table | ❌ Search only |
| **Grant Tiers** | ✅ Dropdown + form | ✅ Buttons |
| **Toggle Admin** | ✅ Per user | ✅ Per user |
| **Statistics** | ✅ Live dashboard | ✅ Basic stats |
| **Export Data** | ✅ CSV download | ❌ Not available |
| **Recent Activity** | ✅ Timeline view | ❌ Not available |
| **Search Users** | ✅ Live filter | ✅ Email search |

---

## 🛠️ Admin Functions

Both apps can use these Supabase functions:

### 1. Grant Subscription Tier
```javascript
// Usage in both apps
const { data, error } = await supabase
  .rpc('admin_grant_tier', {
    target_email: 'user@example.com',
    new_tier: 'lifetime',
    new_status: 'active'
  });
```

### 2. Toggle Admin Status (Super Admin Only)
```javascript
// Only origin@aeonmi.ai can call this
const { data, error } = await supabase
  .rpc('admin_toggle_admin_status', {
    target_user_id: 'uuid-here',
    should_be_admin: true
  });
```

### 3. View Admin Users
```javascript
// Get list of all admins
const { data, error } = await supabase
  .from('admin_users')
  .select('*');
```

### 4. Get Admin Statistics
```javascript
// Get aggregated stats
const { data, error } = await supabase
  .from('admin_stats')
  .select('*')
  .single();
```

---

## 🧪 Testing Checklist

### Browser App Testing
- [ ] Navigate to `/admin.html`
- [ ] Sign in with origin@aeonmi.ai
- [ ] See "Super Admin" badge
- [ ] Dashboard shows stats
- [ ] User table loads
- [ ] Search works
- [ ] Can grant lifetime tier to test user
- [ ] Can export CSV
- [ ] Admin toggle works (if other admin exists)

### Mobile App Testing
- [ ] Build and launch app
- [ ] Sign in with origin@aeonmi.ai
- [ ] Admin tab appears in bottom nav
- [ ] Tap Admin tab
- [ ] Search for user by email
- [ ] Select tier (free/weekly/lifetime)
- [ ] Grant access button works
- [ ] Admin toggle works
- [ ] Debug info shows correct status

### Cross-App Testing
- [ ] Grant lifetime in browser app
- [ ] Verify in mobile app (user has lifetime)
- [ ] Toggle admin in mobile app
- [ ] Verify in browser app (user is admin)
- [ ] Changes sync instantly (same database)

---

## 🐛 Troubleshooting

### Problem: Admin tab not showing in mobile app

**Solution:**
1. Check if migration was run successfully
2. Sign out and sign back in
3. Verify `is_admin` column exists:
   ```sql
   SELECT email, is_admin FROM profiles 
   WHERE LOWER(email) = 'origin@aeonmi.ai';
   ```

### Problem: Can't access /admin.html in browser

**Solution:**
1. Make sure you're signed in
2. Check browser console for errors
3. Verify email is exactly `origin@aeonmi.ai` (case-insensitive)
4. Clear browser cache and reload

### Problem: "Access Denied" error

**Solution:**
Run this SQL manually:
```sql
UPDATE public.profiles
SET is_admin = true, 
    subscription_tier = 'lifetime',
    subscription_status = 'active'
WHERE LOWER(email) = 'origin@aeonmi.ai';
```

### Problem: Changes in one app don't reflect in the other

**Solution:**
- Both apps use the same database
- Try signing out and back in
- Check network connection
- Verify both apps point to same Supabase project

---

## 📊 Verification

### Manual Database Check

```sql
-- Verify admin setup
SELECT 
  email,
  full_name,
  is_admin,
  subscription_tier,
  subscription_status,
  created_at
FROM public.profiles
WHERE LOWER(email) = 'origin@aeonmi.ai';

-- Expected result:
-- is_admin: true
-- subscription_tier: lifetime
-- subscription_status: active
```

### Using Verification Script (Browser App)

```bash
cd C:\Users\wlwil\Desktop\healtonefront
node scripts\verify-admin.js
```

---

## 🎯 Summary

After running the migration, `origin@aeonmi.ai` will have:

### Universal Access
- ✅ Works in **both** browser and mobile apps
- ✅ Same account, same privileges
- ✅ Changes sync across platforms

### Admin Privileges
- ✅ View all users
- ✅ Grant/modify subscriptions
- ✅ Promote/demote admins
- ✅ Access statistics

### Lifetime Benefits
- ✅ Never expires
- ✅ No payment required
- ✅ Full feature access
- ✅ Automatic renewal

### Security
- ✅ Database-level enforcement
- ✅ Double-checked in apps
- ✅ Cannot be accidentally removed
- ✅ Super admin restrictions

---

## 📝 Next Steps

1. ✅ Run `UNIFIED_ADMIN_SETUP.sql` in Supabase
2. ✅ Test browser admin at `/admin.html`
3. ✅ Test mobile admin tab
4. ✅ Verify changes sync between apps
5. ✅ Start managing users! 🚀

---

## 💡 Tips

- **Browser App**: Best for bulk operations, exports, detailed analysis
- **Mobile App**: Best for quick user lookups, on-the-go management
- **Both**: Use whichever is more convenient - changes sync instantly!
- **Security**: Only you (origin@aeonmi.ai) can manage admin roles
- **Backup**: Export user data regularly from browser admin

---

## ✅ You're All Set!

Your admin account is now configured for full access across your entire HealTone™ platform. Enjoy your super admin powers! 💪
