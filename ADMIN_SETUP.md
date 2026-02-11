# Admin Panel Setup Guide

## Overview
This guide will help you set up the complete admin panel with authentication, slot management, user management, audit logs, and analytics.

## Features Implemented

### ✅ Authentication & Authorization
- Supabase authentication with email/password
- Role-based access control (ADMIN, JCO, CO, USER)
- Protected admin routes
- Session management

### ✅ Slot Management
- Configure daily slot availability
- Set status: Open, Half Day (Pre/Post), Closed
- Automatic slot calculation based on status
- Visual calendar view of availability
- Reason tracking for closures/changes

### ✅ User Management
- View all registered users
- Update user roles
- Delete users
- User statistics dashboard
- Search and filter capabilities

### ✅ Booking Management
- View all bookings with filters
- Update booking status (confirmed, cancelled, completed, no_show)
- Delete single or multiple bookings
- Export to Excel
- QR code generation

### ✅ Advanced Analytics
- Total bookings overview
- Status breakdown (confirmed, cancelled, completed)
- Top purposes, locations, and time slots
- Daily booking trends
- Date range filtering

### ✅ Audit Logs
- Track all admin actions
- User activity monitoring
- IP address and user agent tracking
- Export audit logs to Excel
- Filter by date, action type, entity type

## Database Setup

### Step 1: Run SQL Migration

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `server/migrations/create-admin-tables.sql`
4. Click "Run" to execute the migration

This will create:
- `slot_configurations` table
- `recurring_slot_rules` table
- `audit_logs` table
- Add `status` column to `bookings` table
- Add `role` column to `candidates` table
- Create indexes for performance
- Create views for slot availability

### Step 2: Verify Tables

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'slot_configurations', 
  'recurring_slot_rules', 
  'audit_logs', 
  'bookings', 
  'candidates'
);
```

## Backend Setup

### Step 1: Install Dependencies

No new dependencies needed! All required packages are already in `package.json`.

### Step 2: Environment Variables

Ensure your `.env` file in the `server` directory has:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
PORT=5000
NODE_ENV=development
```

### Step 3: Start Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

### Step 1: Install Dependencies

No new dependencies needed! All required packages are already in `package.json`.

### Step 2: Environment Variables

Ensure your `.env` file in the `client` directory has:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start Client

```bash
cd client
npm start
```

The client will start on `http://localhost:3000`

## Creating Your First Admin User

### Option 1: Via Register Page

1. Navigate to the Admin section
2. Click "Register" on the login page
3. Fill in:
   - Full Name
   - Email
   - Password
   - Role: Select "ADMIN"
4. Click Register
5. Check your email for verification link (if email verification is enabled)

### Option 2: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Go to SQL Editor and run:

```sql
INSERT INTO candidates (id, full_name, role, created_at)
VALUES (
  'user_id_from_auth_users',
  'Admin Name',
  'ADMIN',
  NOW()
);
```

## Using the Admin Panel

### 1. Login

1. Navigate to the Admin section in the app
2. Enter your credentials
3. Click Login

### 2. Slot Management

**Set a Holiday (Closed Day):**
1. Go to "Slot Management" tab
2. Click "Add Configuration"
3. Select date
4. Choose status: "Closed"
5. Add reason: "Public Holiday"
6. Click "Create"

**Set Half Day:**
1. Click "Add Configuration"
2. Select date
3. Choose status: "Half Day Pre" (morning) or "Half Day Post" (afternoon)
4. Max slots will automatically be set to 600
5. Add reason (optional)
6. Click "Create"

**View Availability:**
- The calendar view shows all configured dates
- Color coding:
  - Green: Open with available slots
  - Yellow: Half day
  - Red: Closed
  - Orange: Fully booked

### 3. Booking Management

**View Bookings:**
- All bookings are displayed in a table
- Use date filters to narrow down results
- Search by name, purpose, or location

**Update Booking Status:**
- Click on a booking row
- Change status dropdown
- Options: Confirmed, Cancelled, Completed, No Show

**Delete Bookings:**
- Select multiple bookings using checkboxes
- Click "Delete Selected"
- Or click trash icon for single booking

**Export to Excel:**
- Click "Export Excel" button
- Select date range (optional)
- File will download automatically

### 4. User Management

**View Users:**
- See all registered users
- Filter by role
- Search by name or email

**Change User Role:**
- Click role dropdown for any user
- Select new role
- Confirm the change

**Delete User:**
- Click trash icon next to user
- Confirm deletion
- User will be removed from both candidates and auth tables

### 5. Analytics

**View Statistics:**
- Total bookings
- Status breakdown
- Top purposes and locations
- Popular time slots
- Daily trends

**Filter by Date:**
- Select start and end dates
- Click "Update" to refresh data

### 6. Audit Logs

**View Activity:**
- All admin actions are logged
- See who did what and when
- IP address tracking

**Filter Logs:**
- By date range
- By action type
- By entity type

**Export Logs:**
- Click "Export" button
- Excel file with all audit data

## API Endpoints

### Slot Management
- `GET /api/admin/slot-management/configurations` - Get slot configurations
- `POST /api/admin/slot-management/configuration` - Create configuration
- `PUT /api/admin/slot-management/configuration/:id` - Update configuration
- `DELETE /api/admin/slot-management/configuration/:id` - Delete configuration
- `GET /api/admin/slot-management/availability` - Get availability overview

### User Management
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/stats` - Get user statistics
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

### Audit Logs
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/audit-logs/stats` - Get audit statistics
- `GET /api/admin/audit-logs/export` - Export audit logs

### Analytics
- `GET /api/admin/analytics` - Get booking analytics

### Booking Management
- `PUT /api/admin/bookings/:id/status` - Update booking status

## Security Features

1. **Authentication Required**: All admin routes require valid Supabase session
2. **Role-Based Access**: Certain features restricted to ADMIN role only
3. **Audit Trail**: All actions logged with user, timestamp, and IP
4. **Session Management**: Automatic logout on session expiry
5. **CORS Protection**: Configured allowed origins

## Troubleshooting

### Issue: "Access Denied" after login
**Solution**: Check that your user has the correct role in the `candidates` table:
```sql
SELECT * FROM candidates WHERE id = 'your_user_id';
```

### Issue: Slot configurations not showing
**Solution**: Verify the table exists and has data:
```sql
SELECT * FROM slot_configurations ORDER BY date DESC LIMIT 10;
```

### Issue: Audit logs not recording
**Solution**: Check that the audit_logs table exists and has proper permissions:
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

### Issue: Authentication errors
**Solution**: 
1. Check Supabase credentials in `.env` files
2. Verify Supabase project is active
3. Check browser console for detailed errors

## Best Practices

1. **Regular Backups**: Export bookings and audit logs regularly
2. **Role Management**: Only give ADMIN role to trusted users
3. **Slot Planning**: Configure holidays and half days in advance
4. **Monitor Logs**: Review audit logs weekly for suspicious activity
5. **User Cleanup**: Remove inactive users periodically

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check browser console for frontend errors
4. Check server logs for backend errors

## Future Enhancements

Potential features to add:
- Email notifications for bookings
- SMS notifications
- Recurring slot rules (weekly/monthly patterns)
- Booking approval workflow
- Custom reports
- Dashboard widgets
- Mobile app support
