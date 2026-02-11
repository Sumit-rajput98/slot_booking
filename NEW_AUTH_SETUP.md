# New Authentication System Setup

## Overview

The authentication system has been simplified:

### Admin Users
- **Login with**: Username & Password
- **Access**: Full admin panel
- **Stored in**: `admin_users` table

### Regular Users
- **Login with**: Mobile Number, Army Number, Name (NO PASSWORD)
- **Access**: Booking system only
- **Stored in**: `public_profile` table

## Database Setup

### Step 1: Run Migration

1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `server/migrations/create-admin-tables.sql`
3. Click "Run"

This will create:
- `admin_users` table
- `admin_sessions` table
- `slot_configurations` table
- `recurring_slot_rules` table
- `audit_logs` table
- Default admin user (username: `admin`, password: `admin123`)

### Step 2: Verify Tables

Run this query to verify:

```sql
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

## Default Admin Credentials

**⚠️ IMPORTANT: Change these immediately after first login!**

```
Username: admin
Password: admin123
```

## API Endpoints

### Admin Authentication

#### Login
```
POST /api/auth/admin/login
Body: {
  "username": "admin",
  "password": "admin123"
}

Response: {
  "success": true,
  "token": "base64_token_here",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN",
    "full_name": "System Administrator"
  }
}
```

#### Logout
```
POST /api/auth/admin/logout
Headers: {
  "Authorization": "Bearer <token>"
}
```

#### Verify Session
```
GET /api/auth/admin/verify
Headers: {
  "Authorization": "Bearer <token>"
}
```

### User Authentication (No Password)

#### Login/Register
```
POST /api/auth/user/login
Body: {
  "mobile": "9876543210",
  "armyNumber": "12345",
  "name": "John Doe"
}

Response: {
  "success": true,
  "token": "base64_token_here",
  "user": {
    "armyNumber": "12345",
    "name": "John Doe",
    "mobile": "9876543210"
  }
}
```

## Frontend Integration

### Admin Login Component

```javascript
import { useState } from 'react';
import axios from 'axios';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/admin/login', {
        username,
        password
      });
      
      // Store token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      
      onLogin(response.data.admin);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
};
```

### User Login Component

```javascript
import { useState } from 'react';
import axios from 'axios';

const UserLogin = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [armyNumber, setArmyNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/user/login', {
        mobile,
        armyNumber,
        name
      });
      
      // Store user info
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Mobile Number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <input
        type="text"
        placeholder="Army Number"
        value={armyNumber}
        onChange={(e) => setArmyNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Continue</button>
      {error && <p>{error}</p>}
    </form>
  );
};
```

## Managing Admin Users

### Create New Admin User

```sql
INSERT INTO admin_users (username, password, full_name, role)
VALUES ('newadmin', 'password123', 'New Admin Name', 'ADMIN');
```

### Update Admin Password

```sql
UPDATE admin_users 
SET password = 'newpassword123', updated_at = NOW()
WHERE username = 'admin';
```

### List All Admin Users

```sql
SELECT id, username, full_name, role, is_active, created_at
FROM admin_users
ORDER BY created_at DESC;
```

### Deactivate Admin User

```sql
UPDATE admin_users 
SET is_active = FALSE, updated_at = NOW()
WHERE username = 'oldadmin';
```

## Security Notes

### For Production

1. **Hash Passwords**: Use bcrypt to hash passwords
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Use Environment Variables**: Store default admin credentials in .env
   ```env
   DEFAULT_ADMIN_USERNAME=admin
   DEFAULT_ADMIN_PASSWORD=secure_password_here
   ```

3. **Session Expiry**: Sessions expire after 24 hours (configurable)

4. **HTTPS Only**: Always use HTTPS in production

5. **Rate Limiting**: Add rate limiting to login endpoints

## Testing

### Test Admin Login

```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test User Login

```bash
curl -X POST http://localhost:5000/api/auth/user/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210","armyNumber":"12345","name":"John Doe"}'
```

### Test Protected Route

```bash
curl -X GET http://localhost:5000/api/admin/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Issue: "Invalid credentials"
- Check username and password are correct
- Verify admin_users table has the user
- Check password matches exactly (case-sensitive)

### Issue: "Authentication required"
- Ensure token is included in Authorization header
- Format: `Authorization: Bearer <token>`
- Check token hasn't expired (24 hours)

### Issue: "Session expired"
- Login again to get new token
- Old sessions are automatically cleaned up

### Issue: User can't login
- Verify mobile, army number, and name are provided
- Check public_profile table exists
- Ensure no database errors in server logs

## Migration from Old System

If you had Supabase Auth before:

1. Export existing users:
   ```sql
   SELECT email, full_name, role FROM candidates;
   ```

2. Create admin users for those who need admin access:
   ```sql
   INSERT INTO admin_users (username, password, full_name, role)
   SELECT 
     email as username,
     'temporary_password' as password,
     full_name,
     role
   FROM candidates
   WHERE role IN ('ADMIN', 'JCO', 'CO');
   ```

3. Notify users to change their passwords

## Summary

- ✅ Admin users: Username/Password authentication
- ✅ Regular users: Simple form (mobile, army number, name)
- ✅ No Supabase Auth dependency
- ✅ Simple session management
- ✅ Audit logging for all admin actions
- ✅ Default admin user created automatically

**Default Admin**: username: `admin`, password: `admin123`

**⚠️ Change the default password immediately!**
