import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const ProtectedRoute = ({ children, requiredRoles = [], requiredPermissions = [] }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAccess();
  }, [location.pathname]);

  const checkAccess = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const role = (adminDoc.data().role || 'moderator').trim();
      setUserRole(role);

      // Check role-based access
      if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
        setAccessDenied(true);
      } else {
        setAccessDenied(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking access:', error);
      setAccessDenied(true);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!auth.currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (accessDenied) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Your role: <strong>{userRole}</strong></p>
          <p>Required roles: <strong>{requiredRoles.join(', ')}</strong></p>
          <button 
            onClick={() => window.history.back()} 
            className="btn-back"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;