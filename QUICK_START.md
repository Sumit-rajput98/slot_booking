# Quick Start Guide

Get your admin panel up and running in 10 minutes!

## Step 1: Database Setup (2 minutes)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `server/migrations/create-admin-tables.sql`
4. Paste and click **Run**
5. ✅ Verify success message

## Step 2: Backend Setup (2 minutes)

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Create/verify `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   PORT=5000
   NODE_ENV=development
   ```

4. Start server:
   ```bash
   npm run dev
   ```

5. ✅ Check console for "Server running" message

## Step 3: Frontend Setup (2 minutes)

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Create/verify `.env` file:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start client:
   ```bash
   npm start
   ```

5. ✅ Browser opens to `http://localhost:3000`

## Step 4: Create Admin User (2 minutes)

### Option A: Via UI (Recommended)
1. Click **Admin** button in navigation
2. Click **Register** on login page
3. Fill in:
   - Full Name: Your Name
   - Email: your@email.com
   - Password: (secure password)
   - Role: **ADMIN**
4. Click **Register**
5. ✅ You're logged in!

### Option B: Via Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Go to **SQL Editor** and run:
   ```sql
   INSERT INTO candidates (id, full_name, role, created_at)
   VALUES (
     'paste_user_id_here',
     'Your Name',
     'ADMIN',
     NOW()
   );
   ```
5. ✅ User created!

## Step 5: Test Admin Panel (2 minutes)

### Test Slot Management
1. Click **Slot Management** in sidebar
2. Click **Add Configuration**
3. Set tomorrow as **Closed** with reason "Testing"
4. Click **Create**
5. ✅ See it in the calendar view

### Test Booking Management
1. Click **Bookings** in sidebar
2. View existing bookings
3. Try filtering by date
4. ✅ Bookings displayed

### Test Analytics
1. Click **Analytics** in sidebar
2. View booking statistics
3. See charts and trends
4. ✅ Data visualized

### Test User Management
1. Click **User Management** in sidebar
2. See your admin user
3. View user statistics
4. ✅ Users listed

### Test Audit Logs
1. Click **Audit Logs** in sidebar
2. See your recent actions
3. View action details
4. ✅ Logs recorded

## Common Issues & Quick Fixes

### Issue: "Access Denied" after login
**Fix**: Check user role in database:
```sql
SELECT * FROM candidates WHERE id = 'your_user_id';
```
Update if needed:
```sql
UPDATE candidates SET role = 'ADMIN' WHERE id = 'your_user_id';
```

### Issue: Tables not found
**Fix**: Re-run the migration script in Supabase SQL Editor

### Issue: CORS errors
**Fix**: Check `REACT_APP_API_URL` in client `.env` matches server URL

### Issue: Authentication not working
**Fix**: Verify Supabase credentials in both `.env` files

## Next Steps

Now that everything is working:

1. **Read the guides**:
   - `ADMIN_SETUP.md` - Detailed setup instructions
   - `SLOT_MANAGEMENT_GUIDE.md` - How to manage slots
   - `DEPLOYMENT_CHECKLIST.md` - Production deployment

2. **Configure your first holiday**:
   - Go to Slot Management
   - Add a closed day
   - Test booking on that day

3. **Invite team members**:
   - Have them register
   - Update their roles as needed
   - Test different permission levels

4. **Explore features**:
   - Export bookings to Excel
   - View analytics
   - Check audit logs
   - Manage users

## Quick Reference

### Default Ports
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Admin Routes
- Login: Click "Admin" button
- Dashboard: After login
- Slot Management: Sidebar → Slot Management
- Analytics: Sidebar → Analytics
- Users: Sidebar → User Management
- Audit: Sidebar → Audit Logs

### Slot Status Types
- **Open**: 1200 slots (full day)
- **Half Day Pre**: 600 slots (morning)
- **Half Day Post**: 600 slots (afternoon)
- **Closed**: 0 slots (no bookings)

### User Roles
- **ADMIN**: Full access to everything
- **JCO**: Access to bookings and slots
- **CO**: Access to bookings and slots
- **USER**: Regular user (no admin access)

## Support

Need help?
1. Check `ADMIN_SETUP.md` for detailed instructions
2. Review `IMPLEMENTATION_SUMMARY.md` for technical details
3. Check browser console for errors
4. Check server logs for backend issues

## Success Checklist

- [x] Database tables created
- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] Admin user created
- [x] Can login to admin panel
- [x] Can view all admin sections
- [x] Can create slot configuration
- [x] Can view bookings
- [x] Can see analytics
- [x] Can view audit logs

**Congratulations! Your admin panel is ready to use! 🎉**
