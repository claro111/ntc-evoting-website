import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manage Voters', path: '/admin/manage-voters' },
    { name: 'Manage Candidates', path: '/admin/manage-candidates' },
    { name: 'Voting Control', path: '/admin/voting-control' },
    { name: 'Announcements', path: '/admin/announcements' },
  ];

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

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar-logo">
          <svg
            className="admin-logo-image"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="48" fill="#003366" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="50" cy="50" r="35" fill="#fbbf24" />
            <circle cx="50" cy="50" r="20" fill="#003366" />
            <circle cx="50" cy="50" r="8" fill="#fbbf24" />
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x1 = 50 + 20 * Math.cos(angle);
              const y1 = 50 + 20 * Math.sin(angle);
              const x2 = 50 + 35 * Math.cos(angle);
              const y2 = 50 + 35 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#003366"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <p className="admin-logo-text">NTC Admin</p>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">
          <ul className="admin-nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="admin-nav-item">
                <button
                  onClick={() => navigate(item.path)}
                  className={`admin-nav-button ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-button">
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
