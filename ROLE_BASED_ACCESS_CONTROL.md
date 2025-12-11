# Role-Based Access Control (RBAC) Implementation

## Overview
This document outlines the role-based access control system implemented to secure admin functionality based on user roles.

## User Roles

### Super Admin
- **Full Access**: Complete control over all system features
- **Permissions**: Create, Read, Update, Delete on all resources
- **Pages Access**: All admin pages

### Moderator  
- **Limited Access**: View-only access to specific areas
- **Permissions**: Read-only on selected resources
- **Pages Access**: Dashboard, Candidates (view-only), Announcements (view-only), Results (view-only)

## Permission Matrix

| Resource | Super Admin | Moderator |
|----------|-------------|-----------|
| Dashboard | Full Access | View Only |
| Voters | Full Access | **No Access** |
| Candidates | Full Access | View Only |
| Voting Control | Full Access | **No Access** |
| Announcements | Full Access | View Only |
| Admin Management | Full Access | **No Access** |
| Results | Full Access | View Only |

## Security Implementation

### 1. Route Protection
- **ProtectedRoute Component**: Checks user role before allowing page access
- **Access Denied Page**: Shows when user lacks required permissions
- **Automatic Redirect**: Prevents unauthorized access via direct URLs

### 2. UI Permission Enforcement
- **Conditional Rendering**: Buttons/forms only show for authorized roles
- **Dynamic Permissions**: Real-time permission checking using `usePermissions` hook
- **Visual Feedback**: Clear indication of user role and permissions

### 3. Function-Level Security
- **Permission Checks**: All CRUD operations validate user permissions
- **Role-Based Logic**: Different behavior based on user role
- **Error Handling**: Graceful handling of unauthorized actions

## Implementation Details

### Components Created:
1. **ProtectedRoute.jsx**: Route-level access control
2. **usePermissions.js**: Permission management hook
3. **ProtectedRoute.css**: Styling for access denied pages

### Pages Updated:
1. **App.jsx**: Added route protection with role requirements
2. **ManageCandidatesPage.jsx**: Added view-only mode for moderators
3. **ManageAnnouncementsPage.jsx**: Added view-only mode for moderators

### Permission Enforcement:
- **Create Operations**: Only super admins can add new items
- **Edit Operations**: Only super admins can modify existing items  
- **Delete Operations**: Only super admins can remove items
- **View Operations**: Both roles can view (where permitted)

## Testing the Implementation

### Test Super Admin Access:
1. Login as super admin
2. Verify access to all pages
3. Confirm all CRUD operations work
4. Check all buttons/forms are visible

### Test Moderator Access:
1. Login as moderator
2. Try accessing restricted URLs directly (should show access denied)
3. Verify only permitted pages are accessible
4. Confirm no create/edit/delete buttons are visible
5. Verify view-only functionality works

### Test Direct URL Access:
1. Login as moderator
2. Try navigating to `/admin/manage-voters` (should be blocked)
3. Try navigating to `/admin/voting-control` (should be blocked)
4. Try navigating to `/admin/manage-admins` (should be blocked)

## Security Features

### Route-Level Protection:
- Prevents access via direct URL manipulation
- Shows clear access denied message
- Maintains user session while denying access

### UI-Level Protection:
- Hides unauthorized buttons and forms
- Prevents accidental unauthorized actions
- Provides clear visual feedback

### Permission-Based Rendering:
- Dynamic content based on user role
- Real-time permission checking
- Consistent behavior across all pages

## Role Assignment
Roles are assigned in the `admins` collection in Firestore:
```javascript
{
  email: "admin@ntc.edu.ph",
  role: "superadmin", // or "moderator"
  // ... other fields
}
```

## Error Handling
- **Invalid Roles**: Default to moderator permissions
- **Network Errors**: Graceful fallback to restricted access
- **Missing Permissions**: Clear error messages and guidance

The RBAC system ensures that moderators can only view permitted content and cannot perform unauthorized actions, while super admins maintain full system control.