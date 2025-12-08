import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import FloatingCountdownTimer from '../components/FloatingCountdownTimer';
import FloatingBottomNavbar from '../components/FloatingBottomNavbar';
import Logo from '../components/Logo';
import './AnnouncementPage.css';

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [election, setElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState('closed');

  useEffect(() => {
    // Set up real-time listener for elections
    const electionsRef = collection(db, 'elections');
    const activeElectionQuery = query(
      electionsRef,
      where('status', 'in', ['active', 'draft'])
    );

    const unsubscribeElection = onSnapshot(
      activeElectionQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const electionData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          };

          setElection(electionData);

          // Determine voting status
          const now = new Date();
          const startTime = electionData.startTime?.toDate();
          const endTime = electionData.endTime?.toDate();

          if (electionData.status === 'active' && startTime && endTime) {
            if (now >= startTime && now <= endTime) {
              setVotingStatus('active');
            } else if (now < startTime) {
              setVotingStatus('upcoming');
            } else {
              setVotingStatus('closed');
            }
          } else {
            setVotingStatus('closed');
          }
        } else {
          setElection(null);
          setVotingStatus('closed');
        }
      },
      (err) => {
        console.error('Error fetching election data:', err);
      }
    );

    // Set up real-time listener for announcements
    const announcementsRef = collection(db, 'announcements');
    const announcementsQuery = query(
      announcementsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribeAnnouncements = onSnapshot(
      announcementsQuery,
      (snapshot) => {
        const announcementsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        
        setAnnouncements(announcementsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements');
        setLoading(false);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeElection();
      unsubscribeAnnouncements();
    };
  }, []);

  const getTargetDate = () => {
    if (!election) return null;
    
    if (votingStatus === 'upcoming' && election.startTime) {
      return election.startTime.toDate();
    } else if (votingStatus === 'active' && election.endTime) {
      return election.endTime.toDate();
    }
    
    return null;
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleClose = () => {
    setSelectedAnnouncement(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcement-page">
      {/* Logo */}
      <Logo />
      
      {/* Floating Countdown Timer */}
      <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={votingStatus} />

      {/* Main Content */}
      <div className="announcement-content">
        {/* Header */}
        <div className="announcement-header">
          <h1 className="announcement-title">Announcements</h1>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="empty-text">No current announcements</p>
            <p className="empty-subtext">Check back later for updates</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="announcement-card"
                onClick={() => handleAnnouncementClick(announcement)}
              >
                {/* Icon */}
                <div className="announcement-icon">
                  🔔
                </div>

                {/* Content */}
                <div className="announcement-card-content">
                  <h3 className="announcement-card-title">
                    {announcement.title}
                  </h3>
                  <div 
                    className="announcement-card-description"
                    dangerouslySetInnerHTML={{ __html: announcement.description }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="announcement-modal-overlay" onClick={handleClose}>
          <div className="announcement-modal" onClick={(e) => e.stopPropagation()}>
            <div className="announcement-modal-header">
              <div className="announcement-modal-icon">🔔</div>
              <div className="announcement-modal-title-section">
                <h2 className="announcement-modal-title">
                  {selectedAnnouncement.title}
                </h2>
                <p className="announcement-modal-date">
                  {formatDate(selectedAnnouncement.createdAt)}
                </p>
              </div>
            </div>

            {/* Content */}
            <div 
              className="announcement-modal-content"
              dangerouslySetInnerHTML={{ __html: selectedAnnouncement.description }}
            />

            {/* Close Button */}
            <div className="announcement-modal-footer">
              <button
                onClick={handleClose}
                className="announcement-modal-close-btn"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navbar */}
      <FloatingBottomNavbar />
    </div>
  );
};

export default AnnouncementPage;
