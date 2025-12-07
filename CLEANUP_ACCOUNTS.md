# Clean Up Orphaned Accounts

## Problem
You're getting "This email is already registered" but can't find the account in the admin panel.

## Where to Check

### 1. Check ALL Three Tabs in Admin Panel
Go to **Admin Panel → Manage Voters** and check:
- ✅ **Pending Reviews** tab
- ✅ **Registered Voters** tab
- ✅ **Deactivated Voters** tab

The account might be in any of these tabs with different statuses.

### 2. Check Firebase Console - Firestore

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click **Firestore Database**
4. Look in the **voters** collection
5. Search for the email or scroll through all documents
6. If you find it, **delete the document**

### 3. Check Firebase Console - Authentication

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click **Authentication** → **Users**
4. Search for the email
5. If you find it, click the three dots (⋮) → **Delete account**

---

## Complete Cleanup Steps

Follow these steps in order:

### Step 1: Delete from Firestore
1. Firebase Console → Firestore Database
2. Open **voters** collection
3. Find the document with the problematic email
4. Click the document
5. Click the three dots (⋮) → **Delete document**
6. Confirm deletion

### Step 2: Delete from Firebase Auth
1. Firebase Console → Authentication → Users
2. Find the email
3. Click three dots (⋮) → **Delete account**
4. Confirm deletion

### Step 3: Clear Browser Cache
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

### Step 4: Try Registering Again
Now try to register with that email again. It should work!

---

## Alternative: Use a Different Email

If you're just testing, it's easier to use a different email:
- `test1@ntc.edu.ph`
- `test2@ntc.edu.ph`
- `test3@ntc.edu.ph`
- etc.

---

## Prevention

To prevent this in the future, make sure:
1. Always complete the registration process
2. Don't interrupt the registration mid-way
3. Check your internet connection during registration
4. If you need to test, use different test emails

---

## Still Not Working?

If you've done all the above and still get the error:

### Check Browser Console for Errors
1. Press F12 to open Developer Tools
2. Go to the **Console** tab
3. Try registering again
4. Look for any error messages
5. Share the error message for more specific help

### Verify Firebase Configuration
Make sure your Firebase configuration is correct in:
- `ntc-evoting/src/config/firebase.js`
- `ntc-evoting/.env`

### Check Firestore Rules
Make sure your Firestore rules allow creating voter documents:
```bash
cd ntc-evoting
firebase deploy --only firestore:rules
```

---

## Quick Reference

| Location | What to Delete | How |
|----------|---------------|-----|
| Firestore | Voter document | Firestore Database → voters → Delete document |
| Firebase Auth | User account | Authentication → Users → Delete account |
| Browser | Cache | Ctrl+Shift+Delete → Clear cache |

---

## Need More Help?

If none of this works, please provide:
1. The exact email you're trying to register
2. Screenshot of the error
3. Screenshot of all three tabs in Manage Voters (showing it's not there)
4. Screenshot of Firebase Auth Users page (showing if the email exists)

This will help diagnose the exact issue!
