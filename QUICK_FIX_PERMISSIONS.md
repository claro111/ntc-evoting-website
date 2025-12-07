# Quick Fix: Permission Denied Errors

## Problem
You're getting "Failed to save position" and "Failed to start voting session" errors because your admin account doesn't have proper Firestore permissions.

## Solution: Add Your Admin Account to Firestore

### Step 1: Get Your User ID

1. Open browser console (F12)
2. Go to the Console tab
3. Type this and press Enter:
```javascript
firebase.auth().currentUser.uid
```
4. Copy the user ID that appears (it looks like: `abc123xyz456...`)

### Step 2: Add Admin Document in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Firestore Database** in the left menu
4. Click **+ Start collection**
5. Collection ID: `admins`
6. Click **Next**
7. Document ID: **Paste your user ID from Step 1**
8. Add these fields:
   - Field: `role`, Type: `string`, Value: `admin`
   - Field: `email`, Type: `string`, Value: `your-email@example.com`
   - Field: `createdAt`, Type: `timestamp`, Value: (click "Set to current time")
9. Click **Save**

### Step 3: Verify It Works

1. Refresh your admin page
2. Try adding a position again
3. It should work now!

## Alternative: Temporarily Open Permissions (FOR TESTING ONLY)

If you need to test quickly, you can temporarily make Firestore rules more permissive:

1. Go to Firebase Console → Firestore Database
2. Click **Rules** tab
3. Replace with this (TEMPORARY - NOT FOR PRODUCTION):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow all authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**
5. Try adding a position - it should work now
6. **IMPORTANT**: After testing, restore the original secure rules!

## Check Your Current User ID

Open browser console and run:
```javascript
console.log('User ID:', firebase.auth().currentUser.uid);
console.log('Email:', firebase.auth().currentUser.email);
```

Then check if this user ID exists in the `admins` collection in Firestore.

## Still Not Working?

If you still get errors, check the browser console (F12) for the exact error message and share it with me. The error will tell us exactly what's wrong.
