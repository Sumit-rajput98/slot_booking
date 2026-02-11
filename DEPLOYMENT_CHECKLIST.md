# Deployment Checklist

## Pre-Deployment

### Database Setup
- [ ] Run SQL migration script (`server/migrations/create-admin-tables.sql`)
- [ ] Verify all tables created successfully
- [ ] Check indexes are in place
- [ ] Test database connections
- [ ] Create first admin user

### Environment Variables

#### Backend (.env in server/)
- [ ] `SUPABASE_URL` - Set to production Supabase URL
- [ ] `SUPABASE_SERVICE_KEY` - Set to production service key
- [ ] `PORT` - Set to production port (default: 5000)
- [ ] `NODE_ENV` - Set to "production"
- [ ] `BASE_URL` - Set to production frontend URL

#### Frontend (.env in client/)
- [ ] `REACT_APP_SUPABASE_URL` - Set to production Supabase URL
- [ ] `REACT_APP_SUPABASE_ANON_KEY` - Set to production anon key
- [ ] `REACT_APP_API_URL` - Set to production backend URL

### Code Review
- [ ] All console.logs removed or commented
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Form validations working
- [ ] API endpoints tested
- [ ] Authentication flows tested
- [ ] Role-based access working

### Security
- [ ] CORS configured for production domains
- [ ] Authentication middleware on all admin routes
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS protection in place
- [ ] Rate limiting configured (if applicable)
- [ ] Sensitive data not exposed in responses

## Deployment Steps

### Backend Deployment (Render/Heroku/etc.)

1. **Build Command**
   ```bash
   cd server && npm install
   ```

2. **Start Command**
   ```bash
   cd server && node index.js
   ```

3. **Environment Variables**
   - Add all backend environment variables
   - Verify they're correctly set

4. **Deploy**
   - Push to repository
   - Trigger deployment
   - Monitor logs for errors

5. **Verify**
   - [ ] Health check endpoint working (`/api/health`)
   - [ ] Database connection successful
   - [ ] API endpoints responding
   - [ ] CORS working with frontend

### Frontend Deployment (Vercel/Netlify/etc.)

1. **Build Command**
   ```bash
   cd client && npm install && npm run build
   ```

2. **Output Directory**
   ```
   client/build
   ```

3. **Environment Variables**
   - Add all frontend environment variables
   - Verify they're correctly set

4. **Deploy**
   - Push to repository
   - Trigger deployment
   - Monitor build logs

5. **Verify**
   - [ ] Site loads correctly
   - [ ] API calls working
   - [ ] Authentication working
   - [ ] All pages accessible
   - [ ] Mobile responsive

## Post-Deployment

### Testing

#### User Flow
- [ ] Register new user
- [ ] Login with credentials
- [ ] Book a slot
- [ ] View booking confirmation
- [ ] Check QR code generation
- [ ] Test weekly booking restriction

#### Admin Flow
- [ ] Login as admin
- [ ] View bookings dashboard
- [ ] Create slot configuration
- [ ] Set a holiday (closed day)
- [ ] Set a half day
- [ ] Update booking status
- [ ] Delete a booking
- [ ] Export bookings to Excel
- [ ] View analytics
- [ ] Check audit logs
- [ ] Manage users
- [ ] Update user roles

#### Edge Cases
- [ ] Try booking on closed day
- [ ] Try booking on half day
- [ ] Try booking when slots full
- [ ] Try booking twice in same week
- [ ] Try accessing admin without login
- [ ] Try accessing admin as regular user

### Performance
- [ ] Page load times acceptable
- [ ] API response times good
- [ ] Database queries optimized
- [ ] Images/assets optimized
- [ ] Caching configured

### Monitoring
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Analytics configured (Google Analytics, etc.)
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Log aggregation (if applicable)
- [ ] Alerts configured for critical errors

### Documentation
- [ ] README updated with production URLs
- [ ] API documentation current
- [ ] Admin guide shared with team
- [ ] User guide created (if needed)
- [ ] Troubleshooting guide available

### Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Backup schedule configured
- [ ] Recovery procedure documented
- [ ] Test restore from backup

## Production URLs

### Backend
- Production URL: `___________________________`
- Health Check: `___________________________/api/health`

### Frontend
- Production URL: `___________________________`
- Admin Panel: `___________________________` (click Admin button)

### Database
- Supabase Project: `___________________________`
- Dashboard URL: `___________________________`

## Access Credentials

### Admin Users
1. Email: `___________________________`
   Role: ADMIN
   
2. Email: `___________________________`
   Role: JCO

### Database
- Supabase Project ID: `___________________________`
- Region: `___________________________`

## Rollback Plan

If deployment fails:

1. **Backend Rollback**
   - Revert to previous deployment
   - Check logs for errors
   - Fix issues in development
   - Redeploy

2. **Frontend Rollback**
   - Revert to previous deployment
   - Clear CDN cache if applicable
   - Verify old version working

3. **Database Rollback**
   - Restore from backup if needed
   - Revert migrations if necessary
   - Document what went wrong

## Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check user feedback
- [ ] Verify all features working
- [ ] Address any critical bugs
- [ ] Update documentation as needed

### Week 2-4
- [ ] Review analytics
- [ ] Optimize slow queries
- [ ] Gather user feedback
- [ ] Plan improvements
- [ ] Schedule maintenance window

### Monthly
- [ ] Review audit logs
- [ ] Check database size/performance
- [ ] Update dependencies
- [ ] Security audit
- [ ] Backup verification

## Support Contacts

### Technical
- Developer: `___________________________`
- DevOps: `___________________________`
- Database Admin: `___________________________`

### Business
- Product Owner: `___________________________`
- Stakeholder: `___________________________`

## Known Issues

Document any known issues or limitations:

1. Issue: `___________________________`
   Workaround: `___________________________`
   
2. Issue: `___________________________`
   Workaround: `___________________________`

## Future Enhancements

Planned features for next release:

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Recurring slot rules
- [ ] Booking approval workflow
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Bulk operations
- [ ] API rate limiting

## Sign-Off

- [ ] Developer: _________________ Date: _______
- [ ] QA: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] Stakeholder: _________________ Date: _______

---

**Deployment Date**: _________________
**Version**: _________________
**Deployed By**: _________________
