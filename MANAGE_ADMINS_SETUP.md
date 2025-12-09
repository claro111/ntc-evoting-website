# Manage Admins Feature - Setup Guide

## What's New

A complete admin management system with role-based permissions:
- **Superadmin**: Full system control
- **Moderator**: Limited operational access

## Files Created/Modified

### New Files
1. `src/pages/ManageAdminsPage.jsx` - Admin management UI
2. `src/pages/ManageAdminsPage.css` - Styling
3. `src/services/adminService.js` - Permission helpers
4. `ADMIN_ROLES_GUIDE.md` - Complete documentation

### Modified Files
1. `src/App.jsx` - Added route for `/admin/manage-admins`
2. `src/components/AdminLayout.jsx` - Added navigation menu item
3. `firestore.rules` - Updated admin collection rules for role-based access

## Quick Setup Steps

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This updates the security rules to support role-based permissions.

### 2. Update Existing Admin Roles

Go to Firebase Console → Firestore → `admins` collection and add/update the `role` field for each admin:

```
role: "superadmin"  // For full access
role: "moderator"   // For limited access
```

### 3. Test the Feature

1. Log in as a Superadmin
2. Navigate to **Manage Admins** in the sidebar
3. Try adding a new admin
4. Test editing and deleting admins

### 4. Create Your First Moderator

1. Go to Manage Admins page
2. Click "Add Admin"
3. Fill in details and select "Moderator" role
4. Log in with the new account to verify limited access

## Features

### For Superadmins
- ✅ View all admins
- ✅ Add new admins (Superadmin or Moderator)
- ✅ Edit admin details and roles
- ✅ Delete admins (except yourself)
- ✅ See role permissions overview

### For Moderators
- ❌ Cannot access Manage Admins page
- ✅ Can still access other allowed features (voters, view candidates, etc.)

## Permission System

The system enforces permissions at multiple levels:

1. **UI Level**: Buttons/menus hidden based on role
2. **Firestore Rules**: Database-level security
3. **Service Layer**: Helper functions for permission checks

## Usage Example

```javascript
import { isSuperAdmin, hasPermission } from '../services/adminService';

// Check if user is superadmin
const isSuper = await isSuperAdmin(auth.currentUser.uid);

// Check specific permission
const canManage = await hasPermission(auth.currentUser.uid, 'manage_admins');

if (canManage) {
  // Show admin management features
}
```

## Security Notes

⚠️ **Important:**
- Only Superadmins can create/edit/delete admin accounts
- Moderators have read-only access to most features
- You cannot delete your own admin account
- Firestore rules enforce permissions at database level

## Troubleshooting

### Issue: "Add Admin" button not showing
**Solution**: Verify you're logged in as a Superadmin (check `role` field in Firestore)

### Issue: Cannot add new admin
**Solution**: 
1. Check Firestore rules are deployed
2. Verify you have Superadmin role
3. Ensure email is not already in use

### Issue: Moderator can see Manage Admins
**Solution**: 
1. Check the role field in Firestore
2. Clear browser cache
3. Log out and log back in

## Next Steps

1. **Deploy the rules**: `firebase deploy --only firestore:rules`
2. **Update existing admins**: Add `role` field to all admin documents
3. **Test thoroughly**: Try both Superadmin and Moderator accounts
4. **Document your admins**: Keep track of who has what role
5. **Enable MFA**: Consider adding multi-factor authentication for production

## Role Permissions Summary

| Feature | Superadmin | Moderator |
|---------|-----------|-----------|
| Manage Admins | ✅ | ❌ |
| Manage Voters | ✅ | ✅ (limited) |
| Manage Candidates | ✅ | ❌ |
| Voting Control | ✅ | ❌ |
| Announcements | ✅ | ❌ |
| View Results | ✅ | ✅ |

See `ADMIN_ROLES_GUIDE.md` for complete permission matrix.

## Support

For detailed documentation, see:
- `ADMIN_ROLES_GUIDE.md` - Complete guide
- `ADMIN_SETUP.md` - Initial setup
- Firebase Console - For manual admin management
