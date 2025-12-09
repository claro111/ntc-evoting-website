import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import Logo from '../components/Logo';
import FloatingBottomNavbar from '../components/FloatingBottomNavbar';
import FloatingCountdownTimer from '../components/FloatingCountdownTimer';
import './VoterProfilePage.css';

const VoterProfilePage = () => {
  const navigate = useNavigate();
  const [voterData, setVoterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [election, setElection] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    fetchVoterProfile();
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const positionsRef = collection(db, 'positions');
      const positionsSnapshot = await getDocs(positionsRef);
      const positionsData = positionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPositions(positionsData.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

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

  const fetchVoterProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        navigate('/voter/login');
        return;
      }

      const voterRef = doc(db, 'voters', user.uid);
      const voterDoc = await getDoc(voterRef);

      if (voterDoc.exists()) {
        setVoterData({ id: voterDoc.id, ...voterDoc.data() });
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching voter profile:', err);
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    if (!voterData?.hasVoted) return;

    try {
      setLoadingReceipt(true);
      const user = auth.currentUser;

      if (!user) return;

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
        setShowReceiptModal(true);
      }

      setLoadingReceipt(false);
    } catch (err) {
      console.error('Error fetching vote receipt:', err);
      setLoadingReceipt(false);
    }
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
  };

  const groupByPosition = () => {
    if (!receipt || !receipt.candidates) return [];

    // Group candidates by position
    const grouped = {};
    receipt.candidates.forEach((candidate) => {
      const positionName = candidate.positionName || 'Unknown Position';
      if (!grouped[positionName]) {
        grouped[positionName] = [];
      }
      grouped[positionName].push(candidate);
    });

    // Convert to array and sort by position order
    const groupedArray = Object.entries(grouped).map(([positionName, candidates]) => {
      const position = positions.find(p => p.name === positionName);
      return {
        positionName,
        candidates,
        order: position?.order || 999 // Put unknown positions at the end
      };
    });

    // Sort by position order
    groupedArray.sort((a, b) => a.order - b.order);

    return groupedArray;
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      const user = auth.currentUser;

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        handleClosePasswordModal();
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError(err.message || 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/voter/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
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

  if (loading) {
    return (
      <div className="profile-page">
        <Logo />
        <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={getVotingStatus()} />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
        <FloatingBottomNavbar />
      </div>
    );
  }

  if (!voterData) {
    return (
      <div className="profile-page">
        <Logo />
        <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={getVotingStatus()} />
        <div className="profile-loading">
          <p>Profile not found</p>
        </div>
        <FloatingBottomNavbar />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Logo */}
      <Logo />

      {/* Floating Countdown Timer */}
      <FloatingCountdownTimer targetDate={getTargetDate()} votingStatus={getVotingStatus()} />

      <div className="profile-content">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">
            {voterData.fullName || 'Voter Profile'}
          </h1>
        </div>

        {/* Vote Status Section */}
        <div className="profile-section">
          <h2 className="profile-section-title">Vote Status</h2>
          <div className="vote-status-container">
            <div>
              <p className="vote-status-label">Voting Status:</p>
              {voterData.hasVoted ? (
                <div>
                  <span className="status-badge status-voted">
                    <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    VOTED
                  </span>
                  {voterData.votedAt && (
                    <p className="vote-timestamp">
                      Voted on {voterData.votedAt.toDate().toLocaleDateString()} at{' '}
                      {voterData.votedAt.toDate().toLocaleTimeString()}
                    </p>
                  )}
                </div>
              ) : (
                <span className="status-badge status-not-voted">
                  <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  NOT VOTED
                </span>
              )}
            </div>
            {voterData.hasVoted && (
              <button
                onClick={handleGenerateReceipt}
                className="profile-btn-receipt"
                disabled={loadingReceipt}
              >
                {loadingReceipt ? 'Loading...' : 'Generate Receipt'}
              </button>
            )}
          </div>
        </div>

        {/* Account Information Section */}
        <div className="profile-section">
          <h2 className="profile-section-title">Account Information</h2>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <p className="profile-info-label">Student ID</p>
              <p className="profile-info-value">{voterData.studentId || 'N/A'}</p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">Email</p>
              <p className="profile-info-value">{voterData.email || 'N/A'}</p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">Birthdate</p>
              <p className="profile-info-value">
                {voterData.birthdate
                  ? new Date(voterData.birthdate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">Year Level</p>
              <p className="profile-info-value">{voterData.yearLevel || 'N/A'}</p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">School</p>
              <p className="profile-info-value">{voterData.school || 'N/A'}</p>
            </div>
            <div className="profile-info-item">
              <p className="profile-info-label">Registration Date</p>
              <p className="profile-info-value">
                {voterData.createdAt
                  ? voterData.createdAt.toDate().toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button
            onClick={handleChangePassword}
            className="profile-btn profile-btn-primary"
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="profile-btn profile-btn-logout"
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* Floating Bottom Navbar */}
      <FloatingBottomNavbar />

      {/* Vote Receipt Modal */}
      {showReceiptModal && receipt && (
        <div className="profile-modal-overlay" onClick={handleCloseReceiptModal}>
          <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
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
                <span className="receipt-info-value">{voterData.email}</span>
              </div>
              {receipt.timestamp && (
                <div className="receipt-info-row">
                  <span className="receipt-info-label">Submitted on:</span>
                  <span className="receipt-info-value">
                    {receipt.timestamp.toDate().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })} {receipt.timestamp.toDate().toLocaleTimeString('en-US', { 
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
                {groupByPosition().map(({ positionName, candidates }) => (
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
            <button onClick={handleCloseReceiptModal} className="receipt-btn-close">
              CLOSED
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="profile-modal-overlay" onClick={handleClosePasswordModal}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={handleClosePasswordModal}>
              ✕
            </button>
            <h3 className="profile-modal-title">Change Password</h3>

            {passwordError && (
              <div className="profile-alert profile-alert-error">
                <p>{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="profile-alert profile-alert-success">
                <p>{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={handleSubmitPasswordChange}>
              <div className="profile-form-group">
                <div className="profile-input-group">
                  <label className="profile-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    required
                    className="profile-input"
                  />
                </div>
                <div className="profile-input-group">
                  <label className="profile-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    required
                    className="profile-input"
                  />
                </div>
                <div className="profile-input-group">
                  <label className="profile-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                    required
                    className="profile-input"
                  />
                </div>
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={changingPassword}
                  className="profile-btn profile-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="profile-btn profile-btn-submit"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterProfilePage;
