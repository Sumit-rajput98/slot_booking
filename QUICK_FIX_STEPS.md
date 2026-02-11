# Quick Fix Steps - Remove "Email not confirmed" Error

## Problem
You're seeing "Email not confirmed" because the old Supabase Auth system is still being used.

## Solution
We've updated to a simple username/password system for admins.

## Steps to Fix

### 1. Stop the Running Server
```bash
# Press Ctrl+C in the terminal where server is running
# Or close the terminal
```

### 2. Kill Process on Port 5000 (Windows)
```bash
# Find the process
netstat -ano | findstr :5000

# Kill it (replace PID with the number from above)
taskkill /PID <PID> /F

# Example:
# taskkill /PID 12345 /F
```

### 3. Run Database Migration

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire contents of `server/migrations/create-admin-tables.sql`
4. Paste and click "Run"
5. Wait for success message

This creates:
- `admin_users` table with default admin (username: admin, password: admin123)
- `admin_sessions` table for session management
- All other required tables

### 4. Start the Server
```bash
cd server
npm run dev
```

### 5. Start the Client
```bash
# In a new terminal
cd client
npm start
```

### 6. Test Admin Login

1. Navigate to `http://localhost:3000`
2. Click "Admin" button
3. You should see a simple login form (no more Supabase auth!)
4. Enter:
   - Username: `admin`
   - Password: `admin123`
5. Click "Login"
6. You should be logged in to the admin panel!

## What Changed

### Before
- ❌ Supabase Auth with email verification
- ❌ "Email not confirmed" errors
- ❌ Complex registration flow

### After
- ✅ Simple username/password login
- ✅ No email verification needed
- ✅ Direct access to admin panel
- ✅ Default admin user created automatically

## Default Admin Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT: Change this password after first login!**

## Troubleshooting

### Issue: Port 5000 still in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in server/.env
PORT=5001
```

### Issue: "Cannot find module"
```bash
cd server
npm install
```

### Issue: Database tables not found
- Re-run the migration script in Supabase SQL Editor
- Check for any error messages
- Verify you're in the correct Supabase project

### Issue: Still seeing old login page
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check that client is running on port 3000

### Issue: "Invalid credentials"
- Make sure you ran the database migration
- Check admin_users table exists:
  ```sql
  SELECT * FROM admin_users;
  ```
- Verify username is `admin` and password is `admin123`

## Verify Everything Works

### 1. Check Database Tables
```sql
-- Should return 5 tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'admin_users',
  'admin_sessions',
  'slot_configurations',
  'recurring_slot_rules',
  'audit_logs'
);
```

### 2. Check Default Admin User
```sql
SELECT id, username, full_name, role, is_active 
FROM admin_users 
WHERE username = 'admin';
```

Should return:
```
id | username | full_name              | role  | is_active
1  | admin    | System Administrator   | ADMIN | true
```

### 3. Test Login API
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Should return:
```json
{
  "success": true,
  "token": "...",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN",
    "full_name": "System Administrator"
  }
}
```

## Next Steps

1. ✅ Login with default credentials
2. ✅ Test admin panel features
3. ✅ Create slot configurations
4. ✅ View bookings
5. ⚠️ Change default admin password!

## Change Admin Password

### Via SQL
```sql
UPDATE admin_users 
SET password = 'your_new_secure_password', 
    updated_at = NOW()
WHERE username = 'admin';
```

### Via Admin Panel (Future Feature)
We can add a "Change Password" feature in the admin panel if needed.

## Summary

✅ No more "Email not confirmed" error
✅ Simple username/password login
✅ Default admin user created automatically
✅ Direct access to admin panel
✅ All features working

**Default Login**: username: `admin`, password: `admin123`

**Remember to change the password!**
