import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUserRole();
  }, []);

  // Listen for pending voter registrations
  useEffect(() => {
    const votersRef = collection(db, 'voters');
    const pendingQuery = query(
      votersRef,
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(pendingQuery, (snapshot) => {
      setPendingCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          // Trim role to remove any trailing spaces
          const role = (adminDoc.data().role || 'moderator').trim();
          setUserRole(role);
          console.log('Admin role loaded:', role);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setLoading(false);
    }
  };

  // Define all menu items with required roles
  const allMenuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', roles: ['superadmin', 'moderator'] },
    { name: 'Manage Voters', path: '/admin/manage-voters', roles: ['superadmin'] },
    { name: 'Manage Candidates', path: '/admin/manage-candidates', roles: ['superadmin', 'moderator'] },
    { name: 'Voting Control', path: '/admin/voting-control', roles: ['superadmin'] },
    { name: 'Announcements', path: '/admin/announcements', roles: ['superadmin', 'moderator'] },
    { name: 'Manage Admins', path: '/admin/manage-admins', roles: ['superadmin'] },
  ];

  // Filter menu items based on user role
  // Show all items while loading, then filter based on role
  const menuItems = loading || !userRole 
    ? allMenuItems 
    : allMenuItems.filter(item => {
        const hasAccess = item.roles.includes(userRole);
        console.log(`Menu item "${item.name}" - Role: ${userRole}, Has access: ${hasAccess}`);
        return hasAccess;
      });
  
  console.log('Current userRole:', userRole, 'Loading:', loading, 'Menu items count:', menuItems.length);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <header className="admin-mobile-header">
        <div className="admin-mobile-logo">
          <img 
            src="/ntc-logo.png" 
            alt="NTC Logo" 
            className="admin-mobile-logo-image"
          />
          <span className="admin-mobile-logo-text">NTC Admin</span>
        </div>
        <button 
          className="admin-hamburger-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="admin-mobile-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <img 
            src="/ntc-logo.png" 
            alt="NTC Logo" 
            className="admin-logo-image"
          />
          <p className="admin-logo-text">NTC Admin</p>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          <ul className="admin-nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="admin-nav-item">
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`admin-nav-button ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                  {item.name === 'Manage Voters' && pendingCount > 0 && (
                    <span className="admin-badge">{pendingCount}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="admin-sidebar-footer">
          <button 
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }} 
            className="admin-logout-button"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
