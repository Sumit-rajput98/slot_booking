# Admin Panel Testing Guide

## Overview
This guide helps you test the admin panel features, especially the slot management and bulk configuration functionality.

## Fixed Issues

### 1. Half-Day Slot Calculation ✅
**Problem**: Half-day was hardcoded to 600 slots instead of calculating 50% of entered max slots.

**Solution**: Updated both frontend and backend to calculate half-day as `Math.floor(maxSlots / 2)`.

**Test Cases**:
- Max slots = 400 → Half day = 200 ✓
- Max slots = 800 → Half day = 400 ✓
- Max slots = 1200 → Half day = 600 ✓
- Max slots = 1000 → Half day = 500 ✓

### 2. Bulk Date Configuration ✅
**Feature**: Configure multiple dates at once with date range selection.

**Capabilities**:
- Quick select buttons (Next Week, 2 Weeks, Month, 3 Months)
- Custom date range picker
- Status selection (Open/Half Day Pre/Half Day Post/Closed)
- Max slots configuration
- Preview showing total days and capacity
- Validation (max 365 days at once)

## Testing Steps

### Step 1: Admin Login
1. Navigate to admin login page
2. Use default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Verify successful login

### Step 2: Create New Admin (Optional)
1. Click "Create New Admin" button on login page
2. Fill in details:
   - Username: `testadmin`
   - Password: `test123`
   - Full Name: `Test Administrator`
   - Role: `CO` or `JCO` or `ADMIN`
3. Verify admin is created successfully

### Step 3: Test Single Date Configuration
1. Go to Slot Management section
2. Click "Add Single Date" button
3. Select a future date
4. Test each status:

   **Test A: Open Status**
   - Status: Open (Full Day)
   - Max Slots: 400
   - Expected: 400 slots available

   **Test B: Half Day Pre**
   - Status: Half Day Pre (Morning)
   - Max Slots: 400
   - Expected: Automatically calculates to 200 slots
   - Verify helper text shows "Half day: 200 slots (50% of full day)"

   **Test C: Half Day Post**
   - Status: Half Day Post (Afternoon)
   - Max Slots: 800
   - Expected: Automatically calculates to 400 slots
   - Verify helper text shows "Half day: 400 slots (50% of full day)"

   **Test D: Closed**
   - Status: Closed
   - Expected: Max slots set to 0
   - Verify helper text shows "Closed: No bookings allowed"

### Step 4: Test Bulk Configuration
1. Click "Bulk Configure" button
2. Test quick select buttons:
   - Click "Next Week" → Verify date range is 7 days
   - Click "Next 2 Weeks" → Verify date range is 14 days
   - Click "Next Month" → Verify date range is ~30 days
   - Click "Next 3 Months" → Verify date range is ~90 days

3. Test custom date range:
   - Select start date: Today
   - Select end date: 10 days from now
   - Verify preview shows "Total: 11 days"

4. Test configuration:
   - Status: Half Day Pre
   - Max Slots: 1000
   - Expected: Shows "Half day: 500 slots (50% of full day)"
   - Reason: "Testing bulk configuration"

5. Review summary:
   - Verify total days count
   - Verify total capacity = days × slots per day
   - Example: 11 days × 500 slots = 5,500 total capacity

6. Click "Configure X Dates" button
7. Verify success message
8. Check slot availability overview to confirm dates are configured

### Step 5: Test Slot Availability View
1. Set date range filter (e.g., next 30 days)
2. Verify calendar view shows:
   - Date and status badge
   - Max slots
   - Booked slots
   - Available slots
   - Color coding:
     - Green: Open with availability
     - Yellow: Half day
     - Orange: Full (no availability)
     - Red: Closed

### Step 6: Test Edit Configuration
1. Find a configured date in the table
2. Click edit icon
3. Change status from "Open" to "Half Day Pre"
4. Verify max slots automatically halves
5. Save changes
6. Verify update is reflected in availability view

### Step 7: Test Delete Configuration
1. Find a configured date in the table
2. Click delete icon
3. Confirm deletion
4. Verify configuration is removed
5. Verify date reverts to default (1200 slots, open)

## Backend Verification

### Check Database
Run these queries in Supabase SQL Editor:

```sql
-- View all slot configurations
SELECT * FROM slot_configurations ORDER BY date;

-- View configurations with half-day status
SELECT date, status, max_slots 
FROM slot_configurations 
WHERE status IN ('half_day_pre', 'half_day_post');

-- View audit logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

### Verify Half-Day Calculation
Check that `max_slots` in database matches expected values:
- If status is `half_day_pre` or `half_day_post`
- Then `max_slots` should be 50% of the original value
- Example: Original 400 → Stored as 200

## API Testing (Optional)

### Test Endpoints with curl or Postman

1. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

2. **Create Configuration**
```bash
curl -X POST http://localhost:5000/api/admin/slot-management/configuration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2026-02-20",
    "status": "half_day_pre",
    "maxSlots": 800,
    "reason": "Testing"
  }'
```

3. **Get Availability**
```bash
curl -X GET "http://localhost:5000/api/admin/slot-management/availability?startDate=2026-02-11&endDate=2026-03-11" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected Results

### Half-Day Calculation Examples
| Original Max Slots | Status | Calculated Slots |
|-------------------|--------|------------------|
| 400 | half_day_pre | 200 |
| 800 | half_day_post | 400 |
| 1200 | half_day_pre | 600 |
| 1000 | half_day_post | 500 |
| 600 | half_day_pre | 300 |

### Bulk Configuration Examples
| Date Range | Days | Max Slots | Status | Total Capacity |
|-----------|------|-----------|--------|----------------|
| 1 week | 7 | 1200 | open | 8,400 |
| 2 weeks | 14 | 600 | half_day_pre | 8,400 |
| 1 month | 30 | 800 | open | 24,000 |
| 3 months | 90 | 400 | half_day_post | 18,000 |

## Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'logAudit')"
**Status**: FIXED ✅
**Solution**: Converted logAudit to standalone function

### Issue: "POST /api/auth/admin/login 404"
**Status**: FIXED ✅
**Solution**: Using configured http client with correct base URL

### Issue: Half-day always shows 600
**Status**: FIXED ✅
**Solution**: Updated calculation to use 50% of entered max slots

### Issue: Bulk configuration not working
**Status**: WORKING ✅
**Verify**: Check that BulkSlotConfiguration component is imported and modal opens

## Files Modified

### Backend
- `server/controllers/slotManagementController.js` - Fixed half-day calculation (3 locations)

### Frontend
- `client/src/components/admin/SlotManagement.js` - Improved handleStatusChange logic
- `client/src/components/admin/BulkSlotConfiguration.js` - Improved handleStatusChange logic

## Next Steps

1. ✅ Test all scenarios listed above
2. ✅ Verify database entries are correct
3. ✅ Check audit logs are being created
4. ✅ Test with different max slot values
5. ✅ Test bulk configuration with various date ranges
6. 🔄 Deploy to production (if tests pass)
7. 🔄 Change default admin password

## Notes

- Default max slots: 1200
- Half-day calculation: `Math.floor(maxSlots / 2)`
- Bulk configuration limit: 365 days
- All admin actions are logged in audit_logs table
- Regular users don't need passwords (mobile + army number + name)
- Admin authentication uses JWT tokens
