# Role-Based Access Control Implementation

## ✅ Completed

1. **AdminLayout.jsx** - Menu items now filtered by role
   - Superadmin sees all 6 menu items
   - Moderator sees only Dashboard and Manage Voters

## 🔄 What's Implemented Now

### Superadmin Access:
- ✅ Dashboard (full access)
- ✅ Manage Voters (full CRUD)
- ✅ Manage Candidates (full CRUD)
- ✅ Voting Control (full control)
- ✅ Announcements (full CRUD)
- ✅ Manage Admins (full CRUD)

### Moderator Access:
- ✅ Dashboard (view only)
- ✅ Manage Voters (can approve/reject, view list)
- ❌ Cannot see: Manage Candidates, Voting Control, Announcements, Manage Admins

## 📋 Additional Enforcement Needed

To fully enforce permissions, we need to update each page:

### 1. ManageVotersPage.jsx
**Current:** Moderators can see all buttons
**Needed:** 
- Hide "Delete" button for moderators
- Keep "Approve" and "Reject" buttons
- Make it read-only except for approval actions

### 2. ManageCandidatesPage.jsx
**Current:** Accessible to all
**Needed:**
- Redirect moderators if they try to access directly
- Or show "Access Denied" message

### 3. VotingControlPage.jsx
**Current:** Accessible to all
**Needed:**
- Redirect moderators or show "Access Denied"

### 4. ManageAnnouncementsPage.jsx
**Current:** Accessible to all
**Needed:**
- Redirect moderators or show "Access Denied"

### 5. AdminDashboard.jsx
**Current:** Full access for all
**Needed:**
- Hide action buttons for moderators
- Show stats only

## 🎯 Quick Implementation Plan

### Option 1: Create a Permission Hook (Recommended)
Create `src/hooks/usePermissions.js`:
```javascript
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const usePermissions = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setRole(adminDoc.data().role || 'moderator');
        }
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSuperAdmin = role === 'superadmin';
  const isModerator = role === 'moderator';
  
  const can = (action) => {
    const superadminActions = [
      'manage_candidates',
      'manage_announcements',
      'control_voting',
      'manage_admins',
      'delete_voters',
      'export_data'
    ];
    
    const moderatorActions = [
      'view_dashboard',
      'approve_voters',
      'view_voters'
    ];

    if (isSuperAdmin) return true;
    if (isModerator) return moderatorActions.includes(action);
    return false;
  };

  return { role, isSuperAdmin, isModerator, can, loading };
};
```

### Option 2: Update Firestore Rules (Already Done)
The Firestore rules already enforce permissions at the database level.

### Option 3: Page-Level Protection
Add to each protected page:
```javascript
const { isSuperAdmin, loading } = usePermissions();

if (loading) return <div>Loading...</div>;
if (!isSuperAdmin) {
  return (
    <div className="access-denied">
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  );
}
```

## 🚀 Current Status

**Menu Filtering:** ✅ DONE
- Moderators now only see Dashboard and Manage Voters in the sidebar

**Page Protection:** ⚠️ PARTIAL
- Firestore rules prevent unauthorized database operations
- UI still shows buttons/forms that moderators can't use

**Recommended Next Step:**
1. Test the current menu filtering (log in as moderator)
2. Decide if you want full page protection or just hide buttons
3. I can implement either approach based on your preference

## Testing

### As Superadmin:
- Should see all 6 menu items
- Should have full access to all features

### As Moderator:
- Should see only 2 menu items (Dashboard, Manage Voters)
- Cannot navigate to other pages via menu
- If they try direct URL, Firestore rules will block database operations

## Notes

The current implementation provides:
- ✅ Menu-level access control (moderators can't see restricted pages)
- ✅ Database-level security (Firestore rules block unauthorized operations)
- ⚠️ UI-level enforcement (buttons still visible but won't work)

For complete UX, we should also hide/disable buttons that moderators can't use.
