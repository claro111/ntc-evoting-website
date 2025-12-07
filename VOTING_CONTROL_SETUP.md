# Voting Control Setup Guide

## Initial Setup

The Voting Control page requires an `elections/current` document in Firestore. If you see a loading screen or permission error, follow these steps:

### Option 1: Create Document via Firebase Console (Recommended)

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: `ntc-evoting-website`
3. Navigate to **Firestore Database** in the left sidebar
4. Click **Start collection**
5. Enter collection ID: `elections`
6. Click **Next**
7. Enter document ID: `current`
8. Add the following fields:

   | Field Name | Type | Value |
   |------------|------|-------|
   | status | string | closed |
   | startTime | null | null |
   | endTime | null | null |
   | duration | null | null |
   | createdAt | timestamp | (click "Set to current time") |

9. Click **Save**

### Option 2: Update Firestore Rules (If Permissions Error)

If you're getting a permissions error, you need to update your Firestore rules to allow admins to create the election document.

1. Open `ntc-evoting/firestore.rules`
2. Make sure the rules include:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Elections collection - admins can read/write
    match /elections/{electionId} {
      allow read: if true; // Anyone can read election status
      allow write: if isAdmin();
    }
    
    // ... other rules ...
  }
}
```

3. Deploy the rules:
```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

### Option 3: Create via Code (After Fixing Permissions)

Once permissions are fixed, the page will automatically create the document on first load.

## Troubleshooting

### Page Keeps Loading

**Cause**: The `elections/current` document doesn't exist and there's a permissions error preventing creation.

**Solution**: 
1. Check browser console for errors (F12 → Console tab)
2. If you see "Missing or insufficient permissions", follow Option 2 above
3. If you see other errors, create the document manually using Option 1

### "Unable to create election document" Alert

**Cause**: Your admin account doesn't have permission to create documents in the elections collection.

**Solution**: 
1. Make sure your admin account exists in the `admins` collection in Firestore
2. Update Firestore rules as shown in Option 2
3. Deploy the updated rules

### Start Voting Button Doesn't Work

**Cause**: Permissions issue or missing election document.

**Solution**:
1. Ensure the `elections/current` document exists
2. Check that your admin account is in the `admins` collection
3. Verify Firestore rules allow admins to update the elections collection

## Testing the Voting Control

Once setup is complete:

1. Navigate to **Admin → Voting Control**
2. You should see "Current Voting Status" with "Not Active" badge
3. Enter a duration (e.g., 2 hours)
4. Check the confirmation checkbox
5. Click "Start Voting Session"
6. Status should change to "Active" with countdown timer

## Data Structure

The `elections/current` document structure:

```javascript
{
  status: 'closed' | 'active',
  startTime: Timestamp | null,
  endTime: Timestamp | null,
  duration: number | null, // in hours
  createdAt: Timestamp,
  updatedAt: Timestamp,
  closedAt: Timestamp | null
}
```
