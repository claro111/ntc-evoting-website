import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import SystemNotification from './SystemNotification';
import { useSystemNotification } from '../hooks/useSystemNotification';
import './VoterLayout.css';

const VoterLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  const { notification, showNotification, hideNotification } = useSystemNotification();
  const previousStatusRef = useRef(null);
  const lastAnnouncementIdRef = useRef(null);
  const isInitialLoadRef = useRef(true);

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

  // Monitor election status changes for system notifications
  useEffect(() => {
    const electionRef = doc(db, 'elections', 'current');
    
    const unsubscribe = onSnapshot(electionRef, (electionDoc) => {
      if (electionDoc.exists()) {
        const electionData = electionDoc.data();
        const currentStatus = electionData.status;
        
        // Only show notification if status changed (not on initial load)
        if (previousStatusRef.current !== null && previousStatusRef.current !== currentStatus) {
          if (currentStatus === 'active') {
            // Voting started
            const endTime = electionData.endTime?.toDate();
            const now = new Date();
            const hoursRemaining = endTime ? Math.round((endTime - now) / (1000 * 60 * 60)) : 0;
            
            showNotification(
              'voting-started',
              'VOTING STARTED',
              `Voting Started!\nVoting is now open! You have ${hoursRemaining} hours to cast your vote.`
            );
          } else if (currentStatus === 'closed' && previousStatusRef.current === 'active') {
            // Voting ended
            showNotification(
              'voting-ended',
              'VOTING CLOSED',
              `Voting Ended\nVoting has ended. Thank you for your participation!`
            );
          }
        }
        
        // Update previous status
        previousStatusRef.current = currentStatus;
      }
    });

    return () => unsubscribe();
  }, [showNotification]);

  // Monitor new announcements
  useEffect(() => {
    // Get the most recent announcement on initial load
    const initializeLastAnnouncement = async () => {
      try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(
          announcementsRef,
          where('isActive', '==', true),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const latestAnnouncement = snapshot.docs[0];
          lastAnnouncementIdRef.current = latestAnnouncement.id;
        }
        
        // Mark initial load as complete
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 1000);
      } catch (error) {
        console.error('Error initializing last announcement:', error);
        isInitialLoadRef.current = false;
      }
    };

    initializeLastAnnouncement();

    // Listen for new announcements
    const announcementsRef = collection(db, 'announcements');
    const q = query(
      announcementsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty && !isInitialLoadRef.current) {
        const latestAnnouncement = snapshot.docs[0];
        const announcementData = latestAnnouncement.data();
        
        // Check if this is a new announcement
        if (lastAnnouncementIdRef.current && latestAnnouncement.id !== lastAnnouncementIdRef.current) {
          // Show notification for new announcement
          showNotification(
            'new-announcement',
            'NEW ANNOUNCEMENT',
            `${announcementData.title}\nCheck announcements page.`,
            { id: latestAnnouncement.id, ...announcementData }
          );
        }
        
        // Update last announcement ID
        lastAnnouncementIdRef.current = latestAnnouncement.id;
      }
    });

    return () => unsubscribe();
  }, [showNotification]);

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

      {/* System Notification */}
      <SystemNotification
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        announcementData={notification.announcementData}
        onClose={hideNotification}
      />
    </div>
  );
};

export default VoterLayout;
