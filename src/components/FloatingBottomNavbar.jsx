import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import './FloatingBottomNavbar.css';

const FloatingBottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const checkVotingStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const voterRef = doc(db, 'voters', user.uid);
          const voterDoc = await getDoc(voterRef);
          if (voterDoc.exists()) {
            setHasVoted(voterDoc.data().hasVoted || false);
          }
        } catch (error) {
          console.error('Error checking voting status:', error);
        }
      }
    };

    checkVotingStatus();
  }, [location.pathname]);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/voter/home',
    },
    {
      id: 'announcement',
      label: 'Announcement',
      path: '/voter/announcements',
    },
    {
      id: 'vote',
      label: 'Vote',
      path: '/voter/voting',
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/voter/profile',
    },
  ];

  const isActive = (path) => {
    // For Vote button, also highlight on review and confirmation pages
    if (path === '/voter/voting') {
      return location.pathname === path || 
             location.pathname === '/voter/review-vote' || 
             location.pathname === '/voter/vote-confirmation';
    }
    return location.pathname === path;
  };

  const handleNavigate = (path) => {
    // Allow navigation to all pages including voting page
    // The voting page itself will handle the hasVoted state
    navigate(path);
  };

  return (
    <nav className="floating-bottom-navbar">
      <div className="navbar-container">
        {navItems.map((item) => {
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
              aria-label={item.label}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingBottomNavbar;
