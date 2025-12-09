import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import './ArchiveResultsPage.css';

const ArchiveResultsPage = () => {
  const [archivedElections, setArchivedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionResults, setElectionResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const { confirmState, showConfirm } = useConfirm();

  useEffect(() => {
    fetchArchivedElections();
  }, []);

  const fetchArchivedElections = async () => {
    try {
      setLoading(true);
      
      const electionsRef = collection(db, 'elections');
      
      // Try with orderBy first
      try {
        const publishedQuery = query(
          electionsRef,
          where('resultsPublished', '==', true),
          orderBy('publishedAt', 'desc')
        );
        
        const snapshot = await getDocs(publishedQuery);
        const elections = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime?.toDate(),
          endTime: doc.data().endTime?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate(),
        }));
        
        setArchivedElections(elections);
      } catch (indexError) {
        console.log('Index not available, using simple query:', indexError);
        
        // Fallback: Fetch without orderBy and sort in memory
        const simpleQuery = query(
          electionsRef,
          where('resultsPublished', '==', true)
        );
        
        const snapshot = await getDocs(simpleQuery);
        const elections = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startTime: doc.data().startTime?.toDate(),
          endTime: doc.data().endTime?.toDate(),
          publishedAt: doc.data().publishedAt?.toDate(),
        }));
        
        // Sort in memory by publishedAt
        elections.sort((a, b) => {
          if (!a.publishedAt) return 1;
          if (!b.publishedAt) return -1;
          return b.publishedAt - a.publishedAt;
        });
        
        setArchivedElections(elections);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching archived elections:', error);
      setLoading(false);
    }
  };

  const viewElectionDetails = async (election) => {
    setSelectedElection(election);
    setLoadingResults(true);
    
    try {
      // Check if election has snapshot data (new format)
      if (election.snapshot) {
        setElectionResults(election.snapshot.results);
        setLoadingResults(false);
        return;
      }
      
      // Fallback: Fetch current data (old format - for backwards compatibility)
      // Fetch positions
      const positionsSnapshot = await getDocs(collection(db, 'positions'));
      const positions = positionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Fetch candidates
      const candidatesSnapshot = await getDocs(collection(db, 'candidates'));
      const candidates = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch votes
      const votesSnapshot = await getDocs(collection(db, 'votes'));
      const votes = votesSnapshot.docs.map(doc => doc.data());
      
      // Calculate results by position
      const results = positions.map(position => {
        const positionCandidates = candidates
          .filter(c => c.position === position.name)
          .map(candidate => {
            const voteCount = votes.filter(v => v.candidateId === candidate.id).length;
            return { ...candidate, voteCount };
          })
          .sort((a, b) => {
            // If one candidate is manually selected as winner, they should be ranked first
            if (a.manuallySelectedWinner && !b.manuallySelectedWinner) return -1;
            if (!a.manuallySelectedWinner && b.manuallySelectedWinner) return 1;
            // Otherwise sort by vote count
            return b.voteCount - a.voteCount;
          });
        
        const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);
        
        const candidatesWithStats = positionCandidates.map((candidate, index) => ({
          ...candidate,
          rank: index + 1,
          percentage: totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0,
          isWinner: candidate.manuallySelectedWinner || index < (position.maxSelection || 1)
        }));
        
        return {
          position,
          candidates: candidatesWithStats,
          totalVotes
        };
      });
      
      setElectionResults(results);
      setLoadingResults(false);
    } catch (error) {
      console.error('Error fetching election results:', error);
      setLoadingResults(false);
    }
  };

  const handleDeleteElection = async (electionId, electionName) => {
    const confirmDelete = await showConfirm({
      title: 'Delete Archived Election',
      message: `Are you sure you want to delete the archived election "${electionName || 'Election'}"?\n\nThis action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'elections', electionId));
      showToast('Election deleted successfully!', 'success');
      // Refresh the list
      fetchArchivedElections();
    } catch (error) {
      console.error('Error deleting election:', error);
      showToast('Failed to delete election. Please try again.', 'error');
    }
  };

  const closeModal = () => {
    setSelectedElection(null);
    setElectionResults(null);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="archive-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading archived elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="archive-page">
      {/* Header */}
      <div className="archive-header">
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="archive-title">Archived Election Results</h1>
        <p className="archive-subtitle">View historical election data and results</p>
      </div>

      {/* Elections List */}
      {archivedElections.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <p className="empty-text">No archived elections found</p>
          <p className="empty-subtext">Closed elections will appear here</p>
        </div>
      ) : (
        <div className="elections-grid">
          {archivedElections.map((election) => (
            <div key={election.id} className="election-card">
              <div className="election-card-header">
                <h3 className="election-card-title">{election.name || 'Election'}</h3>
                <span className="election-status-badge">Closed</span>
              </div>
              
              <div className="election-card-body">
                <div className="election-info-row">
                  <span className="info-label">Voting Started:</span>
                  <span className="info-value">{formatDate(election.startTime)}</span>
                </div>
                <div className="election-info-row">
                  <span className="info-label">Voting Closed:</span>
                  <span className="info-value">{formatDate(election.endTime)}</span>
                </div>
                {election.resultsPublished && (
                  <div className="results-published-badge">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Results Published
                  </div>
                )}
              </div>
              
              <div className="election-card-footer">
                <button 
                  onClick={() => viewElectionDetails(election)} 
                  className="view-details-button"
                >
                  View Details
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElection(election.id, election.name);
                  }} 
                  className="delete-election-button"
                  title="Delete this archived election"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Election Details Modal */}
      {selectedElection && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedElection.name || 'Election Details'}</h2>
              <button onClick={closeModal} className="modal-close-button">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3 className="detail-section-title">Election Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">Closed & Published</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Voting Started:</span>
                    <span className="detail-value">{formatDate(selectedElection.startTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Voting Closed:</span>
                    <span className="detail-value">{formatDate(selectedElection.endTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Published Date:</span>
                    <span className="detail-value">{formatDate(selectedElection.publishedAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* Election Results */}
              {loadingResults ? (
                <div className="results-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading results...</p>
                </div>
              ) : electionResults && electionResults.length > 0 ? (
                <div className="results-section">
                  <h3 className="detail-section-title">Election Results</h3>
                  {electionResults.map((positionResult) => (
                    <div key={positionResult.position.id} className="position-results">
                      <div className="position-results-header">
                        <h4 className="position-results-name">{positionResult.position.name}</h4>
                        <span className="position-results-info">
                          Total Votes: {positionResult.totalVotes} | Winners: {positionResult.position.maxSelection || 1}
                        </span>
                      </div>
                      
                      <div className="candidates-results-list">
                        {positionResult.candidates.map((candidate) => (
                          <div 
                            key={candidate.id} 
                            className={`candidate-result-item ${candidate.isWinner ? 'winner' : ''}`}
                          >
                            <div className="candidate-result-rank">
                              {candidate.isWinner && (
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" className="winner-icon">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              )}
                              <span className="rank-number">#{candidate.rank}</span>
                            </div>
                            <div className="candidate-result-info">
                              <span className="candidate-result-name">
                                {candidate.name}
                                {candidate.manuallySelectedWinner && <span style={{marginLeft: '8px', fontSize: '0.75rem', color: '#f59e0b'}}>⚠️ Manual Winner</span>}
                              </span>
                              {candidate.isWinner && <span className="winner-badge">WINNER</span>}
                            </div>
                            <div className="candidate-result-stats">
                              <span className="votes-count">{candidate.voteCount} votes</span>
                              <span className="votes-percentage">{candidate.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="detail-note">
                  <p>No results available for this election.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button onClick={closeModal} className="modal-close-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          type={confirmState.type}
          onConfirm={confirmState.onConfirm}
          onCancel={confirmState.onCancel}
        />
      )}
    </div>
  );
};

export default ArchiveResultsPage;
