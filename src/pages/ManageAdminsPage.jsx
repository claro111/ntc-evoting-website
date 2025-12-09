import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { db, auth } from '../config/firebase';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSearch } from 'react-icons/fi';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import './ManageAdminsPage.css';

const ManageAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { confirmState, showConfirm } = useConfirm();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'moderator',
    permissions: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUserRole();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchQuery, roleFilter]);

  const fetchCurrentUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const adminDoc = await getDocs(query(collection(db, 'admins')));
        const currentAdminData = adminDoc.docs.find(doc => doc.id === user.uid);
        if (currentAdminData) {
          const userData = {
            id: currentAdminData.id,
            ...currentAdminData.data()
          };
          // Trim role to remove any trailing spaces
          const role = (userData.role || 'moderator').trim();
          setCurrentUserData({...userData, role});
          setCurrentUserRole(role);
          console.log('Current user role set to:', role);
          console.log('Current user data:', userData);
        }
      }
    } catch (error) {
      console.error('Error fetching current user role:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const adminsQuery = query(collection(db, 'admins'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(adminsQuery);
      
      const adminsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = [...admins];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(admin => 
        admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role (trim to handle trailing spaces)
    if (roleFilter !== 'all') {
      filtered = filtered.filter(admin => (admin.role || '').trim() === roleFilter);
    }

    setFilteredAdmins(filtered);
  };

  const getDefaultPermissions = (role) => {
    if (role === 'superadmin') {
      return [
        'Approve Voters', 'View Dashboard', 'Export Reports', 
        'Edit Admins', 'Delete Voters', 'View Candidates', 
        'Reset Votes', 'View Announcements'
      ];
    } else {
      return [
        'View Dashboard', 'View Results', 'View Candidates', 
        'View Announcements'
      ];
    }
  };

  const handleOpenModal = (mode, admin = null) => {
    setModalMode(mode);
    setCurrentAdmin(admin);
    
    if (mode === 'edit' && admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        password: '',
        role: admin.role,
        permissions: admin.permissions || getDefaultPermissions(admin.role)
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'moderator',
        permissions: getDefaultPermissions('moderator')
      });
    }
    
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAdmin(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'moderator'
    });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      
      // Update permissions when role changes
      if (name === 'role') {
        updated.permissions = getDefaultPermissions(value);
      }
      
      return updated;
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (modalMode === 'add') {
        // Create new admin
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setSubmitting(false);
          return;
        }

        // Store current user info before creating new admin
        const currentUser = auth.currentUser;
        const currentUserEmail = currentUser.email;

        // Create a secondary Firebase app instance for creating the new user
        // This prevents auto-login of the new user
        const secondaryApp = initializeApp({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        }, 'Secondary');

        const secondaryAuth = getAuth(secondaryApp);

        try {
          // Create user in Firebase Auth using secondary instance
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            formData.email,
            formData.password
          );

          // Create admin document in Firestore (using primary db connection)
          await setDoc(doc(db, 'admins', userCredential.user.uid), {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            permissions: formData.permissions,
            createdAt: new Date(),
            updatedAt: new Date(),
            mfaEnabled: false
          });

          // Sign out from secondary auth and delete the secondary app
          await secondaryAuth.signOut();
          await deleteApp(secondaryApp);

          setSuccess('Admin added successfully!');
          setTimeout(() => {
            handleCloseModal();
            fetchAdmins();
          }, 1500);
        } catch (innerError) {
          // Clean up secondary app if there's an error
          try {
            await secondaryAuth.signOut();
            await deleteApp(secondaryApp);
          } catch (cleanupError) {
            console.error('Error cleaning up secondary app:', cleanupError);
          }
          throw innerError;
        }
      } else {
        // Update existing admin
        await updateDoc(doc(db, 'admins', currentAdmin.id), {
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions,
          updatedAt: new Date()
        });

        setSuccess('Admin updated successfully!');
        setTimeout(() => {
          handleCloseModal();
          fetchAdmins();
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to save admin. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId, adminEmail) => {
    const confirmed = await showConfirm({
      title: 'Delete Admin',
      message: `Are you sure you want to delete admin: ${adminEmail}?`,
      warningText: 'Note: This will only remove the admin document. You\'ll need to manually delete the user from Firebase Authentication.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'admins', adminId));
      setSuccess('Admin removed successfully!');
      fetchAdmins();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError('Failed to delete admin');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleBadge = (role) => {
    // Trim role to handle trailing spaces
    const trimmedRole = (role || '').trim();
    if (trimmedRole === 'superadmin') {
      return <span className="role-badge superadmin">SUPER ADMIN</span>;
    }
    return <span className="role-badge moderator">MODERATOR</span>;
  };

  const canEditAdmin = (adminRole) => {
    // Trim roles to handle trailing spaces
    const trimmedCurrentRole = (currentUserRole || '').trim();
    // Superadmins can edit anyone
    if (trimmedCurrentRole === 'superadmin') return true;
    // Moderators cannot edit superadmins or other moderators
    return false;
  };

  const canDeleteAdmin = (adminRole) => {
    // Trim role to handle trailing spaces
    const trimmedCurrentRole = (currentUserRole || '').trim();
    // Only superadmins can delete admins
    if (trimmedCurrentRole === 'superadmin') return true;
    return false;
  };

  if (loading) {
    return (
      <div className="manage-admins-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-admins-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Manage Admin Accounts</h1>
          <p>Add and manage admin accounts with customizable permissions</p>
        </div>
        {currentUserRole === 'superadmin' && (
          <button className="btn-add-admin" onClick={() => handleOpenModal('add')}>
            <FiPlus /> Add New Admin
          </button>
        )}
      </div>

      {/* Currently Logged In Banner */}
      {currentUserData && (
        <div className="current-user-banner">
          <div className="current-user-avatar">
            {getInitials(currentUserData.name)}
          </div>
          <div className="current-user-info">
            <p className="current-user-label">Currently Logged In As</p>
            <p className="current-user-email">{currentUserData.email}</p>
            <p className="current-user-role">Role: {currentUserData.role === 'superadmin' ? 'Super Admin' : 'Moderator'}</p>
          </div>
          {currentUserData.id === auth.currentUser?.uid && (
            <div className="current-user-badge">
              <span>👤 You</span>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className="admin-controls">
        <h2>Admin Accounts</h2>
        <div className="controls-row">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Admin Cards Grid */}
      <div className="admins-grid">
        {filteredAdmins.map(admin => (
          <div key={admin.id} className="admin-card">
            <div className="admin-card-header">
              <div className="admin-avatar">
                {getInitials(admin.name)}
              </div>
              {getRoleBadge(admin.role)}
            </div>

            <div className="admin-card-body">
              <h3 className="admin-name">{admin.name}</h3>
              <p className="admin-email">{admin.email}</p>
              <p className="admin-created">
                Created: {admin.createdAt?.toDate ? 
                  new Date(admin.createdAt.toDate()).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  'Unknown'
                }
              </p>

              {admin.id === auth.currentUser?.uid && (
                <div className="you-badge">
                  <span>👤 You</span>
                </div>
              )}

              {/* Permissions */}
              <div className="permissions-section">
                <h4>Active Permissions ({admin.permissions?.length || 0})</h4>
                <div className="permissions-tags">
                  {admin.permissions?.slice(0, 4).map((permission, index) => (
                    <span key={index} className="permission-tag">
                      {permission}
                    </span>
                  ))}
                  {admin.permissions?.length > 4 && (
                    <span className="permission-tag more">
                      +{admin.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(canEditAdmin(admin.role) || canDeleteAdmin(admin.role)) && (
              <div className="admin-card-actions">
                {canEditAdmin(admin.role) && (
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleOpenModal('edit', admin)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                )}
                {canDeleteAdmin(admin.role) && admin.id !== auth.currentUser?.uid && (
                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAdmins.length === 0 && !loading && (
        <div className="empty-state">
          <p>No admins found matching your search criteria</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add New Admin' : 'Edit Admin'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter admin name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={modalMode === 'edit'}
                  placeholder="admin@example.com"
                />
                {modalMode === 'edit' && (
                  <small className="form-hint">Email cannot be changed</small>
                )}
              </div>

              {modalMode === 'add' && (
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                  <small className="form-hint">Minimum 6 characters</small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="moderator">Moderator</option>
                  <option value="superadmin">Superadmin</option>
                </select>
                <small className="form-hint">
                  Superadmins have full access. Moderators have limited permissions.
                </small>
              </div>

              <div className="form-group">
                <label>Permissions ({formData.permissions?.length || 0})</label>
                <div className="permissions-preview">
                  {formData.permissions?.map((permission, index) => (
                    <span key={index} className="permission-tag-preview">
                      {permission}
                    </span>
                  ))}
                </div>
                <small className="form-hint">
                  Permissions are automatically assigned based on the selected role.
                </small>
              </div>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner-small"></div>
                      {modalMode === 'add' ? 'Adding...' : 'Updating...'}
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      {modalMode === 'add' ? 'Add Admin' : 'Update Admin'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          warningText={confirmState.warningText}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          type={confirmState.type}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}

    </div>
  );
};

export default ManageAdminsPage;
