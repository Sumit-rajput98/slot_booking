# Slot Management Quick Reference Guide

## Overview
The Slot Management system allows you to control daily booking availability with flexible configurations.

## Slot Status Types

### 1. Open (Full Day)
- **Max Slots**: 1200
- **Time Slots**: All 10 slots available
- **Use Case**: Normal working day
- **Example**: Regular weekday

### 2. Half Day Pre (Morning)
- **Max Slots**: 600
- **Time Slots**: Morning slots only (09:00 - 12:00)
- **Use Case**: Half day before holiday, morning operations only
- **Example**: Day before a public holiday

### 3. Half Day Post (Afternoon)
- **Max Slots**: 600
- **Time Slots**: Afternoon slots only (15:00 - 17:00)
- **Use Case**: Half day after holiday, afternoon operations only
- **Example**: Day after a public holiday

### 4. Closed
- **Max Slots**: 0
- **Time Slots**: None
- **Use Case**: Public holidays, maintenance days, special closures
- **Example**: National holidays, facility maintenance

## How to Configure Slots

### Setting a Holiday (Closed Day)

1. Navigate to **Admin Dashboard** → **Slot Management**
2. Click **"Add Configuration"** button
3. Fill in the form:
   - **Date**: Select the holiday date
   - **Status**: Choose "Closed (0 slots)"
   - **Reason**: Enter reason (e.g., "Independence Day", "Facility Maintenance")
4. Click **"Create"**

**Result**: Users will see "Closed" status and cannot book for that day.

### Setting a Half Day

#### Morning Half Day (Pre)
1. Click **"Add Configuration"**
2. Select date
3. Choose **"Half Day Pre (Morning - 600 slots)"**
4. Add reason (e.g., "Half day before Diwali")
5. Click **"Create"**

**Result**: Only morning slots (09:00-12:00) available, 600 total bookings allowed.

#### Afternoon Half Day (Post)
1. Click **"Add Configuration"**
2. Select date
3. Choose **"Half Day Post (Afternoon - 600 slots)"**
4. Add reason (e.g., "Half day after Republic Day")
5. Click **"Create"**

**Result**: Only afternoon slots (15:00-17:00) available, 600 total bookings allowed.

### Editing Existing Configuration

1. Find the date in the configurations table
2. Click the **Edit** icon (pencil)
3. Modify status, max slots, or reason
4. Click **"Update"**

### Deleting Configuration

1. Find the date in the configurations table
2. Click the **Delete** icon (trash)
3. Confirm deletion

**Note**: Deleting a configuration reverts the date to default (Open, 1200 slots).

## Visual Indicators

The availability calendar uses color coding:

- 🟢 **Green**: Open day with available slots
- 🟡 **Yellow**: Half day (Pre or Post)
- 🔴 **Red**: Closed day
- 🟠 **Orange**: Fully booked (no slots available)

## Common Scenarios

### Scenario 1: Public Holiday
**Requirement**: Close facility for Independence Day (August 15)

**Steps**:
1. Add Configuration
2. Date: 2024-08-15
3. Status: Closed
4. Reason: "Independence Day - Public Holiday"
5. Create

### Scenario 2: Half Day Before Holiday
**Requirement**: Morning operations only on August 14 (day before Independence Day)

**Steps**:
1. Add Configuration
2. Date: 2024-08-14
3. Status: Half Day Pre
4. Reason: "Half day before Independence Day"
5. Create

### Scenario 3: Maintenance Day
**Requirement**: Close facility for annual maintenance

**Steps**:
1. Add Configuration
2. Date: Select maintenance date
3. Status: Closed
4. Reason: "Annual Facility Maintenance"
5. Create

### Scenario 4: Reduced Capacity
**Requirement**: Limit bookings due to staff shortage

**Steps**:
1. Add Configuration
2. Date: Select date
3. Status: Open
4. Max Slots: 600 (manually set lower capacity)
5. Reason: "Reduced capacity - Staff shortage"
6. Create

## Planning Ahead

### Weekly Planning
1. Review upcoming week every Monday
2. Configure any half days or closures
3. Notify users of changes

### Monthly Planning
1. At month start, review entire month
2. Configure all known holidays
3. Set half days around major holidays
4. Add maintenance days

### Yearly Planning
1. Configure all public holidays at year start
2. Plan maintenance schedules
3. Set recurring patterns (if using recurring rules feature)

## Slot Calculation Logic

### Full Day (Open)
- Total Slots: 1200
- Per Time Slot: 120 bookings
- Time Slots: 10 slots
- Formula: 1200 ÷ 10 = 120 per slot

### Half Day (Pre/Post)
- Total Slots: 600
- Per Time Slot: 120 bookings
- Time Slots: 5 slots
- Formula: 600 ÷ 5 = 120 per slot

### Closed
- Total Slots: 0
- Per Time Slot: 0
- Time Slots: 0
- No bookings allowed

## User Experience

### What Users See

**Open Day**:
- All 10 time slots visible
- Green "available" indicators
- Can select any slot with availability

**Half Day Pre**:
- Only morning slots visible (09:00-12:00)
- Message: "Half day operations - Morning only"
- Reason displayed if provided

**Half Day Post**:
- Only afternoon slots visible (15:00-17:00)
- Message: "Half day operations - Afternoon only"
- Reason displayed if provided

**Closed Day**:
- No slots visible
- Message: "Facility closed"
- Reason displayed (e.g., "Public Holiday")
- Booking button disabled

## Best Practices

### 1. Plan in Advance
- Configure holidays at least 1 week ahead
- Give users time to plan their bookings

### 2. Provide Clear Reasons
- Always add a reason for closures/changes
- Be specific: "Diwali Holiday" not just "Holiday"

### 3. Review Regularly
- Check configurations weekly
- Remove outdated configurations
- Update as needed

### 4. Communicate Changes
- Notify users of upcoming closures
- Use the reason field effectively
- Consider email notifications (future feature)

### 5. Monitor Bookings
- Check booking counts before reducing capacity
- Don't close days with existing bookings without notice
- Consider cancellation policy

## Troubleshooting

### Issue: Configuration not showing on user side
**Solution**: 
- Refresh the page
- Check date is correct
- Verify configuration was saved

### Issue: Users can still book on closed day
**Solution**:
- Verify status is set to "Closed"
- Check max_slots is 0
- Clear browser cache

### Issue: Wrong number of slots available
**Solution**:
- Check status matches intended configuration
- Verify max_slots value
- Recalculate: max_slots ÷ number_of_time_slots

### Issue: Can't delete configuration
**Solution**:
- Check you have admin permissions
- Verify configuration ID is correct
- Check for database errors in console

## Quick Commands (SQL)

### View all configurations
```sql
SELECT * FROM slot_configurations 
ORDER BY date DESC;
```

### Check specific date
```sql
SELECT * FROM slot_configurations 
WHERE date = '2024-08-15';
```

### View upcoming configurations
```sql
SELECT * FROM slot_configurations 
WHERE date >= CURRENT_DATE 
ORDER BY date ASC;
```

### Delete old configurations
```sql
DELETE FROM slot_configurations 
WHERE date < CURRENT_DATE - INTERVAL '30 days';
```

## Summary

The Slot Management system gives you complete control over booking availability:

- ✅ Set holidays and closures
- ✅ Configure half days (morning/afternoon)
- ✅ Adjust capacity as needed
- ✅ Provide reasons for changes
- ✅ Visual calendar overview
- ✅ Real-time updates for users

Use this system to efficiently manage your facility's booking capacity and ensure smooth operations!
