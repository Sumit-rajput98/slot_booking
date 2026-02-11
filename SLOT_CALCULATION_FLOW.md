# Slot Calculation Flow

## Overview
This document explains how slot calculations work in the admin panel, especially for half-day configurations.

## Calculation Logic

### Full Day (Open)
```
Input: maxSlots = 1200
Status: open
Output: 1200 slots
```

### Half Day
```
Input: maxSlots = 1200
Status: half_day_pre OR half_day_post
Calculation: Math.floor(1200 / 2)
Output: 600 slots
```

### Closed
```
Input: maxSlots = any
Status: closed
Output: 0 slots
```

## Examples

### Example 1: Standard Configuration
```
User Input:
- Date: 2026-02-15
- Status: Open
- Max Slots: 1200

Result:
- Stored in DB: 1200 slots
- Available for booking: 1200 slots
```

### Example 2: Half Day with Custom Slots
```
User Input:
- Date: 2026-02-16
- Status: Half Day Pre
- Max Slots: 400

Calculation:
- Backend receives: maxSlots = 400
- Calculation: Math.floor(400 / 2) = 200
- Stored in DB: 200 slots

Result:
- Available for booking: 200 slots (morning only)
```

### Example 3: Bulk Configuration
```
User Input:
- Date Range: 2026-02-20 to 2026-02-26 (7 days)
- Status: Half Day Post
- Max Slots: 800

Calculation:
- For each date in range:
  - Backend receives: maxSlots = 800
  - Calculation: Math.floor(800 / 2) = 400
  - Stored in DB: 400 slots

Result:
- 7 dates configured
- Each date: 400 slots (afternoon only)
- Total capacity: 7 × 400 = 2,800 slots
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface                          │
│  (SlotManagement.js / BulkSlotConfiguration.js)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ User selects status
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              handleStatusChange() Function                   │
│                                                              │
│  if (status === 'half_day_pre' || 'half_day_post')         │
│    maxSlots = Math.floor(maxSlots / 2)                     │
│  else if (status === 'closed')                              │
│    maxSlots = 0                                             │
│  else if (status === 'open')                                │
│    maxSlots = unchanged (or restore from half)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Form submission
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Request                               │
│  POST /api/admin/slot-management/configuration              │
│                                                              │
│  Body: {                                                     │
│    date: "2026-02-15",                                      │
│    status: "half_day_pre",                                  │
│    maxSlots: 400,  ← User entered value                    │
│    reason: "Testing"                                        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Backend Controller (slotManagementController.js)    │
│                                                              │
│  createSlotConfiguration(req, res, next) {                  │
│    const { maxSlots, status } = req.body;                   │
│                                                              │
│    let calculatedMaxSlots = maxSlots || 1200;               │
│                                                              │
│    if (status === 'half_day_pre' || 'half_day_post') {     │
│      calculatedMaxSlots = Math.floor(calculatedMaxSlots/2); │
│    }                                                         │
│    else if (status === 'closed') {                          │
│      calculatedMaxSlots = 0;                                │
│    }                                                         │
│                                                              │
│    // Store in database                                     │
│    supabase.from('slot_configurations').insert({            │
│      date,                                                   │
│      status,                                                 │
│      max_slots: calculatedMaxSlots  ← 200 (400/2)          │
│    })                                                        │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Database insert
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Database                           │
│                                                              │
│  slot_configurations table:                                  │
│  ┌────┬────────────┬──────────────┬───────────┬────────┐   │
│  │ id │    date    │    status    │ max_slots │ reason │   │
│  ├────┼────────────┼──────────────┼───────────┼────────┤   │
│  │ 1  │ 2026-02-15 │ half_day_pre │    200    │ Test   │   │
│  └────┴────────────┴──────────────┴───────────┴────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Success response
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                            │
│                                                              │
│  ✅ Success notification                                    │
│  📊 Availability view updated                               │
│  📋 Configuration table refreshed                           │
└─────────────────────────────────────────────────────────────┘
```

## State Management

### Frontend State (Before Submission)
```javascript
formData = {
  date: "2026-02-15",
  status: "half_day_pre",
  maxSlots: 200,  // Already calculated by handleStatusChange
  reason: "Testing"
}
```

### Backend Processing
```javascript
// Receives from frontend
req.body = {
  date: "2026-02-15",
  status: "half_day_pre",
  maxSlots: 200,  // Frontend already calculated
  reason: "Testing"
}

// Backend recalculates for consistency
calculatedMaxSlots = Math.floor(200 / 2) = 100

// Wait, this is wrong! Let's trace the issue...
```

### ⚠️ Important Note

The frontend calculates half-day when user changes status dropdown.
The backend ALSO calculates half-day when receiving the request.

This means:
1. User enters: 400
2. User selects "Half Day Pre"
3. Frontend calculates: 400 / 2 = 200
4. Frontend sends to backend: maxSlots = 200
5. Backend receives: maxSlots = 200
6. Backend calculates: 200 / 2 = 100 ❌ WRONG!

### 🔧 Solution

The frontend should send the ORIGINAL max slots value, not the calculated one.
OR the backend should NOT recalculate if frontend already calculated.

Let me check the current implementation...

Actually, looking at the code more carefully:

**Frontend** (`SlotManagement.js`):
- User enters max slots in input field
- User selects status from dropdown
- `handleStatusChange()` calculates and updates the input field
- User sees the calculated value in the input
- Form submits with the calculated value

