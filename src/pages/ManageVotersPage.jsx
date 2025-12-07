import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { approveVoter, rejectVoter } from '../services/voterService';
import './ManageVotersPage.css';

const ManageVotersPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({
    pendingReviews: 0,
    registeredVoters: 0,
    deactivatedVoters: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingVoters, setPendingVoters] = useState([]);
  const [registeredVoters, setRegisteredVoters] = useState([]);
  const [deactivatedVoters, setDeactivatedVoters] = useState([]);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleReviewClick = (voter) => {
    setSelectedVoter(voter);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedVoter(null);
  };

  const handleApproveReject = async () => {
    // Refresh data after approval/rejection
    await fetchVoterStats();
    await fetchVoters();
    handleCloseModal();
  };

  const handleEditClick = (voter) => {
    setSelectedVoter(voter);
    setShowEditModal(true);
  };

  const handleDeleteClick = (voter) => {
    setSelectedVoter(voter);
    setShowDeleteModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedVoter(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedVoter(null);
  };

  const handleEditSuccess = async () => {
    await fetchVoterStats();
    await fetchVoters();
    handleCloseEditModal();
  };

  const handleDeleteSuccess = async () => {
    await fetchVoterStats();
    await fetchVoters();
    handleCloseDeleteModal();
  };

  useEffect(() => {
    fetchVoterStats();
    fetchVoters();
  }, []);

  const fetchVoterStats = async () => {
    try {
      const votersRef = collection(db, 'voters');

      // Pending reviews count
      const pendingQuery = query(votersRef, where('status', '==', 'pending'));
      const pendingSnapshot = await getCountFromServer(pendingQuery);
      const pendingReviews = pendingSnapshot.data().count;

      // Registered voters count
      const registeredQuery = query(
        votersRef,
        where('status', '==', 'registered'),
        where('emailVerified', '==', true)
      );
      const registeredSnapshot = await getCountFromServer(registeredQuery);
      const registeredVoters = registeredSnapshot.data().count;

      // Deactivated voters count
      const deactivatedQuery = query(votersRef, where('status', '==', 'deactivated'));
      const deactivatedSnapshot = await getCountFromServer(deactivatedQuery);
      const deactivatedVoters = deactivatedSnapshot.data().count;

      setStats({
        pendingReviews,
        registeredVoters,
        deactivatedVoters,
      });
    } catch (err) {
      console.error('Error fetching voter stats:', err);
    }
  };

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const votersRef = collection(db, 'voters');

      // Fetch pending voters
      const pendingQuery = query(votersRef, where('status', '==', 'pending'));
      const pendingSnapshot = await getDocs(pendingQuery);
      const pending = pendingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingVoters(pending);

      // Fetch registered voters
      const registeredQuery = query(
        votersRef,
        where('status', '==', 'registered'),
        where('emailVerified', '==', true)
      );
      const registeredSnapshot = await getDocs(registeredQuery);
      const registered = registeredSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRegisteredVoters(registered);

      // Fetch deactivated voters
      const deactivatedQuery = query(votersRef, where('status', '==', 'deactivated'));
      const deactivatedSnapshot = await getDocs(deactivatedQuery);
      const deactivated = deactivatedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeactivatedVoters(deactivated);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching voters:', err);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filterVoters = (voters) => {
    if (!searchQuery) return voters;
    
    const query = searchQuery.toLowerCase();
    return voters.filter(
      (voter) =>
        voter.fullName?.toLowerCase().includes(query) ||
        voter.studentId?.toLowerCase().includes(query) ||
        voter.email?.toLowerCase().includes(query)
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading voters...</p>
      </div>
    );
  }

  return (
    <div className="manage-voters-page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Voters</h1>
        <p className="page-subtitle">Review and manage voter registrations</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card pending">
          <div className="summary-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Pending Reviews</div>
            <div className="summary-value">{stats.pendingReviews}</div>
          </div>
        </div>

        <div className="summary-card registered">
          <div className="summary-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Registered Voters</div>
            <div className="summary-value">{stats.registeredVoters}</div>
          </div>
        </div>

        <div className="summary-card deactivated">
          <div className="summary-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <div className="summary-content">
            <div className="summary-label">Deactivated Voters</div>
            <div className="summary-value">{stats.deactivatedVoters}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-bar">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, student ID, or email..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button className="filters-button">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Reviews ({stats.pendingReviews})
          </button>
          <button
            className={`tab ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            Registered Voters ({stats.registeredVoters})
          </button>
          <button
            className={`tab ${activeTab === 'deactivated' ? 'active' : ''}`}
            onClick={() => setActiveTab('deactivated')}
          >
            Deactivated Voters ({stats.deactivatedVoters})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pending' && (
          <PendingReviewsTab 
            voters={filterVoters(pendingVoters)} 
            formatDate={formatDate}
            onReviewClick={handleReviewClick}
          />
        )}
        {activeTab === 'registered' && (
          <RegisteredVotersTab 
            voters={filterVoters(registeredVoters)} 
            formatDate={formatDate}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        )}
        {activeTab === 'deactivated' && (
          <DeactivatedVotersTab 
            voters={filterVoters(deactivatedVoters)} 
            formatDate={formatDate}
            onDeletePermanently={async () => {
              await fetchVoterStats();
              await fetchVoters();
            }}
          />
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVoter && (
        <ReviewRegistrationModal
          voter={selectedVoter}
          onClose={handleCloseModal}
          onSuccess={handleApproveReject}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVoter && (
        <EditVoterModal
          voter={selectedVoter}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedVoter && (
        <DeleteVoterModal
          voter={selectedVoter}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

// Pending Reviews Tab Component
const PendingReviewsTab = ({ voters, formatDate, onReviewClick }) => {
  if (voters.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>No pending registrations</p>
      </div>
    );
  }

  return (
    <div className="voter-cards">
      {voters.map((voter) => (
        <div key={voter.id} className="voter-card">
          <div className="voter-card-header">
            <div>
              <h3 className="voter-name">{voter.fullName}</h3>
              <p className="voter-id">Student ID: {voter.studentId}</p>
            </div>
            <span className="badge pending">PENDING</span>
          </div>
          <div className="voter-details">
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{voter.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Year Level:</span>
              <span className="detail-value">{voter.yearLevel}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">School:</span>
              <span className="detail-value">{voter.school}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Registration Date:</span>
              <span className="detail-value">{formatDate(voter.createdAt)}</span>
            </div>
          </div>
          <div className="voter-actions">
            <button className="btn-secondary">View Document</button>
            <button className="btn-primary" onClick={() => onReviewClick(voter)}>Review</button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Registered Voters Tab Component
const RegisteredVotersTab = ({ voters, formatDate, onEditClick, onDeleteClick }) => {
  if (voters.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p>No registered voters</p>
      </div>
    );
  }

  return (
    <div className="voters-table-container">
      <table className="voters-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Student Number</th>
            <th>Email</th>
            <th>Email Status</th>
            <th>Voted Status</th>
            <th>Expires</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {voters.map((voter) => (
            <tr key={voter.id}>
              <td>{voter.fullName}</td>
              <td>{voter.studentId}</td>
              <td>{voter.email}</td>
              <td>
                <span className="badge verified">VERIFIED</span>
              </td>
              <td>
                <span className={`badge ${voter.hasVoted ? 'voted' : 'not-voted'}`}>
                  {voter.hasVoted ? 'VOTED' : 'NOT VOTED'}
                </span>
              </td>
              <td>{formatDate(voter.expirationDate)}</td>
              <td>
                <div className="table-actions">
                  <button className="btn-icon" title="Edit" onClick={() => onEditClick(voter)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button className="btn-icon delete" title="Delete" onClick={() => onDeleteClick(voter)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Deactivated Voters Tab Component
const DeactivatedVotersTab = ({ voters, formatDate, onDeletePermanently }) => {
  const [reactivating, setReactivating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState(null);

  const handleReactivate = async (voter) => {
    if (!window.confirm(`Are you sure you want to reactivate ${voter.fullName}?`)) {
      return;
    }

    try {
      setReactivating(voter.id);

      const voterRef = doc(db, 'voters', voter.id);
      
      // Check if voter was previously verified or if they need to go back to pending
      const updateData = {
        reactivatedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // If voter was rejected before email verification, send them back to pending
      if (!voter.emailVerified) {
        updateData.status = 'pending';
        alert('Voter has been moved back to Pending Reviews. Please review and approve again.');
      } else {
        // If voter was previously verified, reactivate as registered
        updateData.status = 'registered';
        updateData.emailVerified = true;
        alert('Voter has been reactivated successfully!');
      }

      await updateDoc(voterRef, updateData);
      
      window.location.reload(); // Refresh the page to update the lists
    } catch (err) {
      console.error('Error reactivating voter:', err);
      alert('Failed to reactivate voter. Please try again.');
      setReactivating(null);
    }
  };

  const handleDeletePermanently = (voter) => {
    setSelectedVoter(voter);
    setShowDeleteModal(true);
  };

  const confirmDeletePermanently = async () => {
    if (!selectedVoter) return;

    try {
      setDeleting(selectedVoter.id);

      const voterRef = doc(db, 'voters', selectedVoter.id);
      await deleteDoc(voterRef);
      
      alert(`${selectedVoter.fullName} has been permanently deleted from the system.`);
      setShowDeleteModal(false);
      setSelectedVoter(null);
      
      if (onDeletePermanently) {
        await onDeletePermanently();
      }
    } catch (err) {
      console.error('Error permanently deleting voter:', err);
      alert('Failed to permanently delete voter. Please try again.');
      setDeleting(null);
    }
  };

  if (voters.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <p>No deactivated voters</p>
      </div>
    );
  }

  return (
    <>
      <div className="voter-cards">
        {voters.map((voter) => (
          <div key={voter.id} className="voter-card deactivated">
            <div className="voter-card-header">
              <div>
                <h3 className="voter-name">{voter.fullName}</h3>
                <p className="voter-id">Student ID: {voter.studentId}</p>
              </div>
              <span className="badge deactivated">DEACTIVATED</span>
            </div>
            <div className="voter-details">
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{voter.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Year Level:</span>
                <span className="detail-value">{voter.yearLevel}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">School:</span>
                <span className="detail-value">{voter.school}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Deactivated Date:</span>
                <span className="detail-value">{formatDate(voter.updatedAt)}</span>
              </div>
              {voter.deactivatedReason && (
                <div className="detail-row">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value">{voter.deactivatedReason}</span>
                </div>
              )}
            </div>
            <div className="voter-actions">
              <button 
                className="btn-reactivate" 
                onClick={() => handleReactivate(voter)}
                disabled={reactivating === voter.id || deleting === voter.id}
              >
                {reactivating === voter.id ? 'Reactivating...' : '↻ Reactivate'}
              </button>
              <button 
                className="btn-delete-permanent" 
                onClick={() => handleDeletePermanently(voter)}
                disabled={reactivating === voter.id || deleting === voter.id}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteModal && selectedVoter && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Permanently Delete Voter</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3>⚠️ WARNING: This action cannot be undone!</h3>
                <p className="voter-name-delete">{selectedVoter.fullName}</p>
                <p className="voter-id-delete">Student ID: {selectedVoter.studentId}</p>
              </div>

              <div className="delete-info">
                <p><strong>This will permanently:</strong></p>
                <ul>
                  <li>Remove all voter information from the database</li>
                  <li>Delete their account completely</li>
                  <li>This action CANNOT be reversed</li>
                  <li>Vote records (if any) may be affected</li>
                </ul>
                <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem' }}>
                  Are you absolutely sure you want to proceed?
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-reject"
                onClick={confirmDeletePermanently}
                disabled={deleting === selectedVoter.id}
              >
                {deleting === selectedVoter.id ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting === selectedVoter.id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Review Registration Modal Component
const ReviewRegistrationModal = ({ voter, onClose, onSuccess }) => {
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDateForInput = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDocument = () => {
    if (voter.verificationDocumentUrl) {
      window.open(voter.verificationDocumentUrl, '_blank');
    } else {
      alert('No verification document available');
    }
  };

  const handleApprove = async () => {
    if (!expirationDate) {
      setError('Please select an expiration date');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call Cloud Function to approve voter
      const result = await approveVoter(voter.id, expirationDate);
      
      alert(result.message || 'Voter approved successfully! Verification email has been sent.');
      onSuccess();
    } catch (err) {
      console.error('Error approving voter:', err);
      setError(err.message || 'Failed to approve voter. Please try again.');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason (optional):');
    
    if (!window.confirm('Are you sure you want to reject this registration?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Call Cloud Function to reject voter
      const result = await rejectVoter(voter.id, reason);
      
      alert(result.message || 'Voter registration rejected. Notification email has been sent.');
      onSuccess();
    } catch (err) {
      console.error('Error rejecting voter:', err);
      setError(err.message || 'Failed to reject voter. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Review Registration</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Voter Details */}
          <div className="modal-section">
            <h3 className="voter-name-modal">{voter.fullName}</h3>
            <div className="voter-details-grid">
              <div className="detail-item">
                <span className="detail-label-modal">Student ID:</span>
                <span className="detail-value-modal">{voter.studentId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label-modal">Email:</span>
                <span className="detail-value-modal">{voter.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label-modal">Birthdate:</span>
                <span className="detail-value-modal">{formatDisplayDate(voter.birthdate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label-modal">Year Level:</span>
                <span className="detail-value-modal">{voter.yearLevel}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label-modal">School:</span>
                <span className="detail-value-modal">{voter.school}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label-modal">Registration Date:</span>
                <span className="detail-value-modal">{formatDisplayDate(voter.createdAt)}</span>
              </div>
            </div>

            <button className="btn-view-document" onClick={handleViewDocument}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              View Document
            </button>
          </div>

          {/* Expiration Date */}
          <div className="modal-section">
            <label className="form-label">Account Expiration Date:</label>
            <input
              type="date"
              className="form-input-date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="expiration-notice">
              The account will be automatically disabled after this date.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            className="btn-approve"
            onClick={handleApprove}
            disabled={loading}
          >
            {loading ? 'Processing...' : '✓ Approve'}
          </button>
          <button
            className="btn-reject"
            onClick={handleReject}
            disabled={loading}
          >
            {loading ? 'Processing...' : '✕ Reject'}
          </button>
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Voter Modal Component
const EditVoterModal = ({ voter, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: voter.fullName || '',
    studentId: voter.studentId || '',
    email: voter.email || '',
    yearLevel: voter.yearLevel || '',
    school: voter.school || '',
    expirationDate: voter.expirationDate ? new Date(voter.expirationDate.toDate()).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const voterRef = doc(db, 'voters', voter.id);
      await updateDoc(voterRef, {
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        yearLevel: formData.yearLevel,
        school: formData.school,
        expirationDate: Timestamp.fromDate(new Date(formData.expirationDate)),
        updatedAt: Timestamp.now(),
      });

      alert('Voter information updated successfully!');
      onSuccess();
    } catch (err) {
      console.error('Error updating voter:', err);
      setError(err.message || 'Failed to update voter. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Voter Information</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name:</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student ID:</label>
              <input
                type="text"
                name="studentId"
                className="form-input"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year Level:</label>
              <select
                name="yearLevel"
                className="form-input"
                value={formData.yearLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">School:</label>
              <select
                name="school"
                className="form-input"
                value={formData.school}
                onChange={handleChange}
                required
              >
                <option value="">Select School</option>
                <option value="SOB">School of Business (SOB)</option>
                <option value="SOTE">School of Teacher Education (SOTE)</option>
                <option value="SAST">School of Arts, Sciences and Technology (SAST)</option>
                <option value="SOCJ">School of Criminal Justice (SOCJ)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expiration Date:</label>
              <input
                type="date"
                name="expirationDate"
                className="form-input-date"
                value={formData.expirationDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="btn-approve"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Voter Modal Component
const DeleteVoterModal = ({ voter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Move voter to deactivated status instead of deleting
      const voterRef = doc(db, 'voters', voter.id);
      await updateDoc(voterRef, {
        status: 'deactivated',
        deactivatedAt: Timestamp.now(),
        deactivatedReason: 'Deleted by administrator',
        updatedAt: Timestamp.now(),
      });

      alert('Voter has been deactivated successfully.');
      onSuccess();
    } catch (err) {
      console.error('Error deleting voter:', err);
      setError(err.message || 'Failed to delete voter. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Voter</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3>Are you sure you want to delete this voter?</h3>
            <p className="voter-name-delete">{voter.fullName}</p>
            <p className="voter-id-delete">Student ID: {voter.studentId}</p>
          </div>

          <div className="delete-info">
            <p><strong>Important:</strong></p>
            <ul>
              <li>The voter will be moved to deactivated status</li>
              <li>They will no longer be able to log in</li>
              <li>Their vote records will be preserved (if they voted)</li>
              <li>This action can be reversed by an administrator</li>
            </ul>
          </div>

          <div className="form-group">
            <label className="form-label">Type <strong>DELETE</strong> to confirm:</label>
            <input
              type="text"
              className="form-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            className="btn-reject"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
          >
            {loading ? 'Deleting...' : 'Delete Voter'}
          </button>
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageVotersPage;
