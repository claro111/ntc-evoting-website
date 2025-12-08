import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, writeBatch, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import './VotingControlPage.css';

const VotingControlPage = () => {
  const [loading, setLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState(null);
  const [votingDuration, setVotingDuration] = useState('');
  const [startConfirmed, setStartConfirmed] = useState(false);
  const [closeConfirmed, setCloseConfirmed] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    // Set up real-time listener for election status
    const electionRef = doc(db, 'elections', 'current');
    
    const unsubscribe = onSnapshot(
      electionRef,
      (electionDoc) => {
        if (electionDoc.exists()) {
          const data = electionDoc.data();
          console.log('Election document updated:', data);
          setElectionStatus(data);
          setLoading(false);
        } else {
          console.log('Election document not found, creating default...');
          // Create default election document
          setDoc(electionRef, {
            status: 'closed',
            startTime: null,
            endTime: null,
            duration: null,
            createdAt: Timestamp.now(),
          }).then(() => {
            console.log('Default election document created');
          }).catch((createErr) => {
            console.error('Error creating election document:', createErr);
            // If creation fails, just set a default state
            setElectionStatus({
              status: 'closed',
              startTime: null,
              endTime: null,
              duration: null,
            });
          });
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching election status:', err);
        console.error('Error details:', err.message, err.code);
        // Set default state even on error
        setElectionStatus({
          status: 'closed',
          startTime: null,
          endTime: null,
          duration: null,
        });
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only set up interval if we have election status
    if (!electionStatus) return;

    // Update time remaining immediately
    updateTimeRemaining();

    // Update time remaining every second
    const interval = setInterval(() => {
      updateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [electionStatus?.status, electionStatus?.endTime]);



  const updateTimeRemaining = () => {
    if (!electionStatus || electionStatus.status !== 'active' || !electionStatus.endTime) {
      setTimeRemaining(null);
      return;
    }

    const now = new Date();
    const endTime = electionStatus.endTime.toDate();
    const diff = endTime - now;

    if (diff <= 0) {
      setTimeRemaining('Expired');
      // Auto-close if expired
      handleAutoClose();
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }
  };

  const handleAutoClose = async () => {
    if (electionStatus?.status === 'active') {
      await handleCloseVoting(true);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '---';
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 
      ? `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
      : `${days} day${days !== 1 ? 's' : ''}`;
  };

  const handleStartVoting = async () => {
    if (!startConfirmed) {
      alert('Please confirm that you want to start the voting session');
      return;
    }

    const duration = parseInt(votingDuration);
    if (!duration || duration < 1 || duration > 168) {
      alert('Please enter a valid duration between 1 and 168 hours (7 days)');
      return;
    }

    try {
      setProcessing(true);

      const now = Timestamp.now();
      const endTime = new Date(now.toDate());
      endTime.setHours(endTime.getHours() + duration);

      const electionRef = doc(db, 'elections', 'current');
      await updateDoc(electionRef, {
        status: 'active',
        startTime: now,
        endTime: Timestamp.fromDate(endTime),
        duration: duration,
        updatedAt: now,
      });

      alert('Voting session started successfully!');
      setVotingDuration('');
      setStartConfirmed(false);
      setProcessing(false);
    } catch (err) {
      console.error('Error starting voting:', err);
      alert('Failed to start voting session. Please try again.');
      setProcessing(false);
    }
  };

  const handleCloseVoting = async (isAutoClose = false) => {
    if (!isAutoClose && !closeConfirmed) {
      alert('Please confirm that you want to close the voting session');
      return;
    }

    try {
      setProcessing(true);

      const electionRef = doc(db, 'elections', 'current');
      await updateDoc(electionRef, {
        status: 'closed',
        closedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Trigger vote tally calculation
      await calculateVoteTally();

      if (!isAutoClose) {
        alert('Voting session closed successfully! Vote tally has been calculated.');
      }
      setCloseConfirmed(false);
      setProcessing(false);
    } catch (err) {
      console.error('Error closing voting:', err);
      alert('Failed to close voting session. Please try again.');
      setProcessing(false);
    }
  };

  const calculateVoteTally = async () => {
    try {
      // Get all votes
      const votesRef = collection(db, 'votes');
      const votesSnapshot = await getDocs(votesRef);
      
      // Count votes by candidate
      const voteCounts = {};
      votesSnapshot.docs.forEach((doc) => {
        const vote = doc.data();
        if (vote.candidateId) {
          voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
        }
      });

      // Update candidate vote counts
      const batch = writeBatch(db);
      for (const [candidateId, count] of Object.entries(voteCounts)) {
        const candidateRef = doc(db, 'candidates', candidateId);
        batch.update(candidateRef, { voteCount: count });
      }
      await batch.commit();

      console.log('Vote tally calculated successfully');
    } catch (err) {
      console.error('Error calculating vote tally:', err);
    }
  };

  const handlePublishResults = async () => {
    if (electionStatus?.status === 'active') {
      alert('Cannot publish results while voting is active. Please close the voting session first.');
      return;
    }

    const confirmPublish = window.confirm(
      'Are you sure you want to publish the results? This will make the vote counts visible to all voters.'
    );

    if (!confirmPublish) return;

    try {
      setProcessing(true);

      const electionRef = doc(db, 'elections', 'current');
      await updateDoc(electionRef, {
        resultsPublished: true,
        publishedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      alert('Results published successfully! Voters can now see the election results.');
      setProcessing(false);
    } catch (err) {
      console.error('Error publishing results:', err);
      alert('Failed to publish results. Please try again.');
      setProcessing(false);
    }
  };

  const handleResetSystem = async () => {
    if (!resetConfirmed) {
      alert('Please confirm that you understand this action will permanently reset all voting data');
      return;
    }

    if (electionStatus?.status === 'active') {
      alert('Cannot reset system while voting is active. Please close the voting session first.');
      return;
    }

    const confirmText = prompt('Type "RESET" to confirm this action:');
    if (confirmText !== 'RESET') {
      alert('Reset cancelled');
      return;
    }

    try {
      setProcessing(true);

      // Delete all votes
      const votesRef = collection(db, 'votes');
      const votesSnapshot = await getDocs(votesRef);
      const voteBatch = writeBatch(db);
      votesSnapshot.docs.forEach((doc) => {
        voteBatch.delete(doc.ref);
      });
      await voteBatch.commit();

      // Delete all vote receipts
      const receiptsRef = collection(db, 'vote_receipts');
      const receiptsSnapshot = await getDocs(receiptsRef);
      const receiptBatch = writeBatch(db);
      receiptsSnapshot.docs.forEach((doc) => {
        receiptBatch.delete(doc.ref);
      });
      await receiptBatch.commit();

      // Reset voter hasVoted status
      const votersRef = collection(db, 'voters');
      const votersSnapshot = await getDocs(votersRef);
      const voterBatch = writeBatch(db);
      votersSnapshot.docs.forEach((doc) => {
        voterBatch.update(doc.ref, {
          hasVoted: false,
          votedAt: null,
        });
      });
      await voterBatch.commit();

      // Reset candidate vote counts
      const candidatesRef = collection(db, 'candidates');
      const candidatesSnapshot = await getDocs(candidatesRef);
      const candidateBatch = writeBatch(db);
      candidatesSnapshot.docs.forEach((doc) => {
        candidateBatch.update(doc.ref, {
          voteCount: 0,
        });
      });
      await candidateBatch.commit();

      // Reset election status
      const electionRef = doc(db, 'elections', 'current');
      await updateDoc(electionRef, {
        status: 'closed',
        startTime: null,
        endTime: null,
        duration: null,
        closedAt: null,
        resultsPublished: false,
        publishedAt: null,
        updatedAt: Timestamp.now(),
      });

      alert('System reset successfully! All voting data has been cleared.');
      setResetConfirmed(false);
      setProcessing(false);
    } catch (err) {
      console.error('Error resetting system:', err);
      alert('Failed to reset system. Please try again.');
      setProcessing(false);
    }
  };

  console.log('Render - loading:', loading, 'electionStatus:', electionStatus);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading voting control...</p>
      </div>
    );
  }

  const isActive = electionStatus?.status === 'active';

  return (
    <div className="voting-control-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Voting Control</h1>
        <p className="page-subtitle">Start, stop and manage voting sessions</p>
      </div>

      {/* Current Voting Status */}
      <div className="status-section">
        <h2 className="section-title">Current Voting Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">START TIME</span>
            <span className="status-value">{formatDateTime(electionStatus?.startTime)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">END TIME</span>
            <span className="status-value">{formatDateTime(electionStatus?.endTime)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">DURATION</span>
            <span className="status-value">{formatDuration(electionStatus?.duration)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">TIME REMAINING</span>
            <span className="status-value">{timeRemaining || '---'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">STATUS</span>
            <span className={`status-badge ${isActive ? 'active' : 'not-active'}`}>
              {isActive ? 'Active' : 'Not Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Start Voting Panel */}
      {!isActive && (
        <div className="control-panel">
          <h2 className="section-title">Start Voting Session</h2>
          <div className="panel-content">
            <div className="form-group">
              <label className="form-label">Voting Duration (hours):</label>
              <input
                type="number"
                className="form-input"
                value={votingDuration}
                onChange={(e) => setVotingDuration(e.target.value)}
                placeholder="Enter duration in hours"
                min="1"
                max="168"
              />
              <p className="helper-text">Enter duration in hours (1-168 hours / 7 days max)</p>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={startConfirmed}
                  onChange={(e) => setStartConfirmed(e.target.checked)}
                />
                <span>I confirm that I want to start the voting session</span>
              </label>
            </div>

            <button
              className="btn-start"
              onClick={handleStartVoting}
              disabled={processing || !startConfirmed || !votingDuration}
            >
              {processing ? 'Starting...' : 'Start Voting Session'}
            </button>
          </div>
        </div>
      )}

      {/* Close Voting Panel */}
      {isActive && (
        <div className="control-panel">
          <h2 className="section-title">Close Voting Session</h2>
          <div className="panel-content">
            <p className="panel-description">
              Closing the voting session will prevent voters from casting any more votes and will trigger the final vote tally calculation.
            </p>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={closeConfirmed}
                  onChange={(e) => setCloseConfirmed(e.target.checked)}
                />
                <span>I confirm that I want to close the voting session</span>
              </label>
            </div>

            <button
              className="btn-close"
              onClick={() => handleCloseVoting(false)}
              disabled={processing || !closeConfirmed}
            >
              {processing ? 'Closing...' : 'Close Voting Session'}
            </button>
          </div>
        </div>
      )}

      {/* Publish Results Panel */}
      {!isActive && electionStatus?.status === 'closed' && (
        <div className="control-panel">
          <h2 className="section-title">Publish Results</h2>
          <div className="panel-content">
            <p className="panel-description">
              Publishing results will make the vote counts and winners visible to all voters on the homepage and voting page.
            </p>

            {electionStatus?.resultsPublished ? (
              <div className="published-status">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Results have been published</span>
              </div>
            ) : (
              <button
                className="btn-publish"
                onClick={handlePublishResults}
                disabled={processing}
              >
                {processing ? 'Publishing...' : 'Publish Results'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reset System Panel */}
      <div className="control-panel danger-zone">
        <h2 className="section-title danger">Reset Voting System</h2>
        <div className="panel-content">
          <div className="danger-warning">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p>
              <strong>Danger Zone:</strong> This will reset all voting data associated with this election. 
              This action can only be performed when voting is not active and cannot be undone.
            </p>
          </div>

          <div className="reset-info">
            <p><strong>This will:</strong></p>
            <ul>
              <li>Delete all vote records</li>
              <li>Delete all vote receipts</li>
              <li>Reset all voter "hasVoted" status</li>
              <li>Reset all candidate vote counts</li>
              <li>Reset election status to closed</li>
            </ul>
            <p><strong>This will NOT delete:</strong></p>
            <ul>
              <li>Voter registrations</li>
              <li>Candidate information</li>
              <li>Position information</li>
            </ul>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={resetConfirmed}
                onChange={(e) => setResetConfirmed(e.target.checked)}
                disabled={isActive}
              />
              <span>I understand that this will permanently reset all voting data associated with this election</span>
            </label>
          </div>

          <button
            className="btn-reset"
            onClick={handleResetSystem}
            disabled={processing || !resetConfirmed || isActive}
          >
            {processing ? 'Resetting...' : 'Reset System'}
          </button>

          {isActive && (
            <p className="error-message">Cannot reset system while voting is active</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingControlPage;
