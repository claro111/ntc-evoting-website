import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import './VoteReceiptPage.css';

const VoteReceiptPage = () => {
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voterEmail, setVoterEmail] = useState('');

  useEffect(() => {
    fetchVoteReceipt();
  }, []);

  const fetchVoteReceipt = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch voter data for email
      const voterRef = doc(db, 'voters', user.uid);
      const voterDoc = await getDoc(voterRef);
      if (voterDoc.exists()) {
        setVoterEmail(voterDoc.data().email || user.email);
      } else {
        setVoterEmail(user.email);
      }

      // Fetch vote receipt for current user
      const receiptsRef = collection(db, 'vote_receipts');
      const receiptQuery = query(receiptsRef, where('voterId', '==', user.uid));
      const receiptSnapshot = await getDocs(receiptQuery);

      if (!receiptSnapshot.empty) {
        const receiptData = {
          id: receiptSnapshot.docs[0].id,
          ...receiptSnapshot.docs[0].data(),
        };
        setReceipt(receiptData);
      } else {
        setError('No vote receipt found. You may not have voted yet.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching vote receipt:', err);
      setError('Failed to load vote receipt');
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/voter/profile');
  };

  const groupByPosition = () => {
    if (!receipt || !receipt.candidates) return {};

    const grouped = {};
    receipt.candidates.forEach((candidate) => {
      const positionName = candidate.positionName || 'Unknown Position';
      if (!grouped[positionName]) {
        grouped[positionName] = [];
      }
      grouped[positionName].push(candidate);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="receipt-page">
        <div className="receipt-loading">
          <div className="loading-spinner"></div>
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-page">
        <div className="receipt-error">
          <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleClose} className="receipt-btn-close">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const groupedCandidates = groupByPosition();
  const timestamp = receipt?.timestamp?.toDate();

  return (
    <div className="receipt-page">
      <div className="receipt-container">
        {/* Green Check Icon */}
        <div className="receipt-check-icon">
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="receipt-title">VOTE RECEIPT</h1>
        <p className="receipt-subtitle">Your vote has been recorded</p>

        {/* Divider */}
        <div className="receipt-divider"></div>

        {/* Receipt Information */}
        <div className="receipt-info-section">
          <h2 className="receipt-section-title">Receipt Information</h2>
          <div className="receipt-info-row">
            <span className="receipt-info-label">Student ID:</span>
            <span className="receipt-info-value">{voterEmail}</span>
          </div>
          {timestamp && (
            <div className="receipt-info-row">
              <span className="receipt-info-label">Submitted on:</span>
              <span className="receipt-info-value">
                {timestamp.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} {timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Your Votes Section */}
        <div className="receipt-votes-section">
          <h2 className="receipt-section-title">Your Votes</h2>
          <div className="receipt-votes-list">
            {Object.entries(groupedCandidates).map(([positionName, candidates]) => (
              <div key={positionName} className="receipt-vote-card">
                <h3 className="receipt-position-name">{positionName}</h3>
                {candidates.map((candidate, index) => (
                  <div key={index} className="receipt-candidate-item">
                    <span className="receipt-bullet">•</span>
                    <span className="receipt-candidate-name">{candidate.candidateName}</span>
                  </div>
                ))}
              </div>
            ))}
            
            {/* Abstained Positions */}
            {receipt?.abstainedPositions && receipt.abstainedPositions.length > 0 && (
              receipt.abstainedPositions.map((positionName) => (
                <div key={positionName} className="receipt-vote-card abstained">
                  <h3 className="receipt-position-name">{positionName}</h3>
                  <div className="receipt-candidate-item abstained">
                    <span className="receipt-abstain-icon">⊘</span>
                    <span className="receipt-abstain-text">ABSTAINED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notice */}
        <div className="receipt-notice">
          <svg className="receipt-notice-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div className="receipt-notice-text">
            <p>This receipt confirms your vote was recorded.</p>
            <p>Your actual selections remain confidential.</p>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={handleClose} className="receipt-btn-close">
          CLOSED
        </button>
      </div>
    </div>
  );
};

export default VoteReceiptPage;
