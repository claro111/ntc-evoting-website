# Fix Admin Permissions Error

## Problem
You're seeing: `Error fetching admins: FirebaseError: Missing or insufficient permissions`

This happens because your admin account doesn't have the `role` field set in Firestore.

## ✅ Solution (Choose One)

### Option 1: Use the Update Tool (Easiest)

1. Open `UPDATE_ADMIN_ROLE.html` in your browser
2. Login with your admin credentials
3. Click "Check My Admin Status"
4. Select "Super Admin" from the dropdown
5. Click "Update My Role"
6. Refresh your admin panel

### Option 2: Manual Update via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `ntc-evoting-website`
3. Go to **Firestore Database**
4. Find the `admins` collection
5. Find your admin document (the ID should match your user UID)
6. Click "Edit" on your document
7. Add these fields:

```
role: "superadmin"  (string)
permissions: ["Approve Voters", "View Dashboard", "Export Reports", "Edit Admins", "Delete Voters", "View Candidates", "Reset Votes", "View Announcements"]  (array)
```

8. Click "Update"
9. Refresh your admin panel

### Option 3: Using Firebase CLI

Run this command to open Firestore in your browser:

```bash
firebase firestore:shell
```

Then execute:

```javascript
db.collection('admins').doc('YOUR_USER_ID').update({
  role: 'superadmin',
  permissions: ['Approve Voters', 'View Dashboard', 'Export Reports', 'Edit Admins', 'Delete Voters', 'View Candidates', 'Reset Votes', 'View Announcements']
})
```

## How to Find Your User ID

1. Open browser console (F12)
2. Go to your admin panel
3. Type: `firebase.auth().currentUser.uid`
4. Copy the ID shown

OR

1. Go to Firebase Console → Authentication → Users
2. Find your email
3. Copy the User UID

## After Updating

1. **Log out** of your admin panel
2. **Log back in**
3. Navigate to **"Manage Admins"**
4. You should now see the page without errors!

## Verify It Worked

You should see:
- ✅ Yellow "Currently Logged In As" banner with your info
- ✅ Admin cards displaying
- ✅ "Add New Admin" button (if you're a Super Admin)
- ✅ No permission errors in console

## Still Having Issues?

Check these:

1. **Firestore Rules Deployed?**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Admin Document Exists?**
   - Go to Firestore Console
   - Check `admins` collection
   - Your user ID should be there

3. **Role Field Set?**
   - Open your admin document
   - Verify `role` field exists
   - Should be "superadmin" or "moderator"

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

## Role Differences

### Super Admin
- Full system access
- Can manage other admins
- Can create/edit/delete everything

### Moderator
- Limited access
- Can approve voters
- Cannot manage admins
- Read-only for most features

## Need Help?

If you're still seeing errors:
1. Check browser console for specific error messages
2. Verify your Firebase project ID matches in the config
3. Make sure you're logged in with the correct admin account
4. Try logging out and back in

---

**Quick Fix:** Open `UPDATE_ADMIN_ROLE.html` in your browser and follow the steps!