**Backend** (`slotManagementController.js`):
- Receives the calculated value from frontend
- Recalculates again (double calculation!)

### 🎯 Correct Flow

**Option A: Frontend calculates, backend trusts**
```javascript
// Frontend
maxSlots = Math.floor(maxSlots / 2)  // 400 → 200
// Send to backend: maxSlots = 200

// Backend
calculatedMaxSlots = maxSlots  // Use as-is: 200
```

**Option B: Frontend sends original, backend calculates**
```javascript
// Frontend
originalMaxSlots = 400
// Send to backend: maxSlots = 400

// Backend
calculatedMaxSlots = Math.floor(maxSlots / 2)  // 400 → 200
```

### 🔍 Current Implementation Analysis

Looking at the code, we have **Option B** implemented:
- Frontend shows calculated value in UI (for preview)
- But when user manually enters a value, it's the full value
- Backend receives and calculates

This works correctly because:
1. User enters 400 in "Max Slots" field
2. User selects "Half Day Pre" from dropdown
3. Frontend calculates 200 and shows in field (user can see preview)
4. User can manually adjust if needed
5. Form submits with whatever is in the field (200)
6. Backend receives 200 and calculates 100... ❌

Wait, this IS a problem! Let me verify...

Actually, re-reading the code:

```javascript
// Frontend sends the value from the input field
maxSlots: formData.maxSlots  // This is what user sees (200)

// Backend receives and recalculates
calculatedMaxSlots = maxSlots || 1200;  // 200
if (status === 'half_day_pre') {
  calculatedMaxSlots = Math.floor(calculatedMaxSlots / 2);  // 100 ❌
}
```

This is indeed double-calculating! But wait...

Let me trace through a real scenario:

1. User opens form
2. Default: maxSlots = 1200, status = 'open'
3. User changes status to 'half_day_pre'
4. handleStatusChange() runs: maxSlots = 1200 / 2 = 600
5. Form now shows: maxSlots = 600
6. User submits
7. Backend receives: maxSlots = 600, status = 'half_day_pre'
8. Backend calculates: 600 / 2 = 300 ❌

This IS wrong!

### 🚨 Bug Found!

The current implementation has a bug where it double-calculates!

### ✅ Fix Required

We need to change the backend to NOT recalculate if the frontend already did.

**Solution**: Remove backend calculation since frontend already handles it.

OR

**Better Solution**: Frontend should send original value, backend calculates.

Let me check what makes more sense...

Actually, looking at the user flow:
- User wants to set max slots to 400
- User wants half day
- Expected result: 200 slots

Current flow:
- User enters 400
- User selects half day
- Frontend shows 200 (calculated)
- User submits
- Backend receives 200 and calculates to 100 (wrong!)

The issue is that the frontend is pre-calculating and showing the result,
but the backend doesn't know this was already calculated.

### 🎯 Correct Solution

**Option 1**: Backend should NOT recalculate
```javascript
// Backend just uses what frontend sends
calculatedMaxSlots = maxSlots;
```

**Option 2**: Frontend should send original + calculated
```javascript
// Frontend sends both
{
  originalMaxSlots: 400,
  maxSlots: 200,
  status: 'half_day_pre'
}

// Backend uses maxSlots directly
calculatedMaxSlots = maxSlots;
```

**Option 3**: Frontend should NOT pre-calculate
```javascript
// Frontend sends original
{
  maxSlots: 400,
  status: 'half_day_pre'
}

// Backend calculates
calculatedMaxSlots = Math.floor(maxSlots / 2);  // 200
```

I think **Option 3** is cleanest, but it means the frontend won't show
the calculated value as a preview...

Actually, the frontend CAN show preview without changing the actual value:

```javascript
// Show calculated value in helper text, not in input
<input value={formData.maxSlots} />  // Shows 400
<p>Half day: {Math.floor(formData.maxSlots / 2)} slots</p>  // Shows 200
```

But the current code changes the input value itself, which is confusing.

Let me check the actual current behavior...

Oh wait! I need to re-read the frontend code more carefully!

```javascript
const handleStatusChange = (status) => {
  let maxSlots = formData.maxSlots || 1200;
  
  if (status === 'half_day_pre' || status === 'half_day_post') {
    maxSlots = Math.floor(maxSlots / 2);
  }
  
  setFormData({ ...formData, status, maxSlots });
};
```

This DOES change the input value. So if user enters 400 and selects half day,
the input changes to show 200.

Then when submitted, backend receives 200 and calculates to 100.

This is definitely wrong!

### 🔧 Final Fix Needed

Remove the calculation from backend since frontend already does it:

```javascript
// Backend should just use the value as-is
let calculatedMaxSlots = maxSlots || 1200;

// Only set to 0 for closed, don't recalculate for half day
if (status === 'closed') {
  calculatedMaxSlots = 0;
}
// Remove the half-day calculation since frontend already did it
```

Wait, but I just "fixed" it to add the calculation! Let me reconsider...

Actually, the BETTER approach is:
- Frontend should NOT modify the input value
- Frontend should only show preview in helper text
- Backend should do the actual calculation

This way:
- User enters 400
- User selects half day
- Input still shows 400
- Helper text shows "Half day: 200 slots"
- Backend receives 400 and calculates to 200

This is cleaner and less confusing!

Let me implement this proper fix...
