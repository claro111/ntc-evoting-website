import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import Logo from '../components/Logo';
import FloatingBottomNavbar from '../components/FloatingBottomNavbar';
import FloatingCountdownTimer from '../components/FloatingCountdownTimer';
import './ReviewVotePage.css';

const ReviewVotePage = () => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [election, setElection] = useState(null);

  useEffect(() => {
    // Retrieve selected votes from sessionStorage
    const storedVotes = sessionStorage.getItem('selectedVotes');
    if (storedVotes) {
      setSelectedCandidates(JSON.parse(storedVotes));
    } else {
      // If no votes found, redirect back to voting page
      navigate('/voter/voting');
    }
  }, [navigate]);

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

  const groupByPosition = () => {
    const grouped = {};
    selectedCandidates.forEach((candidate) => {
      const positionName = candidate.position || candidate.positionName || 'Unknown Position';
      if (!grouped[positionName]) {
        grouped[positionName] = [];
      }
      grouped[positionName].push(candidate);
    });
    return grouped;
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(true);
  };

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

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
  };

  const handleBackToVoting = () => {
    navigate('/voter/voting');
  };

  const handleSubmitVote = async () => {
    try {
      setSubmitting(true);
      setError('');

      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get voter document
      const voterRef = doc(db, 'voters', user.uid);
      const voterDoc = await getDoc(voterRef);

      if (!voterDoc.exists()) {
        throw new Error('Voter record not found');
      }

      const voterData = voterDoc.data();

      // Check if voter has already voted
      if (voterData.hasVoted) {
        throw new Error('You have already voted');
      }

      // Create anonymized vote records (no voter ID)
      const votePromises = selectedCandidates.map((candidate) =>
        addDoc(collection(db, 'votes'), {
          candidateId: candidate.id,
          position: candidate.position || candidate.positionName,
          timestamp: serverTimestamp(),
        })
      );

      await Promise.all(votePromises);

      // Create vote receipt (with voter ID)
      await addDoc(collection(db, 'vote_receipts'), {
        voterId: user.uid,
        candidates: selectedCandidates.map((c) => ({
          candidateId: c.id,
          candidateName: c.name,
          positionName: c.position || c.positionName,
        })),
        timestamp: serverTimestamp(),
      });

      // Update voter's hasVoted status
      await updateDoc(voterRef, {
        hasVoted: true,
        votedAt: serverTimestamp(),
      });

      // Clear session storage
      sessionStorage.removeItem('selectedVotes');

      // Navigate to confirmation page
      navigate('/voter/vote-confirmation');
    } catch (err) {
      console.error('Error submitting vote:', err);
      setError(err.message || 'Failed to submit vote. Please try again.');
      setSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  const groupedCandidates = groupByPosition();

  return (
    <div className="review-page">
      {/* Logo */}
      <Logo />

      {/* Floating Countdown Timer */}
      <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={getVotingStatus()} />

      {/* Progress Bar */}
      <div className="review-progress-container">
        <div className="review-progress-bar">
          <div className="progress-fill" style={{ width: '66.66%' }}></div>
        </div>
        <div className="review-progress-steps">
          <div className="progress-step completed clickable" onClick={handleBackToVoting}>
            <span>SELECT</span>
          </div>
          <div className="progress-step active">
            <span>REVIEW</span>
          </div>
          <div className="progress-step">
            <span>CONFIRMATION</span>
          </div>
        </div>
      </div>



      {/* Warning Banner */}
      <div className="review-warning-banner">
        <div className="warning-icon">⚠</div>
        <div className="warning-text">
          Please review your selections carefully. Once submitted, your vote cannot be changed.
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="review-error-message">
          {error}
        </div>
      )}

      {/* Your Selections */}
      <div className="review-selections-section">
        <h2 className="review-selections-title">Your Selections</h2>

        {Object.entries(groupedCandidates).map(([positionName, candidates]) => (
          <div key={positionName} className="review-selection-card">
            <div className="review-selection-position-header">
              <span className="review-selection-check-icon">✓</span>
              <span className="review-selection-position-label">{positionName.toUpperCase()}</span>
            </div>
            {candidates.map((candidate) => (
              <div key={candidate.id} className="review-selection-candidate-name">
                {candidate.name.toUpperCase()}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="review-actions-container">
        <button
          onClick={handleConfirmSubmit}
          disabled={submitting}
          className="review-btn-submit"
        >
          Confirm and Submit Vote
        </button>
      </div>

      {/* Floating Bottom Navbar */}
      <FloatingBottomNavbar />

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="review-confirm-modal-overlay" onClick={handleCancelConfirm}>
          <div className="review-confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="review-modal-close" onClick={handleCancelConfirm}>
              ✕
            </button>
            <h3 className="review-confirm-modal-title">Confirm Vote Submission</h3>
            <p className="review-confirm-modal-text">
              Are you sure you want to submit your vote? This action cannot be undone.
            </p>
            <div className="review-confirm-modal-actions">
              <button
                onClick={handleCancelConfirm}
                disabled={submitting}
                className="review-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitVote}
                disabled={submitting}
                className="review-btn-confirm"
              >
                {submitting ? (
                  <>
                    <div className="review-spinner"></div>
                    Submitting...
                  </>
                ) : (
                  'Yes, Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewVotePage;
