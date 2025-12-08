import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../config/firebase';
import './VoterLayout.css';

const VoterLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if we're on pages with the new design (Logo + FloatingCountdownTimer + FloatingBottomNavbar)
  const isHomepage = location.pathname === '/voter/home';
  const isAnnouncementPage = location.pathname === '/voter/announcements';
  const isVotingPage = location.pathname === '/voter/voting';
  const isReviewPage = location.pathname === '/voter/review-vote';
  const isConfirmationPage = location.pathname === '/voter/vote-confirmation';
  const isProfilePage = location.pathname === '/voter/profile';

  const hideTopNav = isHomepage || isAnnouncementPage || isVotingPage || isReviewPage || isConfirmationPage || isProfilePage;

  return (
    <div className="voter-layout">
      {/* Top Navigation Bar - Hidden on pages with new design */}
      {!hideTopNav && (
        <nav className="top-nav">
          <div className="nav-container">
            {/* Logo/Brand */}
            <div className="nav-brand">
              <h1 className="brand-text">E-VOTING</h1>
            </div>

            {/* Navigation Links */}
            <div className="nav-links">
              <button
                className={`nav-link ${isActive('/voter/home') ? 'active' : ''}`}
                onClick={() => navigate('/voter/home')}
              >
                Home
              </button>
              <button
                className={`nav-link ${isActive('/voter/announcements') ? 'active' : ''}`}
                onClick={() => navigate('/voter/announcements')}
              >
                Announcements
              </button>
              <button
                className={`nav-link ${isActive('/voter/voting') ? 'active' : ''}`}
                onClick={() => navigate('/voter/voting')}
              >
                Voting
              </button>
              <button
                className={`nav-link ${isActive('/voter/profile') ? 'active' : ''}`}
                onClick={() => navigate('/voter/profile')}
              >
                Profile
              </button>
            </div>

            {/* User Profile */}
            <div className="nav-user">
              <button className="user-profile" onClick={() => navigate('/voter/profile')}>
                <svg className="user-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="user-name">{user?.email?.split('@')[0] || 'User'}</span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className={`voter-content ${hideTopNav ? 'homepage-content' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default VoterLayout;
