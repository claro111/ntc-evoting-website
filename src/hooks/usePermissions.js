import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Define role permissions
const ROLE_PERMISSIONS = {
  superadmin: {
    // Full access to everything
    dashboard: { view: true, create: true, edit: true, delete: true },
    voters: { view: true, create: true, edit: true, delete: true },
    candidates: { view: true, create: true, edit: true, delete: true },
    votingControl: { view: true, create: true, edit: true, delete: true },
    announcements: { view: true, create: true, edit: true, delete: true },
    admins: { view: true, create: true, edit: true, delete: true },
    results: { view: true, create: true, edit: true, delete: true }
  },
  moderator: {
    // View-only access to specific areas
    dashboard: { view: true, create: false, edit: false, delete: false },
    voters: { view: false, create: false, edit: false, delete: false }, // No access to voters
    candidates: { view: true, create: false, edit: false, delete: false },
    votingControl: { view: false, create: false, edit: false, delete: false }, // No access
    announcements: { view: true, create: false, edit: false, delete: false },
    admins: { view: false, create: false, edit: false, delete: false }, // No access
    results: { view: true, create: false, edit: false, delete: false }
  }
};

export const usePermissions = () => {
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          const role = (adminDoc.data().role || 'moderator').trim();
          setUserRole(role);
          setPermissions(ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.moderator);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      // Default to moderator permissions on error
      setPermissions(ROLE_PERMISSIONS.moderator);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource, action) => {
    if (!permissions[resource]) return false;
    return permissions[resource][action] || false;
  };

  const canView = (resource) => hasPermission(resource, 'view');
  const canCreate = (resource) => hasPermission(resource, 'create');
  const canEdit = (resource) => hasPermission(resource, 'edit');
  const canDelete = (resource) => hasPermission(resource, 'delete');

  return {
    userRole,
    permissions,
    loading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete
  };
};

export default usePermissions;