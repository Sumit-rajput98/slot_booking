# 🎯 Complete Admin Panel System

A comprehensive admin panel for the Slot Booking System with authentication, slot management, user management, analytics, and audit logging.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)
- [Support](#support)

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login with Supabase Auth
- Role-based access control (ADMIN, JCO, CO, USER)
- Protected admin routes
- Session management with automatic logout

### 📅 Slot Management
- **Configure daily availability**:
  - Open (1200 slots)
  - Half Day Pre (600 slots, morning only)
  - Half Day Post (600 slots, afternoon only)
  - Closed (0 slots)
- Visual calendar overview
- Reason tracking for changes
- Real-time updates for users

### 👥 User Management
- View all registered users
- Update user roles
- Delete users
- User statistics dashboard
- Search and filter capabilities

### 📊 Advanced Analytics
- Total bookings overview
- Status breakdown (confirmed, cancelled, completed, no_show)
- Top purposes and locations
- Popular time slots
- Daily booking trends
- Date range filtering

### 📝 Audit Logging
- Complete action tracking
- User attribution
- Timestamp recording
- IP address tracking
- Before/after values
- Export to Excel

### 📦 Booking Management
- View all bookings
- Update booking status
- Delete single or multiple bookings
- Export to Excel
- QR code generation
- Advanced filtering

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Supabase account
- Git

### Installation

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd slot-booking
   npm run install-all
   ```

2. **Setup database**:
   - Open Supabase SQL Editor
   - Run `server/migrations/create-admin-tables.sql`

3. **Configure environment**:
   
   Backend (`server/.env`):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   PORT=5000
   NODE_ENV=development
   ```
   
   Frontend (`client/.env`):
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start servers**:
   ```bash
   npm run dev
   ```

5. **Create admin user**:
   - Navigate to Admin section
   - Click Register
   - Select ADMIN role
   - Login

**That's it! 🎉**

For detailed instructions, see [QUICK_START.md](QUICK_START.md)

## 📚 Documentation

### Setup & Configuration
- **[QUICK_START.md](QUICK_START.md)** - Get started in 10 minutes
- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** - Detailed setup guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Production deployment

### User Guides
- **[SLOT_MANAGEMENT_GUIDE.md](SLOT_MANAGEMENT_GUIDE.md)** - How to manage slots
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical overview

## 🏗️ Architecture

### Tech Stack

**Frontend**:
- React 18
- Tailwind CSS
- Axios
- React Router
- React DatePicker
- Moment.js

**Backend**:
- Node.js
- Express.js
- Supabase (PostgreSQL)
- XLSX (Excel export)

**Authentication**:
- Supabase Auth
- JWT tokens
- Role-based access control

### Project Structure

```
slot-booking/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.js      # Main admin interface
│   │   │   ├── admin/
│   │   │   │   ├── SlotManagement.js  # Slot configuration
│   │   │   │   ├── UserManagement.js  # User CRUD
│   │   │   │   ├── Analytics.js       # Analytics dashboard
│   │   │   │   └── AuditLogs.js       # Audit trail
│   │   │   └── ...
│   │   ├── api/
│   │   │   ├── admin.js               # Admin API calls
│   │   │   ├── slotManagement.js      # Slot API calls
│   │   │   └── ...
│   │   └── ...
│   └── ...
│
├── server/                    # Backend Express app
│   ├── controllers/
│   │   ├── adminController.js         # Admin operations
│   │   ├── slotManagementController.js # Slot operations
│   │   ├── userManagementController.js # User operations
│   │   ├── auditLogController.js      # Audit operations
│   │   └── ...
│   ├── routes/
│   │   ├── adminRoutes.js             # Admin endpoints
│   │   ├── slotManagementRoutes.js    # Slot endpoints
│   │   ├── userManagementRoutes.js    # User endpoints
│   │   ├── auditLogRoutes.js          # Audit endpoints
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js                    # Authentication
│   │   └── validation.js              # Input validation
│   ├── migrations/
│   │   └── create-admin-tables.sql    # Database schema
│   └── ...
│
└── Documentation/
    ├── QUICK_START.md
    ├── ADMIN_SETUP.md
    ├── SLOT_MANAGEMENT_GUIDE.md
    ├── DEPLOYMENT_CHECKLIST.md
    └── IMPLEMENTATION_SUMMARY.md
```

### Database Schema

**New Tables**:
- `slot_configurations` - Daily slot overrides
- `recurring_slot_rules` - Pattern-based rules
- `audit_logs` - Complete audit trail

**Enhanced Tables**:
- `bookings` - Added `status` column
- `candidates` - Added `role` column

## 🔌 API Reference

### Authentication
All admin endpoints require authentication via Supabase JWT token.

**Headers**:
```
Authorization: Bearer <token>
```

### Endpoints

#### Slot Management
```
GET    /api/admin/slot-management/configurations
POST   /api/admin/slot-management/configuration
PUT    /api/admin/slot-management/configuration/:id
DELETE /api/admin/slot-management/configuration/:id
GET    /api/admin/slot-management/availability
```

#### User Management
```
GET    /api/admin/users
GET    /api/admin/users/stats
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/role
DELETE /api/admin/users/:id
```

#### Booking Management
```
GET    /api/admin/bookings
DELETE /api/admin/bookings/:id
DELETE /api/admin/bookings (bulk)
PUT    /api/admin/bookings/:id/status
GET    /api/admin/export
```

#### Analytics
```
GET    /api/admin/stats
GET    /api/admin/analytics
```

#### Audit Logs
```
GET    /api/admin/audit-logs
GET    /api/admin/audit-logs/stats
GET    /api/admin/audit-logs/export
```

For detailed API documentation, see [ADMIN_SETUP.md](ADMIN_SETUP.md#api-endpoints)

## 🔒 Security

### Implemented Security Features

1. **Authentication**: Supabase Auth with JWT tokens
2. **Authorization**: Role-based access control
3. **Audit Trail**: All actions logged with user, timestamp, IP
4. **CORS**: Configured allowed origins
5. **Input Validation**: Server-side validation on all inputs
6. **SQL Injection Prevention**: Parameterized queries
7. **Session Management**: Automatic timeout

### Best Practices

- Never commit `.env` files
- Use strong passwords for admin accounts
- Regularly review audit logs
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting (recommended)

## 🚀 Deployment

### Quick Deploy

1. **Backend** (Render/Heroku):
   ```bash
   Build: cd server && npm install
   Start: cd server && node index.js
   ```

2. **Frontend** (Vercel/Netlify):
   ```bash
   Build: cd client && npm install && npm run build
   Output: client/build
   ```

3. **Database**: Already on Supabase ✅

For complete deployment guide, see [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

### Environment Variables

**Production Backend**:
- `SUPABASE_URL` - Production Supabase URL
- `SUPABASE_SERVICE_KEY` - Production service key
- `NODE_ENV=production`
- `PORT` - Server port
- `BASE_URL` - Frontend URL

**Production Frontend**:
- `REACT_APP_SUPABASE_URL` - Production Supabase URL
- `REACT_APP_SUPABASE_ANON_KEY` - Production anon key
- `REACT_APP_API_URL` - Backend API URL

## 📖 Usage Examples

### Setting a Holiday

```javascript
// Admin clicks "Add Configuration"
{
  date: "2024-12-25",
  status: "closed",
  reason: "Christmas Holiday"
}
// Result: No bookings allowed on Dec 25
```

### Setting a Half Day

```javascript
// Morning only
{
  date: "2024-12-24",
  status: "half_day_pre",
  reason: "Christmas Eve - Morning only"
}
// Result: Only morning slots (09:00-12:00) available
```

### Updating Booking Status

```javascript
// Admin updates booking
PUT /api/admin/bookings/123/status
{
  status: "completed"
}
// Result: Booking marked as completed, audit log created
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Register new admin user
- [ ] Login with credentials
- [ ] Create slot configuration
- [ ] Set a holiday (closed day)
- [ ] Set a half day
- [ ] View analytics
- [ ] Update booking status
- [ ] Delete a booking
- [ ] Export bookings
- [ ] View audit logs
- [ ] Manage users
- [ ] Update user role

### Automated Testing (Recommended)

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Access Denied" after login
```sql
-- Check user role
SELECT * FROM candidates WHERE id = 'user_id';

-- Update role if needed
UPDATE candidates SET role = 'ADMIN' WHERE id = 'user_id';
```

**Issue**: Slot configurations not showing
```sql
-- Verify table exists
SELECT * FROM slot_configurations LIMIT 5;
```

**Issue**: CORS errors
- Check `REACT_APP_API_URL` matches backend URL
- Verify CORS configuration in `server/index.js`

For more troubleshooting, see [ADMIN_SETUP.md](ADMIN_SETUP.md#troubleshooting)

## 📞 Support

### Documentation
- [Quick Start Guide](QUICK_START.md)
- [Admin Setup Guide](ADMIN_SETUP.md)
- [Slot Management Guide](SLOT_MANAGEMENT_GUIDE.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

### Getting Help
1. Check documentation above
2. Review browser console for errors
3. Check server logs
4. Review Supabase logs
5. Check GitHub issues

## 🎯 Key Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ | Supabase Auth with JWT |
| Authorization | ✅ | Role-based access control |
| Slot Management | ✅ | Configure daily availability |
| User Management | ✅ | CRUD operations for users |
| Analytics | ✅ | Comprehensive booking analytics |
| Audit Logs | ✅ | Complete action tracking |
| Booking Management | ✅ | Status updates, bulk operations |
| Excel Export | ✅ | Bookings and audit logs |
| QR Codes | ✅ | Booking confirmation codes |

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Recurring slot rules
- [ ] Booking approval workflow
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] API rate limiting
- [ ] Multi-language support

## 📄 License

MIT License - See LICENSE file for details

## 👏 Acknowledgments

Built with:
- React
- Express.js
- Supabase
- Tailwind CSS
- And many other amazing open-source libraries

---

**Ready to get started? Check out the [Quick Start Guide](QUICK_START.md)!**

For questions or issues, please refer to the documentation or create an issue on GitHub.

**Happy booking! 🎉**
