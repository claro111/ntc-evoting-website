# Admin Roles & Permissions Guide

This guide explains the role-based admin management system in the NTC E-Voting platform.

## Overview

The system supports two admin roles with different permission levels:
- **Superadmin**: Full system access and control
- **Moderator**: Limited access for day-to-day operations

## Admin Roles

### Superadmin

Superadmins have complete control over the system and can:

✅ **Full Access:**
- Manage all admins (create, edit, delete)
- Manage voters (approve, deactivate, delete)
- Manage candidates (create, edit, delete)
- Control voting system (start, pause, stop)
- Manage announcements (create, edit, delete)
- View and export election results
- Access all system features

### Moderator

Moderators have limited access for operational tasks:

✅ **Allowed:**
- View dashboard and statistics
- Manage voters (approve, deactivate)
- View candidates (read-only)
- View announcements (read-only)
- View election results (read-only)

❌ **Not Allowed:**
- Manage admins
- Create/edit/delete candidates
- Create/edit/delete announcements
- Control voting system
- Delete votes or reset system
- Export sensitive data

## Accessing Manage Admins Page

1. Log in as a **Superadmin**
2. Navigate to **Admin Dashboard**
3. Click on **"Manage Admins"** in the sidebar
4. You can now:
   - View all admins
   - Add new admins
   - Edit existing admins
   - Delete admins (except yourself)

**Note:** Moderators cannot access the Manage Admins page.

## Adding a New Admin

### Method 1: Through Admin Panel (Recommended)

1. Go to **Manage Admins** page
2. Click **"Add Admin"** button
3. Fill in the form:
   - Full Name
   - Email Address
   - Password (minimum 6 characters)
   - Role (Superadmin or Moderator)
4. Click **"Add Admin"**

The system will:
- Create the user in Firebase Authentication
- Create the admin document in Firestore
- Set the appropriate role and permissions

### Method 2: Manual Setup (Firebase Console)

If you need to create the first superadmin or have issues with the panel:

#### Step 1: Create User in Firebase Authentication
1. Go to Firebase Console → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Copy the User UID

#### Step 2: Create Admin Document in Firestore
1. Go to Firebase Console → Firestore Database
2. Navigate to `admins` collection
3. Add document with User UID as Document ID
4. Add fields:
   ```
   email: "admin@example.com" (string)
   name: "Admin Name" (string)
   role: "superadmin" or "moderator" (string)
   createdAt: [current timestamp]
   updatedAt: [current timestamp]
   mfaEnabled: false (boolean)
   ```

## Editing Admin Roles

1. Go to **Manage Admins** page
2. Find the admin you want to edit
3. Click **"Edit"** button
4. Update:
   - Name
   - Role (Superadmin ↔ Moderator)
5. Click **"Update Admin"**

**Note:** Email addresses cannot be changed after creation.

## Deleting Admins

1. Go to **Manage Admins** page
2. Find the admin you want to delete
3. Click **"Delete"** button
4. Confirm the deletion

**Important Notes:**
- You cannot delete yourself
- This removes the admin document from Firestore
- The user account remains in Firebase Authentication
- To fully remove access, also delete the user from Firebase Console

## Permission Matrix

| Feature | Superadmin | Moderator |
|---------|-----------|-----------|
| View Dashboard | ✅ | ✅ |
| Manage Admins | ✅ | ❌ |
| Approve Voters | ✅ | ✅ |
| Deactivate Voters | ✅ | ✅ |
| Delete Voters | ✅ | ❌ |
| Create Candidates | ✅ | ❌ |
| Edit Candidates | ✅ | ❌ |
| Delete Candidates | ✅ | ❌ |
| View Candidates | ✅ | ✅ |
| Start/Stop Voting | ✅ | ❌ |
| Create Announcements | ✅ | ❌ |
| Edit Announcements | ✅ | ❌ |
| Delete Announcements | ✅ | ❌ |
| View Announcements | ✅ | ✅ |
| View Results | ✅ | ✅ |
| Export Results | ✅ | ❌ |
| Delete Votes | ✅ | ❌ |

## Firestore Security Rules

The system uses Firestore security rules to enforce permissions:

```javascript
// Admins collection
match /admins/{adminId} {
  // Admins can read their own data and all other admins
  allow read: if request.auth != null && 
    exists(/databases/$(database)/documents/admins/$(request.auth.uid));
  
  // Only superadmins can create/update/delete admin documents
  allow create, update, delete: if request.auth != null && 
    get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'superadmin';
}
```

## Using Admin Service

The `adminService.js` provides helper functions for checking permissions:

```javascript
import { isSuperAdmin, hasPermission } from '../services/adminService';

// Check if user is superadmin
const isSuper = await isSuperAdmin(userId);

// Check specific permission
const canManageAdmins = await hasPermission(userId, 'manage_admins');
```

## Best Practices

### Security
1. **Use strong passwords** for all admin accounts
2. **Limit superadmin accounts** to only those who need full access
3. **Regular audits** of admin accounts and permissions
4. **Remove access immediately** when admins leave the organization
5. **Enable MFA** for admin accounts in production

### Role Assignment
1. **Superadmin**: Only for system administrators and technical leads
2. **Moderator**: For staff who handle voter approvals and day-to-day operations

### Account Management
1. **Document all admin accounts** and their purposes
2. **Use descriptive names** that identify the person or role
3. **Regular password changes** for security
4. **Monitor admin activity** through Firebase logs

## Troubleshooting

### "Access Denied" Error
- Verify the user exists in both Firebase Auth and Firestore `admins` collection
- Check that the `role` field is set correctly
- Ensure Firestore security rules are deployed

### Cannot See Manage Admins Menu
- Only Superadmins can access this page
- Check your role in Firestore `admins` collection
- Log out and log back in to refresh permissions

### Cannot Add New Admin
- Verify you are logged in as a Superadmin
- Check Firebase Authentication is enabled
- Ensure email is not already in use
- Verify Firestore security rules allow admin creation

### Admin Can Access Features They Shouldn't
- Check the `role` field in Firestore
- Verify security rules are properly deployed
- Clear browser cache and re-login

## Support

For additional help:
1. Check Firebase Console logs
2. Review Firestore security rules
3. Verify admin document structure
4. Contact system administrator

## Related Files

- `/src/pages/ManageAdminsPage.jsx` - Admin management UI
- `/src/services/adminService.js` - Admin permission helpers
- `/firestore.rules` - Security rules
- `/ADMIN_SETUP.md` - Initial admin setup guide
