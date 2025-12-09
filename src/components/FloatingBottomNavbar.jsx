import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import './FloatingBottomNavbar.css';

const FloatingBottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasVoted, setHasVoted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Listen for new announcements
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Get last viewed timestamp from localStorage
    const lastViewedKey = `lastViewedAnnouncements_${user.uid}`;
    const lastViewed = localStorage.getItem(lastViewedKey);
    const lastViewedDate = lastViewed ? new Date(lastViewed) : new Date(0);

    // Listen to active announcements
    const announcementsRef = collection(db, 'announcements');
    const announcementsQuery = query(
      announcementsRef,
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
      // Count announcements created after last viewed time
      const newCount = snapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt > lastViewedDate;
      }).length;

      setUnreadCount(newCount);
    });

    return () => unsubscribe();
  }, []);

  // Clear badge when visiting announcements page
  useEffect(() => {
    if (location.pathname === '/voter/announcements') {
      const user = auth.currentUser;
      if (user) {
        const lastViewedKey = `lastViewedAnnouncements_${user.uid}`;
        localStorage.setItem(lastViewedKey, new Date().toISOString());
        setUnreadCount(0);
      }
    }
  }, [location.pathname]);

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/voter/home',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'announcement',
      label: 'Announcement',
      path: '/voter/announcements',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      id: 'vote',
      label: 'Vote',
      path: '/voter/voting',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/voter/profile',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
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
              {item.icon}
              <span className="nav-label">{item.label}</span>
              {item.id === 'announcement' && unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingBottomNavbar;
