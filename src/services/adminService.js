import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get admin data by user ID
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<Object|null>}
 */
export const getAdminData = async (userId) => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    
    if (!adminDoc.exists()) {
      return null;
    }

    return {
      id: adminDoc.id,
      ...adminDoc.data()
    };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    throw error;
  }
};

/**
 * Check if user has specific role
 * @param {string} userId - Firebase Auth user ID
 * @param {string} role - Role to check ('superadmin' or 'moderator')
 * @returns {Promise<boolean>}
 */
export const hasRole = async (userId, role) => {
  try {
    const adminData = await getAdminData(userId);
    
    if (!adminData) {
      return false;
    }

    return adminData.role === role;
  } catch (error) {
    console.error('Error checking role:', error);
    return false;
  }
};

/**
 * Check if user is superadmin
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<boolean>}
 */
export const isSuperAdmin = async (userId) => {
  return await hasRole(userId, 'superadmin');
};

/**
 * Check if user is moderator
 * @param {string} userId - Firebase Auth user ID
 * @returns {Promise<boolean>}
 */
export const isModerator = async (userId) => {
  return await hasRole(userId, 'moderator');
};

/**
 * Get all admins
 * @returns {Promise<Array>}
 */
export const getAllAdmins = async () => {
  try {
    const adminsSnapshot = await getDocs(collection(db, 'admins'));
    
    return adminsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Check if user has permission for an action
 * @param {string} userId - Firebase Auth user ID
 * @param {string} action - Action to check permission for
 * @returns {Promise<boolean>}
 */
export const hasPermission = async (userId, action) => {
  try {
    const adminData = await getAdminData(userId);
    
    if (!adminData) {
      return false;
    }

    const { role } = adminData;

    // Superadmins have all permissions
    if (role === 'superadmin') {
      return true;
    }

    // Moderator permissions
    const moderatorPermissions = [
      'view_dashboard',
      'view_voters',
      'approve_voters',
      'deactivate_voters',
      'view_candidates',
      'view_announcements',
      'view_results'
    ];

    // Superadmin-only permissions
    const superadminPermissions = [
      'manage_admins',
      'manage_candidates',
      'manage_announcements',
      'control_voting',
      'delete_votes',
      'export_results'
    ];

    if (role === 'moderator') {
      return moderatorPermissions.includes(action);
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export default {
  getAdminData,
  hasRole,
  isSuperAdmin,
  isModerator,
  getAllAdmins,
  hasPermission
};
