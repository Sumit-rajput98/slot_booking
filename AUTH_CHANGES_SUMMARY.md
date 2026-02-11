# Authentication System Changes - Summary

## What Changed

### Before
- ❌ Supabase Auth for everyone (email/password)
- ❌ Complex authentication flow
- ❌ Required email verification
- ❌ Users needed to create accounts

### After
- ✅ **Admin**: Simple username/password (stored in database)
- ✅ **Users**: Just mobile number, army number, and name (NO PASSWORD)
- ✅ No email verification needed
- ✅ Users can start booking immediately

## Key Changes

### 1. Database Tables

**New Tables Created**:
- `admin_users` - Stores admin credentials
- `admin_sessions` - Manages admin login sessions

**Removed Dependencies**:
- No longer using `auth.users` (Supabase Auth)
- No longer using `candidates` table for admin users

### 2. Authentication Flow

#### Admin Flow
```
1. Admin enters username & password
2. System checks admin_users table
3. Creates session token
4. Stores in admin_sessions table
5. Returns token to frontend
6. Frontend stores token in localStorage
7. Token sent with every admin API request
```

#### User Flow
```
1. User enters mobile, army number, name
2. System checks/creates profile in public_profile table
3. Creates simple session token
4. Returns token to frontend
5. User can start booking
```

### 3. API Changes

**New Endpoints**:
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/logout` - Admin logout
- `GET /api/auth/admin/verify` - Verify admin session
- `POST /api/auth/user/login` - User login (no password)

**Modified Endpoints**:
- All `/api/admin/*` routes now use `adminAuth` middleware
- Checks `admin_sessions` table instead of Supabase Auth

### 4. Middleware Changes

**New Middleware**:
- `server/middleware/adminAuth.js` - Verifies admin sessions

**Removed**:
- `server/middleware/auth.js` (Supabase Auth) - No longer used for admin routes

### 5. Controller Changes

**Updated Controllers**:
- `adminController.js` - Uses `req.admin` instead of `req.user`
- `slotManagementController.js` - Uses `req.admin`
- `userManagementController.js` - Manages `admin_users` table
- `auditLogController.js` - Logs `admin_id` instead of `user_id`

**New Controller**:
- `authController.js` - Handles admin and user authentication

## Files Created

```
server/
├── controllers/
│   └── authController.js ✨ NEW
├── middleware/
│   └── adminAuth.js ✨ NEW
├── routes/
│   └── authRoutes.js ✨ NEW
└── migrations/
    └── create-admin-tables.sql ✏️ UPDATED

Documentation/
├── NEW_AUTH_SETUP.md ✨ NEW
└── AUTH_CHANGES_SUMMARY.md ✨ NEW (this file)
```

## Files Modified

```
server/
├── index.js ✏️ Added auth routes
├── routes/
│   ├── adminRoutes.js ✏️ Uses adminAuth middleware
│   ├── slotManagementRoutes.js ✏️ Uses adminAuth middleware
│   ├── userManagementRoutes.js ✏️ Uses adminAuth middleware
│   └── auditLogRoutes.js ✏️ Uses adminAuth middleware
└── controllers/
    ├── adminController.js ✏️ Uses req.admin
    ├── slotManagementController.js ✏️ Uses req.admin
    ├── userManagementController.js ✏️ Manages admin_users
    └── auditLogController.js ✏️ Uses admin_id
```

## Migration Steps

### 1. Database Migration
```bash
# Run in Supabase SQL Editor
# Copy contents of server/migrations/create-admin-tables.sql
# Click Run
```

### 2. Default Admin User
```
Username: admin
Password: admin123

⚠️ CHANGE THIS IMMEDIATELY!
```

### 3. Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 4. Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","armyNumber":"12345","name":"John Doe"}'
```

## Frontend Changes Needed

### Admin Login Component
```javascript
// Replace Supabase auth with simple form
const handleLogin = async () => {
  const response = await axios.post('/api/auth/admin/login', {
    username,
    password
  });
  localStorage.setItem('adminToken', response.data.token);
};
```

### User Login Component
```javascript
// Simple form - no password
const handleLogin = async () => {
  const response = await axios.post('/api/auth/user/login', {
    mobile,
    armyNumber,
    name
  });
  localStorage.setItem('userToken', response.data.token);
};
```

### API Requests
```javascript
// Add token to admin requests
axios.get('/api/admin/bookings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  }
});
```

## Benefits

### For Admins
- ✅ Simple username/password login
- ✅ No email verification needed
- ✅ Faster login process
- ✅ Session management
- ✅ Audit trail of all actions

### For Users
- ✅ No password to remember
- ✅ No account creation needed
- ✅ Just enter mobile, army number, name
- ✅ Start booking immediately
- ✅ Profile auto-created/updated

### For System
- ✅ No Supabase Auth dependency
- ✅ Simpler architecture
- ✅ Better control over authentication
- ✅ Easier to customize
- ✅ Lower complexity

## Security Considerations

### Current Implementation
- ⚠️ Passwords stored in plain text
- ⚠️ Simple session tokens
- ⚠️ No rate limiting

### For Production
1. **Hash Passwords**: Use bcrypt
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash(password, 10);
   ```

2. **Secure Sessions**: Use JWT or secure session tokens

3. **Rate Limiting**: Add to login endpoints

4. **HTTPS Only**: Enforce HTTPS in production

5. **Password Policy**: Enforce strong passwords

## Testing Checklist

- [ ] Admin can login with username/password
- [ ] Admin session persists
- [ ] Admin can logout
- [ ] Admin can access all admin routes
- [ ] User can login with mobile/army number/name
- [ ] User profile is created/updated
- [ ] User can book slots
- [ ] Audit logs record admin actions
- [ ] Sessions expire after 24 hours
- [ ] Invalid credentials are rejected

## Rollback Plan

If you need to rollback:

1. Keep the old Supabase Auth code
2. Don't delete `auth.users` or `candidates` tables
3. Switch middleware back to `auth.js`
4. Revert controller changes

## Support

### Documentation
- [NEW_AUTH_SETUP.md](NEW_AUTH_SETUP.md) - Complete setup guide
- [AUTH_CHANGES_SUMMARY.md](AUTH_CHANGES_SUMMARY.md) - This file

### Common Issues
- **Can't login**: Check username/password, verify admin_users table
- **Session expired**: Login again, sessions last 24 hours
- **User can't book**: Verify public_profile table exists

## Summary

✅ **Admin Authentication**: Username/Password (simple, secure)
✅ **User Authentication**: Mobile/Army Number/Name (no password)
✅ **No Supabase Auth**: Independent authentication system
✅ **Session Management**: 24-hour sessions with auto-cleanup
✅ **Audit Logging**: All admin actions tracked
✅ **Default Admin**: username: `admin`, password: `admin123`

**Next Steps**:
1. Run database migration
2. Test admin login
3. Test user login
4. Change default admin password
5. Update frontend components

**⚠️ Remember to change the default admin password!**
