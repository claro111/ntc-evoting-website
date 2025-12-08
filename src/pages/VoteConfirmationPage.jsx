import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import Logo from '../components/Logo';
import FloatingBottomNavbar from '../components/FloatingBottomNavbar';
import FloatingCountdownTimer from '../components/FloatingCountdownTimer';
import './VoteConfirmationPage.css';

const VoteConfirmationPage = () => {
  const navigate = useNavigate();
  const [election, setElection] = useState(null);

  useEffect(() => {
    // Set up real-time listener for active election
    const electionsRef = collection(db, 'elections');
    const activeElectionQuery = query(electionsRef, where('status', '==', 'active'));

    const unsubscribeElection = onSnapshot(activeElectionQuery, (electionSnapshot) => {
      if (!electionSnapshot.empty) {
        const electionData = {
          id: electionSnapshot.docs[0].id,
          ...electionSnapshot.docs[0].data(),
        };
        setElection(electionData);
      } else {
        setElection(null);
      }
    });

    return () => {
      unsubscribeElection();
    };
  }, []);

  const getTargetDate = () => {
    if (!election) return null;
    
    const now = new Date();
    const startTime = election.startTime?.toDate();
    const endTime = election.endTime?.toDate();

    if (startTime && now < startTime) {
      return startTime;
    } else if (endTime && now < endTime) {
      return endTime;
    }
    
    return null;
  };

  const getVotingStatus = () => {
    if (!election) return 'closed';
    
    const now = new Date();
    const startTime = election.startTime?.toDate();
    const endTime = election.endTime?.toDate();

    if (startTime && endTime) {
      if (now < startTime) return 'upcoming';
      if (now >= startTime && now <= endTime) return 'active';
    }
    
    return 'closed';
  };

  return (
    <div className="confirmation-page">
      {/* Logo */}
      <Logo />

      {/* Floating Countdown Timer */}
      <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={getVotingStatus()} />

      {/* Progress Bar */}
      <div className="confirmation-progress-container">
        <div className="confirmation-progress-bar">
          <div className="progress-fill" style={{ width: '100%' }}></div>
        </div>
        <div className="confirmation-progress-steps">
          <div className="progress-step completed">
            <span>SELECT</span>
          </div>
          <div className="progress-step completed">
            <span>REVIEW</span>
          </div>
          <div className="progress-step active">
            <span>CONFIRMATION</span>
          </div>
        </div>
      </div>

      {/* Success Content */}
      <div className="confirmation-success-content">
        {/* Ballot Box Icon */}
        <div className="confirmation-ballot-icon">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            {/* Ballot Box */}
            <rect x="50" y="100" width="100" height="60" fill="#FFA500" stroke="#0052cc" strokeWidth="4" rx="4"/>
            <rect x="50" y="90" width="100" height="15" fill="#FFB84D" stroke="#0052cc" strokeWidth="4"/>
            {/* Ballot Paper */}
            <rect x="70" y="50" width="60" height="50" fill="white" stroke="#0052cc" strokeWidth="4" rx="4"/>
            {/* Check Mark */}
            <path d="M85 70 L95 80 L115 60" stroke="#00A8E8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="confirmation-success-title">VOTE SUBMITTED SUCCESSFULLY!</h1>
        <p className="confirmation-success-message">
          Thank you for participating in the election
        </p>
      </div>

      {/* Floating Bottom Navbar */}
      <FloatingBottomNavbar />
    </div>
  );
};

export default VoteConfirmationPage;
