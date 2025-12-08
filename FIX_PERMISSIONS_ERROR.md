# Fix "Missing or Insufficient Permissions" Error

## Problem
When trying to save candidates or manage voters, you're getting this error:
```
FirebaseError: Missing or insufficient permissions
```

## Root Cause
This error occurs when:
1. You're not logged in as an admin, OR
2. Your admin account exists in Firebase Authentication but NOT in Firestore

## Solution

### Step 1: Check Your Admin Status

Open the admin status checker tool:
```
ntc-evoting/CHECK_ADMIN_STATUS.html
```

This tool will diagnose your admin setup and tell you exactly what's wrong.

### Step 2: Create Admin Document in Firestore

If the checker says "Admin Document Missing", follow these steps:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `ntc-evoting-website`

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - You should see your database with collections

3. **Create/Open the `admins` Collection**
   - If the `admins` collection doesn't exist, click "Start collection"
   - Collection ID: `admins`
   - If it exists, click on it

4. **Add Your Admin Document**
   - Click "Add document"
   - **IMPORTANT**: Document ID must be your User UID
   - To get your User UID:
     - Go to Firebase Console → Authentication → Users
     - Find your email and copy the User UID
     - OR use the CHECK_ADMIN_STATUS.html tool (it shows your UID)

5. **Add These Fields**:
   ```
   Field Name       | Type      | Value
   ----------------|-----------|------------------
   email           | string    | your@email.com
   name            | string    | Your Name
   role            | string    | admin
   createdAt       | timestamp | [current date/time]
   mfaEnabled      | boolean   | false
   ```

6. **Save the Document**
   - Click "Save"
   - The document ID should match your User UID exactly

### Step 3: Verify Firestore Rules

Make sure your Firestore rules are deployed:

```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

The rules should include:
```javascript
match /candidates/{candidateId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}
```

### Step 4: Test Your Admin Access

1. **Log out** from the admin panel
2. **Log back in** with your admin credentials
3. **Try adding a candidate** or managing voters
4. The permission error should be gone!

## Still Having Issues?

### Check 1: Are you logged in?
- Go to `/admin/login`
- Make sure you're signed in with the correct admin account

### Check 2: Does your User UID match the document ID?
- Firebase Console → Authentication → Users → Copy your UID
- Firebase Console → Firestore → admins collection → Check document ID
- They MUST match exactly

### Check 3: Is the role field set to "admin"?
- Open your admin document in Firestore
- Verify the `role` field is set to `"admin"` (string)

### Check 4: Clear browser cache
- Sometimes cached authentication tokens cause issues
- Clear your browser cache and cookies
- Log out and log back in

### Check 5: Check browser console
- Open Developer Tools (F12)
- Go to Console tab
- Look for any error messages
- Share them if you need help

## Quick Reference: Admin Document Structure

```json
{
  "email": "admin@ntc.edu.ph",
  "name": "Admin Name",
  "role": "admin",
  "createdAt": Timestamp,
  "mfaEnabled": false
}
```

**Document ID**: Must be the User UID from Firebase Authentication

## Common Mistakes

❌ **Wrong Document ID**
- Document ID must be the User UID, not a random ID

❌ **Missing Admin Document**
- Having a user in Authentication is not enough
- You MUST also have a document in the `admins` collection

❌ **Wrong Role Value**
- The `role` field must be exactly `"admin"` (lowercase, string)

❌ **Not Logged In**
- You must be logged in to the admin panel
- Check `/admin/login`

## Need More Help?

1. Run the diagnostic tool: `CHECK_ADMIN_STATUS.html`
2. Check the ADMIN_SETUP.md guide
3. Review the Firestore rules in `firestore.rules`
4. Check Firebase Console for any error messages
